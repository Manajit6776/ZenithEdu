import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const assignmentCount = await prisma.assignment.count();
  const submissionCount = await prisma.submission.count();
  console.log(`Assignments: ${assignmentCount}`);
  console.log(`Submissions: ${submissionCount}`);
  
  if (assignmentCount > 0) {
    console.log('Fetching first assignment to check structure...');
    const first = await prisma.assignment.findFirst({
      include: {
        teacher: true,
        submissions: {
          include: {
            student: true
          }
        }
      }
    });
    console.log('Successfully fetched first assignment');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
