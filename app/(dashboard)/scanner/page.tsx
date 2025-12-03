"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { get } from "@/lib/api";
import { toast } from "sonner";

interface VerificationResult {
  valid: boolean;
  message: string;
  booking: any;
  paymentStatus?: string;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner only if we are in scanning mode and haven't initialized yet
    if (scanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    if (verifying) return; // Prevent multiple calls

    try {
      // Pause scanning
      if (scannerRef.current) {
        scannerRef.current.pause();
      }
      
      setVerifying(true);
      setScanning(false); // Switch to result view

      // Parse URL parameters
      // Expected URL: BASE_URL/bookings/verify-qr?bookingId=...&turfId=...
      // We can just extract the query parameters part
      let params = "";
      if (decodedText.includes("?")) {
        params = decodedText.split("?")[1];
      } else {
        // Fallback if it's just the params string
        params = decodedText;
      }

      const searchParams = new URLSearchParams(params);
      const bookingId = searchParams.get("bookingId");
      const turfId = searchParams.get("turfId");
      const orderId = searchParams.get("orderId");
      const paymentId = searchParams.get("paymentId");

      if (!turfId) {
        throw new Error("Invalid QR Code: Missing Turf ID");
      }

      // Call Verification API
      const response = await get(
        `/bookings/verify-qr?turfId=${turfId}&bookingId=${bookingId || ""}&orderId=${orderId || ""}&paymentId=${paymentId || ""}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
      }

      const data = await response.json();
      setResult(data);
      
    } catch (error: any) {
      console.error("Verification Error:", error);
      setResult({
        valid: false,
        message: error.message || "Failed to verify booking",
        booking: null,
      });
    } finally {
      setVerifying(false);
      // Clear scanner instance so it can be re-initialized if needed
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleReset = () => {
    setResult(null);
    setScanning(true);
    setVerifying(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">QR Scanner</h1>

      <Card>
        <CardContent className="p-6">
          {scanning ? (
            <div className="flex flex-col items-center">
              <div id="reader" className="w-full"></div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Point your camera at the booking QR code
              </p>
            </div>
          ) : verifying ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Verifying Booking...</p>
            </div>
          ) : result ? (
            <div className="flex flex-col items-center text-center space-y-6">
              {result.valid ? (
                result.paymentStatus === "Pending" ? (
                   <div className="flex flex-col items-center text-yellow-500">
                    <AlertTriangle className="h-16 w-16 mb-2" />
                    <h2 className="text-2xl font-bold">Payment Pending</h2>
                    <p className="text-muted-foreground">{result.message}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-green-500">
                    <CheckCircle className="h-16 w-16 mb-2" />
                    <h2 className="text-2xl font-bold">Access Granted</h2>
                    <p className="text-muted-foreground">{result.message}</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center text-destructive">
                  <XCircle className="h-16 w-16 mb-2" />
                  <h2 className="text-2xl font-bold">Access Denied</h2>
                  <p className="text-muted-foreground">{result.message}</p>
                </div>
              )}

              {result.booking && (
                <div className="w-full bg-muted p-4 rounded-lg text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest:</span>
                    <span className="font-medium">{result.booking.user?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{result.booking.user?.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{result.booking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">
                        {new Date(result.booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(result.booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">₹{result.booking.price}</span>
                  </div>
                   {result.paymentStatus && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-muted-foreground">Payment:</span>
                        <span className={`font-bold ${result.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {result.paymentStatus}
                        </span>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleReset} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Another
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
