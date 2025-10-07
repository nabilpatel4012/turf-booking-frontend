import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/app/(dashboard)/bookings/page";

interface BookingDetailDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
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
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm mt-1">{booking.userId}</p>
            </div>
            {/* ADDED: Display creator's name */}
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="mt-1 font-medium">{booking.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Turf ID</p>
              <p className="font-mono text-sm mt-1">{booking.turfId}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-3">Booking Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="mt-1">{formatDate(booking.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="mt-1">
                  {formatTime(booking.startTime)} -{" "}
                  {formatTime(booking.endTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="mt-1 font-semibold text-lg">
                  ₹{Number.parseFloat(booking.price).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="mt-1">{formatDate(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="mt-1">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* ADDED: Cancellation details section */}
          {booking.status === "cancelled" && (
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3 text-destructive">
                Cancellation Details
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled At</p>
                  <p className="mt-1">
                    {formatDate(
                      booking.cancelledAt ? booking.cancelledAt : "-"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="mt-1">
                    {booking.cancellationReason || "No reason provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
