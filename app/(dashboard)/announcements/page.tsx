"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnnouncementTable } from "@/components/announcements/announcement-table";
import { AnnouncementTableSkeleton } from "@/components/announcements/announcement-table-skeleton";
import { CreateAnnouncementDialog } from "@/components/announcements/create-announcement-dialog";
import { EditAnnouncementDialog } from "@/components/announcements/edit-announcement-dialog";
import { DeleteAnnouncementDialog } from "@/components/announcements/delete-announcement-dialog";
import { Plus } from "lucide-react";
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

interface Announcement {
  id: string;
  turfId?: string | null;
  title: string;
  message: string;
  type: AnnouncementType;
  expiresAt?: string | null;
  createdAt: string;
}
enum AnnouncementType {
  GENERAL = "general",
  MAINTENANCE = "maintenance",
  PROMOTION = "promotion",
  CLOSURE = "closure",
  TOURNAMENT = "tournament",
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [hasTurfs, setHasTurfs] = useState<boolean | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Parallel fetch for announcements and turfs check
      const [announcementsRes, turfsRes] = await Promise.all([
        fetchWithAuth(getApiUrl("/announcements"), { headers: getAuthHeaders() }),
        fetchWithAuth(getApiUrl("/turfs/admin/my-turfs"), { headers: getAuthHeaders() })
      ]);

      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data);
      }

      if (turfsRes.ok) {
        const turfsData = await turfsRes.json();
        // Check if data exists and has length
        setHasTurfs(Array.isArray(turfsData.data) && turfsData.data.length > 0);
      } else {
          // If 404/error, assume no turfs or issue
          setHasTurfs(false);
      }

    } catch (error) {
      console.error("[v0] Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
      // Helper for dialog callbacks to refresh only announcements
      try {
        const response = await fetchWithAuth(getApiUrl("/announcements"), {
            headers: getAuthHeaders(),
        });
        if (response.ok) {
            const data = await response.json();
            setAnnouncements(data);
        }
      } catch(e) { console.error(e) }
  }


  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setEditDialogOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  if (!isLoading && hasTurfs === false) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6">
            <div className="bg-muted/30 p-8 rounded-full">
                <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-md">
                <h1 className="text-2xl font-bold">No Venues Registered Yet</h1>
                <p className="text-muted-foreground">
                    You need to register at least one venue (Turf) before you can post announcements.
                </p>
            </div>
            <Button asChild size="lg" className="mt-4">
                <a href="/venues">Create a Venue</a>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage announcements for your users
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </div>
      <Separator className="hidden sm:block" />

      {isLoading ? (
        <AnnouncementTableSkeleton />
      ) : (
        <AnnouncementTable
          announcements={announcements}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CreateAnnouncementDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchAnnouncements}
      />
      <EditAnnouncementDialog
        announcement={selectedAnnouncement}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchAnnouncements}
      />
      <DeleteAnnouncementDialog
        announcement={selectedAnnouncement}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={fetchAnnouncements}
      />
    </div>
  );
}
