import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Clock, Award, CheckCircle2,
  BarChart3, GraduationCap, Wallet, ShieldCheck,
  ArrowLeft, ArrowRight, Star, Zap
} from 'lucide-react';
import { useTheme } from '../src/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const metrics = [
  { value: '68%', label: 'Reduction in admin workload', desc: 'Automated processes eliminate repetitive tasks', icon: Clock, color: 'rose' },
  { value: '94%', label: 'Fee collection efficiency', desc: 'Up from industry average of 71%', icon: Wallet, color: 'emerald' },
  { value: '3.2×', label: 'Faster report generation', desc: 'Instant analytics vs. manual spreadsheets', icon: BarChart3, color: 'indigo' },
  { value: '89%', label: 'Student satisfaction rate', desc: 'Based on post-deployment surveys', icon: Star, color: 'amber' },
  { value: '40%', label: 'Drop in student dropout risk', desc: 'Early detection and intervention system', icon: TrendingUp, color: 'violet' },
  { value: '99.9%', label: 'Platform uptime', desc: 'Enterprise-grade reliability with SLA guarantee', icon: ShieldCheck, color: 'teal' },
];

const colorVariants: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  rose:   { bg: 'bg-rose-500/10 dark:bg-blue-600/15',   text: 'text-rose-600 dark:text-blue-400',   border: 'border-rose-100 dark:border-blue-500/20',   gradient: 'from-rose-500 to-rose-700' },
  emerald:{ bg: 'bg-emerald-500/10 dark:bg-blue-600/15', text: 'text-emerald-600 dark:text-blue-400', border: 'border-rose-100 dark:border-blue-500/20', gradient: 'from-emerald-500 to-emerald-700' },
  indigo: { bg: 'bg-blue-500/10 dark:bg-blue-600/15', text: 'text-blue-600 dark:text-blue-400', border: 'border-rose-100 dark:border-blue-500/20', gradient: 'from-blue-500 to-blue-700' },
  amber:  { bg: 'bg-amber-500/10 dark:bg-blue-600/15',   text: 'text-amber-600 dark:text-blue-400',   border: 'border-rose-100 dark:border-blue-500/20',   gradient: 'from-amber-500 to-amber-700' },
  violet: { bg: 'bg-indigo-500/10 dark:bg-blue-600/15', text: 'text-indigo-600 dark:text-blue-400', border: 'border-rose-100 dark:border-blue-500/20', gradient: 'from-indigo-500 to-indigo-700' },
  teal:   { bg: 'bg-teal-500/10 dark:bg-blue-600/15',     text: 'text-teal-600 dark:text-blue-400',     border: 'border-rose-100 dark:border-blue-500/20',     gradient: 'from-teal-500 to-teal-700' },
};

const stories = [
  {
    name: 'Sunrise International School',
    location: 'Mumbai, India',
    quote: 'ZenithEdu cut our monthly reporting time from 3 days to 4 hours. The fee automation alone recovered ₹12 lakhs in overdue payments in the first semester.',
    role: 'Principal, Dr. Asha Mehta',
    avatar: 'AM',
    metrics: [{ label: 'Admin time saved', value: '68%' }, { label: 'Fee recovery', value: '₹12L' }],
    color: 'rose',
  },
  {
    name: 'Apex Technical Institute',
    location: 'Bangalore, India',
    quote: 'The live classes module and digital library integration transformed our online learning experience. Attendance is up 22% since switching to ZenithEdu.',
    role: 'Dean of Academics, Prof. Rajan K.',
    avatar: 'RK',
    metrics: [{ label: 'Attendance increase', value: '+22%' }, { label: 'Student retention', value: '96%' }],
    color: 'indigo',
  },
  {
    name: 'Green Valley College',
    location: 'Pune, India',
    quote: 'Hostel and transport management used to take two full-time staff. Now one person manages everything. The GPS tracking has been a game-changer for parent trust.',
    role: 'Operations Head, Ms. Priya Nair',
    avatar: 'PN',
    metrics: [{ label: 'Staff efficiency', value: '2× better' }, { label: 'Parent complaints', value: '−78%' }],
    color: 'emerald',
  },
];

const timeline = [
  { year: 'Week 1', title: 'Onboarding & Data Migration', desc: 'Dedicated team migrates existing student data, staff records and fee history into ZenithEdu.' },
  { year: 'Week 2', title: 'Staff Training', desc: 'Role-specific live training sessions for admins, teachers and operations staff with recorded playback.' },
  { year: 'Week 3', title: 'Pilot Go-Live', desc: 'Core modules (attendance, fees, notices) go live with a selected section before full rollout.' },
  { year: 'Week 4', title: 'Full Deployment', desc: 'All modules activated. Dedicated support team monitors and resolves any issues in real time.' },
  { year: 'Month 2+', title: 'Continuous Optimisation', desc: 'Monthly reviews, feature updates, and performance reports to keep your institution growing.' },
];

export function ImpactPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050508] text-slate-900 dark:text-white">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-rose-100 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-rose-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-rose-200 dark:text-white/10">/</span>
            <span className="text-[11px] font-black text-rose-900 dark:text-white uppercase tracking-widest">Impact</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/features" className="text-[10px] font-black text-rose-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors hidden sm:block uppercase tracking-widest">Features</Link>
            <Link to="/vision" className="text-[10px] font-black text-rose-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors hidden sm:block uppercase tracking-widest">Vision</Link>
            <div className="w-px h-4 bg-rose-100 dark:bg-white/10 hidden sm:block"></div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl text-rose-400 hover:text-rose-600 dark:hover:text-indigo-400 transition-all hover:bg-rose-50 dark:hover:bg-white/5">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/40 uppercase tracking-widest">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-rose-500/8 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-200/50 dark:border-indigo-500/20 text-rose-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" /> Measurable Impact
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-rose-950 dark:text-white leading-[1.05]"
          >
            Proof of
            <span className="block bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              transformation
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-rose-950/60 dark:text-blue-400/60 max-w-2xl mx-auto font-black uppercase tracking-tight"
          >
            Empirical evidence from 50+ elite institutions — rigorously quantified after 12 months of Zenithed Integration.
          </motion.p>
        </div>
      </section>

      {/* ── METRICS GRID ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {metrics.map((m) => {
            const Icon = m.icon;
            const c = colorVariants[m.color];
            return (
              <motion.div
                key={m.label}
                variants={fadeUp}
                className={`relative rounded-2xl border ${c.border} bg-white dark:bg-slate-900/60 p-6 overflow-hidden group hover:shadow-xl transition-shadow duration-300`}
              >
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className={`text-4xl font-black mb-1.5 bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>{m.value}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{m.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</div>

                {/* animated bar */}
                <div className="mt-4 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${c.gradient}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── CASE STUDIES ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">Success Stories</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Real institutions, real transformations. Here's what they said after deploying EduNexus.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {stories.map((s, i) => {
              const c = colorVariants[s.color];
              return (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className={`bg-white dark:bg-slate-900/80 rounded-2xl border ${c.border} p-6 shadow-lg flex flex-col`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-black text-sm`}>{s.avatar}</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.location}</p>
                    </div>
                  </div>

                  <blockquote className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1 italic border-l-2 border-slate-200 dark:border-white/10 pl-3 mb-5">
                    "{s.quote}"
                  </blockquote>

                  <div className="flex gap-3 mb-4">
                    {s.metrics.map(m => (
                      <div key={m.label} className={`flex-1 rounded-xl ${c.bg} p-3 text-center`}>
                        <div className={`text-lg font-black ${c.text}`}>{m.value}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <p className={`text-xs font-semibold ${c.text}`}>— {s.role}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEPLOYMENT TIMELINE ──────────────────────────────────────────── */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">From Sign-up to Go-Live in 4 Weeks</h2>
          <p className="text-slate-600 dark:text-slate-400">We hold your hand every step — zero technical expertise required.</p>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-rose-200 via-indigo-200 to-transparent dark:from-rose-500/20 dark:via-indigo-500/20 hidden sm:block" />
          <div className="space-y-8">
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-rose-500/20 hidden sm:flex">
                  {i + 1}
                </div>
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/8 rounded-2xl p-5 flex-1 hover:shadow-lg transition-shadow">
                  <span className="text-[10px] font-black text-rose-600 dark:text-blue-400 uppercase tracking-wider">{t.year}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-1">{t.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 dark:from-indigo-700 dark:via-violet-700 dark:to-purple-800 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 uppercase tracking-tight">Redefine your<br/>legacy</h2>
          <p className="text-rose-100/80 dark:text-indigo-200/80 mb-12 text-lg font-medium">Coordinate a personalized demo — we'll demonstrate the precise ROI metrics for your scope.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login" className="px-10 py-4 bg-white text-rose-600 dark:text-indigo-700 font-black rounded-2xl hover:bg-rose-50 dark:hover:bg-indigo-50 transition-all shadow-2xl shadow-black/20 uppercase tracking-widest text-[11px]">
              Request Protocol Demo
            </Link>
            <Link to="/vision" className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-2xl transition-all flex items-center gap-3 justify-center uppercase tracking-widest text-[11px]">
              Our Vision <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
