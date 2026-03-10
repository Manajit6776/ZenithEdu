import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const appointments = await prisma.appointment.findMany({
        select: {
            id: true,
            studentId: true,
            studentName: true,
            teacherId: true,
            teacherName: true,
            status: true
        }
    });
    console.log(appointments);
}
main().catch(console.error).finally(() => prisma.$disconnect());
