import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, Calendar, FileText,
  Settings as SettingsIcon, LogOut, Menu, Library, Bus,
  Building, CreditCard, Video, Clock, Activity,
  Loader2, Search, Bell, ChevronDown, BookOpen, BarChart2,
  ClipboardList, User, X, Sun, Moon
} from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import './index.css';

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
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
import { NotificationProvider } from './contexts/NotificationContext';

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
  Admin: { label: 'Admin Portal', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25', dot: 'bg-violet-500' },
  Teacher: { label: 'Teacher Portal', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', dot: 'bg-indigo-500' },
  Student: { label: 'Student Portal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-500' },
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const role = (user?.role as Role) || 'Student';
  const sections = getNavSections(role);
  const badge = roleBadge[role];

  // Flatten all nav items for search
  const allNavItems = useMemo(() => {
    return sections.flatMap(section =>
      section.items.map(item => ({ ...item, section: section.heading }))
    );
  }, [sections]);

  // Filter nav items by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allNavItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q)
    );
  }, [searchQuery, allNavItems]);

  // Reset highlight index when results change
  useEffect(() => {
    setSearchHighlightIndex(0);
  }, [searchResults.length, searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  const handleSearchNav = useCallback((to: string) => {
    navigate(to);
    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  }, [navigate]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
      searchInputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchHighlightIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      handleSearchNav(searchResults[searchHighlightIndex].to);
    }
  }, [searchResults, searchHighlightIndex, handleSearchNav]);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.to;
    const isDark = theme === 'dark';
    return (
      <Link
        to={item.to}
        onClick={() => setIsMobileSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
          isActive
            ? isDark
              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
              : "bg-rose-500/10 text-rose-700 border border-rose-300/40"
            : isDark
              ? "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              : "text-rose-900/60 hover:text-rose-900 hover:bg-rose-100/50 border border-transparent"
        )}
      >
        <item.icon className={cn(
          "flex-shrink-0 transition-colors",
          isSidebarOpen ? "w-4 h-4" : "w-5 h-5",
          isActive
            ? isDark ? "text-indigo-400" : "text-rose-600"
            : isDark ? "text-slate-500 group-hover:text-slate-300" : "text-rose-400 group-hover:text-rose-600"
        )} />
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
      <div className={cn(
        "h-16 flex items-center flex-shrink-0 border-b",
        theme === 'dark' ? "border-white/5" : "border-rose-200/50",
        isSidebarOpen || mobile ? "gap-3 px-5" : "justify-center px-3"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
          theme === 'dark'
            ? "bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            : "bg-gradient-to-br from-rose-600 to-pink-600 shadow-lg shadow-rose-200"
        )}>
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {(isSidebarOpen || mobile) && (
          <span className={cn(
            "font-bold text-lg tracking-tight",
            theme === 'dark' ? "text-white" : "text-rose-950"
          )}>
            ZenithEdu<span className={theme === 'dark' ? "text-indigo-500" : "text-rose-600"}>.</span>
          </span>
        )}
        {mobile && (
          <button onClick={() => setIsMobileSidebarOpen(false)} className={cn(
            "ml-auto p-1.5 rounded-lg transition-colors",
            theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-rose-400 hover:text-rose-700 hover:bg-rose-100"
          )}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.heading} className="mb-4">
            {(isSidebarOpen || mobile) && (
              <p className={cn(
                "px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest",
                theme === 'dark' ? "text-slate-600" : "text-rose-900/40"
              )}>
                {t(section.heading.charAt(0).toLowerCase() + section.heading.slice(1).replace(/\s+/g, ''))}
              </p>
            )}
            {!isSidebarOpen && !mobile && <div className={cn("mx-3 mb-1.5 h-px", theme === 'dark' ? "bg-white/5" : "bg-rose-200/50")} />}
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

      <div className={cn("p-3 border-t flex-shrink-0", theme === 'dark' ? "border-white/5" : "border-rose-200/50")}>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={cn(
              "flex items-center w-full p-2.5 rounded-xl transition-all border",
              theme === 'dark'
                ? "bg-white/5 hover:bg-white/10 border-white/8"
                : "bg-rose-500/5 hover:bg-rose-100/60 border-rose-200/50",
              isSidebarOpen || mobile ? "gap-3" : "justify-center"
            )}
          >
            <div className="relative flex-shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full p-[1.5px]",
                theme === 'dark' ? "bg-gradient-to-tr from-indigo-500 to-purple-500" : "bg-gradient-to-tr from-rose-500 to-pink-500"
              )}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt=""
                  className={cn("w-full h-full rounded-full", theme === 'dark' ? "bg-slate-900" : "bg-amber-50")}
                />
              </div>
              <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2", theme === 'dark' ? "border-slate-950" : "border-amber-50", badge.dot)} />
            </div>
            {(isSidebarOpen || mobile) && (
              <>
                <div className="flex-1 overflow-hidden text-left">
                  <p className={cn("text-sm font-semibold truncate leading-tight", theme === 'dark' ? "text-white" : "text-rose-950")}>{user?.name}</p>
                  <p className={cn("text-[11px] font-medium truncate", badge.color)}>{role}</p>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200", theme === 'dark' ? "text-slate-500" : "text-rose-400", showProfileMenu && "rotate-180")} />
              </>
            )}
          </button>

          {showProfileMenu && (
            <div className={cn(
              "absolute bottom-full left-0 right-0 mb-2 rounded-xl border overflow-hidden shadow-2xl z-50",
              theme === 'dark' ? "border-white/10 shadow-black/40 bg-slate-900" : "border-rose-200 shadow-rose-100/80 bg-amber-50"
            )}>
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                    theme === 'dark' ? "text-slate-300 hover:bg-white/5" : "text-rose-900 hover:bg-rose-100"
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", theme === 'dark' ? "bg-indigo-500/10" : "bg-rose-500/10")}>
                    <User className={cn("w-3.5 h-3.5", theme === 'dark' ? "text-indigo-400" : "text-rose-600")} />
                  </div>
                  <div className="text-left">
                    <p className={cn("font-medium text-xs", theme === 'dark' ? "text-white" : "text-rose-950")}>Profile Settings</p>
                    <p className={cn("text-[10px]", theme === 'dark' ? "text-slate-500" : "text-rose-700/60")}>Manage your account</p>
                  </div>
                </Link>
                <div className={cn("h-px mx-1", theme === 'dark' ? "bg-white/8" : "bg-rose-200/60")} />
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all",
                    theme === 'dark' ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-100"
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="text-left">
                    <p className={cn("font-medium text-xs", theme === 'dark' ? "text-rose-300" : "text-rose-700")}>Sign Out</p>
                    <p className={cn("text-[10px]", theme === 'dark' ? "text-slate-500" : "text-rose-700/60")}>Log out of your account</p>
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
    <div className={cn(
      "flex h-screen overflow-hidden font-inter transition-colors duration-300",
      theme === 'dark'
        ? "bg-slate-950 text-slate-300 selection:bg-indigo-500/30"
        : "bg-amber-50 text-rose-950 selection:bg-rose-500/20"
    )}>
      <aside className={cn(
        "hidden md:flex flex-col border-r backdrop-blur-xl z-20 transition-all duration-300 flex-shrink-0",
        theme === 'dark' ? "border-white/5 bg-slate-950/90" : "border-rose-200/50 bg-amber-50/95",
        isSidebarOpen ? "w-64" : "w-[60px]"
      )}>
        <SidebarContent />
      </aside>

      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className={cn(
            "relative z-50 w-72 flex flex-col border-r h-full",
            theme === 'dark' ? "border-white/5 bg-slate-950" : "border-rose-200/50 bg-amber-50"
          )}>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={cn(
          "h-16 border-b backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0",
          theme === 'dark' ? "border-white/5 bg-slate-950/50" : "border-rose-200/50 bg-amber-50/80"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-rose-600 hover:text-rose-900 hover:bg-rose-100"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "hidden md:flex p-2 rounded-lg transition-all",
                theme === 'dark' ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-rose-500 hover:text-rose-900 hover:bg-rose-100"
              )}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative group hidden sm:block" ref={searchRef}>
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors pointer-events-none z-10",
                theme === 'dark' ? "text-slate-500 group-focus-within:text-indigo-400" : "text-rose-400 group-focus-within:text-rose-600"
              )} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                className={cn(
                  "w-56 pl-9 pr-8 py-1.5 text-sm rounded-xl border focus:outline-none focus:ring-1 transition-all",
                  theme === 'dark'
                    ? "border-white/8 bg-white/5 text-slate-300 placeholder-slate-600 focus:ring-indigo-500/50 focus:border-indigo-500/40 focus:bg-slate-900/60"
                    : "border-rose-200/50 bg-white/60 text-rose-950 placeholder-rose-300 focus:ring-rose-500/30 focus:border-rose-400/50 focus:bg-white"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setIsSearchOpen(false); searchInputRef.current?.focus(); }}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors",
                    theme === 'dark' ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-rose-400 hover:text-rose-700 hover:bg-rose-100"
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className={cn(
                  "absolute top-full left-0 mt-2 w-72 rounded-xl border overflow-hidden shadow-2xl z-50",
                  theme === 'dark'
                    ? "border-indigo-500/20 bg-slate-900/95 backdrop-blur-xl shadow-black/60"
                    : "border-rose-200 bg-white/95 backdrop-blur-xl shadow-rose-100/80"
                )}>
                  {searchResults.length > 0 ? (
                    <div className="py-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
                      <p className={cn(
                        "px-3 py-1 text-[10px] font-semibold uppercase tracking-widest",
                        theme === 'dark' ? "text-slate-500" : "text-rose-400"
                      )}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map((item, idx) => {
                        const Icon = item.icon;
                        const isHighlighted = idx === searchHighlightIndex;
                        return (
                          <button
                            key={item.to}
                            onClick={() => handleSearchNav(item.to)}
                            onMouseEnter={() => setSearchHighlightIndex(idx)}
                            className={cn(
                              "flex items-center gap-3 w-full px-3 py-2 text-left transition-all",
                              isHighlighted
                                ? theme === 'dark'
                                  ? "bg-indigo-500/15"
                                  : "bg-rose-100/70"
                                : theme === 'dark'
                                  ? "hover:bg-white/5"
                                  : "hover:bg-rose-50"
                            )}
                          >
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                              isHighlighted
                                ? theme === 'dark' ? "bg-indigo-500/20" : "bg-rose-500/15"
                                : theme === 'dark' ? "bg-white/5" : "bg-rose-500/5"
                            )}>
                              <Icon className={cn(
                                "w-3.5 h-3.5",
                                isHighlighted
                                  ? theme === 'dark' ? "text-indigo-400" : "text-rose-600"
                                  : theme === 'dark' ? "text-slate-400" : "text-rose-400"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                isHighlighted
                                  ? theme === 'dark' ? "text-white" : "text-rose-950"
                                  : theme === 'dark' ? "text-slate-300" : "text-rose-800"
                              )}>{item.label}</p>
                              <p className={cn(
                                "text-[10px]",
                                theme === 'dark' ? "text-slate-500" : "text-rose-500/60"
                              )}>{item.section}</p>
                            </div>
                            {isHighlighted && (
                              <span className={cn(
                                "text-[9px] font-medium px-1.5 py-0.5 rounded",
                                theme === 'dark' ? "bg-white/5 text-slate-500" : "bg-rose-100 text-rose-400"
                              )}>↵</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6 flex flex-col items-center gap-2">
                      <Search className={cn(
                        "w-5 h-5",
                        theme === 'dark' ? "text-slate-600" : "text-rose-300"
                      )} />
                      <p className={cn(
                        "text-sm font-medium",
                        theme === 'dark' ? "text-slate-400" : "text-rose-700"
                      )}>No pages found</p>
                      <p className={cn(
                        "text-xs text-center",
                        theme === 'dark' ? "text-slate-600" : "text-rose-400"
                      )}>Try searching for "Dashboard", "Students", etc.</p>
                    </div>
                  )}

                  <div className={cn(
                    "px-3 py-1.5 border-t flex items-center gap-3 text-[10px]",
                    theme === 'dark' ? "border-white/5 text-slate-600" : "border-rose-100 text-rose-400"
                  )}>
                    <span className="flex items-center gap-1"><kbd className={cn("px-1 py-0.5 rounded text-[9px] font-mono", theme === 'dark' ? "bg-white/5" : "bg-rose-50")}>↑↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className={cn("px-1 py-0.5 rounded text-[9px] font-mono", theme === 'dark' ? "bg-white/5" : "bg-rose-50")}>↵</kbd> select</span>
                    <span className="flex items-center gap-1"><kbd className={cn("px-1 py-0.5 rounded text-[9px] font-mono", theme === 'dark' ? "bg-white/5" : "bg-rose-50")}>esc</kbd> close</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className={cn("hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border mr-1", badge.bg, badge.color, badge.border)}>
              <div className={cn("w-1.5 h-1.5 rounded-full", badge.dot)} />
              {badge.label}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "p-2 rounded-lg transition-all active:scale-95",
                theme === 'dark'
                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                  : "text-rose-500 hover:text-rose-900 hover:bg-rose-100"
              )}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className={cn(
                  "relative p-2 rounded-lg transition-all",
                  theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-rose-500 hover:text-rose-900 hover:bg-rose-100"
                )}
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-indigo-400" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)} />
                  <div className={cn(
                    "absolute right-0 top-full mt-2 w-80 rounded-xl z-50 overflow-hidden border shadow-2xl",
                    theme === 'dark' ? "border-indigo-500/30 bg-[#0f1325] shadow-black/60" : "border-rose-200 bg-amber-50 shadow-rose-100/80"
                  )}>
                    <div className={cn("flex items-center justify-between px-4 py-3 border-b", theme === 'dark' ? "border-white/10" : "border-rose-200/60")}>
                      <div className="flex items-center gap-2">
                        <Bell className={cn("w-4 h-4", theme === 'dark' ? "text-indigo-400" : "text-rose-600")} />
                        <span className={cn("text-sm font-semibold", theme === 'dark' ? "text-white" : "text-rose-950")}>Notifications</span>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className={cn("p-1 rounded transition-all", theme === 'dark' ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-rose-100 text-rose-400 hover:text-rose-900")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                      {(
                        role === 'Admin' ? [
                          { icon: '👥', title: 'New student enrolled', desc: 'Aiden Park joined CS', time: '5m', unread: true },
                          { icon: '💰', title: 'Fee payments overdue', desc: '3 students pending', time: '30m', unread: true },
                        ] : role === 'Teacher' ? [
                          { icon: '📝', title: 'New submissions', desc: '12 to review', time: '10m', unread: true },
                        ] : [
                          { icon: '📚', title: 'Assignment due', desc: 'Data Structures', time: '1h', unread: true },
                        ]
                      ).map((n, i) => (
                        <div key={i} className={cn("flex items-start gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all", theme === 'dark' ? "hover:bg-white/5" : "hover:bg-rose-100/50")}>
                          <span className="text-lg">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium truncate", theme === 'dark' ? "text-white" : "text-rose-950")}>{n.title}</p>
                            <p className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-rose-700/60")}>{n.desc} • {n.time}</p>
                          </div>
                          {n.unread && <div className={cn("w-2 h-2 rounded-full mt-1", theme === 'dark' ? "bg-indigo-500" : "bg-rose-500")} />}
                        </div>
                      ))}
                    </div>

                    <div className={cn("px-4 py-2 border-t", theme === 'dark' ? "border-white/10" : "border-rose-200/60")}>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className={cn(
                          "w-full py-1.5 text-xs rounded-lg transition-colors",
                          theme === 'dark' ? "text-indigo-400 hover:text-white hover:bg-indigo-500/20" : "text-rose-600 hover:text-rose-900 hover:bg-rose-100"
                        )}
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={cn(
              "md:hidden w-8 h-8 rounded-full p-[1.5px] ml-1",
              theme === 'dark' ? "bg-gradient-to-tr from-indigo-500 to-purple-500" : "bg-gradient-to-tr from-rose-500 to-pink-500"
            )}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt=""
                className={cn("w-full h-full rounded-full", theme === 'dark' ? "bg-slate-900" : "bg-amber-50")}
              />
            </div>
          </div>
        </header>

        <main className={cn(
          "flex-1 overflow-y-auto custom-scrollbar relative",
          theme === 'dark'
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
            : "bg-gradient-to-br from-amber-50 via-rose-50/10 to-amber-50"
        )}>
          <div className={cn(
            "absolute top-0 left-0 w-full h-80 blur-[100px] pointer-events-none rounded-full -translate-y-1/2",
            theme === 'dark' ? "bg-indigo-900/10" : "bg-rose-500/5"
          )} />
          <div className="relative z-10 p-6 md:p-8">
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
      <NotificationProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-950">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.5)] animate-pulse">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]">Launching ZenithEdu</p>
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