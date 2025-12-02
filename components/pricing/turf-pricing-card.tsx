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
import { MapPin, DollarSign } from "lucide-react";

interface Owner {
  id: string;
  name: string;
}

interface Turf {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  owner: Owner;
}

interface TurfPricingCardProps {
  turf: Turf;
  onSelect: (turf: Turf) => void;
}

export function TurfPricingCard({ turf, onSelect }: TurfPricingCardProps) {
  const isActive = turf.status === "active";

  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <CardTitle className="text-lg">{turf.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">
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
      <CardFooter className="mt-auto pt-4">
        <Button className="w-full" onClick={() => onSelect(turf)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Manage Pricing
        </Button>
      </CardFooter>
    </Card>
  );
}
