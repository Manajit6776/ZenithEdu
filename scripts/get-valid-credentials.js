import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.user.findMany({
        where: { role: 'Student' },
        take: 5
    });
    console.log('Valid Student Emails:');
    students.forEach(s => console.log(`- ${s.email}`));

    const teachers = await prisma.user.findMany({
        where: { role: 'Teacher' },
        take: 5
    });
    console.log('\nValid Teacher Emails:');
    teachers.forEach(t => console.log(`- ${t.email}`));

    const admins = await prisma.user.findMany({
        where: { role: 'Admin' },
        take: 5
    });
    console.log('\nValid Admin Emails:');
    admins.forEach(a => console.log(`- ${a.email}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
