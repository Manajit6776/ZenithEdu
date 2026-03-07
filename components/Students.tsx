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

// Generate DiceBear avatar URL
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
  user?: {
    email: string;
  };
}

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  key?: string; // Optional key prop for React internal use
}

const StudentCard = ({ student, onEdit, onDelete }: StudentCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4 p-4 border-b border-rose-100/50 dark:border-white/5 hover:bg-rose-500/[0.02] dark:hover:bg-white/[0.02] transition-all duration-300">
      {/* Student Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={student.photo || generateAvatar(student.name)}
          alt={student.name}
          className="w-10 h-10 rounded-full object-cover border border-rose-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-800"
          onError={(e) => {
            // Fallback to generated avatar if original fails
            const target = e.target as HTMLImageElement;
            target.src = generateAvatar(student.name);
          }}
          onLoad={(e) => {
            // Ensure base64 images load properly
            const target = e.target as HTMLImageElement;
            if (student.photo && student.photo.startsWith('data:')) {
              target.style.objectFit = 'cover';
            }
          }}
        />
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-amber-50 dark:border-slate-900 ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-300 dark:bg-blue-900'
          }`}></div>
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-black text-rose-900 dark:text-blue-300 text-sm truncate uppercase tracking-tight">{student.name}</h3>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${student.status === 'Active'
            ? 'bg-rose-500/10 text-rose-600 dark:text-blue-400 border-rose-500/20 dark:border-blue-500/30'
            : 'bg-rose-500/5 text-rose-400 dark:text-blue-700/60 border-rose-500/10 dark:border-blue-700/20'
            }`}>
            {student.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-700/50 dark:text-blue-500/50">
          <span className="font-mono">{student.rollNo}</span>
          <span className="truncate">{student.department}</span>
        </div>
      </div>

      {/* Email */}
      <div className="flex-shrink-0 w-48">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-700/40 dark:text-blue-600/40 truncate">{student.user?.email || student.email}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-center w-16">
          <p className="text-sm font-black text-rose-900 dark:text-blue-300">{student.attendance}<span className="text-xs text-rose-500 dark:text-blue-500/50 ml-0.5">%</span></p>
          <p className="text-[9px] text-rose-700/40 dark:text-blue-700 uppercase font-black tracking-widest">Attendance</p>
        </div>
        <div className="text-center w-12">
          <p className="text-sm font-black text-rose-900 dark:text-blue-300">{student.cgpa}</p>
          <p className="text-[9px] text-rose-700/40 dark:text-blue-700 uppercase font-black tracking-widest">GPA</p>
        </div>
        <div className="text-center w-16">
          <span className={`text-xs font-black uppercase tracking-tighter ${student.feesStatus === 'Paid' ? 'text-emerald-600' :
            student.feesStatus === 'Pending' ? 'text-amber-600' : 'text-rose-600'
            }`}>
            {student.feesStatus}
          </span>
          <p className="text-[9px] text-rose-700/40 dark:text-blue-800 uppercase font-black tracking-widest">Fees</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(student)}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 dark:hover:bg-blue-500/10 text-rose-400 dark:text-blue-700/60 hover:text-rose-600 dark:hover:text-blue-400 transition-colors"
          title="Edit student"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(student)}
          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 dark:text-blue-700/60 hover:text-rose-600 dark:hover:text-red-400 transition-colors"
          title="Delete student"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-rose-500/10 dark:hover:bg-blue-500/10 text-rose-400 dark:text-blue-700/60 hover:text-rose-600 dark:hover:text-blue-400 transition-colors">
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

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log('Frontend: Loading students from API...');
      const data = await studentService.getAllStudents();
      console.log('Frontend: Loaded students:', data.length, 'students');
      console.log('Frontend: First student photo:', data[0]?.photo?.substring(0, 50) + '...');
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = (studentData: any) => {
    // Add avatar URL to new student data
    const studentWithAvatar = {
      ...studentData,
      photo: generateAvatar(studentData.name)
    };

    studentService.createStudent(studentWithAvatar)
      .then(() => loadStudents())
      .catch(console.error);
    setShowAddModal(false);
  };

  const handleEditStudent = (studentData: any) => {
    if (editingStudent) {
      console.log('Frontend: Sending student update data:', studentData);
      studentService.updateStudent(editingStudent.id, studentData)
        .then((response) => {
          console.log('Frontend: Update successful:', response);
          loadStudents();
          setEditingStudent(null);
          setShowAddModal(false);
        })
        .catch((error) => {
          console.error('Frontend: Update failed:', error);
        });
    }
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setShowAddModal(true);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      studentService.deleteStudent(student.id)
        .then(() => loadStudents())
        .catch(console.error);
    }
  };

  const handleSearchChange = (e: { target: { value: string } }) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterReset = () => {
    setFilterStatus('All');
    setFilterDepartment('All');
    setShowFilterDropdown(false);
  };

  // Get unique departments for filter
  const departments = ['All', ...Array.from(new Set(students.map(s => s.department)))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    const matchesDepartment = filterDepartment === 'All' || student.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 dark:border-blue-500"></div>
        <p className="text-rose-800 dark:text-blue-400 animate-pulse text-[10px] font-black uppercase tracking-[0.2em]">Loading Student Records</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-rose-900 dark:text-blue-300 uppercase tracking-tighter mb-2">Student Records</h1>
        <p className="text-rose-700/60 dark:text-blue-700/40 text-[10px] font-black uppercase tracking-[0.2em]">Manage institutional student data & analytics</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 dark:text-blue-700 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-rose-300 dark:placeholder:text-blue-900"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/5 dark:bg-white/5 border border-rose-200/50 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-rose-500/10 active:scale-95 text-rose-700 dark:text-blue-400"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {(filterStatus !== 'All' || filterDepartment !== 'All') && (
                  <span className="w-1.5 h-1.5 bg-rose-500 dark:bg-blue-400 rounded-full"></span>
                )}
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full mt-2 w-64 glass-panel rounded-xl border border-white/5 z-50">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-rose-700/60 dark:text-blue-500/60 uppercase tracking-widest mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Active' | 'Inactive')}
                        className="w-full glass-input px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-rose-900 dark:text-blue-400"
                      >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-rose-700/60 dark:text-blue-500/60 uppercase tracking-widest mb-2">Department</label>
                      <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="w-full glass-input px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-rose-900 dark:text-blue-400"
                      >
                        <option value="All">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleFilterReset}
                        className="flex-1 px-3 py-2 rounded-xl bg-rose-500/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-500/10 text-rose-700 dark:text-blue-400"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterDropdown(false)}
                        className="flex-1 px-3 py-2 rounded-xl bg-rose-600 dark:bg-blue-600 hover:bg-rose-500 dark:hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-600/20 dark:shadow-blue-900/40"
            >
              <Plus className="w-3.5 h-3.5 font-black" />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-4 bg-amber-100/30 dark:bg-slate-900/50 border-b border-rose-200/20 dark:border-white/5">
          <div className="flex items-center gap-4 text-[10px] text-rose-700/60 dark:text-blue-600 font-black uppercase tracking-[0.2em]">
            <div className="flex-1">Student / Identity</div>
            <div className="w-48">Institutional Email</div>
            <div className="flex gap-6">
              <div className="w-16 text-center">Attendance</div>
              <div className="w-12 text-center">CGPA</div>
              <div className="w-16 text-center">Fees Status</div>
            </div>
            <div className="w-20">Control</div>
          </div>
        </div>

        {/* Student Rows */}
        <div className="divide-y divide-rose-200/10 dark:divide-white/5">
          {paginatedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteStudent}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-rose-100 dark:border-white/5 flex justify-between items-center bg-amber-50/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-700/40 dark:text-blue-700">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} <span className="mx-1">/</span> {filteredStudents.length} students
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 dark:hover:bg-blue-600/10 text-rose-400 dark:text-blue-700 hover:text-rose-600 dark:hover:text-blue-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-rose-200/50 dark:border-blue-500/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 dark:hover:bg-blue-600/10 text-rose-400 dark:text-blue-700 hover:text-rose-600 dark:hover:text-blue-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-rose-200/50 dark:border-blue-500/20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <div className="glass-panel rounded-2xl p-20 text-center">
          <div className="w-20 h-20 bg-rose-500/10 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-rose-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-black text-rose-900 dark:text-blue-300 mb-2 uppercase tracking-tighter">No student matching records</h3>
          <p className="text-rose-700/50 dark:text-blue-500/50 text-xs font-bold uppercase tracking-widest">Refine your search parameters or check filters</p>
        </div>
      )}

      <StudentForm
        isOpen={showAddModal || !!editingStudent}
        onClose={() => {
          setShowAddModal(false);
          setEditingStudent(null);
        }}
        onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
        editingStudent={editingStudent}
      />
    </div>
  );
};