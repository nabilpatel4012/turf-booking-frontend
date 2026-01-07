"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { TurfPricingCard } from "@/components/pricing/turf-pricing-card";
import { PricingEditor } from "@/components/pricing/pricing-editor";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

interface Turf {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  owner: { id: string; name: string };
}

export default function PricingPage() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);

  useEffect(() => {
      fetchTurfs();
  },[]);

  const fetchTurfs = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/turfs/admin/my-turfs`,
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch turfs");
      }

      const data = await response.json();
      setTurfs(data.data);
    } catch (error) {
      console.error("Error fetching turfs:", error);
      toast.error("Failed to load turfs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedTurf) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50/50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTurf(null)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Pricing</h1>
                 <p className="text-xs sm:text-sm text-muted-foreground">
                  Editing pricing for {selectedTurf.name}
                </p>
              </div>
          </div>
        </div>
        <Separator className="hidden sm:block" />

        <PricingEditor turfId={selectedTurf.id} />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select a turf to manage its pricing rules
          </p>
        </div>
      </div>
      <Separator className="hidden sm:block" />

      {turfs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No turfs found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {turfs.map((turf) => (
            <TurfPricingCard
              key={turf.id}
              turf={turf}
              onSelect={setSelectedTurf}
            />
          ))}
        </div>
      )}
    </div>
  );
}
