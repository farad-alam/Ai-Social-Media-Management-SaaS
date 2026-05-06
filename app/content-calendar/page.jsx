"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"
import { AppDataProvider, useAppData } from "@/contexts/app-data-context"
import { CalendarDays } from "lucide-react"

export default function ContentCalendarPage() {
  return (
    <DashboardLayout>
      <AppDataProvider>
        <CalendarContent />
      </AppDataProvider>
    </DashboardLayout>
  )
}

function CalendarContent() {
  const { posts, loading, refresh } = useAppData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Calendar</h1>
          <p className="text-muted-foreground">Visualize and manage your scheduled posts</p>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <Skeleton className="h-[700px] w-full rounded-xl" />
      ) : (
        <CalendarView posts={posts} onRefresh={refresh} />
      )}
    </div>
  )
}
