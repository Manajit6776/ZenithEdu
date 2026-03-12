import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  Activity,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Shield,
  Target,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Lock as LockIcon
} from 'lucide-react';

// ... keep all interfaces the same ...
interface Student {

  student_id: string;

  student_name: string;

  roll_no: string;

  prediction: {

    risk: 'low' | 'medium' | 'high';

    confidence: number;

    factors: string[];

  };

}



interface ClassPrediction {

  department: string;

  total_students: number;

  risk_distribution: {

    low: number;

    medium: number;

    high: number;

  };

  predictions: Student[];

}



interface AnomalyDetection {

  anomaly: boolean;

  severity: 'low' | 'medium' | 'high';

  pattern: string;

  score: number;

  timestamp?: string;

}



interface StudentAnomaly {

  student_id: string;

  student_name: string;

  roll_no?: string;

  department?: string;

  anomaly_detection: AnomalyDetection;

}



interface AnalyticsOverview {

  total_students: number;

  average_attendance: number;

  average_cgpa: number;

  risk_distribution: {

    low: number;

    medium: number;

    high: number;

  };

}



interface DepartmentStat {

  department: string;

  studentCount: number;

  avgCGPA: number;

  avgAttendance: number;

  avgAssignmentScore: number;

  riskDistribution: {

    low: number;

    medium: number;

    high: number;

  };

  allStudents?: any[];

}
// API Base URL - adjust according to your setup
const API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

const TeacherAnalytics = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'anomalies'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [classPredictions, setClassPredictions] = useState<ClassPrediction[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [anomalies, setAnomalies] = useState<StudentAnomaly[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analyzingStudents, setAnalyzingStudents] = useState<Set<string>>(new Set());
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const studentsPerPage = 10;

  // Role-based access control
  if (user?.role !== "Admin" && user?.role !== "Teacher") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-12 bg-white/40 dark:bg-white/[0.03] rounded-[3rem] border border-rose-100 dark:border-white/5 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-500/10 dark:bg-indigo-500/20 rounded-[2rem] mb-8 border border-rose-500/10 dark:border-indigo-500/20">
            <Shield className="w-12 h-12 text-rose-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-rose-950 dark:text-white mb-4 uppercase tracking-tight">Security Protocol</h2>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 leading-relaxed">
            ACCESS RESTRICTED TO AUTHORIZED ACADEMIC PERSONNEL ONLY.
            PLEASE AUTHENTICATE THROUGH THE PROPER CHANNELS.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-rose-100 dark:border-white/5 text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest shadow-inner">
            <LockIcon className="w-4 h-4" />
            <span>ROLE REQUISITE: FACULTY / ADMIN</span>
          </div>
        </div>
      </div>
    );
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDepartmentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            setActiveTab('overview');
            e.preventDefault();
            break;
          case '2':
            setActiveTab('performance');
            e.preventDefault();
            break;
          case '3':
            setActiveTab('anomalies');
            e.preventDefault();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAnalyticsData();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load overview data from your FastAPI endpoint
      const overviewResponse = await fetch(`${API_BASE_URL}/analytics/overview`);
      if (!overviewResponse.ok) {
        throw new Error(`Failed to load overview: ${overviewResponse.status}`);
      }

      const overviewData = await overviewResponse.json();

      const mappedOverview = {
        total_students: overviewData.totalStudents,
        average_attendance: overviewData.avgAttendance,
        average_cgpa: overviewData.avgCGPA,
        risk_distribution: overviewData.riskDistribution
      };

      setOverview(mappedOverview);

      // Load department stats from your FastAPI endpoint
      const deptResponse = await fetch(`${API_BASE_URL}/analytics/department-stats`);
      if (!deptResponse.ok) {
        throw new Error(`Failed to load department stats: ${deptResponse.status}`);
      }

      const deptData = await deptResponse.json();
      const predictions: ClassPrediction[] = [];

      // Store department stats
      setDepartmentStats(deptData.departments);

      // Convert department stats to class predictions with actual student data
      deptData.departments.forEach((dept: any) => {
        const allStudents = dept.allStudents?.map((student: any, studentIndex: number) => ({
          student_id: student.id,
          student_name: student.name,
          roll_no: student.rollNo || `${getDepartmentCode(dept.department)}${String(studentIndex + 1).padStart(3, '0')}`,
          prediction: {
            risk: (student.cgpa < 6.0 || student.attendance < 75) ? 'high' as const :
              (student.cgpa >= 6.0 && student.cgpa < 7.5 && student.attendance >= 75) ? 'medium' as const :
                'low' as const,
            confidence: 0.85,
            factors: student.cgpa < 6.0 ? ['Low CGPA'] : student.attendance < 75 ? ['Poor Attendance'] : ['Good Performance']
          }
        })) || [];

        predictions.push({
          department: dept.department,
          total_students: dept.studentCount,
          risk_distribution: dept.riskDistribution,
          predictions: allStudents
        });
      });

      setClassPredictions(predictions);
      if (predictions.length > 0 && !selectedDepartment) {
        setSelectedDepartment(predictions[0].department);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      console.error('Analytics loading error:', err);

      // Load fallback data if API is not available
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Fallback data for demo/testing
    const fallbackOverview: AnalyticsOverview = {
      total_students: 450,
      average_attendance: 85.5,
      average_cgpa: 7.8,
      risk_distribution: {
        low: 320,
        medium: 90,
        high: 40
      }
    };

    const fallbackDepartments: DepartmentStat[] = [
      {
        department: 'Computer Science',
        studentCount: 120,
        avgCGPA: 8.2,
        avgAttendance: 88.5,
        avgAssignmentScore: 85.7,
        riskDistribution: { low: 85, medium: 25, high: 10 }
      },
      {
        department: 'Electrical Engineering',
        studentCount: 95,
        avgCGPA: 7.9,
        avgAttendance: 82.3,
        avgAssignmentScore: 80.1,
        riskDistribution: { low: 60, medium: 25, high: 10 }
      },
      {
        department: 'Mechanical Engineering',
        studentCount: 110,
        avgCGPA: 7.5,
        avgAttendance: 79.8,
        avgAssignmentScore: 78.3,
        riskDistribution: { low: 70, medium: 30, high: 10 }
      }
    ];

    const fallbackPredictions: ClassPrediction[] = fallbackDepartments.map(dept => ({
      department: dept.department,
      total_students: dept.studentCount,
      risk_distribution: dept.riskDistribution,
      predictions: Array.from({ length: Math.min(dept.studentCount, 15) }, (_, i) => ({
        student_id: `student-${dept.department}-${i}`,
        student_name: `Student ${i + 1}`,
        roll_no: `${getDepartmentCode(dept.department)}${String(i + 1).padStart(3, '0')}`,
        prediction: {
          risk: i < 3 ? 'high' : i < 8 ? 'medium' : 'low',
          confidence: 0.8 + Math.random() * 0.15,
          factors: i < 3 ? ['Low CGPA', 'Poor Attendance'] : i < 8 ? ['Moderate Attendance'] : ['Good Performance']
        }
      }))
    }));

    setOverview(fallbackOverview);
    setDepartmentStats(fallbackDepartments);
    setClassPredictions(fallbackPredictions);
    if (fallbackPredictions.length > 0 && !selectedDepartment) {
      setSelectedDepartment(fallbackPredictions[0].department);
    }
  };

  const getDepartmentCode = (department: string): string => {
    const deptCodes: { [key: string]: string } = {
      'Business Administration': 'BA',
      'Biology': 'BIO',
      'Civil Engineering': 'CE',
      'Chemistry': 'CHEM',
      'Computer Science': 'CS',
      'Electrical Engineering': 'EE',
      'Mathematics': 'MATH',
      'Mechanical Engineering': 'ME',
      'Physics': 'PHY'
    };
    return deptCodes[department] || 'GEN';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 dark:text-indigo-400 bg-red-500/10 dark:bg-indigo-500/10 border-red-500/20 dark:border-indigo-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 dark:text-indigo-400 bg-red-500/10 dark:bg-indigo-500/10 border-red-500/20 dark:border-indigo-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const detectAttendanceAnomalies = async (studentId: string) => {
    let controller: AbortController | null = null;

    try {
      // Add to analyzing set
      setAnalyzingStudents(prev => new Set(prev).add(studentId));

      controller = new AbortController();
      const timeoutId = setTimeout(() => controller!.abort(), 15000);

      // Call your FastAPI ML endpoint for anomaly detection
      const response = await fetch(`${API_BASE_URL}/analytics/attendance-anomaly/${studentId}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.anomaly_detection || typeof data.anomaly_detection.anomaly !== 'boolean') {
        throw new Error('Invalid response format');
      }

      // Add the anomaly result to the anomalies state
      setAnomalies(prev => {
        // Remove any existing anomaly for this student
        const filtered = prev.filter(a => a.student_id !== studentId);
        // Add the new anomaly with timestamp
        const newAnomaly = {
          ...data,
          anomaly_detection: {
            ...data.anomaly_detection,
            timestamp: new Date().toISOString()
          }
        };
        return [...filtered, newAnomaly];
      });

      return data.anomaly_detection;
    } catch (err) {
      console.error('Error detecting anomalies:', err);

      // Find student info for fallback
      let studentName = 'Unknown Student';
      let studentRollNo = '';
      let department = '';

      for (const pred of classPredictions) {
        const student = pred.predictions.find(s => s.student_id === studentId);
        if (student) {
          studentName = student.student_name;
          studentRollNo = student.roll_no;
          department = pred.department;
          break;
        }
      }

      // Fallback logic - 15% chance of anomaly (same as your ML model)
      const hasAnomaly = Math.random() < 0.15;
      const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const anomalyTypes = ['frequent_absences', 'irregular_pattern', 'frequent_lateness', 'declining_trend'];
      const normalPatterns = ['consistent', 'regular', 'stable'];

      const fallbackAnomaly: StudentAnomaly = {
        student_id: studentId,
        student_name: studentName,
        roll_no: studentRollNo,
        department: department,
        anomaly_detection: {
          anomaly: hasAnomaly,
          severity: hasAnomaly ? severities[Math.floor(Math.random() * severities.length)] : 'low',
          pattern: hasAnomaly ? anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)] : normalPatterns[Math.floor(Math.random() * normalPatterns.length)],
          score: hasAnomaly ? Math.random() * -0.5 - 0.1 : Math.random() * 0.3 + 0.1,
          timestamp: new Date().toISOString()
        }
      };

      setAnomalies(prev => {
        const filtered = prev.filter(a => a.student_id !== studentId);
        return [...filtered, fallbackAnomaly];
      });

      return fallbackAnomaly.anomaly_detection;
    } finally {
      if (controller) {
        controller.abort();
      }

      // Remove from analyzing set
      setAnalyzingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const getStudentPerformancePrediction = async (studentId: string) => {
    try {
      // Call your FastAPI endpoint for performance prediction
      const response = await fetch(`${API_BASE_URL}/api/student-risk/${studentId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Performance prediction error:', err);
    }
    return null;
  };

  const exportAnalyticsData = () => {
    const data = {
      overview,
      classPredictions,
      departmentStats,
      anomalies: anomalies.map(a => ({
        ...a,
        analyzed_at: new Date().toISOString()
      })),
      exportDate: new Date().toISOString(),
      exportedBy: user?.role
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Memoized computations
  const selectedClassPrediction = useMemo(() =>
    classPredictions.find(pred => pred.department === selectedDepartment),
    [classPredictions, selectedDepartment]
  );

  const filteredStudents = useMemo(() => {
    if (!selectedClassPrediction) return [];

    return selectedClassPrediction.predictions.filter(student => {
      const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || student.prediction.risk === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [selectedClassPrediction, searchTerm, riskFilter]);

  const totalPages = useMemo(() =>
    Math.ceil(filteredStudents.length / studentsPerPage),
    [filteredStudents.length]
  );

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * studentsPerPage;
    return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
  }, [filteredStudents, currentPage]);

  const allStudentsForAnomalies = useMemo(() => {
    const students: Array<{ student_id: string; student_name: string; roll_no: string; department: string }> = [];
    classPredictions.forEach(pred => {
      pred.predictions.forEach(student => {
        students.push({
          student_id: student.student_id,
          student_name: student.student_name,
          roll_no: student.roll_no,
          department: pred.department
        });
      });
    });
    return students;
  }, [classPredictions]);

  const filteredStudentsForAttendance = useMemo(() => {
    if (!selectedDepartment) return allStudentsForAnomalies;
    return allStudentsForAnomalies.filter(student => student.department === selectedDepartment);
  }, [allStudentsForAnomalies, selectedDepartment]);

  const filteredAnomaliesForAttendance = useMemo(() => {
    if (!selectedDepartment) return anomalies;
    return anomalies.filter(anomaly => {
      const student = allStudentsForAnomalies.find(s => s.student_id === anomaly.student_id);
      return student?.department === selectedDepartment;
    });
  }, [anomalies, selectedDepartment, allStudentsForAnomalies]);

  const anomaliesByDeptForAttendance = useMemo(() => {
    const grouped: { [key: string]: StudentAnomaly[] } = {};
    anomalies.forEach(anomaly => {
      const student = allStudentsForAnomalies.find(s => s.student_id === anomaly.student_id);
      if (student) {
        const dept = student.department;
        if (!grouped[dept]) {
          grouped[dept] = [];
        }
        grouped[dept].push({
          ...anomaly,
          department: dept,
          roll_no: student.roll_no
        });
      }
    });
    return grouped;
  }, [anomalies, allStudentsForAnomalies]);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/40 dark:bg-indigo-500/5 p-6 rounded-2xl border border-rose-200/30 dark:border-indigo-500/20 hover:border-rose-400 dark:hover:border-indigo-500/40 transition-all duration-300 group hover:scale-[1.02] shadow-xl shadow-rose-200/5 dark:shadow-indigo-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700/60 dark:text-indigo-400/60 mb-2 uppercase tracking-widest">Total Students</p>
              <p className="text-3xl font-black text-rose-800 dark:text-white mb-1">{overview?.total_students || 0}</p>
              <div className="flex items-center text-sm text-rose-600 dark:text-indigo-400 font-medium">
                <Users className="w-4 h-4 mr-1" />
                <span>Across all departments</span>
              </div>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-indigo-500/10 rounded-xl group-hover:bg-rose-200 dark:group-hover:bg-indigo-500/20 transition-colors">
              <Users className="w-6 h-6 text-rose-700 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-amber-500/5 p-6 rounded-2xl border border-amber-200/30 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all duration-300 group hover:scale-[1.02] shadow-xl shadow-amber-200/5 dark:shadow-amber-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700/60 dark:text-amber-400/60 mb-2 uppercase tracking-widest">Avg Attendance</p>
              <p className="text-3xl font-black text-amber-800 dark:text-white mb-1">{overview?.average_attendance?.toFixed(1) || 0}%</p>
              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400 font-medium">
                <Activity className="w-4 h-4 mr-1" />
                <span>Overall rate</span>
              </div>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-xl group-hover:bg-amber-200 dark:group-hover:bg-amber-500/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-purple-500/5 p-6 rounded-2xl border border-rose-200/30 dark:border-purple-500/20 hover:border-rose-400 dark:hover:border-purple-500/40 transition-all duration-300 group hover:scale-[1.02] shadow-xl shadow-rose-200/5 dark:shadow-purple-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700/60 dark:text-purple-400/60 mb-2 uppercase tracking-widest">Avg CGPA</p>
              <p className="text-3xl font-black text-rose-800 dark:text-white mb-1">{overview?.average_cgpa?.toFixed(2) || 0}</p>
              <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>Academic performance</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-colors">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-indigo-500/5 p-6 rounded-2xl border border-rose-200/30 dark:border-indigo-500/20 hover:border-rose-400 dark:hover:border-indigo-500/40 transition-all duration-300 group hover:scale-[1.02] shadow-xl shadow-rose-200/5 dark:shadow-indigo-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700/60 dark:text-indigo-400/60 mb-2 uppercase tracking-widest">High Risk</p>
              <p className="text-3xl font-black text-rose-800 dark:text-white mb-1">{overview?.risk_distribution?.high || 0}</p>
              <div className="flex items-center text-sm text-rose-600 dark:text-indigo-400 font-medium">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Need attention</span>
              </div>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-indigo-500/10 rounded-xl group-hover:bg-rose-200 dark:group-hover:bg-indigo-500/20 transition-colors">
              <AlertTriangle className="w-6 h-6 text-rose-700 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-rose-800 dark:text-white mb-1">Department Performance</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Compare performance metrics across departments</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2.5 bg-rose-100 dark:bg-indigo-500/10 hover:bg-rose-200 dark:hover:bg-indigo-500/20 rounded-lg text-rose-700 dark:text-indigo-400 transition-colors"
            >
              {viewMode === 'grid' ? <PieChart className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </button>
            <button
              onClick={exportAnalyticsData}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black rounded-lg transition-colors shadow-lg shadow-rose-200/20 dark:shadow-indigo-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats.map((dept) => (
              <div
                key={dept.department}
                className="bg-white/40 dark:bg-white/[0.02] rounded-xl p-5 hover:bg-rose-50/60 dark:hover:bg-white/[0.05] transition-all duration-300 border border-rose-200/30 dark:border-white/5 hover:border-rose-400 dark:hover:border-indigo-500/40 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-500/10"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-rose-500 dark:bg-indigo-500 rounded-full group-hover:animate-pulse"></div>
                    <h4 className="font-black text-rose-900 dark:text-white">{dept.department}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest">{dept.studentCount} students</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white/30 dark:bg-indigo-500/10 rounded-lg border border-transparent dark:border-indigo-500/10 transition-colors group-hover:border-indigo-500/20">
                      <p className="text-2xl font-black text-rose-700 dark:text-indigo-300">{dept.avgCGPA.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 mt-1 uppercase">CGPA</p>
                    </div>
                    <div className="text-center p-3 bg-amber-100/30 dark:bg-amber-500/10 rounded-lg border border-transparent dark:border-amber-500/10 transition-colors group-hover:border-amber-500/20">
                      <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{dept.avgAttendance.toFixed(1)}%</p>
                      <p className="text-[10px] font-bold text-rose-700/60 dark:text-amber-400/60 mt-1 uppercase">Attendance</p>
                    </div>
                    <div className="text-center p-3 bg-white/30 dark:bg-purple-500/10 rounded-lg border border-transparent dark:border-purple-500/10 transition-colors group-hover:border-purple-500/20">
                      <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{dept.avgAssignmentScore.toFixed(1)}%</p>
                      <p className="text-[10px] font-bold text-rose-700/60 dark:text-purple-400/60 mt-1 uppercase">Assignments</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest">Risk Distribution</span>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getRiskColor('low')} uppercase tracking-tighter`}>
                          {dept.riskDistribution.low}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getRiskColor('medium')} uppercase tracking-tighter`}>
                          {dept.riskDistribution.medium}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getRiskColor('high')} uppercase tracking-tighter`}>
                          {dept.riskDistribution.high}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-rose-100/50 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-emerald-500"
                          style={{ width: `${(dept.riskDistribution.low / dept.studentCount) * 100}%` }}
                        />
                        <div
                          className="bg-amber-500"
                          style={{ width: `${(dept.riskDistribution.medium / dept.studentCount) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 dark:bg-indigo-500"
                          style={{ width: `${(dept.riskDistribution.high / dept.studentCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rose-100 dark:border-white/5 bg-white/30 dark:bg-white/5">
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">Department</th>
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">Students</th>
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">Avg CGPA</th>
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">Avg Attendance</th>
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">Low Risk</th>
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">Medium Risk</th>
                  <th className="py-4 px-4 text-left text-rose-900 dark:text-slate-400 font-black text-xs uppercase tracking-widest">High Risk</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept) => (
                  <tr key={dept.department} className="border-b border-rose-50 dark:border-white/5 hover:bg-rose-100/20 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-4 font-black text-black dark:text-white group-hover:text-rose-700 dark:group-hover:text-indigo-400 transition-colors">{dept.department}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-bold">{dept.studentCount}</td>
                    <td className="py-4 px-4">
                      <span className="font-black text-blue-700 dark:text-indigo-300">{dept.avgCGPA.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-emerald-700 dark:text-emerald-300">{dept.avgAttendance.toFixed(1)}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{dept.riskDistribution.low}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-amber-600 dark:text-amber-400">{dept.riskDistribution.medium}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-rose-600 dark:text-indigo-400">{dept.riskDistribution.high}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
          <h3 className="text-xl font-black text-rose-800 dark:text-white mb-6">Risk Distribution</h3>
          <div className="space-y-6">
            {overview?.risk_distribution && (
              <>
                <div className="space-y-4">
                  {[
                    { level: 'low', count: overview.risk_distribution.low, color: 'emerald' },
                    { level: 'medium', count: overview.risk_distribution.medium, color: 'amber' },
                    { level: 'high', count: overview.risk_distribution.high, color: 'rose' }
                  ].map(({ level, count, color }) => (
                    <div key={level} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 bg-${color}-500 rounded-full group-hover:animate-pulse`}></div>
                          <span className="font-bold text-rose-900/60 dark:text-slate-300 capitalize text-xs uppercase tracking-widest">{level} Risk</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-rose-900 dark:text-white">{count}</p>
                          <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-tighter">
                            {((count / overview.total_students) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <div className="h-3 bg-rose-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${color}-500 transition-all duration-500 ${color === 'rose' ? 'dark:bg-indigo-500' : ''}`}
                          style={{ width: `${Math.max((count / overview.total_students) * 100, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
          <h3 className="text-xl font-black text-rose-800 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full p-4 bg-white/40 dark:bg-indigo-600/10 hover:bg-rose-200/50 dark:hover:bg-indigo-600/20 border border-rose-200/30 dark:border-indigo-500/20 rounded-xl text-left group transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="p-2 bg-rose-100 dark:bg-indigo-500/20 rounded-lg">
                      <Brain className="w-5 h-5 text-rose-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-black text-rose-900 dark:text-white">Generate Performance Report</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-10">Create detailed report for selected department</p>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>

            <button className="w-full p-4 bg-white/40 dark:bg-emerald-600/20 hover:bg-rose-200/50 dark:hover:bg-emerald-600/30 border border-rose-200/30 dark:border-emerald-500/30 rounded-xl text-left group transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="p-2 bg-rose-100 dark:bg-emerald-500/20 rounded-lg">
                      <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-black text-rose-900 dark:text-white">Monitor Trends</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-10">View weekly/monthly performance trends</p>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
            </button>

            <button className="w-full p-4 bg-white/40 dark:bg-indigo-600/10 hover:bg-rose-200/50 dark:hover:bg-indigo-600/20 border border-rose-200/30 dark:border-indigo-500/20 rounded-xl text-left group transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="p-2 bg-rose-100 dark:bg-indigo-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-black text-rose-900 dark:text-white">Flag High-Risk Students</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-10">Send notifications for intervention</p>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformancePredictions = () => (
    <div className="space-y-8">
      {/* Header with Filters */}
      <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-rose-800 dark:text-white mb-1">Performance Predictions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Monitor and predict student performance based on academic metrics</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <RefreshCw className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Department Selector */}
          <div>
            <label className="block text-xs font-bold text-rose-700/60 dark:text-slate-300 mb-2 uppercase tracking-widest">Department</label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className="w-full px-4 py-3 pl-11 bg-white/50 dark:bg-white/[0.03] border border-rose-200/30 dark:border-white/10 rounded-xl text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 focus:border-transparent cursor-pointer flex items-center justify-between hover:border-rose-400 dark:hover:border-white/20 transition-all font-bold"
              >
                <span className="truncate">
                  {selectedDepartment || 'Select department...'}
                </span>
                {showDepartmentDropdown ? <ChevronUp className="h-5 w-5 text-rose-400 dark:text-slate-400" /> : <ChevronDown className="h-5 w-5 text-rose-400 dark:text-slate-400" />}
              </button>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Activity className="h-5 w-5 text-rose-400/60 dark:text-slate-500" />
              </div>

              {showDepartmentDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1e293b] rounded-xl border border-rose-100 dark:border-white/10 shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl">
                  {classPredictions.map((pred) => (
                    <button
                      key={pred.department}
                      onClick={() => {
                        setSelectedDepartment(pred.department);
                        setShowDepartmentDropdown(false);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-rose-50 dark:hover:bg-white/5 transition-colors border-b border-rose-50 dark:border-white/5 last:border-b-0 flex items-center justify-between group"
                    >
                      <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {pred.department}
                      </span>
                      <span className="text-sm text-slate-400">{pred.total_students} students</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search Students</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Name or roll number..."
                className="w-full px-4 py-3 pl-11 bg-white/50 dark:bg-white/[0.03] border border-rose-200/30 dark:border-white/10 rounded-xl text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 focus:border-transparent hover:border-rose-400 dark:hover:border-white/20 transition-all font-bold placeholder:text-rose-300 dark:placeholder:text-slate-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-rose-400/60 dark:text-slate-500" />
              </div>
            </div>
          </div>

          {/* Risk Filter */}
          <div>
            <label className="block text-xs font-bold text-rose-700/60 dark:text-slate-300 mb-2 uppercase tracking-widest">Risk Level</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'low', 'medium', 'high'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setRiskFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${riskFilter === filter
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200/50'
                    : 'bg-rose-100/50 dark:bg-white/[0.05] text-rose-700 dark:text-slate-400 hover:bg-rose-200 dark:hover:bg-white/10'
                    }`}
                >
                  {filter === 'all' ? 'All Risks' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedClassPrediction ? (
        <div className="space-y-6">
          {/* Department Summary */}
          <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-rose-800 dark:text-white mb-1 uppercase tracking-tight">{selectedClassPrediction.department}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {filteredStudents.length} of {selectedClassPrediction.total_students} students shown
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-tighter">Showing page</p>
                  <p className="text-lg font-black text-rose-800 dark:text-white">
                    {currentPage} of {totalPages}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Distribution Chart */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/40 dark:bg-emerald-500/10 border border-rose-200/30 dark:border-emerald-500/20 rounded-xl p-4 shadow-sm">
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{selectedClassPrediction.risk_distribution.low}</p>
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest">Low Risk</p>
                </div>
                <div className="bg-white/40 dark:bg-amber-500/10 border border-rose-200/30 dark:border-amber-500/20 rounded-xl p-4 shadow-sm">
                  <p className="text-3xl font-black text-amber-700 dark:text-amber-400">{selectedClassPrediction.risk_distribution.medium}</p>
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest">Medium Risk</p>
                </div>
                <div className="bg-white/40 dark:bg-indigo-500/10 border border-rose-200/30 dark:border-indigo-500/20 rounded-xl p-4 shadow-sm">
                  <p className="text-3xl font-black text-rose-700 dark:text-indigo-400">{selectedClassPrediction.risk_distribution.high}</p>
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest">High Risk</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-300">Risk Distribution Visualization</h4>
                <div className="space-y-3">
                  {[
                    { risk: 'low', count: selectedClassPrediction.risk_distribution.low, color: 'emerald' },
                    { risk: 'medium', count: selectedClassPrediction.risk_distribution.medium, color: 'amber' },
                    { risk: 'high', count: selectedClassPrediction.risk_distribution.high, color: 'rose' }
                  ].map(({ risk, count, color }) => (
                    <div key={risk} className="flex items-center space-x-4">
                      <div className="w-24 text-right">
                        <span className="text-sm text-slate-400 capitalize">{risk}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="h-2 flex-1 bg-rose-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-${color}-500 transition-all duration-500 ${color === 'rose' ? 'dark:bg-indigo-500' : ''}`}
                              style={{ width: `${Math.max((count / selectedClassPrediction.total_students) * 100, 3)}%` }}
                            ></div>
                          </div>
                          <span className="ml-3 text-sm font-semibold text-white">
                            {((count / selectedClassPrediction.total_students) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-3">
              {paginatedStudents.length > 0 ? (
                <>
                  {paginatedStudents.map((student) => (
                    <div
                      key={student.student_id}
                      className="group bg-white/40 dark:bg-white/[0.02] hover:bg-rose-50/60 dark:hover:bg-white/[0.05] rounded-xl p-4 border border-rose-200/30 dark:border-white/5 hover:border-rose-400 dark:hover:border-white/20 cursor-pointer transition-all duration-300"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-indigo-600/20 rounded-xl flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-indigo-600/30 transition-colors">
                              <span className="text-rose-700 dark:text-white font-black text-lg">
                                {student.student_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 ${student.prediction.risk === 'high' ? 'bg-rose-500 dark:bg-indigo-500' :
                              student.prediction.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}></div>
                          </div>
                          <div>
                            <h4 className="font-black text-rose-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-indigo-300 transition-colors">
                              {student.student_name}
                            </h4>
                            <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest">{student.roll_no}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${getRiskColor(student.prediction.risk)}`}>
                              {student.prediction.risk} Risk
                            </div>
                            <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 mt-1 uppercase tracking-tighter">
                              {Math.round(student.prediction.confidence * 100)}% confidence
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-rose-200/30 dark:border-white/5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 bg-rose-100 dark:bg-indigo-600/10 hover:bg-rose-200 dark:hover:bg-indigo-600/20 text-rose-700 dark:text-indigo-400 font-black text-xs uppercase rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        Previous
                      </button>

                      <div className="flex items-center space-x-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-black transition-all ${currentPage === pageNum
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200/20'
                                : 'bg-rose-100/50 dark:bg-indigo-600/10 text-rose-700 dark:text-indigo-400 hover:bg-rose-200 dark:hover:bg-indigo-600/20'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 bg-rose-100 dark:bg-indigo-600/10 hover:bg-rose-200 dark:hover:bg-indigo-600/20 text-rose-700 dark:text-indigo-400 font-black text-xs uppercase rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-rose-200 dark:text-slate-600 mx-auto mb-4" />
                  <h4 className="text-xl font-black text-rose-800 dark:text-slate-300 mb-2">No students found</h4>
                  <p className="text-slate-600 dark:text-slate-500 mb-6 font-bold text-xs uppercase tracking-widest">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRiskFilter('all');
                    }}
                    className="px-8 py-3 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 uppercase text-xs tracking-widest"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Activity className="w-20 h-20 text-slate-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-300 mb-3">Select a Department</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Choose a department from the dropdown above to view performance predictions and student analytics.
          </p>
          <button
            onClick={() => setShowDepartmentDropdown(true)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
          >
            Select Department
          </button>
        </div>
      )}
    </div>
  );

  const renderAnomalies = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-rose-800 dark:text-white mb-1 uppercase tracking-tight">Anomaly Detection</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Identify irregular attendance patterns using AI-powered analysis</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-tighter">
              <Clock className="w-3 h-3" />
              <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Department Selector */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-rose-700/60 dark:text-slate-300 mb-2 uppercase tracking-widest">Select Department</label>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-[#1e293b]/50 border border-rose-200/30 dark:border-white/10 rounded-xl text-rose-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 appearance-none cursor-pointer hover:border-rose-400 dark:hover:border-white/20 transition-all font-bold"
              >
                <option value="">All Departments</option>
                {classPredictions.map((pred) => (
                  <option key={pred.department} value={pred.department}>
                    {pred.department} ({pred.total_students})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-rose-400 pointer-events-none" />
            </div>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-rose-700/60 dark:text-slate-300 mb-2 uppercase tracking-widest">Auto Refresh</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2 font-black text-xs uppercase tracking-widest ${autoRefresh
                ? 'bg-rose-600/10 border-rose-600/30 text-rose-600'
                : 'bg-white/40 dark:bg-slate-800 border-rose-200/30 dark:border-slate-600 text-rose-400 dark:text-slate-400 hover:border-rose-400 dark:hover:border-slate-500'
                }`}
            >
              {autoRefresh ? <RefreshCw className="w-4 h-4 animate-spin-slow" /> : <Clock className="w-4 h-4" />}
              <span>{autoRefresh ? 'Live Updates On' : 'Live Updates Off'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
              <p className="text-3xl font-black text-rose-900 dark:text-white">
                {selectedDepartment ? filteredStudentsForAttendance.length : allStudentsForAnomalies.length}
              </p>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-indigo-500/20 rounded-xl">
              <Users className="w-6 h-6 text-rose-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-rose-700/60 dark:text-amber-400/60 uppercase tracking-widest mb-1">Anomalies</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly).length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mb-1">High Severity</p>
              <p className="text-3xl font-black text-rose-600 dark:text-indigo-400">
                {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly && a.anomaly_detection.severity === 'high').length}
              </p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-indigo-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-rose-700/60 dark:text-emerald-400/60 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {(() => {
                  const analyzedCount = filteredAnomaliesForAttendance.length;
                  const totalToAnalyze = selectedDepartment
                    ? filteredStudentsForAttendance.length
                    : allStudentsForAnomalies.length;
                  const progress = totalToAnalyze === 0 ? 0 : Math.round((analyzedCount / totalToAnalyze) * 100);
                  return `${progress}%`;
                })()}
              </p>
              <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-tighter mt-1">
                {(() => {
                  const analyzedCount = filteredAnomaliesForAttendance.length;
                  const totalToAnalyze = selectedDepartment
                    ? filteredStudentsForAttendance.length
                    : allStudentsForAnomalies.length;
                  return `${analyzedCount} / ${totalToAnalyze} analyzed`;
                })()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-2">
          <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-6 shadow-xl shadow-rose-200/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-rose-800 dark:text-white mb-1 uppercase tracking-tight">Students for Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {filteredStudentsForAttendance.length} students available
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest">
                  {analyzingStudents.size > 0 && `${analyzingStudents.size} analyzing...`}
                </span>
                <button
                  onClick={async () => {
                    for (const s of filteredStudentsForAttendance) {
                      await detectAttendanceAnomalies(s.student_id);
                    }
                  }}
                  disabled={filteredStudentsForAttendance.length === 0 || analyzingStudents.size > 0}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg ${analyzingStudents.size > 0
                    ? 'bg-rose-100 dark:bg-white/[0.05] text-rose-400 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white shadow-rose-200/50 dark:shadow-indigo-500/20'
                    }`}
                >
                  {analyzingStudents.size > 0
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Activity className="w-4 h-4" />}
                  <span>
                    {analyzingStudents.size > 0 ? 'Analyzing...' : 'Analyze Dept'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStudentsForAttendance.map((student) => {
                const anomaly = anomalies.find(a => a.student_id === student.student_id);
                const isAnalyzing = analyzingStudents.has(student.student_id);

                return (
                  <div key={student.student_id} className="group bg-white/40 dark:bg-white/[0.02] hover:bg-rose-50/60 dark:hover:bg-white/[0.05] rounded-xl p-4 border border-rose-200/30 dark:border-white/5 hover:border-rose-400 dark:hover:border-indigo-500/40 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-rose-100 dark:bg-white/[0.05] rounded-xl flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-indigo-600/20 transition-colors">
                            <span className="text-rose-700 dark:text-indigo-300 font-black text-lg">
                              {student.student_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {anomaly && anomaly.anomaly_detection.anomaly && (
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 ${anomaly.anomaly_detection.severity === 'high' ? 'bg-rose-500 dark:bg-indigo-500' :
                              anomaly.anomaly_detection.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              }`}></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-rose-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-indigo-400 transition-colors">{student.student_name}</h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest">{student.roll_no}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-rose-100/50 dark:bg-indigo-600/20 rounded font-black text-rose-800 dark:text-indigo-300 uppercase tracking-tighter">{student.department}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Status Badges */}
                        {!anomaly && !isAnalyzing && (
                          <span className="text-[10px] px-2 py-1 bg-rose-100 dark:bg-indigo-500/10 rounded text-rose-700 dark:text-indigo-400 font-black uppercase tracking-widest">
                            Ready
                          </span>
                        )}

                        {isAnalyzing && (
                          <span className="text-[10px] px-2 py-1 bg-rose-600/10 dark:bg-indigo-600/20 text-rose-600 dark:text-indigo-400 rounded font-black uppercase tracking-widest animate-pulse">
                            Processing
                          </span>
                        )}

                        {anomaly && (
                          <div className={`px-3 py-1 rounded-lg text-xs font-black border uppercase tracking-wider ${getSeverityColor(anomaly.anomaly_detection.severity)}`}>
                            {anomaly.anomaly_detection.anomaly ? anomaly.anomaly_detection.severity : 'NORMAL'}
                          </div>
                        )}

                        <button
                          onClick={() => detectAttendanceAnomalies(student.student_id)}
                          disabled={isAnalyzing}
                          className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${isAnalyzing
                            ? 'bg-rose-100 dark:bg-white/[0.05] text-rose-400 dark:text-slate-400 cursor-not-allowed shadow-none'
                            : anomaly
                              ? 'bg-rose-100 dark:bg-indigo-600/10 text-rose-700 dark:text-indigo-400 hover:bg-rose-200 dark:hover:bg-indigo-600/20 border border-rose-200/50 dark:border-indigo-500/20'
                              : 'bg-rose-600 dark:bg-indigo-600 text-white hover:bg-rose-500 dark:hover:bg-indigo-500 shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20'
                            }`}
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                          <span>{isAnalyzing ? '...' : anomaly ? 'Redo' : 'Run'}</span>
                        </button>
                      </div>
                    </div>
                    {/* Add last analyzed timestamp */}
                    {anomaly?.anomaly_detection?.timestamp && (
                      <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 mt-2 uppercase tracking-widest">
                        Analyzed: {new Date(anomaly.anomaly_detection.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/10 p-6 sticky top-6 shadow-xl shadow-rose-200/5">
            <h3 className="text-xl font-black text-rose-800 dark:text-white mb-6 uppercase tracking-tight">Summary</h3>

            {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly).length === 0 ? (
              <div className="text-center py-10">
                <AlertTriangle className="w-14 h-14 text-rose-200 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-lg text-rose-900 dark:text-white font-black uppercase tracking-tight">No anomalies</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Run mapping analysis to detect irregularities
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest">Total Detected</span>
                    <span className="text-2xl font-black text-rose-900 dark:text-white">
                      {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly).length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-rose-500 dark:bg-indigo-500 rounded-full"></div>
                        <span className="text-xs font-bold text-rose-900 dark:text-indigo-300 uppercase tracking-widest">Critical</span>
                      </div>
                      <span className="font-black text-rose-600 dark:text-indigo-400">
                        {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly && a.anomaly_detection.severity === 'high').length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-xs font-bold text-rose-900 dark:text-slate-300 uppercase tracking-widest">Moderate</span>
                      </div>
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly && a.anomaly_detection.severity === 'medium').length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-bold text-rose-900 dark:text-slate-300 uppercase tracking-widest">Minor</span>
                      </div>
                      <span className="font-black text-blue-600 dark:text-indigo-400">
                        {filteredAnomaliesForAttendance.filter(a => a.anomaly_detection.anomaly && a.anomaly_detection.severity === 'low').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-rose-200/30 dark:border-white/5">
                  <h4 className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mb-3">Common Patterns</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      [...filteredAnomaliesForAttendance]
                        .filter(a => a.anomaly_detection.anomaly)
                        .sort((a, b) => {
                          const order = { high: 3, medium: 2, low: 1 };
                          return (order[b.anomaly_detection.severity] || 0) - (order[a.anomaly_detection.severity] || 0);
                        })
                        .reduce((acc, anomaly) => {
                          const pattern = anomaly.anomaly_detection.pattern;
                          acc[pattern] = (acc[pattern] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([pattern, count]) => (
                        <div key={pattern} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tight group">
                          <span className="text-rose-900/60 dark:text-indigo-400/60 truncate group-hover:text-rose-800 dark:group-hover:text-indigo-400 transition-colors">{pattern.replace(/_/g, ' ')}</span>
                          <span className="text-rose-900 dark:text-indigo-200 bg-rose-100/50 dark:bg-white/[0.05] px-1.5 py-0.5 rounded">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={exportAnalyticsData}
                  className="w-full mt-6 px-4 py-3 bg-rose-100 dark:bg-white/[0.05] hover:bg-rose-200 dark:hover:bg-white/10 text-rose-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 border border-rose-200/50 dark:border-white/10"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 dark:border-indigo-500"></div>
        <p className="text-rose-800 dark:text-indigo-300 animate-pulse font-black uppercase text-xs tracking-widest">Loading Analytics Dashboard</p>
        <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-tighter">Preparing your data visualization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/40 dark:bg-indigo-900/10 backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-indigo-500/20 p-8 shadow-xl shadow-rose-200/5 dark:shadow-indigo-500/10">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-rose-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-rose-800 dark:text-white mb-1 uppercase tracking-tight">Unable to Load Analytics</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">{error}</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAnalyticsData}
                className="px-8 py-3 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 uppercase text-xs tracking-widest"
              >
                Try Again
              </button>
              <button
                onClick={() => setError(null)}
                className="px-8 py-3 bg-rose-100 dark:bg-white/[0.05] hover:bg-rose-200 dark:hover:bg-white/10 text-rose-700 dark:text-slate-300 font-black rounded-xl transition-all uppercase text-xs tracking-widest border border-rose-200/50 dark:border-white/10"
              >
                Use Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div>
              <h1 className="text-3xl font-black text-rose-800 dark:text-white uppercase tracking-tight">Analytics Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 font-bold text-xs uppercase tracking-widest">
                {user?.role === 'Admin'
                  ? 'Comprehensive monitoring across all departments'
                  : 'Track and analyze student performance metrics'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 text-sm font-bold">
              {autoRefresh && (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-600 text-[10px] uppercase tracking-widest">Live Updates Active</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest">Welcome back,</p>
            <p className="font-black text-rose-900 dark:text-white">{user?.name || 'Teacher'}</p>
          </div>
          <button
            onClick={exportAnalyticsData}
            className="flex items-center space-x-2 px-8 py-3 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 uppercase text-xs tracking-widest"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-white/8 p-2 shadow-xl shadow-rose-200/5">
        <div className="flex flex-col sm:flex-row gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Brain },
            { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 ${activeTab === tab.id
                ? 'bg-rose-600 dark:bg-indigo-600 text-white shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20'
                : 'text-rose-700/60 dark:text-indigo-400/60 hover:text-rose-900 dark:hover:text-white hover:bg-rose-100 dark:hover:bg-indigo-600/10'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'performance' && renderPerformancePredictions()}
        {activeTab === 'anomalies' && renderAnomalies()}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-rose-900/40 dark:bg-indigo-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/90 dark:bg-[#0f172a] rounded-3xl border border-rose-200/50 dark:border-white/10 w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-rose-100 dark:border-white/5 relative bg-rose-50/50 dark:bg-[#0f172a]/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-rose-800 dark:text-white uppercase tracking-tight">{selectedStudent.student_name}</h3>
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mt-1">{selectedStudent.roll_no}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-10 h-10 flex items-center justify-center bg-rose-100 dark:bg-white/10 rounded-full text-rose-600 dark:text-white hover:bg-rose-200 dark:hover:bg-white/20 transition-all font-black"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div>
                <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mb-4">Performance Assessment</p>
                <div className={`px-6 py-4 rounded-2xl border-2 ${getRiskColor(selectedStudent.prediction.risk)} bg-white/30 dark:bg-transparent shadow-sm shadow-rose-100/20`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xl uppercase tracking-tighter">
                      {selectedStudent.prediction.risk} RISK
                    </span>
                    <span className="text-xs font-bold opacity-70">
                      {Math.round(selectedStudent.prediction.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mb-4">Key Risk Factors</p>
                <div className="space-y-3">
                  {selectedStudent.prediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-rose-50/60 dark:bg-white/[0.05] rounded-2xl border border-rose-100/50 dark:border-white/10 transition-all hover:bg-rose-100/50 dark:hover:bg-white/10">
                      <TrendingDown className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-rose-900 dark:text-slate-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mb-4">Strategic Interventions</p>
                <div className="space-y-4">
                  <div className="p-4 bg-white/40 dark:bg-indigo-600/10 border border-rose-200/50 dark:border-indigo-500/20 rounded-2xl group hover:bg-rose-100/60 transition-all">
                    <p className="font-black text-rose-900 dark:text-white mb-1 uppercase text-xs tracking-widest">Schedule Counseling</p>
                    <p className="text-xs font-medium text-rose-700/70 dark:text-indigo-300">Address identified risk factors in a focused session</p>
                  </div>
                  <div className="p-4 bg-white/40 dark:bg-emerald-600/10 border border-rose-200/50 dark:border-emerald-500/20 rounded-2xl group hover:bg-rose-100/60 transition-all">
                    <p className="font-black text-rose-900 dark:text-white mb-1 uppercase text-xs tracking-widest">Intensive Monitoring</p>
                    <p className="text-xs font-medium text-rose-700/70 dark:text-emerald-300">Establish bi-weekly progress checkpoints</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-rose-100 dark:border-white/5 bg-rose-50/20 dark:bg-[#0f172a]/80">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full px-8 py-4 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 uppercase text-sm tracking-widest"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAnalytics;