import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Database, 
  Download, 
  Shield, 
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  HardDrive,
  Calendar,
  FileText
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BackupFile {
  filename: string;
  size: number;
  sizeFormatted: string;
  created: string;
  modified: string;
  format: string;
  compressed: boolean;
  path: string;
}

interface BackupListResponse {
  backups: BackupFile[];
  total: number;
  directory: string;
  totalSize: number;
  totalSizeFormatted: string;
}

interface BackupStatusResponse {
  scheduler: {
    running: boolean;
    schedule: string;
    lastRun: string | null;
    nextRun: string | null;
    status: string;
  };
  environment: {
    nodeEnv: string;
    backupDir: string;
    directoryStatus: string;
    cronExpression: string;
    retentionDays: string;
    timezone: string;
  };
  timestamp: string;
}

interface VerificationResult {
  success: boolean;
  verified: boolean;
  details: {
    checksum: string;
    size: number;
    compressionValid: boolean;
    sqlValid: boolean;
    lastModified: string;
  };
  timestamp: string;
}

export default function AdminBackups() {
  const [, setLocation] = useLocation();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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

  // Fetch backup list
  const { data: backupData, isLoading: backupsLoading, error: backupsError, refetch: refetchBackups } = useQuery({
    queryKey: ["/api/admin/backup/list"],
    queryFn: async (): Promise<BackupListResponse> => {
      if (!adminToken) throw new Error("No admin token");
      
      const response = await fetch('/api/admin/backup/list', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backup list');
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });

  // Fetch backup system status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/admin/backup/status"],
    queryFn: async (): Promise<BackupStatusResponse> => {
      if (!adminToken) throw new Error("No admin token");
      
      const response = await fetch('/api/admin/backup/status', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backup status');
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });

  // Manual backup trigger mutation
  const backupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/backup/run', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Backup Started", 
        description: "Manual backup has been initiated successfully",
      });
      refetchBackups();
    },
    onError: (error: any) => {
      toast({
        title: "Backup Failed", 
        description: error.message || "Failed to start backup",
        variant: "destructive",
      });
    },
  });

  // Backup verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (filename: string) => {
      const response = await apiRequest(`/api/admin/backup/verify/${filename}`, {
        method: 'POST',
      });
      return response as VerificationResult;
    },
    onSuccess: (data) => {
      toast({
        title: data.verified ? "Backup Verified" : "Verification Failed", 
        description: data.verified 
          ? "Backup file integrity check passed" 
          : "Backup file failed integrity check",
        variant: data.verified ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Error", 
        description: error.message || "Failed to verify backup",
        variant: "destructive",
      });
    },
  });

  // Backup restore mutation
  const restoreMutation = useMutation({
    mutationFn: async ({ filename, confirmText }: { filename: string; confirmText: string }) => {
      const response = await apiRequest(`/api/admin/backup/restore/${filename}`, {
        method: 'POST',
        body: JSON.stringify({ confirmText }),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Database Restored", 
        description: "Database has been successfully restored from backup",
      });
      setRestoreConfirmText("");
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Restore Failed", 
        description: error.message || "Failed to restore database",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (error) {
      // Even if logout fails, clear local state
    }
    localStorage.removeItem("csrfToken");
    toast({
      title: "Logged out", 
      description: "You have been logged out successfully",
    });
    setLocation("/admin/login");
  };

  const handleDownload = (filename: string) => {
    window.open(`/api/admin/backup/download/${filename}`, '_blank');
  };

  const handleVerify = (filename: string) => {
    verifyMutation.mutate(filename);
  };

  const handleRestore = (filename: string) => {
    if (restoreConfirmText === "RESTORE DATABASE") {
      restoreMutation.mutate({ filename, confirmText: restoreConfirmText });
    } else {
      toast({
        title: "Confirmation Required", 
        description: "Please type 'RESTORE DATABASE' exactly to confirm",
        variant: "destructive",
      });
    }
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin")}
              data-testid="button-back-admin"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Database className="h-8 w-8 mr-3 text-blue-600" />
                Backup Management
              </h1>
              <p className="text-muted-foreground">Manage database backups, verification, and restoration</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            data-testid="button-logout"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-scheduler-status">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduler Status</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  {statusData?.scheduler.running ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-2xl font-bold">
                    {statusData?.scheduler.running ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {statusData?.scheduler.schedule || "No schedule"}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-backup-count">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <div className="text-2xl font-bold">{backupData?.total || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {backupData?.totalSizeFormatted || "0 B"} total size
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-last-backup">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <div className="text-sm font-bold">
                  {statusData?.scheduler.lastRun 
                    ? format(new Date(statusData.scheduler.lastRun), "MMM dd, HH:mm")
                    : "Never"
                  }
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Next: {statusData?.scheduler.nextRun 
                  ? format(new Date(statusData.scheduler.nextRun), "MMM dd, HH:mm")
                  : "Not scheduled"
                }
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-storage-status">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <div className="flex items-center space-x-2">
                  {statusData?.environment.directoryStatus === 'accessible' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-bold">
                    {statusData?.environment.directoryStatus === 'accessible' 
                      ? "Accessible" 
                      : "Issues"
                    }
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {statusData?.environment.retentionDays || "30"} days retention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
            data-testid="button-run-backup"
          >
            {backupMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Backup Now
          </Button>
          <Button
            variant="outline"
            onClick={() => refetchBackups()}
            data-testid="button-refresh-list"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh List
          </Button>
        </div>

        {/* Backup Files Table */}
        <Card>
          <CardHeader>
            <CardTitle>Backup Files</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and restore database backup files
            </p>
          </CardHeader>
          <CardContent>
            {backupsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : backupsError ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Backups</h3>
                <p className="text-muted-foreground mb-4">
                  {backupsError instanceof Error ? backupsError.message : "Unknown error"}
                </p>
                <Button onClick={() => refetchBackups()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : !backupData?.backups.length ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Backups Found</h3>
                <p className="text-muted-foreground mb-4">
                  No backup files are available. Run your first backup to get started.
                </p>
                <Button 
                  onClick={() => backupMutation.mutate()}
                  disabled={backupMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Create First Backup
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupData.backups.map((backup) => (
                    <TableRow key={backup.filename} data-testid={`row-backup-${backup.filename}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-mono text-sm">{backup.filename}</div>
                          <div className="text-xs text-muted-foreground">
                            {backup.path}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{backup.sizeFormatted}</div>
                        <div className="text-xs text-muted-foreground">
                          {backup.size.toLocaleString()} bytes
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(backup.created), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(backup.created), "HH:mm:ss")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{backup.format}</Badge>
                          {backup.compressed && (
                            <Badge variant="secondary">Compressed</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(backup.filename)}
                            data-testid={`button-download-${backup.filename}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerify(backup.filename)}
                            disabled={verifyMutation.isPending}
                            data-testid={`button-verify-${backup.filename}`}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedFile(backup.filename)}
                                data-testid={`button-restore-${backup.filename}`}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center text-red-600">
                                  <AlertTriangle className="h-5 w-5 mr-2" />
                                  Restore Database
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-4">
                                  <p>
                                    <strong>WARNING:</strong> This will completely replace your current database 
                                    with the data from this backup file.
                                  </p>
                                  <p>
                                    <strong>File:</strong> {backup.filename}
                                  </p>
                                  <p>
                                    A safety backup will be created automatically before restoration.
                                  </p>
                                  <div className="space-y-2">
                                    <Label htmlFor="confirm-text">
                                      Type <strong>RESTORE DATABASE</strong> to confirm:
                                    </Label>
                                    <Input
                                      id="confirm-text"
                                      value={restoreConfirmText}
                                      onChange={(e) => setRestoreConfirmText(e.target.value)}
                                      placeholder="RESTORE DATABASE"
                                      data-testid="input-restore-confirm"
                                    />
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setRestoreConfirmText("");
                                  setSelectedFile(null);
                                }}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => selectedFile && handleRestore(selectedFile)}
                                  disabled={restoreConfirmText !== "RESTORE DATABASE" || restoreMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700"
                                  data-testid="button-confirm-restore"
                                >
                                  {restoreMutation.isPending ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                  )}
                                  Restore Database
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
  );
}