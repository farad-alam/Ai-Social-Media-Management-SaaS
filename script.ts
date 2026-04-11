import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Dropping default on status...")
        await prisma.$executeRawUnsafe(`ALTER TABLE "Post" ALTER COLUMN "status" DROP DEFAULT;`)
        console.log("Dropped default.")
        
        console.log("Dropping PublishStatus type if possible...")
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "PublishStatus" CASCADE;`)
        console.log("Dropped type.")
    } catch (err) {
        console.error("Error:", err)
    } finally {
        await prisma.$disconnect()
    }
}
main()
