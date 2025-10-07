"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Turf {
  id: string
  name: string
}

interface DeleteTurfsCardProps {
  turfs: Turf[]
  onDelete: (turfId: string) => Promise<void>
  onRefresh: () => void
}

export function DeleteTurfsCard({ turfs, onDelete, onRefresh }: DeleteTurfsCardProps) {
  const [selectedTurfId, setSelectedTurfId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!selectedTurfId) return

    setIsLoading(true)
    try {
      await onDelete(selectedTurfId)
      setSelectedTurfId("")
      onRefresh()
    } catch (error) {
      console.error("[v0] Failed to delete turf:", error)
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  const selectedTurf = turfs.find((t) => t.id === selectedTurfId)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Delete Turf</CardTitle>
          <CardDescription>Permanently remove a turf from your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="turf-select">Select Turf to Delete</Label>
            <Select value={selectedTurfId} onValueChange={setSelectedTurfId} disabled={isLoading}>
              <SelectTrigger id="turf-select">
                <SelectValue placeholder="Choose a turf" />
              </SelectTrigger>
              <SelectContent>
                {turfs.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No turfs available</div>
                ) : (
                  turfs.map((turf) => (
                    <SelectItem key={turf.id} value={turf.id}>
                      {turf.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={!selectedTurfId || isLoading}
            className="w-full"
          >
            Delete Selected Turf
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedTurf?.name}". This action cannot be undone and will remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Turf"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
