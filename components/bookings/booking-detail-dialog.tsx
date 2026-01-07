import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/app/(dashboard)/bookings/page";
import { fetchWithAuth, getApiUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface BookingDetailDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface TurfData {
  id: string;
  name: string;
  location: string;
  pricePerHour: string;
}

// Helper function for status badges to avoid repeating logic
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 capitalize">
          Pending
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 capitalize">
          Confirmed
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 capitalize">
          Active
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 capitalize">
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 capitalize">
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="capitalize">
          {status}
        </Badge>
      );
  }
};

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [turfData, setTurfData] = useState<TurfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAdditionalData();
    }
  }, [open, booking.turfId]);

  const fetchAdditionalData = async () => {
    setLoading(true);
    try {
      // Fetch turf data for location and price details which are not in the booking view
      const turfResponse = await fetchWithAuth(
        getApiUrl(`/turfs/${booking.turfId}`)
      );
      if (turfResponse.ok) {
        const turfData = await turfResponse.json();
        setTurfData(turfData.data || turfData);
      }
    } catch (error) {
      console.error("Error fetching additional data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatTime = (timeString: string) => {
    // Strip 'Z' to treat the time as local wall time, fixing the +5:30 double conversion issue
    const localTimeString = timeString.endsWith("Z") ? timeString.slice(0, -1) : timeString;
    return new Date(localTimeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">

            {/* Header: Status & Main Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.turfName || turfData?.name || "Turf Booking"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(booking.date)} • {formatTime(booking.startTime)}{" "}
                    - {formatTime(booking.endTime)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(booking.status)}
                  <span className="text-xs text-muted-foreground font-mono">
                    #{booking.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  User Details
                </h4>
                <div className="bg-muted/30 p-3 rounded-md space-y-2">
                  <div>
                    <p className="font-medium">
                      {booking.userName || "Guest User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.userPhone || "No phone provided"}
                    </p>
                    {booking.userEmail && (
                      <p className="text-sm text-muted-foreground">
                        {booking.userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Payment
                </h4>
                <div className="bg-muted/30 p-3 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid Amount</span>
                    <span className="font-bold text-lg text-green-600">
                      ₹
                      {Number.parseFloat(String(booking.paidAmount || 0)).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Amount</span>
                    <span className="font-bold text-lg">
                      ₹
                      {booking.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status</span>
                    {booking.paymentId ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50"
                      >
                        Paid
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 bg-yellow-50"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                  {booking.paymentId && (
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <p className="text-xs text-muted-foreground">
                        Payment ID:{" "}
                        <span className="font-mono">{booking.paymentId}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info / Cancellation */}
            {(booking.status === "cancelled" || turfData?.location) && (
              <div className="space-y-3 border-t pt-4">
                {booking.status === "cancelled" && (
                  <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    <h4 className="text-sm font-medium text-destructive mb-1">
                      Cancellation Info
                    </h4>
                    <p className="text-sm">
                      <span className="font-medium">Reason:</span>{" "}
                      {booking.cancellationReason || "No reason provided"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cancelled at:{" "}
                      {booking.cancelledAt
                        ? formatDateTime(booking.cancelledAt)
                        : "-"}
                    </p>
                  </div>
                )}

                {turfData?.location && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Turf Location
                    </h4>
                    <p className="text-sm">{turfData.location}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
