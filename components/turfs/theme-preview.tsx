"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Star } from "lucide-react";

interface ThemePreviewProps {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    layout: string;
    font?: string;
  };
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  const { primaryColor, secondaryColor, backgroundColor, layout } = theme;

  const containerStyle = {
    backgroundColor: backgroundColor,
    color: isDark(backgroundColor) ? "#ffffff" : "#0f172a",
    fontFamily: theme.font || "inherit",
  };

  const primaryStyle = {
    color: primaryColor,
  };

  const primaryBgStyle = {
    backgroundColor: primaryColor,
    color: isDark(primaryColor) ? "#ffffff" : "#0f172a",
  };
  
  const secondaryStyle = {
    color: secondaryColor,
  };

  // Helper to determine if color is dark (simple version)
  function isDark(color: string) {
    if (!color) return false;
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 <= 186;
  }

  return (
    <Card className="overflow-hidden border-2 h-[600px] w-full relative flex flex-col shadow-xl">
      <div className="bg-muted text-muted-foreground text-xs py-1 px-3 flex items-center justify-between border-b">
        <span>Live Preview</span>
        <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto" style={containerStyle}>
        {/* Navigation Dummy */}
        <div className="p-4 flex justify-between items-center border-b" style={{ borderColor: isDark(backgroundColor) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <div className="font-bold text-lg" style={primaryStyle}>VenueLogo</div>
            <div className="hidden md:flex gap-4 text-sm opacity-80">
                <span>Home</span>
                <span>Facilities</span>
                <span>Book</span>
            </div>
            <div className="h-8 w-8 rounded-full opacity-20" style={{ backgroundColor: secondaryColor }}></div>
        </div>

        {/* Hero Section */}
        <div className={`
            p-8 flex flex-col items-center text-center gap-4
            ${layout === 'hero-focus' ? 'py-20' : 'py-10'}
        `}>
            {layout === 'hero-focus' && (
                 <div className="w-24 h-24 rounded-full mb-4 bg-muted animate-pulse" style={{ backgroundColor: secondaryColor }}></div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold" style={primaryStyle}>
                Premium Sports Arena
            </h1>
            <p className="opacity-80 max-w-md mx-auto">
                Experience world-class facilities for Badminton, Cricket, and Football. Book your slot today!
            </p>
            <Button size="sm" className="mt-2" style={primaryBgStyle}>
                Book Now
            </Button>
        </div>

        {/* Info Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-transparent" style={{ backgroundColor: isDark(backgroundColor) ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-2 mb-2" style={secondaryStyle}>
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-sm">Opening Hours</span>
                </div>
                <p className="text-sm opacity-80">06:00 AM - 11:00 PM</p>
            </div>
             <div className="p-4 rounded-lg border border-transparent" style={{ backgroundColor: isDark(backgroundColor) ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-2 mb-2" style={secondaryStyle}>
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold text-sm">Location</span>
                </div>
                <p className="text-sm opacity-80">123 Sports Complex, Tech City</p>
            </div>
        </div>

        {/* Facilities Grid */}
        <div className="p-4">
            <h3 className="font-bold mb-4 opacity-90">Our Facilities</h3>
             <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video rounded-md bg-muted relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                             <Badge variant="secondary" className="text-[10px] h-5 px-1.5" style={{ backgroundColor: secondaryColor, color: isDark(secondaryColor) ? 'white' : 'black' }}>
                                Court {i}
                             </Badge>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </Card>
  );
}
