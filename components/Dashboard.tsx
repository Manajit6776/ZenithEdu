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
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from 'framer-motion';
import { format, subDays, isToday, isYesterday, parseISO, addDays } from 'date-fns';
import { userService, studentService, feeService, noticeService, assignmentService, timetableService } from '../lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
          className="drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] dark:drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]"
        />
      </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD (redesigned)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_THEMES: Record<string, { iconBg: string; glow: string; border: string; iconColor: string; accent: string }> = {
  rose:   { iconBg: 'bg-rose-500/10 dark:bg-blue-600/15',  glow: 'bg-rose-500 dark:bg-blue-500',  border: 'border-rose-100 dark:border-blue-500/20',  iconColor: 'text-rose-600 dark:text-blue-400',   accent: 'text-rose-700 dark:text-blue-300' },
  blue:   { iconBg: 'bg-rose-500/10 dark:bg-blue-600/20',  glow: 'bg-blue-500',                   border: 'border-rose-100 dark:border-blue-500/20', iconColor: 'text-rose-600 dark:text-blue-400',   accent: 'text-rose-700 dark:text-blue-300' },
  amber:  { iconBg: 'bg-amber-500/10 dark:bg-blue-600/15', glow: 'bg-amber-500 dark:bg-blue-500', border: 'border-amber-100 dark:border-blue-500/20', iconColor: 'text-amber-600 dark:text-blue-400',  accent: 'text-amber-700 dark:text-blue-300' },
  pink:   { iconBg: 'bg-rose-500/10 dark:bg-blue-600/15',  glow: 'bg-rose-500 dark:bg-blue-500',  border: 'border-rose-100 dark:border-blue-500/20',  iconColor: 'text-rose-600 dark:text-blue-400',   accent: 'text-rose-700 dark:text-blue-300' },
};

const StatCard: React.FC<{
  title: string; rawValue: number; displayValue: string;
  subtitle?: string; trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode; gradient: string; theme: keyof typeof CARD_THEMES;
  sparkData?: number[]; sparkColor?: string; onClick?: () => void;
}> = ({ title, displayValue, subtitle, trend, icon, gradient, theme, sparkData, sparkColor, onClick }) => {
  const t = CARD_THEMES[theme] || CARD_THEMES.rose;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border-2 p-8 cursor-pointer group transition-all duration-500",
        t.border,
        "bg-amber-100/30 dark:bg-slate-900/60 shadow-2xl backdrop-blur-xl"
      )}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-10">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-110 shadow-lg", t.iconBg, t.iconColor)}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors",
              trend.isPositive ? "bg-rose-500/10 text-rose-600 animate-pulse dark:bg-blue-500/10 dark:text-blue-400" : "bg-rose-500/5 text-rose-400 dark:bg-blue-900/20 dark:text-blue-600"
            )}>
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}%
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[10px] font-black text-rose-700/40 dark:text-blue-700/40 uppercase tracking-[0.2em] mb-3">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-rose-900 dark:text-blue-300 uppercase tracking-tighter leading-none">{displayValue}</span>
          </div>
          {subtitle && <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 mt-4 uppercase tracking-widest">{subtitle}</p>}
        </div>

        {sparkData && sparkColor && (
          <div className="mt-8 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
        )}
      </div>

      <div className={cn("absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700", t.glow)} />
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────
const GlassCard: React.FC<{
  title: string; subtitle?: string; children: React.ReactNode;
  action?: React.ReactNode; className?: string; badge?: string;
}> = ({ title, subtitle, children, action, className = '', badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border border-rose-200/40 dark:border-blue-500/10 p-6 bg-amber-50/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg dark:shadow-2xl ${className}`}
  >
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-rose-900 dark:text-blue-300">{title}</h3>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-blue-500/20 text-rose-600 dark:text-blue-400 border border-rose-500/20 dark:border-blue-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-rose-700/60 dark:text-blue-500/70 mt-0.5 uppercase tracking-widest font-black">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// RANK PODIUM CARD
// ─────────────────────────────────────────────────────────────────────────────
const TopPerformerCard: React.FC<{ student: Student; index: number; key?: string }> = ({ student, index }) => {
  const rankConfig = {
    1: { icon: <Crown className="w-4 h-4" />, bg: 'bg-amber-50/50 dark:bg-amber-500/20', border: 'border-amber-300 dark:border-amber-500/30', ring: 'ring-amber-500/40', bar: 'from-amber-400 to-yellow-400', label: 'text-amber-700 dark:text-amber-400' },
    2: { icon: <Medal className="w-4 h-4" />, bg: 'bg-amber-50/50 dark:bg-slate-400/20', border: 'border-rose-200 dark:border-slate-400/30', ring: 'ring-slate-400/30', bar: 'from-slate-300 to-slate-400', label: 'text-rose-700/70 dark:text-slate-300' },
    3: { icon: <Medal className="w-4 h-4" />, bg: 'bg-amber-50/50 dark:bg-orange-600/20', border: 'border-orange-300 dark:border-orange-600/30', ring: 'ring-orange-600/30', bar: 'from-orange-500 to-amber-600', label: 'text-orange-700 dark:text-orange-400' },
  };
  const cfg = rankConfig[student.rank as 1 | 2 | 3] || { icon: null, bg: 'bg-amber-50/50 dark:bg-blue-500/10', border: 'border-rose-200 dark:border-blue-500/10', ring: 'ring-blue-500/20', bar: 'from-blue-500 to-blue-700', label: 'text-rose-700 dark:text-blue-400' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      className={`relative p-5 rounded-2xl ${cfg.bg} border ${cfg.border} overflow-hidden group shadow-lg dark:shadow-2xl`}
    >
      {/* Rank badge */}
      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border ${cfg.border} ${cfg.label} backdrop-blur-md`}
        style={{ background: 'rgba(255,255,255,0.1)' }}>
        {student.rank && student.rank <= 3 ? cfg.icon : <span className="text-xs font-bold">#{student.rank}</span>}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-black text-lg ring-2 ${cfg.ring} shadow-xl flex-shrink-0`}>
          {student.name?.split(' ').map(n => n[0]).join('') || '??'}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-rose-900 dark:text-blue-300 text-base truncate group-hover:text-rose-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{student.name}</h4>
          <p className="text-[10px] text-rose-500/70 uppercase tracking-widest font-bold">{student.department}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`flex items-center gap-1 text-sm font-black ${cfg.label}`}>
              <Star className="w-3.5 h-3.5 fill-current" />{student.cgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{student.attendance}% att.</span>
          </div>
        </div>
      </div>

      {/* CGPA Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[10px] mb-1.5 text-rose-500 dark:text-blue-700">
          <span>Academic Score</span>
          <span className={`font-bold ${cfg.label}`}>{Math.round((student.cgpa / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-rose-100 dark:bg-white/5 overflow-hidden">
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
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/[0.04]">
              {a}
            </span>
          ))}
          {student.achievements.length > 2 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full text-slate-600">+{student.achievements.length - 2}</span>
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
            onClick={onClose} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 rounded-2xl border border-rose-200 dark:border-blue-500/20 overflow-hidden shadow-2xl bg-amber-50/95 dark:bg-slate-900/95"
            style={{ backdropFilter: 'blur(40px)' }}
          >
            <div className="flex items-center gap-3 p-4 border-b border-rose-100 dark:border-white/8">
              <Search className="w-4 h-4 text-rose-400 dark:text-blue-700" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search students, departments, fees..."
                className="flex-1 bg-transparent text-rose-900 dark:text-blue-400 text-sm outline-none placeholder-rose-300 dark:placeholder-blue-900"
              />
              <kbd className="text-[10px] text-rose-400 dark:text-blue-700 border border-rose-200 dark:border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {query === '' ? (
              <div className="p-4">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-3 font-semibold">Quick actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <UserCircle className="w-4 h-4" />, label: 'Add New Student' },
                    { icon: <DollarSign className="w-4 h-4" />, label: 'Record Fee Payment' },
                    { icon: <Calendar className="w-4 h-4" />, label: 'Schedule Event' },
                    { icon: <Mail className="w-4 h-4" />, label: 'Send Notice' },
                  ].map((a, i) => (
                    <button key={i} className="flex items-center gap-2.5 p-3 rounded-xl text-rose-600 dark:text-blue-500 hover:text-rose-900 dark:hover:text-blue-300 hover:bg-rose-100/50 dark:hover:bg-blue-500/10 transition-all text-sm text-left border border-rose-100 dark:border-white/8">
                      <span className="text-rose-600 dark:text-blue-400">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 max-h-80 overflow-y-auto">
                {filtered.length > 0 ? (
                  <>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider px-3 py-2 font-semibold">Students</p>
                    {filtered.map((s, i) => (
                      <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-blue-500/10 transition-all cursor-pointer group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name?.split(' ').map(n => n[0]).join('') || '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{s.department} · CGPA {s.cgpa}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-100 dark:bg-white/5'}`}>
                          {s.status}
                        </span>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-600 text-sm">No results found</div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 px-4 py-3 border-t border-rose-100 dark:border-white/5">
              <span className="flex items-center gap-1.5 text-[10px] text-rose-400 dark:text-blue-800"><kbd className="border border-rose-200 dark:border-white/10 rounded px-1 py-0.5">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1.5 text-[10px] text-rose-400 dark:text-blue-800"><kbd className="border border-rose-200 dark:border-white/10 rounded px-1 py-0.5">↵</kbd> Select</span>
              <span className="flex items-center gap-1.5 text-[10px] text-rose-400 dark:text-blue-800"><kbd className="border border-rose-200 dark:border-white/10 rounded px-1 py-0.5">⌘K</kbd> Toggle</span>
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
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="text-right hidden md:block">
      <p className="text-lg font-black text-rose-900 dark:text-blue-400 tabular-nums tracking-tight">{format(time, 'HH:mm:ss')}</p>
      <p className="text-[10px] text-rose-500/70 dark:text-blue-800">{format(time, 'EEEE, MMMM d yyyy')}</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-rose-200 dark:border-blue-500/10 p-4 text-sm bg-amber-50/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
      <p className="text-rose-900/60 dark:text-blue-400/60 text-[10px] mb-3 font-black uppercase tracking-[0.2em]">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }} />
          <span className="text-rose-700 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest">{p.name}:</span>
          <span className="text-rose-950 dark:text-blue-300 font-black text-sm tabular-nums uppercase tracking-tighter ml-auto">{typeof p.value === 'number' && p.value > 999 ? `$${(p.value / 1000).toFixed(1)}k` : p.value}</span>
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
    const DEPT_COLORS = ['#e11d48', '#2563eb', '#f59e0b', '#db2777', '#4f46e5'];
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
      { name: 'Paid', value: sc.Paid || 0, color: '#e11d48' },
      { name: 'Pending', value: sc.Pending || 0, color: '#f59e0b' },
      { name: 'Overdue', value: sc.Overdue || 0, color: '#ef4444' },
      { name: 'Partial', value: sc.Partial || 0, color: '#3b82f6' },
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
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 dark:border-blue-500"></div>
        <p className="text-rose-800 dark:text-blue-400 animate-pulse font-medium">Loading Dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* Search Modal */}
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} students={data.students} />

      <div className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-rose-800 dark:text-blue-300 tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                <span className="bg-gradient-to-r from-rose-700 to-rose-900 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0] || user?.role}
                </span>
              </h1>
              <p className="text-xs text-rose-500/70 dark:text-blue-700/40 mt-0.5">{user?.role} Dashboard · {format(new Date(), 'MMMM yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LiveClock />

            {/* Search trigger */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-200 dark:border-blue-500/10 text-rose-500 dark:text-blue-400 hover:text-rose-900 dark:hover:text-blue-300 hover:border-rose-300 dark:hover:border-blue-500/20 transition-all text-sm bg-amber-100/40 dark:bg-blue-500/5"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:block text-xs uppercase tracking-widest font-black">Search...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-rose-400 dark:text-blue-800 border border-rose-200 dark:border-white/8 rounded px-1 py-0.5 font-black">⌘K</kbd>
            </button>

            {/* Refresh */}
            <button onClick={handleRefresh}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-rose-200 dark:border-blue-500/10 text-rose-500 dark:text-blue-700 hover:text-rose-900 dark:hover:text-blue-400 hover:border-rose-300 dark:hover:border-blue-500/20 transition-all bg-amber-100/40 dark:bg-white/5">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
            </button>

            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-indigo-600 hover:from-rose-500 hover:to-pink-500 dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-rose-500/20 dark:shadow-blue-500/20">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Export</span>
            </button>
          </div>
        </div>

        {/* ── ROLE-BASED CONTENT ───────────────────────────────────────────── */}
        {user?.role === 'Admin' && (
          <>
            {/* ── ADMIN STAT CARDS ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Active Students" rawValue={stats.totalStudents}
                displayValue={stats.totalStudents.toLocaleString()}
                subtitle={`${stats.activeStudents} active · ${stats.totalStudents - stats.activeStudents} inactive`}
                trend={{ value: 12, isPositive: true }}
                icon={<Users className="w-5 h-5" />}
                gradient="from-rose-500 to-pink-600"
                theme="rose"
                sparkData={stuSpark} sparkColor="#f43f5e"
              />
              <StatCard
                title="Fee Collection" rawValue={stats.totalRevenue}
                displayValue={`$${(stats.totalRevenue / 1000).toFixed(1)}k`}
                subtitle={`${stats.collectionRate}% collection rate · $${(stats.pendingFees / 1000).toFixed(1)}k pending`}
                trend={{ value: 8, isPositive: true }}
                icon={<DollarSign className="w-5 h-5" />}
                gradient="from-blue-500 to-blue-700"
                theme="blue"
                sparkData={revSpark} sparkColor="#2563eb"
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
                gradient="from-pink-500 to-rose-600"
                theme="pink"
                sparkData={tcSpark} sparkColor="#ec4899"
              />
            </div>

            {/* ── MINI KPI STRIP ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Dean\'s List', value: '12', icon: <Star className="w-4 h-4 text-amber-500" />, sub: 'students', border: 'border-amber-100', bg: 'bg-amber-50/50' },
                { label: 'Overdue Fees', value: '3', icon: <AlertCircle className="w-4 h-4 text-rose-500" />, sub: 'accounts', border: 'border-rose-100', bg: 'bg-rose-50/50' },
                { label: 'Events Scheduled', value: '7', icon: <Calendar className="w-4 h-4 text-purple-500" />, sub: 'this month', border: 'border-purple-100', bg: 'bg-purple-50/50' },
                { label: 'Avg CGPA', value: (data.students.reduce((s, st) => s + st.cgpa, 0) / data.students.length).toFixed(2), icon: <GraduationCap className="w-4 h-4 text-rose-500" />, sub: 'overall', border: 'border-rose-100', bg: 'bg-rose-50/50' },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border ${kpi.border} dark:border-blue-500/10 hover:scale-105 transition-all cursor-pointer ${kpi.bg} dark:bg-white/5 shadow-sm`}
                >
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm">{kpi.icon}</div>
                  <div>
                    <p className="text-xl font-black text-rose-900 dark:text-blue-300 uppercase tracking-tighter leading-none">{kpi.value}</p>
                    <p className="text-[10px] font-black text-rose-700/60 dark:text-blue-700 uppercase tracking-widest mt-1">{kpi.label}</p>
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${chartRange === r ? 'bg-rose-600 dark:bg-blue-600 text-white' : 'text-rose-500 dark:text-blue-700 hover:text-white hover:bg-rose-600/50 dark:hover:bg-blue-500/50'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="flex items-center gap-4 mb-4">
                  {[{ dot: '#e11d48', label: 'Present' }, { dot: '#ef4444', label: 'Absent' }, { dot: '#f59e0b', label: 'Late' }].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5 text-xs text-rose-900/60 dark:text-blue-400/60">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.dot }} />{l.label}
                    </span>
                  ))}
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height={288}>
                    <ComposedChart data={attendanceTrendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e11d48" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis dataKey="day" stroke="#be123c" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#be123c', fontWeight: 900 }} />
                      <YAxis stroke="#be123c" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#be123c', fontWeight: 900 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="present" stroke="#e11d48" strokeWidth={2.5} fill="url(#presentGrad)" />
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
                      <PolarGrid stroke="rgba(0,0,0,0.06)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#be123c', fontSize: 10, fontWeight: 900 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke="#e11d48" fill="#e11d48" fillOpacity={0.2} strokeWidth={2} />
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
                          <stop offset="0%" stopColor="#e11d48" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis dataKey="month" stroke="#be123c" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#be123c', fontWeight: 900 }} />
                      <YAxis stroke="#be123c" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#be123c', fontWeight: 900 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="tuition" stackId="1" stroke="#e11d48" fill="url(#tuitionGrad)" strokeWidth={2} name="Tuition" />
                      <Area type="monotone" dataKey="hostel" stackId="1" stroke="#fbbf24" fill="url(#hostelGrad)" strokeWidth={2} name="Hostel" />
                      <Area type="monotone" dataKey="other" stackId="1" stroke="#f472b6" fill="url(#otherGrad)" strokeWidth={2} name="Other" />
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
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/50 dark:bg-white/5 border border-rose-100 dark:border-white/5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="min-w-0">
                        <p className="text-[10px] text-rose-500/70 dark:text-blue-700">{item.name}</p>
                        <p className="text-sm font-bold text-rose-900 dark:text-blue-300">{item.value}</p>
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
                      <XAxis type="number" stroke="#be123c" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#be123c', fontWeight: 900 }} />
                      <YAxis type="category" dataKey="name" stroke="#be123c" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#be123c', fontWeight: 900 }} width={60} />
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
                    <p key={d} className="text-center text-[10px] text-rose-700/60 dark:text-blue-700 font-black uppercase tracking-widest mb-1">{d}</p>
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
                        style={{ background: `rgba(225,29,72,${alpha})` }}
                      >
                        <span className="text-[10px] font-black text-rose-900/60 dark:text-blue-300 group-hover:text-white transition-colors">{cell.value}%</span>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <span className="text-[10px] font-black text-rose-700/40 uppercase tracking-widest">Low</span>
                  {[0.1, 0.3, 0.55, 0.75, 0.95].map((a, i) => (
                    <div key={i} className="w-4 h-4 rounded" style={{ background: `rgba(225,29,72,${a})` }} />
                  ))}
                  <span className="text-[10px] font-black text-rose-700/40 uppercase tracking-widest">High</span>
                </div>
              </GlassCard>
            </div>

            {/* ── ACADEMIC LEADERS + SIDEBAR ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className="xl:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-rose-900 dark:text-white uppercase tracking-tight">Academic Leaders</h3>
                      <p className="text-[10px] font-bold text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">{t('topPerformingStudentsThisSemester')}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-blue-500/10 text-rose-600 dark:text-blue-500 hover:text-rose-900 dark:hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition-all hover:border-rose-300 dark:hover:border-blue-500/20">
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
                      { icon: <UserCircle className="w-4 h-4" />, label: 'Add Student', bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
                      { icon: <Wallet className="w-4 h-4" />, label: 'Record Fee', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
                      { icon: <Calendar className="w-4 h-4" />, label: 'Schedule', bg: 'bg-amber-500/20', text: 'text-amber-400' },
                      { icon: <Mail className="w-4 h-4" />, label: 'Send Notice', bg: 'bg-rose-500/20', text: 'text-rose-400' },
                      { icon: <FileText className="w-4 h-4" />, label: 'Reports', bg: 'bg-blue-500/20', text: 'text-blue-400' },
                      { icon: <Settings className="w-4 h-4" />, label: 'Settings', bg: 'bg-slate-500/20', text: 'text-slate-400' },
                    ].map((action, i) => (
                      <motion.button
                        key={i}
                         whileHover={{ scale: 1.04 }}
                         whileTap={{ scale: 0.97 }}
                         className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-rose-100 dark:border-blue-500/10 hover:border-rose-300 dark:hover:border-blue-500/20 bg-amber-50/50 dark:bg-white/[0.025] transition-all"
                       >
                         <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                           <span className={action.text}>{action.icon}</span>
                         </div>
                         <span className="text-[10px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest text-center">{action.label}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Your Students" rawValue={42}
                displayValue="42"
                subtitle="Across 3 sections"
                icon={<Users className="w-5 h-5" />}
                gradient="from-rose-500 to-pink-600"
                theme="rose"
                sparkData={[38, 40, 42, 42, 42, 42]}
                sparkColor="#f43f5e"
              />
              <StatCard
                title="Class Attendance" rawValue={94}
                displayValue="94%"
                subtitle="Average this week"
                trend={{ value: 2.4, isPositive: true }}
                icon={<Activity className="w-5 h-5" />}
                gradient="from-amber-500 to-orange-600"
                theme="amber"
                sparkData={[88, 90, 92, 94, 93, 94]}
                sparkColor="#f59e0b"
              />
              <StatCard
                title="Pending Gradings" rawValue={15}
                displayValue="15"
                subtitle="Assignments to review"
                icon={<FileText className="w-5 h-5" />}
                gradient="from-blue-600 to-indigo-700"
                theme="blue"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard title="Today's Schedule" subtitle="Your upcoming sessions">
                <div className="space-y-4">
                  {[
                    { time: '09:00 AM', subject: 'Advanced Mathematics', room: 'Room 302', type: 'Lecture' },
                    { time: '11:30 AM', subject: 'Physics Lab', room: 'Lab B', type: 'Practical' },
                    { time: '02:00 PM', subject: 'Computer Science', room: 'Auditorium', type: 'Lecture' },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-amber-50 dark:bg-slate-900/40 border border-rose-100 dark:border-blue-500/10 hover:border-rose-400 dark:hover:border-blue-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-blue-600/20 flex flex-col items-center justify-center text-rose-600 dark:text-blue-400 border border-rose-100 dark:border-blue-500/10 shadow-sm">
                          <Clock className="w-5 h-5" />
                          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">NOW</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-rose-900 dark:text-white group-hover:text-rose-600 transition-colors uppercase tracking-tight">{session.subject}</h4>
                          <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{session.time} · {session.room}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200/50">
                        {session.type}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard title="Recent Submissions" subtitle="Pending your review">
                <div className="space-y-2">
                  {data.students.slice(0, 5).map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50/50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 p-0.5">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed= ${student.name}`} alt="" className="w-full h-full rounded-full bg-white dark:bg-slate-900" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-rose-900 dark:text-white uppercase tracking-widest">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Unit 3 Assignment · 2h ago</p>
                        </div>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-blue-500/10 hover:bg-rose-600 dark:hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        Grade
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 text-[10px] font-black text-rose-700/40 hover:text-rose-600 uppercase tracking-widest transition-colors border-t border-dashed border-rose-100 dark:border-white/5">
                  View All Submissions
                </button>
              </GlassCard>
            </div>
          </div>
        )}

        {/* ── STUDENT DASHBOARD ───────────────────────────────────────────── */}
        {user?.role === 'Student' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Your Attendance" rawValue={data.currentStudent?.attendance || 0}
                displayValue={`${data.currentStudent?.attendance || 0}%`}
                subtitle="Overall presence"
                icon={<Activity className="w-5 h-5" />}
                gradient="from-rose-500 to-pink-600"
                theme="rose"
                sparkData={[85, 88, 87, 89, 92, data.currentStudent?.attendance || 92]}
                sparkColor="#f43f5e"
              />
              <StatCard
                title="Current CGPA" rawValue={data.currentStudent?.cgpa || 0}
                displayValue={(data.currentStudent?.cgpa || 0).toFixed(2)}
                subtitle={`Rank: #${data.currentStudent?.rank || 'N/A'}`}
                icon={<GraduationCap className="w-5 h-5" />}
                gradient="from-amber-500 to-orange-600"
                theme="amber"
                sparkData={[3.5, 3.6, 3.7, 3.8, 3.85, data.currentStudent?.cgpa || 3.85]}
                sparkColor="#f59e0b"
              />
              <StatCard
                title="Fees Status" rawValue={0}
                displayValue={data.currentStudent?.feesStatus || 'Cleared'}
                subtitle={data.currentStudent?.feesStatus === 'Overdue' ? 'Action required' : 'Next due: Jan 2026'}
                icon={<CreditCard className="w-5 h-5" />}
                gradient="from-blue-600 to-indigo-700"
                theme="blue"
              />
              <StatCard
                title="Assignments" rawValue={data.submissions?.length || 0}
                displayValue={`${data.submissions?.filter((s: any) => s.status === 'Graded').length || 0}/${data.assignments?.length || 0}`}
                subtitle="Completion status"
                icon={<FileText className="w-5 h-5" />}
                gradient="from-pink-500 to-rose-600"
                theme="pink"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <GlassCard title="Learning Path" subtitle="Your course progress and grades">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.assignments?.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 4).map((assign: any, i: number) => {
                      const submission = data.submissions?.find((s: any) => s.assignmentId === assign.id);
                      const progress = submission ? (submission.status === 'Graded' ? 100 : 70) : 0;
                      return (
                        <div key={i} className="p-5 rounded-3xl bg-amber-50/30 dark:bg-white/5 border border-amber-100/50 dark:border-white/10 hover:border-rose-400/50 transition-all group overflow-hidden relative shadow-sm">
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm border border-rose-50 dark:border-white/5">
                                <BookMarked className="w-6 h-6" />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${progress === 100 ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'}`}>
                                {progress === 100 ? 'Ascended' : progress > 0 ? 'Submitted' : 'Pending'}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-rose-900 dark:text-white group-hover:text-rose-600 transition-colors truncate uppercase tracking-tight">{assign.title}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-5">{assign.subject} · {assign.courseCode}</p>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <span>Mastery Progress</span>
                                <span className="text-rose-900 dark:text-white">{progress}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-white dark:bg-slate-800 overflow-hidden shadow-inner border border-rose-50 dark:border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className={`h-full ${progress === 100 ? 'bg-rose-600' : 'bg-amber-500'}`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all" />
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
                            <stop offset="0%" stopColor="#e11d48" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                         <XAxis dataKey="semester" stroke="#be123c" fontSize={10} axisLine={false} tickLine={false} dy={10} tick={{ fontWeight: 900 }} />
                         <YAxis stroke="#be123c" fontSize={10} axisLine={false} tickLine={false} domain={[0, 4]} tick={{ fontWeight: 900 }} />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e11d48', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="cgpa" stroke="#e11d48" strokeWidth={4} fill="url(#cgpaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard title="Today's Schedule" subtitle="Your upcoming sessions">
                  <div className="space-y-4">
                    {(data.timetable?.length > 0 ? data.timetable : [
                      { time: '09:00 AM', subject: 'Data Structures', room: 'LH-101', instructor: 'Dr. Alan Turing' },
                      { time: '11:00 AM', subject: 'DBMS Lab', room: 'Lab-2', instructor: 'Prof. Linus Torvalds' },
                      { time: '02:00 PM', subject: 'Library Hour', room: 'Central Lib', instructor: 'Self Study' },
                    ]).slice(0, 3).map((cls: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-white/5 border border-rose-100/50 dark:border-white/10 flex items-center justify-between group hover:border-rose-400/50 transition-all cursor-pointer shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[50px] p-2 rounded-xl bg-amber-50 dark:bg-slate-800 shadow-sm border border-rose-100 dark:border-blue-500/10">
                            <p className="text-sm font-black text-rose-900 dark:text-blue-400 uppercase tracking-tighter leading-none">{cls.time?.split(' ')[0] || '--'}</p>
                            <p className="text-[10px] text-rose-500/50 dark:text-blue-800 font-black uppercase tracking-widest mt-1">{cls.time?.split(' ')[1] || '--'}</p>
                          </div>
                          <div className="w-px h-8 bg-rose-200 dark:bg-white/10" />
                          <div>
                            <h4 className="text-[12px] font-black text-rose-900 dark:text-white group-hover:text-rose-600 transition-colors uppercase tracking-tight">{cls.subject}</h4>
                            <p className="text-[10px] font-bold text-slate-500 truncate max-w-[120px] uppercase tracking-widest mt-0.5">{cls.instructor || 'Staff'} · {cls.room}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-rose-700/40 group-hover:text-rose-600 transition-all transform group-hover:translate-x-1" />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 rounded-2xl bg-rose-600 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 dark:hover:bg-blue-700 transition-all shadow-lg shadow-rose-200/50 dark:shadow-blue-900/50">
                    View Full Timetable
                  </button>
                </GlassCard>

                <GlassCard title="Quick Actions">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <BookOpen className="w-5 h-5" />, label: 'Courses', color: 'text-rose-600', bg: 'bg-rose-500/10' },
                      { icon: <ClipboardList className="w-5 h-5" />, label: 'Tasks', color: 'text-amber-600', bg: 'bg-amber-500/10' },
                      { icon: <Library className="w-5 h-5" />, label: 'Library', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { icon: <Clock className="w-5 h-5" />, label: 'Exams', color: 'text-rose-600', bg: 'bg-rose-500/10' },
                      { icon: <Activity className="w-5 h-5" />, label: 'Grades', color: 'text-rose-600', bg: 'bg-rose-500/10' },
                      { icon: <Mail className="w-5 h-5" />, label: 'Help', color: 'text-slate-600', bg: 'bg-slate-500/10' },
                    ].map((action, i) => (
                      <button key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-amber-50/40 dark:bg-white/5 border border-rose-100 dark:border-blue-500/10 hover:border-rose-300 dark:hover:border-blue-500/30 hover:scale-105 transition-all group shadow-sm">
                        <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform shadow-inner`}>
                          {action.icon}
                        </div>
                        <span className="text-[10px] font-black text-rose-700/60 dark:text-blue-500/60 group-hover:text-rose-700 dark:group-hover:text-blue-400 transition-colors uppercase tracking-[0.15em]">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard title="Recent Activity" subtitle="Your latest interactions">
                  <div className="space-y-6">
                    {[
                      { icon: <CheckCircle2 className="w-4 h-4" />, title: 'Assignment Submitted', desc: 'Database Schema Project', time: '2 hours ago', color: 'text-rose-600', bg: 'bg-rose-500/10' },
                      { icon: <Star className="w-4 h-4" />, title: 'Grade Received', desc: 'A- in System Design', time: 'Yesterday', color: 'text-amber-600', bg: 'bg-amber-500/10' },
                      { icon: <Bell className="w-4 h-4" />, title: 'New Notice', desc: 'Term Exams Canceled', time: '2 days ago', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-5 relative group">
                        {i < 2 && <div className="absolute left-5 top-12 bottom-0 w-px border-l-2 border-dashed border-rose-100 dark:border-blue-500/10" />}
                        <div className={`w-10 h-10 rounded-2xl border border-rose-100 dark:border-blue-500/10 flex items-center justify-center flex-shrink-0 ${item.bg} dark:bg-slate-800 ${item.color} shadow-sm group-hover:scale-110 transition-all`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-rose-900 dark:text-blue-300 group-hover:text-rose-600 transition-colors uppercase tracking-widest">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-blue-700 truncate mt-1 uppercase tracking-tighter">{item.desc}</p>
                          <p className="text-[9px] font-black text-rose-700/30 dark:text-blue-900 uppercase tracking-[0.2em] mt-2">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-rose-600 to-pink-700 dark:from-blue-600 dark:to-blue-800 relative overflow-hidden group shadow-2xl shadow-rose-200/50 dark:shadow-blue-900/40">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Ascension Goal</p>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">4 Assignments Left</h4>
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <Zap className="w-8 h-8 text-white animate-bounce" />
                    </div>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-all duration-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-10 pb-12 border-t border-rose-200/40 dark:border-blue-500/10 mt-10">
          <p className="text-[10px] font-black text-rose-700/40 dark:text-blue-800 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Last Synced: {format(new Date(), 'h:mm a · MMM d, yyyy')}
          </p>
          <div className="flex items-center gap-6">
            <button className="text-[10px] font-black text-rose-700/40 dark:text-blue-800 hover:text-rose-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">Privacy Policy</button>
            <span className="w-1 h-1 rounded-full bg-rose-200 dark:bg-blue-900" />
            <button className="text-[10px] font-black text-rose-700/40 dark:text-blue-800 hover:text-rose-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">Support Center</button>
            <span className="w-1 h-1 rounded-full bg-rose-200 dark:bg-blue-900" />
            <div className="px-3 py-1 rounded-full bg-rose-100 dark:bg-blue-500/10 border border-rose-200 dark:border-blue-500/20 shadow-sm">
              <span className="text-[10px] font-black text-rose-700 dark:text-blue-400 uppercase tracking-widest">v2.1.3-EDUNEXUS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
