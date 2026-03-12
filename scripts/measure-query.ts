import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.time('query');
  const assignments = await prisma.assignment.findMany({
    include: {
      teacher: { select: { name: true, email: true } },
      submissions: {
        include: {
          student: { select: { name: true, rollNo: true } },
          assignment: { select: { title: true, maxScore: true, dueDate: true, subject: true, attachmentUrl: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  console.timeEnd('query');
  
  const json = JSON.stringify(assignments);
  console.log(`Assignments fetched: ${assignments.length}`);
  console.log(`Total submissions included: ${assignments.reduce((acc, a) => acc + a.submissions.length, 0)}`);
  console.log(`Response size (JSON): ${(json.length / (1024 * 1024)).toFixed(2)} MB`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
