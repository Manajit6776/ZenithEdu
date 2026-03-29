import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, Plus, Sparkles, Send, Loader2, X, ChevronDown,
  AlertTriangle, Info, CheckCircle, Clock, User,
  Search, Pin, Filter, Megaphone, RefreshCw, MoreVertical,
  Trash2, Edit, Eye
} from 'lucide-react';
import { db } from './services/database';
import { Notice, UserRole } from '../src/types';
import { generateNoticeContent } from './ChatAssistant';

// ─── Types ──────────────────────────────────────────────────────────────────
type Priority = 'High' | 'Medium' | 'Low';

// ─── Priority Config ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<Priority, {
  icon: React.ElementType;
  label: string;
  bar: string;
  badge: string;
  badgeDark: string;
  glow: string;
}> = {
  High:   { icon: AlertTriangle, label: 'High',   bar: 'bg-red-500',    badge: 'bg-red-500/10  border-red-500/25',    badgeDark: '',  glow: 'hover:shadow-red-900/20'   },
  Medium: { icon: Info,          label: 'Medium', bar: 'bg-amber-500',  badge: 'bg-amber-500/10  border-amber-500/25', badgeDark: '', glow: 'hover:shadow-amber-900/20' },
  Low:    { icon: CheckCircle,   label: 'Low',    bar: 'bg-blue-500',   badge: 'bg-blue-500/10  border-blue-500/25',   badgeDark: '', glow: 'hover:shadow-blue-900/20'  },
};

const getPriority = (p: string) => PRIORITY_CONFIG[p as Priority] ?? PRIORITY_CONFIG.Low;

// ─── Utilities ───────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
};

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ─── PriorityBadge ────────────────────────────────────────────────────────────
const PriorityBadge: React.FC<{ priority: string; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const cfg = getPriority(priority);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${cfg.badge} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {priority}
    </span>
  );
};

// ─── NoticeCard ──────────────────────────────────────────────────────────────
const NoticeCard: React.FC<{
  key?: React.Key;
  notice: Notice;
  canEdit: boolean;
  onView: (n: Notice) => void;
  onEdit?: (n: Notice) => void;
  onDelete?: (n: Notice) => void;
  isNew?: boolean;
}> = ({ notice, canEdit, onView, onEdit, onDelete, isNew }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cfg = getPriority(notice.priority);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <article
      className={`relative rounded-xl border border-rose-200/30 dark:border-white/8 bg-white/40 dark:bg-white/[0.03] hover:bg-rose-100/50 dark:hover:bg-white/[0.055] hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden cursor-pointer shadow-lg shadow-rose-200/10 ${cfg.glow} ${isNew ? 'ring-1 ring-rose-500/40' : ''}`}
      onClick={() => onView(notice)}
    >
      {/* Priority accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-xl`} />

      {isNew && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" title="Just posted" />
      )}

      <div className="pl-4 pr-4 pt-4 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={notice.priority} />
            {notice.pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10  border border-indigo-500/25">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>

          {canEdit && (
            <div className="relative flex-shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-md hover:bg-white/10  hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-slate-900/95 border border-white/10 shadow-2xl z-30 backdrop-blur-sm">
                  <div className="py-1">
                    <button onClick={() => { onView(notice); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm  hover:bg-white/5 flex items-center gap-2 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> View Notice
                    </button>
                    {onEdit && (
                      <button onClick={() => { onEdit(notice); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm  hover:bg-white/5 flex items-center gap-2 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    {onDelete && (
                      <>
                        <div className="mx-2 my-1 border-t border-white/5" />
                        <button onClick={() => { onDelete(notice); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm  hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-black   leading-snug mb-2 pr-1 line-clamp-2">{notice.title}</h3>

        {/* Content preview */}
        <p className="text-sm  dark: leading-relaxed line-clamp-3 mb-4 font-medium">{notice.content}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs  pt-3 border-t border-white/6">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span>{notice.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(notice.date)}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal: React.FC<{
  notice: Notice;
  onClose: () => void;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ notice, onClose, canEdit, onEdit, onDelete }) => {
  const cfg = getPriority(notice.priority);
  const barColors: Record<Priority, string> = { High: 'from-red-500/20', Medium: 'from-amber-500/20', Low: 'from-blue-500/20' };
  const gradFrom = barColors[notice.priority as Priority] ?? 'from-slate-500/20';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900/98 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header band */}
        <div className={`bg-gradient-to-br ${gradFrom} to-transparent border-b border-white/8 px-6 py-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <PriorityBadge priority={notice.priority} size="md" />
                {notice.pinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-indigo-500/10  border border-indigo-500/25">
                    <Pin className="w-3.5 h-3.5" /> Pinned
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{notice.title}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-[15px]  leading-relaxed whitespace-pre-wrap">{notice.content}</p>

          <div className="mt-5 pt-5 border-t border-white/8 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs">Posted by</p>
                <p className="font-medium text-xs">{notice.author}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs">Date</p>
              <p className="text-xs font-medium">{formatFullDate(notice.date)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2.5">
          {canEdit && onEdit && (
            <button onClick={onEdit} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10  text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}
          {canEdit && onDelete && (
            <button onClick={onDelete} className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20  text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <button onClick={onClose} className={`py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors ${canEdit ? 'px-5' : 'flex-1'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Compose Modal ────────────────────────────────────────────────────────────
const ComposeModal: React.FC<{
  onPost: (title: string, content: string, priority: Priority) => void;
  onClose: () => void;
  initialNotice?: Notice | null;
}> = ({ onPost, onClose, initialNotice }) => {
  const [topic, setTopic] = useState(initialNotice?.title || '');
  const [draft, setDraft] = useState(initialNotice?.content || '');
  const [priority, setPriority] = useState<Priority>((initialNotice?.priority as Priority) || 'Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const topicRef = useRef<HTMLInputElement>(null);

  useEffect(() => { topicRef.current?.focus(); }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true); setAiError('');
    try {
      const content = await generateNoticeContent(topic);
      setDraft(content);
    } catch {
      setAiError('AI generation failed. Please write the content manually.');
    } finally { setIsGenerating(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const canPost = topic.trim() && draft.trim();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={onClose}>
      <div className="bg-slate-900/98 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Mobile handle */}
        <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{initialNotice ? 'Edit Notice' : 'New Notice'}</h2>
            <p className="text-xs  mt-0.5">{initialNotice ? 'Update the details below' : 'Post an announcement to the board'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Title + AI Generate */}
          <div>
            <label className="block text-xs font-medium  mb-1.5">Topic / Title <span className="">*</span></label>
            <div className="flex gap-2">
              <input
                ref={topicRef}
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Holiday on Monday due to heavy rain"
                className="glass-input flex-1 px-3 py-2.5 rounded-xl text-sm placeholder: focus:ring-2 focus:ring-indigo-500/40 outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="flex-shrink-0 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
                title="Generate with AI (⌘Enter)"
              >
                {isGenerating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Sparkles className="w-4 h-4" />
                }
                <span className="hidden sm:inline">{isGenerating ? 'Generating…' : 'AI Draft'}</span>
              </button>
            </div>
            {aiError && <p className="mt-1.5 text-xs">{aiError}</p>}
            <p className="mt-1.5 text-[11px]">Press ⌘ + Enter to generate with AI</p>
          </div>

          {/* AI hint */}
          {isGenerating && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300 animate-pulse">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>AI is drafting your notice…</span>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-xs font-medium  mb-1.5">Content <span className="">*</span></label>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={5}
              className="glass-input w-full px-3 py-2.5 rounded-xl text-sm placeholder: focus:ring-2 focus:ring-indigo-500/40 outline-none resize-none leading-relaxed"
              placeholder={isGenerating ? '' : 'Write notice content here, or use AI Draft above…'}
            />
            <p className="mt-1 text-right text-[11px]">{draft.length} chars</p>
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-xs font-medium  mb-1.5">Priority</label>
            <div className="flex gap-2">
              {(['High', 'Medium', 'Low'] as Priority[]).map(p => {
                const pc = getPriority(p);
                const active = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all duration-150 flex items-center justify-center gap-1.5 ${active ? pc.badge : 'bg-white/5  border-white/10 hover:bg-white/10'}`}
                  >
                    {React.createElement(pc.icon, { className: 'w-3.5 h-3.5' })}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2.5 border-t border-white/8 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10  text-sm font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={() => canPost && onPost(topic, draft, priority)}
            disabled={!canPost}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {initialNotice ? 'Save Changes' : 'Publish Notice'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ notices: Notice[] }> = ({ notices }) => {
  const counts: Record<Priority, number> = { High: 0, Medium: 0, Low: 0 };
  notices.forEach(n => { if (counts[n.priority as Priority] !== undefined) counts[n.priority as Priority]++; });

  return (
    <div className="flex gap-3">
      {(['High', 'Medium', 'Low'] as Priority[]).map(p => {
        const cfg = getPriority(p);
        const Icon = cfg.icon;
        return (
          <div key={p} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.badge} text-xs font-medium`}>
            <Icon className="w-3 h-3" />
            <span>{counts[p]} {p}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const Notices: React.FC<{ role: UserRole }> = ({ role }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const canEdit = role === UserRole.ADMIN || role === UserRole.TEACHER;

  const loadNotices = useCallback(async () => {
    try {
      const data = await db.notices.getAll();
      setNotices(data);
    } catch (err) {
      console.error('Error loading notices', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotices(); }, [loadNotices]);

  const handlePost = useCallback(async (title: string, content: string, priority: Priority) => {
    if (editingNotice) {
      const updatedNotice = { ...editingNotice, title, content, priority };
      setNotices(prev => prev.map(n => n.id === editingNotice.id ? updatedNotice : n));
      setEditingNotice(null);
      if (viewingNotice?.id === editingNotice.id) setViewingNotice(updatedNotice);
      try { await db.notices.update(editingNotice.id, updatedNotice); } catch (err) { console.error(err); }
      return;
    }

    const newNotice: Notice = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      priority,
      author: 'You',
    };
    setNotices(prev => [newNotice, ...prev]);
    setNewIds(prev => new Set(prev).add(newNotice.id));
    setShowCompose(false);
    setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(newNotice.id); return n; }), 8000);
    try { await db.notices.add(newNotice); } catch (err) { console.error(err); }
  }, [editingNotice, viewingNotice]);

  const handleDelete = useCallback(async (notice: Notice) => {
    if (!confirm(`Delete"${notice.title}"? This cannot be undone.`)) return;
    setNotices(prev => prev.filter(n => n.id !== notice.id));
    if (viewingNotice?.id === notice.id) setViewingNotice(null);
    try { await db.notices.delete(notice.id); } catch (err) { console.error(err); }
  }, [viewingNotice]);

  // Filtering
  const filtered = notices.filter(n => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.author.toLowerCase().includes(s);
    const matchPriority = filterPriority === 'All' || n.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  // Separate pinned
  const pinned = filtered.filter(n => n.pinned);
  const regular = filtered.filter(n => !n.pinned);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-0 py-2 space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight  text-rose-800 dark:text-white">Notice Board</h1>
          <p className="text-sm  dark: mt-1 font-medium">Important announcements and updates</p>
          {!loading && <div className="mt-2"><StatsBar notices={notices} /></div>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={loadNotices} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8  hover:text-white transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {canEdit && (
            <button
              onClick={() => setShowCompose(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2  w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notices…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/80 text-black dark:text-white border border-rose-200/30 dark:border-white/10 rounded-xl px-9 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-rose-500/40 outline-none font-medium"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2  hover:text-black dark:hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Priority filter pills */}
        <div className="flex items-center gap-1.5">
          {(['All', 'High', 'Medium', 'Low'] as (Priority | 'All')[]).map(p => {
            const cfg = p !== 'All' ? getPriority(p as Priority) : null;
            const active = filterPriority === p;
            return (
              <button key={p} onClick={() => setFilterPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${active && cfg ? cfg.badge : active ? 'bg-indigo-600 text-white border-indigo-500/50' : 'bg-white/5  border-white/8 hover:bg-white/10 hover:'}`}>
                {p === 'All' ? 'All' : p}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {(searchTerm || filterPriority !== 'All') && !loading && (
        <div className="flex flex-wrap items-center gap-2 -mt-1">
          <span className="text-xs">Showing</span>
          <span className="text-xs text-white font-medium">{filtered.length}</span>
          <span className="text-xs">of {notices.length} notices</span>
          <button onClick={() => { setSearchTerm(''); setFilterPriority('All'); }} className="text-xs  hover: underline transition-colors ml-1">Clear filters</button>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading notices…</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={!!(searchTerm || filterPriority !== 'All')} onReset={() => { setSearchTerm(''); setFilterPriority('All'); }} onAdd={() => setShowCompose(true)} canAdd={canEdit} />
      ) : (
        <div className="space-y-6">
          {/* Pinned */}
          {pinned.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold   tracking-wider">Pinned</span>
                <div className="flex-1 h-px bg-indigo-500/15" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinned.map(n => (
                  <NoticeCard key={n.id} notice={n} canEdit={canEdit} onView={setViewingNotice} onEdit={() => setEditingNotice(n)} onDelete={() => handleDelete(n)} isNew={newIds.has(n.id)} />
                ))}
              </div>
            </section>
          )}

          {/* Regular */}
          {regular.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold   tracking-wider">All Notices</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map(n => (
                  <NoticeCard key={n.id} notice={n} canEdit={canEdit} onView={setViewingNotice} onEdit={() => setEditingNotice(n)} onDelete={() => handleDelete(n)} isNew={newIds.has(n.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {viewingNotice && (
        <ViewModal
          notice={viewingNotice}
          onClose={() => setViewingNotice(null)}
          canEdit={canEdit}
          onEdit={() => setEditingNotice(viewingNotice)}
          onDelete={() => handleDelete(viewingNotice)}
        />
      )}

      {(showCompose || editingNotice) && (
        <ComposeModal initialNotice={editingNotice} onPost={handlePost} onClose={() => { setShowCompose(false); setEditingNotice(null); }} />
      )}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ hasFilters: boolean; onReset: () => void; onAdd: () => void; canAdd: boolean }> = ({ hasFilters, onReset, onAdd, canAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
      <Bell className="w-8 h-8" />
    </div>
    <h3 className="text-base font-semibold text-white mb-1.5">{hasFilters ? 'No matching notices' : 'No notices yet'}</h3>
    <p className="text-sm  mb-6 max-w-xs">{hasFilters ? 'Try adjusting your search or priority filter.' : 'Keep everyone informed by posting the first announcement.'}</p>
    <button onClick={hasFilters ? onReset : onAdd} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/30">
      {hasFilters ? 'Clear Filters' : canAdd ? 'Post First Notice' : 'No notices found'}
    </button>
  </div>
);