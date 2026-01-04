"use client";

export const runtime = "edge";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Loader2, Undo2 } from "lucide-react";
import { getApiUrl, getAuthHeaders, fetchWithAuth } from "@/lib/api";
import { ThemePreview } from "@/components/turfs/theme-preview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const THEME_PRESETS = {
  modern: { primary: "#0f172a", secondary: "#3b82f6", bg: "#ffffff" },
  classic: { primary: "#1e293b", secondary: "#e2e8f0", bg: "#f8fafc" },
  vibrant: { primary: "#7c3aed", secondary: "#f472b6", bg: "#fff1f2" },
  dark: { primary: "#000000", secondary: "#22d3ee", bg: "#0f172a" },
  minimal: { primary: "#333333", secondary: "#999999", bg: "#ffffff" },
};

interface VenueTheme {
  id?: string;
  preset: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  layout: string;
  font?: string;
}

export default function VenueThemePage({ params }: { params: Promise<{ id: string }> }) {
  // Utility for React 19 unwrapping of params
  const { id } = use(params);
  
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [theme, setTheme] = useState<VenueTheme>({
    preset: "modern",
    primaryColor: "#0f172a",
    secondaryColor: "#3b82f6",
    backgroundColor: "#ffffff",
    layout: "default",
  });

  // Keep track of dirty state to show unsaved changes warning potentially
  const [originalTheme, setOriginalTheme] = useState<VenueTheme | null>(null);

  useEffect(() => {
    fetchTheme();
  }, [id]);

  const fetchTheme = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth(getApiUrl(`/turfs/admin/${id}/theme`), {
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const loadedTheme = {
             preset: json.data.preset || "modern",
             primaryColor: json.data.primaryColor || "#0f172a",
             secondaryColor: json.data.secondaryColor || "#3b82f6",
             backgroundColor: json.data.backgroundColor || "#ffffff",
             layout: json.data.layout || "default",
             font: json.data.font
          };
          setTheme(loadedTheme);
          setOriginalTheme(loadedTheme);
        }
      }
    } catch (error) {
      console.error("Failed to fetch theme:", error);
      toast({
        title: "Error",
        description: "Failed to load current theme settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetChange = (preset: string) => {
    const presetTheme = THEME_PRESETS[preset as keyof typeof THEME_PRESETS];
    if (presetTheme) {
      setTheme((prev) => ({
        ...prev,
        preset,
        primaryColor: presetTheme.primary,
        secondaryColor: presetTheme.secondary,
        backgroundColor: presetTheme.bg,
      }));
    }
  };

  const handleColorChange = (key: keyof VenueTheme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const saveTheme = async () => {
    try {
      setIsSaving(true);
      const res = await fetchWithAuth(getApiUrl(`/turfs/admin/${id}/theme`), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(theme),
      });

      if (!res.ok) {
        throw new Error("Failed to save theme");
      }

      const json = await res.json();
      setOriginalTheme(json.data);
      toast({
        title: "Success",
        description: "Venue theme updated successfully!",
      });
    } catch (error) {
        console.error(error);
      toast({
        title: "Error",
        description: "Failed to save theme settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Theme Customization</h1>
                    <p className="text-muted-foreground text-sm">Customize the look and feel of your venue homepage.</p>
                </div>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={() => fetchTheme()} disabled={isSaving}>
                    <Undo2 className="w-4 h-4 mr-2" />
                    Reset
                 </Button>
                 <Button onClick={saveTheme} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                 </Button>
            </div>
        </div>

        {/* Content Layout: Left Controls, Right Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
            
            {/* Controls Panel */}
            <div className="lg:col-span-4 overflow-y-auto pr-2 pb-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Configure your venue's appearance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        {/* Presets */}
                        <div className="space-y-3">
                            <Label>Theme Preset</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(THEME_PRESETS).map((preset) => (
                                    <div 
                                        key={preset}
                                        onClick={() => handlePresetChange(preset)}
                                        className={`
                                            cursor-pointer rounded-md border-2 p-2 flex items-center justify-between hover:bg-muted/50 transition-all
                                            ${theme.preset === preset ? "border-primary bg-primary/5" : "border-transparent bg-muted"}
                                        `}
                                    >
                                        <span className="capitalize text-sm font-medium">{preset}</span>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME_PRESETS[preset as keyof typeof THEME_PRESETS].primary }}></div>
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME_PRESETS[preset as keyof typeof THEME_PRESETS].secondary }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Colors */}
                        <div className="space-y-4">
                            <Label>Colors</Label>
                            
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Primary Brand Color</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="color" 
                                            className="h-10 w-14 p-1 cursor-pointer"
                                            value={theme.primaryColor}
                                            onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                                        />
                                        <Input 
                                            className="font-mono text-sm uppercase" 
                                            value={theme.primaryColor} 
                                            onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Secondary / Accent Color</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="color" 
                                            className="h-10 w-14 p-1 cursor-pointer"
                                            value={theme.secondaryColor}
                                            onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                                        />
                                        <Input 
                                            className="font-mono text-sm uppercase" 
                                            value={theme.secondaryColor} 
                                            onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Background Color</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="color" 
                                            className="h-10 w-14 p-1 cursor-pointer"
                                            value={theme.backgroundColor}
                                            onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                                        />
                                        <Input 
                                            className="font-mono text-sm uppercase" 
                                            value={theme.backgroundColor} 
                                            onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Layout */}
                        <div className="space-y-3">
                            <Label>Layout Style</Label>
                            <Select 
                                value={theme.layout} 
                                onValueChange={(val) => setTheme({...theme, layout: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default Balanced</SelectItem>
                                    <SelectItem value="hero-focus">Hero Focus (Centered)</SelectItem>
                                    <SelectItem value="grid-view">Grid Heavy</SelectItem>
                                    <SelectItem value="minimal">Minimal List</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Controls how information and grid items are structured on the page.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mobile Preview</h3>
                    <span className="text-xs text-muted-foreground">iPhone 14 Pro Frame</span>
                </div>
                <div className="flex-1 flex justify-center items-start overflow-hidden bg-muted/20 rounded-xl p-8 border border-dashed border-border">
                     <div className="w-[375px] shrink-0 origin-top scale-[0.85] md:scale-100 transition-transform">
                        <ThemePreview theme={theme} />
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
}
