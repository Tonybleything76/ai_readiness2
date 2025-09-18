import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AssessmentData, ScoreRequest } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProgressHeader from "@/components/assessment/progress-header";
import QuestionCard from "@/components/assessment/question-card";

const STORAGE_KEY = "ai_assessment_progress";

interface AssessmentState {
  orgName?: string;
  industry?: string;
  currentPillarIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  lastNavDirection: number;
}

export default function Assessment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showQuestions, setShowQuestions] = useState(false);
  const [state, setState] = useState<AssessmentState>({
    currentPillarIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    lastNavDirection: 1,
  });

  // Load questions
  const { data: assessmentData, isLoading } = useQuery<AssessmentData>({
    queryKey: ["/api/questions"],
  });

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (request: ScoreRequest) => {
      const response = await apiRequest("POST", "/api/score", request);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.removeItem(STORAGE_KEY);
      setLocation(`/results/${data.responseId}`);
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState(parsedState);
        if (Object.keys(parsedState.answers).length > 0) {
          setShowQuestions(true);
        }
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p>Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-destructive">Failed to load assessment questions.</p>
        </div>
      </div>
    );
  }

  const currentPillar = assessmentData.pillars[state.currentPillarIndex];
  const currentQuestion = currentPillar?.questions[state.currentQuestionIndex];
  const totalQuestions = assessmentData.pillars.reduce((sum, pillar) => sum + pillar.questions.length, 0);
  const answeredQuestions = Object.keys(state.answers).length;
  const progressPercent = (answeredQuestions / totalQuestions) * 100;

  const handleOrgInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuestions(true);
  };

  const handleAnswerChange = (questionId: string, value: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));
  };

  const handleNext = () => {
    if (!currentPillar) return;

    // Move to next question
    if (state.currentQuestionIndex < currentPillar.questions.length - 1) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, lastNavDirection: 1 }));
    } else if (state.currentPillarIndex < assessmentData.pillars.length - 1) {
      // Move to next pillar
      setState(prev => ({
        ...prev,
        currentPillarIndex: prev.currentPillarIndex + 1,
        currentQuestionIndex: 0,
        lastNavDirection: 1
      }));
    } else {
      // Assessment complete - submit
      submitScoreMutation.mutate({
        orgName: state.orgName,
        industry: state.industry,
        answers: state.answers,
      });
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1, lastNavDirection: -1 }));
    } else if (state.currentPillarIndex > 0) {
      const prevPillar = assessmentData.pillars[state.currentPillarIndex - 1];
      setState(prev => ({
        ...prev,
        currentPillarIndex: prev.currentPillarIndex - 1,
        currentQuestionIndex: prevPillar.questions.length - 1,
        lastNavDirection: -1
      }));
    }
  };

  const canGoNext = currentQuestion ? state.answers[currentQuestion.id] !== undefined : false;
  const canGoPrevious = state.currentPillarIndex > 0 || state.currentQuestionIndex > 0;

  const isLastQuestion = 
    state.currentPillarIndex === assessmentData.pillars.length - 1 &&
    state.currentQuestionIndex === currentPillar.questions.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressHeader
        currentStep={state.currentPillarIndex + 1}
        totalSteps={assessmentData.pillars.length}
        progress={progressPercent}
        pillars={assessmentData.pillars}
        currentPillarIndex={state.currentPillarIndex}
      />

      {!showQuestions ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-8">
              <h3 className="text-xl font-semibold mb-6">Organization Information</h3>
              <form onSubmit={handleOrgInfoSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="org-name">Organization Name (Optional)</Label>
                  <Input
                    id="org-name"
                    type="text"
                    placeholder="Enter your organization name"
                    value={state.orgName || ""}
                    onChange={(e) => setState(prev => ({ ...prev, orgName: e.target.value }))}
                    data-testid="input-org-name"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Select
                    value={state.industry || ""}
                    onValueChange={(value) => setState(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Financial Services</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" data-testid="button-begin-assessment">
                    Begin Assessment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto" style={{ minHeight: '600px' }}>
          <AnimatePresence mode="wait" initial={false}>
            {currentQuestion && (
              <QuestionCard
                key={`${state.currentPillarIndex}-${state.currentQuestionIndex}`}
                direction={state.lastNavDirection}
                pillar={currentPillar}
                question={currentQuestion}
                selectedValue={state.answers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
                currentQuestionNumber={
                  assessmentData.pillars
                    .slice(0, state.currentPillarIndex)
                    .reduce((sum, p) => sum + p.questions.length, 0) + 
                  state.currentQuestionIndex + 1
                }
                totalQuestions={totalQuestions}
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                isLastQuestion={isLastQuestion}
                isSubmitting={submitScoreMutation.isPending}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>Auto-saved</span>
        </div>
      </div>
    </div>
  );
}
