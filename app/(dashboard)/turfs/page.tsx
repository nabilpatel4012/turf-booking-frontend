"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TurfCard } from "@/components/turfs/turf-card";
import { CreateTurfDialog } from "@/components/turfs/create-turf-dialog";
import { EditTurfDialog } from "@/components/turfs/edit-turf-dialog";
import { DeleteTurfDialog } from "@/components/turfs/delete-turf-dialog";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
  googleMapUrl?: string; // Added
  phone: string;
  images: string[];
  amenities: string[];
  status: string;
  openingTime?: string;
  closingTime?: string;
  venueType?: string;
  shape?: string;
  size?: string;
  createdAt: string;
  owner: Owner;
}

interface TurfsApiResponse {
  success: boolean;
  count: number;
  data: Turf[];
}

export default function TurfsPage() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(getApiUrl("/turfs/admin/my-turfs"), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const result: TurfsApiResponse = await response.json();
        if (result && Array.isArray(result.data)) {
          setTurfs(result.data);
        } else {
          console.error(
            "[v0] API response is not in the expected format:",
            result
          );
          setError("Invalid data format received");
          setTurfs([]);
        }
      } else {
        setError(`Failed to load venues (${response.status})`);
        setTurfs([]);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch venues:", error);
      setError("Network error. Please check your connection.");
      setTurfs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (turf: Turf) => {
    setSelectedTurf(turf);
    setEditDialogOpen(true);
  };

  const handleDelete = (turf: Turf) => {
    setSelectedTurf(turf);
    setDeleteDialogOpen(true);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card shadow-sm overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Venues</h1>
            <p className="text-muted-foreground mt-2">
              Manage your sports facilities
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Venue
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Failed to load venues</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
          <Button onClick={fetchTurfs} variant="outline">
            <Loader2 className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>

        <CreateTurfDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={fetchTurfs}
        />
      </div>
    );
  }

  // Success State
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground mt-2">
            Manage your sports facilities
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </div>

      {turfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No venues yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Get started by creating your first venue. You can manage
            bookings, pricing, and availability once you add a venue.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Venue
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {turfs.map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateTurfDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchTurfs}
      />
      <EditTurfDialog
        turf={selectedTurf}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchTurfs}
      />
      <DeleteTurfDialog
        turf={selectedTurf}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={fetchTurfs}
      />
    </div>
  );
}
