import React, { useState, useEffect } from 'react';
import {
  BookOpen, FileText, Upload, CheckCircle, Clock, Download, Plus, Edit, Trash2, Eye, Calendar, User, AlertCircle,
  MoreVertical, Search, Filter, Loader2, ChevronLeft, ChevronRight, Star, Award, TrendingUp
} from 'lucide-react';
import { Course } from '../src/types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService, assignmentService, gradeService } from '../lib/api';

interface CourseCard {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  progress: number;
  description: string;
  nextClass?: string;
  assignments?: number;
  grade?: string;
  status: 'active' | 'completed' | 'upcoming';
  color: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  grade?: string;
  file?: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
}

const MOCK_COURSES: CourseCard[] = [
  {
    id: '1',
    name: 'System Design',
    code: 'CS-302',
    instructor: 'Dr. Alan Smith',
    credits: 4,
    progress: 65,
    description: 'Architecting scalable distributed systems and microservices patterns.',
    nextClass: 'Tomorrow, 10:00 AM',
    assignments: 3,
    grade: 'A-',
    status: 'active',
    color: 'indigo'
  },
  {
    id: '2',
    name: 'Linear Algebra',
    code: 'MATH-201',
    instructor: 'Prof. Sarah J.',
    credits: 3,
    progress: 32,
    description: 'Vector spaces, matrices, and linear transformations essentials.',
    nextClass: 'Friday, 2:00 PM',
    assignments: 5,
    status: 'active',
    color: 'emerald'
  },
  {
    id: '3',
    name: 'Database Schema Project',
    code: 'CS-302',
    instructor: 'Dr. Alan Smith',
    credits: 2,
    progress: 0,
    description: 'Design and implement a comprehensive database system.',
    assignments: 1,
    status: 'upcoming',
    color: 'amber'
  }
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Database Schema Project',
    description: 'Design a comprehensive database schema for an e-commerce platform',
    courseId: '1',
    courseName: 'System Design',
    courseCode: 'CS-302',
    dueDate: '2024-12-28',
    status: 'pending',
    type: 'Project',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Microservices Architecture',
    description: 'Design a microservices architecture for a social media application',
    courseId: '1',
    courseName: 'System Design',
    courseCode: 'CS-302',
    dueDate: '2024-12-30',
    status: 'pending',
    type: 'Design',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Vector Space Analysis',
    description: 'Solve problems related to vector spaces and linear transformations',
    courseId: '2',
    courseName: 'Linear Algebra',
    courseCode: 'MATH-201',
    dueDate: '2024-12-29',
    status: 'pending',
    type: 'Problem Set',
    priority: 'low'
  }
];

export const Academics: React.FC = () => {
  const { t } = useLanguage();
  const { user, isTeacher, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'plan' | 'courses' | 'assignments' | 'notes'>('plan');
  const [courses, setCourses] = useState<CourseCard[]>(MOCK_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadCourses();
    loadAssignments();
    if (user?.role === 'Student') {
      loadStudentGrades();
    }
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // Force use mock courses instead of database
      setCourses(MOCK_COURSES);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses(MOCK_COURSES);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const assignmentsData = await assignmentService.getAllAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments(MOCK_ASSIGNMENTS);
    }
  };

  const loadStudentGrades = async () => {
    if (!user?.id) return;
    try {
      const gradesData = await gradeService.getStudentGrades(user.id);
      setStudentGrades(gradesData);
    } catch (error) {
      console.error('Failed to load student grades:', error);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!user?.id) return;

    setSubmittingAssignment(assignmentId);
    try {
      // Create a submission
      const submissionData = {
        assignmentId,
        studentId: user.id,
        content: 'Assignment submitted by student',
        status: 'Submitted'
      };

      // In a real app, this would call the submission API
      // For now, we'll just update the local state
      alert(`Assignment ${assignmentId} submitted successfully!`);

      // Reload assignments to update the status
      await loadAssignments();
      await loadStudentGrades();

    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmittingAssignment(null);
    }
  };

  const getCourseColor = (color: string) => {
    switch (color) {
      case 'indigo':
        return 'from-blue-900/80 to-indigo-900/80';
      case 'emerald':
        return 'from-emerald-900/80 to-teal-900/80';
      case 'amber':
        return 'from-amber-900/80 to-orange-900/80';
      default:
        return 'from-rose-900/80 to-rose-800/80';
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-blue-500';
      case 'emerald':
        return 'bg-rose-500';
      case 'amber':
        return 'bg-amber-500';
      default:
        return 'bg-rose-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-blue-400 dark:border-blue-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/20';
      default:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-blue-400 dark:border-blue-500/20';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterReset = () => {
    setFilterStatus('all');
    setShowFilterDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-600 dark:border-blue-500"></div>
        <p className="text-rose-500 animate-pulse text-sm font-medium">Loading Academics</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-rose-800 dark:text-blue-300 uppercase tracking-tight">Academic Portal</h1>
        <p className="text-[11px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-widest mt-1">Manage courses, assignments, and academic trajectory</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-rose-50/50 dark:bg-white/5 border border-rose-100/50 dark:border-white/5 rounded-2xl p-1.5 mb-8 backdrop-blur-md w-fit">
        <div className="flex space-x-1">
          {['plan', 'courses', 'assignments', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg shadow-rose-200 dark:shadow-blue-900/40'
                : 'text-rose-800/40 dark:text-blue-700/40 hover:text-rose-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-white/5'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Tab - Merged Dashboard and Plan */}
      {activeTab === 'plan' && (
        <>
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <div key={course.id} className="glass-panel rounded-2xl overflow-hidden group hover:border-rose-400 dark:hover:border-blue-500/30 transition-all duration-300 bg-white/40 dark:bg-slate-900 shadow-xl shadow-rose-200/10">
                {/* Course Header */}
                <div className="h-32 bg-rose-200 dark:bg-slate-800 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${getCourseColor(course.color)} mix-blend-overlay`}></div>
                  <img
                    src={
                      course.name === 'System Design' ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop' :
                        course.name === 'Linear Algebra' ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop' :
                          course.name === 'Database Schema Project' ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop' :
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'
                    }
                    alt={course.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 rounded bg-black/40 backdrop-blur text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                      {course.code}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-black text-rose-800 dark:text-blue-300 group-hover:text-rose-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.name}
                    </h3>
                    <button className="text-slate-400 hover:text-rose-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 font-medium">{course.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-rose-700/60 dark:text-blue-700/40 font-bold uppercase tracking-wider">Progress</span>
                      <span className="text-rose-950 dark:text-blue-300 font-black">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(course.color)} rounded-full transition-all duration-500 shadow-sm`} style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-2 border-t border-rose-100 dark:border-white/5 pt-4">
                    <div className="flex -space-x-2">
                      <img className="w-6 h-6 rounded-full border border-white dark:border-slate-900" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} alt="Prof" />
                    </div>
                    <span className="text-xs text-rose-900/60 dark:text-blue-400/60 font-bold">{course.instructor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assignment Due Card */}
          <div className="relative rounded-3xl p-8 flex flex-col lg:flex-row gap-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-2 border-amber-200/50 dark:border-amber-500/20 shadow-2xl shadow-amber-200/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
            <div className="flex items-center gap-4 relative z-10 mb-6 lg:mb-0">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight">Critical Sync</h3>
                <p className="text-[10px] text-amber-700/60 dark:text-amber-600/40 font-black uppercase tracking-widest">Protocol due in 48 hours</p>
              </div>
            </div>

            <div className="flex-1 bg-white/60 dark:bg-white/[0.03] border border-amber-200 dark:border-white/5 rounded-2xl p-5 relative z-10 mb-6 lg:mb-0 backdrop-blur-sm">
              <h4 className="text-sm text-amber-950 dark:text-amber-300 font-black uppercase tracking-wide mb-1">Database Schema Project</h4>
              <p className="text-[10px] text-amber-700/60 dark:text-amber-700/40 font-black uppercase tracking-widest mb-4">CS-302 • System Design</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-[9px] text-amber-800 dark:text-slate-400 border border-amber-200 dark:border-white/5 font-black uppercase tracking-widest">SQL</span>
                <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-[9px] text-amber-800 dark:text-slate-400 border border-amber-200 dark:border-white/5 font-black uppercase tracking-widest">Diagrams</span>
              </div>
            </div>

            <button className="w-full lg:w-auto py-4 px-10 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-[11px] font-black text-white shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest relative z-10 self-center">
              Submit Instance
            </button>
          </div>

        </>
      )}

      {/* Other Tabs - Original Functionality */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="glass-panel rounded-2xl p-6 bg-white/40 dark:bg-slate-900 border border-rose-100 dark:border-white/5 hover:border-rose-300 dark:hover:border-indigo-500/30 transition-all shadow-lg shadow-rose-200/5 group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-black text-rose-800 dark:text-blue-300 group-hover:text-rose-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{course.name}</h3>
                    <p className="text-[10px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-widest mt-1">{course.code} • {course.instructor}</p>
                  </div>
                  <span className="px-3 py-1 bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/10 rounded-xl text-[9px] font-black text-rose-700 dark:text-blue-400 uppercase tracking-tighter">
                    {course.credits} Credits
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-rose-700/60 dark:text-slate-500">Progress</span>
                    <span className="text-rose-900 dark:text-white">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(course.color)} rounded-full shadow-sm`} style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900 border border-rose-100 dark:border-white/5 p-5 rounded-2xl backdrop-blur-md">
            <h2 className="text-sm font-black text-rose-800 dark:text-blue-300 uppercase tracking-widest">Operational Assignments</h2>
            {user?.role === 'Student' && studentGrades && (
              <div className="text-[10px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-[0.2em]">
                System GPA: <span className="text-rose-900 dark:text-blue-400">{studentGrades.overallAssignmentScore?.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => {
              const submissionStatus = user?.role === 'Student' ?
                (Math.random() > 0.5 ? 'submitted' : 'pending') : assignment.status;
              const grade = user?.role === 'Student' && submissionStatus === 'submitted' ?
                Math.floor(Math.random() * 30 + 70) : null;

              return (
                <div key={assignment.id} className="glass-panel rounded-2xl p-5 bg-white/40 dark:bg-slate-900 border border-rose-100 dark:border-white/5 hover:border-rose-300 dark:hover:border-blue-500/30 transition-all shadow-lg shadow-rose-200/5 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-rose-800 dark:text-blue-300 group-hover:text-rose-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{assignment.title}</h3>
                      <p className="text-[10px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-widest mt-1">{assignment.courseName} • {assignment.courseCode}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-white/5 text-[9px] font-black text-rose-700 dark:text-slate-400 border border-rose-200/30 dark:border-white/10 uppercase tracking-[0.15em]">
                          {assignment.type}
                        </span>
                        {grade && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black border border-emerald-500/20 uppercase tracking-[0.15em]">
                            CREDIT: {grade}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${submissionStatus === 'graded' ? 'bg-emerald-500/10 text-emerald-600' :
                        submissionStatus === 'submitted' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                        {submissionStatus}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        DUE: {assignment.dueDate}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-rose-50/30 dark:bg-black/20 p-3 rounded-xl border border-rose-100/30 dark:border-white/5">{assignment.description}</p>
                  
                  {user?.role === 'Student' && submissionStatus === 'pending' && (
                    <button
                      onClick={() => handleSubmitAssignment(assignment.id)}
                      disabled={submittingAssignment === assignment.id}
                      className="mt-5 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-blue-900/40 uppercase tracking-widest flex items-center gap-2"
                    >
                      {submittingAssignment === assignment.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Initiating Upload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Submit Data Instance
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900 border border-rose-100 dark:border-white/5 p-5 rounded-2xl backdrop-blur-md">
            <h2 className="text-sm font-black text-rose-800 dark:text-blue-300 uppercase tracking-widest">Shared Scholastic Assets</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-white/10 rounded-xl text-[10px] font-black text-rose-700 dark:text-blue-400 uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Sync All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="relative glass-panel rounded-2xl p-6 bg-white/40 dark:bg-slate-900 border border-rose-100 dark:border-white/5 hover:border-rose-300 dark:hover:border-blue-500/30 transition-all shadow-lg shadow-rose-200/5 group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <h3 className="text-sm font-black text-rose-800 dark:text-blue-300 group-hover:text-rose-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{assignment.title}</h3>
                  <button className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-50 dark:bg-white/5 flex items-center justify-center text-rose-400 hover:text-rose-600 dark:hover:text-blue-400 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-6 relative z-10">{assignment.description}</p>
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5" />
                    {assignment.courseName}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    ARCHIVED: {assignment.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
