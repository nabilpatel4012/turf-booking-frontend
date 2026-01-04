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
import { AmenitiesInput } from "./amenities-input";

import { ImageUpload } from "@/components/ui/image-upload";

// Interface remains comprehensive
interface Turf {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: string;
  longitude?: string;
  googleMapUrl?: string;
  phone: string;
  images: string[];
  amenities: string[];
  status: string;
  openingTime?: string;
  closingTime?: string;
  venueType?: string;
  shape?: string;
  size?: string;
  logo?: string;
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
  amenities: string[];
  googleMapUrl: string;
  images: string[];
  logo: string;
  venueType: string;
  shape: string;
  size: string;
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
    amenities: [],
    googleMapUrl: "",
    images: [],
    logo: "",
    venueType: "turf",
    shape: "rectangle",
    size: "",
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
        amenities: turf.amenities ?? [],
        googleMapUrl: turf.googleMapUrl ?? "",
        images: turf.images ?? [],
        logo: turf.logo ?? "",
        venueType: turf.venueType ?? "turf",
        shape: turf.shape ?? "rectangle",
        size: turf.size ?? "",
      });
    }
  }, [turf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turf) return;

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        // Arrays are already handled correctly
      };

      const response = await fetchWithAuth(
        getApiUrl(`/turfs/admin/${turf.id}`),
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update venue");
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogDescription>
            Update the information for "{turf?.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Basic Info</h3>
            <div className="space-y-2">
                <Label htmlFor="edit-name">Venue Name</Label>
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="edit-venueType">Venue Type</Label>
                <Select
                    value={formData.venueType}
                    onValueChange={(value) =>
                    setFormData({ ...formData, venueType: value })
                    }
                    disabled={isLoading}
                >
                    <SelectTrigger id="edit-venueType">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="turf">Turf</SelectItem>
                    <SelectItem value="badminton">Badminton Court</SelectItem>
                    <SelectItem value="pickleball">Pickleball Court</SelectItem>
                    <SelectItem value="table_tennis">Table Tennis Court</SelectItem>
                    </SelectContent>
                </Select>
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

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="edit-shape">Shape</Label>
                <Select
                    value={formData.shape}
                    onValueChange={(value) =>
                    setFormData({ ...formData, shape: value })
                    }
                    disabled={isLoading}
                >
                    <SelectTrigger id="edit-shape">
                    <SelectValue />
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
                <Label htmlFor="edit-size">Size (in ft)</Label>
                <Input
                  id="edit-size"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  disabled={isLoading}
                />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Media</h3>
            
            <div className="space-y-2">
                <Label>Venue Logo</Label>
                <ImageUpload 
                    value={formData.logo ? [formData.logo] : []}
                    onChange={(urls) => setFormData({...formData, logo: urls[0] || ""})}
                    onRemove={() => setFormData({...formData, logo: ""})}
                    maxFiles={1}
                    multiple={false}
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label>Venue Images</Label>
                <ImageUpload 
                    value={formData.images}
                    onChange={(urls) => setFormData({...formData, images: urls})}
                    onRemove={(url) => setFormData({...formData, images: formData.images.filter((img) => img !== url)})}
                    multiple={true}
                    maxFiles={10}
                    disabled={isLoading}
                />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
             <h3 className="font-semibold text-sm uppercase text-muted-foreground">Location & Details</h3>
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
             </div>
             
             {/* Google Map URL - Replaces Lat/Long */}
             <div className="space-y-2">
                <Label htmlFor="edit-googleMapUrl">Google Map URL</Label>
                <Input
                  id="edit-googleMapUrl"
                  value={formData.googleMapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                  disabled={isLoading}
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
              {isLoading ? "Updating..." : "Update Venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
