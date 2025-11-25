import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TurfSettings } from "@/types/settings";

interface GeneralSettingsCardProps {
  settings: TurfSettings;
  onFormChange: (category: keyof TurfSettings, key: string, value: any) => void;
  onAutosave: (
    endpoint: string,
    payload: object,
    optimisticUpdate: () => void
  ) => void;
}

export default function GeneralSettingsCard({
  settings,
  onFormChange,
  onAutosave,
}: GeneralSettingsCardProps) {
  return (
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
            value={settings.general.timezone}
            onChange={(e) =>
              onFormChange("general", "timezone", e.target.value)
            }
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenance-mode"
              checked={settings.general.maintenanceMode}
              onCheckedChange={(enabled) =>
                onAutosave(
                  "/settings/turf/toggle-maintenance",
                  { enabled },
                  () => onFormChange("general", "maintenanceMode", enabled)
                )
              }
            />
            <Label htmlFor="maintenance-mode">
              {settings.general.maintenanceMode
                ? "Maintenance Enabled"
                : "Maintenance Disabled"}
            </Label>
          </div>
          {settings.general.maintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">
                Message (Optional, autosaved on blur)
              </Label>
              <Textarea
                id="maintenance-message"
                placeholder="e.g., Undergoing turf repairs until 5 PM."
                value={settings.general.maintenanceMessage || ""}
                onChange={(e) =>
                  onFormChange("general", "maintenanceMessage", e.target.value)
                }
                onBlur={(e) =>
                  onAutosave(
                    "/settings/turf/toggle-maintenance",
                    { enabled: true, message: e.target.value },
                    () =>
                      onFormChange(
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
  );
}
