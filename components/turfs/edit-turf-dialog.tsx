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
import { getApiUrl, getAuthHeaders } from "@/lib/api";

// Interface remains comprehensive
interface Turf {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  phone: string;
  images: string[];
  amenities: string[];
  status: string;
  openingTime: string;
  closingTime: string;
  createdAt: string;
  owner: Owner;
}
interface Owner {
  id: string;
  name: string;
}

interface EditTurfDialogProps {
  turf: Turf | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Define the shape of the form data state
interface EditTurfFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  status: string;
  openingTime: string;
  closingTime: string;
  amenities: string;
  latitude: string; // Stored as string from input
  longitude: string; // Stored as string from input
  images: string;
}

export function EditTurfDialog({
  turf,
  open,
  onOpenChange,
  onSuccess,
}: EditTurfDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<EditTurfFormData>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    status: "active",
    openingTime: "06:00",
    closingTime: "23:00",
    amenities: "",
    latitude: "",
    longitude: "",
    images: "",
  });

  useEffect(() => {
    if (turf) {
      setFormData({
        name: turf.name ?? "",
        description: turf.description ?? "",
        address: turf.address ?? "",
        city: turf.city ?? "",
        state: turf.state ?? "",
        zipCode: turf.zipCode ?? "",
        phone: turf.phone ?? "",
        status: turf.status ?? "active",
        // Extract HH:mm part from time string (e.g., '06:00:00' -> '06:00')
        openingTime: turf.openingTime?.substring(0, 5) ?? "06:00",
        closingTime: turf.closingTime?.substring(0, 5) ?? "23:00",
        amenities: turf.amenities?.join(", ") ?? "",
        // Convert number coordinates back to string for the form input
        latitude: turf.latitude?.toString() ?? "",
        longitude: turf.longitude?.toString() ?? "",
        images: turf.images?.join(", ") ?? "",
      });
    }
  }, [turf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turf) return;

    setIsLoading(true);
    setError("");

    try {
      // Destructure out the coordinates and list fields for special handling
      const {
        latitude,
        longitude,
        amenities,
        images,
        openingTime,
        closingTime,
        ...rest
      } = formData;

      const payload: { [key: string]: any } = {
        ...rest,

        // Handle list fields
        amenities: amenities
          .split(",")
          .map((a) => a.trim().toLowerCase().replace(/ /g, "_"))
          .filter(Boolean),
        images: images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),

        // Handle time fields (ensure :00 is appended)
        openingTime: `${openingTime}:00`,
        closingTime: `${closingTime}:00`,
      };

      // ✅ CORE LOGIC: Convert to numerical and omit if empty string
      if (latitude) {
        payload.latitude = parseFloat(latitude); // Set as number
      }

      if (longitude) {
        payload.longitude = parseFloat(longitude); // Set as number
      }
      // If latitude or longitude are empty strings (""), they are not added to the payload.

      const response = await fetch(getApiUrl(`/turfs/admin/${turf.id}`), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update turf");
      }

      onSuccess();
      onOpenChange(false);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Turf</DialogTitle>
          <DialogDescription>
            Update the information for "{turf?.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Turf Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">State</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-zipCode">Zip Code</Label>
              <Input
                id="edit-zipCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-latitude">Latitude</Label>
              <Input
                id="edit-latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-longitude">Longitude</Label>
              <Input
                id="edit-longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-openingTime">Opening Time</Label>
              <Input
                id="edit-openingTime"
                type="time"
                value={formData.openingTime}
                onChange={(e) =>
                  setFormData({ ...formData, openingTime: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-closingTime">Closing Time</Label>
              <Input
                id="edit-closingTime"
                type="time"
                value={formData.closingTime}
                onChange={(e) =>
                  setFormData({ ...formData, closingTime: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amenities">Amenities (comma-separated)</Label>
            <Input
              id="edit-amenities"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-images">Image URLs (comma-separated)</Label>
            <Textarea
              id="edit-images"
              value={formData.images}
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.value })
              }
              disabled={isLoading}
              rows={2}
            />
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
              {isLoading ? "Updating..." : "Update Turf"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
