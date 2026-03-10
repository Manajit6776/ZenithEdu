import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, Clock, CheckCircle, AlertCircle, FileText, Filter, Upload, Download, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AssignmentGrading } from './AssignmentGrading';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  courseCode: string;
  dueDate: string;
  maxScore: number;
  type: string;
  status: string;
  teacherId: string;
  attachmentUrl?: string;
  teacher: {
    name: string;
    email: string;
  };
  submissions: Array<{
    id: string;
    score: number | null;
    status: string;
    student: {
      name: string;
      rollNo: string;
    };
  }>;
  createdAt: string;
}

interface AssignmentFormData {
  title: string;
  description: string;
  subject: string;
  courseCode: string;
  dueDate: string;
  maxScore: number;
  type: string;
}

export const Assignments: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    subject: '',
    courseCode: '',
    dueDate: '',
    maxScore: 100,
    type: 'Homework'
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assignments?teacherId=${user?.id}`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-assignment-file', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.url;
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let attachmentUrl = null;
      
      // Upload attachment if exists
      if (attachmentFile) {
        attachmentUrl = await handleFileUpload(attachmentFile);
      }
      
      const assignmentData: any = {
        ...formData,
        teacherId: user?.id,
        status: 'Published',
        attachmentUrl
      };

      // Handle dueDate properly
      if (assignmentData.dueDate) {
        // If it's already a date string, ensure it's in proper ISO format
        if (assignmentData.dueDate.trim() === '') {
          delete assignmentData.dueDate;
        } else {
          // Convert to proper ISO format if it's missing seconds
          const dateStr = assignmentData.dueDate;
          if (dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+')) {
            // Add seconds and Z if missing
            if (dateStr.split(':')[1].length === 2) {
              assignmentData.dueDate = dateStr + ':00.000Z';
            }
          }
        }
      } else {
        delete assignmentData.dueDate;
      }

      console.log('Submitting assignment data:', JSON.stringify(assignmentData, null, 2));
      console.log('User ID:', user?.id);

      if (editingAssignment) {
        console.log('Updating assignment with ID:', editingAssignment.id);
        const response = await fetch(`/api/assignments/${editingAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Update failed:', errorData);
          console.error('Error details:', JSON.stringify(errorData, null, 2));
          throw new Error(`Failed to update assignment: ${response.status} - ${errorData.details || errorData.error}`);
        }
      } else {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Create failed:', errorData);
          throw new Error(`Failed to create assignment: ${response.status}`);
        }
      }

      setIsFormOpen(false);
      setEditingAssignment(null);
      setAttachmentFile(null);
      setFormData({
        title: '',
        description: '',
        subject: '',
        courseCode: '',
        dueDate: '',
        maxScore: 100,
        type: 'Homework'
      });
      loadAssignments();
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      courseCode: assignment.courseCode,
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      maxScore: assignment.maxScore,
      type: assignment.type
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (assignment: Assignment) => {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      try {
        await fetch(`/api/assignments/${assignment.id}`, {
          method: 'DELETE'
        });
        loadAssignments();
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  const clearFilters = () => {
    setFilterSubject('');
    setFilterStatus('');
    setShowFilterDropdown(false);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !filterSubject || assignment.subject === filterSubject;
    const matchesStatus = !filterStatus || assignment.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Homework': return 'bg-blue-100 text-blue-800';
      case 'Quiz': return 'bg-purple-100 text-purple-800';
      case 'Project': return 'bg-green-100 text-green-800';
      case 'Exam': return 'bg-red-100 text-red-800';
      case 'Lab': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-white uppercase tracking-tight">Assignments</h1>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-1">Manage and grade student assignments</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 text-white rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/40 text-[10px] font-black uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/40 dark:bg-slate-800 p-4 rounded-xl shadow-lg shadow-rose-200/5 border border-rose-200/30 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assignments..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-900 border border-rose-200/30 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 outline-none transition-all text-black dark:text-white text-[11px] font-black uppercase tracking-widest placeholder:text-rose-300 dark:placeholder-slate-600 shadow-sm"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-50/50 dark:bg-slate-900 border border-rose-200/30 dark:border-slate-700 rounded-xl text-rose-800 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-slate-800 transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterSubject || filterStatus) && (
              <span className="w-1.5 h-1.5 bg-rose-600 dark:bg-indigo-500 rounded-full animate-pulse"></span>
            )}
          </button>
          
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select 
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">All Subjects</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={clearFilters}
                    className="flex-1 px-3 py-2 text-[10px] font-black bg-rose-50 dark:bg-slate-700 text-rose-700 dark:text-slate-300 border border-rose-200/30 dark:border-slate-600 rounded-xl hover:bg-rose-100 dark:hover:bg-slate-600 transition-colors uppercase tracking-widest"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowFilterDropdown(false)}
                    className="flex-1 px-3 py-2 text-[10px] font-black bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 text-white rounded-xl hover:shadow-lg transition-all uppercase tracking-widest"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment List */}
      <div className="bg-white/30 dark:bg-slate-800 rounded-xl shadow-xl shadow-rose-200/5 border border-rose-200/20 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            Loading assignments...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 dark:bg-slate-900 border-b border-rose-200/20 dark:border-slate-700">
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400">Assignment</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400">Subject</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400">Type</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400">Due Date</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400">Submissions</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400">Status</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No assignments found</td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-black dark:text-white group-hover:text-rose-800">{assignment.title}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{assignment.courseCode}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-400 font-bold">{assignment.subject}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(assignment.type)}`}>
                          {assignment.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {assignment.submissions.length}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({assignment.submissions.filter(s => s.score !== null).length} graded)
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {assignment.attachmentUrl && (
                            <a
                              href={assignment.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                              title="View attachment"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => setSelectedAssignment(assignment.id)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Grade submissions"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(assignment)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(assignment)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <button 
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingAssignment(null);
                  setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    courseCode: '',
                    dueDate: '',
                    maxScore: 100,
                    type: 'Homework'
                  });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                  <input 
                    type="text" 
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input 
                    type="datetime-local" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Score</label>
                  <input 
                    type="number" 
                    value={formData.maxScore}
                    onChange={(e) => setFormData({...formData, maxScore: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="Homework">Homework</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                  <option value="Exam">Exam</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachment (Optional)</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="attachment-upload"
                  />
                  <label
                    htmlFor="attachment-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {attachmentFile ? attachmentFile.name : 'Click to upload attachment'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, TXT (Max 5MB)</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingAssignment(null);
                    setFormData({
                      title: '',
                      description: '',
                      subject: '',
                      courseCode: '',
                      dueDate: '',
                      maxScore: 100,
                      type: 'Homework'
                    });
                  }}
                  className="px-6 py-2.5 border-2 border-rose-200/30 dark:border-slate-700 rounded-xl text-rose-800 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/40 text-[10px] font-black uppercase tracking-widest"
                >
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Grading Modal */}
      {selectedAssignment && (
        <AssignmentGrading
          assignmentId={selectedAssignment}
          onClose={() => {
            setSelectedAssignment(null);
            loadAssignments(); // Refresh assignments data after grading
          }}
          onGradeComplete={() => loadAssignments()} // Refresh when grading is successful
        />
      )}
    </div>
  );
};
