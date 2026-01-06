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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  LogOut,
  AlertTriangle,
  Settings,
  Lock,
  Bell,
  User,
  Shield,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Sparkles,
  Loader2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Toaster, toast } from "sonner";
import TurfSettingsTab from "@/components/settings/turf-settings-tab";

// --- TYPE DEFINITIONS ---
interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  isCurrent: boolean;
}



interface OwnerSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
  };
  business: {
    businessName: string;
    gstNumber: string;
  };
  security: {
    twoFactorEnabled: boolean;
    twoFactorMethod: "sms" | "email" | "authenticator" | null;
  };
  notifications: {
    channels: {
      email: boolean;
      sms: boolean;
      push: boolean;
      whatsapp: boolean;
    };
    types: {
      newBooking: boolean;
      cancellation: boolean;
      paymentReceived: boolean;
      paymentFailed: boolean;
      refund: boolean;
      dailySummary: boolean;
      weeklyReport: boolean;
    };
    quietHours: {
      start: string;
      end: string;
    };
  };
}

// --- MAIN COMPONENT ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("turf");

  // Data states
  // Data states
  const [sessions, setSessions] = useState<Session[]>([]);

  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings | null>(
    null
  );
  const [notificationPrefs, setNotificationPrefs] = useState<
    OwnerSettings["notifications"] | null
  >(null);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    sessions: true,
    ownerSettings: true,
    action: null as string | null, // For session revocation, etc.
  });

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // 2FA Modal State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [selected2FAMethod, setSelected2FAMethod] = useState<
    "email" | "sms" | "authenticator"
  >("email");

  const { logout } = useAuth();

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchSessions();
    fetchOwnerSettings();
  }, []);



  const setLoading = (key: keyof typeof isLoading, value: any) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const fetchSessions = async () => {
    setLoading("sessions", true);
    try {
      const res = await fetchWithAuth(getApiUrl("/auth/sessions"));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch sessions");
      setSessions(data.sessions);
    } catch (error: any) {
      toast.error("Could not load sessions", { description: error.message });
    } finally {
      setLoading("sessions", false);
    }
  };



  const fetchOwnerSettings = async () => {
    setLoading("ownerSettings", true);
    try {
      const res = await fetchWithAuth(getApiUrl("/settings/owner"));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch settings");

      const apiData = data.data;

      const notifications: OwnerSettings["notifications"] = {
        channels: apiData.notificationChannels,
        types: apiData.notificationTypes,
        quietHours: {
          start: apiData.communication.quietHoursStart,
          end: apiData.communication.quietHoursEnd,
        },
      };

      const settings: OwnerSettings = {
        profile: {
          name: "",
          email: "",
          phone: "",
        },
        business: {
          businessName: "",
          gstNumber: "",
        },
        security: apiData.security,
        notifications: notifications,
      };

      setOwnerSettings(settings);
      setNotificationPrefs(JSON.parse(JSON.stringify(notifications)));
    } catch (error: any) {
      toast.error("Could not load owner settings", {
        description: error.message,
      });
    } finally {
      setLoading("ownerSettings", false);
    }
  };

  // --- API ACTIONS ---


  const revokeSession = async (sessionId: string) => {
    setLoading("action", sessionId);
    try {
      const res = await fetchWithAuth(
        getApiUrl(`/auth/sessions/${sessionId}`),
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Session revoked");
        const session = sessions.find((s) => s.id === sessionId);
        if (session?.isCurrent) {
          await logout();
        } else {
          await fetchSessions();
        }
      } else {
        throw new Error("Failed to revoke session");
      }
    } catch (error) {
      toast.error("Could not revoke session.");
    } finally {
      setLoading("action", null);
    }
  };

  const revokeAllOthers = async () => {
    setLoading("action", "others");
    try {
      const res = await fetchWithAuth(
        getApiUrl("/auth/sessions/revoke/others"),
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("All other sessions have been signed out.");
        await fetchSessions();
      } else {
        throw new Error("Failed to revoke sessions");
      }
    } catch (error) {
      toast.error("Could not sign out other devices.");
    } finally {
      setLoading("action", null);
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
    setLoading("action", "all");
    try {
      const res = await fetchWithAuth(getApiUrl("/auth/sessions/revoke/all"), {
        method: "DELETE",
      });
      if (res.ok) {
        await logout();
      } else {
        throw new Error("Failed to revoke all sessions");
      }
    } catch (error) {
      toast.error("Could not sign out everywhere.");
    } finally {
      setLoading("action", null);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsPasswordChanging(true);
    const toastId = toast.loading("Changing password...");
    try {
      const res = await fetchWithAuth(getApiUrl("/auth/change-password"), {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      toast.success("Password changed successfully", { id: toastId });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Failed to change password", {
        id: toastId,
        description: error.message,
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handle2FAEnable = async () => {
    const toastId = toast.loading("Enabling 2FA...");
    try {
      const res = await fetchWithAuth(getApiUrl("/settings/owner/2fa/enable"), {
        method: "POST",
        body: JSON.stringify({ method: selected2FAMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enable 2FA");
      toast.success("2FA enabled successfully!", { id: toastId });
      await fetchOwnerSettings();
      setIs2FAModalOpen(false);
    } catch (error: any) {
      toast.error("Failed to enable 2FA", {
        id: toastId,
        description: error.message,
      });
    }
  };

  const handle2FADisable = async () => {
    const toastId = toast.loading("Disabling 2FA...");
    try {
      const res = await fetchWithAuth(
        getApiUrl("/settings/owner/2fa/disable"),
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable 2FA");
      toast.success("2FA disabled successfully", { id: toastId });
      await fetchOwnerSettings();
    } catch (error: any) {
      toast.error("Failed to disable 2FA", {
        id: toastId,
        description: error.message,
      });
    }
  };

  const handleUpdateNotifications = async () => {
    const toastId = toast.loading("Saving preferences...");
    try {
      const res = await fetchWithAuth(
        getApiUrl("/settings/owner/notifications"),
        {
          method: "PUT",
          body: JSON.stringify(notificationPrefs),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to update preferences");
      toast.success("Notification preferences saved!", { id: toastId });
      await fetchOwnerSettings();
    } catch (error: any) {
      toast.error("Could not save preferences", {
        id: toastId,
        description: error.message,
      });
    }
  };

  // --- HELPERS & RENDER ---
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
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

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your turf, notifications, and security.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="flex w-max lg:w-auto lg:inline-grid lg:grid-cols-3 h-auto p-1">
              <TabsTrigger value="turf" className="px-4 py-2">
                <Settings className="h-4 w-4 mr-2" />
                Turf Configuration
              </TabsTrigger>
              <TabsTrigger value="notifications" className="px-4 py-2">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Profile & Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* === TAB 1: TURF CONFIGURATION === */}
          <TabsContent value="turf" className="space-y-6">
            <TurfSettingsTab />
          </TabsContent>

          {/* === TAB 2: NOTIFICATIONS === */}
          <TabsContent value="notifications" className="space-y-6">
            {isLoading.ownerSettings || !notificationPrefs ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading notification preferences...
              </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Admin Channels */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Channels</CardTitle>
                            <CardDescription>Where you receive alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src="/whatsapp-logo.svg" alt="WhatsApp" className="h-4 w-4 text-green-600" />
                                    <Label htmlFor="ch-whatsapp">WhatsApp</Label>
                                </div>
                                <Switch 
                                    id="ch-whatsapp"
                                    checked={notificationPrefs.channels.whatsapp}
                                    onCheckedChange={(c) => setNotificationPrefs(prev => prev ? ({...prev, channels: {...prev.channels, whatsapp: c}}) : null)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <Label htmlFor="ch-email">Email</Label>
                                </div>
                                <Switch 
                                    id="ch-email"
                                    checked={notificationPrefs.channels.email}
                                    onCheckedChange={(c) => setNotificationPrefs(prev => prev ? ({...prev, channels: {...prev.channels, email: c}}) : null)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                     {/* Admin Events */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Admin Events</CardTitle>
                            <CardDescription>What triggers an alert for you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(notificationPrefs.types).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <Label htmlFor={`type-${key}`} className="capitalize text-sm">
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </Label>
                                    <Switch 
                                        id={`type-${key}`}
                                        checked={value}
                                        onCheckedChange={(c) => setNotificationPrefs((prev: any) => ({
                                            ...prev,
                                            types: { ...prev.types, [key]: c }
                                        }))}
                                    />
                                </div>
                            ))}
                        </CardContent>
                     </Card>



                    <div className="md:col-span-2 flex justify-end gap-2">
                        <Button onClick={() => {
                            handleUpdateNotifications(); // Save admin prefs
                        }}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Save Notification Preferences
                        </Button>
                    </div>
                </div>
            )}
          </TabsContent>

          {/* === TAB 3: PROFILE & SECURITY === */}
          <TabsContent value="security" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input placeholder="Email" />
                                </div>
                                <Button variant="outline" size="sm">Update Profile</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                             <Label>Two-Factor Auth</Label>
                                             <p className="text-xs text-muted-foreground">
                                                {ownerSettings?.security.twoFactorEnabled 
                                                    ? `Enabled via ${ownerSettings.security.twoFactorMethod}` 
                                                    : "Currently disabled"}
                                             </p>
                                        </div>
                                        {ownerSettings?.security.twoFactorEnabled ? (
                                             <Button variant="destructive" size="sm" onClick={handle2FADisable}>Disable</Button>
                                        ) : (
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="secondary">Enable</Button>
                                            </DialogTrigger>
                                        )}
                                    </div>
                                     <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Enable 2FA</DialogTitle>
                                        </DialogHeader>
                                        <Select value={selected2FAMethod} onValueChange={(v: any) => setSelected2FAMethod(v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                                <SelectItem value="authenticator">Authenticator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <DialogFooter>
                                            <Button onClick={handle2FAEnable}>Confirm</Button>
                                        </DialogFooter>
                                     </DialogContent>
                                </Dialog>
                                
                                <Separator />
                                
                                <div className="space-y-4">
                                    <Label>Change Password</Label>
                                    <Input 
                                        type="password" 
                                        placeholder="Current Password" 
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    />
                                    <Input 
                                        type="password" 
                                        placeholder="New Password (min 8 chars)" 
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    />
                                    <Input 
                                        type="password" 
                                        placeholder="Confirm New Password" 
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    />
                                    <Button onClick={handlePasswordChange} disabled={isPasswordChanging} size="sm">
                                        {isPasswordChanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>{sessions.length} active sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentSession && (
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getDeviceIcon(currentSession.deviceType)}
                                            <div>
                                                <p className="text-sm font-medium">{currentSession.deviceName} (This)</p>
                                                <p className="text-xs text-muted-foreground">{currentSession.ipAddress}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">Current</Badge>
                                    </div>
                                )}
                                {otherSessions.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getDeviceIcon(s.deviceType)}
                                            <div>
                                                <p className="text-sm font-medium">{s.deviceName}</p>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.lastUsedAt), {addSuffix: true})}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => revokeSession(s.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {otherSessions.length > 0 && (
                                    <Button variant="outline" size="sm" className="w-full text-destructive" onClick={revokeAllOthers}>
                                        Sign Out All Others
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/20 bg-destructive/5">
                             <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <Button variant="destructive" className="w-full" onClick={revokeAll}>
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out Everywhere
                                </Button>
                             </CardContent>
                        </Card>
                    </div>
                </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
