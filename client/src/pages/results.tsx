import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, Share, RotateCcw, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ResultsHeader from "@/components/results/results-header";
import RadarChart from "@/components/results/radar-chart";
import Gauge from "@/components/ui/gauge";
import { ScoreResponse } from "@/lib/types";

export default function Results() {
  const params = useParams();
  const responseId = params.id;
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Print lifecycle management
  useEffect(() => {
    const handleBeforePrint = () => setIsPrintMode(true);
    const handleAfterPrint = () => setIsPrintMode(false);
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // For demo purposes, we'll show mock results if no responseId
  // In production, this would redirect to assessment
  const { data: results, isLoading } = useQuery<ScoreResponse>({
    queryKey: responseId ? ["/api/response", responseId] : [],
    enabled: !!responseId,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleDownloadPDF = () => {
    // Enter print mode for 2-page summary layout
    setIsPrintMode(true);
    
    // Wait for layout reflow and chart resize
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Trigger resize event for charts
        window.dispatchEvent(new Event('resize'));
        
        // Wait a bit more for charts to reflow, then print
        setTimeout(() => {
          window.print();
          // isPrintMode will be reset by afterprint listener
        }, 300);
      });
    });
  };

  // Demo data for when no responseId is provided
  const mockResults: ScoreResponse = {
    responseId: "demo",
    pillarScores: {
      technology: 78,
      data_management: 65,
      organizational_culture: 82,
      strategic_planning: 59,
      risk_management: 73,
    },
    overall: 72,
    category: "Good Progress",
    color: "hsl(var(--chart-3))",
    message: "Your organization shows solid foundation for AI adoption with clear areas for improvement. Focus on data management and strategic planning to advance further.",
    answers: {
      tech_data_infrastructure: {
        value: 4,
        label: "Advanced data infrastructure",
        meaning: "Well-integrated systems with strong data governance and quality processes"
      }
    }
  };

  const displayResults = results || mockResults;
  
  if (responseId && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const pillarNames = {
    technology: "Technology Infrastructure",
    data_management: "Data Management", 
    organizational_culture: "Organizational Culture",
    strategic_planning: "Strategic Planning",
    risk_management: "Risk Management",
  };

  const pillarIcons = {
    technology: "🔧",
    data_management: "📊",
    organizational_culture: "👥",
    strategic_planning: "🎯",
    risk_management: "🛡️",
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${isPrintMode ? 'print-summary' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <ResultsHeader />

        {/* Overall Score */}
        <Card data-card className="mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Overall AI Readiness Score</h3>
                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="text-5xl font-mono font-bold text-primary">
                    {displayResults.overall}
                  </span>
                  <span className="text-2xl text-muted-foreground">/ 100</span>
                </div>
                <Badge 
                  data-badge
                  className="mb-4"
                  style={{ backgroundColor: displayResults.color }}
                >
                  {displayResults.category}
                </Badge>
                <p className="text-muted-foreground">
                  {displayResults.message}
                </p>
              </div>
              
              <div className="flex justify-center gauge-container" data-gauge>
                <Gauge value={displayResults.overall} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pillar Scores */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8 chart-section">
          <RadarChart data={displayResults.pillarScores} pillarNames={pillarNames} />
          
          {/* Key Insights */}
          <Card data-card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6">Key Insights</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-chart-2 mb-3 flex items-center">
                    👍 Strengths
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <span className="text-chart-2 mt-1">✓</span>
                      <span>Strong organizational culture supporting innovation and change</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-chart-2 mt-1">✓</span>
                      <span>Solid technology infrastructure foundation</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-chart-3 mb-3 flex items-center">
                    ⚠️ Priority Areas
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <span className="text-chart-3 mt-1">↑</span>
                      <span>Develop comprehensive AI strategy and roadmap</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-chart-3 mt-1">↑</span>
                      <span>Improve data governance and quality processes</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-primary mb-3 flex items-center">
                    🛣️ Recommended Next Steps
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-xs">1</Badge>
                      <span>Establish AI governance committee and strategy framework</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-xs">2</Badge>
                      <span>Audit and improve data quality and accessibility</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Responses - Hidden in print mode */}
        <Card className={isPrintMode ? 'no-print' : ''}>
          <div className="p-8 border-b border-border">
            <h3 className="text-xl font-semibold">Detailed Response Analysis</h3>
            <p className="text-muted-foreground mt-2">
              Review your responses and their implications for each pillar.
            </p>
          </div>
          
          <div className="divide-y divide-border">
            {Object.entries(displayResults.pillarScores).map(([pillarId, score]) => (
              <Collapsible key={pillarId} className="p-6">
                <CollapsibleTrigger 
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => toggleSection(pillarId)}
                  data-testid={`button-toggle-${pillarId}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{pillarIcons[pillarId as keyof typeof pillarIcons]}</div>
                    <h4 className="font-medium">{pillarNames[pillarId as keyof typeof pillarNames]}</h4>
                    <span className="text-sm text-muted-foreground">
                      Score: {score}/100
                    </span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transform transition-transform ${
                      expandedSections.has(pillarId) ? 'rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4 space-y-4">
                  {Object.entries(displayResults.answers)
                    .filter(([questionId]) => questionId.startsWith(pillarId))
                    .map(([questionId, answer]) => (
                    <div key={questionId} className="bg-muted/30 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Question Response</h5>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-chart-1 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-sm">{answer.label}</p>
                          <p className="text-xs text-muted-foreground">{answer.meaning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button size="lg" onClick={handleDownloadPDF} data-testid="button-download-report">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="lg" data-testid="button-share-results">
            <Share className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          <Button variant="outline" size="lg" data-testid="button-new-assessment">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
