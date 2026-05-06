'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Unified data fetcher — single source of truth for all dashboard pages.
 * Fetches ALL posts + account info in just 2 DB queries.
 * Stats are computed client-side from the posts array.
 */
export async function getAppData() {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    try {
        const [posts, account] = await Promise.all([
            prisma.post.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    caption: true,
                    scheduledAt: true,
                    status: true,
                    mediaType: true,
                    imageUrls: true,
                    locationName: true,
                    createdAt: true,
                }
            }),
            prisma.account.findFirst({
                where: { userId },
                select: {
                    id: true,
                    username: true,
                    picture: true,
                    instagramId: true,
                    accessToken: true,
                    updatedAt: true,
                }
            })
        ])

        // Serialize dates to ISO strings for client consumption
        const serializedPosts = posts.map(p => ({
            ...p,
            scheduledAt: p.scheduledAt?.toISOString() ?? null,
            createdAt: p.createdAt.toISOString(),
            image: p.imageUrls[0] || null,
        }))

        const serializedAccount = account ? {
            username: account.username,
            picture: account.picture,
            instagramId: account.instagramId,
            connectedSince: account.updatedAt?.toISOString() ?? null,
            isConnected: true,
        } : null

        return {
            posts: serializedPosts,
            account: serializedAccount,
        }
    } catch (error) {
        console.error('AppData Error:', error)
        return { error: 'Failed to fetch app data' }
    }
}
