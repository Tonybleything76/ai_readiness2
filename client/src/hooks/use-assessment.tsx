import { useState, useEffect } from "react";
import { AssessmentData } from "@/lib/types";

const STORAGE_KEY = "ai_assessment_progress";

interface AssessmentState {
  orgName?: string;
  industry?: string;
  currentPillarIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
}

interface UseAssessmentReturn {
  state: AssessmentState;
  updateState: (updates: Partial<AssessmentState>) => void;
  saveAnswer: (questionId: string, value: number) => void;
  getCurrentQuestion: (assessmentData?: AssessmentData) => {
    pillar?: AssessmentData['pillars'][0];
    question?: AssessmentData['pillars'][0]['questions'][0];
    totalQuestions: number;
    currentQuestionNumber: number;
  };
  getProgress: (assessmentData?: AssessmentData) => {
    answeredQuestions: number;
    totalQuestions: number;
    progressPercent: number;
  };
  canGoNext: (currentQuestionId?: string) => boolean;
  canGoPrevious: () => boolean;
  navigateNext: (assessmentData: AssessmentData) => boolean; // returns true if assessment complete
  navigatePrevious: (assessmentData: AssessmentData) => void;
  reset: () => void;
  loadSavedState: () => void;
}

const initialState: AssessmentState = {
  currentPillarIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
};

export function useAssessment(): UseAssessmentReturn {
  const [state, setState] = useState<AssessmentState>(initialState);

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state]);

  const updateState = (updates: Partial<AssessmentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const saveAnswer = (questionId: string, value: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));
  };

  const getCurrentQuestion = (assessmentData?: AssessmentData) => {
    if (!assessmentData) {
      return { totalQuestions: 0, currentQuestionNumber: 0 };
    }

    const totalQuestions = assessmentData.pillars.reduce((sum, pillar) => sum + pillar.questions.length, 0);
    const currentQuestionNumber = assessmentData.pillars
      .slice(0, state.currentPillarIndex)
      .reduce((sum, p) => sum + p.questions.length, 0) + 
      state.currentQuestionIndex + 1;

    const pillar = assessmentData.pillars[state.currentPillarIndex];
    const question = pillar?.questions[state.currentQuestionIndex];

    return {
      pillar,
      question,
      totalQuestions,
      currentQuestionNumber,
    };
  };

  const getProgress = (assessmentData?: AssessmentData) => {
    if (!assessmentData) {
      return { answeredQuestions: 0, totalQuestions: 0, progressPercent: 0 };
    }

    const totalQuestions = assessmentData.pillars.reduce((sum, pillar) => sum + pillar.questions.length, 0);
    const answeredQuestions = Object.keys(state.answers).length;
    const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return { answeredQuestions, totalQuestions, progressPercent };
  };

  const canGoNext = (currentQuestionId?: string) => {
    return currentQuestionId ? state.answers[currentQuestionId] !== undefined : false;
  };

  const canGoPrevious = () => {
    return state.currentPillarIndex > 0 || state.currentQuestionIndex > 0;
  };

  const navigateNext = (assessmentData: AssessmentData): boolean => {
    const currentPillar = assessmentData.pillars[state.currentPillarIndex];
    if (!currentPillar) return true; // Assessment complete

    // Move to next question
    if (state.currentQuestionIndex < currentPillar.questions.length - 1) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      return false;
    } else if (state.currentPillarIndex < assessmentData.pillars.length - 1) {
      // Move to next pillar
      setState(prev => ({
        ...prev,
        currentPillarIndex: prev.currentPillarIndex + 1,
        currentQuestionIndex: 0
      }));
      return false;
    } else {
      // Assessment complete
      return true;
    }
  };

  const navigatePrevious = (assessmentData: AssessmentData) => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }));
    } else if (state.currentPillarIndex > 0) {
      const prevPillar = assessmentData.pillars[state.currentPillarIndex - 1];
      setState(prev => ({
        ...prev,
        currentPillarIndex: prev.currentPillarIndex - 1,
        currentQuestionIndex: prevPillar.questions.length - 1
      }));
    }
  };

  const reset = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const loadSavedState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState(parsedState);
      } catch (error) {
        console.error("Failed to load saved assessment state:", error);
      }
    }
  };

  return {
    state,
    updateState,
    saveAnswer,
    getCurrentQuestion,
    getProgress,
    canGoNext,
    canGoPrevious,
    navigateNext,
    navigatePrevious,
    reset,
    loadSavedState,
  };
}
