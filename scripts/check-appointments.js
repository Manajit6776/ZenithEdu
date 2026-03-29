import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const appointments = await prisma.appointment.findMany();
    console.log(`Total appointments: ${appointments.length}`);
    if (appointments.length > 0) {
        console.log('Sample appointment:', JSON.stringify(appointments[0], null, 2));
    }

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'Admin' },
                { role: 'Teacher' }
            ]
        },
        select: { id: true, name: true, role: true }
    });
    console.log('Staff users:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
