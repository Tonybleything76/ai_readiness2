import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pillar } from "@/lib/types";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  pillars: Pillar[];
  currentPillarIndex: number;
}

export default function ProgressHeader({
  currentStep,
  totalSteps,
  progress,
  pillars,
  currentPillarIndex,
}: ProgressHeaderProps) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif font-semibold">AI Readiness Assessment</h2>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
      
      <Progress value={progress} className="mb-6" />

      <div className="flex flex-wrap gap-2 mb-6">
        {pillars.map((pillar, index) => (
          <Badge
            key={pillar.id}
            variant={index === currentPillarIndex ? "default" : "secondary"}
            className="text-xs"
            data-testid={`badge-pillar-${pillar.id}`}
          >
            {pillar.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
