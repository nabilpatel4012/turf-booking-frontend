"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Phone, Palette } from "lucide-react";

// FIX: This interface must match the full Turf interface from your page.tsx
// to ensure type compatibility.
interface Owner {
  id: string;
  name: string;
}

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
  createdAt: string;
  owner: Owner;
}

interface TurfCardProps {
  turf: Turf;
  onEdit: (turf: Turf) => void;
  onDelete: (turf: Turf) => void;

}

export function TurfCard({ turf, onEdit, onDelete }: TurfCardProps) {
  const isActive = turf.status === "active";

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <CardTitle className="text-xl">{turf.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                {turf.address}, {turf.city}
              </span>
            </div>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={
              isActive
                ? "bg-green-500/10 text-green-500 capitalize"
                : "capitalize"
            }
          >
            {turf.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{turf.phone}</span>
        </div>

        {turf.description && (
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm mt-1 line-clamp-2">{turf.description}</p>
          </div>
        )}

        {turf.amenities && turf.amenities.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {turf.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="text-xs capitalize"
                >
                  {amenity.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">

        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onEdit(turf)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => onDelete(turf)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
