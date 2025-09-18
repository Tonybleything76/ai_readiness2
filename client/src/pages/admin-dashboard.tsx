import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  FileText, 
  Download, 
  Users, 
  BarChart3, 
  Calendar,
  Building,
  Briefcase,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface AdminResponse {
  id: string;
  createdAt: string;
  orgName: string | null;
  industry: string | null;
  overall: number;
  category: string;
}

interface PaginatedResponse {
  data: AdminResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin/login");
      return;
    }
    setAdminToken(token);
  }, [setLocation]);

  const { data: responsesData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/responses", page],
    queryFn: async () => {
      if (!adminToken) throw new Error("No admin token");
      
      const response = await fetch(`/api/admin/responses?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }
      
      return response.json() as Promise<PaginatedResponse>;
    },
    enabled: !!adminToken,
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setLocation("/admin/login");
  };

  const viewResponse = (responseId: string) => {
    setLocation(`/results/${responseId}`);
  };

  if (!adminToken) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load admin dashboard</p>
            <Button onClick={() => setLocation("/admin/login")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const responses = responsesData?.data || [];
  const pagination = responsesData?.pagination;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              AI Readiness Assessment - Response Management
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        {pagination && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-responses">
                  {pagination.total}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Page</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pagination.page} of {pagination.totalPages}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {responses.length > 0 
                    ? Math.round(responses.reduce((sum, r) => sum + r.overall, 0) / responses.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading responses...</div>
            ) : responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No responses found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow key={response.id} data-testid={`row-response-${response.id}`}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {format(new Date(response.createdAt), "MMM dd, yyyy HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                              {response.orgName || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                              {response.industry || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              response.overall >= 80 ? "default" :
                              response.overall >= 60 ? "secondary" :
                              response.overall >= 40 ? "outline" : "destructive"
                            }>
                              {response.overall}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{response.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewResponse(response.id)}
                              data-testid={`button-view-${response.id}`}
                            >
                              View Results
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} responses
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm px-2">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}