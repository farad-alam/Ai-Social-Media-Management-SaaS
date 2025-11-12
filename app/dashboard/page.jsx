"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Heart, MessageCircle, TrendingUp } from "lucide-react"

// Mock data for scheduled posts
const scheduledPosts = [
  {
    id: 1,
    image: "/instagram-fashion-post.png",
    caption: "New collection dropping soon! Stay tuned for exclusive designs.",
    scheduledFor: "2024-01-15 10:00 AM",
    status: "scheduled",
  },
  {
    id: 2,
    image: "/instagram-food-post.png",
    caption: "Delicious brunch ideas for your weekend. Which one would you try?",
    scheduledFor: "2024-01-16 2:00 PM",
    status: "scheduled",
  },
  {
    id: 3,
    image: "/instagram-post-travel.jpg",
    caption: "Exploring hidden gems around the world. Where should we go next?",
    scheduledFor: "2024-01-17 6:00 PM",
    status: "scheduled",
  },
]

// Mock calendar data
const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
const currentMonth = "January 2024"

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState("month")

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
            <p className="text-3xl font-bold text-card-foreground">127</p>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Engagement</p>
              <Heart className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">8.4K</p>
            <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Comments</p>
              <MessageCircle className="w-4 h-4 text-chart-3" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">1.2K</p>
            <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <Clock className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">15</p>
            <p className="text-xs text-muted-foreground mt-1">Posts this month</p>
          </Card>
        </div>

        {/* Calendar Section */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">Content Calendar</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={viewMode === "month" ? "bg-primary text-primary-foreground" : ""}
                >
                  Month
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={viewMode === "week" ? "bg-primary text-primary-foreground" : ""}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className={viewMode === "day" ? "bg-primary text-primary-foreground" : ""}
                >
                  Day
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-card-foreground">{currentMonth}</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="border-border bg-transparent">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-border bg-transparent">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => (
              <div
                key={day}
                className="aspect-square border border-border rounded-lg p-2 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="text-sm text-card-foreground">{day}</div>
                {day === 15 && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                )}
                {day === 16 && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Scheduled Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Posts</h2>
            <Button variant="outline" className="border-border text-foreground bg-transparent">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledPosts.map((post) => (
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
