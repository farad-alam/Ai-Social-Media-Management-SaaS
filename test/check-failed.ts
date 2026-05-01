import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log("Latest 5 failed posts:");
  posts.forEach(p => {
    console.log(`- ID: ${p.id} | Type: ${p.mediaType} | Reason: ${p.failedReason} | Caption: ${p.caption.substring(0, 20)}...`);
  });
}

main().finally(() => prisma.$disconnect());
