import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, Share, RotateCcw, ChevronDown, TrendingUp, History, Lightbulb, AlertTriangle, Star, ArrowRight, CheckCircle, XCircle, BarChart3, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ResultsHeader from "@/components/results/results-header";
import RadarChart from "@/components/results/radar-chart";
import Gauge from "@/components/ui/gauge";
import { ScoreResponse, Recommendation, InsightsSummary } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

// Additional types for Phase 3 features
interface HistoricalResponse {
  orgName: string;
  count: number;
  responses: Array<{
    id: string;
    createdAt: string;
    orgName: string | null;
    industry: string | null;
    overall: number;
    pillarScores: Record<string, number>;
    category: string;
  }>;
}

interface BenchmarkResponse {
  industry: string;
  available: boolean;
  message?: string;
  count?: number;
  overallMedian?: number;
  pillarMedians?: Record<string, number>;
  overallQuartiles?: { q1: number; q3: number };
  pillarQuartiles?: Record<string, { q1: number; q3: number }>;
}

export default function Results() {
  const params = useParams();
  const responseId = params.id;
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isPrintMode, setIsPrintMode] = useState(false);
  // Progress tab enhancements
  const [visiblePillars, setVisiblePillars] = useState<Set<string>>(new Set(['technology', 'data_management', 'organizational_culture', 'strategic_planning', 'risk_management']));

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

  // Historical data query - only fetch if we have organization name
  const { data: historicalData, isLoading: isLoadingHistory } = useQuery<HistoricalResponse>({
    queryKey: results?.orgName ? ["/api/responses", results.orgName] : [],
    enabled: !!results?.orgName,
  });

  // Benchmark data query - only fetch if we have industry
  const { data: benchmarkData, isLoading: isLoadingBenchmark } = useQuery<BenchmarkResponse>({
    queryKey: results?.industry ? ["/api/benchmark", results.industry] : [],
    enabled: !!results?.industry,
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

  const handleDownloadPDF = async () => {
    if (!responseId) {
      // For demo mode, still use print
      setIsPrintMode(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
          setTimeout(() => {
            window.print();
          }, 300);
        });
      });
      return;
    }

    try {
      // Fetch PDF from server
      const response = await fetch(`/api/report/pdf/${responseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF report');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-readiness-report-${responseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback to print mode
      setIsPrintMode(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
          setTimeout(() => {
            window.print();
          }, 300);
        });
      });
    }
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
    },
    // Sample metadata for demo
    orgName: "Acme Corporation",
    industry: "Technology",
    createdAt: new Date("2024-09-18T19:00:00.000Z")
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

  // Format historical data for line charts
  const formatHistoricalData = () => {
    if (!historicalData?.responses || historicalData.responses.length < 2) {
      return null;
    }
    
    return historicalData.responses.map((response: any, index: number) => ({
      assessment: index + 1,
      date: new Date(response.createdAt).toLocaleDateString(),
      overall: response.overall,
      technology: response.pillarScores?.technology || 0,
      data_management: response.pillarScores?.data_management || 0,
      organizational_culture: response.pillarScores?.organizational_culture || 0,
      strategic_planning: response.pillarScores?.strategic_planning || 0,
      risk_management: response.pillarScores?.risk_management || 0,
    }));
  };

  // Calculate percentile ranking
  const calculatePercentile = () => {
    if (!benchmarkData?.available || !displayResults?.overall) {
      return null;
    }
    
    // Simple percentile calculation based on median and quartiles
    const userScore = displayResults.overall;
    const { overallMedian, overallQuartiles } = benchmarkData;
    
    if (!overallQuartiles || !overallMedian) return null;
    
    if (userScore >= overallQuartiles.q3) return "Top 25%";
    if (userScore >= overallMedian) return "Above Average";
    if (userScore >= overallQuartiles.q1) return "Below Average";
    return "Bottom 25%";
  };

  const historicalChartData = formatHistoricalData();
  const userPercentile = calculatePercentile();

  return (
    <div className={`container mx-auto px-4 py-8 ${isPrintMode ? 'print-summary' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <ResultsHeader 
          orgName={displayResults.orgName}
          industry={displayResults.industry}
          createdAt={displayResults.createdAt}
        />

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="current" className="flex items-center gap-2" data-testid="tab-current-results">
              <TrendingUp className="w-4 h-4" />
              Current Results
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2"
              disabled={!displayResults.orgName || isLoadingHistory}
              data-testid="tab-history"
            >
              <History className="w-4 h-4" />
              History {(historicalData?.count ?? 0) > 1 && `(${historicalData?.count})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
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
                    {userPercentile && (
                      <Badge variant="outline" className="mb-4 ml-2">
                        {userPercentile} in {displayResults.industry}
                      </Badge>
                    )}
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

            {/* Recommendations and Insights Section */}
            {displayResults?.recommendations && displayResults.recommendations.length > 0 && (
              <Card className="mt-8">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Lightbulb className="w-6 h-6 mr-3 text-primary" />
                    <h2 className="text-2xl font-bold">Personalized Recommendations</h2>
                  </div>
                  
                  <div className="grid gap-6">
                    {displayResults.recommendations.map((recommendation: Recommendation, index: number) => (
                      <Card key={recommendation.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={recommendation.priority === 'high' ? 'destructive' : 
                                          recommendation.priority === 'medium' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {recommendation.priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                  {recommendation.priority === 'medium' && <Star className="w-3 h-3 mr-1" />}
                                  {recommendation.priority === 'low' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {recommendation.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {recommendation.category.charAt(0).toUpperCase() + recommendation.category.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2" data-testid={`recommendation-title-${index}`}>
                            {recommendation.title}
                          </h3>
                          <p className="text-muted-foreground" data-testid={`recommendation-description-${index}`}>
                            {recommendation.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights Summary */}
            {displayResults?.insights && (
              <Card className="mt-8">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <BarChart3 className="w-6 h-6 mr-3 text-primary" />
                    <h2 className="text-2xl font-bold">Assessment Insights</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Readiness Level and Next Steps */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-primary" />
                          AI Readiness Level
                        </h3>
                        <Badge 
                          variant={(() => {
                            const level = displayResults.insights.readinessLevel;
                            if (level === 'Highly Ready') return 'default';
                            if (level === 'Moderately Ready') return 'secondary';
                            return 'outline';
                          })()}
                          className="text-base px-4 py-2"
                          data-testid="readiness-level-badge"
                        >
                          {displayResults.insights.readinessLevel}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <ArrowRight className="w-5 h-5 mr-2 text-primary" />
                          Immediate Next Steps
                        </h3>
                        <ul className="space-y-2">
                          {displayResults.insights.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start" data-testid={`next-step-${index}`}>
                              <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Strengths and Challenges */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center text-green-700">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Key Strengths
                        </h3>
                        <ul className="space-y-2">
                          {displayResults.insights.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start" data-testid={`strength-${index}`}>
                              <Star className="w-4 h-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center text-orange-700">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          Areas for Improvement
                        </h3>
                        <ul className="space-y-2">
                          {displayResults.insights.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-start" data-testid={`challenge-${index}`}>
                              <XCircle className="w-4 h-4 mt-0.5 mr-2 text-orange-500 flex-shrink-0" />
                              <span className="text-sm">{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
          </TabsContent>

          <TabsContent value="history">
            {isLoadingHistory ? (
              <div className="text-center py-12">
                <p>Loading historical data...</p>
              </div>
            ) : !displayResults.orgName ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Historical tracking is only available for named organizations. 
                  Please include an organization name in your next assessment to enable historical tracking.
                </p>
              </div>
            ) : historicalChartData ? (
              <div className="space-y-8">
                {/* Historical Overall Score Trend */}
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-6">Overall Score Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historicalChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="overall" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          name="Overall Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Historical Pillar Trends with Toggleable Lines */}
                <Card>
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                      <h3 className="text-xl font-semibold">Pillar Score Trends</h3>
                      <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                        {[
                          { key: 'technology', name: 'Technology', color: 'hsl(var(--chart-1))' },
                          { key: 'data_management', name: 'Data Management', color: 'hsl(var(--chart-2))' },
                          { key: 'organizational_culture', name: 'Culture', color: 'hsl(var(--chart-3))' },
                          { key: 'strategic_planning', name: 'Strategy', color: 'hsl(var(--chart-4))' },
                          { key: 'risk_management', name: 'Risk Management', color: 'hsl(var(--chart-5))' }
                        ].map((pillar) => (
                          <label key={pillar.key} className="flex items-center space-x-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={visiblePillars.has(pillar.key)}
                              onChange={(e) => {
                                const newSet = new Set(visiblePillars);
                                if (e.target.checked) {
                                  newSet.add(pillar.key);
                                } else {
                                  newSet.delete(pillar.key);
                                }
                                setVisiblePillars(newSet);
                              }}
                              className="rounded border-gray-300"
                              data-testid={`checkbox-pillar-${pillar.key}`}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: pillar.color }}
                            />
                            <span>{pillar.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={historicalChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        {visiblePillars.has('technology') && (
                          <Line 
                            type="monotone" 
                            dataKey="technology" 
                            stroke="hsl(var(--chart-1))" 
                            name="Technology" 
                            strokeWidth={2}
                            data-testid="line-technology"
                          />
                        )}
                        {visiblePillars.has('data_management') && (
                          <Line 
                            type="monotone" 
                            dataKey="data_management" 
                            stroke="hsl(var(--chart-2))" 
                            name="Data Management" 
                            strokeWidth={2}
                            data-testid="line-data-management"
                          />
                        )}
                        {visiblePillars.has('organizational_culture') && (
                          <Line 
                            type="monotone" 
                            dataKey="organizational_culture" 
                            stroke="hsl(var(--chart-3))" 
                            name="Culture" 
                            strokeWidth={2} 
                          />
                        )}
                        {visiblePillars.has('strategic_planning') && (
                          <Line 
                            type="monotone" 
                            dataKey="strategic_planning" 
                            stroke="hsl(var(--chart-4))" 
                            name="Strategy" 
                            strokeWidth={2} 
                          />
                        )}
                        {visiblePillars.has('risk_management') && (
                          <Line 
                            type="monotone" 
                            dataKey="risk_management" 
                            stroke="hsl(var(--chart-5))" 
                            name="Risk Management" 
                            strokeWidth={2} 
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Industry Benchmarking Comparison */}
                {benchmarkData?.available && (
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Industry Benchmarking</h3>
                        <Badge variant="outline" className="text-xs">
                          {displayResults.industry} • {benchmarkData.count} responses
                        </Badge>
                      </div>
                      
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Enhanced Radar Chart with Benchmark Overlay */}
                        <div>
                          <h4 className="font-medium mb-4">Performance vs Industry Median</h4>
                          <ResponsiveContainer width="100%" height={350}>
                            <RechartsRadarChart data={Object.entries(displayResults.pillarScores).map(([key, value]) => ({
                              pillar: pillarNames[key as keyof typeof pillarNames] || key,
                              yourScore: value,
                              industryMedian: benchmarkData.pillarMedians?.[key] || 0,
                              fullMark: 100,
                            }))}>
                              <PolarGrid />
                              <PolarAngleAxis 
                                dataKey="pillar" 
                                className="text-xs sm:text-sm"
                                tick={{ fontSize: 12 }}
                              />
                              <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                className="text-xs sm:text-sm"
                                tick={{ fontSize: 11 }}
                              />
                              <Radar
                                name="Your Score"
                                dataKey="yourScore"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.3}
                                strokeWidth={3}
                                data-testid="radar-user-score"
                              />
                              <Radar
                                name="Industry Median"
                                dataKey="industryMedian"
                                stroke="hsl(var(--chart-2))"
                                fill="hsl(var(--chart-2))"
                                fillOpacity={0.1}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                              />
                            </RechartsRadarChart>
                          </ResponsiveContainer>
                          
                          <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                              <span className="text-sm">Your Score</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-chart-2 opacity-70" style={{ background: 'repeating-linear-gradient(45deg, hsl(var(--chart-2)), hsl(var(--chart-2)) 2px, transparent 2px, transparent 4px)' }}></div>
                              <span className="text-sm">Industry Median</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Percentile Display */}
                        <div>
                          <h4 className="font-medium mb-4">Industry Position</h4>
                          <div className="space-y-4">
                            {/* Overall Percentile */}
                            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
                              <div className="text-4xl font-bold text-primary mb-2">
                                {userPercentile || 'N/A'}
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">Overall Percentile</div>
                              <div className="text-xs text-muted-foreground">
                                You scored better than {userPercentile?.replace(/[^0-9]/g, '') || '0'}% of organizations in {displayResults.industry}
                              </div>
                            </div>
                            
                            {/* Pillar Comparisons */}
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-muted-foreground">Pillar Performance vs Industry</h5>
                              {Object.entries(displayResults.pillarScores).map(([key, value]) => {
                                const median = benchmarkData.pillarMedians?.[key] || 0;
                                const diff = value - median;
                                const isAbove = diff > 0;
                                return (
                                  <div key={key} className="flex items-center justify-between py-2 px-3 rounded border bg-background/50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{pillarNames[key as keyof typeof pillarNames] || key}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-mono">{value}</span>
                                      <Badge 
                                        variant={isAbove ? "default" : "secondary"}
                                        className={`text-xs ${isAbove ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'}`}
                                      >
                                        {isAbove ? '+' : ''}{Math.round(diff)}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Historical Summary */}
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-6">Historical Summary</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{historicalData?.count || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Assessments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-chart-2">
                          {historicalChartData.length > 1 
                            ? (historicalChartData[historicalChartData.length - 1].overall - historicalChartData[0].overall > 0 ? '+' : '')
                            + Math.round(historicalChartData[historicalChartData.length - 1].overall - historicalChartData[0].overall) 
                            : '0'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Change</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-chart-3">
                          {historicalChartData.length > 0 
                            ? new Date(historicalChartData[historicalChartData.length - 1].date).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Last Assessment</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No historical data available. Complete another assessment to see trends over time.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
