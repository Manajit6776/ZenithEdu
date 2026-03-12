const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 'cmjotkunz000hnvzkolc378u8';
    console.log(`Checking user: ${userId}`);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true }
    });

    if (!user) {
        console.log('User not found in database');
        return;
    }

    console.log('User found:', JSON.stringify(user, null, 2));

    if (user.student) {
        console.log('Student record exists');
    } else {
        console.log('NO student record found for this user');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
