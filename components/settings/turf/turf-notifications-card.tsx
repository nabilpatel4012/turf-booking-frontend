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

interface TurfNotificationsCardProps {
  settings: TurfSettings;
  onFormChange: (category: keyof TurfSettings, key: string, value: any) => void;
}

export default function TurfNotificationsCard({
  settings,
  onFormChange,
}: TurfNotificationsCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Customer Alerts</CardTitle>
        <CardDescription>
          These settings are specific to this turf.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="cust-new-booking">Notify Customer on Booking</Label>
          <Switch
            id="cust-new-booking"
            checked={settings.notifications.onNewBooking}
            onCheckedChange={(c) =>
              onFormChange("notifications", "onNewBooking", c)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="cust-cancellation">
            Notify Customer on Cancellation
          </Label>
          <Switch
            id="cust-cancellation"
            checked={settings.notifications.onCancellation}
            onCheckedChange={(c) =>
              onFormChange("notifications", "onCancellation", c)
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="cust-reminder" className="whitespace-nowrap">
            Reminder Hours Before
          </Label>
          <Input
            id="cust-reminder"
            type="number"
            className="w-24"
            value={settings.notifications.reminderBefore}
            onChange={(e) =>
              onFormChange("notifications", "reminderBefore", e.target.value)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
