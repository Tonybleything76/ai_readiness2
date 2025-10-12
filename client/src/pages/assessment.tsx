import { useState, useMemo, useEffect } from 'react';
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

  const [currentStep, setCurrentStep] = useState(savedProgress?.currentStep || 0);
  const [orgName, setOrgName] = useState(savedProgress?.orgName || '');
  const [industry, setIndustry] = useState(savedProgress?.industry || '');
  const [answers, setAnswers] = useState<Record<string, number>>(savedProgress?.answers || {});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const progress = {
      currentStep,
      orgName,
      industry,
      answers,
    };
    localStorage.setItem(`assessment-progress-${tier}`, JSON.stringify(progress));
  }, [currentStep, orgName, industry, answers, tier]);

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
  const isInfoStep = currentStep === 0;
  const currentSectionIndex = currentStep - 1;
  const currentSection = sections[currentSectionIndex];
  const totalSteps = sections.length + 1;
  const progress = (currentStep / totalSteps) * 100;

  const canProceedInfo = orgName.trim() && industry.trim();
  
  // Check if ALL questions in current section are answered
  const canProceedQuestion = currentSection && currentSection.questions.every(q => answers[q.id] !== undefined);
  
  const isLastSection = currentStep === sections.length;

  const handleNext = () => {
    if (isLastSection) {
      submitMutation.mutate();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600" data-testid="text-progress-label">
              {isInfoStep ? 'Organization Information' : `${currentSection?.title} (${currentStep}/${totalSteps - 1})`}
            </span>
            <span className="text-sm font-medium text-gray-600" data-testid="text-progress-percent">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} data-testid="progress-bar" />
        </div>

        {/* Info Step */}
        {isInfoStep && (
          <Card data-testid="card-organization-info">
            <CardHeader>
              <CardTitle>Welcome to the AI Readiness Assessment</CardTitle>
              <CardDescription>
                Let's start by learning a bit about your organization. This helps us provide contextual insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter your organization name"
                  data-testid="input-organization-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Healthcare, Finance, Technology"
                  data-testid="input-industry"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Step */}
        {!isInfoStep && currentSection && (
          <div className="space-y-6">
            {/* Dimension Overview */}
            {assessmentData?.overviews?.[currentSection.id] && (
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0" data-testid={`card-dimension-overview-${currentSection.id}`}>
                <CardHeader>
                  <CardTitle className="text-white text-2xl mb-3">
                    {assessmentData.overviews[currentSection.id].title}
                  </CardTitle>
                  <CardDescription className="text-white/95 text-base leading-relaxed">
                    {assessmentData.overviews[currentSection.id].overview}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Questions */}
            {currentSection.questions.map((question, qIndex) => (
              <Card key={question.id} data-testid={`card-question-${question.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {qIndex + 1} of {currentSection.questions.length}
                  </CardTitle>
                  <CardDescription className="text-base pt-2">
                    {question.text}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswerChange(question.id, option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[question.id] === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        data-testid={`button-answer-${question.id}-${option.value}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              answers[question.id] === option.value
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {answers[question.id] === option.value && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="flex-1">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
            disabled={currentStep === 0}
            data-testid="button-back"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (isInfoStep && !canProceedInfo) ||
              (!isInfoStep && !canProceedQuestion) ||
              submitMutation.isPending
            }
            data-testid="button-next"
          >
            {submitMutation.isPending ? (
              <>Processing...</>
            ) : isLastSection ? (
              <>Complete Assessment</>
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
