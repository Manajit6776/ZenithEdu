import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function ensureStudentAssignments() {
  try {
    console.log('📚 Ensuring every student has at least 4 graded assignments...');
    
    // Get all students and their current submissions
    const students = await prisma.student.findMany({
      include: {
        submissions: {
          include: {
            assignment: true
          }
        }
      }
    });
    
    // Get all assignments
    const assignments = await prisma.assignment.findMany();
    
    // Group assignments by department
    const assignmentsByDept = {};
    assignments.forEach(assignment => {
      const dept = assignment.subject.includes('Computer') ? 'Computer Science' :
                  assignment.subject.includes('Mechanical') ? 'Mechanical Engineering' :
                  assignment.subject.includes('Electrical') ? 'Electrical Engineering' :
                  assignment.subject.includes('Civil') ? 'Civil Engineering' :
                  assignment.subject.includes('Business') ? 'Business Administration' : 'Computer Science';
      
      if (!assignmentsByDept[dept]) {
        assignmentsByDept[dept] = [];
      }
      assignmentsByDept[dept].push(assignment);
    });
    
    let totalNewSubmissions = 0;
    
    for (const student of students) {
      const currentSubmissions = student.submissions.length;
      const neededSubmissions = Math.max(0, 4 - currentSubmissions);
      
      if (neededSubmissions > 0) {
        console.log(`\n👤 Student: ${student.name} (${student.rollNo}) - ${student.department}`);
        console.log(`   Current submissions: ${currentSubmissions}`);
        console.log(`   Need to add: ${neededSubmissions} submissions`);
        
        // Get assignments from student's department
        const deptAssignments = assignmentsByDept[student.department] || assignmentsByDept['Computer Science'];
        
        // Select random assignments that student hasn't submitted
        const availableAssignments = deptAssignments.filter(assignment => 
          !student.submissions.some(sub => sub.assignmentId === assignment.id)
        );
        
        // Take needed number of assignments (or all available if less)
        const assignmentsToSubmit = availableAssignments
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(neededSubmissions, availableAssignments.length));
        
        for (const assignment of assignmentsToSubmit) {
          // Generate realistic score based on student's CGPA
          const baseScore = (student.cgpa / 10) * assignment.maxScore;
          const variance = assignment.maxScore * 0.1;
          const score = Math.max(assignment.maxScore * 0.4, 
            Math.min(assignment.maxScore, baseScore + (Math.random() - 0.5) * variance * 2));
          
          // Create submission
          const submission = await prisma.submission.create({
            data: {
              assignmentId: assignment.id,
              studentId: student.id,
              content: `This is ${student.name}'s submission for ${assignment.title}. I have worked through all the requirements and demonstrated my understanding of the key concepts covered in this ${assignment.subject} assignment.`,
              score: score,
              status: 'Graded',
              submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Submitted within last 14 days
              gradedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Graded within last 7 days
              feedback: generateFeedback(score, assignment.maxScore, student.cgpa)
            }
          });
          
          console.log(`   ✅ Submitted: ${assignment.title} (${score.toFixed(1)}/${assignment.maxScore})`);
          totalNewSubmissions++;
        }
        
        if (assignmentsToSubmit.length < neededSubmissions) {
          console.log(`   ⚠️  Only ${assignmentsToSubmit.length} assignments available for this department`);
        }
      } else {
        console.log(`✅ ${student.name} already has ${currentSubmissions} submissions`);
      }
    }
    
    // Update student overall assignment scores
    console.log('\n🔄 Updating overall assignment scores...');
    for (const student of students) {
      const updatedSubmissions = await prisma.submission.findMany({
        where: { studentId: student.id },
        include: { assignment: true }
      });
      
      if (updatedSubmissions.length > 0) {
        const totalScore = updatedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
        const totalMaxScore = updatedSubmissions.reduce((sum, sub) => sum + sub.assignment.maxScore, 0);
        const overallScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
        
        await prisma.student.update({
          where: { id: student.id },
          data: { overallAssignmentScore: overallScore }
        });
      }
    }
    
    console.log('\n🎉 Successfully ensured all students have assignments!');
    console.log('📊 Summary:');
    console.log(`- Total students processed: ${students.length}`);
    console.log(`- New submissions created: ${totalNewSubmissions}`);
    console.log('- Every student now has at least 4 graded assignments');
    console.log('- Overall assignment scores have been updated');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateFeedback(score, maxScore, studentCgpa) {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) {
    return `Outstanding work! Your score of ${score.toFixed(1)}/${maxScore} (${percentage.toFixed(1)}%) demonstrates excellent understanding of the material. Keep up the exceptional performance!`;
  } else if (percentage >= 80) {
    return `Very good work! You scored ${score.toFixed(1)}/${maxScore} (${percentage.toFixed(1)}%). Your understanding is solid with minor areas for improvement.`;
  } else if (percentage >= 70) {
    return `Good effort! Your score of ${score.toFixed(1)}/${maxScore} (${percentage.toFixed(1)}%) shows competence, but review the concepts you struggled with.`;
  } else if (percentage >= 60) {
    return `Satisfactory work. You scored ${score.toFixed(1)}/${maxScore} (${percentage.toFixed(1)}%). Please review the material and consider seeking additional help.`;
  } else {
    return `Needs improvement. Your score of ${score.toFixed(1)}/${maxScore} (${percentage.toFixed(1)}%) indicates difficulty with the material. Please review thoroughly and consider attending office hours.`;
  }
}

ensureStudentAssignments();
