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
  }, [open, booking.userId, booking.turfId]);

  const fetchAdditionalData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userResponse = await fetchWithAuth(
        getApiUrl(`/users/${booking.userId}`)
      );
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserData(userData.data || userData);
      }

      // Fetch turf data
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
    return new Date(timeString).toLocaleTimeString("en-IN", {
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
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono text-sm mt-1">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="mt-1 font-medium">{booking.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="mt-1 text-sm">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
            </div>

            {/* User Information */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">User Information</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm mt-1">{booking.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="mt-1 font-medium">
                    {userData?.name || "Loading..."}
                  </p>
                </div>
                {userData?.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm">{userData.email}</p>
                  </div>
                )}
                {userData?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm">{userData.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Turf Information */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Turf Information</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Turf ID</p>
                  <p className="font-mono text-sm mt-1">{booking.turfId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Turf Name</p>
                  <p className="mt-1 font-medium">
                    {turfData?.name || "Loading..."}
                  </p>
                </div>
                {turfData?.location && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="mt-1 text-sm">{turfData.location}</p>
                  </div>
                )}
                {turfData?.pricePerHour && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Price per Hour
                    </p>
                    <p className="mt-1 text-sm">
                      ₹
                      {Number.parseFloat(turfData.pricePerHour).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Information */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Booking Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="mt-1">{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Slot</p>
                  <p className="mt-1">
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="mt-1 font-semibold text-lg">
                    ₹{Number.parseFloat(booking.price).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="mt-1 text-sm">
                    {formatDateTime(booking.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {(booking.orderId || booking.paymentId) && (
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {booking.orderId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm mt-1">
                        {booking.orderId}
                      </p>
                    </div>
                  )}
                  {booking.paymentId && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment ID
                      </p>
                      <p className="font-mono text-sm mt-1">
                        {booking.paymentId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Status
                    </p>
                    <p className="mt-1">
                      {booking.paymentId ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-500">
                          Pending
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation Details */}
            {booking.status === "cancelled" && (
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-3 text-destructive">
                  Cancellation Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Cancelled At
                    </p>
                    <p className="mt-1 text-sm">
                      {booking.cancelledAt
                        ? formatDateTime(booking.cancelledAt)
                        : "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="mt-1">
                      {booking.cancellationReason || "No reason provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
