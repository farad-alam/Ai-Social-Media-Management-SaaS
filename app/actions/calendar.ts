'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updatePostSchedule(postId: string, newDate: string) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    try {
        const scheduledAt = new Date(newDate)

        // Simple validation to ensure date is valid
        if (isNaN(scheduledAt.getTime())) {
            return { error: 'Invalid date format' }
        }

        await prisma.post.update({
            where: {
                id: postId,
                userId // Ensure user owns the post
            },
            data: {
                scheduledAt,
                status: 'SCHEDULED' // Ensure status is scheduled
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Update Schedule Error:', error)
        return { error: 'Failed to reschedule post' }
    }
}
