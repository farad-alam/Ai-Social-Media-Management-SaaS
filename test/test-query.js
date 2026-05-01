const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(posts.map(p => ({ id: p.id, status: p.status, caption: p.caption })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
