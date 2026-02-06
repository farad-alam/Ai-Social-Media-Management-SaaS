
import { prisma } from '@/lib/prisma';
import { InstagramClient } from '@/lib/instagram';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';


import { prisma } from '@/lib/prisma';
import { InstagramClient } from '@/lib/instagram';
import { PinterestClient } from '@/lib/pinterest';
import { TikTokClient } from '@/lib/tiktok';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const maxDuration = 60; // Set max duration to 60 seconds (Vercel limit for hobby)
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();

        // 1. Find scheduled posts that are due
        // We look for posts that are "SCHEDULED" or "PROCESSING" (stuck?) or have "SCHEDULED" destinations?
        // Simpler: Find Posts where status=SCHEDULED and scheduledAt <= now

        const postsToPublish = await prisma.post.findMany({
            where: {
                status: 'SCHEDULED', // Primary status
                scheduledAt: {
                    lte: now
                }
            },
            include: {
                destinations: {
                    include: {
                        account: true
                    }
                }
            }
        });

        if (postsToPublish.length === 0) {
            return NextResponse.json({ message: 'No posts to publish' });
        }

        const results = [];

        for (const post of postsToPublish) {
            // Lock post
            await prisma.post.update({
                where: { id: post.id },
                data: { status: 'PROCESSING' }
            });

            // If no destinations (legacy posts?), try to find implicit IG account?
            // For new schema, we rely on destinations.

            let allSuccess = true;
            let anySuccess = false;

            for (const destination of post.destinations) {
                if (destination.status !== 'SCHEDULED') continue;

                try {
                    const account = destination.account;
                    let platformPostId = null;

                    // --- INSTAGRAM ---
                    if (account.provider === 'INSTAGRAM') {
                        const imageUrl = post.imageUrls[0]; // TODO: Support carousel
                        if (post.mediaType === 'IMAGE') {
                            platformPostId = await InstagramClient.publishImage(
                                account.providerAccountId,
                                imageUrl,
                                post.caption || '',
                                account.accessToken
                            );
                        } else if (post.mediaType === 'REEL') {
                            platformPostId = await InstagramClient.publishReel(
                                account.providerAccountId,
                                imageUrl,
                                post.caption || '',
                                account.accessToken
                            );
                        } else if (post.mediaType === 'CAROUSEL') {
                            // Basic carousel support
                            platformPostId = await InstagramClient.publishCarousel(
                                account.providerAccountId,
                                post.imageUrls,
                                post.caption || '',
                                account.accessToken
                            );
                        }
                    }
                    // --- PINTEREST ---
                    else if (account.provider === 'PINTEREST') {
                        // Pinterest requires a Board ID. 
                        // We need to implement UI to select board or use default.
                        // For now, let's assume valid boardId is hardcoded or fetched dynamically if missing?
                        // Or fail if no board selected? 

                        // Fallback: fetch first board if none provided (Dangerous but works for MVP)
                        let boardId = 'default'; // Placeholder

                        try {
                            const boards = await PinterestClient.getBoards(account.accessToken);
                            if (boards.length > 0) boardId = boards[0].id;
                        } catch (e) {
                            console.error("Failed to fetch Pinterest boards", e);
                        }

                        const result = await PinterestClient.createPin(
                            account.accessToken,
                            boardId,
                            post.imageUrls[0],
                            post.caption?.substring(0, 100), // Title
                            post.caption, // Desc
                            // Link?
                        );
                        platformPostId = result.id;
                    }
                    // --- TIKTOK ---
                    else if (account.provider === 'TIKTOK') {
                        // Simplified TikTok Publish (Photo Mode)
                        const result = await TikTokClient.initPublish(account.accessToken, {
                            post_info: {
                                title: post.caption?.substring(0, 50) || "Post",
                                privacy_level: "PUBLIC_TO_EVERYONE",
                                disable_duet: false,
                                disable_comment: false,
                                disable_stitch: false,
                                video_cover_timestamp_ms: 1000
                            },
                            source_info: {
                                source: "PULL_FROM_URL",
                                photo_cover_index: 1,
                                photo_images: post.imageUrls.map(url => url) // Max 35
                            },
                            post_mode: "DIRECT_POST",
                            media_type: "PHOTO"
                        });
                        platformPostId = result.publish_id;
                    }

                    // Success!
                    await prisma.postDestination.update({
                        where: { id: destination.id },
                        data: {
                            status: 'PUBLISHED',
                            publishedAt: new Date(),
                            platformPostId: platformPostId
                        }
                    });
                    anySuccess = true;

                } catch (destError: any) {
                    console.error(`Failed destination ${destination.id}`, destError);
                    await prisma.postDestination.update({
                        where: { id: destination.id },
                        data: {
                            status: 'FAILED',
                            errorMessage: destError.message
                        }
                    });
                    allSuccess = false;
                }
            }

            // Update Master Post Status
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    status: allSuccess ? 'PUBLISHED' : (anySuccess ? 'PUBLISHED' : 'FAILED')
                    // If at least one succeeded, we mark as PUBLISHED (or we could add PARTIAL_SUCCESS enum)
                }
            });
            results.push({ id: post.id, success: anySuccess });
        }

        return NextResponse.json({ processed: postsToPublish.length, results });

    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

