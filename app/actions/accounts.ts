'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getAllAccounts() {
    const { userId } = await auth()

    if (!userId) {
        return []
    }

    try {
        const accounts = await prisma.account.findMany({
            where: { userId },
            select: {
                id: true,
                provider: true,
                username: true,
                picture: true
            }
        })
        return accounts
    } catch (error) {
        console.error('Failed to fetch accounts:', error)
        return []
    }
}
