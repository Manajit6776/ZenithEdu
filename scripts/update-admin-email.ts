import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminEmail() {
  try {
    // Find the admin user first
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'Admin'
      }
    });

    if (adminUser) {
      // Update the admin user's email
      const updatedAdmin = await prisma.user.update({
        where: {
          id: adminUser.id
        },
        data: {
          email: 'admin@zenithedu.com'
        }
      });

      console.log('Admin email updated successfully:', updatedAdmin.email);
      console.log('Admin user details:', {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role
      });
    } else {
      // If no admin exists, create one
      console.log('No admin user found. Creating admin user...');
      const newAdmin = await prisma.user.create({
        data: {
          name: 'System Administrator',
          email: 'admin@zenithedu.com',
          role: 'Admin',
          avatar: '/avatars/admin.jpg',
        }
      });
      console.log('Admin user created successfully:', newAdmin.email);
    }
  } catch (error) {
    console.error('Error updating admin email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmail();
