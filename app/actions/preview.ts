'use server'

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { InstagramClient } from "@/lib/instagram"

export async function getPreviewData() {
    const { userId } = await auth()
    if (!userId) {
        return { error: "Unauthorized" }
    }

    try {
        // 1. Get Connected Account
        // Schema doesn't have 'provider', so we just find the account for this user.
        // Assuming the Account model is primarily for Instagram for now.
        const account = await prisma.account.findFirst({
            where: {
                userId,
            },
        })

        // 2. Fetch Live Posts from Instagram (if connected)
        let livePosts = []
        let profile = null
        let isConnected = false

        if (account) {
            isConnected = true
            try {
                // Need to get current page token to make sure it's valid.
                // We use the stored long-lived token.
                const igPosts = await InstagramClient.getInstagramPosts(account.instagramId, account.accessToken)

                // Map to unified format
                livePosts = igPosts.map((post: any) => ({
                    id: post.id,
                    type: post.media_type, // IMAGE, VIDEO, CAROUSEL_ALBUM
                    url: post.media_url || post.thumbnail_url,
                    caption: post.caption,
                    permalink: post.permalink,
                    timestamp: post.timestamp,
                    isScheduled: false,
                    children: post.children
                }))

                // Fetch Profile Info for Header
                const details = await InstagramClient.getInstagramUserDetails(account.instagramId, account.accessToken)
                profile = details

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                console.error(`Failed to fetch live posts: ${errorMessage}`);
                // We'll proceed without live posts if this fails, but keep isConnected=true or handle error gracefully
            }
        }

        // 3. Fetch Scheduled Posts from DB
        const scheduledPostsRaw = await prisma.post.findMany({
            where: {
                userId,
                status: 'SCHEDULED',
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        })

        // Map to unified format
        const scheduledPosts = scheduledPostsRaw.map(post => {
            // Determine display url (first image for carousel)
            let displayUrl = null
            if (post.imageUrls && post.imageUrls.length > 0) {
                displayUrl = post.imageUrls[0]
            }

            // Extract schedule time from scheduledAt date object if possible, or key off the date itself
            const scheduledAtDate = post.scheduledAt ? new Date(post.scheduledAt) : new Date()

            return {
                id: post.id,
                type: post.mediaType, // IMAGE, REEL, CAROUSEL, STORY
                url: displayUrl,
                caption: post.caption,
                timestamp: scheduledAtDate.toISOString(),
                isScheduled: true,
                scheduleDate: scheduledAtDate,
                // We don't strictly need separate scheduleTime if we have timestamp/date
            }
        })

        // 4. Merge Data
        // Sort scheduled descending (newest future date first to match IG grid layout order logic)
        const scheduledDescending = [...scheduledPosts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        const merged = [...scheduledDescending, ...livePosts]

        return {
            posts: merged,
            profile,
            isConnected
        }

    } catch (error) {
        console.error("Preview Data Error:", error)
        return { error: "Failed to load preview data" }
    }
}
