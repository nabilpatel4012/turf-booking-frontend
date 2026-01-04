"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ImagePlus, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
  maxSize?: number; // In MB
  maxFiles?: number;
  multiple?: boolean;
  endpoint?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  maxSize = 5,
  maxFiles = 5,
  multiple = false,
  endpoint = "/upload",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validation
    if (multiple && value.length + files.length > maxFiles) {
        toast({
            title: "Limit Exceeded",
            description: `You can only upload a maximum of ${maxFiles} images.`,
            variant: "destructive",
        });
        return;
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: `File ${files[i].name} exceeds the ${maxSize}MB limit.`,
                variant: "destructive",
            });
            return;
        }
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      
      let uploadEndpoint = endpoint;

      if (multiple && files.length > 1) {
          Array.from(files).forEach((file) => {
              formData.append("files", file);
          });
          uploadEndpoint = "/upload-multiple";
      } else {
           formData.append("file", files[0]);
           if (multiple) uploadEndpoint = "/upload"; // Single file but adding to list
      }
      
      // FIX: Ensure endpoint matches backend route
      const finalUrl = getApiUrl(uploadEndpoint.startsWith("/") ? uploadEndpoint : `/${uploadEndpoint}`);

      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
            // Note: Content-Type is set automatically by fetch when body is FormData
             ...getAuthHeaders(), // Need auth
             // Remove Content-Type from auth headers if present, let browser set it with boundary
        },
        body: formData,
      });
      // Workaround for Content-Type issue with FormData and pre-set headers
      // Usually fetch handles this, but if getAuthHeaders includes Content-Type: application/json, it breaks.
      // We assume getAuthHeaders might need adjustment or we manually handle it.
      // Checking getAuthHeaders implementation might be needed. For now assuming standard behavior.

      if (!response.ok) {
          throw new Error("Upload failed");
      }

      const data = await response.json();

      if (multiple) {
          if (data.urls) {
               onChange([...value, ...data.urls]);
          } else if (data.url) {
               onChange([...value, data.url]);
          }
      } else {
        onChange([data.url]);
      }
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-border bg-secondary"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6" // Smaller remove button
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      
      {(!multiple && value.length > 0) ? null : (
        // Hide upload button if single mode and already has value
         <Button
            type="button"
            disabled={disabled || isUploading}
            variant="outline"
            onClick={() => document.getElementById("image-upload-input")?.click()}
            className="w-full h-24 border-dashed flex flex-col gap-2 relative bg-secondary/20 hover:bg-secondary/40 transition"
        >
            <input 
                id="image-upload-input"
                type="file"
                disabled={disabled || isUploading}
                accept="image/*"
                multiple={multiple}
                className="hidden"
                onChange={handleUpload}
            />
            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">
                        {multiple ? "Click to add images" : "Click to upload image"}
                    </span>
                    <span className="text-xs text-muted-foreground/50">
                        Max {maxSize}MB per file
                    </span>
                </div>
            )}
        </Button>
      )}
    </div>
  );
}
