"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// FIX: Props interface updated to remove search-related props
interface BookingFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function BookingFilters({
  statusFilter,
  onStatusFilterChange,
}: BookingFiltersProps) {
  return (
    // FIX: Removed the search input and its wrapper div
    <div className="flex">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {/* ADDED: Option for "pending" status */}
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
