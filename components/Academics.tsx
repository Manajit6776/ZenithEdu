import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen, FileText, Upload, CheckCircle, Clock, Download, Plus, Edit, Trash2, Eye, Calendar, User, AlertCircle,
  MoreVertical, Search, Filter, Loader2, ChevronLeft, ChevronRight, Star, Award, TrendingUp
} from 'lucide-react';
import { Course } from '../src/types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService, assignmentService, gradeService } from '../lib/api';
import { AssignmentGrading } from './AssignmentGrading';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'plan' | 'courses' | 'assignments' | 'exams' | 'policy' | 'notes'>('plan');
  const [courses, setCourses] = useState<CourseCard[]>(MOCK_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', subject: '', courseCode: '',
    dueDate: '', maxScore: 100, type: 'Homework'
  });
  const [selectedGradingAssignment, setSelectedGradingAssignment] = useState<string | null>(null);

  const TABS = ['plan', 'courses', 'assignments', 'exams', 'policy', 'notes'];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!user) return;
    loadAssignments();
    if (user?.role === 'Student') loadStudentGrades();
  }, [user]);

  const loadAssignments = async () => {
    try {
      let url = '/api/assignments';
      if (user?.role === 'Teacher') {
        url = `/api/assignments?teacherId=${user?.id}`;
      } else if (user?.role === 'Student') {
        url = `/api/assignments?role=Student&userId=${user?.id}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Map backend fields to expected format
        setAssignments(data.map((a: any) => {
          const subs = a.submissions || [];
          // Derive a meaningful status from submission data
          let derivedStatus: string;
          if (subs.length === 0) {
            derivedStatus = 'pending';
          } else if (subs.every((s: any) => s.score !== null)) {
            derivedStatus = 'graded';
          } else {
            derivedStatus = 'submitted';
          }
          return {
            id: a.id,
            title: a.title,
            description: a.description,
            courseId: a.courseCode,
            courseName: a.subject,
            courseCode: a.courseCode,
            dueDate: new Date(a.dueDate).toLocaleDateString(),
            status: derivedStatus,
            type: a.type || 'Homework',
            priority: 'medium' as 'high' | 'medium' | 'low',
            maxScore: a.maxScore,
            teacherId: a.teacherId,
            submissions: subs
          };
        }));
      } else {
        setAssignments(MOCK_ASSIGNMENTS);
      }
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

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assignmentData: any = {
        ...formData,
        teacherId: user?.id,
        status: 'Published',
      };
      if (assignmentData.dueDate) {
        const dateStr = assignmentData.dueDate;
        if (dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+')) {
          assignmentData.dueDate = dateStr + ':00.000Z';
        }
      }
      if (editingAssignment) {
        await fetch(`/api/assignments/${editingAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentData)
        });
      } else {
        await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentData)
        });
      }
      setIsFormOpen(false);
      setEditingAssignment(null);
      setFormData({ title: '', description: '', subject: '', courseCode: '', dueDate: '', maxScore: 100, type: 'Homework' });
      await loadAssignments();
    } catch (err) {
      alert('Failed to save assignment.');
    }
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.courseName || assignment.subject || '',
      courseCode: assignment.courseCode,
      dueDate: '',
      maxScore: assignment.maxScore || 100,
      type: assignment.type || 'Homework'
    });
    setIsFormOpen(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      await loadAssignments();
    } catch { alert('Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black  text-rose-800 dark:text-white tracking-tight">Academic Portal</h1>
        <p className="text-xs text-rose-700/60 dark:text-slate-500 mt-1 uppercase tracking-widest">Manage courses, assignments, and academic trajectory</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-rose-50/80 dark:bg-white/5 border border-rose-100/50 dark:border-white/8 rounded-xl p-1 w-fit">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => handleTabChange(tab)}
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
            <div className="flex items-center gap-3">
              {user?.role === 'Student' && studentGrades && (
                <div className="text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                  GPA: <span className="text-rose-600 dark:text-indigo-400">{studentGrades.overallAssignmentScore?.toFixed(1)}%</span>
                </div>
              )}
              {(user?.role === 'Teacher' || user?.role === 'Admin') && (
                <button
                  onClick={() => { setEditingAssignment(null); setFormData({ title: '', description: '', subject: '', courseCode: '', dueDate: '', maxScore: 100, type: 'Homework' }); setIsFormOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl transition-all shadow-lg uppercase tracking-widest"
                >
                  <Plus className="w-3.5 h-3.5" /> New Assignment
                </button>
              )}
            </div>
          </div>
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 rounded-xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
              No assignments found.
            </div>
          ) : assignments.map((assignment) => {
            const status = assignment.status;
            return (
              <div key={assignment.id} className="rounded-xl p-5 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] hover:border-rose-500/30 dark:hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-rose-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{assignment.title}</h3>
                    <p className="text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-0.5">{assignment.courseName} • {assignment.courseCode}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${priorityColor(assignment.priority)} uppercase tracking-wide`}>{assignment.priority}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-white/5 text-[9px] font-bold text-rose-700 dark:text-slate-400 border border-rose-200/30 dark:border-white/10 uppercase tracking-wide">{assignment.type}</span>
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
                <div className="flex items-center gap-2 mt-3">
                  {user?.role === 'Student' && status === 'pending' && (
                    <button onClick={() => handleSubmitAssignment(assignment.id)} disabled={submittingAssignment === assignment.id}
                      className="px-5 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl transition-all shadow-lg uppercase tracking-widest flex items-center gap-2 disabled:opacity-60">
                      {submittingAssignment === assignment.id ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><Upload className="w-4 h-4" />Submit Assignment</>}
                    </button>
                  )}
                  {(user?.role === 'Teacher' || user?.role === 'Admin') && (
                    <>
                      <button onClick={() => setSelectedGradingAssignment(assignment.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl transition-all flex items-center gap-1 uppercase tracking-widest">
                        <Star className="w-3.5 h-3.5" /> Grade Submissions
                      </button>
                      <button onClick={() => handleEditAssignment(assignment)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-xl transition-all flex items-center gap-1 uppercase tracking-widest">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDeleteAssignment(assignment.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-xl transition-all flex items-center gap-1 uppercase tracking-widest">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      {(assignment as any).submissions?.length > 0 && (
                        <span className="text-[10px] font-bold text-rose-700/60 dark:text-slate-500 ml-2">
                          {(assignment as any).submissions.length} submission(s) — {(assignment as any).submissions.filter((s: any) => s.score !== null).length} graded
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-black text-slate-800 dark:text-white">{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                  <input type="text" value={formData.courseCode} onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input type="datetime-local" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Score</label>
                  <input type="number" value={formData.maxScore} onChange={(e) => setFormData({...formData, maxScore: parseFloat(e.target.value)})}
                    min="1" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  <option value="Homework">Homework</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                  <option value="Exam">Exam</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg">
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center p-4 rounded-xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
            <div>
              <h2 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Examination Schedule</h2>
              <p className="text-[10px] text-rose-700/50 dark:text-slate-500 mt-0.5 uppercase tracking-wider">End Semester — Dec 2024</p>
            </div>
            <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">3 Exams Scheduled</span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Days Until First Exam', value: '14', icon: Calendar, color: 'rose' },
              { label: 'Total Subjects', value: '3', icon: BookOpen, color: 'indigo' },
              { label: 'Total Duration', value: '9 hrs', icon: Clock, color: 'amber' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-rose-800 dark:text-white">{stat.value}</div>
                  <div className="text-[9px] font-bold text-rose-700/50 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Cards */}
          <div className="space-y-3">
            {[
              { id: '1', course: 'System Design', code: 'CS-302', date: 'Dec 15, 2024', time: '10:00 AM – 1:00 PM', duration: '3 hrs', location: 'Hall A, Block 3', type: 'Final Exam', weightage: '60%', syllabus: 'Unit 1–5: Distributed Systems, Microservices, CAP Theorem, Load Balancing, API Design', status: 'upcoming', color: 'rose' },
              { id: '2', course: 'Linear Algebra', code: 'MATH-201', date: 'Dec 18, 2024', time: '2:00 PM – 5:00 PM', duration: '3 hrs', location: 'Hall B, Block 2', type: 'Final Exam', weightage: '60%', syllabus: 'Unit 1–4: Vectors, Matrices, Eigenvalues, Linear Transformations', status: 'upcoming', color: 'indigo' },
              { id: '3', course: 'Data Structures', code: 'CS-201', date: 'Dec 22, 2024', time: '9:00 AM – 12:00 PM', duration: '3 hrs', location: 'Hall C, Block 1', type: 'Final Exam', weightage: '60%', syllabus: 'Unit 1–5: Arrays, Linked Lists, Trees, Graphs, Hashing', status: 'upcoming', color: 'emerald' },
            ].map(exam => (
              <div key={exam.id} className="rounded-2xl p-5 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] hover:border-amber-500/30 dark:hover:border-amber-400/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${exam.color}-500/10 flex items-center justify-center text-${exam.color}-500 flex-shrink-0`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-rose-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{exam.course}</h3>
                      <p className="text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-0.5">{exam.code} • {exam.type} • Weightage: {exam.weightage}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">upcoming</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-rose-50/60 dark:bg-white/[0.02] border border-rose-100/50 dark:border-white/5 rounded-lg p-2.5">
                    <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50/60 dark:bg-white/[0.02] border border-rose-100/50 dark:border-white/5 rounded-lg p-2.5">
                    <Clock className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.time}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50/60 dark:bg-white/[0.02] border border-rose-100/50 dark:border-white/5 rounded-lg p-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.location}</span>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mb-1">Syllabus Coverage</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{exam.syllabus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Tab */}
      {activeTab === 'policy' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center p-4 rounded-xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
            <div>
              <h2 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Academic & Examination Policy</h2>
              <p className="text-[10px] text-rose-700/50 dark:text-slate-500 mt-0.5 uppercase tracking-wider">ZenithEdu Academic Regulations — 2024–25</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Attendance */}
            <div className="rounded-2xl p-6 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                <h3 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Attendance Requirements</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 font-medium leading-relaxed">
                <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">→</span>Minimum 75% attendance mandatory for exam eligibility.</li>
                <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">→</span>Medical leaves require authorized certificates within 3 days of absence.</li>
                <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">→</span>Below 60% attendance: debarred from final examinations.</li>
                <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">→</span>Attendance is marked twice per session (start & midway). Proxy marking is a punishable offense.</li>
                <li className="flex gap-2"><span className="text-emerald-500 font-bold mt-0.5">→</span>Students with 65–75% attendance must apply for a condoning request with valid reason.</li>
              </ul>
            </div>

            {/* Exam Conduct */}
            <div className="rounded-2xl p-6 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600"><AlertCircle className="w-5 h-5" /></div>
                <h3 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Exam Conduct Rules</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 font-medium leading-relaxed">
                <li className="flex gap-2"><span className="text-indigo-500 font-bold mt-0.5">→</span>Students must be seated 15 minutes before exam start time.</li>
                <li className="flex gap-2"><span className="text-indigo-500 font-bold mt-0.5">→</span>No electronic devices (phones, smartwatches, earbuds) are permitted in the hall.</li>
                <li className="flex gap-2"><span className="text-indigo-500 font-bold mt-0.5">→</span>Hall ticket and valid student ID must be carried at all times.</li>
                <li className="flex gap-2"><span className="text-indigo-500 font-bold mt-0.5">→</span>Unfair means or malpractice results in immediate disqualification and disciplinary hearing.</li>
                <li className="flex gap-2"><span className="text-indigo-500 font-bold mt-0.5">→</span>Answer sheets must be handed to the invigilator before leaving the hall.</li>
              </ul>
            </div>

            {/* Grading System */}
            <div className="rounded-2xl p-6 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600"><Award className="w-5 h-5" /></div>
                <h3 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Grading & Evaluation</h3>
              </div>
              <div className="space-y-2 mb-3">
                {[{ label: 'Final Examination', value: '60%', color: 'rose' }, { label: 'Internal Assignments', value: '20%', color: 'indigo' }, { label: 'Project / Lab Work', value: '20%', color: 'emerald' }].map(g => (
                  <div key={g.label} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{g.label}</span>
                    <span className={`text-xs font-black text-${g.color}-600 dark:text-${g.color}-400`}>{g.value}</span>
                  </div>
                ))}
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-medium leading-relaxed border-t border-rose-100/50 dark:border-white/5 pt-3">
                <li className="flex gap-2"><span className="text-rose-500 font-bold mt-0.5">→</span>Minimum GPA of 2.0 required to remain in good academic standing.</li>
                <li className="flex gap-2"><span className="text-rose-500 font-bold mt-0.5">→</span>Grade appeals must be raised within 7 days of result publication.</li>
                <li className="flex gap-2"><span className="text-rose-500 font-bold mt-0.5">→</span>O (Outstanding) = 90–100%, A+ = 85–89%, A = 80–84%, B+ = 75–79%, B = 70–74%, C = 60–69%, F = Below 60%.</li>
              </ul>
            </div>

            {/* Academic Integrity */}
            <div className="rounded-2xl p-6 border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-widest">Academic Integrity</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 font-medium leading-relaxed">
                <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">→</span>All submitted work must be original. Plagiarism of any form is strictly prohibited.</li>
                <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">→</span>Collaboration is permitted in group projects but must be explicitly stated.</li>
                <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">→</span>Use of AI-generated content without disclosure is considered academic misconduct.</li>
                <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">→</span>Violations may result in a zero grade, suspension, or expulsion depending on severity.</li>
                <li className="flex gap-2"><span className="text-amber-500 font-bold mt-0.5">→</span>All cases are reviewed by the Academic Integrity Committee before action is taken.</li>
              </ul>
            </div>
          </div>
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
      {selectedGradingAssignment && (
        <AssignmentGrading
          assignmentId={selectedGradingAssignment}
          onClose={() => {
            setSelectedGradingAssignment(null);
            loadAssignments();
          }}
          onGradeComplete={() => loadAssignments()}
        />
      )}
    </div>
  );
};