
'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { InstagramClient } from '@/lib/instagram'
import { revalidatePath } from 'next/cache'

export async function getInstagramStatus() {
    const { userId } = await auth()

    if (!userId) {
        return { isConnected: false }
    }

    try {
        const account = await prisma.account.findFirst({
            where: { userId },
            select: { id: true, username: true, picture: true, instagramId: true, accessToken: true, updatedAt: true }
        })

        if (account) {
            let freshPicture = account.picture;
            
            // Only ping Instagram API if the picture in the database is more than 24 hours old
            // This massively speeds up page loads on /create and /all-posts
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
            const isStale = (Date.now() - new Date(account.updatedAt).getTime()) > TWENTY_FOUR_HOURS;

            try {
                if (isStale && account.instagramId && account.accessToken) {
                    const details = await InstagramClient.getInstagramUserDetails(account.instagramId, account.accessToken);
                    if (details && details.profile_picture_url) {
                        freshPicture = details.profile_picture_url;
                        // Renew the expired URL in db (updates the updatedAt timestamp automatically)
                        await prisma.account.update({
                            where: { id: account.id },
                            data: { picture: freshPicture }
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to renew profile picture:", err);
            }

            return {
                isConnected: true,
                username: account.username,
                picture: freshPicture
            }
        }

        return { isConnected: false }

    } catch (error) {
        console.error('Failed to fetch Instagram status:', error)
        return { isConnected: false }
    }
}

export async function disconnectInstagram() {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    try {
        await prisma.account.deleteMany({
            where: { userId }
        })
        revalidatePath('/connect-instagram')
        return { success: true }
    } catch (error) {
        return { error: "Failed to disconnect" }
    }
}
