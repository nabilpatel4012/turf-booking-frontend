"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";

interface Turf {
  id: string;
  name: string;
}

interface DeleteTurfDialogProps {
  turf: Turf | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteTurfDialog({
  turf,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTurfDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!turf) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth(getApiUrl(`/turfs/${turf.id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete turf");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete turf");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Turf</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{turf?.name}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Turf"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
