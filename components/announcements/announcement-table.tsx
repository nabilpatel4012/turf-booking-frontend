"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit, Trash2, Eye } from "lucide-react";

interface Announcement {
  id: string;
  turfId?: string | null;
  title: string;
  message: string;
  type: AnnouncementType;
  expiresAt?: string | null;
  createdAt: string;
  turf?: any;
}

enum AnnouncementType {
  GENERAL = "general",
  MAINTENANCE = "maintenance",
  PROMOTION = "promotion",
  CLOSURE = "closure",
  TOURNAMENT = "tournament",
}

interface AnnouncementTableProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}

export function AnnouncementTable({
  announcements,
  onEdit,
  onDelete,
}: AnnouncementTableProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isActive = (expiresAt: string | null | undefined): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) > new Date();
  };

  const getTypeColor = (type: AnnouncementType) => {
    const colors = {
      [AnnouncementType.GENERAL]: "bg-blue-500/10 text-blue-500",
      [AnnouncementType.MAINTENANCE]: "bg-orange-500/10 text-orange-500",
      [AnnouncementType.PROMOTION]: "bg-purple-500/10 text-purple-500",
      [AnnouncementType.CLOSURE]: "bg-red-500/10 text-red-500",
      [AnnouncementType.TOURNAMENT]: "bg-green-500/10 text-green-500",
    };
    return colors[type] || "";
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Turf ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground h-24"
                >
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => {
                const isActuallyActive =
                  announcement.expiresAt === null
                    ? true
                    : isActive(announcement.expiresAt);
                return (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getTypeColor(announcement.type)}
                      >
                        {announcement.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {announcement.turfId || "All Turfs"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isActuallyActive ? "default" : "secondary"}
                        className={
                          isActuallyActive
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                        }
                      >
                        {isActuallyActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(announcement.createdAt)}</TableCell>
                    <TableCell>
                      {announcement.expiresAt
                        ? formatDate(announcement.expiresAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAnnouncement(announcement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(announcement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(announcement)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/5">
            No announcements found
          </div>
        ) : (
          announcements.map((announcement) => {
            const isActuallyActive =
              announcement.expiresAt === null
                ? true
                : isActive(announcement.expiresAt);
            
            return (
              <div 
                key={announcement.id} 
                className="border border-border rounded-lg p-4 space-y-3 bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold line-clamp-1">{announcement.title}</h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getTypeColor(announcement.type)}`}
                    >
                      {announcement.type}
                    </Badge>
                  </div>
                  <Badge
                    variant={isActuallyActive ? "default" : "secondary"}
                    className={
                      isActuallyActive
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 whitespace-nowrap"
                        : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 whitespace-nowrap"
                    }
                  >
                    {isActuallyActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Turf</p>
                    <p className="font-medium truncate">{announcement.turfId || "All Turfs"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className="font-medium">
                       {announcement.expiresAt
                        ? formatDate(announcement.expiresAt)
                        : "Never"}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 flex gap-2">
                   <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedAnnouncement(announcement)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEdit(announcement)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(announcement)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={!!selectedAnnouncement}
        onOpenChange={() => setSelectedAnnouncement(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>Announcement Details</DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type
                  </p>
                  <Badge
                    variant="secondary"
                    className={getTypeColor(selectedAnnouncement.type)}
                  >
                    {selectedAnnouncement.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={
                      isActive(selectedAnnouncement.expiresAt)
                        ? "default"
                        : "secondary"
                    }
                    className={
                      isActive(selectedAnnouncement.expiresAt)
                        ? "bg-green-500/10 text-green-500"
                        : "bg-gray-500/10 text-gray-500"
                    }
                  >
                    {isActive(selectedAnnouncement.expiresAt)
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Turf ID
                  </p>
                  <p className="text-sm">
                    {selectedAnnouncement.turfId || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Announcement ID
                  </p>
                  <p className="text-sm font-mono text-xs">
                    {selectedAnnouncement.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm">
                    {formatDate(selectedAnnouncement.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expires At
                  </p>
                  <p className="text-sm">
                    {selectedAnnouncement.expiresAt
                      ? formatDate(selectedAnnouncement.expiresAt)
                      : "No expiration"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Message
                </p>
                <p className="text-sm bg-muted p-4 rounded-md">
                  {selectedAnnouncement.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
