import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, CheckCircle, X, AlertCircle, Star, MessageSquare, Calendar, User, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Submission {
  id: string;
  assignment: {
    id: string;
    title: string;
    maxScore: number;
    dueDate: string;
    attachmentUrl?: string;
  };
  student: {
    name: string;
    rollNo: string;
  };
  content: string;
  attachmentUrl?: string;
  score: number | null;
  feedback: string | null;
  status: string;
  submittedAt: string;
  gradedAt?: string;
}

interface AssignmentGradingProps {
  assignmentId: string;
  onClose: () => void;
  onGradeComplete?: () => void; // Add callback for successful grading
}

export const AssignmentGrading: React.FC<AssignmentGradingProps> = ({ assignmentId, onClose, onGradeComplete }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingData, setGradingData] = useState({
    score: '',
    feedback: ''
  });

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    try {
      const score = parseFloat(gradingData.score);
      if (isNaN(score) || score < 0 || score > selectedSubmission?.assignment.maxScore) {
        alert(`Please enter a valid score between 0 and ${selectedSubmission?.assignment.maxScore}`);
        return;
      }

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          feedback: gradingData.feedback,
          status: 'Graded'
        })
      });

      if (response.ok) {
        loadSubmissions(); // Refresh the list
        setSelectedSubmission(null);
        setGradingData({ score: '', feedback: '' });
        onGradeComplete?.(); // Notify parent of successful grading
      }
    } catch (error) {
      console.error('Failed to grade submission:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Submitted</span>;
      case 'Graded':
        return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Graded</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getScoreColor = (score: number | null, maxScore: number) => {
    if (score === null) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 font-bold';
    if (percentage >= 50) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden border border-rose-100 dark:border-white/5 backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 dark:from-indigo-600 dark:via-violet-600 dark:to-indigo-500 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Assignment Analysis</h2>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">
                {submissions.length} DATA INSTANCE{submissions.length !== 1 ? 'S' : ''} DETECTED
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Submissions List */}
          <div className="w-2/5 border-r border-rose-100 dark:border-white/5 bg-rose-50/30 dark:bg-slate-900/50 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-[0.2em] mb-6">Submission Queue</h3>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`bg-white/60 dark:bg-slate-800/60 rounded-2xl p-5 cursor-pointer transition-all border-2 backdrop-blur-sm group ${
                      selectedSubmission?.id === submission.id
                        ? 'border-rose-500 shadow-xl shadow-rose-200/50 scale-[1.02]'
                        : 'border-white dark:border-white/5 hover:border-rose-200 dark:hover:border-indigo-500/30 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-rose-500/10 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-rose-500/10 transition-transform group-hover:scale-110">
                            <User className="w-6 h-6 text-rose-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-rose-950 dark:text-white uppercase tracking-tight">
                              {submission.student.name}
                            </h4>
                            <p className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                              #{submission.student.rollNo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-rose-700/40 dark:text-slate-600 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" />
                          <span>CAPTURED: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {submission.attachmentUrl && (
                          <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 mt-2 uppercase tracking-widest">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Binary Attached</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          submission.status === 'Graded' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {submission.status}
                        </span>
                        {submission.score !== null && (
                          <div className="mt-1">
                            <span className={`text-xl font-black ${getScoreColor(submission.score, submission.assignment.maxScore)}`}>
                              {submission.score}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 ml-1">/ {submission.assignment.maxScore}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grading Panel */}
          <div className="w-3/5 bg-white dark:bg-slate-800 overflow-y-auto">
            {selectedSubmission ? (
              <div className="p-8">
                {/* Student Header */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-[2rem] p-8 mb-8 border border-rose-100 dark:border-white/5 relative overflow-hidden shadow-xl shadow-rose-200/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-tr from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-600 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-200">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-rose-950 dark:text-white uppercase tracking-tight">
                          {selectedSubmission.student.name}
                        </h3>
                        <p className="text-[11px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
                          Academic Portfolio ID: #{selectedSubmission.student.rollNo}
                        </p>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2 bg-rose-100/50 dark:bg-white/5 px-3 py-1 rounded-full w-fit">
                          Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedSubmission.score !== null && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest mb-1">Assessed Value</p>
                        <div className="bg-white/80 dark:bg-white/10 px-6 py-3 rounded-2xl border border-rose-100 dark:border-white/10 backdrop-blur-md">
                          <span className={`text-4xl font-black ${getScoreColor(selectedSubmission.score, selectedSubmission.assignment.maxScore)}`}>
                            {selectedSubmission.score}
                          </span>
                          <span className="text-sm font-black text-slate-400 ml-2">/ {selectedSubmission.assignment.maxScore}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-rose-50/20 dark:bg-slate-900 border border-rose-100 dark:border-white/5 rounded-3xl p-6">
                    <h4 className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      Mission Specifications
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest mb-1">Project Title</p>
                        <p className="text-sm font-black text-rose-950 dark:text-white uppercase tracking-tight">
                          {selectedSubmission.assignment.title}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-rose-100/50 dark:border-white/5">
                        <div>
                          <p className="text-[9px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest mb-1">Max Credit</p>
                          <p className="text-sm font-black text-rose-950 dark:text-white">
                            {selectedSubmission.assignment.maxScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest mb-1">Final Timeout</p>
                          <p className="text-sm font-black text-rose-950 dark:text-white">
                            {new Date(selectedSubmission.assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-50/20 dark:bg-slate-900 border border-rose-100 dark:border-white/5 rounded-3xl p-6">
                    <h4 className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Upload className="w-4 h-4" />
                      </div>
                      Submission Metadata
                    </h4>
                    <div className="space-y-4">
                      <div>
                         <p className="text-[9px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest mb-1">Captured Data</p>
                         <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-rose-100 dark:border-white/5 max-h-32 overflow-y-auto">
                            <p className="text-xs text-rose-950/70 dark:text-slate-400 font-medium leading-relaxed">
                              {selectedSubmission.content || 'System report: No narrative content detected.'}
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grading Form */}
                <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-rose-500 dark:from-indigo-600 dark:via-violet-600 dark:to-indigo-500 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -ml-32 -mt-32"></div>
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Star className="w-5 h-5" />
                    </div>
                    Scholastic Evaluation Interface
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 relative z-10">
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">
                        Assigned Credit (MAX: {selectedSubmission.assignment.maxScore})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedSubmission.assignment.maxScore}
                        step="0.5"
                        value={gradingData.score}
                        onChange={(e) => setGradingData({ ...gradingData, score: e.target.value })}
                        className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 focus:outline-none transition-all font-black text-2xl placeholder:text-white/20"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="md:col-span-8">
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">
                        Operational Feedback & Analysis
                      </label>
                      <textarea
                        rows={3}
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                        className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 focus:outline-none transition-all font-bold text-sm placeholder:text-white/20 resize-none"
                        placeholder="Document qualitative performance metrics..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10 relative z-10">
                    <button
                      onClick={() => handleGrade(selectedSubmission.id)}
                      disabled={!gradingData.score}
                      className="flex-1 bg-white text-rose-600 dark:text-indigo-600 px-8 py-5 rounded-2xl hover:bg-rose-50 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Commit Evaluation
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-8 py-5 bg-white/10 border-2 border-white/30 rounded-2xl hover:bg-white/20 transition-all font-black uppercase text-xs tracking-widest"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                    Select a Submission
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose a student submission from the list on the left to start grading
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
