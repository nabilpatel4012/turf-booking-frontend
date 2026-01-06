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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import TurfSelector from "./turf/turf-selector";
import BookingStatusCard from "./turf/booking-status-card";
import GeneralSettingsCard from "./turf/general-settings-card";
// import BookingRulesCard from "./turf/BookingRulesCard";
import PaymentSettingsCard from "./turf/payment-settings-card";
// import TurfNotificationsCard from "./turf/TurfNotificationsCard";
import type { Turf, TurfSettings } from "@/types/settings";

export default function TurfSettingsTab() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [selectedTurfId, setSelectedTurfId] = useState<string>("");
  const [turfSettings, setTurfSettings] = useState<TurfSettings | null>(null);
  const [turfSettingsForm, setTurfSettingsForm] = useState<TurfSettings | null>(
    null
  );
  const [isLoading, setIsLoading] = useState({
    turfs: true,
    turfSettings: false,
  });

  useEffect(() => {
    fetchTurfs();
  }, []);

  useEffect(() => {
    if (selectedTurfId) {
      fetchTurfSettings(selectedTurfId);
    }
  }, [selectedTurfId]);

  const fetchTurfs = async () => {
    setIsLoading((prev) => ({ ...prev, turfs: true }));
    try {
      const res = await fetchWithAuth(getApiUrl("/turfs"));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch turfs");
      setTurfs(data.data);
      if (data.data.length > 0 && !selectedTurfId) {
        setSelectedTurfId(data.data[0].id);
      }
    } catch (error: any) {
      toast.error("Could not load turfs", { description: error.message });
    } finally {
      setIsLoading((prev) => ({ ...prev, turfs: false }));
    }
  };

  const fetchTurfSettings = async (turfId: string) => {
    setIsLoading((prev) => ({ ...prev, turfSettings: true }));
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
      setIsLoading((prev) => ({ ...prev, turfSettings: false }));
    }
  };

  const handleTurfFormChange = (
    category: keyof TurfSettings,
    key: string,
    value: any
  ) => {
    const originalValue = (turfSettingsForm as any)[category][key];
    
    // Auto-convert number fields
    if (typeof originalValue === "number" || key === 'advanceAmount' || key === 'refundPercentage' || key === 'maxBookingHours' || key === 'minBookingHours' || key === 'advanceBookingDays' || key === 'cancellationDeadlineHours' || key === 'reminderBeforeHours') {
      value = parseInt(value, 10);
      if (isNaN(value)) value = 0;
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

  const handleTurfAutosave = async (
    endpoint: string,
    payload: object,
    optimisticUpdate: () => void
  ) => {
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
      await fetchTurfSettings(selectedTurfId);
    } catch (error: any) {
      toast.error("Update failed", { id: toastId, description: error.message });
      await fetchTurfSettings(selectedTurfId);
    }
  };

  const handleSaveTurfSettings = async () => {
    if (!turfSettingsForm || !selectedTurfId) return;

    const toastId = toast.loading("Saving settings...");
    setIsLoading((prev) => ({ ...prev, turfSettings: true }));
    try {
      const res = await fetchWithAuth(getApiUrl("/settings/turf/update"), {
        method: "PUT",
        body: JSON.stringify({
          turfId: selectedTurfId,
          settings: turfSettingsForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("Settings saved successfully!", { id: toastId });
      await fetchTurfSettings(selectedTurfId);
    } catch (error: any) {
      toast.error("Save failed", { id: toastId, description: error.message });
    } finally {
      setIsLoading((prev) => ({ ...prev, turfSettings: false }));
    }
  };

  return (
    <div className="space-y-6">
      <TurfSelector
        turfs={turfs}
        selectedTurfId={selectedTurfId}
        onTurfChange={setSelectedTurfId}
        isLoading={isLoading.turfs}
      />

      {isLoading.turfSettings && !turfSettingsForm ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading turf settings...
        </div>
      ) : turfSettingsForm && selectedTurfId ? (
        <>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <BookingStatusCard
              settings={turfSettingsForm}
              onFormChange={handleTurfFormChange}
              onAutosave={handleTurfAutosave}
            />
            <GeneralSettingsCard
              settings={turfSettingsForm}
              onFormChange={handleTurfFormChange}
              onAutosave={handleTurfAutosave}
            />
            {/* <BookingRulesCard
              settings={turfSettingsForm}
              onFormChange={handleTurfFormChange}
            /> */}
            <PaymentSettingsCard
              settings={turfSettingsForm}
              onFormChange={handleTurfFormChange}
            />
            {/* <TurfNotificationsCard
              settings={turfSettingsForm}
              onFormChange={handleTurfFormChange}
            /> */}
          </div>

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
    </div>
  );
}
