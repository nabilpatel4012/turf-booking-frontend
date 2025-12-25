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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(getApiUrl("/announcements"), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setEditDialogOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
