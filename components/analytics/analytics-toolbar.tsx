"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Download } from "lucide-react";
import html2canvas from "html2canvas";

interface AnalyticsToolbarProps {
  interval: string;
  setInterval: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}

const intervalLabels: Record<string, string> = {
  "7": "Last 7 Days",
  "30": "Last 30 Days", 
  "90": "Last 3 Months",
  "180": "Last 6 Months",
  "365": "Last Year"
};

export function AnalyticsToolbar({ interval, setInterval, onRefresh, loading, contentRef }: AnalyticsToolbarProps) {
  // Calculate date range for display
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(interval));
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: endDate.getFullYear() !== startDate.getFullYear() ? 'numeric' : undefined
  });

  const handleDownload = async () => {
    if (!contentRef?.current) return;
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatDate(startDate)} — {formatDate(endDate)}
        </p>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-full sm:w-[160px] bg-white">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(intervalLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh} 
          disabled={loading} 
          className="shrink-0 bg-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button 
          size="icon" 
          onClick={handleDownload}
          className="shrink-0 bg-black hover:bg-neutral-800"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
