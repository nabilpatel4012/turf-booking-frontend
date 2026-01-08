"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Download, BarChart3 } from "lucide-react";

interface AnalyticsToolbarProps {
  interval: string;
  setInterval: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const intervalLabels: Record<string, string> = {
  "7": "Last 7 Days",
  "30": "Last 30 Days", 
  "90": "Last 3 Months",
  "180": "Last 6 Months",
  "365": "Last Year"
};

export function AnalyticsToolbar({ interval, setInterval, onRefresh, loading }: AnalyticsToolbarProps) {
  // Calculate date range for display
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(interval));
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: endDate.getFullYear() !== startDate.getFullYear() ? 'numeric' : undefined
  });

  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Analytics
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {formatDate(startDate)} — {formatDate(endDate)}
            </p>
          </div>
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
          
          <Button size="icon" className="shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
