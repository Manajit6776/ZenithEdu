import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Wallet, BarChart3, Building2, ShieldCheck,
  Cpu, Zap, GraduationCap, Clock, Database, Globe, Layers,
  Video, Bell, FileText, Bus, Calendar, ClipboardList,
  ArrowRight, ChevronRight, Star, Check, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../src/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const features = [
  {
    category: 'Core Administration',
    color: 'rose',
    items: [
      {
        icon: Users, title: 'Student Information System',
        desc: 'Complete student lifecycle management — from enrollment to graduation. Track profiles, academic history, documents, and parent contacts all in one unified hub.',
        highlights: ['Bulk enrollment import', 'Document management', 'Parent portal access', 'Academic transcript generation'],
      },
      {
        icon: BookOpen, title: 'Teacher Management',
        desc: 'Comprehensive faculty portal with workload tracking, performance analytics, leave management and subject assignment tools.',
        highlights: ['Workload balancing', 'Performance metrics', 'Leave automation', 'Subject mapping'],
      },
      {
        icon: GraduationCap, title: 'Academics & Curriculum',
        desc: 'Design, manage and track curriculums across departments. Set grading rubrics, create courses and monitor learning outcomes in real time.',
        highlights: ['Course builder', 'Grading rubrics', 'Outcome tracking', 'Department analytics'],
      },
    ]
  },
  {
    category: 'Learning & Engagement',
    color: 'blue',
    items: [
      {
        icon: Video, title: 'Live Virtual Classes',
        desc: 'Host or schedule live classes with built-in platform integrations (Zoom, Meet, Teams). Recording links, attendance auto-marking and reminders included.',
        highlights: ['Multi-platform support', 'Auto attendance', 'Recording archive', 'Reminder notifications'],
      },
      {
        icon: Calendar, title: 'Smart Timetable',
        desc: 'AI-assisted weekly timetable builder that resolves conflicts automatically. Colour-coded, drag-and-drop, and exportable to PDF or calendar.',
        highlights: ['Conflict detection', 'Drag & drop editor', 'PDF/iCal export', 'Mobile view'],
      },
      {
        icon: Database, title: 'Digital Library',
        desc: 'A fully searchable digital library with book issue/return tracking, fine management, e-resource links and overdue notifications.',
        highlights: ['Barcode scanning', 'E-book integration', 'Fine automation', 'Overdue alerts'],
      },
    ]
  },
  {
    category: 'Finance & Operations',
    color: 'amber',
    items: [
      {
        icon: Wallet, title: 'Fee Management',
        desc: 'Automate fee collection cycles, generate receipts, track arrears and send payment reminders. Supports multiple payment gateways and instalment plans.',
        highlights: ['Automated reminders', 'Receipt generation', 'Partial payments', 'Export statements'],
      },
      {
        icon: Building2, title: 'Hostel Management',
        desc: 'Manage rooms, allocations, meal plans, visitor logs and maintenance requests. Real-time occupancy dashboard with self-allocation portal for students.',
        highlights: ['Room allocation', 'Meal planning', 'Visitor log', 'Maintenance tickets'],
      },
      {
        icon: Bus, title: 'Transport Management',
        desc: 'Live GPS tracking of school buses, route planning, driver management and automated stop notifications for parents via SMS/app.',
        highlights: ['Live GPS tracking', 'Route optimisation', 'Driver profiles', 'Parent alerts'],
      },
    ]
  },
  {
    category: 'Analytics & Compliance',
    color: 'pink',
    items: [
      {
        icon: BarChart3, title: 'Advanced Analytics',
        desc: 'Role-specific dashboards with interactive charts — CGPA trends, fee collection rates, attendance heatmaps and department-wise performance radar.',
        highlights: ['Role-based views', 'Exportable reports', 'Trend forecasting', 'Custom date ranges'],
      },
      {
        icon: ClipboardList, title: 'Attendance System',
        desc: 'One-click attendance marking with QR code support, biometric integration readiness and automatic parent notification on absences.',
        highlights: ['QR code marking', 'Parent SMS alerts', 'Absence tracking', 'Monthly reports'],
      },
      {
        icon: ShieldCheck, title: 'Security & Compliance',
        desc: 'Role-based access control, end-to-end encrypted data, FERPA/GDPR compliance and full audit trail for every action in the system.',
        highlights: ['RBAC', 'E2E encryption', 'FERPA/GDPR ready', 'Audit logs'],
      },
    ]
  },
];

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string; glow: string; dot: string }> = {
  rose:   { bg: 'bg-rose-500/10 dark:bg-blue-600/15',   border: 'border-rose-100 dark:border-blue-500/20',   icon: 'text-rose-600 dark:text-blue-400',   badge: 'bg-rose-100 dark:bg-blue-500/20 text-rose-700 dark:text-blue-300',   glow: 'from-rose-500/10',   dot: 'bg-rose-500' },
  blue:   { bg: 'bg-rose-500/10 dark:bg-blue-600/20',   border: 'border-rose-100 dark:border-blue-500/20',   icon: 'text-rose-600 dark:text-blue-400',   badge: 'bg-rose-100 dark:bg-blue-500/20 text-rose-700 dark:text-blue-300',   glow: 'from-blue-500/10',   dot: 'bg-blue-500' },
  amber:  { bg: 'bg-amber-500/10 dark:bg-blue-600/15',  border: 'border-amber-100 dark:border-blue-500/20',  icon: 'text-amber-600 dark:text-blue-400',  badge: 'bg-rose-100 dark:bg-blue-500/20 text-rose-700 dark:text-blue-300',   glow: 'from-amber-500/10', dot: 'bg-amber-500' },
  pink:   { bg: 'bg-rose-500/10 dark:bg-blue-600/15',   border: 'border-rose-100 dark:border-blue-500/20',   icon: 'text-rose-600 dark:text-blue-400',   badge: 'bg-rose-100 dark:bg-blue-500/20 text-rose-700 dark:text-blue-300',   glow: 'from-rose-500/10',   dot: 'bg-rose-500' },
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export function FeaturesPage() {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState(features[0].category);
  const activeSection = features.find(f => f.category === active)!;
  const c = colorMap[activeSection.color];

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-[#050508] text-rose-900 dark:text-blue-400">

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-rose-100 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-rose-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-rose-200 dark:text-white/10">/</span>
            <span className="text-[11px] font-black text-rose-900 dark:text-white uppercase tracking-widest">Features</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/vision" className="text-[10px] font-black text-rose-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors hidden sm:block uppercase tracking-widest">Vision</Link>
            <Link to="/impact" className="text-[10px] font-black text-rose-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors hidden sm:block uppercase tracking-widest">Impact</Link>
            <div className="w-px h-4 bg-rose-100 dark:bg-white/10 hidden sm:block"></div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl text-rose-400 hover:text-rose-600 dark:hover:text-indigo-400 transition-all hover:bg-rose-50 dark:hover:bg-white/5">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-blue-900/40 uppercase tracking-widest">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* bg glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-rose-500/8 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-rose-500/10 dark:bg-blue-500/10 border border-rose-200/50 dark:border-blue-500/20 text-rose-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> Platform Capabilities
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-rose-950 dark:text-blue-300 mb-8 leading-[1.05]"
          >
            Sovereign control for
            <span className="block bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
              the digital age
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-rose-950/60 dark:text-blue-400/60 max-w-2xl mx-auto leading-relaxed font-black uppercase tracking-tight"
          >
            EduNexus synchronizes 30+ enterprise-grade modules into one unified ecosystem — architected to accelerate your institution's evolution.
          </motion.p>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {[
              { value: '30+', label: 'DYNAMIC MODULES', color: 'text-rose-600 dark:text-blue-500' },
              { value: '99.9%', label: 'UPTIME SLA', color: 'text-amber-600 dark:text-blue-400' },
              { value: '<2s', label: 'OPTIMAL SPEED', color: 'text-emerald-600 dark:text-blue-500' },
              { value: '24/7', label: 'ELITE SUPPORT', color: 'text-rose-600 dark:text-blue-400' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1 bg-amber-50/40 dark:bg-white/5 border border-rose-100 dark:border-blue-500/20 px-6 py-3 rounded-2xl backdrop-blur-md">
                <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[9px] text-rose-900/40 dark:text-blue-400/40 font-black uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORY TABS ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Tab strip */}
        <div className="flex flex-wrap gap-2 mb-12 p-2 bg-rose-50/50 dark:bg-white/5 border border-rose-100/50 dark:border-white/5 rounded-[2rem] w-fit mx-auto backdrop-blur-md">
          {features.map(f => (
            <button
              key={f.category}
              onClick={() => setActive(f.category)}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                active === f.category
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-xl shadow-rose-200 dark:shadow-blue-900/40 transform scale-105'
                  : 'text-rose-800/40 dark:text-blue-400/40 hover:text-rose-600 dark:hover:text-blue-400'
              }`}
            >
              {f.category}
            </button>
          ))}
        </div>

        {/* Feature cards grid */}
        <motion.div
          key={active}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {activeSection.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border ${c.border} bg-amber-50/50 dark:bg-slate-900/60 p-6 overflow-hidden group shadow-lg shadow-rose-100/60 dark:shadow-black/30`}
              >
                {/* glow */}
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${c.glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* icon */}
                <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>

                <h3 className="text-lg font-bold text-rose-950 dark:text-blue-300 mb-2">{item.title}</h3>
                <p className="text-sm text-rose-900/60 dark:text-blue-400/60 leading-relaxed mb-5">{item.desc}</p>

                <ul className="space-y-2">
                  {item.highlights.map(h => (
                    <li key={h} className="flex items-center gap-2 text-xs text-rose-900/60 dark:text-blue-400/60">
                      <span className={`w-4 h-4 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-2.5 h-2.5 ${c.icon}`} />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 uppercase tracking-tight">Ready to initiate<br/>evolution?</h2>
          <p className="text-rose-100/80 dark:text-blue-200/80 mb-12 text-lg font-medium">Join 50+ elite institutions already redefining the boundaries of education.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login" className="px-10 py-4 bg-white text-rose-600 dark:text-blue-600 font-black rounded-2xl hover:bg-rose-50 dark:hover:bg-blue-50 transition-all shadow-2xl shadow-black/20 uppercase tracking-widest text-[11px]">
              Secure Your Instance
            </Link>
            <Link to="/impact" className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-2xl transition-all flex items-center gap-3 justify-center uppercase tracking-widest text-[11px]">
              Review Impact Data <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
