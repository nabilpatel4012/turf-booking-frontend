"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface MapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (lat: number, lng: number) => void;
}

export function MapPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: MapPickerDialogProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!open) return;

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Load Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      setMapLoaded(true);
    };

    loadLeaflet();
  }, [open]);

  // Initialize map
  useEffect(() => {
    if (!open || !mapLoaded || !mapRef.current || mapInstanceRef.current)
      return;

    const L = (window as any).L;
    if (!L) return;

    // Small delay to ensure dialog is fully rendered
    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Force map to recalculate size after dialog animation
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      // Add click handler
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setSelected({ lat, lng });

        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        markerRef.current = L.marker([lat, lng]).addTo(map);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [open, mapLoaded]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      setSelected(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Turf Location</DialogTitle>
        </DialogHeader>

        {!mapLoaded && open && (
          <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md border">
            <p className="text-gray-500">Loading map...</p>
          </div>
        )}

        <div
          ref={mapRef}
          className={`w-full h-[400px] rounded-md border ${
            !mapLoaded ? "hidden" : ""
          }`}
          style={{
            minHeight: "400px",
            position: "relative",
            zIndex: 1,
          }}
        />

        {selected && (
          <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
            Selected: {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onSelect(selected.lat, selected.lng);
                onOpenChange(false);
              }
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
