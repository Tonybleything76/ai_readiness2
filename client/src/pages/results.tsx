import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip } from '../components/ui/tooltip';
import { Home, Download, TrendingUp, CheckCircle2, Award, Calendar, BarChart3, Share2, Check } from 'lucide-react';
import { READINESS_LEVELS, ASSESSMENT_SECTIONS } from '../../../shared/assessment-data';
import { RadarChart } from '../components/RadarChart';
import { useCountUp } from '../hooks/useCountUp';
import { useState, useEffect } from 'react';

// API response type (matches backend pillarScores structure)
interface AssessmentResult {
  id: string;
  organizationName: string;
  industry: string;
  answers: Record<string, number>;
  scores: {
    strategicLeadership: number;
    useCasePortfolio: number;
    dataFoundation: number;
    techInfrastructure: number;
    governanceRisk: number;
    responsibleAI: number;
    peopleSkills: number;
    changeManagement: number;
    valueRealization: number;
    overall: number;
  };
  readinessLevel: string;
  createdAt: string;
  assessmentMode?: 'free' | 'full';
  questionCount?: number;
}

export function Results() {
  const params = useParams();
  const resultId = params.id;

  const { data: result, isLoading, error } = useQuery<AssessmentResult>({
    queryKey: ['/api/results', resultId],
    queryFn: async () => {
      const response = await fetch(`/api/results/${resultId}`);
      if (!response.ok) { throw new Error(`Failed to load results: HTTP ${response.status}`); }
      const json = await response.json();
      try { localStorage.setItem(`result:${resultId}`, JSON.stringify(json)); } catch {}
      return json;
    },
    enabled: !!resultId,
  });

  if (error && !result) {
    return <div className="max-w-3xl mx-auto p-6"><h1 className="text-2xl font-semibold mb-2">Results not found</h1><p className="text-muted-foreground">This link may have expired or the results aren't available yet. Try re-running the assessment.</p></div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-48 mx-auto mb-4" />
            <Skeleton className="h-10 w-96 mx-auto mb-2" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          {/* Overall Score Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-7 w-64" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>

          {/* Dimension Cards Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-4" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Results Not Found</CardTitle>
            <CardDescription>We couldn't find the assessment results you're looking for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const readinessLevel = READINESS_LEVELS.find(
    (level) => result.scores.overall >= level.range[0] && result.scores.overall <= level.range[1]
  ) || READINESS_LEVELS[0];

  const animatedOverallScore = useCountUp(Math.round(result.scores.overall), 1500);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  // Prevent hydration mismatch by deferring browser-only operations
  useEffect(() => {
    setIsMounted(true);
    
    // Format date only on client side to prevent hydration mismatch
    if (result.createdAt) {
      const formatted = new Date(result.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      setFormattedDate(formatted);
    }
  }, [result.createdAt]);

  const handleShare = async () => {
    if (!isMounted) return;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div 
            className="inline-block px-6 py-3 rounded-full mb-4 text-white font-semibold"
            style={{ backgroundColor: readinessLevel.color }}
            data-testid="badge-readiness-level"
          >
            {readinessLevel.name}
          </div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-results-title">Your AI Readiness Assessment Results</h1>
          <p className="text-gray-600" data-testid="text-organization-info">
            {result.organizationName} • {result.industry}
          </p>
          {isMounted && formattedDate && (
            <p className="text-sm text-gray-500 mt-2" data-testid="text-assessment-date">
              Completed on {formattedDate}
            </p>
          )}
          {result.assessmentMode && result.questionCount && (
            <div className="flex items-center justify-center gap-2 mt-3" data-testid="info-assessment-tier">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {result.assessmentMode === 'free' ? 'Free' : 'Full'} Assessment
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{result.questionCount} questions</span>
            </div>
          )}
        </div>

        {/* Overall Score */}
        <Card className="mb-8 border-l-4 animate-fade-in stagger-1" style={{ borderLeftColor: readinessLevel.color }} data-testid="card-overall-score">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Overall AI Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 mb-6">
              <div className="text-center">
                <div 
                  className="text-6xl font-bold mb-2 transition-all duration-300"
                  style={{ color: readinessLevel.color }}
                  data-testid="text-overall-score"
                >
                  {animatedOverallScore}
                </div>
                <div className="text-gray-600">out of 100</div>
              </div>
              <div className="flex-1">
                <Progress value={result.scores.overall} className="h-4 mb-2" />
                <p className="text-gray-600 mt-4" data-testid="text-readiness-description">
                  {readinessLevel.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Score Breakdown - Radar Chart */}
        <Card className="mb-8 animate-fade-in stagger-2" data-testid="card-radar-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              AI Readiness Visualization
            </CardTitle>
            <CardDescription>
              Visual breakdown of your scores across all 9 dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMounted && (
              <RadarChart 
                data={ASSESSMENT_SECTIONS.map(section => ({
                  dimension: section.title.length > 25 
                    ? section.title.substring(0, 22) + '...' 
                    : section.title,
                  score: result.scores[section.id as keyof typeof result.scores] as number,
                  fullMark: 100,
                }))}
                color={readinessLevel.color}
              />
            )}
            {!isMounted && (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Readiness Level Details */}
        <Card className="mb-8" data-testid="card-readiness-details">
          <CardHeader>
            <CardTitle>What This Means for Your Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Characteristics of {readinessLevel.name}:</h3>
                <ul className="space-y-2">
                  {readinessLevel.characteristics.map((char, idx) => (
                    <li key={idx} className="flex items-start gap-2" data-testid={`text-characteristic-${idx}`}>
                      <CheckCircle2 
                        className="h-5 w-5 mt-0.5 flex-shrink-0" 
                        style={{ color: readinessLevel.color }}
                      />
                      <span className="text-gray-700">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA for Free Tier Users */}
        {result.assessmentMode === 'free' && (
          <Card className="mb-8 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" data-testid="card-upgrade-cta">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Want Deeper Insights?</h3>
                  <p className="text-white/90 mb-4">
                    Upgrade to the Full Assessment with 90 questions for comprehensive analysis across all 9 dimensions. Get detailed recommendations, actionable insights, and a complete roadmap for your AI transformation journey.
                  </p>
                  <ul className="space-y-2 text-sm text-white/90">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>3.6x more detailed analysis (90 vs 25 questions)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Granular scores for each dimension</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Personalized recommendations and action plans</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/assessment?tier=full">
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                      data-testid="button-upgrade-full"
                    >
                      Take Full Assessment
                      <Award className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Scores */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" data-testid="text-section-scores-title">Scores by Dimension</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {ASSESSMENT_SECTIONS.map((section) => {
              const score = result.scores[section.id as keyof typeof result.scores] as number;
              const sectionLevel = READINESS_LEVELS.find(
                (level) => score >= level.range[0] && score <= level.range[1]
              ) || READINESS_LEVELS[0];

              return (
                <Card key={section.id} data-testid={`card-section-score-${section.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {section.title}
                      <Tooltip content={section.whatItAssesses} />
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span 
                          className="text-3xl font-bold"
                          style={{ color: sectionLevel.color }}
                          data-testid={`text-score-${section.id}`}
                        >
                          {Math.round(score)}
                        </span>
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: sectionLevel.color }}
                          data-testid={`badge-level-${section.id}`}
                        >
                          {sectionLevel.name}
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <span className="font-semibold text-gray-700">Why This Matters:</span>
                        <p className="text-gray-600 mt-1">{section.importance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Scoring Methodology Reminder */}
        <Card className="mb-8" data-testid="card-methodology">
          <CardHeader>
            <CardTitle>How Your Score Was Calculated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Your overall AI readiness score is a weighted average of your performance across all nine dimensions:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Data Foundation</span>
                <span className="text-blue-600 font-bold">15%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Strategic Leadership</span>
                <span className="text-blue-600 font-bold">12%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Technology Infrastructure</span>
                <span className="text-blue-600 font-bold">12%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Governance & Risk</span>
                <span className="text-blue-600 font-bold">12%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">People & Skills</span>
                <span className="text-blue-600 font-bold">12%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Use Case Portfolio</span>
                <span className="text-blue-600 font-bold">10%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Responsible AI</span>
                <span className="text-blue-600 font-bold">10%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Change Management</span>
                <span className="text-blue-600 font-bold">10%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Value Realization</span>
                <span className="text-blue-600 font-bold">7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Consultation CTA */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white" data-testid="card-schedule-cta">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Ready to Take Action?</h3>
                <p className="text-white/90 mb-4">
                  Schedule a free consultation with our AI readiness experts to discuss your results, get personalized recommendations, and create a roadmap for your AI transformation journey.
                </p>
                <ul className="space-y-2 text-sm text-white/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>30-minute personalized session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Expert review of your assessment results</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Customized action plan and next steps</span>
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <Link href="/schedule">
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                    data-testid="button-schedule-consultation"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" data-testid="button-home">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            data-testid="button-download"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare}
            data-testid="button-share"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </>
            )}
          </Button>
          <Link href="/assessment">
            <Button data-testid="button-retake">
              Retake Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
