import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, ArrowRight, ChevronRight,
  Users, BookOpen, Wallet, BarChart3, Building2,
  ShieldCheck, Cpu, Zap, GraduationCap,
  Clock, Star, TrendingUp, CheckCircle2,
  Database, Globe, Layers, LucideIcon, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../src/contexts/ThemeContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
const MotionLink = motion(Link);

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
  tag: string;
}

interface Stat {
  value: string;
  suffix?: string;
  label: string;
  color: string;
  pct: number;
}

// ─── Animated Counter ──────────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({
  target, suffix = '', duration = 1800
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-6 overflow-hidden cursor-default"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${feature.accent} blur-3xl pointer-events-none`} />

      {/* Tag */}
      <span className={`inline-block mb-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${feature.accent.replace('bg-', 'border-').replace('/10', '/30').replace('bg-', 'text-')}`}>
        {feature.tag}
      </span>

      {/* Icon */}
      <div className={`mb-4 inline-flex rounded-xl border p-2.5 transition-colors ${feature.accent.replace('/5', '/20')} dark:${feature.accent.replace('/5', '/20').replace('rose', 'indigo').replace('amber', 'orange')} border-current/20`}>
        <Icon className="w-5 h-5" style={{ color: 'currentColor' }} />
      </div>

      <h3 className="text-base font-semibold text-rose-950 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">
        {feature.title}
      </h3>
      <p className="text-sm text-rose-900/60 dark:text-neutral-500 leading-relaxed group-hover:text-rose-900/80 dark:group-hover:text-neutral-400 transition-colors">
        {feature.desc}
      </p>

      {/* Arrow */}
      <Link to="/features" className="mt-5 flex items-center gap-1 text-xs text-neutral-600 group-hover:text-indigo-400 transition-colors">
        Learn more <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<Stat & { index: number }> = ({ value, suffix, label, color, pct, index }) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl bg-white/[0.03] border border-white/8 p-4"
    >
      <div className="text-[10px] text-rose-900/40 dark:text-neutral-600 mb-1 font-bold uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-bold text-rose-950 dark:text-white mb-3">
        <AnimatedCounter target={numericValue} suffix={suffix ?? value.replace(/[0-9]/g, '')} />
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  // Scroll listener for nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Particle / dot grid canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [systemStats, setSystemStats] = useState({
    students: 120, // Initial demo values
    courses: 15,
    liveClasses: 4,
    books: 450,
    teachers: 8,
    avgAttendance: 92
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/system-stats')
      .then(res => res.json())
      .then(data => setSystemStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const features: Feature[] = [
    {
      icon: Database, title: 'Centralized SIS',
      desc: 'Unified student information system managing enrollment, profiles, and academic history with atomic data integrity.',
      accent: 'bg-indigo-500/5 text-indigo-400', tag: 'Infrastructure',
    },
    {
      icon: BookOpen, title: 'Integrated LMS',
      desc: 'Seamless course delivery platform with real-time assignment tracking, grading, and automated notifications.',
      accent: 'bg-violet-500/5 text-violet-400', tag: 'Academic',
    },
    {
      icon: Wallet, title: 'Financial Module',
      desc: 'Comprehensive fee management system with invoice generation and automated payment status synchronization.',
      accent: 'bg-emerald-500/5 text-emerald-400', tag: 'Operations',
    },
    {
      icon: BarChart3, title: 'ML Analytics',
      desc: 'Predictive modeling engine that analyzes student engagement data to identify academic risk factors early.',
      accent: 'bg-amber-500/5 text-amber-400', tag: 'AI-Enhanced',
    },
    {
      icon: Building2, title: 'Campus Logistics',
      desc: 'Integrated management for secondary services including hostel allocations, library inventory, and transport.',
      accent: 'bg-sky-500/5 text-sky-400', tag: 'Logistics',
    },
    {
      icon: Globe, title: 'Cross-Role Portal',
      desc: 'Tailored interfaces for Admins, Teachers, Students, and Parents ensuring secure, role-based data visibility.',
      accent: 'bg-rose-500/5 text-rose-400', tag: 'Interface',
    },
  ];

  const heroStats: Stat[] = [
    { value: systemStats.students.toString(), suffix: '+', label: 'Active Students', color: 'bg-indigo-500', pct: 100 },
    { value: systemStats.avgAttendance.toString(), suffix: '%', label: 'Avg Attendance', color: 'bg-violet-500', pct: systemStats.avgAttendance },
    { value: systemStats.liveClasses.toString(), suffix: '', label: 'Live Classes', color: 'bg-emerald-500', pct: 85 },
  ];

  const impactStats = [
    { number: systemStats.courses, suffix: '', label: 'Active Courses', sub: 'Currently offered' },
    { number: systemStats.teachers, suffix: '', label: 'Faculty Members', sub: 'Verified educators' },
    { number: systemStats.books, suffix: '+', label: 'Library Titles', sub: 'Resources cataloged' },
    { number: 100, suffix: '%', label: 'Data Integrity', sub: 'Relational consistency' },
  ];

  const benefits = [
    { icon: ShieldCheck, title: 'Compliance Ready', desc: 'FERPA, GDPR, and SOC2 compliant infrastructure out of the box.' },
    { icon: Cpu, title: 'API-First Architecture', desc: 'Seamlessly integrates with your existing library systems, payment gateways, and SIS.' },
    { icon: Zap, title: 'Zero-Latency Sync', desc: 'Updates in the registrar reflect instantly in finance. No batch processing, ever.' },
    { icon: Layers, title: 'Role-Based Access', desc: 'Granular permissions for Admin, Faculty, Students, and Parents out of the box.' },
    { icon: Database, title: 'Secure Data Vault', desc: 'End-to-end encryption, automated backups, and 99.9% SLA uptime guarantee.' },
    { icon: TrendingUp, title: 'Continuous Insights', desc: 'Live dashboards surface enrollment trends, financial health, and academic outcomes.' },
  ];

  const projectCapabilities = [
    {
      feature: 'Full Stack Integration',
      details: 'Seamless communication between React frontend, Express backend, and Prisma ORM.',
      color: 'from-indigo-500 to-violet-500',
    },
    {
      feature: 'ML Microservice',
      details: 'Asynchronous Python-based service for student performance prediction and analytics.',
      color: 'from-violet-500 to-pink-500',
    },
    {
      feature: 'Security & Auth',
      details: 'Robust role-based access control with secure JWT-based session management.',
      color: 'from-emerald-500 to-sky-500',
    },
  ];

  return (
    <div className="relative min-h-screen bg-amber-50 dark:bg-[#050508] text-rose-900 dark:text-neutral-400 overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200 transition-colors duration-300">

      {/* ── Background Layer ───────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 dark:opacity-60" />
        {/* Radial glows */}
        <div className="absolute top-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full bg-rose-500/5 dark:bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/10 dark:bg-violet-900/15 blur-[100px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-amber-50/85 dark:bg-[#050508]/85 backdrop-blur-2xl border-b border-rose-200/30 dark:border-white/8 shadow-2xl shadow-rose-900/5 dark:shadow-black/30'
        : 'bg-transparent'
        }`}>
        <div className="mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 dark:from-indigo-500 dark:to-violet-600 shadow-lg shadow-rose-500/20 dark:shadow-indigo-900/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-rose-500/40 dark:group-hover:shadow-indigo-500/50">
              <GraduationCap className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl ring-2 ring-rose-400/30 dark:ring-indigo-400/30 group-hover:ring-rose-400/60 dark:group-hover:ring-indigo-400/60 transition-all" />
            </div>
            <span className="text-sm font-bold text-rose-950 dark:text-white tracking-tight">
              ZenithEdu<span className="text-rose-600 dark:text-indigo-400">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium">
            {['Features', 'Impact', 'Vision'].map(item => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-rose-700/70 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-white transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-rose-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-rose-700/70 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-rose-500/5 dark:hover:bg-white/5"
            >
              Sign in
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-rose-700/70 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-500/5 dark:hover:bg-white/5 transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-rose-700/70 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-500/5 dark:hover:bg-white/5 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed inset-0 z-[60] bg-amber-50 dark:bg-[#050508] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-[68px] border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 dark:from-indigo-500 dark:to-violet-600 shadow-lg shadow-rose-500/20">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-rose-950 dark:text-white">ZenithEdu<span className="text-rose-600">.</span></span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-rose-700/70 hover:text-rose-900 dark:hover:text-white hover:bg-rose-500/5 dark:hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 space-y-4">
              {['features', 'impact', 'vision'].map((item, i) => (
                <MotionLink
                  key={item}
                  to={`/${item}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 rounded-xl text-base font-medium text-rose-900 dark:text-white capitalize hover:bg-rose-500/5 dark:hover:bg-white/5 border border-transparent hover:border-rose-200/50 dark:hover:border-white/10 transition-all"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </MotionLink>
              ))}
            </div>
            <div className="p-6 border-t border-rose-200/30 dark:border-white/8 space-y-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center py-3 rounded-xl border border-rose-200/50 dark:border-white/10 text-sm text-rose-900 dark:text-white hover:bg-rose-600 hover:text-white dark:hover:bg-white/5 transition-all">
                Sign In
              </Link>
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-rose-200 dark:border-white/10 text-rose-900 dark:text-white hover:bg-rose-50 dark:hover:bg-white/5 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative pt-36 pb-24 px-6 overflow-hidden">
          <motion.div style={{ y: heroY }} className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left copy */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-7 inline-flex items-center gap-2 rounded-full border border-rose-500/20 dark:border-indigo-500/30 bg-rose-500/10 dark:bg-indigo-500/10 px-3.5 py-1.5 text-[11px] font-semibold text-rose-700 dark:text-indigo-300 uppercase tracking-widest"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500/50 dark:bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500 dark:bg-indigo-400" />
                  </span>
                  Now live · Smart Campus OS
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-bold text-5xl md:text-6xl xl:text-[72px] leading-[1.0] tracking-tight mb-6 hero-text text-neutral-900 dark:text-white"
                >
                  ZenithEdu CMS.
                  <br />
                  <span className="hero-text-muted text-neutral-500 dark:text-neutral-700">Academic Intelligence.</span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-rose-900/80 dark:text-neutral-400 font-light leading-relaxed mb-9 max-w-lg"
                >
                  A robust Campus Management System architecture combining full-stack
                  efficiency with integrated machine learning for modern educational governance.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    to="/login"
                    className="shiny-btn-lg text-sm font-semibold text-white px-7 py-3.5 rounded-xl text-center"
                  >
                    Launch Dashboard
                  </Link>
                  <Link
                    to="/features"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-rose-200/50 bg-rose-500/5 dark:border-white/10 dark:bg-white/5 text-sm font-medium text-rose-900 dark:text-white hover:bg-rose-500/10 dark:hover:bg-white/10 hover:border-rose-300 dark:hover:border-white/20 transition-all duration-200"
                  >
                    Explore Platform
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>

                {/* Trust signals */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-10 flex items-center gap-6"
                >
                  <div className="flex -space-x-2">
                    {['DK', 'RM', 'SL', 'PJ', 'AM'].map((init, i) => (
                      <div
                        key={init}
                        className="w-8 h-8 rounded-full border-2 border-[#050508] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: `hsl(${220 + i * 25}, 70%, 45%)` }}
                      >
                        {init}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-rose-700/50 dark:text-neutral-500">Trusted by <span className="text-rose-950 dark:text-white font-medium">500+</span> institutions</p>
                  </div>
                </motion.div>
              </div>

              {/* Right – Live dashboard preview */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="relative"
              >
                {/* Outer glow */}
                <div className="absolute -inset-4 rounded-3xl bg-indigo-500/10 blur-2xl" />

                <div className="relative rounded-2xl border border-rose-200/30 dark:border-white/10 bg-amber-50/50 dark:bg-[#0a0a12] overflow-hidden shadow-2xl shadow-rose-900/10 dark:shadow-black/60">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/5 dark:bg-white/[0.03] border-b border-rose-200/30 dark:border-white/8">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-40 h-5 rounded-md bg-rose-500/5 dark:bg-white/5 border border-rose-200/30 dark:border-white/8 flex items-center px-2 gap-1.5 mx-auto">
                        <ShieldCheck className="w-2.5 h-2.5 text-rose-500 dark:text-green-400" />
                        <span className="text-[9px] text-rose-700/50 dark:text-neutral-500">zenithedu.dev.local</span>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-[10px] text-rose-700/40 dark:text-neutral-600 mb-0.5 uppercase tracking-widest font-bold">ADMIN OVERVIEW</p>
                        <h3 className="text-sm font-bold text-rose-950 dark:text-white">Academic Dashboard</h3>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-rose-600">Live</span>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {heroStats.map((s, i) => (
                        <StatCard key={s.label} {...s} index={i} />
                      ))}
                    </div>

                    {/* Mini chart placeholder */}
                    <div className="rounded-xl bg-rose-500/5 dark:bg-white/[0.02] border border-rose-200/30 dark:border-white/6 p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-rose-700/50 dark:text-neutral-500 font-bold uppercase tracking-wider">Enrollment Trend</span>
                        <span className="text-[10px] text-rose-600 dark:text-indigo-400 font-bold">+18% YoY</span>
                      </div>
                      {/* Bar chart SVG */}
                      <svg className="w-full h-16" viewBox="0 0 280 60" preserveAspectRatio="none">
                        {[28, 45, 38, 55, 42, 68, 58, 72, 65, 80, 70, 88].map((h, i) => (
                          <motion.rect
                            key={i}
                            x={i * 23 + 2}
                            y={60 - h * 0.7}
                            width="18"
                            height={h * 0.7}
                            rx="3"
                            fill={i === 11 ? '#6366f1' : 'rgba(99,102,241,0.25)'}
                            initial={{ scaleY: 0, originY: 1 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                            style={{ transformOrigin: 'bottom' }}
                          />
                        ))}
                      </svg>
                    </div>

                    {/* Recent activity */}
                    <div className="space-y-2">
                      {[
                         { label: 'Aiden Park enrolled — CS Dept', time: '2m ago', dot: 'bg-rose-500' },
                         { label: 'Fee payment received · ₹45,000', time: '8m ago', dot: 'bg-amber-500' },
                         { label: 'Alert: 3 at-risk students flagged', time: '15m ago', dot: 'bg-rose-600' },
                       ].map((item, i) => (
                         <motion.div
                           key={i}
                           initial={{ opacity: 0, x: -10 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: 0.6 + i * 0.1 }}
                           className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-rose-500/5 dark:bg-white/[0.02] border border-rose-200/20 dark:border-white/5"
                         >
                           <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                           <span className="text-[11px] text-rose-900/60 dark:text-neutral-400 flex-1 truncate">{item.label}</span>
                           <span className="text-[10px] text-rose-700/30 dark:text-neutral-600 flex-shrink-0">{item.time}</span>
                         </motion.div>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-rose-700/40 dark:text-neutral-600 uppercase tracking-widest font-bold">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-rose-300 dark:border-white/10 flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-rose-500 dark:bg-indigo-400" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── PROBLEM STATEMENT ─────────────────────────────────────────────── */}
        <section className="py-24 border-y border-rose-200/30 dark:border-white/[0.04] bg-gradient-to-b from-transparent to-amber-100/30 dark:to-[#070710]/80 relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-rose-500/20 dark:via-indigo-500/40 to-transparent" />

          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-[11px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest mb-4">The Problem</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none text-rose-950 dark:text-white mb-4">
                  Your faculty aren't burnt out by students.
                </h2>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none text-rose-900/30 dark:text-neutral-700">
                  They're burnt out by spreadsheets.
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.15 }}
               className="space-y-5"
              >
                <p className="text-rose-900/70 dark:text-neutral-400 leading-relaxed text-lg font-light">
                  Most colleges operate on a patchwork of legacy software. Data is siloed in Admissions,
                  invisible to Finance, and lost before it reaches Student Life.
                </p>
                <div className="pl-5 border-l-2 border-rose-500/30 dark:border-indigo-500/50">
                  <p className="text-rose-900 dark:text-white font-bold dark:font-medium leading-relaxed">
                    The result? Administrative gridlock that hinders growth.
                  </p>
                </div>
                <p className="text-rose-900/70 dark:text-neutral-400 leading-relaxed font-light">
                  ZenithEdu unifies the entire student lifecycle into one seamless, intelligent flow.
                </p>

                 <div className="pt-2 flex flex-wrap gap-2">
                  {['No more data silos', 'Single source of truth', 'Real-time sync'].map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-indigo-300 bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-500/20 dark:border-indigo-500/20 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Pain points grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {[
                { stat: '7+', label: 'Systems per campus', sub: 'on average' },
                { stat: '32h', label: 'Wasted per admin/week', sub: 'on data reconciliation' },
                { stat: '23%', label: 'Higher dropout risk', sub: 'with fragmented data' },
                { stat: '$120k', label: 'Potential Savings', sub: 'In institutional overhead' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-black/5 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-5 text-center"
                >
                  <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{item.stat}</div>
                  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">{item.label}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-600">{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <section id="features" className="py-32 mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest mb-3"
            >
              The Platform
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4"
            >
              Not just an ERP. An Intelligence Layer.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-rose-900/60 dark:text-neutral-500 max-w-xl mx-auto font-light"
            >
              Six integrated modules working in concert to reduce overhead,
              improve retention, and modernize the campus experience.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </section>

        {/* ── IMPACT STATS ──────────────────────────────────────────────────── */}
        <section id="impact" className="py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-[#070710] dark:to-[#050508] border-t border-black/[0.04] dark:border-white/[0.04]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[11px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest mb-3"
              >
                Proven Results
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4"
              >
                Systems that turn overwhelmed admins<br className="hidden md:block" /> into strategic leaders.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-rose-900/60 dark:text-neutral-500 font-light"
              >
                You don't need more staff. You need software that works.
              </motion.p>
            </div>

            {/* Big impact numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {impactStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-rose-200/30 dark:border-white/8 bg-amber-50/50 dark:bg-white/[0.02] p-6 text-center group hover:border-rose-500/30 dark:hover:border-indigo-500/30 hover:bg-rose-500/5 dark:hover:bg-indigo-500/5 transition-all duration-300 shadow-sm hover:shadow-rose-900/5 dark:shadow-none"
                >
                  <div className="text-5xl font-bold text-rose-950 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-indigo-300 transition-colors">
                    <AnimatedCounter target={s.number} suffix={s.suffix} />
                  </div>
                  <div className="text-sm font-semibold text-rose-950 dark:text-white mb-1">{s.label}</div>
                  <div className="text-xs text-rose-700/50 dark:text-neutral-600">{s.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Project Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {projectCapabilities.map((cap, i) => (
                <motion.div
                  key={cap.feature}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-black/5 dark:border-white/8 bg-black/[0.01] dark:bg-white/[0.02] p-6 flex flex-col gap-3 hover:border-black/10 dark:hover:border-white/15 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                   <div>
                    <div className="text-sm font-bold text-rose-950 dark:text-white mb-1">{cap.feature}</div>
                    <p className="text-rose-900/60 dark:text-neutral-500 text-xs leading-relaxed">{cap.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY ZENITHEDU ─────────────────────────────────────────────────── */}
        <section className="py-24 mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 lg:sticky lg:top-28"
            >
              <p className="text-[11px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Why ZenithEdu</p>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-5 leading-tight">
                The platform you choose when you're ready to scale excellence.
              </h2>
               <p className="text-rose-900/60 dark:text-neutral-500 font-light leading-relaxed mb-8">
                ZenithEdu was engineered as a scalable foundation for institutions
                managing diverse student data, prioritizing relational security, and a
                modernized digital experience.
              </p>
              <Link
                to="/features"
                className="shiny-btn-lg text-sm font-semibold text-white px-6 py-3 rounded-xl inline-block"
              >
                Explore Modules
              </Link>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-5 rounded-xl border border-rose-200/30 dark:border-white/8 bg-amber-50/50 dark:bg-white/[0.015] hover:border-rose-500/20 dark:hover:border-indigo-500/20 hover:bg-rose-500/5 dark:hover:bg-indigo-500/5 transition-all duration-300 group shadow-sm hover:shadow-rose-900/5 dark:shadow-none"
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-500/20 dark:border-indigo-500/20 flex items-center justify-center text-rose-600 dark:text-indigo-400 group-hover:bg-rose-500/20 dark:group-hover:bg-indigo-500/20 transition-colors">
                    <b.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{b.title}</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500 leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VISION / FOUNDER ──────────────────────────────────────────────── */}
        <section id="vision" className="py-24 border-t border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-b from-white to-neutral-50 dark:from-[#050508] dark:to-[#07070f]">
          <div className="mx-auto max-w-4xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-rose-500/10 dark:border-indigo-500/15 bg-rose-500/[0.02] dark:bg-indigo-500/5 p-8 md:p-12 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-500/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

              <p className="text-[11px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest mb-6">Our Vision</p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                <div className="md:col-span-4">
                  <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/5 dark:to-white/[0.02] border border-black/5 dark:border-white/10 overflow-hidden flex flex-col items-center justify-end pb-6 pt-10 relative">
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 dark:from-indigo-500/15 to-transparent" />
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-indigo-900/20 dark:shadow-indigo-900/40">
                      KS
                    </div>
                    <div className="text-neutral-900 dark:text-white font-bold text-sm text-center">Kushagra Srivastava</div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono text-center mt-1">Founder & Creator</div>
                  </div>
                </div>

                <div className="md:col-span-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-6 leading-snug">
                    Built for Campuses. Ready for the Future.
                  </h2>
                  <div className="space-y-4 text-rose-900/70 dark:text-neutral-400 font-light leading-relaxed">
                    <p>
                      I built ZenithEdu after witnessing how academic management struggles — not because of bad teaching, but because of fragmented data silos and software that wasn't designed for modular education systems.
                    </p>
                    <p>
                      One truth stood out: <span className="text-rose-950 dark:text-white font-medium">Institutions don't fail because of teaching. They fail because outdated systems hold them back.</span>
                    </p>
                    <p>ZenithEdu addresses this with a unified database structure, role-based connectivity, and automated tracking — from Day 1.</p>
                    <p className="text-rose-600 dark:text-indigo-400 font-medium">Built by Kushagra Srivastava for modern campuses.</p>
                  </div>
                  <button className="mt-8 inline-flex items-center gap-2 text-rose-950 dark:text-white font-medium hover:text-rose-600 dark:hover:text-indigo-300 transition-colors group text-sm">
                    Speak With Kushagra
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="py-32 relative overflow-hidden">
          {/* Radial background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[400px] rounded-full bg-rose-500/5 dark:bg-indigo-600/10 blur-[100px]" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-rose-500/20 dark:via-indigo-500/60 to-transparent" />

          <div className="mx-auto max-w-3xl px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
               transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest mb-6">Get Started</p>
              <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6 leading-tight">
                Ready to modernize<br />your campus?
              </h2>
               <p className="text-xl text-rose-900/60 dark:text-neutral-500 mb-10 font-light">
                Experience the future of campus governance with ZenithEdu.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="shiny-btn-lg text-sm font-semibold text-white px-8 py-4 rounded-xl w-full sm:w-auto text-center"
                >
                  Enter Dashboard
                </Link>
                 <Link
                  to="/features"
                  className="text-sm font-bold text-rose-900/40 hover:text-rose-900 dark:text-neutral-500 dark:hover:text-white transition-colors"
                >
                  Browse Full Feature List →
                </Link>
              </div>

              {/* Feature badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {['Free 30-day pilot', 'No credit card needed', 'SOC2 compliant', 'Dedicated onboarding'].map(f => (
                  <span key={f} className="inline-flex items-center gap-1.5 text-[11px] text-rose-900/50 dark:text-neutral-500 bg-rose-500/[0.03] dark:bg-white/[0.03] border border-rose-500/10 dark:border-white/8 px-3 py-1.5 rounded-full shadow-sm dark:shadow-none">
                    <CheckCircle2 className="w-3 h-3 text-rose-600 dark:text-indigo-400" />
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.04] dark:border-white/[0.04] bg-neutral-50 dark:bg-[#040407] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 dark:from-indigo-500 dark:to-violet-600 shadow-lg shadow-rose-900/20 dark:shadow-indigo-900/40">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-rose-900 dark:text-neutral-500">ZenithEdu<span className="text-rose-600 dark:text-indigo-500">.</span></span>
          </div>
           <p className="text-xs text-rose-900/40 dark:text-neutral-700 text-center">
            © 2025 ZenithEdu CMS. Final Year Project Portfolio.
          </p>
          <div className="flex items-center gap-4 text-xs text-rose-900/40 dark:text-neutral-700">
            <a href="#" className="hover:text-rose-600 dark:hover:text-neutral-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-rose-600 dark:hover:text-neutral-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-rose-600 dark:hover:text-neutral-400 transition-colors">Security</a>
          </div>
        </div>
      </footer>

      {/* ── Inline Styles ─────────────────────────────────────────────────── */}
      <style>{`
        /* ── Hero text gradients ── */
        .hero-text {
          background: linear-gradient(135deg, #4c0519 0%, #881337 50%, #be123c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .hero-text {
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-text-muted {
          background: linear-gradient(135deg, #9f1239 0%, #e11d48 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.6;
        }
        .dark .hero-text-muted {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Shiny buttons ── */
        @property --ba { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

        .shiny-btn, .shiny-btn-lg {
          --ba: 0deg;
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          isolation: isolate;
          border: 1px solid transparent;
          background:
            linear-gradient(to bottom, #e11d48, #9f1239) padding-box,
            conic-gradient(from var(--ba), transparent, #fb7185 15%, #fda4af 25%, #fb7185 35%, transparent 40%) border-box;
          box-shadow: 0 0 24px rgba(225,29,72,0.15), inset 0 1px 0 rgba(255,255,255,0.15);
          animation: btn-spin 4s linear infinite;
          transition: box-shadow 0.3s, transform 0.15s;
        }
        .shiny-btn { padding: 0.5rem 1.25rem; font-size: 0.75rem; }
        .shiny-btn-lg { padding: 0.875rem 1.75rem; font-size: 0.875rem; }
         .shiny-btn:hover, .shiny-btn-lg:hover {
          box-shadow: 0 0 32px rgba(225,29,72,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .shiny-btn:active, .shiny-btn-lg:active { transform: scale(0.97); }
        .shiny-btn::after, .shiny-btn-lg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
          animation: shimmer-sweep 3s linear infinite;
        }
        @keyframes btn-spin { to { --ba: 360deg; } }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        .dark .shiny-btn, .dark .shiny-btn-lg {
          background:
            linear-gradient(to bottom, #5046e5, #3730a3) padding-box,
            conic-gradient(from var(--ba), transparent, #8b5cf6 15%, #a78bfa 25%, #8b5cf6 35%, transparent 40%) border-box;
          box-shadow: 0 0 24px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .dark .shiny-btn:hover, .dark .shiny-btn-lg:hover {
          box-shadow: 0 0 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export { Home };