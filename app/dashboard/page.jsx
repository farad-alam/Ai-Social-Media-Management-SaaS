"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, TrendingUp, Clock, CheckCircle2, FileEdit, Grid3X3, CalendarDays } from "lucide-react"
import { getDashboardData } from "@/app/actions/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    published: 0,
    scheduled: 0,
    drafts: 0
  })

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardData()
        if (data.posts) {
          setPosts(data.posts)
        }
        if (data.stats) {
          setStats(data.stats)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your Instagram content and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Posts</p>
              <Grid3X3 className="w-5 h-5 text-primary" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold text-card-foreground">{stats.totalPosts}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 font-medium">Lifetime content count</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-green-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Published</p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold text-card-foreground">{stats.published}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 font-medium">Successfully posted</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Scheduled</p>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold text-card-foreground">{stats.scheduled}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 font-medium">Ready for future</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Drafts</p>
              <FileEdit className="w-5 h-5 text-orange-500" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold text-card-foreground">{stats.drafts}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 font-medium">Awaiting completion</p>
          </Card>
        </div>


        {/* Content Calendar CTA */}
        <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Content Calendar</p>
              <p className="text-xs text-muted-foreground">View your full posting schedule</p>
            </div>
          </div>
          <Link href="/content-calendar">
            <Button variant="outline" className="border-border text-foreground bg-transparent">
              Open Calendar
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
