"use client";

import type React from "react";
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
import { MapPin } from "lucide-react";
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";
import { AmenitiesInput } from "./amenities-input";

interface CreateTurfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Define the shape of the form data
// Update interface
interface TurfFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  status: string;
  // openingTime: string; // Removed
  // closingTime: string; // Removed
  amenities: string[]; // Changed to array
  googleMapUrl: string; // Added
  // latitude: string; // Removed
  // longitude: string; // Removed
  images: string;
  venueType: string;
  shape: string;
  size: string;
}

const initialFormData: TurfFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  status: "active",
  amenities: [],
  googleMapUrl: "",
  images: "",
  venueType: "turf",
  shape: "rectangle",
  size: "",
};

export function CreateTurfDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTurfDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<TurfFormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        amenities: formData.amenities, // Already an array
        images: formData.images
          ? formData.images
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean)
          : [],
        // Removed time formatting as fields are gone
      };

      const response = await fetchWithAuth(getApiUrl("/turfs/admin/create"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create turf");
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Venue</DialogTitle>
          <DialogDescription>
            Add a new venue to your management system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueType">Venue Type *</Label>
              <Select
                value={formData.venueType}
                onValueChange={(value) =>
                  setFormData({ ...formData, venueType: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="venueType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turf">Turf</SelectItem>
                  <SelectItem value="badminton">Badminton Court</SelectItem>
                  <SelectItem value="pickleball">Pickleball Court</SelectItem>
                  <SelectItem value="table_tennis">
                    Table Tennis Court
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Shape & Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shape">Shape</Label>
              <Select
                value={formData.shape}
                onValueChange={(value) =>
                  setFormData({ ...formData, shape: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="shape">
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Regular (Rectangle)</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="circle">360 Degree (Circle)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (in ft)</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="e.g. 100x60"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="status">
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
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
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
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Google Map URL - Replaces Lat/Long */}
          <div className="space-y-2">
            <Label htmlFor="googleMapUrl">Google Map URL</Label>
            <Input
              id="googleMapUrl"
              value={formData.googleMapUrl}
              onChange={(e) =>
                setFormData({ ...formData, googleMapUrl: e.target.value })
              }
              placeholder="https://maps.google.com/..."
              disabled={isLoading}
            />
          </div>

          {/* Optional Fields */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <AmenitiesInput 
                value={formData.amenities}
                onChange={(amenities) => setFormData({...formData, amenities})}
                disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Image URLs (comma-separated)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.value })
              }
              disabled={isLoading}
              placeholder="https://example.com/img1.jpg, ..."
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
              {isLoading ? "Creating..." : "Create Venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
