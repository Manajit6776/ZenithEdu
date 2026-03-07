import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe, Cpu, Heart, Leaf, Users, Zap, Star,
  ArrowLeft, ArrowRight, GraduationCap, Lightbulb,
  Target, Rocket, Shield, BookOpen
} from 'lucide-react';
import { useTheme } from '../src/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

const pillars = [
  {
    icon: Globe,
    title: 'Universal Access',
    desc: 'Education management should not be a luxury reserved for well-funded institutions. We\'re committed to making ZenithEdu affordable and accessible to every school, college and training centre — regardless of size or budget.',
    color: 'blue',
    year: '2025',
  },
  {
    icon: Cpu,
    title: 'AI-Augmented Learning',
    desc: 'By 2027, ZenithEdu will embed predictive AI that identifies at-risk students before they disengage, recommends personalised learning paths, and automates routine administrative decisions using verifiable models.',
    color: 'violet',
    year: '2026',
  },
  {
    icon: Leaf,
    title: 'Sustainable Education',
    desc: 'Paperless operations aren\'t just efficient — they\'re responsible. Our digital-first stack eliminates tonnes of paper waste annually per institution. We\'re on track to be carbon-neutral hosting by 2026.',
    color: 'emerald',
    year: '2026',
  },
  {
    icon: Heart,
    title: 'Student Wellbeing First',
    desc: 'Beyond grades and attendance, we\'re building tools that detect signs of student stress, burnout and dropout risk early — enabling institutions to intervene compassionately, not punitively.',
    color: 'rose',
    year: '2027',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string; soft: string }> = {
  blue:   { bg: 'bg-rose-500/10 dark:bg-blue-600/15',   text: 'text-rose-600 dark:text-blue-400',   border: 'border-rose-100 dark:border-blue-500/20',   gradient: 'from-rose-500 to-rose-700',     soft: 'from-rose-500/10 to-transparent' },
  violet: { bg: 'bg-rose-500/10 dark:bg-blue-600/15', text: 'text-rose-600 dark:text-blue-400', border: 'border-rose-100 dark:border-blue-500/20', gradient: 'from-rose-500 to-rose-700', soft: 'from-rose-500/10 to-transparent' },
  emerald:{ bg: 'bg-emerald-500/10 dark:bg-blue-600/15', text: 'text-emerald-600 dark:text-blue-400', border: 'border-rose-100 dark:border-blue-500/20', gradient: 'from-emerald-500 to-emerald-700', soft: 'from-emerald-500/10 to-transparent' },
  rose:   { bg: 'bg-rose-500/10 dark:bg-blue-600/15',   text: 'text-rose-600 dark:text-blue-400',   border: 'border-rose-100 dark:border-blue-500/20',   gradient: 'from-rose-500 to-rose-700',     soft: 'from-rose-500/10 to-transparent' },
};

const roadmap = [
  { phase: 'Now — Q2 2025', title: 'Foundation', items: ['30+ core modules live', 'Role-based portals for Admin, Teacher, Student', 'Mobile-responsive design', 'Real-time analytics dashboard'], done: true },
  { phase: 'Q3 2025', title: 'Intelligence', items: ['Predictive attendance alerts', 'Automated fee reminder AI', 'Smart timetable conflict resolver', 'Natural language report queries'], done: false },
  { phase: 'Q1 2026', title: 'Ecosystem', items: ['Open API marketplace', 'Third-party LMS integrations', 'Parent super-app launch', 'Offline-first mobile app'], done: false },
  { phase: '2027+', title: 'Global Scale', items: ['Multi-language support (25+ languages)', 'Cross-institutional analytics network', 'AI academic advisor for students', 'Low-bandwidth mode for rural schools'], done: false },
];

const values = [
  { icon: Lightbulb, title: 'Simplicity', desc: 'Powerful enough for enterprise, simple enough for first-time users. We obsess over UX.' },
  { icon: Shield,    title: 'Trust',      desc: 'Data privacy, security and transparency are non-negotiable principles in every feature we build.' },
  { icon: Target,    title: 'Outcomes',   desc: 'We don\'t celebrate features shipped. We celebrate measurable improvements in student and staff lives.' },
  { icon: Rocket,    title: 'Velocity',   desc: 'Educational technology evolves fast. Our agile teams ship meaningful updates every two weeks.' },
  { icon: Users,     title: 'Community',  desc: 'Our users co-design our roadmap. Every institution has a voice in what we build next.' },
  { icon: BookOpen,  title: 'Integrity',  desc: 'Honest pricing, honest data practices, honest communication. Always.' },
];

export function VisionPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050508] text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-rose-100 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-rose-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-rose-200 dark:text-white/10">/</span>
            <span className="text-[11px] font-black text-rose-900 dark:text-white uppercase tracking-widest">Vision</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/features" className="text-[10px] font-black text-rose-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors hidden sm:block uppercase tracking-widest">Features</Link>
            <Link to="/impact" className="text-[10px] font-black text-rose-700 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors hidden sm:block uppercase tracking-widest">Impact</Link>
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
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* ambient glows */}
        <div className="absolute -top-20 left-1/4 w-[600px] h-[400px] bg-rose-500/8 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-[500px] h-[350px] bg-pink-500/6 dark:bg-violet-500/4 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-200/50 dark:border-indigo-500/20 text-rose-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm"
          >
            <Star className="w-3.5 h-3.5" /> Our North Star
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-rose-950 dark:text-white leading-[1.05]"
          >
            Orchestrating the
            <span className="block bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              infinite classroom
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-rose-950/60 dark:text-blue-400/60 max-w-3xl mx-auto font-black uppercase tracking-tight">
            We posit that every institution — from a 50-pupil academy to a 50,000-student conglomerate — necessitates world-class cognitive infrastructure. EduNexus is the architectural response.
          </motion.p>

          {/* Big mission statement */}
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-indigo-500/10 dark:to-violet-500/10 border border-rose-200/60 dark:border-indigo-500/20"
          >
            <p className="text-lg font-semibold text-slate-800 dark:text-white italic leading-relaxed">
              "Our mission is not to digitise education management. It's to fundamentally free educators from administrative burden — so they can focus entirely on what only humans can do: <span className="text-rose-600 dark:text-blue-400 not-italic font-black">inspire learners</span>."
            </p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-700/40 dark:text-blue-900">— EduNexus Founding Principle</p>
          </motion.blockquote>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">Four Pillars of Our Vision</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">The principles that guide every decision we make — from feature prioritisation to hiring.</p>
        </div>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            const c = colorMap[p.color];
            return (
              <motion.div
                key={p.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border ${c.border} bg-white dark:bg-slate-900/60 p-8 overflow-hidden group shadow-lg shadow-slate-100/60 dark:shadow-black/30`}
              >
                {/* corner glow */}
                <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${c.soft} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-start gap-4 relative">
                  <div className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{p.title}</h3>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${c.gradient} text-white`}>{p.year}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── ROADMAP ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">Product Roadmap</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-black uppercase tracking-[0.2em] text-[10px]">Our public commitment to where EduNexus is headed. Built with our community, for our community.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.map((r, i) => (
              <motion.div
                key={r.phase}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl border p-6 ${
                  r.done
                    ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-500/20'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/8'
                }`}
              >
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-4 ${
                  r.done ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400'
                }`}>
                  {r.done && <GraduationCap className="w-3 h-3" />}
                  {r.phase}
                </div>
                <h3 className="font-black text-slate-900 dark:text-white mb-3">{r.title}</h3>
                <ul className="space-y-2">
                  {r.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${r.done ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">What We Stand For</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">The values we hire for, build for, and hold ourselves accountable to.</p>
        </div>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="flex gap-4 p-5 rounded-2xl border border-slate-100 dark:border-white/8 bg-white dark:bg-slate-900/60 hover:shadow-lg transition-shadow group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 dark:from-indigo-500/30 dark:to-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-rose-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{v.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 dark:from-indigo-700 dark:via-violet-700 dark:to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
 
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <GraduationCap className="w-16 h-16 mx-auto mb-8 opacity-90 text-white drop-shadow-lg" />
            <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight tracking-tight uppercase">
              Inscribe your<br />future today
            </h2>
            <p className="text-rose-100/90 dark:text-purple-200/90 text-lg mb-12 max-w-2xl mx-auto font-medium">
              Scale with a platform that expands alongside your ambition. Coordinate your trial and bridge the gap between legacy and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/login" className="px-10 py-4 bg-white text-rose-600 dark:text-indigo-700 font-black rounded-2xl hover:bg-rose-50 dark:hover:bg-indigo-50 transition-all shadow-2xl shadow-black/20 text-[11px] uppercase tracking-widest">
                Initiate Free Sequence
              </Link>
              <Link to="/features" className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-2xl transition-all flex items-center gap-3 justify-center text-[11px] uppercase tracking-widest">
                Explore Tech Stack <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
