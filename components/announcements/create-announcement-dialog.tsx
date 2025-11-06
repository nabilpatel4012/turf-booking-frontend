"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";

enum AnnouncementType {
  GENERAL = "general",
  MAINTENANCE = "maintenance",
  PROMOTION = "promotion",
  CLOSURE = "closure",
  TOURNAMENT = "tournament",
}
interface Turf {
  id: string;
  name: string;
}
interface TurfsApiResponse {
  success: boolean;
  count: number;
  data: Turf[];
}
interface CreateAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const initialFormData = {
  turfId: "global",
  title: "",
  message: "",
  type: AnnouncementType.GENERAL,
  expiresAt: "",
};

export function CreateAnnouncementDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAnnouncementDialogProps) {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTurfs, setIsFetchingTurfs] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const fetchTurfs = async () => {
      if (!open) return;
      setIsFetchingTurfs(true);
      try {
        const response = await fetchWithAuth(
          getApiUrl("/turfs/admin/my-turfs"),
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.ok) {
          const result: TurfsApiResponse = await response.json();
          if (result && Array.isArray(result.data)) {
            setTurfs(result.data);
          } else {
            setTurfs([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch turfs:", error);
        setTurfs([]);
      } finally {
        setIsFetchingTurfs(false);
      }
    };

    fetchTurfs();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload: { [key: string]: any } = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      if (formData.turfId && formData.turfId !== "global") {
        payload.turfId = formData.turfId;
      }
      if (formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      const response = await fetchWithAuth(getApiUrl("/admin/announcements"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create announcement");
      }

      onSuccess();
      onOpenChange(false);
      setFormData(initialFormData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Publish a new announcement. Select a turf for a specific notice or
            leave it for a global one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="turfId">Target Turf (Optional)</Label>
            <Select
              value={formData.turfId}
              onValueChange={(value) =>
                setFormData({ ...formData, turfId: value })
              }
              disabled={isLoading || isFetchingTurfs}
            >
              <SelectTrigger id="turfId">
                <SelectValue
                  placeholder={
                    isFetchingTurfs ? "Loading turfs..." : "Select a turf"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  Global Announcement (All Turfs)
                </SelectItem>
                {turfs.map((turf) => (
                  <SelectItem key={turf.id} value={turf.id}>
                    {turf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            {/* FIX: The onChange handler below was corrupted and has been corrected. */}
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as AnnouncementType })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AnnouncementType).map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
