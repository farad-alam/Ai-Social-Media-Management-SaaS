
import { prisma } from '@/lib/prisma';
import { InstagramClient } from '@/lib/instagram';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // ── Security: verify CRON_SECRET ─────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const secretFromQuery  = searchParams.get('secret');
    const secretFromHeader = request.headers.get('x-cron-secret');
    const secret = secretFromQuery ?? secretFromHeader;

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
        const now = new Date();

        // 1. Find scheduled posts that are due
        // Since this is a global cron job, we check all users' scheduled posts.
        const whereClause: any = {
            status: 'SCHEDULED',
            scheduledAt: {
                lte: now
            }
        };

        const postsToPublish = await prisma.post.findMany({
            where: whereClause,
            include: {
                user: {
                    include: {
                        accounts: true // We need the token
                    }
                }
            }
        });

        if (postsToPublish.length === 0) {
            return NextResponse.json({ message: 'No posts to publish' });
        }

        // 2. Publish each post concurrently to prevent 10s timeout on Vercel
        const publishPromises = postsToPublish.map(async (post) => {
            try {
                // 3. Lock the post by setting status to PROCESSING
                // This prevents race conditions if cron is triggered multiple times
                const { count } = await prisma.post.updateMany({
                    where: {
                        id: post.id,
                        status: 'SCHEDULED'
                    },
                    data: { status: 'PROCESSING' }
                });

                if (count === 0) {
                    console.log(`Post ${post.id} skipped (already processing or not scheduled)`);
                    return { id: post.id, status: 'SKIPPED', reason: 'already processing' };
                }

                const account = post.user.accounts.find(acc => acc.instagramId);

                if (!account) {
                    await prisma.post.update({
                        where: { id: post.id },
                        data: { 
                            status: 'FAILED',
                            failedReason: 'No Instagram account connected'
                        }
                    });
                    return { id: post.id, status: 'FAILED', reason: 'No Instagram account connected' };
                }

                const imageUrl = post.imageUrls[0];

                if (!imageUrl) {
                    await prisma.post.update({
                        where: { id: post.id },
                        data: { 
                            status: 'FAILED',
                            failedReason: 'No image URL'
                        }
                    });
                    return { id: post.id, status: 'FAILED', reason: 'No image URL' };
                }

                if (post.mediaType === 'REEL') {
                    const publishId = await InstagramClient.publishReel(
                        account.instagramId,
                        imageUrl,
                        post.caption,
                        account.accessToken,
                        post.locationId
                    );

                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            status: 'PUBLISHED',
                            instagramPostId: publishId
                        }
                    });
                    return { id: post.id, status: 'PUBLISHED', publishId, type: 'REEL' };

                } else if (post.mediaType === 'IMAGE') {
                    const publishId = await InstagramClient.publishImage(
                        account.instagramId,
                        imageUrl,
                        post.caption,
                        account.accessToken,
                        post.locationId,
                        post.userTags as any[]
                    );

                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            status: 'PUBLISHED',
                            instagramPostId: publishId
                        }
                    });
                    return { id: post.id, status: 'PUBLISHED', publishId, type: 'IMAGE' };
                } else if (post.mediaType === 'STORY') {
                    const isVideo = imageUrl.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|webm)$/);

                    const publishId = await InstagramClient.publishStoryMedia(
                        account.instagramId,
                        imageUrl,
                        isVideo ? 'VIDEO' : 'IMAGE',
                        account.accessToken
                    );

                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            status: 'PUBLISHED',
                            instagramPostId: publishId
                        }
                    });
                    return { id: post.id, status: 'PUBLISHED', publishId, type: 'STORY' };
                } else if (post.mediaType === 'CAROUSEL') {
                    if (!post.imageUrls || post.imageUrls.length === 0) {
                        await prisma.post.update({
                            where: { id: post.id },
                            data: { 
                                status: 'FAILED',
                                failedReason: 'No images for carousel'
                            }
                        });
                        return { id: post.id, status: 'FAILED', reason: 'No images for carousel' };
                    }

                    const publishId = await InstagramClient.publishCarousel(
                        account.instagramId,
                        post.imageUrls,
                        post.caption,
                        account.accessToken,
                        post.locationId,
                        post.userTags as any[]
                    );

                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            status: 'PUBLISHED',
                            instagramPostId: publishId
                        }
                    });
                    return { id: post.id, status: 'PUBLISHED', publishId, type: 'CAROUSEL' };
                }

                return { id: post.id, status: 'UNKNOWN' };

            } catch (postError: any) {
                console.error(`Failed to publish post ${post.id}`, postError);
                await prisma.post.update({
                    where: { id: post.id },
                    data: { 
                        status: 'FAILED',
                        failedReason: postError.message
                    }
                });
                return { id: post.id, status: 'FAILED', error: postError.message };
            }
        });

        const settledResults = await Promise.allSettled(publishPromises);
        
        // Extract the values from fulfilled promises to maintain the API response structure
        const results = settledResults.map(res => res.status === 'fulfilled' ? res.value : { status: 'ERROR', reason: 'Promise rejected' });

        return NextResponse.json({ processed: postsToPublish.length, results });

    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
