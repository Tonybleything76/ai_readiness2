import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award,
  ArrowLeft,
  Building,
  PieChart,
  Activity,
  Database
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from "recharts";

interface IndustryStats {
  industry: string;
  responseCount: number;
  averageOverallScore: number;
  overallMedian: number;
  pillarMedians: Record<string, number>;
  count: number;
}

interface IndustryAnalytics {
  industries: IndustryStats[];
  totalIndustries: number;
  totalResponsesAnalyzed: number;
}

interface OrganizationStats {
  organizationId: string;
  industry: string;
  overallScore: number;
  pillarScores: Record<string, number>;
  category: string;
  assessmentDate: string;
  totalAssessments: number;
}

interface TopOrganizations {
  organizations: OrganizationStats[];
  totalOrganizations: number;
  averageScore: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const pillarNames = {
  technology: 'Technology',
  data_management: 'Data Management', 
  organizational_culture: 'Culture',
  strategic_planning: 'Strategy',
  risk_management: 'Risk Management'
};

export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have admin session by trying to access a protected endpoint
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/responses?page=1&limit=1', {
          credentials: 'include', // Include cookies
        });
        if (response.ok) {
          setAdminToken('authenticated'); // Just a flag, real auth is via cookies
        } else {
          setLocation("/admin/login");
        }
      } catch (error) {
        setLocation("/admin/login");
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const { data: industryData, isLoading: industryLoading } = useQuery({
    queryKey: ["/api/admin/analytics/industry-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/industry-stats", {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch industry analytics");
      }
      
      return response.json() as Promise<IndustryAnalytics>;
    },
    enabled: !!adminToken,
  });

  const { data: organizationsData, isLoading: orgsLoading } = useQuery({
    queryKey: ["/api/admin/analytics/top-organizations"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/top-organizations?limit=15", {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch organizations analytics");
      }
      
      return response.json() as Promise<TopOrganizations>;
    },
    enabled: !!adminToken,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include' // Include cookies
      });
    } catch (error) {
      // Even if logout fails, clear local state
    }
    localStorage.removeItem("csrfToken");
    setLocation("/admin/login");
  };

  const handleBackToDashboard = () => {
    setLocation("/admin");
  };

  if (!adminToken) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" onClick={handleBackToDashboard} data-testid="button-back-dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="h-6 w-px bg-border" />
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Industry insights and organizational performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="default" 
                onClick={() => setLocation("/admin/backups")}
                data-testid="button-admin-backups"
              >
                <Database className="w-4 h-4 mr-2" />
                Backups
              </Button>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-industries">
                    {industryData?.totalIndustries || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Industries Analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-responses">
                    {industryData?.totalResponsesAnalyzed || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-top-organizations">
                    {organizationsData?.totalOrganizations || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-average-score">
                    {organizationsData?.averageScore ? Math.round(organizationsData.averageScore) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Industry Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Industry Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {industryLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={industryData?.industries || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="industry" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'averageOverallScore' ? `${Math.round(value)}%` : value,
                        name === 'averageOverallScore' ? 'Average Score' : 'Response Count'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="averageOverallScore" 
                      fill="hsl(var(--primary))" 
                      name="Average Score"
                      data-testid="chart-industry-performance"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Industry Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Assessment Distribution by Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              {industryLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={industryData?.industries || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ industry, percent }: any) => 
                        `${industry}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="responseCount"
                      data-testid="chart-industry-distribution"
                    >
                      {(industryData?.industries || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} assessments`, 'Count']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Industry Statistics Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Detailed Industry Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {industryLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Industry</TableHead>
                      <TableHead className="text-right">Assessments</TableHead>
                      <TableHead className="text-right">Average Score</TableHead>
                      <TableHead>Top Pillar</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(industryData?.industries || []).map((industry, index) => {
                      const topPillar = Object.entries(industry.pillarMedians || {})
                        .sort(([,a], [,b]) => b - a)[0];
                      const performanceLevel = industry.averageOverallScore >= 75 ? 'high' : 
                                             industry.averageOverallScore >= 50 ? 'medium' : 'low';
                      
                      return (
                        <TableRow key={industry.industry} data-testid={`row-industry-${index}`}>
                          <TableCell className="font-medium">{industry.industry}</TableCell>
                          <TableCell className="text-right">{industry.responseCount}</TableCell>
                          <TableCell className="text-right">
                            {Math.round(industry.averageOverallScore)}%
                          </TableCell>
                          <TableCell>
                            {topPillar ? pillarNames[topPillar[0] as keyof typeof pillarNames] || topPillar[0] : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              performanceLevel === 'high' ? 'default' : 
                              performanceLevel === 'medium' ? 'secondary' : 'outline'
                            }>
                              {performanceLevel === 'high' ? 'High' : 
                               performanceLevel === 'medium' ? 'Medium' : 'Developing'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top Organizations Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performing Organizations (Anonymized)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orgsLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead className="text-right">Overall Score</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Assessments</TableHead>
                      <TableHead className="text-right">Latest Assessment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(organizationsData?.organizations || []).map((org, index) => (
                      <TableRow key={org.organizationId} data-testid={`row-organization-${index}`}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{org.organizationId}</TableCell>
                        <TableCell>{org.industry}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {Math.round(org.overallScore)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{org.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{org.totalAssessments}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {format(new Date(org.assessmentDate), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}