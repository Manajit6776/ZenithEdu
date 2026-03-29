import React from 'react';
import { 
  FileText, ShieldAlert, UserCheck, Gavel, 
  Clock, AlertCircle, ArrowLeft, GraduationCap,
  Scale, BookOpen, Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../src/contexts/ThemeContext';

export const TermsOfService = () => {
  const { theme } = useTheme();

  const rules = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Academic Integrity",
      content: "Users must adhere to the institution's code of conduct. Any attempt to manipulate grades, attendance records, or forge digital signatures is strictly prohibited.",
      color: "rose"
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Account Security",
      content: "You are responsible for maintaining the confidentiality of your institutional credentials. Sharing login details or using another user's account is a violation of policy.",
      color: "indigo"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Intellectual Property",
      content: "Course materials, lectures, and resources provided within ZenithEdu are for individual educational use only. Unauthorized distribution is prohibited.",
      color: "emerald"
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "System Usage",
      content: "Automated data collection (scraping), DDoS attempts, or any activity that degrades portal performance for other users will result in immediate suspension.",
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] bg-gradient-to-br from-amber-50 via-indigo-50/20 to-slate-50 dark:from-[#050508] dark:via-[#0a0a1f] dark:to-[#050508] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-rose-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 dark:bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-20 px-6 border-b border-rose-200/50 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-violet-900/40">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-rose-400 dark:to-pink-600">Service</span></h1>
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            By accessing the ZenithEdu CMS Portal, you agree to abide by these institutional terms and governing academic policies.
          </p>
          
          <div className="mt-8 flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-500/60 dark:text-slate-400 uppercase italic">
            <span>Effective Date: January 2025</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10"></span>
            <span>Legal Portal v1.2</span>
          </div>
        </div>
      </div>

      {/* Grid Sections */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {rules.map((rule, i) => (
            <div key={i} className="p-8 bg-white/60 backdrop-blur-xl dark:bg-white/[0.02] border border-rose-200/50 dark:border-white/5 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 group shadow-sm">
              <div className={`w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                <div className={`text-indigo-600 dark:text-rose-400`}>
                  {rule.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{rule.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                {rule.content}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Articles */}
        <div className="space-y-20">
          <section className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
              <Scale className="w-6 h-6 text-indigo-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Usage of the ZenithEdu platform constitutes a legally binding agreement between the user and the affiliated educational institution. If you do not agree with any part of these terms, you must immediately cease usage of the portal and notify your system administrator.
            </p>
          </section>

          <section className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
              <AlertCircle className="w-6 h-6 text-rose-600" />
              2. Termination of Access
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              The institution reserves the right to suspend or terminate user access without prior notice under the following circumstances:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
              <li className="p-4 bg-rose-50/50 backdrop-blur-md dark:bg-white/[0.01] rounded-2xl border border-rose-200/50 dark:border-white/5 text-sm font-bold flex items-center gap-3 shadow-sm text-slate-900 dark:text-slate-100">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                Unauthorized access attempts
              </li>
              <li className="p-4 bg-rose-50/50 backdrop-blur-md dark:bg-white/[0.01] rounded-2xl border border-rose-200/50 dark:border-white/5 text-sm font-bold flex items-center gap-3 shadow-sm text-slate-900 dark:text-slate-100">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                Academic misconduct or fraud
              </li>
              <li className="p-4 bg-rose-50/50 backdrop-blur-md dark:bg-white/[0.01] rounded-2xl border border-rose-200/50 dark:border-white/5 text-sm font-bold flex items-center gap-3 shadow-sm text-slate-900 dark:text-slate-100">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                Sharing portal credentials
              </li>
              <li className="p-4 bg-rose-50/50 backdrop-blur-md dark:bg-white/[0.01] rounded-2xl border border-rose-200/50 dark:border-white/5 text-sm font-bold flex items-center gap-3 shadow-sm text-slate-900 dark:text-slate-100">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                Graduating or leaving the institution
              </li>
            </ul>
          </section>

          {/* Compliance Box */}
          <div className="p-10 bg-indigo-600 dark:bg-indigo-900 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/30 flex flex-col md:flex-row items-center gap-8 border border-white/10">
            <div className="flex-shrink-0 w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black mb-2 tracking-tight">Governance Compliance</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4 font-medium italic">
                This portal is governed by the laws of the operating jurisdiction and the specific regulatory guidelines for Higher Education Informatics.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">ISO 27001 Certified</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">EduTrust Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-rose-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 uppercase">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 italic">Official Terms Portal</p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors">Privacy</Link>
            <Link to="/support" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors">Help</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
