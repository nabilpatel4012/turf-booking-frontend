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

interface PaymentSettingsCardProps {
  settings: TurfSettings;
  onFormChange: (category: keyof TurfSettings, key: string, value: any) => void;
}

export default function PaymentSettingsCard({
  settings,
  onFormChange,
}: PaymentSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>
          Configure how you receive payments for bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="require-advance" className="flex flex-col space-y-1">
            <span>Require Advance Payment</span>
            <span className="font-normal text-xs text-muted-foreground">
              Users must pay an advance amount to confirm.
            </span>
          </Label>
          <Switch
            id="require-advance"
            checked={settings.payment.requireAdvance}
            onCheckedChange={(checked) =>
              onFormChange("payment", "requireAdvance", checked)
            }
          />
        </div>

        {settings.payment.requireAdvance && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="advance-amount">Advance Payment Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input
                id="advance-amount"
                type="number"
                min="0"
                placeholder="200"
                className="pl-7"
                value={settings.payment.advanceAmount}
                onChange={(e) =>
                  onFormChange("payment", "advanceAmount", e.target.value)
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Fixed amount to be paid online. A 2.5% platform fee will be added on top of this.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between space-x-2 pt-2 border-t">
          <Label htmlFor="refund-enabled" className="flex flex-col space-y-1">
            <span>Allow Refunds</span>
            <span className="font-normal text-xs text-muted-foreground">
              Enable automated refunds for cancellations.
            </span>
          </Label>
          <Switch
            id="refund-enabled"
            checked={settings.payment.refundEnabled}
            onCheckedChange={(checked) =>
              onFormChange("payment", "refundEnabled", checked)
            }
          />
        </div>

        {settings.payment.refundEnabled && (
            <div className="space-y-2">
                <Label htmlFor="refund-percentage">Refund Percentage (%)</Label>
                <Input
                id="refund-percentage"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={settings.payment.refundPercentage}
                onChange={(e) =>
                    onFormChange("payment", "refundPercentage", e.target.value)
                }
                />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
