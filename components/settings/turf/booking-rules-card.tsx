import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { TurfSettings } from "@/types/settings";

interface BookingRulesCardProps {
  settings: TurfSettings;
  onFormChange: (category: keyof TurfSettings, key: string, value: any) => void;
}

export default function BookingRulesCard({
  settings,
  onFormChange,
}: BookingRulesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Rules</CardTitle>
        <CardDescription>
          Define constraints and limits for bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Confirm */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-confirm">Auto-confirm Bookings</Label>
          <Switch
            id="auto-confirm"
            checked={settings.booking.autoConfirm}
            onCheckedChange={(c) =>
              onFormChange("booking", "autoConfirm", c)
            }
          />
        </div>

        {/* Numeric Inputs Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Min Hours
            </Label>
            <Input
              type="number"
              value={settings.booking.minHours}
              onChange={(e) =>
                onFormChange("booking", "minHours", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Max Hours
            </Label>
            <Input
              type="number"
              value={settings.booking.maxHours}
              onChange={(e) =>
                onFormChange("booking", "maxHours", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Advance (Days)
            </Label>
            <Input
              type="number"
              value={settings.booking.advanceDays}
              onChange={(e) =>
                onFormChange("booking", "advanceDays", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Cancel Deadline (Hrs)
            </Label>
            <Input
              type="number"
              value={settings.booking.cancellationDeadline}
              onChange={(e) =>
                onFormChange("booking", "cancellationDeadline", e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
