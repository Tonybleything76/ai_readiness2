import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pillar, Question } from "@/lib/types";

interface QuestionCardProps {
  pillar: Pillar;
  question: Question;
  selectedValue?: number;
  onAnswerChange: (questionId: string, value: number) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export default function QuestionCard({
  pillar,
  question,
  selectedValue,
  onAnswerChange,
  currentQuestionNumber,
  totalQuestions,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  isSubmitting,
  onNext,
  onPrevious,
}: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{pillar.name}</h3>
          <p className="text-muted-foreground">{pillar.description}</p>
        </div>

        <div className="mb-8">
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">{question.text}</h4>
            {question.description && (
              <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
            )}
          </div>

          <RadioGroup
            value={selectedValue?.toString() || ""}
            onValueChange={(value) => onAnswerChange(question.id, parseInt(value))}
            className="space-y-3"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <div key={value} className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} className="mt-1" />
                <Label 
                  htmlFor={`${question.id}-${value}`}
                  className="flex-1 cursor-pointer"
                  data-testid={`radio-${question.id}-${value}`}
                >
                  <div className="font-medium">{question.responses[value.toString()]}</div>
                  <div className="text-sm text-muted-foreground">
                    {question.meanings[value.toString()]}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            data-testid="button-previous-question"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionNumber} of {totalQuestions}
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
            data-testid="button-next-question"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : isLastQuestion ? (
              "Complete Assessment"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
