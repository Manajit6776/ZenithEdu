const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Professional color schemes for avatars
const professionalColors = [
  '6366f1', // Indigo
  '8b5cf6', // Violet
  'ec4899', // Pink
  'f43f5e', // Rose
  'f97316', // Orange
  'eab308', // Yellow
  '84cc16', // Lime
  '22c55e', // Green
  '14b8a6', // Teal
  '06b6d4', // Cyan
  '0ea5e9', // Sky
  '3b82f6', // Blue
  '6b7280', // Gray
  'a855f7', // Purple
  'f59e0b', // Amber
  '10b981', // Emerald
  'f87171', // Red
  '60a5fa', // Light Blue
  'a78bfa', // Light Purple
  '34d399', // Light Green
  'fbbf24', // Light Yellow
  'f472b6', // Light Pink
  'c084fc', // Light Violet
  '67e8f9', // Light Cyan
  '86efac', // Light Lime
  'fde047', // Light Amber
  'fca5a5', // Light Red
  '93c5fd', // Very Light Blue
  'd8b4fe', // Very Light Purple
  'bbf7d0'  // Very Light Green
];

// Avatar styles - using professional options only
const avatarStyles = [
  '', // Default style
  '&background=6366f1&color=fff', // Indigo with white text
  '&background=8b5cf6&color=fff', // Violet with white text
  '&background=ec4899&color=fff', // Pink with white text
  '&background=22c55e&color=fff', // Green with white text
  '&background=0ea5e9&color=fff', // Sky with white text
  '&background=3b82f6&color=fff', // Blue with white text
  '&background=6b7280&color=fff', // Gray with white text
  '&background=f97316&color=fff', // Orange with white text
  '&background=10b981&color=fff', // Emerald with white text
  '&background=a855f7&color=fff', // Purple with white text
  '&background=f59e0b&color=fff', // Amber with white text
  '&background=14b8a6&color=fff', // Teal with white text
  '&background=f43f5e&color=fff', // Rose with white text
  '&background=eab308&color=fff', // Yellow with white text
  '&background=84cc16&color=fff', // Lime with white text
  '&background=06b6d4&color=fff', // Cyan with white text
  '&background=60a5fa&color=fff', // Light Blue with white text
  '&background=a78bfa&color=fff', // Light Purple with white text
  '&background=34d399&color=fff', // Light Green with white text
  '&background=fbbf24&color=fff', // Light Yellow with white text
  '&background=f472b6&color=fff', // Light Pink with white text
  '&background=c084fc&color=fff', // Light Violet with white text
  '&background=67e8f9&color=fff', // Light Cyan with white text
  '&background=86efac&color=fff', // Light Lime with white text
  '&background=fde047&color=fff', // Light Amber with white text
  '&background=fca5a5&color=fff', // Light Red with white text
  '&background=93c5fd&color=fff', // Very Light Blue with white text
  '&background=d8b4fe&color=fff', // Very Light Purple with white text
  '&background=bbf7d0&color=fff', // Very Light Green with white text
  '&background=374151&color=fff', // Dark Gray with white text
  '&background=1f2937&color=fff', // Very Dark Gray with white text
];

function generateProfessionalAvatar(name, index) {
  // Clean up the name for URL encoding
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  
  // Use different styles based on index to ensure variety
  const styleIndex = index % avatarStyles.length;
  const style = avatarStyles[styleIndex];
  
  // Create avatar URL with professional styling
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&size=128&font-size=0.6&rounded=true&bold=true${style}`;
}

async function updateAllStudentAvatars() {
  try {
    console.log('🔄 Updating all student avatars with professional styles...');
    
    // Get all students with their user accounts
    const students = await prisma.student.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`Found ${students.length} students to update`);
    
    let updatedCount = 0;
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const newAvatar = generateProfessionalAvatar(student.name, i);
      
      // Update the user's avatar
      await prisma.user.update({
        where: { id: student.userId },
        data: { avatar: newAvatar }
      });
      
      updatedCount++;
      
      // Show progress every 50 students
      if ((updatedCount % 50) === 0) {
        console.log(`✅ Updated ${updatedCount}/${students.length} students`);
      }
    }
    
    console.log(`\n🎉 Successfully updated avatars for all ${updatedCount} students!`);
    
    // Show sample of updated avatars
    console.log('\n📋 Sample of updated avatars:');
    const sampleStudents = await prisma.student.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    sampleStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.user.name}`);
      console.log(`   Avatar: ${student.user.avatar}`);
    });
    
  } catch (error) {
    console.error('Error updating avatars:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllStudentAvatars();
