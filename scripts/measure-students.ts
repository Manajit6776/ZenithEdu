import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    include: { user: true, feeRecords: true },
  });
  
  const json = JSON.stringify(students);
  console.log(`Students fetched: ${students.length}`);
  console.log(`Response size (JSON): ${(json.length / (1024 * 1024)).toFixed(2)} MB`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
