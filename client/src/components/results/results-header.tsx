import { CheckCircle, Building, Calendar, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface ResultsHeaderProps {
  orgName?: string | null;
  industry?: string | null;
  createdAt?: Date;
}

export default function ResultsHeader({ orgName, industry, createdAt }: ResultsHeaderProps) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center px-4 py-2 bg-chart-2/20 text-chart-2 rounded-full text-sm font-medium mb-4">
        <CheckCircle className="w-4 h-4 mr-2" />
        Assessment Complete
      </div>
      
      {/* Metadata display */}
      {(orgName || industry || createdAt) && (
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-6" data-testid="metadata-display">
          {orgName && (
            <div className="flex items-center gap-1" data-testid="text-org-name">
              <Building className="w-4 h-4" />
              {orgName}
            </div>
          )}
          {industry && (
            <div className="flex items-center gap-1" data-testid="text-industry">
              <Briefcase className="w-4 h-4" />
              {industry}
            </div>
          )}
          {createdAt && (
            <div className="flex items-center gap-1" data-testid="text-timestamp">
              <Calendar className="w-4 h-4" />
              {format(createdAt, "PPP 'at' p")}
            </div>
          )}
        </div>
      )}
      
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
        Your AI Readiness Results
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Based on your responses, here's a comprehensive analysis of your organization's AI readiness across all pillars.
      </p>
    </div>
  );
}
