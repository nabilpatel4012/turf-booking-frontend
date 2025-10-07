"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BookingSettingsCardProps {
  initialEnabled: boolean
  onUpdate: (enabled: boolean) => Promise<void>
}

export function BookingSettingsCard({ initialEnabled, onUpdate }: BookingSettingsCardProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true)
    try {
      await onUpdate(checked)
      setIsEnabled(checked)
    } catch (error) {
      console.error("[v0] Failed to update booking settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Settings</CardTitle>
        <CardDescription>Control whether users can make new bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="booking-enabled">Enable Turf Booking</Label>
            <p className="text-sm text-muted-foreground">
              {isEnabled ? "Users can currently make bookings" : "Booking is currently disabled"}
            </p>
          </div>
          <Switch id="booking-enabled" checked={isEnabled} onCheckedChange={handleToggle} disabled={isLoading} />
        </div>
      </CardContent>
    </Card>
  )
}
