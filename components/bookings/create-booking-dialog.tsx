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
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Turf {
  id: string;
  name: string;
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBookingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingType, setBookingType] = useState<"phone" | "userId">("phone");
  const [turfs, setTurfs] = useState<Turf[]>([]);

  const [formData, setFormData] = useState({
    userId: "",
    phone: "",
    name: "", // User name for phone booking
    turfId: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "", // Optional, maybe calculated by backend? But backend createAdminBooking doesn't take price.
    // Wait, createAdminBooking in backend calculates price.
    // createBookingForUser also calculates price.
    // The previous frontend sent price, but maybe it was ignored or used as override?
    // Let's check backend createBooking. It calculates price.
    // So we don't need to send price for admin booking if we want auto-calc.
    // But maybe admin wants to override?
    // The backend BookingService.createBooking calculates price: const price = await this.pricingService.calculatePrice(...)
    // It ignores the price passed in DTO?
    // CreateBookingDto doesn't have price.
    // So price input in frontend was probably useless or for a different endpoint version.
    // I will keep it if it was there, but it seems unused by backend.
    // Actually, let's remove it to avoid confusion if backend calculates it.
  });

  useEffect(() => {
    if (open) {
      fetchTurfs();
    }
  }, [open]);

  const fetchTurfs = async () => {
    try {
      const response = await fetchWithAuth(getApiUrl("/turfs/admin/my-turfs"), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTurfs(data);
        if (data.length > 0 && !formData.turfId) {
          setFormData((prev) => ({ ...prev, turfId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch turfs", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let url = "";
      let body = {};

      if (bookingType === "phone") {
        url = "/bookings/admin/create-by-phone";
        body = {
          phone: formData.phone,
          name: formData.name,
          turfId: formData.turfId,
          date: formData.date,
          startTime: `${formData.date}T${formData.startTime}:00`,
          endTime: `${formData.date}T${formData.endTime}:00`,
        };
      } else {
        url = "/bookings/admin/create-for-user";
        body = {
          userId: formData.userId,
          turfId: formData.turfId,
          date: formData.date,
          startTime: `${formData.date}T${formData.startTime}:00`,
          endTime: `${formData.date}T${formData.endTime}:00`,
        };
      }

      const response = await fetchWithAuth(getApiUrl(url), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create booking");
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        userId: "",
        phone: "",
        name: "",
        turfId: "",
        date: "",
        startTime: "",
        endTime: "",
        price: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Add a new booking to the system</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="phone"
          value={bookingType}
          onValueChange={(v) => setBookingType(v as "phone" | "userId")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">By Phone</TabsTrigger>
            <TabsTrigger value="userId">By User ID</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="turfId">Select Turf</Label>
            <Select
              value={formData.turfId}
              onValueChange={(value) =>
                setFormData({ ...formData, turfId: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a turf" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(turfs) && turfs.map((turf) => (
                  <SelectItem key={turf.id} value={turf.id}>
                    {turf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {bookingType === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g. 9876543210"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">User Name (Optional)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Guest Name"
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
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
              {isLoading ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
