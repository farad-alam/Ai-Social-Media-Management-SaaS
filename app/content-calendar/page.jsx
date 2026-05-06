"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"
import { getCalendarPosts } from "@/app/actions/calendar"
import { CalendarDays } from "lucide-react"

export default function ContentCalendarPage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCalendarPosts()
        if (data.posts) {
          setPosts(data.posts)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  return (
    <DashboardLayout>
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
          <CalendarView posts={posts} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
        )}
      </div>
    </DashboardLayout>
  )
}
