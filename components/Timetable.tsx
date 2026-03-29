import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Calendar, Clock, MapPin, Search, Download, Plus, Edit, Trash2, Loader2,
  ChevronLeft, ChevronRight, User, X, Check, AlertCircle, MoreVertical,
  RefreshCw, WifiOff, Server, LayoutGrid, CalendarRange, AlignLeft, Info,
  BookOpen, FlaskConical, Coffee, ClipboardCheck, Zap
} from 'lucide-react';
import { timetableService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────────────────────
interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Self Study' | 'Review' | 'Activity';
  instructor?: string;
  description?: string;
  duration?: number;
  maxCapacity?: number;
  currentEnrollment?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, string[]>;
}

interface FormData {
  day: string;
  time: string;
  subject: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Self Study' | 'Review' | 'Activity';
  instructor?: string;
  description?: string;
  duration?: number;
  maxCapacity?: number;
}

type ViewMode = 'grid' | 'timeline' | 'agenda';

// ─── Constants ─────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const TYPES = ['Lecture', 'Lab', 'Self Study', 'Review', 'Activity'] as const;
const TIMELINE_HOUR_PX = 72; // pixels per hour in timeline view
const TIMELINE_START_HOUR = 8; // 8 AM
const TIMELINE_END_HOUR = 21;  // 9 PM

// ─── Color + Icon System ───────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  bg: string; text: string; border: string; accent: string; shadow: string;
  icon: React.ElementType; label: string;
}> = {
  'Lecture':    { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: ' dark:', border: 'border-indigo-100 dark:border-indigo-500/20', accent: 'bg-indigo-500', shadow: 'shadow-indigo-200 dark:shadow-indigo-900/40', icon: BookOpen, label: 'Lecture' },
  'Lab':        { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: ' dark:', border: 'border-emerald-100 dark:border-emerald-500/20', accent: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-emerald-900/40', icon: FlaskConical, label: 'Lab' },
  'Self Study': { bg: 'bg-amber-50 dark:bg-amber-500/10', text: ' dark:', border: 'border-amber-100 dark:border-amber-500/20', accent: 'bg-amber-500', shadow: 'shadow-amber-200 dark:shadow-amber-900/40', icon: Coffee, label: 'Self Study' },
  'Review':     { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-700 ', border: 'border-sky-100 dark:border-sky-500/20', accent: 'bg-sky-500', shadow: 'shadow-sky-200 dark:shadow-sky-900/40', icon: ClipboardCheck, label: 'Review' },
  'Activity':   { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 ', border: 'border-violet-100 dark:border-violet-500/20', accent: 'bg-violet-500', shadow: 'shadow-violet-200 dark:shadow-violet-900/40', icon: Zap, label: 'Activity' },
};
const getType = (type: string) => TYPE_CONFIG[type] ?? { bg: 'bg-slate-50 dark:bg-slate-800', text: ' dark:', border: 'border-slate-200 dark:border-slate-700', accent: 'bg-slate-500', shadow: 'shadow-slate-200', icon: Calendar, label: type };

// ─── Utilities ─────────────────────────────────────────────────────────────
const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network'))
      return { message: 'Network connection failed. Please check your internet connection.', code: 'NETWORK_ERROR', status: 0 };
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    return { message: e.message || 'An unexpected error occurred', code: e.code || 'UNKNOWN_ERROR', status: e.status, details: e.details };
  }
  return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
};

const formatTime = (time: string | undefined) => {
  if (!time) return '--:--';
  
  // Normalize input
  const cleanTime = time.trim().toLowerCase();
  
  // Handle AM/PM format
  if (cleanTime.includes('am') || cleanTime.includes('pm')) {
    const match = cleanTime.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
    if (match) {
      const [_, h, m = '00', p] = match;
      return `${h.padStart(1, '0')}:${m.padStart(2, '0')} ${p.toUpperCase()}`;
    }
    return time.toUpperCase();
  }

  // Handle 24h format
  const parts = cleanTime.split(':');
  let hour = parseInt(parts[0]);
  let minutes = parts[1] ? parseInt(parts[1]) : 0;

  if (isNaN(hour)) return time;
  if (isNaN(minutes)) minutes = 0;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHour}:${displayMinutes} ${period}`;
};

const timeToMinutes = (time: string | undefined) => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// ─── Hooks ──────────────────────────────────────────────────────────────────
const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  useEffect(() => {
    const up = () => setIsOnline(true), down = () => setIsOnline(false);
    window.addEventListener('online', up); window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  const markSynced = useCallback(() => setLastSynced(new Date()), []);
  return { isOnline, lastSynced, markSynced };
};

const useOptimisticUpdates = () => {
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const addPending = useCallback((id: string) => setPendingOperations(p => new Set(p).add(id)), []);
  const removePending = useCallback((id: string) => setPendingOperations(p => { const n = new Set(p); n.delete(id); return n; }), []);
  return { pendingOperations, addPending, removePending };
};

// ─── TypeBadge ──────────────────────────────────────────────────────────────
const TypeBadge: React.FC<{ type: string; size?: 'sm' | 'md' }> = ({ type, size = 'sm' }) => {
  const cfg = getType(type);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-bold tracking-tight shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {type}
    </span>
  );
};

const EnrollmentBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const pct = Math.min((current / max) * 100, 100);
  const full = current >= max;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold tracking-tight">
        <span className="dark:">Class Utilization</span>
        <span className={full ? ' animate-pulse' : ' dark:'}>{current}/{max} Students</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${full ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── TimetableCard ──────────────────────────────────────────────────────────
const TimetableCard: React.FC<{
  key?: React.Key;
  entry: TimetableEntry;
  onEdit: (e: TimetableEntry) => void;
  onDelete: (e: TimetableEntry) => void;
  onView: (e: TimetableEntry) => void;
  isPending?: boolean;
}> = ({ entry, onEdit, onDelete, onView, isPending }) => {
  const { isTeacher, isAdmin } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const cfg = getType(entry.type);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setShowActions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isLive = useMemo(() => {
    const now = new Date();
    const currentDay = DAYS[now.getDay() - 1] || 'Monday';
    if (entry.day !== currentDay) return false;
    
    const start = timeToMinutes(entry.time);
    const end = start + (entry.duration || 60);
    const current = now.getHours() * 60 + now.getMinutes();
    
    return current >= start && current <= end;
  }, [entry]);

  return (
    <div
      className={`relative rounded-[2.5rem] border p-7 group transition-all duration-500 cursor-pointer ${isPending ? 'opacity-50 pointer-events-none' : ''} bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/60 dark:border-slate-800/60 hover:border-rose-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-rose-500/10 dark:hover:shadow-indigo-500/10 hover:-translate-y-2 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden`}
      onClick={() => onView(entry)}
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${cfg.accent}`} />

      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex flex-col gap-3">
           {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 dark:bg-slate-800 border border-emerald-500/20 dark:border-slate-700  dark: text-[10px] font-black  tracking-widest animate-pulse shadow-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Live Now
            </div>
          )}
          <TypeBadge type={entry.type} size="md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 dark:bg-slate-800 text-white dark: text-xs font-black tabular-nums shadow-lg shadow-black/20 dark:shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
              <Clock className="w-4 h-4  dark:" />
              {formatTime(entry.time)}
            </div>
            {entry.duration && <span className="text-[9px] font-bold  mt-1  tracking-tighter">{entry.duration} mins</span>}
          </div>
          <div className="relative" ref={actionsRef} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-xl  hover: dark:hover: hover:bg-rose-50 dark:hover:bg-slate-800 transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-30 p-2 animate-in fade-in zoom-in duration-300 backdrop-blur-xl">
                <button onClick={() => { onView(entry); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs font-bold  dark: hover:bg-rose-50 dark:hover:bg-indigo-500/10 hover: dark:hover: rounded-xl flex items-center gap-3 transition-all">
                  <Info className="w-4 h-4  dark:" /> View Details
                </button>
                {(isTeacher() || isAdmin()) && (
                  <>
                    <button onClick={() => { onEdit(entry); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs font-bold  dark: hover:bg-rose-50 dark:hover:bg-indigo-500/10 hover: dark:hover: rounded-xl flex items-center gap-3 transition-all">
                      <Edit className="w-4 h-4  dark:" /> Edit Session
                    </button>
                    <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />
                    <button onClick={() => { onDelete(entry); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs font-bold  hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition-all">
                      <Trash2 className="w-4 h-4" /> Delete Session
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold  dark: mb-4 leading-tight group-hover: dark:group-hover: transition-colors  tracking-tight">{entry.subject}</h3>

      <div className="grid grid-cols-1 gap-2.5 mb-5">
        <div className="flex items-center gap-3 text-xs font-semibold /60 dark:">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-slate-800/80 flex items-center justify-center border border-rose-100/50 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5  dark:" />
          </div>
          <span className="truncate">{entry.room}</span>
        </div>
        {entry.instructor && (
          <div className="flex items-center gap-3 text-xs font-semibold /60 dark:">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-slate-800/80 flex items-center justify-center border border-rose-100/50 dark:border-slate-700">
              <User className="w-3.5 h-3.5  dark:" />
            </div>
            <span className="truncate">{entry.instructor}</span>
          </div>
        )}
      </div>

      {entry.maxCapacity && entry.currentEnrollment !== undefined && (
        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <EnrollmentBar current={entry.currentEnrollment} max={entry.maxCapacity} />
        </div>
      )}
    </div>
  );
};
// ─── Timeline Block ─────────────────────────────────────────────────────────
const TimelineBlock: React.FC<{
  key?: React.Key;
  entry: TimetableEntry;
  onView: (e: TimetableEntry) => void;
  isPending?: boolean;
}> = ({ entry, onView, isPending }) => {
  const cfg = getType(entry.type);
  const startMinutes = timeToMinutes(entry.time) - TIMELINE_START_HOUR * 60;
  const duration = entry.duration || 60;
  const top = Math.max((startMinutes / 60) * TIMELINE_HOUR_PX, 0);
  const height = Math.max((duration / 60) * TIMELINE_HOUR_PX - 2, 24);
  
  return (
    <div
      className={`absolute left-1 right-1 rounded-xl border-l-4 cursor-pointer hover:z-30 hover:shadow-xl transition-all duration-300 ${cfg.bg} ${cfg.border} overflow-hidden ${isPending ? 'opacity-50' : ''}`}
      style={{ top: `${top}px`, height: `${height}px`, minHeight: '32px', borderLeftColor: cfg.accent }}
      onClick={() => onView(entry)}
      title={`${entry.subject} · ${entry.time}`}
    >
      <div className="px-3 py-2 h-full flex flex-col justify-start overflow-hidden">
        <p className={`text-[10px] font-black ${cfg.text} truncate  tracking-widest`}>{entry.subject}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-black  dark: tabular-nums">{entry.time}</span>
          {height > 40 && entry.room && (
            <span className="text-[10px] font-bold  dark: truncate">• {entry.room}</span>
          )}
        </div>
      </div>
    </div>
  );
};


// ─── Weekly Timeline View ───────────────────────────────────────────────────
const WeeklyTimeline: React.FC<{
  entries: TimetableEntry[];
  onView: (e: TimetableEntry) => void;
  pendingOperations: Set<string>;
  activeDays?: string[];
}> = ({ entries, onView, pendingOperations, activeDays }) => {
  const visibleDays = activeDays?.length ? DAYS.filter(d => activeDays.includes(d)) : DAYS.filter(d => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(d));
  const hourCount = TIMELINE_END_HOUR - TIMELINE_START_HOUR;
  const totalHeight = hourCount * TIMELINE_HOUR_PX;

  const byDay = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    visibleDays.forEach(d => map[d] = []);
    entries.forEach(e => { 
      if (map[e.day]) {
        map[e.day].push(e);
      }
    });
    // Sort entries by time within each day
    Object.keys(map).forEach(day => {
      map[day].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    });
    return map;
  }, [entries, visibleDays]);

  // Get current time indicator position
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = DAYS[now.getDay() - 1] || 'Monday';
  const currentTimeTop = currentHour >= TIMELINE_START_HOUR && currentHour < TIMELINE_END_HOUR
    ? ((currentHour - TIMELINE_START_HOUR) * 60 + currentMinute) / 60 * TIMELINE_HOUR_PX
    : -1;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl shadow-slate-200/60 dark:shadow-none">
      {/* Day header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
        {visibleDays.map((day, i) => {
          const count = byDay[day]?.length ?? 0;
          const isToday = day === currentDay;
          return (
            <div key={day} className={`flex-1 min-w-[120px] text-center py-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${isToday ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''}`}>
              <p className={`text-[11px] font-bold  tracking-widest ${isToday ? ' dark:' : ' dark:'}`}>
                {day.substring(0, 3)}
              </p>
              {count > 0 && <p className="text-[9px] font-bold  dark: mt-1  tracking-tight">{count} Classes</p>}
            </div>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '650px' }}>
        <div className="flex relative">
          {/* Time axis */}
          <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-800/20" style={{ height: `${totalHeight}px` }}>
            {Array.from({ length: hourCount }, (_, i) => {
              const hour = TIMELINE_START_HOUR + i;
              return (
                <div key={hour} className="absolute w-full flex items-start justify-center pt-2 border-b border-slate-100 dark:border-slate-800/50" style={{ top: `${i * TIMELINE_HOUR_PX}px`, height: `${TIMELINE_HOUR_PX}px` }}>
                  <span className="text-[10px] font-bold  tabular-nums  tracking-tighter">{String(hour).padStart(2, '0')}:00</span>
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {visibleDays.map((day, i) => {
            const isToday = day === currentDay;
            return (
              <div key={day} className={`flex-1 min-w-[140px] relative border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${isToday ? 'bg-indigo-500/[0.02] dark:bg-indigo-500/[0.02]' : ''}`} style={{ height: `${totalHeight}px` }}>
                {/* Hour grid lines */}
                {Array.from({ length: hourCount }, (_, j) => (
                  <div key={j} className="absolute left-0 right-0 border-t border-slate-100 dark:border-slate-800/20" style={{ top: `${j * TIMELINE_HOUR_PX}px` }} />
                ))}
                
                {/* Current time indicator */}
                {isToday && currentTimeTop >= 0 && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimeTop}px` }}>
                    <div className="flex items-center -translate-y-1/2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-lg shadow-indigo-500/50 -ml-1.25" />
                      <div className="flex-1 h-px bg-indigo-600/30 dark:bg-indigo-500/30" />
                    </div>
                  </div>
                )}
                
                {/* Entries */}
                <div className="relative h-full px-1">
                  {(byDay[day] || []).map(entry => (
                    <TimelineBlock key={entry.id} entry={entry} onView={onView} isPending={pendingOperations.has(entry.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Agenda View (Grouped by Day) ───────────────────────────────────────────
const AgendaView: React.FC<{
  entries: TimetableEntry[];
  onEdit: (e: TimetableEntry) => void;
  onDelete: (e: TimetableEntry) => void;
  onView: (e: TimetableEntry) => void;
  pendingOperations: Set<string>;
}> = ({ entries, onEdit, onDelete, onView, pendingOperations }) => {
  const byDay = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    entries.forEach(e => { if (!map[e.day]) map[e.day] = []; map[e.day].push(e); });
    return map;
  }, [entries]);

  return (
    <div className="space-y-10">
      {DAYS.map(day => {
        const dayEntries = byDay[day] || [];
        if (dayEntries.length === 0) return null;
        return (
           <div key={day} className="space-y-5">
            <h2 className="text-sm font-bold  dark:  tracking-widest flex items-center gap-3">
              <span className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              {day}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dayEntries.sort((a,b) => timeToMinutes(a.time) - timeToMinutes(b.time)).map(entry => (
                <TimetableCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} onView={onView} isPending={pendingOperations.has(entry.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── View Detail Modal ───────────────────────────────────────────────────────
const ViewDetailModal: React.FC<{
  entry: TimetableEntry;
  onClose: () => void;
  onEdit: (e: TimetableEntry) => void;
  onDelete: (e: TimetableEntry) => void;
  canEdit: boolean;
}> = ({ entry, onClose, onEdit, onDelete, canEdit }) => {
  const cfg = getType(entry.type);
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`h-32 flex items-center justify-between px-8 relative overflow-hidden ${cfg.bg}`}>
          <div className="relative z-10 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center ${cfg.text} border ${cfg.border}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold   leading-tight  tracking-tight">{entry.subject}</h2>
              <p className={`text-xs font-semibold ${cfg.text}  tracking-widest mt-0.5`}>{entry.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <InfoItem icon={Clock} label="Time & Day" value={`${formatTime(entry.time)} • ${entry.day}`} />
            <InfoItem icon={MapPin} label="Location" value={entry.room} />
            {entry.instructor && <InfoItem icon={User} label="Instructor" value={entry.instructor} />}
            <InfoItem icon={Calendar} label="Status" value="Scheduled" />
          </div>

          {entry.description && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold  dark:  tracking-widest mb-3">Notes</p>
              <p className="text-sm  dark: leading-relaxed font-medium">{entry.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex-1 max-w-[240px]">
              <EnrollmentBar current={entry.currentEnrollment || 0} max={entry.maxCapacity || 40} />
            </div>
            <div className="flex gap-3">
              {canEdit && (
                <>
                  <button onClick={() => { onEdit(entry); onClose(); }} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center  dark: hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover: transition-all shadow-sm"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => { if(confirm('Are you sure you want to delete this session?')) { onDelete(entry); onClose(); } }} className="w-10 h-10 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-center  hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4  dark:" />
      <span className="text-[10px] font-black /40 dark:/40  tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-black  dark:  tracking-tight ml-6">{value}</p>
  </div>
);

// ─── Entry Form Modal ────────────────────────────────────────────────────────
const EntryFormModal: React.FC<{
  editingEntry: TimetableEntry | null;
  formData: FormData;
  setFormData: (d: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}> = ({ editingEntry, formData, setFormData, onSubmit, onClose, isSubmitting }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={onSubmit} className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold    tracking-tight">{editingEntry ? 'Edit Session' : 'Create New Session'}</h2>
            <p className="text-xs /60 dark: mt-1 font-medium">Enter the session details below.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Subject" required>
              <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2.5 bg-rose-50/30 dark:bg-slate-800 border border-rose-100/50 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 dark:focus:border-indigo-500 transition-all" placeholder="e.g. Computer Networks" required />
            </FormField>
            <FormField label="Room / Hall" required>
              <input type="text" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full px-4 py-2.5 bg-rose-50/30 dark:bg-slate-800 border border-rose-100/50 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-rose-500 dark:focus:border-indigo-500 transition-all" placeholder="e.g. Room 302" required />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Day of Week" required>
              <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all appearance-none" required>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Start Time" required>
              <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all" required />
            </FormField>
          </div>

          <FormField label="Session Type" required>
             <div className="flex flex-wrap gap-2">
                {TYPES.map(t => {
                  const active = formData.type === t;
                  return (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} disabled={isSubmitting}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${active ? 'bg-rose-600 dark:bg-indigo-600 border-rose-600 dark:border-indigo-600 text-white shadow-md' : 'bg-rose-50/30 dark:bg-slate-800 border-rose-100/50 dark:border-slate-700 /60 hover:border-rose-300'}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
          </FormField>

          <FormField label="Instructor Name">
            <input type="text" value={formData.instructor || ''} onChange={e => setFormData({ ...formData, instructor: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all" placeholder="e.g. Dr. Sarah Connor" />
          </FormField>

          <FormField label="Additional Notes">
            <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all h-24 resize-none" placeholder="Include any extra details about the class..." />
          </FormField>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-800/20">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-bold /60 hover: dark:hover: transition-all">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-700 dark:hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{editingEntry ? 'Save Changes' : 'Create Session'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black  dark:/50  tracking-widest ml-1">
      {label} {required && <span className="dark:">*</span>}
    </label>
    {children}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export const Timetable: React.FC = () => {
  const { t } = useLanguage();
  const { user, isTeacher, isAdmin } = useAuth();
  const { isOnline, lastSynced, markSynced } = useConnectionStatus();
  const { pendingOperations, addPending, removePending } = useOptimisticUpdates();

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState<FormData>({ day: 'Monday', time: '09:00', subject: '', room: '', type: 'Lecture', instructor: '', description: '', duration: 60, maxCapacity: 30 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingEntry, setViewingEntry] = useState<TimetableEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 12;
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Load data ──
  const loadTimetable = useCallback(async (retryCount = 0) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true); setError(null);

    try {
      const data = await timetableService.getTimetable();
      if (!controller.signal.aborted) {
        if (!data || data.length === 0) {
          setTimetable([
            { id: '1', day: 'Monday',    time: '09:00', subject: 'Data Structures',       room: 'LH-101',          type: 'Lecture',    instructor: 'Dr. Alan Turing',      description: 'Introduction to fundamental data structures',    duration: 60, maxCapacity: 30, currentEnrollment: 25 },
            { id: '2', day: 'Monday',    time: '11:00', subject: 'DBMS Lab',               room: 'Lab-2',           type: 'Lab',        instructor: 'Prof. Ada Lovelace',   description: 'Database management systems practical',          duration: 90, maxCapacity: 25, currentEnrollment: 20 },
            { id: '10', day: 'Monday',   time: '14:00', subject: 'Digital Electronics',    room: 'LH-201',          type: 'Lecture',    instructor: 'Dr. James Chen',       description: 'Fundamentals of digital circuits',               duration: 60, maxCapacity: 40, currentEnrollment: 35 },
            { id: '18', day: 'Monday',   time: '16:00', subject: 'Machine Learning',       room: 'LH-103',          type: 'Lecture',    instructor: 'Dr. Geoffrey Hinton',  duration: 60, maxCapacity: 35, currentEnrollment: 32 },
            
            { id: '19', day: 'Tuesday',  time: '08:30', subject: 'Graph Theory',            room: 'LH-202',          type: 'Lecture',    instructor: 'Prof. Leonhard Euler', duration: 60, maxCapacity: 25, currentEnrollment: 18 },
            { id: '3', day: 'Tuesday',   time: '10:00', subject: 'Operating Systems',      room: 'LH-102',          type: 'Lecture',    instructor: 'Dr. Linus Torvalds',   description: 'Process management and scheduling',              duration: 60, maxCapacity: 30, currentEnrollment: 28 },
            { id: '11', day: 'Tuesday',   time: '12:00', subject: 'Software Engineering',   room: 'LH-105',          type: 'Review',     instructor: 'Prof. Emily Rodriguez', description: 'Software development lifecycle and patterns',    duration: 60, maxCapacity: 30, currentEnrollment: 22 },
            { id: '4', day: 'Tuesday',   time: '14:00', subject: 'Computer Networks',      room: 'LH-101',          type: 'Lecture',    instructor: 'Prof. Tim Berners-Lee', description: 'Network protocols and architectures',           duration: 60, maxCapacity: 30, currentEnrollment: 22 },
            
            { id: '5', day: 'Wednesday', time: '09:00', subject: 'AI & Machine Learning',  room: 'LH-103',          type: 'Lecture',    instructor: 'Dr. Geoffrey Hinton',  description: 'Introduction to artificial intelligence',        duration: 60, maxCapacity: 30, currentEnrollment: 30 },
            { id: '12', day: 'Wednesday', time: '11:00', subject: 'Discrete Mathematics',   room: 'LH-104',          type: 'Lecture',    instructor: 'Dr. James Chen',       description: 'Mathematical structures for computer science',  duration: 60, maxCapacity: 45, currentEnrollment: 40 },
            { id: '6', day: 'Wednesday', time: '13:00', subject: 'Library Hour',           room: 'Central Library', type: 'Self Study', instructor: undefined,              description: 'Independent study and research',                duration: 60, maxCapacity: 50, currentEnrollment: 15 },
            { id: '20', day: 'Wednesday', time: '15:00', subject: 'Human-Computer Interaction', room: 'Lab-5',   type: 'Activity',   instructor: 'Dr. Don Norman',        duration: 90, maxCapacity: 30, currentEnrollment: 24 },
            
            { id: '13', day: 'Thursday',  time: '09:00', subject: 'Microprocessors',        room: 'Lab-3',           type: 'Lab',        instructor: 'Dr. Sarah Williams',    description: 'Architecture and programming of microprocessors', duration: 120, maxCapacity: 20, currentEnrollment: 18 },
            { id: '7', day: 'Thursday',  time: '11:00', subject: 'Web Technologies',       room: 'Lab-1',           type: 'Lab',        instructor: 'Prof. Tim Berners-Lee', description: 'Modern web development frameworks',             duration: 90, maxCapacity: 25, currentEnrollment: 18 },
            { id: '21', day: 'Thursday',  time: '13:00', subject: 'Parallel Computing',      room: 'LH-304',          type: 'Lecture',    instructor: 'Dr. Gene Amdahl',      duration: 60, maxCapacity: 30, currentEnrollment: 12 },
            { id: '14', day: 'Thursday',  time: '14:00', subject: 'Theory of Computation',  room: 'LH-102',          type: 'Lecture',    instructor: 'Dr. Alan Turing',      description: 'Automata theory and formal languages',           duration: 60, maxCapacity: 30, currentEnrollment: 15 },
            
            { id: '22', day: 'Friday',    time: '09:00', subject: 'Ethics in Tech',          room: 'Seminar Hall',    type: 'Review',     instructor: 'Dr. Timnit Gebru',      duration: 60, maxCapacity: 100, currentEnrollment: 85 },
            { id: '8', day: 'Friday',    time: '10:00', subject: 'Project Review',         room: 'Conference Room', type: 'Review',     instructor: 'Dr. Alan Turing',      description: 'Q&A and project discussion',                    duration: 60, maxCapacity: 20, currentEnrollment: 12 },
            { id: '15', day: 'Friday',    time: '13:00', subject: 'Cloud Computing',        room: 'LH-301',          type: 'Lecture',    instructor: 'Prof. Emily Rodriguez', description: 'Virtualization and cloud infrastructure',        duration: 60, maxCapacity: 40, currentEnrollment: 30 },
            { id: '9', day: 'Friday',    time: '15:00', subject: 'Sports & Recreation',    room: 'Sports Ground',   type: 'Activity',   instructor: 'Coach Johnson',        description: 'Physical education and team sports',            duration: 60, maxCapacity: 40, currentEnrollment: 35 },
            
            { id: '16', day: 'Saturday',  time: '10:00', subject: 'Cybersecurity',          room: 'LH-103',          type: 'Lecture',    instructor: 'Dr. James Chen',       description: 'Network security and ethical hacking',           duration: 120, maxCapacity: 30, currentEnrollment: 25 },
            { id: '17', day: 'Saturday',  time: '14:00', subject: 'Mobile App Dev',         room: 'Lab-4',           type: 'Activity',   instructor: 'Prof. Emily Rodriguez', description: 'Building iOS and Android applications',        duration: 120, maxCapacity: 25, currentEnrollment: 20 },
            { id: '23', day: 'Saturday',  time: '16:30', subject: 'Soft Skills Workshop',    room: 'Hall B',          type: 'Activity',   instructor: 'Dr. Dale Carnegie',    duration: 90, maxCapacity: 50, currentEnrollment: 42 },
            
            { id: '24', day: 'Sunday',    time: '10:00', subject: 'Open Source Contribution', room: 'Online',          type: 'Self Study', instructor: 'Community Mentors',   duration: 180, maxCapacity: 100, currentEnrollment: 15 },
            { id: '25', day: 'Sunday',    time: '15:00', subject: 'Weekly Coding Contest',   room: 'Coding Platform', type: 'Review',     instructor: 'CP Experts',           duration: 120, maxCapacity: 500, currentEnrollment: 350 },
          ]);
          toast.success('Sample timetable loaded');
        } else {
          setTimetable(data);
        }
        markSynced(); setError(null);
      }
    } catch (err) {
      if ((err as Error).name === 'CancelError') return;
      const apiError = handleApiError(err);
      setError(apiError);
      if (apiError.code === 'NETWORK_ERROR' && retryCount < 3) {
        toast.error(`Connection failed. Retrying… (${retryCount + 1}/3)`);
        setTimeout(() => loadTimetable(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      toast.error(apiError.message);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) setLoading(false);
    }
  }, [markSynced]);

  useEffect(() => {
    loadTimetable();
    const interval = setInterval(() => { if (isOnline && document.visibilityState === 'visible') loadTimetable(); }, 300000);
    return () => { clearInterval(interval); abortControllerRef.current?.abort(); };
  }, [loadTimetable, isOnline]);

  useEffect(() => {
    const h = () => { if (document.visibilityState === 'visible' && isOnline) loadTimetable(); };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [loadTimetable, isOnline]);

  // ── CRUD ──
  const handleAddEntry = useCallback(() => {
    if (!isTeacher() && !isAdmin()) { toast.error('Only teachers can edit the timetable'); return; }
    setEditingEntry(null);
    setFormData({ day: 'Monday', time: '09:00', subject: '', room: '', type: 'Lecture', instructor: user?.name || '', description: '', duration: 60, maxCapacity: 30 });
    setShowForm(true);
  }, [isTeacher, isAdmin, user?.name]);

  const handleEditEntry = useCallback((entry: TimetableEntry) => {
    if (!isTeacher() && !isAdmin()) { toast.error('Only teachers can edit the timetable'); return; }
    setEditingEntry(entry);
    setFormData({ day: entry.day, time: entry.time, subject: entry.subject, room: entry.room, type: entry.type, instructor: entry.instructor || '', description: entry.description || '', duration: entry.duration || 60, maxCapacity: entry.maxCapacity || 30 });
    setShowForm(true);
  }, [isTeacher, isAdmin]);

  const handleDeleteEntry = useCallback(async (entry: TimetableEntry) => {
    if (!isTeacher() && !isAdmin()) { toast.error('Only teachers can edit the timetable'); return; }
    if (!confirm(`Delete"${entry.subject}"? This cannot be undone.`)) return;
    addPending(entry.id);
    const prev = [...timetable];
    setTimetable(t => t.filter(e => e.id !== entry.id));
    try {
      await timetableService.deleteTimetableEntry(entry.id);
      toast.success('Entry deleted'); markSynced();
    } catch (err) {
      setTimetable(prev);
      toast.error(handleApiError(err).message);
    } finally { removePending(entry.id); }
  }, [isTeacher, isAdmin, timetable, addPending, removePending, markSynced]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.room.trim()) { toast.error('Please fill in all required fields'); return; }
    setIsSubmitting(true);
    const tempId = editingEntry ? editingEntry.id : `temp-${Date.now()}`;
    if (!editingEntry) addPending(tempId);
    const prevData = [...timetable];
    if (editingEntry) {
      setTimetable(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...formData } : e));
    } else {
      setTimetable(prev => [{ id: tempId, ...formData, currentEnrollment: 0 }, ...prev]);
    }
    try {
      let result;
      if (editingEntry) {
        result = await timetableService.updateTimetableEntry(editingEntry.id, formData);
        toast.success('Entry updated');
      } else {
        result = await timetableService.createTimetableEntry(formData);
        setTimetable(prev => prev.map(e => e.id === tempId ? result : e));
        toast.success('Entry created');
      }
      markSynced(); setShowForm(false); setEditingEntry(null);
    } catch (err) {
      setTimetable(prevData);
      toast.error(handleApiError(err).message);
    } finally {
      setIsSubmitting(false);
      if (!editingEntry) removePending(tempId);
    }
  }, [formData, editingEntry, timetable, addPending, removePending, markSynced]);

  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    try {
      const response: Blob | string = await timetableService.exportTimetable(format);
      const blob = response instanceof Blob ? response : new Blob([typeof response === 'string' ? response : JSON.stringify(response)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `timetable.${format === 'excel' ? 'xlsx' : 'pdf'}` });
      document.body.appendChild(a); a.click();
      URL.revokeObjectURL(url); document.body.removeChild(a);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) { toast.error(`Export failed: ${handleApiError(err).message}`); }
  }, []);

  // ── Filtering ──
  const filteredTimetable = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return timetable.filter(e => {
      const matchSearch = !s || [e.subject, e.instructor, e.room, e.description].some(v => v?.toLowerCase().includes(s));
      const matchDay  = filterDay  === 'All' || e.day  === filterDay;
      const matchType = filterType === 'All' || e.type === filterType;
      return matchSearch && matchDay && matchType;
    }).sort((a, b) => {
      const di = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      if (di !== 0) return di;
      // Handle missing time property gracefully
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });
  }, [timetable, searchTerm, filterDay, filterType]);

  const totalPages = Math.ceil(filteredTimetable.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTimetable = filteredTimetable.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = timetable.length;
    const byType: Record<string, number> = {};
    timetable.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
    return { total, byType };
  }, [timetable]);

  // ── Active day tabs for timeline ──
  const activeDaysForTimeline = filterDay !== 'All' ? [filterDay] : undefined;

  if (loading && timetable.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 dark:border-indigo-500" />
        <p className="dark: animate-pulse text-xs font-medium tracking-widest">Loading Timetable Records</p>
      </div>
    );
  }

  return (
    <div className="p-0 max-w-full space-y-10">

      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20  flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>You're offline. Changes will sync when connection is restored.</span>
        </div>
      )}
      {error?.code === 'NETWORK_ERROR' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20  flex items-center gap-2 text-sm">
          <Server className="w-4 h-4 flex-shrink-0" />
          <span>Connection unstable. Retrying…</span>
          <button onClick={() => loadTimetable()} className="ml-auto underline hover: text-xs">Retry now</button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-rose-800 dark:text-white">
            Timetable
          </h1>
          <p className="text-sm /60 dark: mt-2 font-medium">Manage and view scheduled academic sessions.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => loadTimetable()} disabled={loading} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800  hover: dark:hover: hover:bg-rose-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['pdf', 'excel'] as const).map(fmt => (
              <button key={fmt} onClick={() => handleExport(fmt)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold  tracking-wider  hover: dark:hover: transition-all">
                {fmt}
              </button>
            ))}
          </div>

          {(isTeacher() || isAdmin()) && (
            <button onClick={handleAddEntry} className="px-5 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-700 dark:hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/20 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2  group-focus-within: transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-10 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-rose-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-rose-500/5 dark:focus:ring-indigo-500/5 transition-all shadow-sm shadow-slate-200/50 dark:shadow-none"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
          {([['grid', LayoutGrid, 'Grid'], ['timeline', CalendarRange, 'Week'], ['agenda', AlignLeft, 'List']] as const).map(([mode, Icon, label]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-700  dark: shadow-md shadow-slate-200/50 dark:shadow-none' : ' hover: dark:hover:'}`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && error.code !== 'NETWORK_ERROR' && (
        <div className="p-5 rounded-[2rem] bg-red-500/5 border-2 border-red-500/10  dark: flex items-start gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-500">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-[11px] font-black  tracking-[0.2em] mb-1">Authorization Conflict</p>
            <p className="text-sm font-bold  tracking-tight opacity-80">{error.message}</p>
            {error.details && <ul className="mt-2 text-[10px] font-black list-disc list-inside  tracking-widest opacity-60">{Object.entries(error.details).map(([f, m]) => <li key={f}>{f}: {m.join(', ')}</li>)}</ul>}
          </div>
          <button onClick={() => loadTimetable()} className="text-[10px] font-black  tracking-widest px-5 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20">Retry Sync</button>
        </div>
      )}

      {/* ── Day + Type Filters ── */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...DAYS].map((d, i) => (
            <button key={d} onClick={() => { setFilterDay(d); setCurrentPage(1); }}
              className={`flex-shrink-0 px-5 py-2 rounded-2xl text-[11px] font-bold  tracking-wider border-2 transition-all ${filterDay === d ? 'bg-rose-600 dark:bg-indigo-600 border-rose-600 dark:border-indigo-600 text-white shadow-lg shadow-rose-200 dark:shadow-indigo-900/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 /40 dark: hover:border-rose-300 dark:hover:border-slate-700'}`}>
              {d === 'All' ? 'All Days' : DAYS_SHORT[i - 1]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...TYPES].map(type => {
            const active = filterType === type;
            return (
              <button key={type} onClick={() => { setFilterType(type); setCurrentPage(1); }}
                className={`flex-shrink-0 px-5 py-2 rounded-2xl text-[11px] font-bold  tracking-wider border-2 transition-all ${active ? 'bg-rose-600 dark:bg-indigo-600 border-rose-600 dark:border-indigo-600 text-white shadow-lg shadow-rose-200 dark:shadow-indigo-900/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 /40 dark: hover:border-rose-300 dark:hover:border-slate-700'}`}>
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {(filterDay !== 'All' || filterType !== 'All' || searchTerm) && (
        <div className="flex flex-wrap gap-3 items-center ml-2">
          <span className="text-[10px] font-black /40 dark:/40  tracking-[0.2em]">Active Filters</span>
          {searchTerm && <Chip label={searchTerm} onRemove={() => setSearchTerm('')} color="rose" />}
          {filterDay  !== 'All' && <Chip label={filterDay}  onRemove={() => setFilterDay('All')}  color="amber" />}
          {filterType !== 'All' && <Chip label={filterType} onRemove={() => setFilterType('All')} color="blue" />}
          <button onClick={() => { setSearchTerm(''); setFilterDay('All'); setFilterType('All'); setCurrentPage(1); }} className="text-[10px] font-black  hover: underline underline-offset-4  tracking-widest transition-all">Clear Filters</button>
          <div className="ml-auto text-[10px] font-black /40 dark:/40  tracking-widest">{filteredTimetable.length} Class{filteredTimetable.length !== 1 ? 'es' : ''}</div>
        </div>
      )}

      {/* ── Content ── */}
      {filteredTimetable.length === 0 ? (
        <EmptyState hasFilters={!!(searchTerm || filterDay !== 'All' || filterType !== 'All')} onReset={() => { setSearchTerm(''); setFilterDay('All'); setFilterType('All'); }} onAdd={handleAddEntry} canAdd={isTeacher() || isAdmin()} />
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedTimetable.map(entry => (
                  <TimetableCard key={entry.id} entry={entry} onEdit={handleEditEntry} onDelete={handleDeleteEntry} onView={setViewingEntry} isPending={pendingOperations.has(entry.id)} />
                ))}
              </div>
              {totalPages > 1 && <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} showing={{ start: startIndex + 1, end: Math.min(startIndex + itemsPerPage, filteredTimetable.length), total: filteredTimetable.length }} />}
            </>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <WeeklyTimeline entries={filteredTimetable} onView={setViewingEntry} pendingOperations={pendingOperations} activeDays={activeDaysForTimeline} />
          )}

          {/* Agenda View */}
          {viewMode === 'agenda' && (
            <AgendaView entries={filteredTimetable} onEdit={handleEditEntry} onDelete={handleDeleteEntry} onView={setViewingEntry} pendingOperations={pendingOperations} />
          )}
        </>
      )}

      {/* ── Modals ── */}
      {viewingEntry && (
        <ViewDetailModal entry={viewingEntry} onClose={() => setViewingEntry(null)} onEdit={handleEditEntry} onDelete={handleDeleteEntry} canEdit={isTeacher() || isAdmin()} />
      )}

       {showForm && (
        <EntryFormModal editingEntry={editingEntry} formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} onClose={() => !isSubmitting && setShowForm(false)} isSubmitting={isSubmitting} />
      )}
    </div>
  );
};

// ─── Small reusable pieces ───────────────────────────────────────────────────
const Chip: React.FC<{ label: string; onRemove: () => void; color: 'rose' | 'amber' | 'blue' }> = ({ label, onRemove, color }) => {
  const colorClasses = {
    rose: 'bg-rose-100/50  border-rose-200/50 dark:bg-rose-950/20 dark: dark:border-rose-900/30',
    amber: 'bg-amber-100/50  border-amber-200/50 dark:bg-amber-950/20 dark: dark:border-amber-900/30',
    blue: 'bg-blue-100/50  border-blue-200/50 dark:bg-indigo-950/20 dark: dark:border-indigo-900/30',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black  tracking-widest border transition-all hover:scale-105 ${colorClasses[color]}`}>
      {label}
      <button onClick={onRemove} className="hover: dark:hover: transition-colors p-0.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

const EmptyState: React.FC<{ hasFilters: boolean; onReset: () => void; onAdd: () => void; canAdd: boolean }> = ({ hasFilters, onReset, onAdd, canAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl group">
    <div className="w-20 h-20 rounded-2xl bg-white/50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
      <CalendarRange className="w-8 h-8  dark:" />
    </div>
    <h3 className="text-xl font-bold   mb-2  tracking-tight">
      {hasFilters ? 'No Results Found' : 'Schedule is Empty'}
    </h3>
    <p className="text-sm  dark: mb-8 max-w-sm font-medium">
      {hasFilters 
        ?"We couldn't find any classes matching your criteria. Try adjusting your filters." 
        :"There are no academic sessions scheduled at the moment."}
    </p>
    <div className="flex gap-4">
      {hasFilters && (
        <button 
          onClick={onReset} 
          className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800  dark: text-xs font-bold hover:bg-white dark:hover:bg-slate-800 transition-all font-bold"
        >
          Clear Filters
        </button>
      )}
      {canAdd && (
        <button 
          onClick={onAdd} 
          className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Class</span>
        </button>
      )}
    </div>
  </div>
);


const Pagination: React.FC<{ current: number; total: number; onChange: (p: number) => void; showing: { start: number; end: number; total: number } }> = ({ current, total, onChange, showing }) => {
  const pages = Array.from({ length: Math.min(5, total) }, (_, i) => {
    if (total <= 5) return i + 1;
    if (current <= 3) return i + 1;
    if (current >= total - 2) return total - 4 + i;
    return current - 2 + i;
  });

  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <p className="text-xs font-semibold   tracking-wider">Showing {showing.start}–{showing.end} of {showing.total} Classes</p>
      <div className="flex items-center gap-2">
        <PagBtn onClick={() => onChange(current - 1)} disabled={current === 1}><ChevronLeft className="w-4 h-4" /></PagBtn>
        {pages.map(p => (
          <PagBtn key={p} onClick={() => onChange(p)} active={current === p}>{p}</PagBtn>
        ))}
        <PagBtn onClick={() => onChange(current + 1)} disabled={current === total}><ChevronRight className="w-4 h-4" /></PagBtn>
      </div>
    </div>
  );
};

const PagBtn: React.FC<{ key?: React.Key; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }> = ({ onClick, disabled, active, children }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all border ${active ? 'bg-rose-600 dark:bg-indigo-600 border-rose-600 dark:border-indigo-600 text-white shadow-md scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700  hover:border-rose-400 dark:hover:border-slate-500'} disabled:opacity-30 disabled:cursor-not-allowed`}>
    {children}
  </button>
);