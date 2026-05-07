"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppData } from "@/contexts/app-data-context"
import {
  Clock, CheckCircle2, FileEdit, Grid3X3, CalendarDays,
  Instagram, AlertTriangle, Film, ImageIcon, Layers,
  BookImage, ArrowRight, User, Hash, ExternalLink, Sparkles
} from "lucide-react"

const mediaTypeIcon = (type) => {
  if (type === 'REEL') return <Film className="w-3.5 h-3.5" />
  if (type === 'CAROUSEL') return <Layers className="w-3.5 h-3.5" />
  if (type === 'STORY') return <BookImage className="w-3.5 h-3.5" />
  return <ImageIcon className="w-3.5 h-3.5" />
}

function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diff = new Date(isoString) - new Date()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `in ${days}d ${hours % 24}h`
  if (hours > 0) return `in ${hours}h ${mins % 60}m`
  if (mins > 0) return `in ${mins}m`
  return 'very soon'
}

function StatCard({ label, value, icon, colorClass, subtext, loading }) {
  return (
    <Card className={`p-5 bg-card border-border transition-colors hover:border-opacity-70 ${colorClass}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-9 w-16 mb-1" />
      ) : (
        <p className="text-4xl font-bold text-card-foreground leading-none">{value}</p>
      )}
      <p className="text-xs text-muted-foreground mt-2 font-medium">{subtext}</p>
    </Card>
  )
}

export default function DashboardPage() {
  const { stats, upcomingPosts, account, loading } = useAppData()

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your content overview at a glance</p>
        </div>
      </div>

      {/* ── Section 1: Posting Summary ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-primary" /> Posting Summary
          </h2>
          <Link href="/all-posts">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs hover:text-foreground">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Total" value={stats.totalPosts} loading={loading}
            icon={<Grid3X3 className="w-4 h-4 text-primary" />}
            colorClass="hover:border-primary/50"
            subtext="All time"
          />
          <StatCard
            label="Published" value={stats.published} loading={loading}
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            colorClass="hover:border-green-500/50"
            subtext="Successfully posted"
          />
          <StatCard
            label="Scheduled" value={stats.scheduled} loading={loading}
            icon={<Clock className="w-4 h-4 text-blue-500" />}
            colorClass="hover:border-blue-500/50"
            subtext="Queued up"
          />
          <StatCard
            label="Drafts" value={stats.drafts} loading={loading}
            icon={<FileEdit className="w-4 h-4 text-orange-400" />}
            colorClass="hover:border-orange-400/50"
            subtext="In progress"
          />
          <StatCard
            label="Failed" value={stats.failed} loading={loading}
            icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
            colorClass="hover:border-red-500/50"
            subtext="Need attention"
          />
        </div>
      </section>

      {/* ── Section 2: Content Scheduling ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Upcoming Scheduled Posts
          </h2>
          <Link href="/content-calendar">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs hover:text-foreground">
              Open Calendar <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : upcomingPosts.length === 0 ? (
          <Card className="p-8 border-dashed border-border bg-card flex flex-col items-center justify-center gap-3 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">No upcoming posts scheduled</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Schedule a post to see it here</p>
            </div>
            <Link href="/create">
              <Button size="sm" className="mt-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Create & Schedule
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingPosts.map((post) => (
              <Card key={post.id} className="flex items-center gap-4 p-4 border-border bg-card hover:border-primary/40 transition-colors">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                  {post.image ? (
                    post.image.endsWith('.mp4') ? (
                      <video src={post.image} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <Image src={post.image} alt="thumb" fill className="object-cover" unoptimized />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {mediaTypeIcon(post.mediaType)}
                    </div>
                  )}
                </div>

                {/* Caption + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-snug">
                    {post.caption || "(No caption)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {post.scheduledAt
                      ? new Date(post.scheduledAt).toLocaleString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })
                      : '—'}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-[10px] flex items-center gap-1 capitalize">
                    {mediaTypeIcon(post.mediaType)}
                    {post.mediaType.charAt(0) + post.mediaType.slice(1).toLowerCase()}
                  </Badge>
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {formatRelativeTime(post.scheduledAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Account Details ── */}
      <section>
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <Instagram className="w-4 h-4 text-primary" /> Connected Account
        </h2>

        {loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : account ? (
          <Card className="p-5 border-border bg-card">
            <div className="flex items-center gap-4">
              {/* Profile pic */}
              <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0 relative border-2 border-primary/30">
                {account.picture ? (
                  <Image src={account.picture} alt={account.username} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Account info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-foreground">@{account.username}</p>
                  <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[10px]">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash className="w-3 h-3" /> ID: {account.instagramId}
                  </span>
                </div>
              </div>

              {/* Action */}
              <Link href="/connect-instagram" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs border-border text-foreground bg-transparent">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Manage
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-dashed border-border bg-card flex flex-col items-center justify-center gap-3 text-center">
            <Instagram className="w-8 h-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">No Instagram account connected</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Connect your account to start scheduling</p>
            </div>
            <Link href="/connect-instagram">
              <Button size="sm" className="mt-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Connect Instagram
              </Button>
            </Link>
          </Card>
        )}
      </section>

    </div>
  )
}
