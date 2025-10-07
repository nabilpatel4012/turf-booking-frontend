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
  CheckCircle,
  ClipboardCheck,
  Eye,
  Loader2,
  XCircle,
} from "lucide-react";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { CancelBookingDialog } from "./cancel-booking-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Booking } from "@/app/(dashboard)/bookings/page";
import { useToast } from "../ui/use-toast";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

interface BookingTableProps {
  bookings: Booking[];
  totalBookings: number;
  onBookingUpdated: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
}

export function BookingTable({
  bookings,
  totalBookings,
  onBookingUpdated,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            Pending
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleAction = async (
    bookingId: string,
    action: "confirm" | "complete"
  ) => {
    setIsUpdating(bookingId);
    try {
      const response = await fetch(
        getApiUrl(`/bookings/admin/${bookingId}/${action}`),
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} booking`);
      }

      toast({
        title: "Success!",
        description: `Booking has been successfully ${action}ed.`,
      });
      onBookingUpdated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const totalPages = Math.ceil(totalBookings / rowsPerPage);

  return (
    <>
      {/* Mobile-responsive toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border-b sm:border-b border-border">
        <Input
          placeholder="Search by ID, User ID, Name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-sm placeholder:text-sm"
          style={{}}
        />
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-sm">
                    {booking.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{booking.createdBy}</TableCell>
                  <TableCell>
                    {formatDate(booking.date)}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endTime)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{Number.parseFloat(booking.price).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    {isUpdating === booking.id ? (
                      <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction(booking.id, "confirm")}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {(booking.status === "confirmed" ||
                          booking.status === "active") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction(booking.id, "complete")}
                          >
                            <ClipboardCheck className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        {(booking.status === "pending" ||
                          booking.status === "active" ||
                          booking.status === "confirmed") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bookings match your current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3 px-1 py-3">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm">
                    {booking.id.slice(0, 8)}...
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="font-medium">{booking.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium">
                    ₹{Number.parseFloat(booking.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm">{formatDate(booking.date)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(booking.startTime)} -{" "}
                  {formatTime(booking.endTime)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {isUpdating === booking.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {booking.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAction(booking.id, "confirm")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                        Confirm
                      </Button>
                    )}
                    {(booking.status === "confirmed" ||
                      booking.status === "active") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAction(booking.id, "complete")}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-1 text-blue-500" />
                        Complete
                      </Button>
                    )}
                    {(booking.status === "pending" ||
                      booking.status === "active" ||
                      booking.status === "confirmed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setCancelDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No bookings match your current filters.
          </div>
        )}
      </div>

      {/* Mobile-responsive pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border-t sm:border-t border-border">
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Showing {Math.min(rowsPerPage, bookings.length)} of {totalBookings}{" "}
          bookings
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <span className="text-xs sm:text-sm whitespace-nowrap">Rows:</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => onRowsPerPageChange(Number(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-3"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-3"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <>
          <BookingDetailDialog
            booking={selectedBooking}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
          />
          <CancelBookingDialog
            booking={selectedBooking}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onSuccess={onBookingUpdated}
          />
        </>
      )}
    </>
  );
}
