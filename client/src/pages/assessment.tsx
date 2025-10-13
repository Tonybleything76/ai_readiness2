import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { apiRequest } from '../lib/queryClient';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { AssessmentSection } from '../../../shared/assessment-data';
import { organizationInfoSchema, type OrganizationInfoData } from '../../../shared/validation';

type ViewMode = 'info' | 'dimension-overview' | 'question';

interface AssessmentState {
  mode: ViewMode;
  dimensionIndex: number;
  questionIndex: number;
}

export function Assessment() {
  const [, setLocation] = useLocation();
  
  // Get tier from URL query parameter
  const tier = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier');
    return tierParam === 'full' ? 'full' : 'free';
  }, []);

  // Load saved progress from localStorage
  const savedProgress = useMemo(() => {
    try {
      const saved = localStorage.getItem(`assessment-progress-${tier}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [tier]);

  const [state, setState] = useState<AssessmentState>(
    savedProgress?.state || { mode: 'info', dimensionIndex: 0, questionIndex: 0 }
  );
  const [orgName, setOrgName] = useState(savedProgress?.orgName || '');
  const [industry, setIndustry] = useState(savedProgress?.industry || '');
  const [answers, setAnswers] = useState<Record<string, number>>(savedProgress?.answers || {});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    formState: { errors: orgErrors },
    trigger,
  } = useForm<OrganizationInfoData>({
    resolver: zodResolver(organizationInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      organizationName: savedProgress?.orgName || '',
      industry: savedProgress?.industry || '',
    },
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const progress = {
      state,
      orgName,
      industry,
      answers,
    };
    localStorage.setItem(`assessment-progress-${tier}`, JSON.stringify(progress));
  }, [state, orgName, industry, answers, tier]);

  const { data: assessmentData, isLoading } = useQuery<{ 
    sections: AssessmentSection[];
    tier: string;
    questionCount: number;
    overviews: Record<string, { title: string; overview: string }>;
  }>({
    queryKey: ['/api/assessment', tier],
    queryFn: async () => {
      const response = await fetch(`/api/assessment?tier=${tier}`);
      if (!response.ok) throw new Error('Failed to fetch assessment');
      return response.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      setSubmitError(null);
      return apiRequest('/api/assessment/submit', 'POST', {
        organizationName: orgName,
        industry,
        answers,
        assessmentMode: assessmentData?.tier || tier,
        questionCount: assessmentData?.questionCount,
      });
    },
    onSuccess: (data) => {
      // Clear saved progress on successful submission
      localStorage.removeItem(`assessment-progress-${tier}`);
      setLocation(`/results/${data.id}`);
    },
    onError: (error: Error) => {
      setSubmitError(error.message || 'Failed to submit assessment. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Bar Skeleton */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>

          {/* Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Skeleton */}
          <div className="flex justify-between mt-8">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  const sections = assessmentData?.sections || [];
  const currentDimension = sections[state.dimensionIndex];
  const currentQuestion = currentDimension?.questions[state.questionIndex];

  // Calculate total steps: info + (dimension overview + questions) for each dimension
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
  const totalSteps = 1 + sections.length + totalQuestions; // 1 info + overviews + questions

  // Calculate current step number for progress
  let currentStepNumber = 1; // Start with info step
  if (state.mode !== 'info') {
    // Add completed dimensions (overview + questions)
    for (let i = 0; i < state.dimensionIndex; i++) {
      currentStepNumber += 1 + sections[i].questions.length;
    }
    // Add current dimension overview if past it
    if (state.mode === 'question') {
      currentStepNumber += 1 + state.questionIndex + 1;
    } else {
      currentStepNumber += 1;
    }
  }

  const progress = (currentStepNumber / totalSteps) * 100;

  const canProceedInfo = orgName.trim() && industry.trim() && Object.keys(orgErrors).length === 0;
  const canProceedQuestion = currentQuestion && answers[currentQuestion.id] !== undefined;

  const handleNext = () => {
    if (state.mode === 'info') {
      // Move to first dimension overview
      setState({ mode: 'dimension-overview', dimensionIndex: 0, questionIndex: 0 });
    } else if (state.mode === 'dimension-overview') {
      // Move to first question of this dimension
      setState({ mode: 'question', dimensionIndex: state.dimensionIndex, questionIndex: 0 });
    } else if (state.mode === 'question') {
      const isLastQuestionInDimension = state.questionIndex === currentDimension.questions.length - 1;
      const isLastDimension = state.dimensionIndex === sections.length - 1;

      if (isLastQuestionInDimension) {
        if (isLastDimension) {
          // Submit assessment
          submitMutation.mutate();
        } else {
          // Move to next dimension overview
          setState({ mode: 'dimension-overview', dimensionIndex: state.dimensionIndex + 1, questionIndex: 0 });
        }
      } else {
        // Move to next question in same dimension
        setState({ mode: 'question', dimensionIndex: state.dimensionIndex, questionIndex: state.questionIndex + 1 });
      }
    }
  };

  const handleBack = () => {
    if (state.mode === 'dimension-overview') {
      if (state.dimensionIndex === 0) {
        // Go back to info
        setState({ mode: 'info', dimensionIndex: 0, questionIndex: 0 });
      } else {
        // Go back to last question of previous dimension
        const prevDimensionIndex = state.dimensionIndex - 1;
        const prevDimensionLastQuestion = sections[prevDimensionIndex].questions.length - 1;
        setState({ mode: 'question', dimensionIndex: prevDimensionIndex, questionIndex: prevDimensionLastQuestion });
      }
    } else if (state.mode === 'question') {
      if (state.questionIndex === 0) {
        // Go back to dimension overview
        setState({ mode: 'dimension-overview', dimensionIndex: state.dimensionIndex, questionIndex: 0 });
      } else {
        // Go back to previous question
        setState({ mode: 'question', dimensionIndex: state.dimensionIndex, questionIndex: state.questionIndex - 1 });
      }
    }
  };

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const getProgressLabel = () => {
    if (state.mode === 'info') return 'Organization Information';
    if (state.mode === 'dimension-overview') return `${currentDimension?.title} - Overview`;
    if (state.mode === 'question') {
      return `${currentDimension?.title} - Question ${state.questionIndex + 1} of ${currentDimension?.questions.length}`;
    }
    return '';
  };

  const isLastStep = state.mode === 'question' && 
    state.dimensionIndex === sections.length - 1 && 
    state.questionIndex === currentDimension?.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600" data-testid="text-progress-label">
              {getProgressLabel()}
            </span>
            <span className="text-sm font-medium text-gray-600" data-testid="text-progress-percent">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} data-testid="progress-bar" />
        </div>

        {/* Info Step */}
        {state.mode === 'info' && (
          <Card data-testid="card-organization-info">
            <CardHeader>
              <CardTitle>Welcome to the AI Readiness Assessment</CardTitle>
              <CardDescription>
                Let's start by learning a bit about your organization. This helps us provide contextual insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">
                  Organization Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orgName"
                  placeholder="Acme Corporation"
                  aria-required="true"
                  aria-invalid={orgErrors.organizationName ? 'true' : 'false'}
                  aria-describedby={orgErrors.organizationName ? 'org-name-error' : undefined}
                  className={orgErrors.organizationName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  data-testid="input-organization-name"
                  {...register('organizationName', {
                    onChange: (e) => {
                      setOrgName(e.target.value);
                      trigger('organizationName');
                    }
                  })}
                />
                {orgErrors.organizationName && (
                  <p id="org-name-error" className="text-sm text-red-600 mt-1" role="alert" data-testid="error-organization-name">
                    {orgErrors.organizationName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="industry"
                  placeholder="Healthcare, Finance, Technology, Manufacturing"
                  aria-required="true"
                  aria-invalid={orgErrors.industry ? 'true' : 'false'}
                  aria-describedby={orgErrors.industry ? 'industry-error' : undefined}
                  className={orgErrors.industry ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  data-testid="input-industry"
                  {...register('industry', {
                    onChange: (e) => {
                      setIndustry(e.target.value);
                      trigger('industry');
                    }
                  })}
                />
                {orgErrors.industry && (
                  <p id="industry-error" className="text-sm text-red-600 mt-1" role="alert" data-testid="error-industry">
                    {orgErrors.industry.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dimension Overview */}
        {state.mode === 'dimension-overview' && currentDimension && (
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0" data-testid={`card-dimension-overview-${currentDimension.id}`}>
            <CardHeader>
              <CardTitle className="text-white text-2xl mb-3">
                {assessmentData?.overviews?.[currentDimension.id]?.title || currentDimension.title}
              </CardTitle>
              <CardDescription className="text-white/95 text-base leading-relaxed">
                {assessmentData?.overviews?.[currentDimension.id]?.overview || currentDimension.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-white/90 text-sm mb-2">
                  <strong className="text-white">What we'll assess:</strong> {currentDimension.whatItAssesses}
                </p>
                <p className="text-white/90 text-sm">
                  <strong className="text-white">Why it matters:</strong> {currentDimension.importance}
                </p>
              </div>
              <p className="text-white/80 text-sm mt-4">
                You'll answer {currentDimension.questions.length} question{currentDimension.questions.length !== 1 ? 's' : ''} in this section.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        {state.mode === 'question' && currentQuestion && currentDimension && (
          <Card data-testid={`card-question-${currentQuestion.id}`}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {state.questionIndex + 1} of {currentDimension.questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset className="space-y-3">
                <legend className="text-base text-gray-700 mb-4 font-medium">
                  {currentQuestion.text}
                </legend>
                <div className="space-y-3" role="radiogroup" aria-required="true">
                  {currentQuestion.options.map((option) => {
                    const inputId = `${currentQuestion.id}-${option.value}`;
                    const isSelected = answers[currentQuestion.id] === option.value;
                    
                    return (
                      <div key={option.value} className="relative">
                        <input
                          type="radio"
                          id={inputId}
                          name={currentQuestion.id}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQuestion.id, option.value)}
                          className="peer sr-only"
                          data-testid={`radio-answer-${currentQuestion.id}-${option.value}`}
                        />
                        <label
                          htmlFor={inputId}
                          className={`flex items-start gap-3 w-full p-4 rounded-lg border-2 transition-all cursor-pointer
                            ${isSelected
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }
                            focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2`}
                          data-testid={`label-answer-${currentQuestion.id}-${option.value}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300'
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="flex-1 text-gray-900">{option.label}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {submitError && (
          <Card className="mt-6 border-red-200 bg-red-50" data-testid="card-submit-error">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Submission Failed</p>
                  <p className="text-sm text-red-700 mt-1" data-testid="text-error-message">{submitError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={state.mode === 'info'}
            data-testid="button-back"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (state.mode === 'info' && !canProceedInfo) ||
              (state.mode === 'question' && !canProceedQuestion) ||
              submitMutation.isPending
            }
            data-testid="button-next"
          >
            {submitMutation.isPending ? (
              <>Processing...</>
            ) : isLastStep ? (
              <>Complete Assessment</>
            ) : state.mode === 'dimension-overview' ? (
              <>
                Start Questions
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
