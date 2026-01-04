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
  theme?: any;
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
  images: string;
  venueType: string;
  shape: string;
  size: string;
  // Theme fields
  themePreset: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  layout: string;
}

const THEME_PRESETS = {
  modern: { primary: "#0f172a", secondary: "#3b82f6", bg: "#ffffff" },
  classic: { primary: "#1e293b", secondary: "#e2e8f0", bg: "#f8fafc" },
  vibrant: { primary: "#7c3aed", secondary: "#f472b6", bg: "#fff1f2" },
  dark: { primary: "#000000", secondary: "#22d3ee", bg: "#0f172a" },
  minimal: { primary: "#333333", secondary: "#999999", bg: "#ffffff" },
};

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
    images: "",
    venueType: "turf",
    shape: "rectangle",
    size: "",
    themePreset: "modern",
    primaryColor: "#0f172a",
    secondaryColor: "#3b82f6",
    backgroundColor: "#ffffff",
    layout: "default",
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
        images: turf.images?.join(", ") ?? "",
        venueType: turf.venueType ?? "turf",
        shape: turf.shape ?? "rectangle",
        size: turf.size ?? "",
        themePreset: turf.theme?.preset ?? "modern",
        primaryColor: turf.theme?.primaryColor ?? "#0f172a",
        secondaryColor: turf.theme?.secondaryColor ?? "#3b82f6",
        backgroundColor: turf.theme?.backgroundColor ?? "#ffffff",
        layout: turf.theme?.layout ?? "default",
      });
    }
  }, [turf]);

  const handlePresetChange = (preset: string) => {
    const theme = THEME_PRESETS[preset as keyof typeof THEME_PRESETS];
    if (theme) {
      setFormData((prev) => ({
        ...prev,
        themePreset: preset,
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
        backgroundColor: theme.bg,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turf) return;

    setIsLoading(true);
    setError("");

    try {
      // Destructure out complex fields
      const {
        amenities,
        images,
        themePreset,
        primaryColor,
        secondaryColor,
        backgroundColor,
        layout,
        ...rest
      } = formData;

      const payload = {
        ...rest,
        amenities, // Already array
        images: images
          ? images.split(",").map((url) => url.trim()).filter(Boolean)
          : [],
        
        // Theme logic
        theme: {
            preset: themePreset,
            primaryColor,
            secondaryColor,
            backgroundColor,
            layout
        }
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
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Theme & Layout</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="theme-preset">Preset</Label>
                    <Select
                        value={formData.themePreset}
                        onValueChange={handlePresetChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="theme-preset">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="layout">Layout</Label>
                     <Select
                        value={formData.layout}
                        onValueChange={(value) =>
                        setFormData({ ...formData, layout: value })
                        }
                        disabled={isLoading}
                    >
                        <SelectTrigger id="layout">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="default">Default</SelectItem>
                             <SelectItem value="hero-focus">Hero Focus</SelectItem>
                             <SelectItem value="grid-view">Grid View</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="grid grid-cols-3 gap-2">
                 <div className="space-y-1">
                     <Label className="text-xs">Primary</Label>
                     <div className="flex gap-2">
                        <Input 
                            type="color" 
                            className="h-8 w-8 p-0 border-0"
                            value={formData.primaryColor || "#000000"}
                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                        />
                        <Input 
                            className="h-8 text-xs font-mono"
                            value={formData.primaryColor || ""}
                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                        />
                     </div>
                 </div>
                 <div className="space-y-1">
                     <Label className="text-xs">Secondary</Label>
                     <div className="flex gap-2">
                        <Input 
                            type="color" 
                            className="h-8 w-8 p-0 border-0"
                            value={formData.secondaryColor || "#000000"}
                            onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                        />
                        <Input 
                            className="h-8 text-xs font-mono"
                            value={formData.secondaryColor || ""}
                            onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                        />
                     </div>
                 </div>
                 <div className="space-y-1">
                     <Label className="text-xs">Background</Label>
                     <div className="flex gap-2">
                        <Input 
                            type="color" 
                            className="h-8 w-8 p-0 border-0"
                            value={formData.backgroundColor || "#ffffff"}
                            onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                        />
                        <Input 
                            className="h-8 text-xs font-mono"
                            value={formData.backgroundColor || ""}
                            onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                        />
                     </div>
                 </div>
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
