"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmenitiesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const COMMON_AMENITIES = [
  "Parking",
  "Water Facility",
  "Washrooms",
  "Changing Room",
  "Flood Lights",
  "Sun Cover",
  "Cafe",
  "First Aid",
  "Equipment Rental",
  "Spectator Seating"
];

export function AmenitiesInput({ value = [], onChange, disabled }: AmenitiesInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const removeAmenity = (amenity: string) => {
    onChange(value.filter((a) => a !== amenity));
  };

  const toggleCommon = (amenity: string) => {
    if (value.includes(amenity)) {
      removeAmenity(amenity);
    } else {
      onChange([...value, amenity]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom amenity..."
          disabled={disabled}
          className="flex-1"
        />
        <Button 
            type="button" 
            onClick={handleAdd} 
            disabled={disabled || !inputValue.trim()}
            variant="secondary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Amenities */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-md border border-input bg-background">
        {value.length === 0 && (
            <span className="text-muted-foreground text-sm italic py-1">No amenities added yet.</span>
        )}
        {value.map((amenity) => (
          <Badge key={amenity} variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-sm bg-primary/10 text-primary hover:bg-primary/20">
            {amenity}
            <button
              type="button"
              onClick={() => removeAmenity(amenity)}
              disabled={disabled}
              className="ml-1 rounded-full p-0.5 hover:bg-background/50 focus:outline-none"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {amenity}</span>
            </button>
          </Badge>
        ))}
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Suggestions:</Label>
        <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map(amenity => (
                <Badge 
                    key={amenity}
                    variant={value.includes(amenity) ? "default" : "outline"}
                    className={`cursor-pointer hover:bg-primary/90 transition-colors ${value.includes(amenity) ? "" : "text-muted-foreground hover:text-primary-foreground"}`}
                    onClick={() => !disabled && toggleCommon(amenity)}
                >
                    {amenity}
                </Badge>
            ))}
        </div>
      </div>
    </div>
  );
}
