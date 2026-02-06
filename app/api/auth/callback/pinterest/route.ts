
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PinterestClient } from '@/lib/pinterest';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/connect?error=${error}`, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/connect?error=no_code', request.url));
    }

    try {
        // 1. Exchange Code for Token
        const tokenData = await PinterestClient.getAccessToken(code);

        // 2. Get User Profile
        const profile = await PinterestClient.getUserInfo(tokenData.access_token);

        // 3. Save to Database
        // Ensure user exists
        const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
        await prisma.user.upsert({
            where: { id: userId },
            update: { email },
            create: { id: userId, email }
        });

        // Upsert Pinterest Account
        await prisma.account.upsert({
            where: {
                provider_providerAccountId: {
                    provider: 'PINTEREST',
                    providerAccountId: profile.username // Pinterest might not expose a numeric ID easily in all scopes, username is unique-ish or fetch ID if avail
                }
            },
            update: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
                username: profile.username,
                picture: profile.profile_image,
                userId: userId,
                updatedAt: new Date()
            },
            create: {
                provider: 'PINTEREST',
                providerAccountId: profile.username, // Using username as ID for now if ID is missing from user_account response
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
                username: profile.username,
                picture: profile.profile_image,
                userId: userId
            }
        });

        return NextResponse.redirect(new URL('/connect?success=pinterest_connected', request.url));

    } catch (err: any) {
        console.error("Pinterest Auth Error:", err);
        return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(err.message)}`, request.url));
    }
}
