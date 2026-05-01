const { PrismaClient } = require('@prisma/client');
const { InstagramClient } = require('../lib/instagram');

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findFirst({
    where: { status: 'FAILED' },
    include: {
      user: {
        include: { accounts: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!post) {
    console.log("No failed posts found.");
    return;
  }

  console.log("Trying to publish post:", post.id);
  const account = post.user.accounts.find(acc => acc.instagramId);
  
  if (!account) {
    console.log("No account found for user");
    return;
  }

  console.log("Found account:", account.instagramId, "Token length:", account.accessToken?.length);

  try {
    const imageUrl = post.imageUrls[0];
    console.log("Publishing image:", imageUrl);
    const publishId = await InstagramClient.publishImage(
      account.instagramId,
      imageUrl,
      post.caption,
      account.accessToken,
      post.locationId,
      post.userTags
    );
    console.log("Success! Publish ID:", publishId);
  } catch (error) {
    console.error("Failed to publish:", error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
