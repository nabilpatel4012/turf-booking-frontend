"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Camera,
  MoreVertical,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { fetchWithAuth, get, getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface VerificationResult {
  valid: boolean;
  message: string;
  booking: any;
  paymentStatus?: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize scanner instance
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });
    }

    // Get cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id.slice(0, 5)}...` })));
          setSelectedCamera(devices[0].id);
          setPermissionGranted(true);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
        // toast.error("Camera permission denied or no cameras found");
      });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current || !selectedCamera) return;

    try {
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => onScanSuccess(decodedText),
        (errorMessage) => {
          // ignore failures during scanning
        }
      );
      setScanning(true);
      setResult(null);
    } catch (err) {
      console.error("Error starting scanner", err);
      toast.error("Failed to start camera");
    }
  };

  const stopScanning = async () => {
    if (!scannerRef.current) return;
    try {
        if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
        }
      setScanning(false);
    } catch (err) {
      console.error("Error stopping scanner", err);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (verifying) return;

    try {
      await stopScanning();
      setVerifying(true);

      // Parse URL parameters
      let params = "";
      if (decodedText.includes("?")) {
        params = decodedText.split("?")[1];
      } else {
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

      const response = await fetchWithAuth(
        getApiUrl(`/bookings/verify-qr?turfId=${turfId}&bookingId=${bookingId || ""}&orderId=${orderId || ""}&paymentId=${paymentId || ""}`)
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
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    setVerifying(true);
    setResult(null);
    setScanning(false);

    scannerRef.current
      .scanFile(file, true)
      .then((decodedText) => {
        onScanSuccess(decodedText);
      })
      .catch((err) => {
        console.error("Error scanning file", err);
        toast.error("Could not read QR code from image");
        setVerifying(false);
      });
      
    // Reset input
    e.target.value = "";
  };

  const handleReset = () => {
    setResult(null);
    startScanning();
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">QR Scanner</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
             Scan user QR codes to verify bookings
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Scan Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className="hidden sm:block" />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      <Card>
        <CardContent className="p-6">
          {/* Scanner View */}
          <div className={`${result || verifying ? "hidden" : "block"}`}>
            <div 
                id="reader" 
                className="w-full overflow-hidden rounded-lg bg-black/5 min-h-[300px] mb-4"
            ></div>

            {!permissionGranted && cameras.length === 0 && (
                 <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Requesting camera access...</p>
                 </div>
            )}

            <div className="space-y-4">
              {cameras.length > 0 && (
                <Select
                  value={selectedCamera}
                  onValueChange={(val) => {
                      setSelectedCamera(val);
                      // If scanning, restart with new camera
                      if (scanning) {
                          stopScanning().then(() => {
                              // Small delay to ensure stop completes
                              setTimeout(() => {
                                  // Update selected camera state first
                                  // Then start
                                  // Actually state update is async, so we rely on useEffect or just call start with new val
                                  // But startScanning uses selectedCamera state.
                                  // We can pass val directly to a modified start function or just wait.
                                  // Let's just stop. User has to click start again? 
                                  // Or auto restart.
                              }, 100);
                          });
                      }
                  }}
                  disabled={scanning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {!scanning ? (
                <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={startScanning}
                    disabled={cameras.length === 0}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button 
                    variant="destructive" 
                    className="w-full" 
                    size="lg" 
                    onClick={stopScanning}
                >
                  Stop Scanning
                </Button>
              )}
            </div>
          </div>

          {/* Verifying State */}
          {verifying && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Verifying Booking...</p>
            </div>
          )}

          {/* Result View */}
          {result && (
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
                    <span className="font-medium">
                      {result.booking.user?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">
                      {result.booking.user?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{result.booking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">
                      {new Date(result.booking.startTime.replace("Z", "")).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(result.booking.endTime.replace("Z", "")).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">₹{result.booking.price}</span>
                  </div>
                  {result.paymentStatus && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-muted-foreground">Payment:</span>
                      <span
                        className={`font-bold ${
                          result.paymentStatus === "Paid"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
