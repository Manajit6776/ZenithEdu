const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Names from Thailand, Vietnam, Malaysia, and China
const asianNames = [
  // Thai names
  'Somchai Chaiyadej', 'Malee Jitpakdee', 'Sakda Tantrakul', 'Nonglak Boonmee', 'Kamon Sukkasem',
  'Siriporn Srisuk', 'Wichai Meesil', 'Preecha Anantapong', 'Rattana Wongwiset', 'Taweesak Singholaka',
  'Narongchai Kiatkraisong', 'Duangjai Phothong', 'Surachai Dechatham', 'Kamala Sukjai', 'Tanongsak Promrak',
  'Busaba Klinhom', 'Chalermchai Boonyarak', 'Narumon Sawatdee', 'Somsak Ritthirong', 'Wanida Kaewkanya',
  
  // Vietnamese names
  'Nguyen Van Minh', 'Tran Thi Mai', 'Le Quang Huy', 'Pham Thi Hoa', 'Hoang Van Nam',
  'Vu Thi Lan', 'Dang Van Hung', 'Bui Thi Thu', 'Do Van Quan', 'Nguyen Thi Ngoc',
  'Pham Van Tuan', 'Tran Thi Anh', 'Le Van Dung', 'Hoang Thi Mai', 'Vu Van Hieu',
  'Dang Thi Trang', 'Bui Van Son', 'Do Thi Hong', 'Nguyen Van Khoa', 'Tran Thi Linh',
  
  // Malaysian names
  'Ahmad bin Mohd', 'Siti Aishah binti Omar', 'Muhammad bin Hassan', 'Nurul Huda binti Rahman', 'Ramesh a/l Krishnan',
  'Chong Wei Ming', 'Fatimah binti Ismail', 'Mohd Aziz bin Abdullah', 'Priya a/l Kumar', 'Wong Mei Ling',
  'Zainal Abidin bin Yusof', 'Aishah binti Ahmad', 'Khalid bin Mohamad', 'Norhayati binti Sulaiman', 'David a/l Tan',
  'Mariam binti Ibrahim', 'Hassan bin Ali', 'Siti Fatimah binti Zakaria', 'Rajendran a/l Muthu', 'Lim Siew Mei',
  
  // Chinese names
  'Zhang Wei', 'Li Na', 'Wang Fang', 'Chen Ming', 'Liu Hua',
  'Yang Jie', 'Huang Li', 'Zhao Qiang', 'Wu Xiaoli', 'Zhou Tao',
  'Xu Fei', 'Sun Mei', 'Ma Jun', 'Zhu Ling', 'Hu Wei',
  'Guo Jing', 'Lin Ping', 'He Min', 'Gao Lei', 'Luo Yan'
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
    // Generate a random number between 6000 and 9999 to avoid conflicts
    rollNumber = String(6000 + Math.floor(Math.random() * 4000)).padStart(4, '0');
    fullRollNo = `${deptCode}${year}${rollNumber}`;
    
    if (!usedRollNumbers.has(fullRollNo)) {
      usedRollNumbers.add(fullRollNo);
      return fullRollNo;
    }
  }
  
  // If we couldn't find a unique number after many tries, throw an error
  throw new Error(`Could not generate a unique roll number for ${department}`);
}

async function updateChemicalNamesAndAddStudents() {
  try {
    console.log('🔄 Updating students with chemical compound names...');
    
    // First, get all students with chemical compound names
    const chemicalCompounds = [
      'Iron', 'Copper', 'Silver', 'Gold', 'Mercury', 'Lead', 'Tin', 'Zinc', 'Nickel', 'Cobalt',
      'Chromium', 'Manganese', 'Magnesium', 'Calcium', 'Sodium', 'Potassium', 'Aluminum', 'Titanium',
      'Platinum', 'Palladium', 'Rhodium', 'Iridium', 'Osmium', 'Ruthenium', 'Radium', 'Uranium',
      'Francium', 'Rubidium', 'Cesium', 'Barium', 'Strontium', 'Lithium', 'Beryllium', 'Boron',
      'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Chlorine', 'Argon', 'Helium', 'Hydrogen',
      'Sulfur', 'Phosphorus', 'Silicon', 'Arsenic', 'Selenium', 'Bromine', 'Iodine', 'Krypton',
      'Xenon', 'Radon', 'Cobalt', 'Zinc', 'Copper', 'Silver', 'Gold', 'Platinum', 'Mercury',
      'Radium', 'Francium', 'Uranium', 'Plutonium', 'Neptunium', 'Americium', 'Curium', 'Berkelium'
    ];
    
    const chemicalStudents = await prisma.student.findMany({
      include: {
        user: true
      }
    });
    
    let updatedCount = 0;
    
    for (const student of chemicalStudents) {
      const firstName = student.name.split(' ')[0];
      if (chemicalCompounds.includes(firstName)) {
        // Get a random Asian name
        const newName = asianNames[Math.floor(Math.random() * asianNames.length)];
        const newEmail = generateEmail(newName, student.department);
        
        // Update student name
        await prisma.student.update({
          where: { id: student.id },
          data: { name: newName }
        });
        
        // Update user name and email
        await prisma.user.update({
          where: { id: student.userId },
          data: { 
            name: newName,
            email: newEmail
          }
        });
        
        console.log(`✅ Updated: ${student.name} → ${newName} (${newEmail})`);
        updatedCount++;
      }
    }
    
    console.log(`\n📊 Updated ${updatedCount} students with Asian names`);
    
    // Now add 3 new students
    console.log('\n➕ Adding 3 new students...');
    
    for (let i = 0; i < 3; i++) {
      const name = asianNames[Math.floor(Math.random() * asianNames.length)];
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
      
      console.log(`✅ Added new student: ${name} (${student.rollNo})`);
    }
    
    console.log('\n🎉 Task completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateChemicalNamesAndAddStudents();
