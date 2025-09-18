import { Link } from "wouter";
import { Brain, ServerCog, Radar, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4 mr-2" />
            Comprehensive Business Evaluation
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Assess Your Organization's{" "}
            <span className="text-primary">AI Readiness</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Evaluate your business across multiple critical pillars to understand your AI adoption potential,
            identify gaps, and create a roadmap for transformation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/assessment">
              <Button size="lg" className="text-lg" data-testid="button-start-assessment">
                <Brain className="w-5 h-5 mr-2" />
                Start Assessment
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg" data-testid="button-learn-more">
              <Route className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>

          {/* Assessment Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-chart-1/20 text-chart-1 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ServerCog className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Multi-Pillar Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive evaluation across technology, strategy, culture, and operations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-chart-2/20 text-chart-2 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Radar className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Visual Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive charts and detailed scoring to understand your strengths and gaps.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-chart-3/20 text-chart-3 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Route className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Actionable Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed recommendations and next steps for your AI transformation journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
