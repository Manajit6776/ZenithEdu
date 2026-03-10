import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.user.findMany({
        where: { role: 'Student' },
        select: { email: true }
    });
    console.log('Student Emails:');
    students.forEach(s => console.log(s.email));
}
main().catch(console.error).finally(() => prisma.$disconnect());
