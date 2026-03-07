import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@edunexus.com',
      role: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff',
      department: 'Administration',
      specialization: 'System Management',
      experience: 10,
    },
  });
  console.log(`Created admin: ${adminUser.name}`);

  // Create Teachers
  const teachers = [
    {
      name: 'Dr. Alan Turing',
      email: 'turing@edunexus.com',
      role: 'Teacher',
      avatar: 'https://ui-avatars.com/api/?name=Alan+Turing&background=6366f1&color=fff',
      department: 'Computer Science',
      specialization: 'Artificial Intelligence',
      experience: 15,
    },
    {
      name: 'Dr. Ada Lovelace',
      email: 'ada@edunexus.com',
      role: 'Teacher',
      avatar: 'https://ui-avatars.com/api/?name=Ada+Lovelace&background=a855f7&color=fff',
      department: 'Computer Science',
      specialization: 'Programming',
      experience: 12,
    },
    {
      name: 'Prof. Albert Einstein',
      email: 'einstein@edunexus.com',
      role: 'Teacher',
      avatar: 'https://ui-avatars.com/api/?name=Albert+Einstein&background=3b82f6&color=fff',
      department: 'Physics',
      specialization: 'Theoretical Physics',
      experience: 20,
    },
    {
      name: 'Dr. Marie Curie',
      email: 'curie@edunexus.com',
      role: 'Teacher',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Curie&background=10b981&color=fff',
      department: 'Chemistry',
      specialization: 'Radiochemistry',
      experience: 18,
    },
  ];

  const createdTeachers = [];
  for (const teacher of teachers) {
    const createdTeacher = await prisma.user.create({
      data: teacher,
    });
    createdTeachers.push(createdTeacher);
    console.log(`Created teacher: ${teacher.name}`);
  }

  // Create Students
  const students = [
    {
      name: 'John Smith',
      email: 'john.smith@edunexus.com',
      rollNo: 'CS2021001',
      department: 'Computer Science',
      attendance: 85.5,
      cgpa: 3.8,
      feesStatus: 'Paid',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=0ea5e9&color=fff',
    },
    {
      name: 'Emily Johnson',
      email: 'emily.johnson@edunexus.com',
      rollNo: 'CS2021002',
      department: 'Computer Science',
      attendance: 92.0,
      cgpa: 3.9,
      feesStatus: 'Paid',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Johnson&background=ec4899&color=fff',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@edunexus.com',
      rollNo: 'CS2021003',
      department: 'Computer Science',
      attendance: 78.5,
      cgpa: 3.4,
      feesStatus: 'Pending',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=8b5cf6&color=fff',
    },
    {
      name: 'Sarah Davis',
      email: 'sarah.davis@edunexus.com',
      rollNo: 'PH2021001',
      department: 'Physics',
      attendance: 95.0,
      cgpa: 3.7,
      feesStatus: 'Paid',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Davis&background=f59e0b&color=fff',
    },
    {
      name: 'James Wilson',
      email: 'james.wilson@edunexus.com',
      rollNo: 'PH2021002',
      department: 'Physics',
      attendance: 88.0,
      cgpa: 3.6,
      feesStatus: 'Overdue',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=ef4444&color=fff',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@edunexus.com',
      rollNo: 'CH2021001',
      department: 'Chemistry',
      attendance: 91.5,
      cgpa: 3.5,
      feesStatus: 'Paid',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=10b981&color=fff',
    },
    {
      name: 'Robert Taylor',
      email: 'robert.taylor@edunexus.com',
      rollNo: 'CH2021002',
      department: 'Chemistry',
      attendance: 82.0,
      cgpa: 3.3,
      feesStatus: 'Pending',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Robert+Taylor&background=6366f1&color=fff',
    },
    {
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@edunexus.com',
      rollNo: 'CS2021004',
      department: 'Computer Science',
      attendance: 96.0,
      cgpa: 4.0,
      feesStatus: 'Paid',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Jennifer+Martinez&background=a855f7&color=fff',
    },
  ];

  const createdStudents = [];
  for (const student of students) {
    // Create user first
    const user = await prisma.user.create({
      data: {
        name: student.name,
        email: student.email,
        role: 'Student',
        avatar: student.avatar,
      },
    });

    // Then create student record (excluding email and avatar as they're in User model)
    const { email, avatar, ...studentData } = student;
    const createdStudent = await prisma.student.create({
      data: {
        ...studentData,
        userId: user.id,
      },
    });
    createdStudents.push(createdStudent);
    console.log(`Created student: ${student.name}`);
  }

  // Create Courses
  const courses = [
    {
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      instructor: 'Dr. Alan Turing',
      credits: 4,
      progress: 75,
      instructorId: createdTeachers[0].id,
    },
    {
      name: 'Database Management Systems',
      code: 'CS302',
      instructor: 'Dr. Ada Lovelace',
      credits: 3,
      progress: 60,
      instructorId: createdTeachers[1].id,
    },
    {
      name: 'Quantum Mechanics',
      code: 'PH301',
      instructor: 'Prof. Albert Einstein',
      credits: 4,
      progress: 85,
      instructorId: createdTeachers[2].id,
    },
    {
      name: 'Organic Chemistry',
      code: 'CH301',
      instructor: 'Dr. Marie Curie',
      credits: 3,
      progress: 70,
      instructorId: createdTeachers[3].id,
    },
  ];

  for (const course of courses) {
    const createdCourse = await prisma.course.create({
      data: course,
    });
    console.log(`Created course: ${course.name}`);

    // Enroll students in courses (computer science students in CS courses, etc.)
    const relevantStudents = createdStudents.filter(student => {
      if (course.code.startsWith('CS')) return student.department === 'Computer Science';
      if (course.code.startsWith('PH')) return student.department === 'Physics';
      if (course.code.startsWith('CH')) return student.department === 'Chemistry';
      return false;
    });

    for (const student of relevantStudents) {
      await prisma.courseStudent.create({
        data: {
          courseId: createdCourse.id,
          studentId: student.id,
        },
      });
    }
  }

  // Create Fee Records
  const feeRecords = [];
  for (const student of createdStudents) {
    const feeAmount = student.department === 'Computer Science' ? 5000 : 4500;
    
    feeRecords.push({
      type: 'Tuition Fee',
      amount: feeAmount,
      dueDate: new Date('2024-01-31'),
      status: student.feesStatus,
      invoiceId: `INV-${student.rollNo}-${Date.now()}`,
      studentId: student.id,
    });
  }

  for (const feeRecord of feeRecords) {
    await prisma.feeRecord.create({
      data: feeRecord,
    });
  }

  // Create some Books
  const books = [
    {
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      status: 'Available',
      coverUrl: 'https://picsum.photos/seed/algorithms/200/300',
    },
    {
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      category: 'Computer Science',
      status: 'Issued',
      coverUrl: 'https://picsum.photos/seed/database/200/300',
    },
    {
      title: 'Quantum Physics: A Beginner\'s Guide',
      author: 'Alastair I.M. Rae',
      category: 'Physics',
      status: 'Available',
      coverUrl: 'https://picsum.photos/seed/quantum/200/300',
    },
    {
      title: 'Organic Chemistry',
      author: 'Paula Yurkanis Bruice',
      category: 'Chemistry',
      status: 'Reserved',
      coverUrl: 'https://picsum.photos/seed/organic/200/300',
    },
  ];

  for (const book of books) {
    await prisma.book.create({
      data: book,
    });
    console.log(`Created book: ${book.title}`);
  }

  // Create some Notices
  const notices = [
    {
      title: 'Mid-Term Examination Schedule',
      content: 'Mid-term examinations will begin from next week. Please check the schedule.',
      date: new Date(),
      priority: 'High',
      author: 'Dr. Alan Turing',
      authorId: createdTeachers[0].id,
    },
    {
      title: 'Fee Payment Reminder',
      content: 'Last date for fee payment is approaching. Please pay your fees on time.',
      date: new Date(),
      priority: 'Medium',
      author: 'Dr. Ada Lovelace',
      authorId: createdTeachers[1].id,
    },
  ];

  for (const notice of notices) {
    await prisma.notice.create({
      data: notice,
    });
    console.log(`Created notice: ${notice.title}`);
  }

  // Create Bus Routes
  const busRoutes = [
    {
      routeNumber: 'R001',
      destination: 'Downtown Campus',
      driver: 'John Davis',
      departureTime: '08:00 AM',
      status: 'OnTime',
    },
    {
      routeNumber: 'R002',
      destination: 'North Campus',
      driver: 'Michael Smith',
      departureTime: '08:15 AM',
      status: 'OnTime',
    },
    {
      routeNumber: 'R003',
      destination: 'South Campus',
      driver: 'Robert Johnson',
      departureTime: '08:30 AM',
      status: 'Delayed',
    },
    {
      routeNumber: 'R004',
      destination: 'East Campus',
      driver: 'William Brown',
      departureTime: '07:45 AM',
      status: 'OnTime',
    },
    {
      routeNumber: 'R005',
      destination: 'West Campus',
      driver: 'James Wilson',
      departureTime: '08:00 AM',
      status: 'Departed',
    },
  ];

  for (const route of busRoutes) {
    await prisma.busRoute.create({
      data: route,
    });
    console.log(`Created bus route: ${route.routeNumber} - ${route.destination}`);
  }

  // Create Hostel Rooms
  const hostelRooms = [
    {
      number: 'A101',
      type: 'Single',
      capacity: 1,
      occupied: 1,
      floor: 1,
      status: 'Full',
      fee: 5000,
    },
    {
      number: 'A102',
      type: 'Single',
      capacity: 1,
      occupied: 0,
      floor: 1,
      status: 'Available',
      fee: 5000,
    },
    {
      number: 'B201',
      type: 'Double',
      capacity: 2,
      occupied: 2,
      floor: 2,
      status: 'Full',
      fee: 3000,
    },
    {
      number: 'B202',
      type: 'Double',
      capacity: 2,
      occupied: 1,
      floor: 2,
      status: 'Available',
      fee: 3000,
    },
    {
      number: 'C301',
      type: 'Shared',
      capacity: 4,
      occupied: 3,
      floor: 3,
      status: 'Available',
      fee: 2000,
    },
  ];

  for (const room of hostelRooms) {
    await prisma.hostelRoom.create({
      data: room,
    });
    console.log(`Created hostel room: ${room.number}`);
  }

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
