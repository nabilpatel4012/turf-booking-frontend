"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (!open || !mapRef.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let marker: L.Marker | null = null;
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      setSelected({ lat, lng });
      if (marker) marker.remove();
      marker = L.marker([lat, lng]).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Turf Location</DialogTitle>
        </DialogHeader>
        <div ref={mapRef} className="h-[400px] w-full rounded-md border" />
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
