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
          const formattedCameras = devices.map(d => {
            let label = d.label || `Camera ${d.id.slice(0, 5)}...`;
            // Simplify labels
            if (label.toLowerCase().includes("back") || label.toLowerCase().includes("environment")) {
                label = "Back Camera";
                if (devices.length > 2) label += ` (${d.label})`; // Disambiguate if multiple
            } else if (label.toLowerCase().includes("front") || label.toLowerCase().includes("user")) {
                label = "Front Camera";
            }
            return { id: d.id, label };
          });
          
          setCameras(formattedCameras);
          
          // Prefer back camera by default
          const backCamera = formattedCameras.find(c => c.label.includes("Back"));
          setSelectedCamera(backCamera ? backCamera.id : formattedCameras[0].id);
          
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
    // Prevent multiple calls
    if (verifying) return;

    try {
      // Stop scanning immediately
      if (scannerRef.current?.isScanning) {
          await stopScanning();
      }
      
      setVerifying(true);
      toast.info("Verifying QR Code...");

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
      if (data.valid) {
          toast.success("Booking Verified");
      } else {
          toast.error(data.message || "Invalid Booking");
      }
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast.error(error.message || "Failed to verify booking");
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
    if (!file) return;
    
    // Ensure scanner instance exists
    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader", {
            verbose: false,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        });
    }

    setVerifying(true);
    setResult(null);
    setScanning(false);

    // If already scanning via camera, stop it first
    if (scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
             scanImageFile(file);
        }).catch(err => {
             console.error("Failed to stop camera for file scan", err);
             scanImageFile(file); // Try anyway
        });
    } else {
        scanImageFile(file);
    }
    
    // Reset input
    e.target.value = "";
  };

  const scanImageFile = (file: File) => {
      if (!scannerRef.current) return;
      
      scannerRef.current
        .scanFile(file, true)
        .then((decodedText) => {
          onScanSuccess(decodedText);
        })
        .catch((err) => {
          console.error("Error scanning file", err);
          toast.error("Could not find a valid QR code in this image", {
              description: "Please ensure the image is clear and contains a QR code."
          });
          setVerifying(false);
        });
  };

  const handleReset = () => {
    setResult(null);
    startScanning();
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">
             Scan user QR codes or upload an image to verify bookings
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload QR Image
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Scanner
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <Separator />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        <Card className="md:col-span-1 lg:col-span-1 h-fit">
            <CardHeader>
                <CardTitle className="text-lg">Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className={`relative overflow-hidden rounded-lg bg-black aspect-square ${result || verifying ? "hidden" : "block"}`}>
                <div id="reader" className="w-full h-full"></div>
            </div>
            
            {(result || verifying) && (
                 <div className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-300">
                    {verifying ? (
                        <>
                         <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                         <p className="font-medium text-slate-600">Verifying...</p>
                        </>
                    ) : (
                         <>
                            {result?.valid ? (
                                <CheckCircle className="h-16 w-16 text-green-500 mb-3" />
                            ) : (
                                <XCircle className="h-16 w-16 text-destructive mb-3" />
                            )}
                            <p className="font-medium text-slate-900">{result?.message}</p>
                            <Button variant="outline" className="mt-4" onClick={handleReset}>
                                Scan Again
                            </Button>
                         </>
                    )}
                 </div>
            )}

            {!scanning && !verifying && !result && cameras.length > 0 && (
                <Button className="w-full" size="lg" onClick={startScanning}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                </Button>
            )}

            {scanning && (
                 <Button variant="destructive" className="w-full" onClick={stopScanning}>
                    Stop Camera
                </Button>
            )}

             {cameras.length > 0 && (
                <Select
                  value={selectedCamera}
                  onValueChange={(val) => {
                      setSelectedCamera(val);
                      if (scanning) {
                          stopScanning().then(() => {
                              // User must restart manually or we could auto-restart
                              // For simplicity, let them click start
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
            </CardContent>
        </Card>

        {/* Result Details */}
        <Card className="md:col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
                {!result ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <Camera className="h-10 w-10 mb-2 opacity-20" />
                        <p>Scan a QR code to view booking details</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-lg border ${
                            result.valid 
                                ? "bg-green-50 border-green-200 text-green-800" 
                                : "bg-red-50 border-red-200 text-red-800"
                        } flex items-start gap-3`}>
                            {result.valid ? (
                                <CheckCircle className="h-6 w-6 shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h3 className="font-bold text-lg">{result.valid ? "Verified Successfully" : "Verification Failed"}</h3>
                                <p>{result.message}</p>
                            </div>
                        </div>

                        {result.booking && (
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Guest Info</h4>
                                        <p className="text-lg font-semibold">{result.booking.user?.name || "Guest"}</p>
                                        <p className="text-sm">{result.booking.user?.phone || "No phone"}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Schedule</h4>
                                        <p className="font-medium">{result.booking.date}</p>
                                        <p className="text-lg">
                                            {new Date(result.booking.startTime.replace("Z", "")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                            {" - "} 
                                            {new Date(result.booking.endTime.replace("Z", "")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                     <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            {result.booking.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        Payment Details
                                    </h4>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Amount</span>
                                            <span className="font-medium">₹{result.booking.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-green-600">
                                            <span>Paid Amount</span>
                                            <span className="font-bold">₹{result.booking.paidAmount || 0}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg">
                                            <span className="font-medium">Pending Amount</span>
                                            <span className={`font-bold ${
                                                (result.booking.totalAmount - (result.booking.paidAmount || 0)) > 0 
                                                ? "text-red-600" 
                                                : "text-green-600"
                                            }`}>
                                                ₹{result.booking.totalAmount - (result.booking.paidAmount || 0)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {result.paymentStatus && (
                                        <div className={`mt-2 text-center p-2 rounded text-sm font-bold ${
                                            result.paymentStatus === "Paid" 
                                            ? "bg-green-100 text-green-700" 
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                            Status: {result.paymentStatus}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
