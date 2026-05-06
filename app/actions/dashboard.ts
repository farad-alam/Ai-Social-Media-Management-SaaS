'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getDashboardData() {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    try {
        const [
            totalPosts,
            scheduledPostsCount,
            publishedPostsCount,
            draftPostsCount,
            failedPostsCount,
            upcomingPosts,
            account
        ] = await Promise.all([
            prisma.post.count({ where: { userId } }),
            prisma.post.count({ where: { userId, status: 'SCHEDULED' } }),
            prisma.post.count({ where: { userId, status: 'PUBLISHED' } }),
            prisma.post.count({ where: { userId, status: 'DRAFT' } }),
            prisma.post.count({ where: { userId, status: 'FAILED' } }),
            // Next 5 upcoming scheduled posts
            prisma.post.findMany({
                where: {
                    userId,
                    status: 'SCHEDULED',
                    scheduledAt: { gte: new Date() }
                },
                orderBy: { scheduledAt: 'asc' },
                take: 5,
                select: { id: true, caption: true, scheduledAt: true, mediaType: true, imageUrls: true }
            }),
            prisma.account.findFirst({
                where: { userId },
                select: { username: true, picture: true, instagramId: true, updatedAt: true }
            })
        ])

        return {
            stats: {
                totalPosts,
                published: publishedPostsCount,
                scheduled: scheduledPostsCount,
                drafts: draftPostsCount,
                failed: failedPostsCount,
            },
            upcomingPosts: upcomingPosts.map(p => ({
                ...p,
                scheduledAt: p.scheduledAt?.toISOString() ?? null,
                image: p.imageUrls[0] || null
            })),
            account: account ? {
                username: account.username,
                picture: account.picture,
                instagramId: account.instagramId,
                connectedSince: account.updatedAt?.toISOString() ?? null
            } : null
        }
    } catch (error) {
        console.error('Dashboard Data Error:', error)
        return { error: 'Failed to fetch dashboard data' }
    }
}
