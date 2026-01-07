import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AnalyticsToolbarProps {
  interval: string;
  setInterval: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function AnalyticsToolbar({ interval, setInterval, onRefresh, loading }: AnalyticsToolbarProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
             Overview of your turf business performance
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
           <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="180">Last 6 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
    
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} className="shrink-0">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="icon" className="shrink-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator className="hidden sm:block my-4" />
    </>
  );
}
