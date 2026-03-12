import React from 'react';
import { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Edit, Trash2,
  MoreVertical, GraduationCap, Mail, Phone,
  Calendar, Award, AlertCircle, CheckCircle,
  BookOpen, Target, TrendingUp, UserPlus,
  ChevronLeft, ChevronRight, Star, Loader2
} from 'lucide-react';
import { studentService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { StudentForm } from './StudentForm';

const generateAvatar = (name: string) => {
  const seed = name.replace(/\s+/g, '').toLowerCase();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

interface Student {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  email: string;
  phone?: string;
  attendance: number;
  cgpa: number;
  feesStatus: 'Paid' | 'Pending' | 'Overdue';
  status: 'Active' | 'Inactive';
  photo?: string;
  user?: { email: string };
}

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  key?: string;
}

const StudentCard = ({ student, onEdit, onDelete }: StudentCardProps) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-4 p-4 border-b border-rose-100/50 dark:border-white/5 hover:bg-rose-50/30 dark:hover:bg-white/[0.02] transition-all duration-200">
      <div className="relative flex-shrink-0">
        <img
          src={student.photo || generateAvatar(student.name)}
          alt={student.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-rose-200 dark:border-indigo-500/30 bg-amber-50 dark:bg-slate-800"
          onError={(e) => { (e.target as HTMLImageElement).src = generateAvatar(student.name); }}
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            if (student.photo && student.photo.startsWith('data:')) target.style.objectFit = 'cover';
          }}
        />
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-amber-50 dark:border-slate-950 ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-rose-900 dark:text-white text-sm truncate">{student.name}</h3>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${
            student.status === 'Active'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
          }`}>
            {student.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium text-rose-700/60 dark:text-slate-500">
          <span className="font-mono">{student.rollNo}</span>
          <span className="truncate">{student.department}</span>
        </div>
      </div>

      <div className="flex-shrink-0 w-48 hidden md:block">
        <p className="text-[10px] text-rose-700/50 dark:text-slate-500 truncate">{student.user?.email || student.email}</p>
      </div>

      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-center w-14">
          <p className="text-sm font-black text-rose-900 dark:text-white">{student.attendance}<span className="text-xs text-rose-400 dark:text-slate-500 ml-0.5">%</span></p>
          <p className="text-[9px] text-rose-700/40 dark:text-slate-600 uppercase font-bold tracking-wider">Att.</p>
        </div>
        <div className="text-center w-10">
          <p className="text-sm font-black text-rose-900 dark:text-white">{student.cgpa}</p>
          <p className="text-[9px] text-rose-700/40 dark:text-slate-600 uppercase font-bold tracking-wider">GPA</p>
        </div>
        <div className="text-center w-16">
          <span className={`text-xs font-bold ${
            student.feesStatus === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' :
            student.feesStatus === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          }`}>{student.feesStatus}</span>
          <p className="text-[9px] text-rose-700/40 dark:text-slate-600 uppercase font-bold tracking-wider">Fees</p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onEdit(student)} className="p-1.5 rounded-lg hover:bg-rose-500/10 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-indigo-500 transition-colors" title="Edit">
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(student)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const Students = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) { console.error('Failed to load students:', error); }
    finally { setLoading(false); }
  };

  const handleAddStudent = (studentData: any) => {
    studentService.createStudent({ ...studentData, photo: generateAvatar(studentData.name) })
      .then(() => loadStudents()).catch(console.error);
    setShowAddModal(false);
  };

  const handleEditStudent = (studentData: any) => {
    if (editingStudent) {
      studentService.updateStudent(editingStudent.id, studentData)
        .then(() => { loadStudents(); setEditingStudent(null); setShowAddModal(false); })
        .catch(console.error);
    }
  };

  const handleOpenEditModal = (student: Student) => { setEditingStudent(student); setShowAddModal(true); };
  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Delete ${student.name}?`)) {
      studentService.deleteStudent(student.id).then(() => loadStudents()).catch(console.error);
    }
  };

  const departments = ['All', ...Array.from(new Set(students.map(s => s.department)))];
  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.department.toLowerCase().includes(q))
      && (filterStatus === 'All' || s.status === filterStatus)
      && (filterDepartment === 'All' || s.department === filterDepartment);
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 dark:border-indigo-500" />
        <p className="text-slate-500 dark:text-slate-400 animate-pulse text-xs font-medium tracking-widest uppercase">Loading Student Records</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-rose-900 dark:text-white tracking-tight">Student Records</h1>
        <p className="text-rose-700/60 dark:text-slate-500 text-xs mt-1 tracking-widest uppercase">Manage institutional student data & analytics</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-rose-50/50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 text-rose-950 dark:text-white placeholder:text-rose-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-rose-100 dark:hover:bg-white/10 text-rose-700 dark:text-slate-300"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {(filterStatus !== 'All' || filterDepartment !== 'All') && (
                  <span className="w-1.5 h-1.5 bg-rose-500 dark:bg-indigo-500 rounded-full" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="absolute top-full mt-2 w-64 rounded-xl border border-rose-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900 shadow-xl backdrop-blur-xl z-50">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mb-2">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-rose-50 dark:bg-slate-800 border border-rose-200/50 dark:border-white/10 text-rose-900 dark:text-white outline-none">
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mb-2">Department</label>
                      <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-rose-50 dark:bg-slate-800 border border-rose-200/50 dark:border-white/10 text-rose-900 dark:text-white outline-none">
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { setFilterStatus('All'); setFilterDepartment('All'); setShowFilterDropdown(false); }}
                        className="flex-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-white/10 transition-all">
                        Reset
                      </button>
                      <button onClick={() => setShowFilterDropdown(false)}
                        className="flex-1 px-3 py-2 rounded-xl bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20">
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-3 bg-rose-50/80 dark:bg-white/[0.03] border-b border-rose-200/30 dark:border-white/5">
          <div className="flex items-center gap-4 text-[10px] text-rose-700/60 dark:text-slate-500 font-bold uppercase tracking-widest">
            <div className="flex-1">Student / Identity</div>
            <div className="w-48 hidden md:block">Email</div>
            <div className="flex gap-5">
              <div className="w-14 text-center">Att.</div>
              <div className="w-10 text-center">GPA</div>
              <div className="w-16 text-center">Fees</div>
            </div>
            <div className="w-20">Actions</div>
          </div>
        </div>

        <div>
          {paginatedStudents.map((student) => (
            <StudentCard key={student.id} student={student} onEdit={handleOpenEditModal} onDelete={handleDeleteStudent} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-rose-100/50 dark:border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-medium text-rose-700/40 dark:text-slate-600 uppercase tracking-widest">
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredStudents.length)} / {filteredStudents.length} students
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-rose-200/50 dark:border-white/8 text-rose-500 dark:text-slate-400 hover:border-rose-500/30 dark:hover:border-indigo-500/30 hover:text-rose-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-rose-200/50 dark:border-white/8 text-rose-500 dark:text-slate-400 hover:border-rose-500/30 dark:hover:border-indigo-500/30 hover:text-rose-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] p-20 text-center">
          <div className="w-16 h-16 bg-rose-500/10 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-rose-500 dark:text-indigo-500" />
          </div>
          <h3 className="text-lg font-black text-rose-900 dark:text-white mb-1">No Students Found</h3>
          <p className="text-rose-700/50 dark:text-slate-500 text-xs">Refine your search or check filters</p>
        </div>
      )}

      <StudentForm
        isOpen={showAddModal || !!editingStudent}
        onClose={() => { setShowAddModal(false); setEditingStudent(null); }}
        onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
        editingStudent={editingStudent}
      />
    </div>
  );
};