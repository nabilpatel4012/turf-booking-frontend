"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BookingTable } from "@/components/bookings/booking-table";
import { BookingTableSkeleton } from "@/components/bookings/booking-table-skeleton";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { Plus } from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface Booking {
  id: string;
  turfId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

interface BookingsApiResponse {
  success: boolean;
  count: number;
  data: Booking[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(lowercasedQuery) ||
          booking.userId.toLowerCase().includes(lowercasedQuery) ||
          booking.createdBy.toLowerCase().includes(lowercasedQuery)
      );
    }

    return filtered;
  }, [bookings, statusFilter, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, currentPage, rowsPerPage]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("/bookings"), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const result: BookingsApiResponse = await response.json();
        const sortedData = (result.data || []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedData);
      } else {
        console.error("Failed to fetch bookings with status:", response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingCreated = () => {
    fetchBookings();
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bookings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage all turf bookings
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Booking
        </Button>
      </div>

      <Separator className="hidden sm:block" />

      {isLoading ? (
        <BookingTableSkeleton />
      ) : bookings.length > 0 ? (
        <Card className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardContent className="p-0">
            <BookingTable
              bookings={paginatedBookings}
              totalBookings={filteredBookings.length}
              onBookingUpdated={fetchBookings}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardContent className="p-0">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Bookings Yet</h2>
              <p className="text-muted-foreground">
                Click "Create Booking" to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateBookingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleBookingCreated}
      />
    </div>
  );
}
