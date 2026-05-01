const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find a failed post to retry
  const post = await prisma.post.findFirst({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' }
  });

  if (!post) {
    console.log("No failed posts found");
    return;
  }

  // 2. Set it back to SCHEDULED and due now
  await prisma.post.update({
    where: { id: post.id },
    data: { 
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() - 10000) // 10 seconds ago
    }
  });

  console.log("Reset post to SCHEDULED. Triggering Vercel Cron API...");

  // 3. Trigger the Vercel API
  try {
    const res = await fetch('https://www.omaticsocial.com/api/cron/publish?secret=1f6d90b4a728cf8bb529bca1d21a978f');
    const data = await res.json();
    console.log("Vercel Response Status:", res.status);
    console.log("Vercel Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
