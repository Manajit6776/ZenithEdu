import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.user.findMany({
        where: { role: 'Student' },
        take: 3,
        select: { email: true, name: true }
    });
    console.log('Students:', JSON.stringify(students, null, 2));

    const teachers = await prisma.user.findMany({
        where: { role: 'Teacher' },
        take: 3,
        select: { email: true, name: true }
    });
    console.log('Teachers:', JSON.stringify(teachers, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
