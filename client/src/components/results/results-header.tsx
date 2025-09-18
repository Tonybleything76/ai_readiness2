import { CheckCircle } from "lucide-react";

export default function ResultsHeader() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center px-4 py-2 bg-chart-2/20 text-chart-2 rounded-full text-sm font-medium mb-4">
        <CheckCircle className="w-4 h-4 mr-2" />
        Assessment Complete
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
        Your AI Readiness Results
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Based on your responses, here's a comprehensive analysis of your organization's AI readiness across all pillars.
      </p>
    </div>
  );
}
