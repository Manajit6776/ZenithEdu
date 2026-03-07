import React, { useState, useRef, useEffect, useCallback } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, Calendar, FileText,
  Settings as SettingsIcon, LogOut, Menu, Library, Bus,
  Building, CreditCard, Video, Clock, Activity,
  Loader2, Search, Bell, ChevronDown, BookOpen, BarChart2,
  ClipboardList, User, X
} from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import './index.css';

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { UserRole } from './types';
import { Home } from "../components/Home";
import { Dashboard } from "../components/Dashboard";
import { Students } from "../components/Students";
import { Teachers } from "../components/Teachers";
import { Attendance } from "../components/Attendance";
import { Notices } from "../components/Notices";
import { Hostel } from "../components/Hostel";
import { Academics } from "../components/Academics";
import { Timetable } from "../components/Timetable";
import { Library as LibraryComp } from "../components/Library";
import { Transport } from "../components/Transport";
import { Fees } from "../components/Fees";
import { Classes } from "../components/Classes";
import { Settings } from "../components/Settings";
import { ChatAssistant } from "../components/ChatAssistant";
import { Appointments } from "../components/Appointments";
import { Login } from "../components/Login";
import { StudentAttendance } from "../components/StudentAttendance";
import TeacherAnalytics from '../components/TeacherAnalytics';
import { ProfileSettings } from "../components/ProfileSettings";
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { FeaturesPage } from '../components/FeaturesPage';
import { ImpactPage } from '../components/ImpactPage';
import { VisionPage } from '../components/VisionPage';

function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

type Role = 'Admin' | 'Teacher' | 'Student';

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const getNavSections = (role: Role): NavSection[] => {
  const main: NavSection = {
    heading: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ],
  };

  const adminSections: NavSection[] = [
    main,
    {
      heading: 'People',
      items: [
        { label: 'Students', icon: Users, to: '/students' },
        { label: 'Teachers', icon: BookOpen, to: '/teachers' },
      ],
    },
    {
      heading: 'Academic',
      items: [
        { label: 'Academics', icon: GraduationCap, to: '/academics' },
        { label: 'Timetable', icon: Calendar, to: '/timetable' },
        { label: 'Live Classes', icon: Video, to: '/classes' },
        { label: 'Library', icon: Library, to: '/library' },
        { label: 'Attendance', icon: ClipboardList, to: '/attendance' },
        { label: 'Appointments', icon: Clock, to: '/appointments' },
      ],
    },
    {
      heading: 'Administration',
      items: [
        { label: 'Fees', icon: CreditCard, to: '/fees' },
        { label: 'Transport', icon: Bus, to: '/transport' },
        { label: 'Hostel', icon: Building, to: '/hostel' },
        { label: 'Notices', icon: FileText, to: '/notices' },
        { label: 'Teacher Analytics', icon: BarChart2, to: '/teacher-analytics' },
      ],
    },
    {
      heading: 'System',
      items: [
        { label: 'Settings', icon: SettingsIcon, to: '/settings' },
      ],
    },
  ];

  const teacherSections: NavSection[] = [
    main,
    {
      heading: 'Academic',
      items: [
        { label: 'Academics', icon: GraduationCap, to: '/academics' },
        { label: 'Timetable', icon: Calendar, to: '/timetable' },
        { label: 'Live Classes', icon: Video, to: '/classes' },
        { label: 'Library', icon: Library, to: '/library' },
        { label: 'Attendance', icon: ClipboardList, to: '/attendance' },
        { label: 'Appointments', icon: Clock, to: '/appointments' },
      ],
    },
    {
      heading: 'Management',
      items: [
        { label: 'Students', icon: Users, to: '/students' },
        { label: 'Fees', icon: CreditCard, to: '/fees' },
        { label: 'Transport', icon: Bus, to: '/transport' },
        { label: 'Hostel', icon: Building, to: '/hostel' },
        { label: 'Notices', icon: FileText, to: '/notices' },
        { label: 'Teacher Analytics', icon: BarChart2, to: '/teacher-analytics' },
      ],
    },
    {
      heading: 'System',
      items: [
        { label: 'Settings', icon: SettingsIcon, to: '/settings' },
      ],
    },
  ];

  const studentSections: NavSection[] = [
    main,
    {
      heading: 'My Learning',
      items: [
        { label: 'Academics', icon: GraduationCap, to: '/academics' },
        { label: 'Timetable', icon: Calendar, to: '/timetable' },
        { label: 'Live Classes', icon: Video, to: '/classes' },
        { label: 'Library', icon: Library, to: '/library' },
        { label: 'My Attendance', icon: Activity, to: '/my-attendance' },
      ],
    },
    {
      heading: 'Campus',
      items: [
        { label: 'Appointments', icon: Clock, to: '/appointments' },
        { label: 'Fees', icon: CreditCard, to: '/fees' },
        { label: 'Transport', icon: Bus, to: '/transport' },
        { label: 'Hostel', icon: Building, to: '/hostel' },
        { label: 'Notices', icon: FileText, to: '/notices' },
      ],
    },
    {
      heading: 'System',
      items: [
        { label: 'Settings', icon: SettingsIcon, to: '/settings' },
      ],
    },
  ];

  switch (role) {
    case 'Admin': return adminSections;
    case 'Teacher': return teacherSections;
    case 'Student': return studentSections;
    default: return adminSections;
  }
};

const roleBadge: Record<Role, { label: string; color: string; bg: string; border: string; dot: string }> = {
  Admin: { label: 'Admin Portal', color: 'text-rose-600 dark:text-blue-400', bg: 'bg-rose-500/10 dark:bg-blue-500/10', border: 'border-rose-500/25 dark:border-blue-500/25', dot: 'bg-rose-500 dark:bg-blue-500' },
  Teacher: { label: 'Teacher Portal', color: 'text-rose-600 dark:text-blue-400', bg: 'bg-rose-500/10 dark:bg-blue-500/10', border: 'border-rose-500/25 dark:border-blue-500/25', dot: 'bg-rose-500 dark:bg-blue-500' },
  Student: { label: 'Student Portal', color: 'text-rose-600 dark:text-blue-400', bg: 'bg-rose-500/10 dark:bg-blue-500/10', border: 'border-rose-500/25 dark:border-blue-500/25', dot: 'bg-rose-500 dark:bg-blue-500' },
};

// ─── Notification data per role ────────────────────────────────────────────
const NOTIF_DATA: Record<Role, { id: number; icon: string; title: string; desc: string; time: string }[]> = {
  Admin: [
    { id: 1, icon: '👥', title: 'New student enrolled',   desc: 'Aiden Park joined CS Department',       time: '5 min' },
    { id: 2, icon: '💰', title: 'Fee payments overdue',   desc: '3 students have pending fees',           time: '30 min' },
    { id: 3, icon: '📋', title: 'Monthly report ready',   desc: 'March 2026 analytics compiled',          time: '2 hr' },
    { id: 4, icon: '🏫', title: 'Room booking confirmed', desc: 'Lab B reserved for Physics seminar',     time: '3 hr' },
  ],
  Teacher: [
    { id: 1, icon: '📝', title: 'New submissions',        desc: '12 assignments waiting for review',      time: '10 min' },
    { id: 2, icon: '📅', title: 'Class reminder',         desc: 'Data Structures lecture in 30 minutes',  time: '25 min' },
    { id: 3, icon: '💬', title: 'Student query',          desc: 'Priya asked about assignment deadline',  time: '1 hr' },
  ],
  Student: [
    { id: 1, icon: '📚', title: 'Assignment due soon',    desc: 'Data Structures — submit by midnight',  time: '1 hr' },
    { id: 2, icon: '🎓', title: 'Grade posted',           desc: 'You received A- in System Design',      time: '3 hr' },
    { id: 3, icon: '📢', title: 'Notice from admin',      desc: 'Campus closed on Friday for event',     time: '5 hr' },
  ],
};

// ─── NotificationCenter Component ───────────────────────────────────────────
const NotificationCenter = ({ role }: { role: Role }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          open
            ? 'text-rose-600 dark:text-blue-400 bg-rose-50 dark:bg-blue-500/10 ring-1 ring-rose-200 dark:ring-blue-500/30'
            : 'text-slate-500 dark:text-blue-700/60 hover:text-rose-600 dark:hover:text-blue-400 hover:bg-rose-50 dark:hover:bg-blue-500/10'
        }`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-600 dark:bg-blue-600 text-[9px] font-black text-white leading-none shadow-sm shadow-rose-500/20 dark:shadow-blue-500/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed top-[64px] right-3 sm:right-4 w-[340px] max-w-[calc(100vw-1.5rem)] rounded-2xl z-[9999] overflow-hidden
            border border-rose-200 dark:border-blue-500/25
            bg-amber-50 dark:bg-[#0d1224]
            shadow-2xl shadow-rose-200/40 dark:shadow-black/70"
          style={{ animation: 'notifSlideIn 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-rose-100 dark:border-white/8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-sm shadow-rose-500/20 dark:shadow-blue-500/30">
                <Bell className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-blue-400 leading-tight">Notifications</p>
                <p className="text-[10px] text-rose-500 dark:text-blue-600 leading-tight">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-semibold text-rose-600 dark:text-blue-400 hover:text-rose-700 dark:hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-blue-500/10 transition-all"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 dark:text-blue-500 dark:hover:text-blue-300 hover:bg-rose-100 dark:hover:bg-blue-500/10 transition-all"
                aria-label="Close notifications"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar divide-y divide-slate-50 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-rose-500 dark:text-blue-600">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id)}
                  className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150 ${
                    !n.read
                      ? 'bg-rose-100/60 dark:bg-blue-500/[0.07] hover:bg-rose-100 dark:hover:bg-blue-500/10'
                      : 'hover:bg-amber-100/30 dark:hover:bg-white/4'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center shadow-sm shadow-rose-500/20 dark:shadow-blue-500/30 flex-shrink-0">
                    <Bell className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${
                      !n.read ? 'text-rose-900 dark:text-blue-300' : 'text-rose-500/70 dark:text-blue-600'
                    }`}>
                      {n.title || 'Notification'}
                    </p>
                    <p className="text-xs text-rose-600 dark:text-blue-500 mt-0.5 leading-snug truncate">{n.message}</p>
                    <p className="text-[10px] text-rose-400 dark:text-blue-700 mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-blue-500 flex-shrink-0 mt-2 shadow-sm shadow-rose-500/50 dark:shadow-blue-500/50" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-rose-100 dark:border-white/8 bg-amber-100/50 dark:bg-white/[0.02] flex items-center justify-between gap-2">
            <p className="text-[10px] text-rose-400 dark:text-blue-700">
              {notifications.length} total · {unreadCount} unread
            </p>
            <button
              onClick={() => { markAllAsRead(); setOpen(false); }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-500 px-3 py-1 rounded-lg transition-all duration-150"
            >
              Dismiss all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const role = (user?.role as Role) || 'Student';
  const sections = getNavSections(role);
  const badge = roleBadge[role];

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.to;
    return (
      <Link
        to={item.to}
        onClick={() => setIsMobileSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-150 group",
          isActive
            ? "bg-rose-500/15 dark:bg-blue-500/15 text-rose-700 dark:text-blue-300 border border-rose-200/50 dark:border-blue-500/30"
            : "text-rose-500/60 dark:text-blue-700/60 hover:text-rose-800 dark:hover:text-blue-300 hover:bg-rose-50/50 dark:hover:bg-blue-500/10 border border-transparent"
        )}
      >
        <item.icon className={cn("flex-shrink-0 transition-colors", isSidebarOpen ? "w-4 h-4" : "w-5 h-5", isActive ? "text-rose-600 dark:text-blue-400" : "text-rose-400 dark:text-blue-800/40 group-hover:text-rose-600 dark:group-hover:text-blue-400")} />
        {isSidebarOpen && <span className="truncate">{t(item.label.charAt(0).toLowerCase() + item.label.slice(1).replace(/\s+/g, ''))}</span>}
        {!isSidebarOpen && (
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md text-xs font-medium text-white bg-slate-800 border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {t(item.label.charAt(0).toLowerCase() + item.label.slice(1).replace(/\s+/g, ''))}
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={cn("h-16 flex items-center border-b border-rose-200/20 dark:border-blue-500/10 flex-shrink-0", isSidebarOpen || mobile ? "gap-3 px-5" : "justify-center px-3")}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg shadow-rose-500/20 dark:shadow-blue-500/20 flex-shrink-0">
          <GraduationCap className="w-4.5 h-4.5 text-white" />
        </div>
        {(isSidebarOpen || mobile) && (
          <span className="font-black text-lg tracking-tight text-rose-900 dark:text-blue-300">
            EduNexus<span className="text-rose-600 dark:text-blue-500">.</span>
          </span>
        )}
        {mobile && (
          <button onClick={() => setIsMobileSidebarOpen(false)} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.heading} className="mb-4">
            {(isSidebarOpen || mobile) && (
              <p className="px-3 mb-1.5 text-[10px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-widest">
                {t(section.heading.charAt(0).toLowerCase() + section.heading.slice(1).replace(/\s+/g, ''))}
              </p>
            )}
            {!isSidebarOpen && !mobile && <div className="mx-3 mb-1.5 h-px bg-slate-200 dark:bg-white/5" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.to} className="relative">
                  <NavLink item={item} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-white/5 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={cn(
              "flex items-center w-full p-2.5 rounded-xl transition-all border border-rose-200 dark:border-blue-500/10 bg-white/40 dark:bg-blue-900/10 hover:bg-rose-50 dark:hover:bg-blue-500/20",
              isSidebarOpen || mobile ? "gap-3" : "justify-center"
            )}
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 dark:from-blue-500 dark:to-blue-700 p-[1.5px]">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt=""
                  className="w-full h-full rounded-full bg-amber-50 dark:bg-slate-900"
                />
              </div>
              <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-amber-50 dark:border-slate-950", badge.dot)} />
            </div>
            {(isSidebarOpen || mobile) && (
              <>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="text-sm font-semibold text-rose-950 dark:text-blue-300 truncate leading-tight">{user?.name}</p>
                  <p className={cn("text-[11px] font-black uppercase tracking-wider", badge.color)}>{role}</p>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-rose-400 dark:text-blue-700/60 flex-shrink-0 transition-transform duration-200", showProfileMenu && "rotate-180")} />
              </>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-rose-200 dark:border-blue-500/10 overflow-hidden shadow-2xl bg-amber-50 dark:bg-slate-900 z-50">
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-rose-600 dark:text-blue-400 hover:bg-rose-50 dark:hover:bg-blue-500/10 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-rose-500 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-rose-900 dark:text-blue-300 text-xs">Profile Settings</p>
                    <p className="text-[10px] text-rose-500 dark:text-blue-600">Manage your account</p>
                  </div>
                </Link>
                <div className="h-px bg-slate-100 dark:bg-white/8 mx-1" />
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-rose-500 dark:text-blue-400 hover:bg-rose-50 dark:hover:bg-blue-500/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-rose-600 dark:text-blue-300 text-xs">Sign Out</p>
                    <p className="text-[10px] text-rose-500/60 dark:text-blue-700/60">Log out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-amber-50 dark:bg-[#080b14] text-rose-900 dark:text-blue-300 overflow-hidden font-inter selection:bg-rose-500/30 transition-colors duration-300">
      <aside className={cn(
        "hidden md:flex flex-col border-r border-rose-200/20 dark:border-blue-500/10 bg-amber-50 dark:bg-[#0d1224] backdrop-blur-xl z-20 transition-all duration-300 flex-shrink-0",
        isSidebarOpen ? "w-64" : "w-[60px]"
      )}>
        <SidebarContent />
      </aside>

      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="relative z-50 w-72 flex flex-col border-r border-rose-200/20 dark:border-blue-500/10 bg-amber-50 dark:bg-slate-950 h-full">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-rose-200/20 dark:border-blue-500/10 bg-amber-50/80 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/50 dark:hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2 rounded-lg text-rose-500 hover:text-rose-700 dark:text-blue-500 dark:hover:text-blue-300 hover:bg-rose-100 dark:hover:bg-blue-500/10 transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400 dark:text-blue-700 group-focus-within:text-rose-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="w-56 pl-9 pr-3 py-1.5 text-sm rounded-xl border border-rose-200/30 dark:border-blue-500/20 bg-amber-100/40 dark:bg-white/5 text-rose-900 dark:text-blue-400 placeholder-rose-300 dark:placeholder-blue-800 focus:outline-none focus:ring-1 focus:ring-rose-500/50 dark:focus:ring-blue-500/50 focus:border-rose-500/40 dark:focus:border-blue-500/40 focus:bg-white dark:focus:bg-slate-900/60 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className={cn("hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border mr-1", badge.bg, badge.color, badge.border)}>
              <div className={cn("w-1.5 h-1.5 rounded-full", badge.dot)} />
              {badge.label}
            </div>

            <NotificationCenter role={role} />

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 dark:text-blue-500 dark:hover:text-blue-300 hover:bg-rose-100 dark:hover:bg-blue-500/10 transition-all border border-transparent hover:border-rose-200 dark:hover:border-blue-500/20 active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <div className="md:hidden w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 dark:from-indigo-500 dark:to-violet-600 p-[1.5px] ml-1">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt=""
                className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative bg-amber-50 dark:bg-slate-950">
          <div className="absolute top-0 left-0 w-full h-80 blur-[100px] pointer-events-none rounded-full -translate-y-1/2 bg-rose-500/5 dark:bg-indigo-900/10" />
          <div className="relative z-10 p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-amber-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-[0_0_40px_rgba(225,29,72,0.4)] dark:shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-rose-600 dark:text-blue-500 animate-spin" />
          <p className="text-[10px] font-black text-rose-900/40 dark:text-blue-400 upper tracking-[0.3em]">Initializing Zenith</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={login} />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/my-attendance" element={<StudentAttendance />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/notices" element={<Notices role={user?.role === 'Admin' ? UserRole.ADMIN : user?.role === 'Teacher' ? UserRole.TEACHER : UserRole.STUDENT} />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/library" element={<LibraryComp />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/hostel" element={<Hostel />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/teacher-analytics" element={<TeacherAnalytics />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}