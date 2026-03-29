import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.user.findMany({
        where: { role: 'Student' },
        take: 5,
        select: { email: true }
    });
    console.log('STUDENT_EMAILS_START');
    students.forEach(s => console.log(s.email));
    console.log('STUDENT_EMAILS_END');
}
main().catch(console.error).finally(() => prisma.$disconnect());
