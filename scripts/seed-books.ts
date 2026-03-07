import { PrismaClient, BookStatus } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  // Computer Science & Programming
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Algorithms", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/algorithms/200/300", rating: 4.8, views: 1250 },
  { title: "Clean Code", author: "Robert C. Martin", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/cleancode/200/300", rating: 4.9, views: 2100 },
  { title: "Artificial Intelligence", author: "Stuart Russell", category: "AI", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/ai/200/300", rating: 4.7, views: 1560 },
  { title: "Design Patterns", author: "Erich Gamma", category: "Software Engineering", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/designpatterns/200/300", rating: 4.6, views: 1340 },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/pragmatic/200/300", rating: 4.8, views: 1780 },
  { title: "Refactoring", author: "Martin Fowler", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/refactoring/200/300", rating: 4.7, views: 1200 },
  { title: "Code Complete", author: "Steve McConnell", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/codecomplete/200/300", rating: 4.9, views: 1950 },
  { title: "Database Systems", author: "Ramez Elmasri", category: "Database", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/database/200/300", rating: 4.4, views: 980 },
  { title: "Computer Networks", author: "Andrew Tanenbaum", category: "Networking", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/networks/200/300", rating: 4.6, views: 1120 },
  { title: "Operating Systems", author: "Abraham Silberschatz", category: "Systems", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/os/200/300", rating: 4.7, views: 1320 },
  { title: "Machine Learning", author: "Tom Mitchell", category: "AI", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/ml/200/300", rating: 4.8, views: 1870 },
  { title: "Data Structures", author: "Mark Allen Weiss", category: "Algorithms", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/datastructures/200/300", rating: 4.5, views: 1050 },
  { title: "Deep Learning", author: "Ian Goodfellow", category: "AI", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/deeplearning/200/300", rating: 4.8, views: 1680 },
  { title: "Computer Architecture", author: "David Patterson", category: "Hardware", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/architecture/200/300", rating: 4.5, views: 1100 },
  { title: "Structure and Interpretation", author: "Abelson & Sussman", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/sicp/200/300", rating: 4.7, views: 1420 },
  { title: "React Handbook", author: "Robin Wieruch", category: "Web Development", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/react/200/300", rating: 4.8, views: 1760 },
  { title: "JavaScript: The Good Parts", author: "Douglas Crockford", category: "Web Development", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/javascript/200/300", rating: 4.3, views: 1450 },
  { title: "Python Crash Course", author: "Eric Matthes", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/python/200/300", rating: 4.6, views: 1890 },
  { title: "Node.js Design Patterns", author: "Mario Casciaro", category: "Web Development", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/nodejs/200/300", rating: 4.4, views: 980 },
  { title: "TypeScript Handbook", author: "Microsoft", category: "Programming", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/typescript/200/300", rating: 4.7, views: 1230 },

  // Mathematics
  { title: "Linear Algebra", author: "Gilbert Strang", category: "Mathematics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/linear/200/300", rating: 4.9, views: 2300 },
  { title: "Discrete Mathematics", author: "Kenneth Rosen", category: "Mathematics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/discrete/200/300", rating: 4.6, views: 1240 },
  { title: "Calculus", author: "James Stewart", category: "Mathematics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/calculus/200/300", rating: 4.5, views: 1560 },
  { title: "Probability Theory", author: "William Feller", category: "Mathematics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/probability/200/300", rating: 4.7, views: 980 },
  { title: "Statistics", author: "David Freedman", category: "Mathematics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/statistics/200/300", rating: 4.4, views: 1120 },

  // Physics
  { title: "Fundamentals of Physics", author: "Halliday & Resnick", category: "Physics", status: BookStatus.Issued, coverUrl: "https://picsum.photos/seed/physics/200/300", rating: 4.5, views: 890 },
  { title: "Classical Mechanics", author: "John Taylor", category: "Physics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/mechanics/200/300", rating: 4.6, views: 1340 },
  { title: "Quantum Physics", author: "Stephen Gasiorowicz", category: "Physics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/quantum/200/300", rating: 4.7, views: 1560 },
  { title: "Thermodynamics", author: "Clausius", category: "Physics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/thermo/200/300", rating: 4.3, views: 780 },
  { title: "Electromagnetism", author: "David Griffiths", category: "Physics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/emag/200/300", rating: 4.8, views: 1890 },

  // Chemistry
  { title: "Organic Chemistry", author: "Paula Yurkanis Bruice", category: "Chemistry", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/organic/200/300", rating: 4.4, views: 1230 },
  { title: "Physical Chemistry", author: "Peter Atkins", category: "Chemistry", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/physicalchem/200/300", rating: 4.5, views: 980 },
  { title: "Inorganic Chemistry", author: "Gary Housecroft", category: "Chemistry", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/inorganic/200/300", rating: 4.3, views: 890 },
  { title: "Analytical Chemistry", author: "Skoog", category: "Chemistry", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/analytical/200/300", rating: 4.6, views: 1120 },

  // Biology
  { title: "Molecular Biology", author: "Bruce Alberts", category: "Biology", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/molecular/200/300", rating: 4.7, views: 1450 },
  { title: "Genetics", author: "Benjamin Pierce", category: "Biology", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/genetics/200/300", rating: 4.5, views: 1230 },
  { title: "Ecology", author: "Charles Krebs", category: "Biology", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/ecology/200/300", rating: 4.4, views: 980 },
  { title: "Cell Biology", author: "Bruce Alberts", category: "Biology", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/cell/200/300", rating: 4.6, views: 1340 },

  // Engineering
  { title: "Engineering Mathematics", author: "K.A. Stroud", category: "Engineering", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/engmath/200/300", rating: 4.5, views: 1560 },
  { title: "Strength of Materials", author: "Timoshenko", category: "Engineering", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/strength/200/300", rating: 4.4, views: 1120 },
  { title: "Fluid Mechanics", author: "Frank White", category: "Engineering", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/fluid/200/300", rating: 4.6, views: 1230 },
  { title: "Thermodynamics Engineering", author: "Yunus Cengel", category: "Engineering", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/thermoeng/200/300", rating: 4.7, views: 1450 },

  // Business & Economics
  { title: "Economics", author: "Paul Samuelson", category: "Economics", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/economics/200/300", rating: 4.3, views: 890 },
  { title: "Business Strategy", author: "Michael Porter", category: "Business", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/strategy/200/300", rating: 4.5, views: 1230 },
  { title: "Marketing Management", author: "Philip Kotler", category: "Business", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/marketing/200/300", rating: 4.4, views: 1120 },
  { title: "Financial Accounting", author: "Libby Libby", category: "Business", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/accounting/200/300", rating: 4.3, views: 980 },

  // Other
  { title: "Web Development", author: "Jon Duckett", category: "Web Development", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/webdev/200/300", rating: 4.3, views: 920 },
  { title: "Data Science", author: "Joel Grus", category: "Data Science", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/datascience/200/300", rating: 4.6, views: 1780 },
  { title: "Cybersecurity", author: "William Stallings", category: "Security", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/cyber/200/300", rating: 4.5, views: 1340 },
  { title: "Cloud Computing", author: "Thomas Erl", category: "Cloud", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/cloud/200/300", rating: 4.4, views: 1120 },
  { title: "Blockchain Technology", author: "Andreas Antonopoulos", category: "Blockchain", status: BookStatus.Available, coverUrl: "https://picsum.photos/seed/blockchain/200/300", rating: 4.6, views: 1560 }
];

async function seedBooks() {
  console.log('🌱 Seeding 50 books into the database...');

  try {
    // Clear existing books
    await prisma.book.deleteMany();
    console.log('🗑️  Cleared existing books');

    // Insert new books
    for (const book of books) {
      await prisma.book.create({
        data: {
          title: book.title,
          author: book.author,
          category: book.category,
          status: book.status,
          coverUrl: book.coverUrl,
          rating: book.rating,
          views: book.views
        }
      });
    }

    console.log(`✅ Successfully seeded ${books.length} books!`);
  } catch (error) {
    console.error('❌ Error seeding books:', error);
    throw error;
  }
}

async function main() {
  await seedBooks();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
