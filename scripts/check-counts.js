import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.student.count();
    const liveClasses = await prisma.liveClass.count();
    console.log(JSON.stringify({ students, liveClasses }));
    await prisma.$disconnect();
}
main();
