"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { getAppData } from "@/app/actions/app-data"

const AppDataContext = createContext(null)

/**
 * Single source of truth for posts, account info, and computed stats.
 * Wraps all dashboard pages. Any CRUD mutation calls refresh() to sync everything.
 */
export function AppDataProvider({ children }) {
  const [posts, setPosts] = useState([])
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const data = await getAppData()
      if (data.posts) setPosts(data.posts)
      if (data.account !== undefined) setAccount(data.account)
    } catch (e) {
      console.error("AppDataProvider fetch error:", e)
    } finally {
      setLoading(false)
      setInitialLoadDone(true)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refresh function — called after any CRUD operation
  const refresh = useCallback(async () => {
    // Don't show full loading spinner for refreshes, just silently update
    try {
      const data = await getAppData()
      if (data.posts) setPosts(data.posts)
      if (data.account !== undefined) setAccount(data.account)
    } catch (e) {
      console.error("AppDataProvider refresh error:", e)
    }
  }, [])

  // Compute stats client-side from the posts array — zero DB queries
  const stats = useMemo(() => {
    const totalPosts = posts.length
    const published = posts.filter(p => p.status === 'PUBLISHED').length
    const scheduled = posts.filter(p => p.status === 'SCHEDULED').length
    const drafts = posts.filter(p => p.status === 'DRAFT').length
    const failed = posts.filter(p => p.status === 'FAILED').length
    return { totalPosts, published, scheduled, drafts, failed }
  }, [posts])

  // Upcoming scheduled posts (next 5, sorted by scheduledAt ascending)
  const upcomingPosts = useMemo(() => {
    const now = new Date()
    return posts
      .filter(p => p.status === 'SCHEDULED' && p.scheduledAt && new Date(p.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 5)
  }, [posts])

  const value = useMemo(() => ({
    posts,
    account,
    stats,
    upcomingPosts,
    loading,
    initialLoadDone,
    refresh,
  }), [posts, account, stats, upcomingPosts, loading, initialLoadDone, refresh])

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  )
}

/**
 * Hook to consume app data from any dashboard page.
 * Returns { posts, account, stats, upcomingPosts, loading, refresh }
 */
export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }
  return context
}
