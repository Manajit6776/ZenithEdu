import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // We can't easily use prisma to fix it if it's already failing validation
    // We might need to use raw SQL for SQLite
    console.log('Fixing appointment statuses...');

    try {
        const result = await prisma.$executeRawUnsafe(`
      UPDATE appointments 
      SET status = CASE 
        WHEN status = 'pending' THEN 'Pending'
        WHEN status = 'approved' THEN 'Approved'
        WHEN status = 'rejected' THEN 'Rejected'
        WHEN status = 'completed' THEN 'Completed'
        WHEN status = 'cancelled' THEN 'Cancelled'
        ELSE status
      END
    `);
        console.log(`Updated ${result} appointments.`);
    } catch (error) {
        console.error('Failed to fix appointments:', error);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
