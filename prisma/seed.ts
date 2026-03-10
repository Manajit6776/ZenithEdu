import { PrismaClient, UserRole, FeesStatus, Priority, BookStatus, RoomType, RoomStatus, ClassStatus, Platform } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@zenithedu.com',
      role: UserRole.Admin,
      avatar: '/avatars/admin.jpg',
    },
  });

  // Create teachers
  const teacher1 = await prisma.user.create({
    data: {
      name: 'Prof. Sarah Williams',
      email: 'sarah.williams@zenithedu.com',
      role: UserRole.Teacher,
      avatar: '/avatars/sarah.jpg',
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Dr. James Chen',
      email: 'james.chen@zenithedu.com',
      role: UserRole.Teacher,
      avatar: '/avatars/james.jpg',
    },
  });

  const teacher3 = await prisma.user.create({
    data: {
      name: 'Prof. Emily Rodriguez',
      email: 'emily.rodriguez@zenithedu.com',
      role: UserRole.Teacher,
      avatar: '/avatars/emily.jpg',
    },
  });

  // Create students
  const student1 = await prisma.user.create({
    data: {
      name: 'Alex Thompson',
      email: 'alex.thompson@zenithedu.com',
      role: UserRole.Student,
      avatar: '/avatars/alex.jpg',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Sophia Martinez',
      email: 'sophia.martinez@zenithedu.com',
      role: UserRole.Student,
      avatar: '/avatars/sophia.jpg',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Michael Brown',
      email: 'michael.brown@zenithedu.com',
      role: UserRole.Student,
      avatar: '/avatars/michael.jpg',
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: 'Emma Davis',
      email: 'emma.davis@zenithedu.com',
      role: UserRole.Student,
      avatar: '/avatars/emma.jpg',
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: 'Oliver Wilson',
      email: 'oliver.wilson@zenithedu.com',
      role: UserRole.Student,
      avatar: '/avatars/oliver.jpg',
    },
  });

  // Create student records
  const studentRecord1 = await prisma.student.create({
    data: {
      name: 'Alex Thompson',
      rollNo: 'CS2024001',
      department: 'Computer Science',
      attendance: 95.0,
      cgpa: 3.8,
      feesStatus: FeesStatus.Paid,
      status: 'Active',
      userId: student1.id,
    },
  });

  const studentRecord2 = await prisma.student.create({
    data: {
      name: 'Sophia Martinez',
      rollNo: 'CS2024002',
      department: 'Mathematics',
      attendance: 88.5,
      cgpa: 3.9,
      feesStatus: FeesStatus.Paid,
      status: 'Active',
      userId: student2.id,
    },
  });

  const studentRecord3 = await prisma.student.create({
    data: {
      name: 'Michael Brown',
      rollNo: 'CS2024003',
      department: 'Physics',
      attendance: 92.0,
      cgpa: 3.7,
      feesStatus: FeesStatus.Pending,
      status: 'Active',
      userId: student3.id,
    },
  });

  const studentRecord4 = await prisma.student.create({
    data: {
      name: 'Emma Davis',
      rollNo: 'CS2024004',
      department: 'Computer Science',
      attendance: 85.0,
      cgpa: 3.6,
      feesStatus: FeesStatus.Paid,
      status: 'Active',
      userId: student4.id,
    },
  });

  const studentRecord5 = await prisma.student.create({
    data: {
      name: 'Oliver Wilson',
      rollNo: 'CS2024005',
      department: 'Mathematics',
      attendance: 90.0,
      cgpa: 3.95,
      feesStatus: FeesStatus.Paid,
      status: 'Active',
      userId: student5.id,
    },
  });

  // Create courses
  const course1 = await prisma.course.create({
    data: {
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      instructor: 'Dr. Alan Turing',
      credits: 4,
      progress: 75,
      instructorId: teacher1.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: 'Database Management Systems',
      code: 'CS302',
      instructor: 'Prof. Ada Lovelace',
      credits: 3,
      progress: 45,
      instructorId: teacher1.id,
    },
  });

  // Enroll students in courses
  await prisma.courseStudent.createMany({
    data: [
      { courseId: course1.id, studentId: studentRecord1.id },
      { courseId: course2.id, studentId: studentRecord1.id },
      { courseId: course1.id, studentId: studentRecord2.id },
    ],
  });

  // Create notices
  await prisma.notice.createMany({
    data: [
      {
        title: 'Mid-term Examination Schedule',
        content: 'Mid-term examinations will start from next week. Please check the detailed schedule.',
        date: new Date(),
        priority: Priority.High,
        author: 'Admin User',
        authorId: adminUser.id,
      },
      {
        title: 'Library Closure Notice',
        content: 'The library will be closed for maintenance this weekend.',
        date: new Date(),
        priority: Priority.Medium,
        author: 'Admin User',
        authorId: adminUser.id,
      },
    ],
  });

  // Create books
  await prisma.book.createMany({
    data: [
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        category: 'Computer Science',
        status: BookStatus.Available,
        coverUrl: '/books/algorithms.jpg',
      },
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz',
        category: 'Database',
        status: BookStatus.Issued,
        coverUrl: '/books/database.jpg',
      },
    ],
  });

  // Create hostel rooms
  await prisma.hostelRoom.createMany({
    data: [
      {
        number: 'A-101',
        type: RoomType.Single,
        capacity: 1,
        occupied: 1,
        floor: 1,
        status: RoomStatus.Full,
        fee: 5000,
      },
      {
        number: 'A-102',
        type: RoomType.Double,
        capacity: 2,
        occupied: 1,
        floor: 1,
        status: RoomStatus.Available,
        fee: 3000,
      },
    ],
  });

  // Create bus routes
  await prisma.busRoute.createMany({
    data: [
      {
        routeNumber: 'R-01',
        destination: 'City Center',
        driver: 'John Smith',
        departureTime: '08:00 AM',
        status: 'OnTime',
      },
      {
        routeNumber: 'R-02',
        destination: 'Airport',
        driver: 'Mike Johnson',
        departureTime: '09:00 AM',
        status: 'Delayed',
      },
    ],
  });

  // Create fee records
  await prisma.feeRecord.createMany({
    data: [
      {
        type: 'Tuition Fee',
        amount: 50000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: FeesStatus.Paid,
        invoiceId: 'INV-2024-001',
        studentId: studentRecord1.id,
      },
      {
        type: 'Hostel Fee',
        amount: 15000,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: FeesStatus.Pending,
        invoiceId: 'INV-2024-002',
        studentId: studentRecord2.id,
      },
    ],
  });

  // Create live classes
  await prisma.liveClass.createMany({
    data: [
      {
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Trees and Traversal',
        instructor: 'Dr. Alan Turing',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        duration: '1 hour',
        status: ClassStatus.Upcoming,
        platform: Platform.Zoom,
      },
      {
        subject: 'Database Management',
        topic: 'SQL Joins and Relationships',
        instructor: 'Prof. Ada Lovelace',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        duration: '1.5 hours',
        status: ClassStatus.Live,
        platform: Platform.GoogleMeet,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
