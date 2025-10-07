"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface TermsSettingsCardProps {
  initialTerms: string
  onUpdate: (terms: string) => Promise<void>
}

export function TermsSettingsCard({ initialTerms, onUpdate }: TermsSettingsCardProps) {
  const [terms, setTerms] = useState(initialTerms)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsSaved(false)

    try {
      await onUpdate(terms)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("[v0] Failed to update terms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
        <CardDescription>Manage the terms and conditions for your turf booking service</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Terms and Conditions</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              disabled={isLoading}
              rows={10}
              placeholder="Enter your terms and conditions..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Terms"}
            </Button>
            {isSaved && <span className="text-sm text-green-500">Terms saved successfully!</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
