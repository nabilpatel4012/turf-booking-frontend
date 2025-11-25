import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TurfSettings } from "@/types/settings";

interface BookingStatusCardProps {
  settings: TurfSettings;
  onFormChange: (category: keyof TurfSettings, key: string, value: any) => void;
  onAutosave: (
    endpoint: string,
    payload: object,
    optimisticUpdate: () => void
  ) => void;
}

export default function BookingStatusCard({
  settings,
  onFormChange,
  onAutosave,
}: BookingStatusCardProps) {
  return (
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
            checked={settings.booking.enabled}
            onCheckedChange={(enabled) =>
              onAutosave("/settings/turf/toggle-booking", { enabled }, () =>
                onFormChange("booking", "enabled", enabled)
              )
            }
          />
          <Label htmlFor="booking-enabled">
            {settings.booking.enabled
              ? "Bookings Enabled"
              : "Bookings Disabled"}
          </Label>
        </div>
        {!settings.booking.enabled && (
          <div className="space-y-2">
            <Label htmlFor="booking-disabled-reason">
              Reason for Disabling (Optional, autosaved on blur)
            </Label>
            <Textarea
              id="booking-disabled-reason"
              placeholder="e.g., Closed for a private event."
              value={settings.booking.disabledReason || ""}
              onChange={(e) =>
                onFormChange("booking", "disabledReason", e.target.value)
              }
              onBlur={(e) =>
                onAutosave(
                  "/settings/turf/toggle-booking",
                  { enabled: false, reason: e.target.value },
                  () =>
                    onFormChange("booking", "disabledReason", e.target.value)
                )
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
