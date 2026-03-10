import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Users, BookOpen, DollarSign, Calendar, TrendingUp,
  Activity, Award, Bell, Sparkles,
  ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Zap, Target, Clock, CheckCircle2,
  AlertCircle, X, ChevronRight, Search, Plus, Mail,
  Phone, FileText, Settings, UserCircle, CreditCard,
  GraduationCap, Wallet, BookMarked, Timer, Star,
  Medal, Trophy, Crown, Command, Filter,
  ChevronDown, Eye, LayoutDashboard, TrendingDown,
  Layers, Globe, Cpu, Flame, Hash, Percent,
  AlertTriangle, Info, BarChart2, Sidebar, PanelLeft,
  MousePointer2, Keyboard, Maximize2, Share2, Printer, Loader2,
  ClipboardList, Library
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  RadialBarChart, RadialBar, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from 'framer-motion';
import { format, subDays, isToday, isYesterday, parseISO, addDays } from 'date-fns';
import { userService, studentService, feeService, noticeService, assignmentService, timetableService } from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Student {
  id: string; name: string; email: string; department: string;
  cgpa: number; avatar?: string; enrollmentDate: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  attendance: number; rank?: number; achievements?: string[];
  feesStatus?: string;
}
interface FeeRecord {
  id: string; studentId: string; studentName: string;
  amount: number; status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  dueDate: string; paidDate?: string;
  type: 'Tuition' | 'Hostel' | 'Transport' | 'Library';
}
interface Teacher {
  id: string; name: string; department: string;
  attendance: number; subject: string; avatar?: string;
}
interface Notice {
  id: string; title: string; content: string; date: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Academic' | 'Administrative' | 'Event' | 'Urgent';
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useAnimatedCounter = (target: number, duration = 1.5, decimals = 0) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    const startValue = 0;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((startValue + (target - startValue) * eased).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return count;
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const generateMockData = () => {
  const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Data Science'];

  const topPerformers: Student[] = [
    { id: 'STU2024001', name: 'Sarah Chen', email: 'sarah.chen@university.edu', department: 'Computer Science', cgpa: 3.98, enrollmentDate: subDays(new Date(), 45).toISOString(), status: 'Active', attendance: 98, rank: 1, achievements: ["Dean's List", 'Research Published', 'Hackathon Winner'] },
    { id: 'STU2024015', name: 'Marcus Johnson', email: 'marcus.j@university.edu', department: 'Electrical', cgpa: 3.95, enrollmentDate: subDays(new Date(), 60).toISOString(), status: 'Active', attendance: 96, rank: 2, achievements: ['Perfect Attendance', 'Lab Assistant'] },
    { id: 'STU2024032', name: 'Emma Williams', email: 'emma.w@university.edu', department: 'Data Science', cgpa: 3.92, enrollmentDate: subDays(new Date(), 30).toISOString(), status: 'Active', attendance: 94, rank: 3, achievements: ['DS Competition', 'Teaching Assistant'] },
    { id: 'STU2024008', name: 'Raj Patel', email: 'raj.patel@university.edu', department: 'Mechanical', cgpa: 3.89, enrollmentDate: subDays(new Date(), 90).toISOString(), status: 'Active', attendance: 92, rank: 4, achievements: ['Robotics Club President', 'Innovation Award'] },
    { id: 'STU2024021', name: 'Lisa Anderson', email: 'lisa.a@university.edu', department: 'Computer Science', cgpa: 3.87, enrollmentDate: subDays(new Date(), 75).toISOString(), status: 'Active', attendance: 95, rank: 5, achievements: ['Coding Club Lead', 'Merit Scholarship'] },
    { id: 'STU2024044', name: 'Aiden Park', email: 'aiden.park@university.edu', department: 'Civil', cgpa: 3.84, enrollmentDate: subDays(new Date(), 55).toISOString(), status: 'Active', attendance: 91, rank: 6, achievements: ['Bridge Design Award', 'Top Lab Score'] },
  ];

  const students: Student[] = [...topPerformers, ...Array.from({ length: 19 }, (_, i) => ({
    id: `STU2024${String(100 + i).padStart(3, '0')}`,
    name: ['Alex Park', 'Jordan Lee', 'Taylor Kim', 'Morgan Chen', 'Riley Singh'][i % 5] + ` ${i + 1}`,
    email: `student${i + 1}@university.edu`,
    department: departments[i % 5],
    cgpa: parseFloat((2.5 + Math.random() * 1.2).toFixed(2)),
    enrollmentDate: subDays(new Date(), Math.floor(Math.random() * 60)).toISOString(),
    status: (Math.random() > 0.9 ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
    attendance: 72 + Math.floor(Math.random() * 25),
  }))];

  const teachers: Teacher[] = Array.from({ length: 12 }, (_, i) => ({
    id: `TCH${100 + i}`,
    name: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]} ${i}`,
    department: departments[i % 5],
    attendance: Math.random() > 0.2 ? 100 : 0,
    subject: ['Mathematics', 'Physics', 'Chemistry', 'Programming', 'Design'][i % 5],
  }));

  const feeRecords: FeeRecord[] = students.map((s, i) => ({
    id: `FEE${1000 + i}`,
    studentId: s.id,
    studentName: s.name,
    amount: 15000 + Math.floor(Math.random() * 5000),
    status: ['Paid', 'Pending', 'Overdue', 'Partial'][i % 4] as any,
    dueDate: subDays(new Date(), Math.floor(Math.random() * 10)).toISOString(),
    paidDate: i % 4 === 0 ? subDays(new Date(), Math.floor(Math.random() * 5)).toISOString() : undefined,
    type: ['Tuition', 'Hostel', 'Transport'][i % 3] as any,
  }));

  const notices: Notice[] = [
    { id: '1', title: 'Mid-term Examination Schedule Released', content: 'Examinations commence next Monday. Check individual department boards for room allocations.', date: new Date().toISOString(), priority: 'High', category: 'Academic' },
    { id: '2', title: 'Campus Maintenance — Water Interruption', content: 'Water supply will be interrupted on Thursday 6am–2pm.', date: subDays(new Date(), 1).toISOString(), priority: 'Medium', category: 'Administrative' },
    { id: '3', title: 'Annual Sports Day Registration Open', content: 'Register before Friday for all events.', date: subDays(new Date(), 2).toISOString(), priority: 'Low', category: 'Event' },
  ];

  return {
    students,
    teachers,
    feeRecords,
    notices,
    topPerformers,
    assignments: [],
    submissions: [],
    timetable: []
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string; positive?: boolean }> = ({ data, color, positive = true }) => {
  const { isDark } = useTheme();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 32; const pts = data.length;
  const points = data.map((v, i) => `${(i / (pts - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isDark ? "drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" : "drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]"}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD (redesigned)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_THEMES: Record<string, { iconBg: string; glow: string; border: string; cardBg: string; cardBgLight: string; iconColor: string; iconColorLight: string; borderLight: string }> = {
  indigo: { iconBg: 'bg-indigo-500/20', glow: 'bg-indigo-500', border: 'border-indigo-500/20', borderLight: 'border-indigo-100', cardBg: 'rgba(99,102,241,0.06)', cardBgLight: 'rgba(99,102,241,0.03)', iconColor: 'text-indigo-400', iconColorLight: 'text-indigo-600' },
  emerald: { iconBg: 'bg-emerald-500/20', glow: 'bg-emerald-500', border: 'border-emerald-500/20', borderLight: 'border-emerald-100', cardBg: 'rgba(16,185,129,0.06)', cardBgLight: 'rgba(16,185,129,0.03)', iconColor: 'text-emerald-400', iconColorLight: 'text-emerald-600' },
  amber: { iconBg: 'bg-amber-500/20', glow: 'bg-amber-500', border: 'border-amber-500/20', borderLight: 'border-amber-100', cardBg: 'rgba(245,158,11,0.06)', cardBgLight: 'rgba(245,158,11,0.03)', iconColor: 'text-amber-400', iconColorLight: 'text-amber-600' },
  rose: { iconBg: 'bg-rose-500/20', glow: 'bg-rose-500', border: 'border-rose-500/20', borderLight: 'border-rose-100', cardBg: 'rgba(244,63,94,0.06)', cardBgLight: 'rgba(244,63,94,0.03)', iconColor: 'text-rose-400', iconColorLight: 'text-rose-600' },
};

const StatCard: React.FC<{
  title: string; rawValue: number; displayValue: string;
  subtitle?: string; trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode; gradient: string; theme: keyof typeof CARD_THEMES;
  sparkData?: number[]; sparkColor?: string; onClick?: () => void;
}> = ({ title, displayValue, subtitle, trend, icon, gradient, theme, sparkData, sparkColor, onClick }) => {
  const { isDark } = useTheme();
  const t = CARD_THEMES[theme] || CARD_THEMES.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border ${isDark ? t.border : t.borderLight} p-5 cursor-pointer group`}
      style={{ 
        background: isDark 
          ? `linear-gradient(135deg, ${t.cardBg}, rgba(15,18,30,0.85))` 
          : `linear-gradient(135deg, ${t.cardBgLight}, rgba(255,255,255,1))`, 
        backdropFilter: 'blur(20px)',
        boxShadow: isDark ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.05)'
      }}
    >
      {/* Glow blob */}
      <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl ${isDark ? 'opacity-25 group-hover:opacity-40' : 'opacity-10 group-hover:opacity-20'} transition-opacity duration-500 ${t.glow}`} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className={`inline-flex p-2.5 rounded-xl mb-3 ${isDark ? t.iconBg : 'bg-slate-100'}`}>
            <div className={isDark ? t.iconColor : t.iconColorLight}>
              {icon}
            </div>
          </div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>{title}</p>
          <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{displayValue}</h3>
          {subtitle && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1`}>{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          {trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend.isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}>
              {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </div>
          )}
          {sparkData && sparkColor && <Sparkline data={sparkData} color={sparkColor} />}
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────
const GlassCard: React.FC<{
  title: string; subtitle?: string; children: React.ReactNode;
  action?: React.ReactNode; className?: string; badge?: string;
}> = ({ title, subtitle, children, action, className = '', badge }) => {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${isDark ? 'border-white/8' : 'border-slate-200'} p-6 ${className}`}
      style={{ 
        background: isDark ? 'rgba(22,27,44,0.75)' : 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(24px)',
        boxShadow: isDark ? 'none' : '0 4px 20px -5px rgba(0,0,0,0.05)'
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} border`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RANK PODIUM CARD
// ─────────────────────────────────────────────────────────────────────────────
const TopPerformerCard: React.FC<{ student: Student; index: number; key?: string }> = ({ student, index }) => {
  const { isDark } = useTheme();
  const rankConfig = {
    1: { icon: <Crown className="w-4 h-4" />, bg: isDark ? 'from-amber-500/20 to-yellow-500/10' : 'from-amber-50 to-yellow-50', border: isDark ? 'border-amber-500/30' : 'border-amber-200', ring: 'ring-amber-500/40', bar: 'from-amber-400 to-yellow-400', label: isDark ? 'text-amber-400' : 'text-amber-600' },
    2: { icon: <Medal className="w-4 h-4" />, bg: isDark ? 'from-slate-400/20 to-slate-500/10' : 'from-slate-50 to-slate-100', border: isDark ? 'border-slate-400/30' : 'border-slate-200', ring: 'ring-slate-400/30', bar: 'from-slate-300 to-slate-400', label: isDark ? 'text-slate-300' : 'text-slate-600' },
    3: { icon: <Medal className="w-4 h-4" />, bg: isDark ? 'from-orange-600/20 to-amber-800/10' : 'from-orange-50 to-amber-50', border: isDark ? 'border-orange-600/30' : 'border-orange-200', ring: 'ring-orange-600/30', bar: 'from-orange-500 to-amber-600', label: isDark ? 'text-orange-400' : 'text-orange-700' },
  };
  const cfg = rankConfig[student.rank as 1 | 2 | 3] || { icon: null, bg: isDark ? 'from-indigo-500/10 to-purple-500/5' : 'from-indigo-50 to-purple-50', border: isDark ? 'border-white/10' : 'border-slate-200', ring: 'ring-indigo-500/20', bar: 'from-indigo-500 to-purple-500', label: isDark ? 'text-indigo-400' : 'text-indigo-600' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      className={`relative p-5 rounded-2xl bg-gradient-to-br ${cfg.bg} border ${cfg.border} overflow-hidden group shadow-sm`}
    >
      {/* Rank badge */}
      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border ${cfg.border} ${cfg.label}`}
        style={{ background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)' }}>
        {student.rank && student.rank <= 3 ? cfg.icon : <span className="text-xs font-bold">#{student.rank}</span>}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg ring-2 ${cfg.ring} shadow-xl flex-shrink-0`}>
          {student.name?.split(' ').map(n => n[0]).join('') || '??'}
        </div>
        <div className="min-w-0">
          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors`}>{student.name}</h4>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{student.department}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`flex items-center gap-1 text-sm font-black ${cfg.label}`}>
              <Star className="w-3.5 h-3.5 fill-current" />{student.cgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-semibold`}>{student.attendance}% att.</span>
          </div>
        </div>
      </div>

      {/* CGPA Bar */}
      <div className="mt-2">
        <div className={`flex justify-between text-[10px] mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          <span>Academic Score</span>
          <span className={`font-bold ${cfg.label}`}>{Math.round((student.cgpa / 4) * 100)}%</span>
        </div>
        <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-200'} overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(student.cgpa / 4) * 100}%` }}
            transition={{ duration: 1.2, delay: index * 0.15, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
          />
        </div>
      </div>

      {/* Achievements */}
      {student.achievements && (
        <div className="mt-3 flex flex-wrap gap-1">
          {student.achievements.slice(0, 2).map((a, i) => (
            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-600 bg-slate-50'}`}>
              {a}
            </span>
          ))}
          {student.achievements.length > 2 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full text-slate-400">+{student.achievements.length - 2}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SEARCH MODAL (Cmd+K)
// ─────────────────────────────────────────────────────────────────────────────
const SearchModal: React.FC<{ open: boolean; onClose: () => void; students: Student[] }> = ({ open, onClose, students }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query, students]);

  const { isDark } = useTheme();
  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); } }, [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? onClose() : null; } if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50" style={{ background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 rounded-2xl border ${isDark ? 'border-white/12' : 'border-slate-200'} overflow-hidden`}
            style={{ 
              background: isDark ? 'rgba(10,12,22,0.95)' : 'rgba(255,255,255,1)', 
              backdropFilter: 'blur(40px)', 
              boxShadow: isDark 
                ? '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' 
                : '0 20px 50px -12px rgba(0,0,0,0.1)' 
            }}
          >
            <div className={`flex items-center gap-3 p-4 border-b ${isDark ? 'border-white/8' : 'border-slate-100'}`}>
              <Search className="w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search students, departments, fees..."
                className={`flex-1 bg-transparent ${isDark ? 'text-white' : 'text-slate-900'} text-sm outline-none placeholder-slate-600`}
              />
              <kbd className={`text-[10px] ${isDark ? 'text-slate-600 border-white/10' : 'text-slate-400 border-slate-200'} border rounded px-1.5 py-0.5`}>ESC</kbd>
            </div>

            {query === '' ? (
              <div className="p-4">
                <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'} uppercase tracking-wider mb-3 font-semibold`}>Quick actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <UserCircle className="w-4 h-4" />, label: 'Add New Student' },
                    { icon: <DollarSign className="w-4 h-4" />, label: 'Record Fee Payment' },
                    { icon: <Calendar className="w-4 h-4" />, label: 'Schedule Event' },
                    { icon: <Mail className="w-4 h-4" />, label: 'Send Notice' },
                  ].map((a, i) => (
                    <button key={i} className={`flex items-center gap-2.5 p-3 rounded-xl ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/8 border-transparent hover:border-white/8' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-200'} transition-all text-sm text-left border`}>
                      <span className="text-indigo-600 dark:text-indigo-400">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 max-h-80 overflow-y-auto">
                {filtered.length > 0 ? (
                  <>
                    <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'} uppercase tracking-wider px-3 py-2 font-semibold`}>Students</p>
                    {filtered.map((s, i) => (
                      <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? 'hover:bg-white/8 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-all cursor-pointer group`}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name?.split(' ').map(n => n[0]).join('') || '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>{s.name}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{s.department} · CGPA {s.cgpa}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : (isDark ? 'text-slate-500 bg-white/5' : 'text-slate-400 bg-slate-100')}`}>
                          {s.status}
                        </span>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className={`py-8 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'} text-sm`}>No results found</div>
                )}
              </div>
            )}

            <div className={`flex items-center gap-4 px-4 py-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <span className={`flex items-center gap-1.5 text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}><kbd className={`${isDark ? 'border-white/10' : 'border-slate-200'} border rounded px-1 py-0.5`}>↑↓</kbd> Navigate</span>
              <span className={`flex items-center gap-1.5 text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}><kbd className={`${isDark ? 'border-white/10' : 'border-slate-200'} border rounded px-1 py-0.5`}>↵</kbd> Select</span>
              <span className={`flex items-center gap-1.5 text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}><kbd className={`${isDark ? 'border-white/10' : 'border-slate-200'} border rounded px-1 py-0.5`}>⌘K</kbd> Toggle</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME CLOCK
// ─────────────────────────────────────────────────────────────────────────────
const LiveClock: React.FC = () => {
  const { isDark } = useTheme();
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="text-right hidden md:block">
      <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} tabular-nums tracking-tight`}>{format(time, 'HH:mm:ss')}</p>
      <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>{format(time, 'EEEE, MMMM d yyyy')}</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  const { isDark } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl border ${isDark ? 'border-white/10' : 'border-slate-200'} p-3 text-sm`} 
      style={{ 
        background: isDark ? 'rgba(8,10,18,0.95)' : 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)', 
        boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)' 
      }}>
      <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs mb-2 font-semibold`}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs capitalize`}>{p.name}:</span>
          <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-xs`}>{typeof p.value === 'number' && p.value > 999 ? `$${(p.value / 1000).toFixed(1)}k` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState<{
    students: Student[]; teachers: Teacher[]; feeRecords: FeeRecord[];
    notices: Notice[]; topPerformers: Student[];
    currentStudent?: Student;
    assignments?: any[];
    submissions?: any[];
    timetable?: any[];
  } | null>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [users, students, fees, notices, assignments, timetable] = await Promise.all([
          userService.getAllUsers(),
          studentService.getAllStudents(),
          feeService.getAllFeeRecords(),
          noticeService.getAllNotices(),
          assignmentService.getAllAssignments(),
          timetableService.getTimetable()
        ]);

        let currentStudent = undefined;
        let mySubmissions = [];
        if (user?.role === 'Student' && user?.id) {
          try {
            currentStudent = await studentService.getStudentByUserId(user.id);
            if (currentStudent?.id) {
              mySubmissions = await assignmentService.getSubmissionsByStudent(currentStudent.id);
            }
          } catch (e) {
            console.warn('Failed to fetch specific student data:', e);
          }
        }

        const teachers = users.filter((u: any) => u.role === 'Teacher');
        const sortedStudents = [...students].sort((a: any, b: any) => (b.cgpa || 0) - (a.cgpa || 0));
        const topPerformers = sortedStudents
          .slice(0, 6)
          .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

        if (currentStudent) {
          const rank = sortedStudents.findIndex(s => s.id === currentStudent.id) + 1;
          currentStudent = { ...currentStudent, rank };
        }

        setData({
          students,
          teachers,
          feeRecords: fees,
          notices,
          topPerformers,
          currentStudent,
          assignments,
          submissions: mySubmissions,
          timetable
        });
      } catch (error) {
        console.error('Dashboard load data error:', error);
        // Fallback to mock data
        const mock = generateMockData();
        setData(mock);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  // Stats
  const stats = useMemo(() => {
    if (!data) return null;
    const paidFees = data.feeRecords.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
    const pendingFees = data.feeRecords.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((s, f) => s + f.amount, 0);
    const avgAttendance = Math.round(data.students.reduce((s, st) => s + st.attendance, 0) / data.students.length);
    const presentTeachers = data.teachers.filter(t => t.attendance === 100).length;
    return {
      totalStudents: data.students.length,
      totalTeachers: data.teachers.length,
      totalRevenue: paidFees,
      pendingFees,
      avgAttendance,
      presentTeachers,
      collectionRate: Math.round((paidFees / (paidFees + pendingFees)) * 100),
      activeStudents: data.students.filter(s => s.status === 'Active').length,
    };
  }, [data]);

  // Chart Data
  const attendanceTrendData = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), 'EEE'),
    present: 82 + Math.floor(Math.random() * 16),
    absent: 3 + Math.floor(Math.random() * 8),
    late: 1 + Math.floor(Math.random() * 5),
  })), [chartRange]);

  const revenueData = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    month: format(subDays(new Date(), (5 - i) * 30), 'MMM'),
    tuition: 48000 + Math.floor(Math.random() * 22000),
    hostel: 18000 + Math.floor(Math.random() * 12000),
    other: 4000 + Math.floor(Math.random() * 6000),
  })), []);

  const departmentData = useMemo(() => {
    if (!data) return [];
    const DEPT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const deptCount = data.students.reduce((acc, s) => { acc[s.department] = (acc[s.department] || 0) + 1; return acc; }, {} as Record<string, number>);
    return Object.entries(deptCount).map(([name, value], i) => ({
      name: name?.split(' ')[0] || name, value,
      fill: DEPT_COLORS[i % DEPT_COLORS.length],
    }));
  }, [data]);

  const feeStatusData = useMemo(() => {
    if (!data) return [];
    const sc = data.feeRecords.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    return [
      { name: 'Paid', value: sc.Paid || 0, color: '#10b981' },
      { name: 'Pending', value: sc.Pending || 0, color: '#f59e0b' },
      { name: 'Overdue', value: sc.Overdue || 0, color: '#ef4444' },
      { name: 'Partial', value: sc.Partial || 0, color: '#6366f1' },
    ];
  }, [data]);

  const performanceRadarData = [
    { subject: 'CGPA', A: 92 }, { subject: 'Attendance', A: 88 },
    { subject: 'Assignments', A: 79 }, { subject: 'Research', A: 65 },
    { subject: 'Participation', A: 84 }, { subject: 'Projects', A: 91 },
  ];

  const weeklyHeatmapData = Array.from({ length: 5 }, (_, week) =>
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, d) => ({
      week: `W${week + 1}`, day,
      value: 65 + Math.floor(Math.random() * 35),
    }))
  ).flat();

  // Spark data for stat cards
  const stuSpark = [32, 34, 35, 33, 36, 38, data?.students.length || 38];
  const revSpark = [48, 52, 49, 55, 58, 62, 65];
  const attSpark = [86, 88, 85, 87, 90, 88, 89];
  const tcSpark = [9, 10, 10, 11, 11, 10, stats?.presentTeachers || 10];

  if (loading || !data || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-slate-500 animate-pulse font-medium">Loading Dashboard</p>
        <p className="text-sm text-slate-400">Fetching institution data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Search Modal */}
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} students={data.students} />

      <div className="relative z-10 max-w-[1700px] mx-auto space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                <span className={`bg-gradient-to-r ${isDark ? 'from-indigo-400 to-violet-400' : 'from-rose-600 to-rose-400'} bg-clip-text text-transparent`}>
                  {isDark ? (user?.name?.split(' ')[0] || user?.role) : 'System'}
                </span>
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-500'} mt-0.5`}>{user?.role} Dashboard · {format(new Date(), 'MMMM yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LiveClock />

            {/* Search trigger */}
            <button
              onClick={() => setShowSearch(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'border-white/8 text-slate-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'} transition-all text-sm`}
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:block text-xs">Search...</span>
              <kbd className={`hidden sm:flex items-center gap-0.5 text-[10px] ${isDark ? 'text-slate-700 border-white/8' : 'text-slate-400 border-slate-200'} border rounded px-1 py-0.5`}>⌘K</kbd>
            </button>

            {/* Refresh */}
            <button onClick={handleRefresh}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isDark ? 'border-white/8 text-slate-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'} transition-all`}
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Export</span>
            </button>
          </div>
        </div>

        {/* ── ROLE-BASED CONTENT ───────────────────────────────────────────── */}
        {user?.role === 'Admin' && (
          <>
            {/* ── ADMIN STAT CARDS ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Students" rawValue={stats.totalStudents}
                displayValue={stats.totalStudents.toLocaleString()}
                subtitle={`${stats.activeStudents} active · ${stats.totalStudents - stats.activeStudents} inactive`}
                trend={{ value: 12, isPositive: true }}
                icon={<Users className="w-5 h-5" />}
                gradient="from-indigo-500 to-violet-600"
                theme="indigo"
                sparkData={stuSpark} sparkColor="#6366f1ff"
              />
              <StatCard
                title="Fee Collection" rawValue={stats.totalRevenue}
                displayValue={`$${(stats.totalRevenue / 1000).toFixed(1)}k`}
                subtitle={`${stats.collectionRate}% collection rate · $${(stats.pendingFees / 1000).toFixed(1)}k pending`}
                trend={{ value: 8, isPositive: true }}
                icon={<DollarSign className="w-5 h-5" />}
                gradient="from-emerald-500 to-teal-600"
                theme="emerald"
                sparkData={revSpark} sparkColor="#10b981"
              />
              <StatCard
                title="Avg Attendance" rawValue={stats.avgAttendance}
                displayValue={`${stats.avgAttendance}%`}
                subtitle="Weekly average across all departments"
                trend={{ value: 3, isPositive: false }}
                icon={<Activity className="w-5 h-5" />}
                gradient="from-amber-500 to-orange-600"
                theme="amber"
                sparkData={attSpark} sparkColor="#f59e0b"
              />
              <StatCard
                title="Faculty Present" rawValue={stats.presentTeachers}
                displayValue={`${stats.presentTeachers}/${stats.totalTeachers}`}
                subtitle={`${Math.round((stats.presentTeachers / stats.totalTeachers) * 100)}% present today`}
                trend={{ value: 5, isPositive: true }}
                icon={<BookOpen className="w-5 h-5" />}
                gradient="from-rose-500 to-pink-600"
                theme="rose"
                sparkData={tcSpark} sparkColor="#f43f5e"
              />
            </div>

            {/* ── MINI KPI STRIP ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Dean\'s List', value: '12', icon: <Star className="w-3.5 h-3.5 text-amber-500" />, sub: 'students' },
                { label: 'Overdue Fees', value: '3', icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />, sub: 'accounts' },
                { label: 'Events This Month', value: '7', icon: <Calendar className="w-3.5 h-3.5 text-indigo-500" />, sub: 'scheduled' },
                { label: 'Avg CGPA', value: (data.students.reduce((s, st) => s + st.cgpa, 0) / data.students.length).toFixed(2), icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />, sub: 'institution-wide' },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'border-white/6 hover:border-white/12' : 'border-slate-100 hover:border-slate-200'} transition-all cursor-pointer`}
                  style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,1)' }}>
                  {kpi.icon}
                  <div>
                    <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-none`}>{kpi.value}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-500'} mt-0.5`}>{kpi.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── CHARTS ROW 1 ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <GlassCard
                title="Attendance Trends" subtitle="Daily overview"
                className="lg:col-span-2"
                badge="Live"
                action={
                  <div className="flex items-center gap-1">
                    {(['7d', '30d', '90d'] as const).map(r => (
                      <button key={r} onClick={() => setChartRange(r)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${chartRange === r ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="flex items-center gap-4 mb-4">
                  {[{ dot: '#6366f1', label: 'Present' }, { dot: '#ef4444', label: 'Absent' }, { dot: '#f59e0b', label: 'Late' }].map(l => (
                    <span key={l.label} className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.dot }} />{l.label}
                    </span>
                  ))}
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height={288}>
                    <ComposedChart data={attendanceTrendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} vertical={false} />
                      <XAxis dataKey="day" stroke={isDark ? "#334155" : "#cbd5e1"} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#475569' : '#94a3b8' }} />
                      <YAxis stroke={isDark ? "#334155" : "#cbd5e1"} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#475569' : '#94a3b8' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={2.5} fill="url(#presentGrad)" />
                      <Bar dataKey="absent" fill="#ef4444" opacity={0.7} radius={[3, 3, 0, 0]} barSize={14} />
                      <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard title="Performance Radar" subtitle="Institution metrics">
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={288}>
                    <RadarChart data={performanceRadarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <PolarGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#475569' : '#64748b', fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* ── CHARTS ROW 2 ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <GlassCard title="Revenue Analysis" subtitle="Monthly fee collection breakdown" className="lg:col-span-2">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height={288}>
                    <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="tuitionGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="hostelGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="otherGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} vertical={false} />
                      <XAxis dataKey="month" stroke={isDark ? "#334155" : "#cbd5e1"} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#475569' : '#94a3b8' }} />
                      <YAxis stroke={isDark ? "#334155" : "#cbd5e1"} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#475569' : '#94a3b8' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="tuition" stackId="1" stroke="#6366f1" fill="url(#tuitionGrad)" strokeWidth={2} name="Tuition" />
                      <Area type="monotone" dataKey="hostel" stackId="1" stroke="#10b981" fill="url(#hostelGrad)" strokeWidth={2} name="Hostel" />
                      <Area type="monotone" dataKey="other" stackId="1" stroke="#f59e0b" fill="url(#otherGrad)" strokeWidth={2} name="Other" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard title="Fee Status" subtitle="Payment distribution">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height={208}>
                    <PieChart>
                      <Pie data={feeStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {feeStatusData.map((e, i) => <Cell key={i} fill={e.color} opacity={0.9} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {feeStatusData.map(item => (
                    <div key={item.name} className={`flex items-center gap-2 p-2 rounded-lg`} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="min-w-0">
                        <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.name}</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* ── DEPT DISTRIBUTION + ATTENDANCE HEATMAP ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <GlassCard title="Department Distribution" subtitle="Enrollment by department">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height={256}>
                    <BarChart data={departmentData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                      <XAxis type="number" stroke={isDark ? "#334155" : "#cbd5e1"} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#475569' : '#94a3b8' }} />
                      <YAxis type="category" dataKey="name" stroke={isDark ? "#334155" : "#cbd5e1"} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#64748b' : '#64748b' }} width={60} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                        {departmentData.map((entry, index) => <Cell key={index} fill={entry.fill} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard title="Weekly Attendance Heatmap" subtitle="Last 5 weeks" className="lg:col-span-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                    <p key={d} className={`text-center text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-500'} font-medium mb-1`}>{d}</p>
                  ))}
                  {weeklyHeatmapData.map((cell, i) => {
                    const intensity = (cell.value - 65) / 35;
                    const alpha = 0.1 + intensity * 0.85;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.012 }}
                        className="aspect-square rounded-lg flex items-center justify-center cursor-pointer group relative"
                        style={{ background: isDark ? `rgba(99,102,241,${alpha})` : `rgba(79,70,229,${alpha})` }}
                      >
                        <span className={`text-[10px] font-bold ${isDark ? 'text-white/60 group-hover:text-white' : 'text-indigo-900/40 group-hover:text-indigo-900'} transition-colors`}>{cell.value}%</span>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Low</span>
                  {[0.1, 0.3, 0.55, 0.75, 0.95].map((a, i) => (
                    <div key={i} className="w-4 h-4 rounded" style={{ background: isDark ? `rgba(99,102,241,${a})` : `rgba(79,70,229,${a})` }} />
                  ))}
                  <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>High</span>
                </div>
              </GlassCard>
            </div>

            {/* ── ACADEMIC LEADERS + SIDEBAR ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className="xl:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-amber-500/15' : 'bg-amber-100'} flex items-center justify-center`}>
                      <Trophy className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Academic Leaders</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Top performing students this semester</p>
                    </div>
                  </div>
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? 'border-white/8 text-slate-400 hover:text-white hover:border-white/15' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'} text-xs font-medium transition-all`}>
                    <Award className="w-3.5 h-3.5" /> Full Rankings
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.topPerformers.map((student, i) => (
                    <TopPerformerCard key={student.id} student={student} index={i} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <GlassCard title="Quick Actions">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <UserCircle className="w-4 h-4" />, label: 'Add Student', bg: isDark ? 'bg-indigo-500/20' : 'bg-indigo-50', text: isDark ? 'text-indigo-400' : 'text-indigo-600' },
                      { icon: <Wallet className="w-4 h-4" />, label: 'Record Fee', bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-50', text: isDark ? 'text-emerald-400' : 'text-emerald-600' },
                      { icon: <Calendar className="w-4 h-4" />, label: 'Schedule', bg: isDark ? 'bg-amber-500/20' : 'bg-amber-50', text: isDark ? 'text-amber-400' : 'text-amber-600' },
                      { icon: <Mail className="w-4 h-4" />, label: 'Send Notice', bg: isDark ? 'bg-rose-500/20' : 'bg-rose-50', text: isDark ? 'text-rose-400' : 'text-rose-600' },
                      { icon: <FileText className="w-4 h-4" />, label: 'Reports', bg: isDark ? 'bg-blue-500/20' : 'bg-blue-50', text: isDark ? 'text-blue-400' : 'text-blue-600' },
                      { icon: <Settings className="w-4 h-4" />, label: 'Settings', bg: isDark ? 'bg-slate-500/20' : 'bg-slate-50', text: isDark ? 'text-slate-400' : 'text-slate-600' },
                    ].map((action, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border ${isDark ? 'border-white/6 hover:border-white/15' : 'border-slate-100 hover:border-slate-200'} transition-all`}
                        style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,1)' }}
                      >
                        <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                          <span className={action.text}>{action.icon}</span>
                        </div>
                        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} text-center`}>{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </>
        )}

        {/* ── TEACHER DASHBOARD ───────────────────────────────────────────── */}
        {user?.role === 'Teacher' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Your Students" rawValue={42}
                displayValue="42"
                subtitle="Across 3 sections"
                icon={<Users className="w-5 h-5" />}
                gradient="from-indigo-500 to-violet-600"
                theme="indigo"
              />
              <StatCard
                title="Class Attendance" rawValue={94}
                displayValue="94%"
                subtitle="Average this week"
                icon={<Activity className="w-5 h-5" />}
                gradient="from-emerald-500 to-teal-600"
                theme="emerald"
              />
              <StatCard
                title="Pending Gradings" rawValue={15}
                displayValue="15"
                subtitle="Assignments to review"
                icon={<FileText className="w-5 h-5" />}
                gradient="from-amber-500 to-orange-600"
                theme="amber"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <GlassCard title="Today's Schedule" subtitle="Your upcoming sessions">
                <div className="space-y-3">
                  {[
                    { time: '09:00 AM', subject: 'Advanced Mathematics', room: 'Room 302', type: 'Lecture' },
                    { time: '11:30 AM', subject: 'Physics Lab', room: 'Lab B', type: 'Practical' },
                    { time: '02:00 PM', subject: 'Computer Science', room: 'Auditorium', type: 'Lecture' },
                  ].map((session, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5 border-white/8' : 'bg-slate-50 border-slate-100'} border hover:border-indigo-500/30 transition-all cursor-pointer group`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} flex flex-col items-center justify-center border`}>
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold mt-1">LOG</span>
                        </div>
                        <div>
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>{session.subject}</h4>
                          <p className="text-xs text-slate-500">{session.time} · {session.room}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} text-[10px] font-bold border`}>
                        {session.type}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard title="Recent Submissions" subtitle="Pending your review">
                <div className="space-y-1">
                  {data.students.slice(0, 5).map((student, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-all cursor-pointer`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed= ${student.name}`} alt="" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{student.name}</p>
                          <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unit 3 Assignment · 2h ago</p>
                        </div>
                      </div>
                      <button className={`px-3 py-1 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} text-xs font-bold border hover:bg-emerald-500 hover:text-white transition-all`}>
                        Grade
                      </button>
                    </div>
                  ))}
                </div>
                <button className={`w-full mt-4 py-2 text-xs font-bold ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'} transition-colors`}>
                  View All Submissions
                </button>
              </GlassCard>
            </div>
          </div>
        )}

        {/* ── STUDENT DASHBOARD ───────────────────────────────────────────── */}
        {user?.role === 'Student' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Your Attendance" rawValue={data.currentStudent?.attendance || 0}
                displayValue={`${data.currentStudent?.attendance || 0}%`}
                subtitle="Overall presence"
                icon={<Activity className="w-5 h-5" />}
                gradient="from-indigo-500 to-violet-600"
                theme="indigo"
                sparkData={[85, 88, 87, 89, 92, data.currentStudent?.attendance || 92]}
                sparkColor="#6366f1"
              />
              <StatCard
                title="Current CGPA" rawValue={data.currentStudent?.cgpa || 0}
                displayValue={(data.currentStudent?.cgpa || 0).toFixed(2)}
                subtitle={`Rank: #${data.currentStudent?.rank || 'N/A'}`}
                icon={<GraduationCap className="w-5 h-5" />}
                gradient="from-emerald-500 to-teal-600"
                theme="emerald"
                sparkData={[3.5, 3.6, 3.7, 3.8, 3.85, data.currentStudent?.cgpa || 3.85]}
                sparkColor="#10b981"
              />
              <StatCard
                title="Fees Status" rawValue={0}
                displayValue={data.currentStudent?.feesStatus || 'Cleared'}
                subtitle={data.currentStudent?.feesStatus === 'Overdue' ? 'Action required' : 'Next due: Jan 2025'}
                icon={<CreditCard className="w-5 h-5" />}
                gradient="from-amber-500 to-orange-600"
                theme="amber"
              />
              <StatCard
                title="Assignments" rawValue={data.submissions?.length || 0}
                displayValue={`${data.submissions?.filter((s: any) => s.status === 'Graded').length || 0}/${data.assignments?.length || 0}`}
                subtitle="Completion status"
                icon={<FileText className="w-5 h-5" />}
                gradient="from-rose-500 to-pink-600"
                theme="rose"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <GlassCard title="Learning Path" subtitle="Your course progress and grades">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.assignments?.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 4).map((assign: any, i: number) => {
                      const submission = data.submissions?.find((s: any) => s.assignmentId === assign.id);
                      const progress = submission ? (submission.status === 'Graded' ? 100 : 70) : 0;
                      return (
                        <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border-white/8' : 'bg-white border-slate-100 shadow-sm'} border hover:border-indigo-500/30 transition-all group overflow-hidden relative`}>
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                              <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center`}>
                                <BookMarked className="w-5 h-5" />
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${progress === 100 ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                                {progress === 100 ? 'Completed' : progress > 0 ? 'Submitted' : 'Pending'}
                              </span>
                            </div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate`}>{assign.title}</h4>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} mb-4`}>{assign.subject} · {assign.courseCode}</p>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px]">
                                <span className={`text-slate-500 font-medium`}>Status</span>
                                <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{progress}%</span>
                              </div>
                              <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} overflow-hidden`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-500/10'} rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all`} />
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                <GlassCard title="Academic Performance" subtitle="Your CGPA Trend">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { semester: 'Sem 1', cgpa: 3.5 },
                        { semester: 'Sem 2', cgpa: 3.7 },
                        { semester: 'Sem 3', cgpa: 3.65 },
                        { semester: 'Sem 4', cgpa: 3.85 },
                      ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                        <XAxis dataKey="semester" stroke={isDark ? "#475569" : "#94a3b8"} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke={isDark ? "#475569" : "#94a3b8"} fontSize={10} axisLine={false} tickLine={false} domain={[0, 4]} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="cgpa" stroke="#6366f1" strokeWidth={3} fill="url(#cgpaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard title="Today's Schedule" subtitle="Your upcoming sessions">
                  <div className="space-y-3">
                    {(data.timetable?.length > 0 ? data.timetable : [
                      { time: '09:00 AM', subject: 'Data Structures', room: 'LH-101', instructor: 'Dr. Alan Turing' },
                      { time: '11:00 AM', subject: 'DBMS Lab', room: 'Lab-2', instructor: 'Prof. Linus Torvalds' },
                      { time: '02:00 PM', subject: 'Library Hour', room: 'Central Lib', instructor: 'Self Study' },
                    ]).slice(0, 3).map((cls: any, i: number) => (
                      <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border-white/8' : 'bg-white border-slate-100 shadow-sm'} border flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer`}>
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[50px]">
                            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{cls.time?.split(' ')[0] || '--'}</p>
                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold uppercase`}>{cls.time?.split(' ')[1] || '--'}</p>
                          </div>
                          <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />
                          <div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>{cls.subject}</h4>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} truncate max-w-[120px]`}>{cls.instructor || 'Staff'} · {cls.room}</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-300'} group-hover:text-indigo-600 dark:group-hover:text-white transition-all transform group-hover:translate-x-1`} />
                      </div>
                    ))}
                  </div>
                  <button className={`w-full mt-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/5 text-slate-500 hover:text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-900'} border text-xs font-bold transition-all`}>
                    View Full Timetable
                  </button>
                </GlassCard>

                <GlassCard title="Quick Actions">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <BookOpen className="w-4 h-4" />, label: 'Courses', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                      { icon: <ClipboardList className="w-4 h-4" />, label: 'Tasks', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                      { icon: <Library className="w-4 h-4" />, label: 'Library', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                      { icon: <Clock className="w-4 h-4" />, label: 'Exams', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                      { icon: <Activity className="w-4 h-4" />, label: 'Grades', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                      { icon: <Mail className="w-4 h-4" />, label: 'Help', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10' },
                    ].map((action, i) => (
                      <button key={i} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5 hover:border-indigo-500/20' : 'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'} transition-all group active:scale-95`}>
                        <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'} group-hover:text-indigo-600 dark:group-hover:text-slate-300 transition-colors uppercase tracking-wider`}>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard title="Recent Activity" subtitle="Your latest interactions">
                  <div className="space-y-4">
                    {[
                      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, title: 'Assignment Submitted', desc: 'Database Schema Project', time: '2 hours ago', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                      { icon: <Star className="w-3.5 h-3.5" />, title: 'Grade Received', desc: 'A- in System Design', time: 'Yesterday', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                      { icon: <Bell className="w-3.5 h-3.5" />, title: 'New Notice', desc: 'Term Exams Canceled', time: '2 days ago', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 relative group">
                        {i < 2 && <div className={`absolute left-4 top-10 bottom-0 w-px ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />}
                        <div className={`w-8 h-8 rounded-full border ${isDark ? 'border-white/10' : 'border-slate-100'} flex items-center justify-center flex-shrink-0 ${item.bg} ${item.color}`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-wider`}>{item.title}</p>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate mt-0.5`}>{item.desc}</p>
                          <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'} mt-1`}>{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden group shadow-xl">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Weekly Goal</p>
                      <h4 className="text-xl font-black text-white">4 Assignments Left</h4>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 border border-white/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <p className={`text-[11px] ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>Last updated: {format(new Date(), 'h:mm a · MMM d, yyyy')}</p>
          <div className="flex items-center gap-3">
            <button className={`text-[11px] ${isDark ? 'text-slate-700' : 'text-slate-400'} hover:text-slate-500 transition-colors`}>Privacy</button>
            <span className={isDark ? "text-slate-800" : "text-slate-200"}>·</span>
            <button className={`text-[11px] ${isDark ? 'text-slate-700' : 'text-slate-400'} hover:text-slate-500 transition-colors`}>Help</button>
            <span className={isDark ? "text-slate-800" : "text-slate-200"}>·</span>
            <button className={`text-[11px] ${isDark ? 'text-slate-700' : 'text-slate-400'} hover:text-slate-500 transition-colors`}>v2.1.0</button>
          </div>
        </div>
      </div>
    </div>
  );
};
