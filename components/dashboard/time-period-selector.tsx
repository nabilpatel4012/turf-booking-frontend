"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimePeriodSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function TimePeriodSelector({ value, onValueChange }: TimePeriodSelectorProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="last7Days">Last 7 Days</TabsTrigger>
        <TabsTrigger value="currentWeek">This Week</TabsTrigger>
        <TabsTrigger value="last5Weeks">Last 5 Weeks</TabsTrigger>
        <TabsTrigger value="thisMonth">This Month</TabsTrigger>
        <TabsTrigger value="thisYear">This Year</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
