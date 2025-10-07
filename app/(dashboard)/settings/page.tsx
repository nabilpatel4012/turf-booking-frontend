"use client"

import { useEffect, useState } from "react"
import { BookingSettingsCard } from "@/components/settings/booking-settings-card"
import { TermsSettingsCard } from "@/components/settings/terms-settings-card"
import { DeleteTurfsCard } from "@/components/settings/delete-turfs-card"
import { getApiUrl, getAuthHeaders } from "@/lib/api"

interface Settings {
  bookingEnabled: boolean
  termsAndConditions: string
}

interface Turf {
  id: string
  name: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [turfs, setTurfs] = useState<Turf[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
    fetchTurfs()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch(getApiUrl("/settings"), {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTurfs = async () => {
    try {
      const response = await fetch(getApiUrl("/turfs"), {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setTurfs(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch turfs:", error)
    }
  }

  const updateBookingEnabled = async (enabled: boolean) => {
    const response = await fetch(getApiUrl("/settings/booking-enabled"), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled }),
    })

    if (!response.ok) {
      throw new Error("Failed to update booking settings")
    }
  }

  const updateTerms = async (terms: string) => {
    const response = await fetch(getApiUrl("/settings/terms"), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ terms }),
    })

    if (!response.ok) {
      throw new Error("Failed to update terms")
    }
  }

  const deleteTurf = async (turfId: string) => {
    const response = await fetch(getApiUrl(`/turfs/${turfId}`), {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete turf")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Failed to load settings</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your turf booking system settings</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <BookingSettingsCard initialEnabled={settings.bookingEnabled} onUpdate={updateBookingEnabled} />
        <TermsSettingsCard initialTerms={settings.termsAndConditions} onUpdate={updateTerms} />
        <DeleteTurfsCard turfs={turfs} onDelete={deleteTurf} onRefresh={fetchTurfs} />
      </div>
    </div>
  )
}
