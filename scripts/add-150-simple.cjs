const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// North Indian names
const northIndianNames = [
  // Previous names...
  'Aarav Sharma', 'Vihaan Patel', 'Aanya Gupta', 'Arjun Singh', 'Ananya Reddy',
  'Ishaan Kumar', 'Saanvi Desai', 'Vivaan Malhotra', 'Anika Choudhary', 'Aditya Joshi',
  'Diya Iyer', 'Reyansh Nair', 'Myra Chatterjee', 'Aarush Khanna', 'Avni Kapoor',
  'Shaurya Chawla', 'Kiara Mehra', 'Arnav Saxena', 'Anaya Bajaj', 'Vihaan Grover',
  'Aarohi Trivedi', 'Ishita Joshi', 'Kabir Malhotra', 'Anvi Chawla', 'Vivaan Khanna',
  'Anika Nair', 'Ayaan Kapoor', 'Myra Reddy', 'Reyansh Iyer', 'Diya Saxena',
  'Aarav Choudhary', 'Avni Joshi', 'Arjun Mehra', 'Ananya Grover', 'Ishaan Trivedi',
  'Saanvi Khanna', 'Vihaan Nair', 'Anika Reddy', 'Aarush Iyer', 'Avni Saxena',
  'Shaurya Choudhary', 'Kiara Joshi', 'Arnav Mehra', 'Anaya Grover', 'Vihaan Trivedi',
  'Aarohi Khanna', 'Ishita Nair', 'Kabir Reddy', 'Anvi Iyer', 'Vivaan Saxena',
  'Anika Choudhary', 'Ayaan Joshi', 'Myra Mehra', 'Reyansh Grover', 'Diya Trivedi',
  'Aarav Khanna', 'Avni Nair', 'Arjun Reddy', 'Ananya Iyer', 'Ishaan Saxena',
  'Saanvi Choudhary', 'Vihaan Joshi', 'Anika Mehra', 'Aarush Grover', 'Avni Trivedi',
  'Shaurya Khanna', 'Kiara Nair', 'Arnav Reddy', 'Anaya Iyer', 'Vihaan Saxena',
  'Aarohi Choudhary', 'Ishita Joshi', 'Kabir Mehra', 'Anvi Grover', 'Vivaan Trivedi',
  'Anika Khanna', 'Ayaan Nair', 'Myra Reddy', 'Reyansh Iyer', 'Diya Saxena',
  'Aarav Choudhary', 'Avni Joshi', 'Arjun Mehra', 'Ananya Grover', 'Ishaan Trivedi',
  'Saanvi Khanna', 'Vihaan Nair', 'Anika Reddy', 'Aarush Iyer', 'Avni Saxena'
];

// Mixed names (Eastern European, Russian, Japanese)
const mixedNames = [
  // Previous names...
  'Ivan Petrov', 'Yuki Tanaka', 'Dmitri Ivanov', 'Hiroshi Yamamoto', 'Anastasia Volkova',
  'Nikolai Sokolov', 'Yui Nakamura', 'Mikhail Orlov', 'Svetlana Kuznetsova', 'Takeshi Sato',
  'Alexei Petrenko', 'Miyuki Suzuki', 'Sergei Volkov', 'Yoko Takahashi', 'Vladimir Popov',
  'Elena Smirnova', 'Yuto Ito', 'Igor Sokolov', 'Natalia Petrova', 'Kenji Watanabe',
  'Dmitri Kozlov', 'Airi Kobayashi', 'Andrei Mikhailov', 'Yukiko Yamada', 'Viktor Zaitsev',
  'Olga Romanova', 'Haruto Suzuki', 'Alexei Morozov', 'Irina Volkova', 'Daiki Tanaka',
  'Sergei Orlov', 'Yumi Nakamura', 'Mikhail Petrov', 'Elena Sokolova', 'Ryota Yamamoto',
  'Dmitri Volkov', 'Sakura Ito', 'Alexei Kuznetsov', 'Natalia Ivanova', 'Kaito Suzuki',
  'Igor Petrenko', 'Yui Takahashi', 'Sergei Smirnov', 'Yoko Yamamoto', 'Vladimir Orlov',
  'Anastasia Sokolova', 'Takeshi Suzuki', 'Mikhail Volkov', 'Yuki Nakamura', 'Dmitri Petrov',
  'Elena Ivanova', 'Hiroshi Tanaka', 'Nikolai Orlov', 'Svetlana Smirnova', 'Yuto Watanabe',
  'Alexei Sokolov', 'Miyuki Yamamoto', 'Sergei Petrov', 'Yoko Suzuki', 'Viktor Ivanov',
  'Olga Volkova', 'Kenji Nakamura', 'Dmitri Smirnov', 'Airi Tanaka', 'Andrei Orlov',
  'Natalia Sokolova', 'Haruto Yamamoto', 'Alexei Petrov', 'Yukiko Suzuki', 'Sergei Ivanov',
  'Irina Smirnova', 'Daiki Nakamura', 'Mikhail Sokolov', 'Yumi Tanaka', 'Dmitri Orlov',
  'Elena Volkova', 'Ryota Suzuki', 'Igor Petrov', 'Sakura Yamamoto', 'Alexei Smirnov',
  'Natalia Ivanova', 'Kaito Nakamura', 'Sergei Sokolov', 'Yoko Tanaka', 'Vladimir Petrov',
  'Anastasia Orlova', 'Takeshi Yamamoto', 'Mikhail Smirnov', 'Yuki Suzuki', 'Dmitri Ivanov',
  'Elena Sokolova', 'Hiroshi Nakamura', 'Nikolai Petrov', 'Svetlana Volkova', 'Yuto Tanaka'
];

const departments = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Biology'
];

function getDepartmentCode(department) {
  const deptCodes = {
    'Computer Science': 'CS',
    'Electrical Engineering': 'EE',
    'Mechanical Engineering': 'ME',
    'Civil Engineering': 'CE',
    'Business Administration': 'BA',
    'Mathematics': 'MATH',
    'Physics': 'PHY',
    'Chemistry': 'CHEM',
    'Biology': 'BIO'
  };
  return deptCodes[department] || 'GEN';
}

function generateRandomStudentData() {
  const attendance = 70 + Math.floor(Math.random() * 26); // 70-95%
  const presentDays = Math.floor((attendance / 100) * 100); // Assuming 100 total days
  const absentDays = Math.floor(((100 - attendance) / 100) * 100);
  const lateDays = Math.floor(Math.random() * 10);
  const cgpa = (7 + Math.random() * 3).toFixed(2); // 7.00-9.99
  const feesStatus = Math.random() > 0.3 ? 'Paid' : 'Pending';
  const status = 'Active';
  const overallAssignmentScore = 60 + Math.floor(Math.random() * 40); // 60-99
  
  return {
    attendance,
    presentDays,
    absentDays,
    lateDays,
    cgpa,
    feesStatus,
    status,
    overallAssignmentScore
  };
}

function generateEmail(name, department) {
  const firstName = name.toLowerCase().split(' ')[0];
  const lastName = name.toLowerCase().split(' ').slice(-1)[0];
  const randomNum = Math.floor(Math.random() * 999) + 1;
  return `${firstName}.${lastName}${randomNum}@zenithedu.edu`;
}

// Track used roll numbers to avoid duplicates
const usedRollNumbers = new Set();

function generateUniqueRollNo(department) {
  const year = '2021';
  const deptCode = getDepartmentCode(department);
  let rollNumber, fullRollNo;
  
  // Try up to 1000 times to find an unused roll number
  for (let i = 0; i < 1000; i++) {
    // Generate a random number between 5000 and 9999 to avoid conflicts
    rollNumber = String(5000 + Math.floor(Math.random() * 5000)).padStart(4, '0');
    fullRollNo = `${deptCode}${year}${rollNumber}`;
    
    if (!usedRollNumbers.has(fullRollNo)) {
      usedRollNumbers.add(fullRollNo);
      return fullRollNo;
    }
  }
  
  // If we couldn't find a unique number after many tries, throw an error
  throw new Error(`Could not generate a unique roll number for ${department}`);
}

async function addNewStudents() {
  try {
    console.log('Adding 150 new students to database...');
    
    // Add 90 North Indian students
    for (let i = 0; i < 90; i++) {
      const name = northIndianNames[i];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const studentData = generateRandomStudentData();
      
      const user = await prisma.user.create({
        data: {
          name: name,
          email: generateEmail(name, department),
          role: 'Student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          department: department,
          specialization: '',
          experience: 0
        }
      });

      const rollNo = generateUniqueRollNo(department);
      console.log(`Creating student: ${name} with rollNo: ${rollNo} in department: ${department}`);

      const student = await prisma.student.create({
        data: {
          name: name,
          rollNo: rollNo,
          department: department,
          attendance: studentData.attendance,
          presentDays: studentData.presentDays,
          absentDays: studentData.absentDays,
          lateDays: studentData.lateDays,
          cgpa: parseFloat(studentData.cgpa),
          feesStatus: studentData.feesStatus,
          status: studentData.status,
          overallAssignmentScore: studentData.overallAssignmentScore,
          userId: user.id
        }
      });
      
      console.log(`Added North Indian student: ${name} (${student.rollNo})`);
    }
    
    // Add 60 mixed students (Eastern European, Russian, Japanese)
    for (let i = 0; i < 60; i++) {
      const name = mixedNames[i];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const studentData = generateRandomStudentData();
      
      const user = await prisma.user.create({
        data: {
          name: name,
          email: generateEmail(name, department),
          role: 'Student',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          department: department,
          specialization: '',
          experience: 0
        }
      });

      const rollNo = generateUniqueRollNo(department);
      console.log(`Creating student: ${name} with rollNo: ${rollNo} in department: ${department}`);

      const student = await prisma.student.create({
        data: {
          name: name,
          rollNo: rollNo,
          department: department,
          attendance: studentData.attendance,
          presentDays: studentData.presentDays,
          absentDays: studentData.absentDays,
          lateDays: studentData.lateDays,
          cgpa: parseFloat(studentData.cgpa),
          feesStatus: studentData.feesStatus,
          status: studentData.status,
          overallAssignmentScore: studentData.overallAssignmentScore,
          userId: user.id
        }
      });
      
      console.log(`Added mixed student: ${name} (${student.rollNo})`);
    }
    
    console.log('Successfully added 150 new students!');
    
  } catch (error) {
    console.error('Error adding students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewStudents();
