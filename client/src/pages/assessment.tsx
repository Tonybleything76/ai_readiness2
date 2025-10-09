import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { apiRequest } from '../lib/queryClient';
import { Server, Database, Users, Target, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AssessmentSection } from '../../../shared/assessment-data';

const ICON_MAP = {
  Server,
  Database,
  Users,
  Target,
  Shield,
};

export function Assessment() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Get tier from URL query parameter
  const tier = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier');
    return tierParam === 'full' ? 'full' : 'free'; // Default to free
  }, []);

  const { data: assessmentData, isLoading } = useQuery<{ 
    sections: AssessmentSection[];
    tier: string;
    questionCount: number;
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
      return apiRequest('/api/assessment/submit', 'POST', {
        organizationName: orgName,
        industry,
        answers,
        assessmentMode: assessmentData?.tier || tier,
        questionCount: assessmentData?.questionCount,
      });
    },
    onSuccess: (data) => {
      setLocation(`/results/${data.id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
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
  const canProceedQuestion = currentSection && answers[currentSection.questions[0]?.id] !== undefined;
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
            {/* Section Overview */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0" data-testid={`card-section-overview-${currentSection.id}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/20">
                    {ICON_MAP[currentSection.icon as keyof typeof ICON_MAP] && (
                      <div className="h-6 w-6 text-white">
                        {(() => {
                          const IconComponent = ICON_MAP[currentSection.icon as keyof typeof ICON_MAP];
                          return <IconComponent />;
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white mb-2">{currentSection.title}</CardTitle>
                    <CardDescription className="text-white/90 text-base">
                      {currentSection.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="font-semibold">Why This Matters:</span>
                    <p className="mt-1 opacity-90">{currentSection.importance}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="font-semibold">What We're Assessing:</span>
                    <p className="mt-1 opacity-90">{currentSection.whatItAssesses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
