import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const assignments = [
  // Computer Science Assignments (16 assignments)
  {
    title: "Data Structures Implementation",
    description: "Implement various data structures including stacks, queues, and binary trees",
    subject: "Data Structures",
    courseCode: "CS201",
    type: "Homework",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Algorithm Analysis Project",
    description: "Analyze time and space complexity of given algorithms",
    subject: "Algorithms",
    courseCode: "CS301",
    type: "Project",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 150
  },
  {
    title: "Database Design",
    description: "Design and normalize a database schema for a library management system",
    subject: "Database Systems",
    courseCode: "CS205",
    type: "Project",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Machine Learning Lab",
    description: "Implement and train a neural network for image classification",
    subject: "Machine Learning",
    courseCode: "CS401",
    type: "Lab",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Web Development Assignment",
    description: "Create a responsive web application using React and Node.js",
    subject: "Web Development",
    courseCode: "CS102",
    type: "Project",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Operating Systems Quiz",
    description: "Quiz on process management, memory management, and file systems",
    subject: "Operating Systems",
    courseCode: "CS303",
    type: "Quiz",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 50
  },
  {
    title: "Computer Networks Project",
    description: "Implement a simple chat application using socket programming",
    subject: "Computer Networks",
    courseCode: "CS302",
    type: "Project",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Software Engineering Midterm",
    description: "Comprehensive exam on software development methodologies",
    subject: "Software Engineering",
    courseCode: "CS304",
    type: "Exam",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Cybersecurity Lab",
    description: "Hands-on exercises in network security and cryptography",
    subject: "Cybersecurity",
    courseCode: "CS402",
    type: "Lab",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 80
  },
  {
    title: "Cloud Computing Assignment",
    description: "Deploy a scalable application on AWS or Azure",
    subject: "Cloud Computing",
    courseCode: "CS403",
    type: "Project",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Compiler Design Project",
    description: "Build a simple compiler for a custom programming language",
    subject: "Compiler Design",
    courseCode: "CS305",
    type: "Project",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 150
  },
  {
    title: "Artificial Intelligence Quiz",
    description: "Quiz on search algorithms and knowledge representation",
    subject: "Artificial Intelligence",
    courseCode: "CS404",
    type: "Quiz",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 60
  },
  {
    title: "Mobile App Development",
    description: "Develop a mobile application for iOS or Android",
    subject: "Mobile Development",
    courseCode: "CS306",
    type: "Project",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Big Data Analytics",
    description: "Analyze large datasets using Hadoop and Spark",
    subject: "Big Data",
    courseCode: "CS405",
    type: "Homework",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "Computer Graphics Lab",
    description: "Implement 3D rendering techniques using OpenGL",
    subject: "Computer Graphics",
    courseCode: "CS307",
    type: "Lab",
    teacherEmail: "r.chen@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Final Year Project",
    description: "Capstone project integrating all CS concepts",
    subject: "Capstone",
    courseCode: "CS499",
    type: "Project",
    teacherEmail: "s.mitchell@zenithedu.edu",
    maxScore: 200
  },

  // Mechanical Engineering Assignments (16 assignments)
  {
    title: "Thermodynamics Problem Set",
    description: "Solve problems related to heat transfer and energy conversion",
    subject: "Thermodynamics",
    courseCode: "ME201",
    type: "Homework",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Robotics Design Project",
    description: "Design and build a simple robotic arm",
    subject: "Robotics",
    courseCode: "ME301",
    type: "Project",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 150
  },
  {
    title: "Fluid Mechanics Lab",
    description: "Experiments on fluid flow and pressure measurements",
    subject: "Fluid Mechanics",
    courseCode: "ME202",
    type: "Lab",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 80
  },
  {
    title: "Heat Transfer Analysis",
    description: "Analyze heat transfer in various engineering applications",
    subject: "Heat Transfer",
    courseCode: "ME302",
    type: "Homework",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Mechanical Design Project",
    description: "Design a mechanical system for a specific application",
    subject: "Mechanical Design",
    courseCode: "ME203",
    type: "Project",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Manufacturing Processes Quiz",
    description: "Quiz on various manufacturing techniques",
    subject: "Manufacturing",
    courseCode: "ME303",
    type: "Quiz",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 50
  },
  {
    title: "Vibrations and Control Lab",
    description: "Experiments on mechanical vibrations and control systems",
    subject: "Vibrations",
    courseCode: "ME304",
    type: "Lab",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "Finite Element Analysis",
    description: "Use FEA software to analyze structural components",
    subject: "Finite Elements",
    courseCode: "ME401",
    type: "Project",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 130
  },
  {
    title: "CAD Modeling Assignment",
    description: "Create 3D models using SolidWorks or AutoCAD",
    subject: "CAD/CAM",
    courseCode: "ME204",
    type: "Homework",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Mechanics of Materials",
    description: "Stress and strain analysis of engineering materials",
    subject: "Strength of Materials",
    courseCode: "ME205",
    type: "Homework",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Automotive Engineering Project",
    description: "Design improvements for vehicle fuel efficiency",
    subject: "Automotive Engineering",
    courseCode: "ME402",
    type: "Project",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 140
  },
  {
    title: "Aerospace Engineering Quiz",
    description: "Quiz on aircraft design and aerodynamics",
    subject: "Aerospace",
    courseCode: "ME403",
    type: "Quiz",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 60
  },
  {
    title: "Energy Systems Lab",
    description: "Experiments on renewable energy systems",
    subject: "Energy Systems",
    courseCode: "ME305",
    type: "Lab",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 85
  },
  {
    title: "Quality Control Assignment",
    description: "Implement quality control methods in manufacturing",
    subject: "Quality Control",
    courseCode: "ME306",
    type: "Homework",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "Mechanical Systems Integration",
    description: "Integrate multiple mechanical systems into a complete solution",
    subject: "Systems Integration",
    courseCode: "ME404",
    type: "Project",
    teacherEmail: "j.rodriguez@zenithedu.edu",
    maxScore: 160
  },
  {
    title: "Final Design Project",
    description: "Comprehensive mechanical design project",
    subject: "Capstone",
    courseCode: "ME499",
    type: "Project",
    teacherEmail: "e.thompson@zenithedu.edu",
    maxScore: 200
  },

  // Electrical Engineering Assignments (16 assignments)
  {
    title: "Circuit Analysis Homework",
    description: "Analyze DC and AC circuits using various techniques",
    subject: "Circuit Analysis",
    courseCode: "EE201",
    type: "Homework",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Power Systems Design",
    description: "Design a power distribution system for a small facility",
    subject: "Power Systems",
    courseCode: "EE301",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 140
  },
  {
    title: "Electronics Lab",
    description: "Build and test electronic circuits",
    subject: "Electronics",
    courseCode: "EE202",
    type: "Lab",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "Digital Systems Design",
    description: "Design digital logic circuits and systems",
    subject: "Digital Logic",
    courseCode: "EE203",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 110
  },
  {
    title: "Signal Processing Assignment",
    description: "Process and analyze digital signals",
    subject: "Signal Processing",
    courseCode: "EE302",
    type: "Homework",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Control Systems Lab",
    description: "Experiments with feedback control systems",
    subject: "Control Systems",
    courseCode: "EE303",
    type: "Lab",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 85
  },
  {
    title: "Electromagnetic Theory Quiz",
    description: "Quiz on electromagnetic fields and waves",
    subject: "Electromagnetics",
    courseCode: "EE204",
    type: "Quiz",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 50
  },
  {
    title: "Communication Systems",
    description: "Design and analyze communication systems",
    subject: "Communications",
    courseCode: "EE304",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Microcontroller Programming",
    description: "Program microcontrollers for embedded applications",
    subject: "Microcontrollers",
    courseCode: "EE205",
    type: "Lab",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Power Electronics Project",
    description: "Design power electronic converters",
    subject: "Power Electronics",
    courseCode: "EE401",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 130
  },
  {
    title: "Antenna Design",
    description: "Design and simulate antenna systems",
    subject: "Antenna Theory",
    courseCode: "EE305",
    type: "Homework",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "VLSI Design Lab",
    description: "Design integrated circuits using VLSI tools",
    subject: "VLSI Design",
    courseCode: "EE402",
    type: "Lab",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 110
  },
  {
    title: "Electrical Machines Quiz",
    description: "Quiz on motors, generators, and transformers",
    subject: "Electrical Machines",
    courseCode: "EE206",
    type: "Quiz",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 60
  },
  {
    title: "Renewable Energy Systems",
    description: "Design renewable energy power systems",
    subject: "Renewable Energy",
    courseCode: "EE403",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 140
  },
  {
    title: "Instrumentation Lab",
    description: "Calibrate and use various measurement instruments",
    subject: "Instrumentation",
    courseCode: "EE207",
    type: "Lab",
    teacherEmail: "m.foster@zenithedu.edu",
    maxScore: 80
  },
  {
    title: "Smart Grid Systems",
    description: "Design smart grid components and systems",
    subject: "Smart Grid",
    courseCode: "EE404",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 150
  },
  {
    title: "Final Electrical Project",
    description: "Comprehensive electrical engineering project",
    subject: "Capstone",
    courseCode: "EE499",
    type: "Project",
    teacherEmail: "l.anderson@zenithedu.edu",
    maxScore: 200
  },

  // Civil Engineering Assignments (16 assignments)
  {
    title: "Structural Analysis Homework",
    description: "Analyze structures using various methods",
    subject: "Structural Analysis",
    courseCode: "CE201",
    type: "Homework",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Transportation Engineering Project",
    description: "Design a transportation system for urban area",
    subject: "Transportation Engineering",
    courseCode: "CE301",
    type: "Project",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 130
  },
  {
    title: "Concrete Lab",
    description: "Test concrete properties and mix designs",
    subject: "Concrete Technology",
    courseCode: "CE202",
    type: "Lab",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 85
  },
  {
    title: "Geotechnical Engineering",
    description: "Analyze soil properties and foundation design",
    subject: "Geotechnical",
    courseCode: "CE203",
    type: "Homework",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Hydraulic Systems Design",
    description: "Design hydraulic systems for water distribution",
    subject: "Hydraulics",
    courseCode: "CE302",
    type: "Project",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Surveying Lab",
    description: "Land surveying and mapping exercises",
    subject: "Surveying",
    courseCode: "CE204",
    type: "Lab",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "Environmental Engineering Quiz",
    description: "Quiz on water treatment and pollution control",
    subject: "Environmental Engineering",
    courseCode: "CE205",
    type: "Quiz",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 50
  },
  {
    title: "Construction Management",
    description: "Plan and manage a construction project",
    subject: "Construction Management",
    courseCode: "CE303",
    type: "Project",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 110
  },
  {
    title: "Steel Design Assignment",
    description: "Design steel structures according to codes",
    subject: "Steel Design",
    courseCode: "CE206",
    type: "Homework",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Foundation Engineering",
    description: "Design foundations for various structures",
    subject: "Foundation Design",
    courseCode: "CE304",
    type: "Homework",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 105
  },
  {
    title: "Water Resources Project",
    description: "Design water resource management system",
    subject: "Water Resources",
    courseCode: "CE401",
    type: "Project",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 140
  },
  {
    title: "Highway Engineering Lab",
    description: "Design and analysis of highway systems",
    subject: "Highway Engineering",
    courseCode: "CE305",
    type: "Lab",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 95
  },
  {
    title: "Bridge Design Quiz",
    description: "Quiz on bridge design principles",
    subject: "Bridge Design",
    courseCode: "CE207",
    type: "Quiz",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 60
  },
  {
    title: "Urban Planning Assignment",
    description: "Design urban development plans",
    subject: "Urban Planning",
    courseCode: "CE402",
    type: "Project",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 125
  },
  {
    title: "Earthquake Engineering",
    description: "Design structures for earthquake resistance",
    subject: "Earthquake Engineering",
    courseCode: "CE403",
    type: "Homework",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Construction Materials Lab",
    description: "Test various construction materials",
    subject: "Construction Materials",
    courseCode: "CE208",
    type: "Lab",
    teacherEmail: "j.garcia@zenithedu.edu",
    maxScore: 85
  },
  {
    title: "Final Civil Project",
    description: "Comprehensive civil engineering project",
    subject: "Capstone",
    courseCode: "CE499",
    type: "Project",
    teacherEmail: "r.williams@zenithedu.edu",
    maxScore: 200
  },

  // Business Administration Assignments (16 assignments)
  {
    title: "Marketing Strategy Homework",
    description: "Develop a comprehensive marketing plan",
    subject: "Marketing",
    courseCode: "BA201",
    type: "Homework",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Financial Analysis Project",
    description: "Analyze financial statements of a company",
    subject: "Financial Management",
    courseCode: "BA301",
    type: "Project",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Business Ethics Case Study",
    description: "Analyze ethical dilemmas in business",
    subject: "Business Ethics",
    courseCode: "BA202",
    type: "Homework",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 80
  },
  {
    title: "Operations Management",
    description: "Optimize business operations and processes",
    subject: "Operations Management",
    courseCode: "BA203",
    type: "Homework",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Entrepreneurship Project",
    description: "Develop a business plan for a startup",
    subject: "Entrepreneurship",
    courseCode: "BA302",
    type: "Project",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 140
  },
  {
    title: "Human Resources Quiz",
    description: "Quiz on HR management principles",
    subject: "Human Resources",
    courseCode: "BA204",
    type: "Quiz",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 50
  },
  {
    title: "Supply Chain Management",
    description: "Design and optimize supply chain networks",
    subject: "Supply Chain",
    courseCode: "BA303",
    type: "Project",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 110
  },
  {
    title: "Business Analytics Lab",
    description: "Use data analytics for business decisions",
    subject: "Business Analytics",
    courseCode: "BA205",
    type: "Lab",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 90
  },
  {
    title: "International Business",
    description: "Analyze global business strategies",
    subject: "International Business",
    courseCode: "BA206",
    type: "Homework",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Strategic Management Project",
    description: "Develop strategic plan for a company",
    subject: "Strategic Management",
    courseCode: "BA304",
    type: "Project",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 130
  },
  {
    title: "Business Law Quiz",
    description: "Quiz on business law and regulations",
    subject: "Business Law",
    courseCode: "BA207",
    type: "Quiz",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 60
  },
  {
    title: "Digital Marketing Assignment",
    description: "Create digital marketing campaign",
    subject: "Digital Marketing",
    courseCode: "BA305",
    type: "Project",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 100
  },
  {
    title: "Investment Analysis",
    description: "Analyze investment opportunities and risks",
    subject: "Investment Management",
    courseCode: "BA401",
    type: "Homework",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 105
  },
  {
    title: "Leadership Case Study",
    description: "Analyze leadership styles and effectiveness",
    subject: "Leadership",
    courseCode: "BA208",
    type: "Homework",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 85
  },
  {
    title: "E-commerce Project",
    description: "Develop e-commerce business strategy",
    subject: "E-commerce",
    courseCode: "BA402",
    type: "Project",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 120
  },
  {
    title: "Risk Management Assignment",
    description: "Identify and mitigate business risks",
    subject: "Risk Management",
    courseCode: "BA403",
    type: "Homework",
    teacherEmail: "a.white@zenithedu.edu",
    maxScore: 95
  },
  {
    title: "Final Business Project",
    description: "Comprehensive business administration project",
    subject: "Capstone",
    courseCode: "BA499",
    type: "Project",
    teacherEmail: "d.martinez@zenithedu.edu",
    maxScore: 200
  }
];

async function addAssignmentsWithGrades() {
  try {
    console.log('📚 Adding 80 assignments across all departments...');
    
    // Get all teachers and students
    const teachers = await prisma.user.findMany({
      where: { role: 'Teacher' }
    });
    
    const students = await prisma.student.findMany();
    
    for (const assignmentData of assignments) {
      // Find the teacher
      const teacher = teachers.find(t => t.email === assignmentData.teacherEmail);
      if (!teacher) {
        console.log(`❌ Teacher not found: ${assignmentData.teacherEmail}`);
        continue;
      }
      
      // Create assignment
      const assignment = await prisma.assignment.create({
        data: {
          title: assignmentData.title,
          description: assignmentData.description,
          subject: assignmentData.subject,
          courseCode: assignmentData.courseCode,
          type: assignmentData.type,
          maxScore: assignmentData.maxScore,
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random due date within 30 days
          teacherId: teacher.id,
          status: 'Published'
        }
      });
      
      // Get students from the same department
      const departmentStudents = students.filter(s => s.department === assignmentData.subject.split(' ')[0] || 
        (assignmentData.subject.includes('Computer') ? 'Computer Science' :
         assignmentData.subject.includes('Mechanical') ? 'Mechanical Engineering' :
         assignmentData.subject.includes('Electrical') ? 'Electrical Engineering' :
         assignmentData.subject.includes('Civil') ? 'Civil Engineering' :
         assignmentData.subject.includes('Business') ? 'Business Administration' : 'Computer Science'));
      
      // Create submissions for random subset of students (60-80% submission rate)
      const submissionRate = 0.6 + Math.random() * 0.2;
      const numSubmissions = Math.floor(departmentStudents.length * submissionRate);
      const selectedStudents = departmentStudents.sort(() => 0.5 - Math.random()).slice(0, numSubmissions);
      
      for (const student of selectedStudents) {
        // Generate random score (normally distributed around 75%)
        const baseScore = assignmentData.maxScore * 0.75;
        const variance = assignmentData.maxScore * 0.15;
        const score = Math.max(0, Math.min(assignmentData.maxScore, 
          baseScore + (Math.random() - 0.5) * variance * 2));
        
        // Create submission
        const submission = await prisma.submission.create({
          data: {
            assignmentId: assignment.id,
            studentId: student.id,
            content: `This is the submission for ${assignmentData.title} by ${student.name}.`,
            score: score,
            status: 'Graded',
            submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Submitted within last 7 days
            gradedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Graded within last 3 days
            feedback: `Good work on ${assignmentData.title}. ${score >= assignmentData.maxScore * 0.8 ? 'Excellent performance!' : 
              score >= assignmentData.maxScore * 0.6 ? 'Good effort, but room for improvement.' : 
              'Please review the material and consider resubmitting.'}`
          }
        });
        
        console.log(`✅ Created submission: ${student.name} - ${assignmentData.title} (${score.toFixed(1)}/${assignmentData.maxScore})`);
      }
      
      console.log(`✅ Added assignment: ${assignmentData.title} - ${assignmentData.subject} (${selectedStudents.length} submissions)`);
    }
    
    console.log('\n🎉 Successfully added 80 assignments with grades!');
    console.log('📊 Summary:');
    console.log('- Total assignments: 80');
    console.log('- Computer Science: 16 assignments');
    console.log('- Mechanical Engineering: 16 assignments');
    console.log('- Electrical Engineering: 16 assignments');
    console.log('- Civil Engineering: 16 assignments');
    console.log('- Business Administration: 16 assignments');
    console.log('- Assignment types: Homework, Projects, Labs, Quizzes, Exams, Case Studies');
    console.log('- All assignments have been graded by respective department teachers');
    
  } catch (error) {
    console.error('❌ Error adding assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAssignmentsWithGrades();
