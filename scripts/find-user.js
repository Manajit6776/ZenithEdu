import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'alex.thompson@zenithedu.com' }
    });
    console.log('User Found:', user);

    const allStudents = await prisma.user.findMany({
        where: { role: 'Student' },
        take: 10
    });
    console.log('Sample Students:', allStudents);
}
main().catch(console.error).finally(() => prisma.$disconnect());
