import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Home, Download, TrendingUp, CheckCircle2, Award } from 'lucide-react';
import { READINESS_LEVELS, ASSESSMENT_SECTIONS } from '../../../shared/assessment-data';

// API response type (different from database schema due to field mapping)
interface AssessmentResult {
  id: string;
  organizationName: string;
  industry: string;
  answers: Record<string, number>;
  scores: {
    technology: number;
    dataManagement: number;
    organizationalCulture: number;
    strategyPlanning: number;
    riskCompliance: number;
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
      if (!response.ok) throw new Error('Failed to load results');
      return response.json();
    },
    enabled: !!resultId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
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
          <p className="text-sm text-gray-500 mt-2" data-testid="text-assessment-date">
            Completed on {new Date(result.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
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
        <Card className="mb-8 border-l-4" style={{ borderLeftColor: readinessLevel.color }} data-testid="card-overall-score">
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
                  className="text-6xl font-bold mb-2"
                  style={{ color: readinessLevel.color }}
                  data-testid="text-overall-score"
                >
                  {Math.round(result.scores.overall)}
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
                    <CardTitle className="text-lg">{section.title}</CardTitle>
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
              Your overall AI readiness score is a weighted average of your performance across all five dimensions:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Data Management & Quality</span>
                <span className="text-blue-600 font-bold">25%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Technology Infrastructure</span>
                <span className="text-blue-600 font-bold">20%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Organizational Culture</span>
                <span className="text-blue-600 font-bold">20%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Strategy & Planning</span>
                <span className="text-blue-600 font-bold">20%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Risk & Compliance</span>
                <span className="text-blue-600 font-bold">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
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
