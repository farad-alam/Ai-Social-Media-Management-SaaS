/**
 * instrumentation.ts
 *
 * This file is automatically loaded by Next.js when the server starts.
 * We use it to start a background cron scheduler in DEVELOPMENT only.
 *
 * In PRODUCTION, cron-job.org calls /api/cron/publish every minute externally.
 */

export async function register() {
    // Only run inside Node.js runtime (not Edge), and only in development
    if (
        process.env.NEXT_RUNTIME === 'nodejs' &&
        process.env.NODE_ENV === 'development'
    ) {
        // Dynamically import node-cron to keep it out of edge bundles
        const cron = await import('node-cron');

        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const CRON_SECRET = process.env.CRON_SECRET;

        if (!CRON_SECRET) {
            console.warn('[CRON] ⚠️  CRON_SECRET is not set. Scheduler will not start.');
            return;
        }

        // Run every 1 minute: * * * * *
        cron.schedule('* * * * *', async () => {
            console.log(`[CRON] ⏰ Running at ${new Date().toLocaleTimeString()} — checking for scheduled posts...`);

            try {
                const res = await fetch(
                    `${APP_URL}/api/cron/publish?secret=${CRON_SECRET}`,
                    { cache: 'no-store' }
                );
                const data = await res.json();

                if (res.ok) {
                    console.log(`[CRON] ✅ Done:`, data);
                } else {
                    console.error(`[CRON] ❌ Error (${res.status}):`, data);
                }
            } catch (err) {
                console.error('[CRON] ❌ Fetch failed:', err);
            }
        });

        console.log(`[CRON] 🚀 Scheduler started — running every minute (dev mode)`);
        console.log(`[CRON]    → Endpoint: ${APP_URL}/api/cron/publish`);
    }
}
