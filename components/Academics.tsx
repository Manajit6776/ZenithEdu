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
  id: string; name: string; code: string; instructor: string; credits: number;
  progress: number; description: string; nextClass?: string; assignments?: number;
  grade?: string; status: 'active' | 'completed' | 'upcoming'; color: string;
}

interface Assignment {
  id: string; title: string; description: string; courseId: string;
  courseName: string; courseCode: string; dueDate: string;
  status: 'pending' | 'submitted' | 'graded'; submittedAt?: string;
  grade?: string; file?: string; type: string; priority: 'high' | 'medium' | 'low';
}

const MOCK_COURSES: CourseCard[] = [
  { id: '1', name: 'System Design', code: 'CS-302', instructor: 'Dr. Alan Smith', credits: 4, progress: 65, description: 'Architecting scalable distributed systems and microservices patterns.', nextClass: 'Tomorrow, 10:00 AM', assignments: 3, grade: 'A-', status: 'active', color: 'indigo' },
  { id: '2', name: 'Linear Algebra', code: 'MATH-201', instructor: 'Prof. Sarah J.', credits: 3, progress: 32, description: 'Vector spaces, matrices, and linear transformations essentials.', nextClass: 'Friday, 2:00 PM', assignments: 5, status: 'active', color: 'emerald' },
  { id: '3', name: 'Database Schema Project', code: 'CS-302', instructor: 'Dr. Alan Smith', credits: 2, progress: 0, description: 'Design and implement a comprehensive database system.', assignments: 1, status: 'upcoming', color: 'amber' }
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Database Schema Project', description: 'Design a comprehensive database schema for an e-commerce platform', courseId: '1', courseName: 'System Design', courseCode: 'CS-302', dueDate: '2024-12-28', status: 'pending', type: 'Project', priority: 'high' },
  { id: '2', title: 'Microservices Architecture', description: 'Design a microservices architecture for a social media application', courseId: '1', courseName: 'System Design', courseCode: 'CS-302', dueDate: '2024-12-30', status: 'pending', type: 'Design', priority: 'medium' },
  { id: '3', title: 'Vector Space Analysis', description: 'Solve problems related to vector spaces and linear transformations', courseId: '2', courseName: 'Linear Algebra', courseCode: 'MATH-201', dueDate: '2024-12-29', status: 'pending', type: 'Problem Set', priority: 'low' }
];

const colorMap: Record<string, { card: string; progress: string; badge: string }> = {
  indigo: { card: 'from-rose-900/80 to-pink-900/80 dark:from-indigo-900/80 dark:to-violet-900/80', progress: 'bg-rose-500 dark:bg-indigo-500', badge: 'bg-rose-500/10 text-rose-500 dark:text-indigo-400' },
  emerald: { card: 'from-emerald-900/80 to-teal-900/80', progress: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  amber: { card: 'from-amber-900/80 to-orange-900/80', progress: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  default: { card: 'from-rose-900/80 to-pink-900/80', progress: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-500 dark:text-rose-400' },
};

const priorityColor = (p: string) => {
  if (p === 'high') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  if (p === 'medium') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
};

const courseImages: Record<string, string> = {
  'System Design': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
  'Linear Algebra': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop',
  'Database Schema Project': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
};

export const Academics: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'plan' | 'courses' | 'assignments' | 'notes'>('plan');
  const [courses, setCourses] = useState<CourseCard[]>(MOCK_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
    if (user?.role === 'Student') loadStudentGrades();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await assignmentService.getAllAssignments();
      setAssignments(data);
    } catch { setAssignments(MOCK_ASSIGNMENTS); }
  };
  const loadStudentGrades = async () => {
    if (!user?.id) return;
    try { const g = await gradeService.getStudentGrades(user.id); setStudentGrades(g); } catch {}
  };

  const handleSubmitAssignment = async (id: string) => {
    if (!user?.id) return;
    setSubmittingAssignment(id);
    try { alert(`Assignment ${id} submitted!`); await loadAssignments(); await loadStudentGrades(); }
    catch { alert('Failed to submit.'); } finally { setSubmittingAssignment(null); }
  };

  const TABS = ['plan', 'courses', 'assignments', 'notes'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-rose-900 dark:text-white tracking-tight">Academic Portal</h1>
        <p className="text-xs text-rose-700/60 dark:text-slate-500 mt-1 uppercase tracking-widest">Manage courses, assignments, and academic trajectory</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-rose-50/80 dark:bg-white/5 border border-rose-100/50 dark:border-white/8 rounded-xl p-1 w-fit">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-rose-600 dark:bg-indigo-600 text-white shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20'
                  : 'text-rose-800/50 dark:text-slate-500 hover:text-rose-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const c = colorMap[course.color] || colorMap.default;
              return (
                <div key={course.id} className="rounded-2xl overflow-hidden border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] group hover:border-rose-500/30 dark:hover:border-indigo-500/30 transition-all shadow-md">
                  <div className="h-32 bg-rose-200 dark:bg-slate-800 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-tr ${c.card} mix-blend-overlay`} />
                    <img src={courseImages[course.name] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'} alt={course.name} className="absolute inset-0 w-full h-full object-cover opacity-60" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'; }} />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur text-[10px] font-bold text-white border border-white/10">{course.code}</span>
                    </div>
                    {course.grade && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur text-[10px] font-bold text-emerald-400 border border-emerald-500/20">{course.grade}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-black text-rose-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{course.name}</h3>
                      <button className="text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{course.description}</p>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-wider">
                        <span>Progress</span><span className="text-rose-950 dark:text-white">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${c.progress} rounded-full transition-all duration-500`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-t border-rose-100/50 dark:border-white/5 pt-3">
                      <img className="w-5 h-5 rounded-full border border-rose-200 dark:border-white/10" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} alt="" />
                      <span className="text-xs text-rose-900/60 dark:text-slate-400">{course.instructor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assignment Due Alert */}
          <div className="relative rounded-2xl p-6 flex flex-col lg:flex-row gap-6 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-500/20 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-900 dark:text-amber-400">Critical Sync</h3>
                <p className="text-[10px] text-amber-700/60 dark:text-amber-600/40 font-bold uppercase tracking-widest">Protocol due in 48 hours</p>
              </div>
            </div>
            <div className="flex-1 bg-white/60 dark:bg-white/[0.03] border border-amber-200/60 dark:border-white/5 rounded-xl p-4 relative z-10">
              <h4 className="text-sm font-black text-amber-950 dark:text-amber-300 mb-0.5">Database Schema Project</h4>
              <p className="text-[10px] text-amber-700/60 dark:text-amber-700/40 font-bold uppercase tracking-widest mb-3">CS-302 • System Design</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-[9px] text-amber-800 dark:text-slate-400 border border-amber-200/50 dark:border-white/5 font-bold">SQL</span>
                <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-[9px] text-amber-800 dark:text-slate-400 border border-amber-200/50 dark:border-white/5 font-bold">Diagrams</span>
              </div>
            </div>
            <button className="lg:self-center py-3 px-8 rounded-xl bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-[11px] font-black text-white shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest relative z-10 whitespace-nowrap">
              Submit Instance
            </button>
          </div>
        </>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const c = colorMap[course.color] || colorMap.default;
            return (
              <div key={course.id} className="rounded-2xl p-5 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] hover:border-rose-500/30 dark:hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-black text-rose-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{course.name}</h3>
                    <p className="text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-0.5">{course.code} • {course.instructor}</p>
                  </div>
                  <span className="px-2 py-1 bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-500/20 dark:border-indigo-500/20 rounded-lg text-[9px] font-bold text-rose-600 dark:text-indigo-400">{course.credits} Cr.</span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-wider">
                    <span>Progress</span><span className="text-rose-900 dark:text-white">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${c.progress} rounded-full`} style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{course.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
            <h2 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Assignments</h2>
            {user?.role === 'Student' && studentGrades && (
              <div className="text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                GPA: <span className="text-rose-600 dark:text-indigo-400">{studentGrades.overallAssignmentScore?.toFixed(1)}%</span>
              </div>
            )}
          </div>
          {assignments.map((assignment) => {
            const status = user?.role === 'Student' ? (Math.random() > 0.5 ? 'submitted' : 'pending') : assignment.status;
            const grade = user?.role === 'Student' && status === 'submitted' ? Math.floor(Math.random() * 30 + 70) : null;
            return (
              <div key={assignment.id} className="rounded-xl p-5 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] hover:border-rose-500/30 dark:hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-rose-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{assignment.title}</h3>
                    <p className="text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-0.5">{assignment.courseName} • {assignment.courseCode}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${priorityColor(assignment.priority)} uppercase tracking-wide`}>{assignment.priority}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-white/5 text-[9px] font-bold text-rose-700 dark:text-slate-400 border border-rose-200/30 dark:border-white/10 uppercase tracking-wide">{assignment.type}</span>
                      {grade && <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20 uppercase tracking-wide">Score: {grade}/100</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                      status === 'graded' ? 'bg-emerald-500/10 text-emerald-600' :
                      status === 'submitted' ? 'bg-rose-500/10 dark:bg-indigo-500/10 text-rose-600 dark:text-indigo-400' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>{status}</span>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-rose-700/40 dark:text-slate-600 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />DUE: {assignment.dueDate}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-rose-50/50 dark:bg-white/[0.02] border border-rose-100/30 dark:border-white/5">{assignment.description}</p>
                {user?.role === 'Student' && status === 'pending' && (
                  <button onClick={() => handleSubmitAssignment(assignment.id)} disabled={submittingAssignment === assignment.id}
                    className="mt-4 px-5 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20 uppercase tracking-widest flex items-center gap-2 disabled:opacity-60">
                    {submittingAssignment === assignment.id ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><Upload className="w-4 h-4" />Submit Assignment</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
            <h2 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Scholastic Assets</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 rounded-xl text-[10px] font-bold text-rose-700 dark:text-slate-300 uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-colors">
              <Download className="w-3.5 h-3.5" />Sync All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignments.map((a) => (
              <div key={a.id} className="relative rounded-xl p-5 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] hover:border-rose-500/30 dark:hover:border-indigo-500/30 transition-all group overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 dark:bg-indigo-500/5 blur-2xl rounded-full" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-sm font-black text-rose-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{a.title}</h3>
                  <button className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-white/5 flex items-center justify-center text-rose-400 hover:text-rose-600 dark:hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 relative z-10">{a.description}</p>
                <div className="flex flex-col gap-1.5 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                    <User className="w-3 h-3" />{a.courseName}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />archived: {a.dueDate}
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
