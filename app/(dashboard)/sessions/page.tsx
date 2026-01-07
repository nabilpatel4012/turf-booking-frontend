"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(getApiUrl("/auth/sessions"));

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("[Sessions] Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const response = await fetchWithAuth(
        getApiUrl(`/auth/sessions/${sessionId}`),
        { method: "DELETE" }
      );

      if (response.ok) {
        // If current session was revoked, logout
        const session = sessions.find((s) => s.id === sessionId);
        if (session?.isCurrent) {
          await logout();
        } else {
          await fetchSessions();
        }
      }
    } catch (error) {
      console.error("[Sessions] Failed to revoke session:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const revokeAllOthers = async () => {
    setActionLoading("others");
    try {
      const response = await fetchWithAuth(
        getApiUrl("/auth/sessions/revoke/others"),
        { method: "DELETE" }
      );

      if (response.ok) {
        await fetchSessions();
      }
    } catch (error) {
      console.error("[Sessions] Failed to revoke other sessions:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const revokeAll = async () => {
    if (
      !confirm(
        "This will sign you out from all devices including this one. Continue?"
      )
    ) {
      return;
    }

    setActionLoading("all");
    try {
      const response = await fetchWithAuth(
        getApiUrl("/auth/sessions/revoke/all"),
        { method: "DELETE" }
      );

      if (response.ok) {
        await logout();
      }
    } catch (error) {
      console.error("[Sessions] Failed to revoke all sessions:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      case "desktop":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Active Sessions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your active sessions across all devices
          </p>
        </div>
      </div>
      <Separator className="hidden sm:block" />

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          You have {sessions.length} active{" "}
          {sessions.length === 1 ? "session" : "sessions"}. You can sign out
          from other devices to improve security.
        </AlertDescription>
      </Alert>

      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDeviceIcon(currentSession.deviceType)}
              Current Device
            </CardTitle>
            <CardDescription>
              This is the device you're currently using
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{currentSession.deviceName}</p>
                  <Badge variant="default">Current</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentSession.ipAddress} • Last used{" "}
                  {formatDistanceToNow(new Date(currentSession.lastUsedAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Signed in{" "}
                  {formatDistanceToNow(new Date(currentSession.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Other Devices</h2>
            <Button
              variant="destructive"
              size="sm"
              onClick={revokeAllOthers}
              disabled={actionLoading !== null}
            >
              {actionLoading === "others" ? (
                "Signing out..."
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out All Other Devices
                </>
              )}
            </Button>
          </div>

          {otherSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getDeviceIcon(session.deviceType)}
                    <div className="space-y-1">
                      <p className="font-medium">{session.deviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.ipAddress} • Last used{" "}
                        {formatDistanceToNow(new Date(session.lastUsedAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Signed in{" "}
                        {formatDistanceToNow(new Date(session.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                    disabled={actionLoading === session.id}
                  >
                    {actionLoading === session.id ? (
                      "Removing..."
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Sign out from all devices, including this one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={revokeAll}
            disabled={actionLoading !== null}
          >
            {actionLoading === "all" ? (
              "Signing out from all devices..."
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out Everywhere
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
