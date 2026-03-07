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
  bg: string; text: string; border: string; accent: string; solidBg: string;
  barColor: string; icon: React.ElementType; label: string;
}> = {
  'Lecture':    { bg: 'bg-rose-500/10',   text: 'text-rose-700 dark:text-blue-400',   border: 'border-rose-200 dark:border-blue-500/20',   accent: 'bg-rose-500',   solidBg: 'bg-rose-500/20',   barColor: '#e11d48', icon: BookOpen,       label: 'Lecture'    },
  'Lab':        { bg: 'bg-amber-500/10', text: 'text-amber-800 dark:text-amber-400', border: 'border-amber-200 dark:border-blue-500/20', accent: 'bg-amber-500', solidBg: 'bg-amber-500/20', barColor: '#d97706', icon: FlaskConical,   label: 'Lab'        },
  'Self Study': { bg: 'bg-rose-400/10',  text: 'text-rose-600 dark:text-blue-300',  border: 'border-rose-100 dark:border-blue-500/10',  accent: 'bg-rose-400',  solidBg: 'bg-rose-400/20',  barColor: '#fb7185', icon: Coffee,         label: 'Self Study' },
  'Review':     { bg: 'bg-blue-500/10',  text: 'text-blue-700 dark:text-blue-300',  border: 'border-blue-200 dark:border-blue-500/20',  accent: 'bg-blue-500',  solidBg: 'bg-blue-500/20',  barColor: '#3b82f6', icon: ClipboardCheck, label: 'Review'     },
  'Activity':   { bg: 'bg-pink-500/10',   text: 'text-pink-700 dark:text-pink-400',   border: 'border-pink-200 dark:border-pink-500/20',   accent: 'bg-pink-500',   solidBg: 'bg-pink-500/20',   barColor: '#db2777', icon: Zap,            label: 'Activity'   },
};
const getType = (type: string) => TYPE_CONFIG[type] ?? { bg: 'bg-rose-50 dark:bg-slate-900', text: 'text-rose-900 dark:text-blue-400', border: 'border-rose-200 dark:border-blue-500/20', accent: 'bg-rose-500 dark:bg-blue-600', solidBg: 'bg-rose-100 dark:bg-blue-900/20', barColor: '#9f1239', icon: Calendar, label: type };

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
  const [h, m] = time.split(':');
  if (!h || !m) return time;
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
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
    <span className={`inline-flex items-center gap-1.5 rounded-xl border font-black uppercase tracking-widest shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border} ${size === 'sm' ? 'px-2.5 py-1 text-[9px]' : 'px-4 py-1.5 text-[11px]'}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {type}
    </span>
  );
};

// ─── EnrollmentBar ──────────────────────────────────────────────────────────
const EnrollmentBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const pct = Math.min((current / max) * 100, 100);
  const full = current >= max;
  return (
     <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span className="text-rose-400 dark:text-blue-700">Utilization Stream</span>
        <span className={full ? 'text-rose-600 dark:text-blue-400 animate-pulse' : 'text-rose-800 dark:text-blue-500'}>{current}/{max}{full && ' · Saturated'}</span>
      </div>
      <div className="h-2 bg-rose-500/5 dark:bg-blue-500/5 rounded-full overflow-hidden border border-rose-500/10 dark:border-blue-500/10 backdrop-blur-md">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(225,29,72,0.4)] ${full ? 'bg-rose-600 dark:bg-blue-600' : pct > 80 ? 'bg-rose-500 dark:bg-pink-500' : 'bg-rose-400 dark:bg-blue-500'}`} style={{ width: `${pct}%` }} />
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

  return (
    <div
      className={`relative rounded-[2.5rem] border p-1 group transition-all duration-500 cursor-pointer shadow-xl shadow-rose-200/5 ${isPending ? 'opacity-50 pointer-events-none' : ''} bg-amber-50/40 dark:bg-slate-900/40 border-rose-100 dark:border-blue-500/10 hover:border-rose-300 dark:hover:border-blue-500/50 backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-300/20 dark:hover:shadow-blue-500/10`}
      onClick={() => onView(entry)}
    >
       <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 rounded-xl bg-white/40 dark:bg-blue-500/10 border border-rose-100 dark:border-blue-500/20 text-[10px] font-black text-rose-800 dark:text-blue-400 tabular-nums uppercase tracking-widest shadow-sm backdrop-blur-md">
          {formatTime(entry.time)}
        </span>
      </div>

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <TypeBadge type={entry.type} />
          <div className="relative" ref={actionsRef} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-xl bg-rose-100 dark:bg-white/5 text-rose-600 dark:text-slate-500 hover:text-rose-800 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-[1.5rem] bg-white/90 dark:bg-slate-900/90 border border-rose-100 dark:border-blue-500/20 shadow-2xl z-30 backdrop-blur-2xl p-2 animate-in zoom-in-95 duration-200">
                <div className="space-y-1">
                  <button onClick={() => { onView(entry); setShowActions(false); }} className="w-full px-4 py-3 text-left text-[10px] font-black text-rose-950 dark:text-blue-300 hover:bg-rose-500/10 dark:hover:bg-blue-500/10 flex items-center gap-3 transition-all rounded-xl uppercase tracking-widest group/item">
                    <Info className="w-4 h-4 text-rose-500 dark:text-blue-400 group-hover/item:scale-110 transition-transform" /> View Details
                  </button>
                  {(isTeacher() || isAdmin()) && (
                    <>
                      <button onClick={() => { onEdit(entry); setShowActions(false); }} className="w-full px-4 py-3 text-left text-[10px] font-black text-rose-950 dark:text-blue-300 hover:bg-rose-500/10 dark:hover:bg-blue-500/10 flex items-center gap-3 transition-all rounded-xl uppercase tracking-widest group/item">
                        <Edit className="w-4 h-4 text-rose-500 dark:text-blue-400 group-hover/item:scale-110 transition-transform" /> Edit Class
                      </button>
                      <div className="mx-2 my-2 border-t border-rose-100 dark:border-blue-500/10" />
                      <button onClick={() => { onDelete(entry); setShowActions(false); }} className="w-full px-4 py-3 text-left text-[10px] font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-all rounded-xl uppercase tracking-widest group/item">
                        <Trash2 className="w-4 h-4 group-hover/item:scale-110 transition-transform" /> Delete Class
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-black text-rose-950 dark:text-blue-300 mb-4 uppercase tracking-tight group-hover:text-rose-600 dark:group-hover:text-blue-400 transition-colors pr-12 leading-tight">{entry.subject}</h3>

         <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-[9px] font-black text-rose-700/60 dark:text-blue-800 uppercase tracking-widest">
            <Clock className="w-4 h-4 text-rose-400 dark:text-blue-700 flex-shrink-0" />
            <span className="tabular-nums">{entry.time}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-rose-700/60 dark:text-blue-800 uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-rose-400 dark:text-blue-700 flex-shrink-0" />
            <span className="truncate">{entry.room}</span>
          </div>
          {entry.instructor && (
            <div className="flex items-center gap-2 text-[9px] font-black text-rose-700/60 dark:text-blue-800 uppercase tracking-widest col-span-2">
            <User className="w-4 h-4 text-rose-400 dark:text-blue-700 flex-shrink-0" />
            <span className="truncate">{entry.instructor}</span>
          </div>
          )}
        </div>

        {entry.maxCapacity && entry.currentEnrollment !== undefined && (
          <div className="mt-4 pt-4 border-t border-rose-100/50 dark:border-white/5">
            <EnrollmentBar current={entry.currentEnrollment} max={entry.maxCapacity} />
          </div>
        )}
      </div>
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
  
  // Format time range
  const endTimeMinutes = timeToMinutes(entry.time) + duration;
  const endTimeHours = Math.floor(endTimeMinutes / 60);
  const endTimeMins = endTimeMinutes % 60;
  const endTimeStr = `${String(endTimeHours).padStart(2, '0')}:${String(endTimeMins).padStart(2, '0')}`;

  return (
    <div
      className={`absolute left-1 right-1 rounded-2xl border-2 cursor-pointer hover:z-30 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ${cfg.solidBg} ${cfg.border} overflow-hidden shadow-xl shadow-rose-900/5 backdrop-blur-md ${isPending ? 'opacity-50' : ''}`}
      style={{ top: `${top}px`, height: `${height}px`, minHeight: '32px' }}
      onClick={() => onView(entry)}
      title={`${entry.subject} · ${entry.time}-${endTimeStr}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${cfg.accent} shadow-[0_0_15px_rgba(225,29,72,0.4)]`} />
      <div className="pl-4 pr-3 py-2 h-full flex flex-col justify-center gap-1">
        <p className="text-[11px] font-black text-rose-950 dark:text-blue-200 leading-tight uppercase tracking-[0.1em] truncate">{entry.subject}</p>
        <div className="flex items-center gap-2.5">
          <span className={`text-[9px] font-black ${cfg.text} tabular-nums uppercase tracking-widest`}>{entry.time}</span>
          {height > 40 && entry.room && (
            <span className="text-[9px] font-black text-rose-900/40 dark:text-blue-800 uppercase tracking-[0.2em] truncate">• {entry.room}</span>
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
    <div className="rounded-[3.5rem] border-2 border-rose-100 dark:border-blue-500/10 bg-white/40 dark:bg-slate-900/40 overflow-hidden shadow-2xl shadow-rose-900/5 backdrop-blur-2xl">
      {/* Day header */}
      <div className="flex border-b-2 border-rose-100 dark:border-blue-500/20 bg-rose-50/30 dark:bg-blue-900/10">
        <div className="w-20 flex-shrink-0 border-r-2 border-rose-100 dark:border-blue-500/20 p-5 flex items-center justify-center">
          <Clock className="w-5 h-5 text-rose-400 dark:text-blue-700" />
        </div>
        {visibleDays.map((day, i) => {
          const count = byDay[day]?.length ?? 0;
          const isToday = day === currentDay;
          return (
            <div key={day} className={`flex-1 min-w-[140px] text-center py-3.5 border-r border-rose-100 dark:border-blue-500/10 last:border-r-0 ${isToday ? 'bg-rose-500/5 dark:bg-blue-500/5' : ''}`}>
              <p className={`text-[12px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-rose-600 dark:text-blue-400' : 'text-rose-900 dark:text-blue-300'}`}>
                {day.substring(0, 3)}
                {isToday && <span className="ml-2 w-2 h-2 rounded-full bg-rose-500 dark:bg-blue-500 inline-block animate-pulse" />}
              </p>
              {count > 0 && <p className="text-[9px] font-black text-rose-700/30 dark:text-blue-800 mt-1.5 uppercase tracking-widest">{count} Class{count !== 1 ? 'es' : ''}</p>}
            </div>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '650px' }}>
        <div className="flex relative">
          {/* Time axis */}
          <div className="w-20 flex-shrink-0 border-r-2 border-rose-100 dark:border-blue-500/20 relative bg-rose-50/20 dark:bg-blue-900/5" style={{ height: `${totalHeight}px` }}>
            {Array.from({ length: hourCount }, (_, i) => {
              const hour = TIMELINE_START_HOUR + i;
              return (
                <div key={hour} className="absolute w-full flex items-start justify-center pt-2 border-b border-rose-100/40 dark:border-blue-500/10" style={{ top: `${i * TIMELINE_HOUR_PX}px`, height: `${TIMELINE_HOUR_PX}px` }}>
                  <span className="text-[10px] font-black text-rose-800/30 dark:text-blue-800 tabular-nums uppercase tracking-tight">{String(hour).padStart(2, '0')}:00</span>
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {visibleDays.map((day, i) => {
            const isToday = day === currentDay;
            return (
              <div key={day} className={`flex-1 min-w-[140px] relative border-r border-rose-100 dark:border-blue-500/10 last:border-r-0 ${isToday ? 'bg-rose-500/[0.02] dark:bg-blue-500/[0.02]' : ''}`} style={{ height: `${totalHeight}px` }}>
                {/* Hour grid lines */}
                {Array.from({ length: hourCount }, (_, j) => (
                  <div key={j} className="absolute left-0 right-0 border-t border-rose-50 dark:border-blue-500/[0.05]" style={{ top: `${j * TIMELINE_HOUR_PX}px` }} />
                ))}
                
                {/* Current time indicator */}
                {isToday && currentTimeTop >= 0 && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimeTop}px` }}>
                    <div className="flex items-center -translate-y-1/2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 dark:bg-blue-500 shadow-lg shadow-rose-500/50 dark:shadow-blue-500/50 -ml-1.5" />
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-rose-500 to-transparent dark:from-blue-500 dark:to-transparent" />
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
    <div className="space-y-12">
      {DAYS.map(day => {
        const dayEntries = byDay[day] || [];
        if (dayEntries.length === 0) return null;
        return (
           <div key={day} className="space-y-6">
            <h2 className="text-lg font-black text-rose-800 dark:text-blue-400 uppercase tracking-widest flex items-center gap-4">
              <span className="w-12 h-1 bg-gradient-to-r from-rose-600 to-transparent dark:from-blue-600 dark:to-transparent rounded-full" />
              {day}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
  const TIcon = cfg.icon; // Assuming TIcon is derived from cfg.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-rose-950/20 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 border-2 border-rose-100 dark:border-blue-500/20 rounded-[3.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl">
      <div className={`h-28 flex items-center justify-between px-6 relative overflow-hidden ${cfg.solidBg}`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
        <div className="relative z-10 flex items-center gap-5">
          <div className={`w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center ${cfg.text}`}>
            <TIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-rose-950 dark:text-white uppercase tracking-tighter leading-none mb-1">{entry.subject}</h2>
            <p className="text-[10px] font-black text-rose-800/40 dark:text-blue-800 uppercase tracking-widest">{entry.type} · Temporal Signature</p>
          </div>
        </div>
        <button onClick={onClose} className="relative z-10 w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 hover:bg-white transition-all text-rose-950 shadow-sm"><X className="w-5 h-5" /></button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <InfoItem icon={Clock} label="Time" value={`${entry.time} (${entry.day})`} />
          <InfoItem icon={MapPin} label="Location" value={entry.room} />
          {entry.instructor && <InfoItem icon={User} label="Primary Facilitator" value={entry.instructor} />}
          <InfoItem icon={Calendar} label="Status" value="Active Stream" />
        </div>

        {entry.description && (
          <div className="p-8 bg-rose-50/50 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-[2.5rem]">
            <p className="text-[10px] font-black text-rose-400 dark:text-blue-700 uppercase tracking-widest mb-3">Class Log</p>
            <p className="text-sm font-bold text-rose-900/80 dark:text-blue-300 leading-relaxed uppercase tracking-tight">{entry.description}</p>
          </div>
        )}

        <div className="bg-rose-500/5 dark:bg-blue-500/5 p-6 rounded-3xl border border-rose-100/50 dark:border-blue-500/10 flex items-center justify-between">
          <EnrollmentBar current={entry.currentEnrollment || 0} max={entry.maxCapacity || 40} />
          <div className="flex gap-4 ml-10">
            {canEdit && (
              <>
                <button onClick={() => { onEdit(entry); onClose(); }} className="w-10 h-10 rounded-2xl border-2 border-rose-100 dark:border-blue-500/20 flex items-center justify-center text-rose-600 dark:text-blue-400 hover:bg-white dark:hover:bg-blue-500/20 transition-all shadow-sm"><Edit className="w-5 h-5" /></button>
                <button onClick={() => { if(confirm('Dissolve this session?')) { onDelete(entry); onClose(); } }} className="w-10 h-10 rounded-2xl border-2 border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button>
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
      <Icon className="w-4 h-4 text-rose-400 dark:text-blue-500" />
      <span className="text-[10px] font-black text-rose-800/40 dark:text-blue-700/40 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-black text-rose-900 dark:text-blue-300 uppercase tracking-tight ml-6">{value}</p>
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
  const cfg = getType(formData.type);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-rose-950/20 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={onSubmit} className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-rose-100 dark:border-blue-500/20 rounded-[3.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl">
        <div className="h-28 flex items-center justify-between px-6 border-b-2 border-rose-50 dark:border-blue-500/10 bg-rose-50/30 dark:bg-blue-900/10">
          <div>
            <h2 className="text-3xl font-black text-rose-950 dark:text-blue-300 uppercase tracking-tighter leading-none mb-1">{editingEntry ? 'Edit Class' : 'New Class'}</h2>
            <p className="text-[10px] font-black text-rose-800/40 dark:text-blue-800 uppercase tracking-widest">Class Details</p>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 hover:bg-white transition-all text-rose-950 shadow-sm"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <FormField label="Subject" required>
            <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-6 py-2.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-950 dark:text-blue-200 focus:border-rose-300 dark:focus:border-blue-500/40 outline-none transition-all shadow-inner" placeholder="E.G. DATA STRUCTURES..." required />
          </FormField>
          <FormField label="Room" required>
            <input type="text" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full px-6 py-2.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-950 dark:text-blue-200 focus:border-rose-300 dark:focus:border-blue-500/40 outline-none transition-all shadow-inner" placeholder="E.G. HALL C-12..." required />
          </FormField>
          <FormField label="Day" required>
            <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full px-6 py-2.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-950 dark:text-blue-200 focus:border-rose-300 dark:focus:border-blue-500/40 outline-none transition-all appearance-none shadow-inner" required>
              {DAYS.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-900">{d.toUpperCase()}</option>)}
            </select>
          </FormField>
          <FormField label="Time" required>
            <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full px-6 py-2.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-950 dark:text-blue-200 focus:border-rose-300 dark:focus:border-blue-500/40 outline-none transition-all shadow-inner" required />
          </FormField>
          <FormField label="Type" required>
             <div className="flex flex-wrap gap-3">
                {TYPES.map(t => {
                  const tc = getType(t);
                  const active = formData.type === t;
                  const TIcon = tc.icon;
                  return (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} disabled={isSubmitting}
                      className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all duration-300 flex items-center gap-2 ${active ? `${tc.solidBg} ${tc.text} ${tc.border} shadow-lg shadow-rose-200/20 dark:shadow-blue-900/40 transform scale-105` : 'bg-rose-500/5 dark:bg-blue-500/5 text-rose-700/40 dark:text-blue-800 border-rose-100 dark:border-blue-500/10 hover:border-rose-300 dark:hover:border-blue-500/40'}`}>
                      <TIcon className="w-4 h-4" />
                      {t}
                    </button>
                  );
                })}
              </div>
          </FormField>
          <FormField label="Instructor">
            <input type="text" value={formData.instructor || ''} onChange={e => setFormData({ ...formData, instructor: e.target.value })} className="w-full px-6 py-2.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-950 dark:text-blue-200 focus:border-rose-300 dark:focus:border-blue-500/40 outline-none transition-all shadow-inner" placeholder="DR. STARK..." />
          </FormField>
          <div className="col-span-2">
            <FormField label="Description">
              <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-6 py-2.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-950 dark:text-blue-200 focus:border-rose-300 dark:focus:border-blue-500/40 outline-none transition-all h-24 resize-none shadow-inner" placeholder="ADDITIONAL DATA..." />
            </FormField>
          </div>
        </div>

        <div className="p-6 border-t-2 border-rose-50 dark:border-blue-500/10 flex justify-end gap-5 bg-rose-50/20 dark:bg-blue-900/5">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-800 dark:text-blue-400 hover:bg-white dark:hover:bg-blue-500/10 transition-all border-2 border-transparent">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-12 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-200 dark:shadow-blue-900/40 flex items-center gap-4 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            <span>{editingEntry ? 'Update Class' : 'Save Entry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-rose-800 dark:text-blue-500/50 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-rose-500 dark:text-blue-500">*</span>}
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
            { id: '2', day: 'Monday',    time: '11:00', subject: 'DBMS Lab',               room: 'Lab-2',           type: 'Lab',        instructor: 'Prof. Linus Torvalds', description: 'Database management systems practical',          duration: 90, maxCapacity: 25, currentEnrollment: 20 },
            { id: '3', day: 'Tuesday',   time: '10:00', subject: 'Operating Systems',      room: 'LH-102',          type: 'Lecture',    instructor: 'Dr. Linus Torvalds',   description: 'Process management and scheduling',              duration: 60, maxCapacity: 30, currentEnrollment: 28 },
            { id: '4', day: 'Tuesday',   time: '14:00', subject: 'Computer Networks',      room: 'LH-101',          type: 'Lecture',    instructor: 'Prof. Tim Berners-Lee', description: 'Network protocols and architectures',           duration: 60, maxCapacity: 30, currentEnrollment: 22 },
            { id: '5', day: 'Wednesday', time: '09:00', subject: 'AI & Machine Learning',  room: 'LH-103',          type: 'Lecture',    instructor: 'Dr. Geoffrey Hinton',  description: 'Introduction to artificial intelligence',        duration: 60, maxCapacity: 30, currentEnrollment: 30 },
            { id: '6', day: 'Wednesday', time: '13:00', subject: 'Library Hour',           room: 'Central Library', type: 'Self Study', instructor: undefined,              description: 'Independent study and research',                duration: 60, maxCapacity: 50, currentEnrollment: 15 },
            { id: '7', day: 'Thursday',  time: '11:00', subject: 'Web Technologies',       room: 'Lab-1',           type: 'Lab',        instructor: 'Prof. Tim Berners-Lee', description: 'Modern web development frameworks',             duration: 90, maxCapacity: 25, currentEnrollment: 18 },
            { id: '8', day: 'Friday',    time: '10:00', subject: 'Project Review',         room: 'Conference Room', type: 'Review',     instructor: 'Dr. Alan Turing',      description: 'Q&A and project discussion',                    duration: 60, maxCapacity: 20, currentEnrollment: 12 },
            { id: '9', day: 'Friday',    time: '15:00', subject: 'Sports & Recreation',    room: 'Sports Ground',   type: 'Activity',   instructor: 'Coach Johnson',        description: 'Physical education and team sports',            duration: 60, maxCapacity: 40, currentEnrollment: 35 },
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
    if (!confirm(`Delete "${entry.subject}"? This cannot be undone.`)) return;
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
      <div className="flex flex-col items-center justify-center h-64 gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <Loader2 className="w-5 h-5 animate-spin text-rose-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-rose-800 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 max-w-full space-y-5">

      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>You're offline. Changes will sync when connection is restored.</span>
        </div>
      )}
      {error?.code === 'NETWORK_ERROR' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2 text-sm">
          <Server className="w-4 h-4 flex-shrink-0" />
          <span>Connection unstable. Retrying…</span>
          <button onClick={() => loadTimetable()} className="ml-auto underline hover:text-amber-300 text-xs">Retry now</button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 mb-5">
        <div className="flex-1">
           <div className="flex items-center gap-5 mb-4">
            <div className="w-16 h-16 rounded-[3rem] bg-gradient-to-br from-rose-500 to-pink-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-2xl shadow-rose-900/10 dark:shadow-blue-900/40 p-1 ring-4 ring-rose-500/10 dark:ring-blue-500/10">
               <div className="w-full h-full rounded-[2.8rem] border-2 border-white/40 flex items-center justify-center">
                <CalendarRange className="w-10 h-10 text-white" />
               </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-rose-950 dark:text-blue-300 uppercase tracking-tighter leading-[0.85] mb-2">Timetable</h1>
              <div className="flex items-center gap-3 text-[10px] font-black text-rose-600/40 dark:text-blue-800 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1.5 bg-rose-500/5 dark:bg-blue-500/10 px-3 py-1 rounded-lg border border-rose-500/10 dark:border-blue-500/10">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   System Online
                </span>
                <span>•</span>
                <span className="text-rose-950 dark:text-blue-300">{stats.total} sessions synced</span>
                <span>•</span>
                <span className="text-rose-600 dark:text-blue-600">v2.4.0-STABLE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => loadTimetable()} disabled={loading} className="w-8 h-8 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 border border-rose-100 dark:border-blue-500/20 rounded-xl text-rose-600 dark:text-blue-400 hover:bg-rose-50 dark:hover:bg-blue-500/20 transition-all disabled:opacity-50 shadow-sm group" title="Refresh Schedule">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>

            <div className="flex gap-1 bg-white/50 dark:bg-slate-800/50 border border-rose-100 dark:border-blue-500/20 rounded-xl p-1 shadow-sm">
              {(['pdf', 'excel'] as const).map(fmt => (
                <button key={fmt} onClick={() => handleExport(fmt)} className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-rose-700/60 dark:text-blue-400/60 hover:text-rose-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-blue-500/20 transition-all">
                  {fmt}
                </button>
              ))}
            </div>

            {(isTeacher() || isAdmin()) && (
              <button onClick={handleAddEntry} className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-md flex items-center gap-2 group">
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                <span>Add Class</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
             {Object.entries(stats.byType).filter(([type]) => type && type !== 'undefined').map(([type, count]) => {
              const c = getType(type);
              const TIcon = c.icon;
              return (
                <div key={type} className="bg-white/40 dark:bg-slate-900/40 px-6 py-3.5 rounded-[2.5rem] border border-rose-100 dark:border-blue-500/10 backdrop-blur-xl shadow-xl shadow-rose-900/5 transition-all hover:-translate-y-2 group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 dark:bg-blue-500/5 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                   <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-10 h-10 ${c.bg} rounded-[1.25rem] flex items-center justify-center ${c.text} group-hover:scale-110 transition-transform border border-rose-500/10 dark:border-blue-500/10`}>
                      <TIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-700/40 dark:text-blue-800">{type}</p>
                      <p className="text-xl font-black text-rose-950 dark:text-blue-300 tabular-nums leading-none mt-1">{count}</p>
                    </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 p-5 rounded-[3rem] border border-rose-100 dark:border-blue-500/10 backdrop-blur-xl shadow-2xl shadow-rose-900/5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-5 flex-1">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-400 dark:text-blue-800 w-5 h-5 transition-all group-focus-within:text-rose-600 dark:group-focus-within:text-blue-400 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="SEARCH CLASSES..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-16 pr-14 py-3.5 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-rose-950 dark:text-blue-200 placeholder:text-rose-200 dark:placeholder-blue-900 outline-none focus:border-rose-300 dark:focus:border-blue-500/40 transition-all shadow-inner"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 p-2 bg-rose-500/5 dark:bg-blue-500/5 border border-rose-100 dark:border-blue-500/10 rounded-[1.5rem]">
              {([['grid', LayoutGrid, 'GRID'], ['timeline', CalendarRange, 'WEEK'], ['agenda', AlignLeft, 'LIST']] as const).map(([mode, Icon, label]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === mode ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl shadow-rose-200 dark:shadow-blue-900/40 ring-1 ring-white/20' : 'text-rose-400 dark:text-blue-800 hover:text-rose-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && error.code !== 'NETWORK_ERROR' && (
        <div className="p-5 rounded-[2rem] bg-red-500/5 border-2 border-red-500/10 text-red-600 dark:text-red-400 flex items-start gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-500">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1">Authorization Conflict</p>
            <p className="text-sm font-bold uppercase tracking-tight opacity-80">{error.message}</p>
            {error.details && <ul className="mt-2 text-[10px] font-black list-disc list-inside uppercase tracking-widest opacity-60">{Object.entries(error.details).map(([f, m]) => <li key={f}>{f}: {m.join(', ')}</li>)}</ul>}
          </div>
          <button onClick={() => loadTimetable()} className="text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20">Retry Sync</button>
        </div>
      )}

      {/* ── Day + Type Filters ── */}
      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex items-center gap-2 p-2 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-[2rem] overflow-x-auto scrollbar-none">
          {['All', ...DAYS].map((d, i) => (
            <button key={d} onClick={() => { setFilterDay(d); setCurrentPage(1); }}
              className={`flex-shrink-0 px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filterDay === d ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl shadow-rose-200 dark:shadow-blue-900/40 transform scale-105' : 'text-rose-900/30 dark:text-blue-800 hover:text-rose-600 dark:hover:text-blue-400'}`}>
              {d === 'All' ? 'ALL DAYS' : DAYS_SHORT[i - 1]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 p-2 bg-rose-500/5 dark:bg-blue-500/5 border-2 border-rose-100 dark:border-blue-500/10 rounded-[2rem] overflow-x-auto scrollbar-none">
          {['All', ...TYPES].map(type => {
            const cfg = type !== 'All' ? getType(type) : null;
            const active = filterType === type;
            return (
              <button key={type} onClick={() => { setFilterType(type); setCurrentPage(1); }}
                className={`flex-shrink-0 px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${active && cfg ? `${cfg.solidBg} ${cfg.text} ${cfg.border} shadow-xl transform scale-105` : active ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl shadow-rose-200 dark:shadow-blue-900/40 transform scale-105' : 'text-rose-900/30 dark:text-blue-800 hover:text-rose-600 dark:hover:text-blue-400 border-transparent'}`}>
                {type === 'All' ? 'ALL TYPES' : type}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {(filterDay !== 'All' || filterType !== 'All' || searchTerm) && (
        <div className="flex flex-wrap gap-3 items-center ml-2">
          <span className="text-[10px] font-black text-rose-800/40 dark:text-blue-200/40 uppercase tracking-[0.2em]">Active Filters</span>
          {searchTerm && <Chip label={searchTerm} onRemove={() => setSearchTerm('')} color="rose" />}
          {filterDay  !== 'All' && <Chip label={filterDay}  onRemove={() => setFilterDay('All')}  color="amber" />}
          {filterType !== 'All' && <Chip label={filterType} onRemove={() => setFilterType('All')} color="blue" />}
          <button onClick={() => { setSearchTerm(''); setFilterDay('All'); setFilterType('All'); setCurrentPage(1); }} className="text-[10px] font-black text-rose-600 hover:text-rose-700 underline underline-offset-4 uppercase tracking-widest transition-all">Clear Filters</button>
          <div className="ml-auto text-[10px] font-black text-rose-800/40 dark:text-blue-200/40 uppercase tracking-widest">{filteredTimetable.length} Class{filteredTimetable.length !== 1 ? 'es' : ''}</div>
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
    rose: 'bg-rose-100/50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
    amber: 'bg-amber-100/50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    blue: 'bg-blue-100/50 text-blue-700 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${colorClasses[color]}`}>
      {label}
      <button onClick={onRemove} className="hover:text-rose-900 dark:hover:text-blue-300 transition-colors p-0.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

const EmptyState: React.FC<{ hasFilters: boolean; onReset: () => void; onAdd: () => void; canAdd: boolean }> = ({ hasFilters, onReset, onAdd, canAdd }) => (
  <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-rose-500/5 dark:bg-blue-500/5 border-2 border-dashed border-rose-200 dark:border-blue-500/20 rounded-[4rem] backdrop-blur-xl relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rose,transparent)] dark:bg-[radial-gradient(circle_at_center,blue,transparent)]" />
    <div className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-blue-900/20 border-2 border-rose-100 dark:border-blue-500/20 flex items-center justify-center mb-4 shadow-2xl shadow-rose-900/5 relative z-10">
      <CalendarRange className="w-10 h-10 text-rose-600 dark:text-blue-400" />
    </div>
    <h3 className="text-4xl font-black text-rose-950 dark:text-blue-300 mb-4 uppercase tracking-tighter relative z-10">
      {hasFilters ? 'No Classes Found' : 'No Classes Scheduled'}
    </h3>
    <p className="text-[11px] font-black text-rose-800/30 dark:text-blue-800 mb-5 max-w-sm uppercase tracking-[0.2em] leading-relaxed relative z-10">
      {hasFilters 
        ? "Try adjusting your search or filters to see more results." 
        : "Get started by adding your first class to the timetable."}
    </p>
    <div className="flex gap-5 relative z-10">
      {hasFilters && (
        <button 
          onClick={onReset} 
          className="px-6 py-3.5 rounded-[1.2rem] bg-rose-50 dark:bg-blue-500/10 border-2 border-rose-100 dark:border-blue-500/20 text-rose-800 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white dark:hover:bg-blue-500/20 shadow-sm"
        >
          Clear Filters
        </button>
      )}
      {canAdd && (
        <button 
          onClick={onAdd} 
          className="px-12 py-3.5 rounded-[1.2rem] bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-200 dark:shadow-blue-900/40"
        >
          {hasFilters ? 'Add First Class' : 'Add Record'}
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
    <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-5 p-8 bg-white/40 dark:bg-slate-900/40 border-2 border-rose-100 dark:border-blue-500/10 rounded-[3rem] backdrop-blur-xl shadow-2xl shadow-rose-900/5">
      <p className="text-[10px] font-black text-rose-900/30 dark:text-blue-800 uppercase tracking-[0.2em]">Class Cursor: {showing.start}–{showing.end} of {showing.total} Entities</p>
      <div className="flex items-center gap-3">
        <PagBtn onClick={() => onChange(current - 1)} disabled={current === 1}><ChevronLeft className="w-5 h-5" /></PagBtn>
        {pages.map(p => (
          <PagBtn key={p} onClick={() => onChange(p)} active={current === p}>{p}</PagBtn>
        ))}
        <PagBtn onClick={() => onChange(current + 1)} disabled={current === total}><ChevronRight className="w-5 h-5" /></PagBtn>
      </div>
    </div>
  );
};

const PagBtn: React.FC<{ key?: React.Key; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }> = ({ onClick, disabled, active, children }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-10 h-10 rounded-2xl text-[11px] font-black flex items-center justify-center transition-all border-2 ${active ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white border-transparent shadow-xl shadow-rose-200 dark:shadow-blue-900/40 scale-110 z-10' : 'bg-white dark:bg-blue-500/5 border-rose-100 dark:border-blue-500/10 text-rose-900/40 dark:text-blue-800 hover:border-rose-400 dark:hover:border-blue-400 hover:text-rose-600 dark:hover:text-blue-400'} disabled:opacity-20 disabled:cursor-not-allowed`}>
    {children}
  </button>
);
