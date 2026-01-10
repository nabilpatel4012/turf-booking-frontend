"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BookingTable } from "@/components/bookings/booking-table";
import { BookingTableSkeleton } from "@/components/bookings/booking-table-skeleton";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { Plus } from "lucide-react";
import { fetchWithAuth, getApiUrl, getAuthHeaders } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface Booking {
  id: string;
  turfId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  createdBy: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  paymentId: string | null;
  orderId: string | null;
  paidAmount: number | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  turfName?: string;
}

interface BookingsApiResponse {
  success: boolean;
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, rowsPerPage, statusFilter, searchQuery]);

  // We don't need client-side filtering/pagination anymore as the API handles it
  // But strictly speaking, the API might not handle SEARCH yet (turfName/user stuff).
  // Checking API: getAdminBookings supports: status, turfId, date, turfName.
  // It does NOT explicitly support generic search string for user details yet.
  // However, the User Objective specifically asks to call API with page/limit.
  
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Build Query Params
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", rowsPerPage.toString());
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      // Basic search support if supported by API (currently API supports turfName ILIKE)
      // If searchQuery looks like a turfName, pass it? 
      // API signature: filters?: { status, turfId, date, turfName, page, limit }
      // For now, let's pass searchQuery as turfName if present, or we might need backend update for generic search.
      // Assuming for now simple integration.
      if (searchQuery) {
          params.append("turfName", searchQuery);
      }

      const response = await fetchWithAuth(getApiUrl(`/bookings/admin/my-bookings?${params.toString()}`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const result: BookingsApiResponse = await response.json();
        setBookings(result.data || []);
        setTotalBookings(result.meta?.total || 0);
      } else {
        console.error("Failed to fetch bookings with status:", response.status);
        setBookings([]);
        setTotalBookings(0);
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
            Manage all bookings
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
              bookings={bookings}
              totalBookings={totalBookings}
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
