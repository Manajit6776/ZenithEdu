const API_BASE = '/api';

// Helper to handle fetch with timeout
const fetchWithFallback = async (url: string, options?: RequestInit) => {
  console.log('API: Attempting to fetch:', url);
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000) // Increased to 10 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('API: Successfully fetched:', url);
    return response;
  } catch (error) {
    console.warn('Backend connection failed:', error);
    console.warn('API: Falling back to mock data for:', url);
    throw error;
  }
};

// Type definitions - using any for simplicity
type User = any;
type Student = any;
type Course = any;
type Book = any;
type Notice = any;
type HostelRoom = any;
type BusRoute = any;
type FeeRecord = any;
type LiveClass = any;
type TimetableEntry = any;

// User API
export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/users`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: 'mock-admin', name: 'System Administrator', email: 'admin@zenithedu.com', role: 'Admin', avatar: '' },
        { id: 'mock-t1', name: 'Prof. Sarah Williams', email: 'sarah.williams@zenithedu.com', role: 'Teacher', avatar: '' },
        { id: 'mock-t2', name: 'Dr. James Chen', email: 'james.chen@zenithedu.com', role: 'Teacher', avatar: '' },
        { id: 'mock-t3', name: 'Prof. Emily Rodriguez', email: 'emily.rodriguez@zenithedu.com', role: 'Teacher', avatar: '' },
        { id: 'mock-s1', name: 'Alex Thompson', email: 'alex.thompson@zenithedu.com', role: 'Student', avatar: '' },
        { id: 'mock-s2', name: 'Sophia Martinez', email: 'sophia.martinez@zenithedu.com', role: 'Student', avatar: '' },
        { id: 'mock-s3', name: 'Michael Brown', email: 'michael.brown@zenithedu.com', role: 'Student', avatar: '' },
        { id: 'mock-s4', name: 'Emma Davis', email: 'emma.davis@zenithedu.com', role: 'Student', avatar: '' },
        { id: 'mock-s5', name: 'Oliver Wilson', email: 'oliver.wilson@zenithedu.com', role: 'Student', avatar: '' },
      ];
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/users/${id}`);
      return response.json();
    } catch (error) {
      return null;
    }
  },

  async createUser(data: User): Promise<User> {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Student API
export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/students`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: '1', name: 'Alice Johnson', rollNo: '101', department: 'Computer Science', email: 'alice@zenithedu.edu', attendance: 95, cgpa: 3.8, feesStatus: 'Paid', status: 'Active', photo: 'https://picsum.photos/seed/alice/200/200.jpg' },
        { id: '2', name: 'Bob Smith', rollNo: '102', department: 'Electrical', email: 'bob@zenithedu.edu', attendance: 88, cgpa: 3.5, feesStatus: 'Pending', status: 'Active', photo: 'https://picsum.photos/seed/bob/200/200.jpg' },
        { id: '3', name: 'Charlie Brown', rollNo: '103', department: 'Mechanical', email: 'charlie@zenithedu.edu', attendance: 92, cgpa: 3.6, feesStatus: 'Overdue', status: 'Inactive', photo: 'https://picsum.photos/seed/charlie/200/200.jpg' },
      ];
    }
  },

  async getStudentById(id: string): Promise<Student | null> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/students/${id}`);
      return response.json();
    } catch (error) {
      return null;
    }
  },

  async createStudent(data: Student): Promise<Student> {
    const response = await fetchWithFallback(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    console.log('API updateStudent called with id:', id, 'data:', JSON.stringify(data, null, 2));
    const response = await fetchWithFallback(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteStudent(id: string): Promise<Student> {
    const response = await fetchWithFallback(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getStudentByUserId(userId: string): Promise<Student | null> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/students/user/${userId}`);
      return response.json();
    } catch (error) {
      return null;
    }
  },
};

// Course API
export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE}/courses`);
    return response.json();
  },

  async getCourseById(id: string): Promise<Course | null> {
    const response = await fetch(`${API_BASE}/courses/${id}`);
    return response.json();
  },

  async createCourse(data: Course): Promise<Course> {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Book API
export const bookService = {
  async getAllBooks(): Promise<Book[]> {
    const response = await fetch(`${API_BASE}/books`);
    return response.json();
  },

  async getBookById(id: string): Promise<Book | null> {
    const response = await fetch(`${API_BASE}/books/${id}`);
    return response.json();
  },

  async createBook(data: Book): Promise<Book> {
    const response = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    const response = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async searchBooks(query: string): Promise<Book[]> {
    const response = await fetch(`${API_BASE}/books/search?q=${query}`);
    return response.json();
  },
};

// Notice API
export const noticeService = {
  async getAllNotices(): Promise<Notice[]> {
    const response = await fetch(`${API_BASE}/notices`);
    return response.json();
  },

  async getNoticeById(id: string): Promise<Notice | null> {
    const response = await fetch(`${API_BASE}/notices/${id}`);
    return response.json();
  },

  async createNotice(data: Notice): Promise<Notice> {
    const response = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    const response = await fetch(`${API_BASE}/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteNotice(id: string): Promise<Notice> {
    const response = await fetch(`${API_BASE}/notices/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Hostel Room API
export const hostelService = {
  async getAllRooms(): Promise<HostelRoom[]> {
    const response = await fetch(`${API_BASE}/hostel-rooms`);
    return response.json();
  },

  async getRoomById(id: string): Promise<HostelRoom | null> {
    const response = await fetch(`${API_BASE}/hostel-rooms/${id}`);
    return response.json();
  },

  async createHostelRoom(data: any): Promise<HostelRoom> {
    const response = await fetch(`${API_BASE}/hostel-rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateRoom(id: string, data: Partial<HostelRoom>): Promise<HostelRoom> {
    const response = await fetch(`${API_BASE}/hostel-rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Bus Route API
export const transportService = {
  async getAllRoutes(): Promise<BusRoute[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/routes`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: '1', routeNumber: 'R1', destination: 'City Center', driver: 'John Doe', departureTime: '08:00 AM', status: 'OnTime' },
        { id: '2', routeNumber: 'R2', destination: 'North Campus', driver: 'Jane Smith', departureTime: '08:30 AM', status: 'Delayed' },
        { id: '3', routeNumber: 'R3', destination: 'South Gate', driver: 'Mike Johnson', departureTime: '09:00 AM', status: 'OnTime' },
      ];
    }
  },

  async getRouteById(id: string): Promise<BusRoute | null> {
    const response = await fetch(`${API_BASE}/routes/${id}`);
    return response.json();
  },

  async createBusRoute(data: BusRoute): Promise<BusRoute> {
    const response = await fetch(`${API_BASE}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateRoute(id: string, data: Partial<BusRoute>): Promise<BusRoute> {
    const response = await fetch(`${API_BASE}/routes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteRoute(id: string): Promise<BusRoute> {
    const response = await fetch(`${API_BASE}/routes/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Teachers API (client)
export const teacherService = {
  async getTeachers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE}/teachers`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Fetch teachers error:', error);
      return [];
    }
  }
};

// Appointments API
export const appointmentService = {
  async getAppointments(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        console.warn('Appointments API error:', response.status);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Appointments fetch failed:', error);
      return [];
    }
  },

  async createAppointment(data: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('Create appointment failed:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(id: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('Update appointment status failed:', error);
      throw error;
    }
  }
};

// Fee Record API
export const feeService = {
  async getAllFeeRecords(): Promise<FeeRecord[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/fee-records`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: '1', type: 'Tuition Fee - Sem 5', amount: 1500, dueDate: '2024-12-30', status: 'Pending', invoiceId: 'INV-001' },
        { id: '2', type: 'Hostel Fee - Sem 5', amount: 800, dueDate: '2024-12-30', status: 'Paid', invoiceId: 'INV-002' },
        { id: '3', type: 'Library Fine', amount: 15, dueDate: '2024-11-15', status: 'Overdue', invoiceId: 'INV-003' },
        { id: '4', type: 'Transport Fee', amount: 200, dueDate: '2024-12-30', status: 'Paid', invoiceId: 'INV-004' },
      ];
    }
  },

  async getFeeRecordById(id: string): Promise<FeeRecord | null> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/fee-records/${id}`);
      return response.json();
    } catch (error) {
      return null;
    }
  },

  async createFeeRecord(data: FeeRecord): Promise<FeeRecord> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/fee-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  },

  async updateFeeRecord(id: string, data: Partial<FeeRecord>): Promise<FeeRecord> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/fee-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  },

  async updateFeeStatus(id: string, status: string): Promise<FeeRecord> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/fee-records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  },

  async downloadInvoice(id: string): Promise<void> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/fee-records/${id}/invoice`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw error;
    }
  },

  async getFeeRecordsByStudent(studentId: string): Promise<FeeRecord[]> {
    const response = await fetch(`${API_BASE}/fee-records/student/${studentId}`);
    return response.json();
  },
};

// Live Class API
export const liveClassService = {
  async getAllLiveClasses(): Promise<LiveClass[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/live-classes`);
      const data = await response.json();

      // If server returns empty array, provide mock data for a better initial experience
      if (Array.isArray(data) && data.length === 0) {
        return [
          { id: '1', subject: 'Data Structures', topic: 'Binary Trees', instructor: 'Dr. Alan Turing', date: '2024-03-20', startTime: '10:00', duration: '60 min', status: 'Live', platform: 'Zoom', meetingLink: 'https://zoom.us' },
          { id: '2', subject: 'Operating Systems', topic: 'Process Scheduling', instructor: 'Dr. Linus Torvalds', date: '2024-03-21', startTime: '14:00', duration: '90 min', status: 'Upcoming', platform: 'GoogleMeet', meetingLink: 'https://meet.google.com' },
          { id: '3', subject: 'Computer Networks', topic: 'TCP/IP Protocol', instructor: 'Prof. Tim Berners-Lee', date: '2024-03-22', startTime: '16:00', duration: '60 min', status: 'Upcoming', platform: 'MicrosoftTeams', meetingLink: 'https://teams.microsoft.com' },
        ];
      }
      return data;
    } catch (error) {
      // Return mock data on connection error
      return [
        { id: '1', subject: 'Data Structures', topic: 'Binary Trees', instructor: 'Dr. Alan Turing', date: '2024-03-20', startTime: '10:00', duration: '60 min', status: 'Live', platform: 'Zoom', meetingLink: 'https://zoom.us' },
        { id: '2', subject: 'Operating Systems', topic: 'Process Scheduling', instructor: 'Dr. Linus Torvalds', date: '2024-03-21', startTime: '14:00', duration: '90 min', status: 'Upcoming', platform: 'GoogleMeet', meetingLink: 'https://meet.google.com' },
        { id: '3', subject: 'Computer Networks', topic: 'TCP/IP Protocol', instructor: 'Prof. Tim Berners-Lee', date: '2024-03-22', startTime: '16:00', duration: '60 min', status: 'Upcoming', platform: 'MicrosoftTeams', meetingLink: 'https://teams.microsoft.com' },
      ];
    }
  },

  async getLiveClassById(id: string): Promise<LiveClass | null> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/live-classes/${id}`);
      return response.json();
    } catch (error) {
      return null;
    }
  },

  async createLiveClass(data: LiveClass): Promise<LiveClass> {
    const response = await fetchWithFallback(`${API_BASE}/live-classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateLiveClass(id: string, data: Partial<LiveClass>): Promise<LiveClass> {
    const response = await fetchWithFallback(`${API_BASE}/live-classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Attendance API
export const attendanceService = {
  async getAttendance(params?: { date?: string; teacherId?: string; studentId?: string }): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      if (params?.date) query.append('date', params.date);
      if (params?.teacherId) query.append('teacherId', params.teacherId);
      if (params?.studentId) query.append('studentId', params.studentId);

      const response = await fetchWithFallback(`${API_BASE}/attendance?${query}`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: '1', studentId: '1', date: '2024-12-28', status: 'Present', subject: 'Computer Science' },
        { id: '2', studentId: '2', date: '2024-12-28', status: 'Present', subject: 'Computer Science' },
        { id: '3', studentId: '3', date: '2024-12-28', status: 'Absent', subject: 'Computer Science' },
      ];
    }
  },

  async markAttendance(data: any): Promise<any> {
    const response = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async markBulkAttendance(attendanceRecords: any[]): Promise<any> {
    const response = await fetch(`${API_BASE}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendanceRecords),
    });
    return response.json();
  },
};

// Assignment API
export const assignmentService = {
  async getAllAssignments(): Promise<any[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/assignments`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: '1', title: 'Database Schema Project', description: 'Design a comprehensive database schema for an e-commerce platform', subject: 'System Design', courseCode: 'CS-302', dueDate: '2024-12-28', maxScore: 100, type: 'Project', status: 'Published', teacherId: '1' },
        { id: '2', title: 'Microservices Architecture', description: 'Design a microservices architecture for a social media application', subject: 'System Design', courseCode: 'CS-302', dueDate: '2024-12-30', maxScore: 100, type: 'Design', status: 'Published', teacherId: '1' },
        { id: '3', title: 'Vector Space Analysis', description: 'Solve problems related to vector spaces and linear transformations', subject: 'Linear Algebra', courseCode: 'MATH-201', dueDate: '2024-12-29', maxScore: 100, type: 'Problem Set', status: 'Published', teacherId: '2' },
      ];
    }
  },

  async getAllSubmissions(): Promise<any[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/submissions`);
      return response.json();
    } catch (error) {
      return [];
    }
  },

  async getAssignmentById(id: string): Promise<any | null> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/assignments/${id}`);
      return response.json();
    } catch (error) {
      return null;
    }
  },

  async createAssignment(data: any): Promise<any> {
    const response = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateAssignment(id: string, data: Partial<any>): Promise<any> {
    const response = await fetch(`${API_BASE}/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteAssignment(id: string): Promise<any> {
    const response = await fetch(`${API_BASE}/assignments/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getSubmissionsByAssignment(assignmentId: string): Promise<any[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/assignments/${assignmentId}/submissions`);
      return response.json();
    } catch (error) {
      return [];
    }
  },

  async getSubmissionsByStudent(studentId: string): Promise<any[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/students/${studentId}/submissions`);
      return response.json();
    } catch (error) {
      return [];
    }
  },
};

// Grade API
export const gradeService = {
  async getStudentGrades(studentId: string): Promise<any> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/students/${studentId}/grades`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return {
        cgpa: 3.8,
        overallAssignmentScore: 85.5,
        grades: [
          { courseId: '1', courseName: 'System Design', grade: 'A-', score: 92, credits: 4 },
          { courseId: '2', courseName: 'Linear Algebra', grade: 'B+', score: 87, credits: 3 },
          { courseId: '3', courseName: 'Database Schema Project', grade: 'A', score: 95, credits: 2 },
        ]
      };
    }
  },

  async updateStudentGrade(studentId: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE}/students/${studentId}/grades`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Timetable API
export const timetableService = {
  async getTimetable(params?: { studentId?: string; teacherId?: string; classId?: string }): Promise<TimetableEntry[]> {
    try {
      const query = new URLSearchParams();
      if (params?.studentId) query.append('studentId', params.studentId);
      if (params?.teacherId) query.append('teacherId', params.teacherId);
      if (params?.classId) query.append('classId', params.classId);

      const response = await fetchWithFallback(`${API_BASE}/timetable?${query}`);
      return response.json();
    } catch (error) {
      // Return mock data on error
      return [
        { id: '1', day: 'Monday', time: '09:00 AM', subject: 'Data Structures', room: 'LH-101', type: 'Lecture', instructor: 'Dr. Alan Turing' },
        { id: '2', day: 'Monday', time: '11:00 AM', subject: 'DBMS Lab', room: 'Lab-2', type: 'Lab', instructor: 'Prof. Linus Torvalds' },
        { id: '3', day: 'Tuesday', time: '10:00 AM', subject: 'Operating Systems', room: 'LH-102', type: 'Lecture', instructor: 'Dr. Linus Torvalds' },
        { id: '4', day: 'Tuesday', time: '02:00 PM', subject: 'Computer Networks', room: 'LH-101', type: 'Lecture', instructor: 'Prof. Tim Berners-Lee' },
        { id: '5', day: 'Wednesday', time: '09:00 AM', subject: 'AI & ML', room: 'LH-103', type: 'Lecture', instructor: 'Dr. Geoffrey Hinton' },
        { id: '6', day: 'Wednesday', time: '01:00 PM', subject: 'Library Hour', room: 'Central Lib', type: 'Self Study', instructor: null },
        { id: '7', day: 'Thursday', time: '11:00 AM', subject: 'Web Technologies', room: 'Lab-1', type: 'Lab', instructor: 'Prof. Tim Berners-Lee' },
        { id: '8', day: 'Friday', time: '10:00 AM', subject: 'Project Review', room: 'Conf Room', type: 'Review', instructor: 'Dr. Alan Turing' },
        { id: '9', day: 'Friday', time: '03:00 PM', subject: 'Sports', room: 'Ground', type: 'Activity', instructor: 'Coach Johnson' },
      ];
    }
  },

  async getTimetableByDay(day: string): Promise<TimetableEntry[]> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/timetable/day/${day}`);
      return response.json();
    } catch (error) {
      // Return filtered mock data
      const mockData = [
        { id: '1', day: 'Monday', time: '09:00 AM', subject: 'Data Structures', room: 'LH-101', type: 'Lecture', instructor: 'Dr. Alan Turing' },
        { id: '2', day: 'Monday', time: '11:00 AM', subject: 'DBMS Lab', room: 'Lab-2', type: 'Lab', instructor: 'Prof. Linus Torvalds' },
        { id: '3', day: 'Tuesday', time: '10:00 AM', subject: 'Operating Systems', room: 'LH-102', type: 'Lecture', instructor: 'Dr. Linus Torvalds' },
        { id: '4', day: 'Tuesday', time: '02:00 PM', subject: 'Computer Networks', room: 'LH-101', type: 'Lecture', instructor: 'Prof. Tim Berners-Lee' },
        { id: '5', day: 'Wednesday', time: '09:00 AM', subject: 'AI & ML', room: 'LH-103', type: 'Lecture', instructor: 'Dr. Geoffrey Hinton' },
        { id: '6', day: 'Wednesday', time: '01:00 PM', subject: 'Library Hour', room: 'Central Lib', type: 'Self Study', instructor: null },
        { id: '7', day: 'Thursday', time: '11:00 AM', subject: 'Web Technologies', room: 'Lab-1', type: 'Lab', instructor: 'Prof. Tim Berners-Lee' },
        { id: '8', day: 'Friday', time: '10:00 AM', subject: 'Project Review', room: 'Conf Room', type: 'Review', instructor: 'Dr. Alan Turing' },
        { id: '9', day: 'Friday', time: '03:00 PM', subject: 'Sports', room: 'Ground', type: 'Activity', instructor: 'Coach Johnson' },
      ];
      return mockData.filter(entry => entry.day === day);
    }
  },

  async createTimetableEntry(data: TimetableEntry): Promise<TimetableEntry> {
    const response = await fetchWithFallback(`${API_BASE}/timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateTimetableEntry(id: string, data: Partial<TimetableEntry>): Promise<TimetableEntry> {
    const response = await fetchWithFallback(`${API_BASE}/timetable/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteTimetableEntry(id: string): Promise<TimetableEntry> {
    const response = await fetchWithFallback(`${API_BASE}/timetable/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async exportTimetable(format: 'pdf' | 'excel'): Promise<Blob | string> {
    try {
      const response = await fetchWithFallback(`${API_BASE}/timetable/export?format=${format}`);
      return await response.blob();
    } catch (error) {
      // Fallback: create a simple text export
      const data = await this.getTimetable();
      const textContent = data.map(entry =>
        `${entry.day} - ${entry.time}: ${entry.subject} (${entry.room}) - ${entry.type}`
      ).join('\n');

      return textContent;
    }
  },
};
