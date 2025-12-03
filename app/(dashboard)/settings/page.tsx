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

interface Turf {
  id: string;
  name: string;
}

interface TurfSettings {
  booking: {
    enabled: boolean;
    disabledReason: string | null | undefined;
    autoConfirm: boolean;
    maxHours: number;
    minHours: number;
    advanceDays: number;
    cancellationDeadline: number;
    bufferTime: number;
  };
  notifications: {
    onNewBooking: boolean;
    onCancellation: boolean;
    onPayment: boolean;
    reminderBefore: number;
  };
  payment: {
    requireAdvance: boolean;
    advancePercentage: number;
    refundEnabled: boolean;
    refundPercentage: number;
  };
  general: {
    timezone: string;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
  };
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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [selectedTurfId, setSelectedTurfId] = useState<string>("");
  const [turfSettings, setTurfSettings] = useState<TurfSettings | null>(null);
  const [turfSettingsForm, setTurfSettingsForm] = useState<TurfSettings | null>(
    null
  );

  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings | null>(
    null
  );
  const [notificationPrefs, setNotificationPrefs] = useState<
    OwnerSettings["notifications"] | null
  >(null);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    sessions: true,
    turfs: true,
    turfSettings: false,
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
    fetchTurfs();
    fetchOwnerSettings();
  }, []);

  useEffect(() => {
    if (selectedTurfId) {
      fetchTurfSettings(selectedTurfId);
    }
  }, [selectedTurfId]);

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

  const fetchTurfs = async () => {
    setLoading("turfs", true);
    try {
      const res = await fetchWithAuth(getApiUrl("admin/my-turfs"));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch turfs");
      setTurfs(data.data);
      if (data.data.length > 0 && !selectedTurfId) {
        setSelectedTurfId(data.data[0].id);
      }
    } catch (error: any) {
      toast.error("Could not load turfs", { description: error.message });
    } finally {
      setLoading("turfs", false);
    }
  };

  // --- [UPDATED] ---
  // This fetch remains the same, using the GET /settings/turf endpoint
  const fetchTurfSettings = async (turfId: string) => {
    setLoading("turfSettings", true);
    try {
      const res = await fetchWithAuth(
        getApiUrl(`/settings/turf?turfId=${turfId}`)
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch settings");
      setTurfSettings(data.data);
      setTurfSettingsForm(JSON.parse(JSON.stringify(data.data)));
    } catch (error: any) {
      toast.error("Could not load turf settings", {
        description: error.message,
      });
      setTurfSettings(null);
      setTurfSettingsForm(null);
    } finally {
      setLoading("turfSettings", false);
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

  // --- [NEW] ---
  // Helper function to update the nested turfSettingsForm state
  const handleTurfFormChange = (
    category: keyof TurfSettings,
    key: string,
    value: any
  ) => {
    // Attempt to parse numbers from input fields
    const originalValue = (turfSettingsForm as any)[category][key];
    if (typeof originalValue === "number") {
      value = parseInt(value, 10);
      if (isNaN(value)) value = 0; // Default to 0 if parse fails
    }

    setTurfSettingsForm((prev: TurfSettings | null) => {
      if (!prev) return null;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };
    });
  };

  // --- [NEW/RESTORED] ---
  // Autosave function for specific toggles (Booking & Maintenance)
  const handleTurfAutosave = async (
    endpoint: string,
    payload: object,
    optimisticUpdate: () => void
  ) => {
    // 1. Optimistically update the local form state
    optimisticUpdate();

    const toastId = toast.loading("Updating...");
    try {
      const res = await fetchWithAuth(getApiUrl(endpoint), {
        method: "PUT",
        body: JSON.stringify({ turfId: selectedTurfId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(data.message || "Setting updated", { id: toastId });
      // 2. Refetch the *whole* settings object to ensure perfect sync
      await fetchTurfSettings(selectedTurfId);
    } catch (error: any) {
      toast.error("Update failed", { id: toastId, description: error.message });
      // 3. On failure, refetch to revert the optimistic update
      await fetchTurfSettings(selectedTurfId);
    }
  };

  // --- [UPDATED] ---
  // This function now uses the `/settings/turf/update` endpoint
  // It saves ALL settings (including those just autosaved, which is fine)
  const handleSaveTurfSettings = async () => {
    if (!turfSettingsForm || !selectedTurfId) return;

    const toastId = toast.loading("Saving settings...");
    setLoading("turfSettings", true);
    try {
      const res = await fetchWithAuth(getApiUrl("/settings/turf/update"), {
        method: "PUT",
        body: JSON.stringify({
          turfId: selectedTurfId,
          settings: turfSettingsForm, // Send the whole form object
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("Settings saved successfully!", {
        id: toastId,
      });
      // Refetch the settings to ensure sync
      await fetchTurfSettings(selectedTurfId);
    } catch (error: any) {
      toast.error("Save failed", { id: toastId, description: error.message });
    } finally {
      setLoading("turfSettings", false);
    }
  };

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
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, security, and turf settings.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="turf">
              <Settings className="h-4 w-4 mr-2" />
              Turf
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Monitor className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Turf Settings Tab */}
          <TabsContent value="turf" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Turf</CardTitle>
                <CardDescription>
                  Choose a turf to manage its settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedTurfId}
                  onValueChange={setSelectedTurfId}
                  disabled={isLoading.turfs}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a turf..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading.turfs ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading turfs...
                      </div>
                    ) : (
                      turfs.map((turf) => (
                        <SelectItem key={turf.id} value={turf.id}>
                          {turf.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {isLoading.turfSettings && !turfSettingsForm ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading turf settings...
              </div>
            ) : turfSettingsForm && selectedTurfId ? (
              <>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {/* --- [AUTOSAVE] Booking Status Card --- */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Status</CardTitle>
                      <CardDescription>
                        Enable or disable new bookings (autosaved).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="booking-enabled"
                          checked={turfSettingsForm.booking.enabled}
                          onCheckedChange={(enabled) =>
                            handleTurfAutosave(
                              "/settings/turf/toggle-booking",
                              { enabled },
                              () =>
                                handleTurfFormChange(
                                  "booking",
                                  "enabled",
                                  enabled
                                )
                            )
                          }
                        />
                        <Label htmlFor="booking-enabled">
                          {turfSettingsForm.booking.enabled
                            ? "Bookings Enabled"
                            : "Bookings Disabled"}
                        </Label>
                      </div>
                      {!turfSettingsForm.booking.enabled && (
                        <div className="space-y-2">
                          <Label htmlFor="booking-disabled-reason">
                            Reason for Disabling (Optional, autosaved on blur)
                          </Label>
                          <Textarea
                            id="booking-disabled-reason"
                            placeholder="e.g., Closed for a private event."
                            value={
                              turfSettingsForm.booking.disabledReason || ""
                            }
                            onChange={(e) =>
                              handleTurfFormChange(
                                "booking",
                                "disabledReason",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleTurfAutosave(
                                "/settings/turf/toggle-booking",
                                {
                                  enabled: false,
                                  reason: e.target.value,
                                },
                                () =>
                                  handleTurfFormChange(
                                    "booking",
                                    "disabledReason",
                                    e.target.value
                                  )
                              )
                            }
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* --- [AUTOSAVE] General Settings Card --- */}
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>
                        Maintenance mode is autosaved. Timezone requires "Save".
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={turfSettingsForm.general.timezone}
                          onChange={(e) =>
                            handleTurfFormChange(
                              "general",
                              "timezone",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="maintenance-mode"
                            checked={turfSettingsForm.general.maintenanceMode}
                            onCheckedChange={(enabled) =>
                              handleTurfAutosave(
                                "/settings/turf/toggle-maintenance",
                                { enabled },
                                () =>
                                  handleTurfFormChange(
                                    "general",
                                    "maintenanceMode",
                                    enabled
                                  )
                              )
                            }
                          />
                          <Label htmlFor="maintenance-mode">
                            {turfSettingsForm.general.maintenanceMode
                              ? "Maintenance Enabled"
                              : "Maintenance Disabled"}
                          </Label>
                        </div>
                        {turfSettingsForm.general.maintenanceMode && (
                          <div className="space-y-2">
                            <Label htmlFor="maintenance-message">
                              Message (Optional, autosaved on blur)
                            </Label>
                            <Textarea
                              id="maintenance-message"
                              placeholder="e.g., Undergoing turf repairs until 5 PM."
                              value={
                                turfSettingsForm.general.maintenanceMessage ||
                                ""
                              }
                              onChange={(e) =>
                                handleTurfFormChange(
                                  "general",
                                  "maintenanceMessage",
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handleTurfAutosave(
                                  "/settings/turf/toggle-maintenance",
                                  { enabled: true, message: e.target.value },
                                  () =>
                                    handleTurfFormChange(
                                      "general",
                                      "maintenanceMessage",
                                      e.target.value
                                    )
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* --- [MANUAL SAVE] Booking Rules Card --- */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Rules</CardTitle>
                      <CardDescription>
                        Define rules for how users can book.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-confirm">
                          Auto-confirm Bookings
                        </Label>
                        <Switch
                          id="auto-confirm"
                          checked={turfSettingsForm.booking.autoConfirm}
                          onCheckedChange={(checked) =>
                            handleTurfFormChange(
                              "booking",
                              "autoConfirm",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min-hours">Min Hours</Label>
                          <Input
                            id="min-hours"
                            type="number"
                            value={turfSettingsForm.booking.minHours}
                            onChange={(e) =>
                              handleTurfFormChange(
                                "booking",
                                "minHours",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-hours">Max Hours</Label>
                          <Input
                            id="max-hours"
                            type="number"
                            value={turfSettingsForm.booking.maxHours}
                            onChange={(e) =>
                              handleTurfFormChange(
                                "booking",
                                "maxHours",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="advance-days">
                          Booking Advance (Days)
                        </Label>
                        <Input
                          id="advance-days"
                          type="number"
                          value={turfSettingsForm.booking.advanceDays}
                          onChange={(e) =>
                            handleTurfFormChange(
                              "booking",
                              "advanceDays",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cancellation-deadline">
                          Cancellation Deadline (Hours before)
                        </Label>
                        <Input
                          id="cancellation-deadline"
                          type="number"
                          value={turfSettingsForm.booking.cancellationDeadline}
                          onChange={(e) =>
                            handleTurfFormChange(
                              "booking",
                              "cancellationDeadline",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buffer-time">Buffer Time (Mins)</Label>
                        <Input
                          id="buffer-time"
                          type="number"
                          value={turfSettingsForm.booking.bufferTime}
                          onChange={(e) =>
                            handleTurfFormChange(
                              "booking",
                              "bufferTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* --- [MANUAL SAVE] Payment Settings Card --- */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Settings</CardTitle>
                      <CardDescription>
                        Configure advance payments and refunds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-advance">
                          Require Advance Payment
                        </Label>
                        <Switch
                          id="require-advance"
                          checked={turfSettingsForm.payment.requireAdvance}
                          onCheckedChange={(checked) =>
                            handleTurfFormChange(
                              "payment",
                              "requireAdvance",
                              checked
                            )
                          }
                        />
                      </div>
                      {turfSettingsForm.payment.requireAdvance && (
                        <div className="space-y-2">
                          <Label htmlFor="advance-percentage">
                            Advance Percentage (%)
                          </Label>
                          <Input
                            id="advance-percentage"
                            type="number"
                            min={0}
                            max={100}
                            value={turfSettingsForm.payment.advancePercentage}
                            onChange={(e) =>
                              handleTurfFormChange(
                                "payment",
                                "advancePercentage",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between">
                        <Label htmlFor="refund-enabled">Enable Refunds</Label>
                        <Switch
                          id="refund-enabled"
                          checked={turfSettingsForm.payment.refundEnabled}
                          onCheckedChange={(checked) =>
                            handleTurfFormChange(
                              "payment",
                              "refundEnabled",
                              checked
                            )
                          }
                        />
                      </div>
                      {turfSettingsForm.payment.refundEnabled && (
                        <div className="space-y-2">
                          <Label htmlFor="refund-percentage">
                            Refund Percentage (%)
                          </Label>
                          <Input
                            id="refund-percentage"
                            type="number"
                            min={0}
                            max={100}
                            value={turfSettingsForm.payment.refundPercentage}
                            onChange={(e) =>
                              handleTurfFormChange(
                                "payment",
                                "refundPercentage",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* --- [MANUAL SAVE] Turf Notifications Card --- */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Turf Notifications</CardTitle>
                      <CardDescription>
                        Choose what to be notified about for this turf.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-new-booking">
                          On New Booking
                        </Label>
                        <Switch
                          id="notif-new-booking"
                          checked={turfSettingsForm.notifications.onNewBooking}
                          onCheckedChange={(checked) =>
                            handleTurfFormChange(
                              "notifications",
                              "onNewBooking",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-cancellation">
                          On Cancellation
                        </Label>
                        <Switch
                          id="notif-cancellation"
                          checked={
                            turfSettingsForm.notifications.onCancellation
                          }
                          onCheckedChange={(checked) =>
                            handleTurfFormChange(
                              "notifications",
                              "onCancellation",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-payment">On Payment</Label>
                        <Switch
                          id="notif-payment"
                          checked={turfSettingsForm.notifications.onPayment}
                          onCheckedChange={(checked) =>
                            handleTurfFormChange(
                              "notifications",
                              "onPayment",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder-before">
                          Reminder (Hours Before)
                        </Label>
                        <Input
                          id="reminder-before"
                          type="number"
                          value={turfSettingsForm.notifications.reminderBefore}
                          onChange={(e) =>
                            handleTurfFormChange(
                              "notifications",
                              "reminderBefore",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* --- [MANUAL SAVE] Save Button --- */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSaveTurfSettings}
                    disabled={isLoading.turfSettings}
                  >
                    {isLoading.turfSettings ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Save Turf Settings
                  </Button>
                </div>
              </>
            ) : (
              !isLoading.turfs && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Turf Selected</AlertTitle>
                  <AlertDescription>
                    Please select a turf to view and manage its settings.
                  </AlertDescription>
                </Alert>
              )
            )}
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" placeholder="Your Business Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number (Optional)</Label>
                  <Input id="gst" placeholder="Enter GST number" />
                </div>
                <Button>Update Business Info</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a strong password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                    >
                      {showPassword.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                    >
                      {showPassword.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={isPasswordChanging}
                >
                  {isPasswordChanging && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading.ownerSettings ? (
                  <p className="text-sm text-muted-foreground">
                    Loading 2FA status...
                  </p>
                ) : ownerSettings?.security.twoFactorEnabled ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-600">
                        2FA is Enabled
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Method: {ownerSettings.security.twoFactorMethod}
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handle2FADisable}>
                      Disable 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">2FA is Disabled</p>
                      <p className="text-sm text-muted-foreground">
                        Greatly improve your account security.
                      </p>
                    </div>
                    <Dialog
                      open={is2FAModalOpen}
                      onOpenChange={setIs2FAModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <KeyRound className="mr-2 h-4 w-4" /> Enable 2FA
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enable Two-Factor Auth</DialogTitle>
                          <DialogDescription>
                            Select a method for authentication codes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Select
                            value={selected2FAMethod}
                            onValueChange={(v: any) => setSelected2FAMethod(v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" /> Email
                                </div>
                              </SelectItem>
                              <SelectItem value="sms">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" /> SMS
                                </div>
                              </SelectItem>
                              <SelectItem value="authenticator">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="h-4 w-4" />{" "}
                                  Authenticator App
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button onClick={handle2FAEnable}>Enable</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6 max-w-3xl">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You have {sessions.length} active{" "}
                {sessions.length === 1 ? "session" : "sessions"}. Sign out from
                other devices to improve security.
              </AlertDescription>
            </Alert>

            {currentSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getDeviceIcon(currentSession.deviceType)}
                    Current Device
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {currentSession.deviceName}
                        </p>
                        <Badge variant="default">Current</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentSession.ipAddress} • Last used{" "}
                        {formatDistanceToNow(
                          new Date(currentSession.lastUsedAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {otherSessions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Other Devices</h2>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={revokeAllOthers}
                    disabled={isLoading.action !== null}
                  >
                    {isLoading.action === "others" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign Out All Others
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
                              {formatDistanceToNow(
                                new Date(session.lastUsedAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeSession(session.id)}
                          disabled={isLoading.action === session.id}
                        >
                          {isLoading.action === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  This will sign you out from all devices, including this one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={revokeAll}
                  disabled={isLoading.action !== null}
                >
                  {isLoading.action === "all" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Sign Out Everywhere
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 max-w-2xl">
            {isLoading.ownerSettings || !notificationPrefs ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading notification settings...
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                    <CardDescription>
                      Choose where you receive notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(notificationPrefs.channels).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <Label
                            htmlFor={`channel-${key}`}
                            className="capitalize"
                          >
                            {key} Notifications
                          </Label>
                          <Switch
                            id={`channel-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              setNotificationPrefs((prev: any) => ({
                                ...prev,
                                channels: { ...prev.channels, [key]: checked },
                              }))
                            }
                          />
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Types</CardTitle>
                    <CardDescription>
                      Choose what you get notified about.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(notificationPrefs.types).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <Label htmlFor={`type-${key}`} className="capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </Label>
                          <Switch
                            id={`type-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              setNotificationPrefs((prev: any) => ({
                                ...prev,
                                types: { ...prev.types, [key]: checked },
                              }))
                            }
                          />
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
                <div className="flex justify-end">
                  <Button onClick={handleUpdateNotifications}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
