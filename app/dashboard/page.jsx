"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Heart, MessageCircle, TrendingUp } from "lucide-react"
import { getDashboardData } from "@/app/actions/dashboard"

// Mock calendar data
const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
const currentMonth = "January 2024"

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState("month")
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    engagement: "0",
    comments: "0",
    scheduled: 0
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">{stats.totalPosts}</p>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Engagement</p>
              <Heart className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">{stats.engagement}</p>
            <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Comments</p>
              <MessageCircle className="w-4 h-4 text-chart-3" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">{stats.comments}</p>
            <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <Clock className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground mt-1">Posts this month</p>
          </Card>
        </div>

        {/* Calendar Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-card-foreground">Content Calendar</h2>
          </div>
          <CalendarView posts={posts} />
        </div>

        {/* Scheduled Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent & Upcoming Posts</h2>
            <Button variant="outline" className="border-border text-foreground bg-transparent">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p>Loading posts...</p> : posts.length === 0 ? <p className="text-muted-foreground">No posts yet.</p> : posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-square relative">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-card-foreground mb-3 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{post.scheduledFor}</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {post.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
