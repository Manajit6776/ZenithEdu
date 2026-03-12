import React from 'react';
import { 
  Shield, Lock, Eye, FileText, Globe, 
  UserCheck, Server, Bell, ArrowLeft,
  GraduationCap, Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../src/contexts/ThemeContext';

export const PrivacyPolicy = () => {
  const { theme } = useTheme();

  const sections = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Data We Collect",
      content: "We collect information necessary for academic administration, including name, institutional email, roll number, and academic performance data. When using SSO, we receive basic profile information from your provider (Google or Microsoft).",
      color: "rose"
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "How We Use It",
      content: "Your data is used specifically for calculating attendance, managing grade reports, facilitating teacher-student appointments, and providing personalized academic analytics through our internal ML services.",
      color: "indigo"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security Measures",
      content: "All sensitive information is encrypted using 256-bit AES standards. We implement strict access controls ensuring that only authorized faculty and administrators can view specific student datasets.",
      color: "emerald"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Data Transparency",
      content: "You have full right to view, export, or request corrections to your data stored in the ZenithEdu ecosystem. We never sell student data to third-party advertisers or external organizations.",
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] bg-gradient-to-br from-amber-50 via-rose-50/30 to-slate-50 dark:from-[#050508] dark:via-[#0a0a1f] dark:to-[#050508] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 dark:bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 dark:bg-violet-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-20 px-6 border-b border-rose-200/50 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 dark:bg-indigo-600 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-indigo-900/40">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-400 dark:to-violet-600">Policy</span></h1>
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            Your trust is our priority. This policy explains how ZenithEdu collects, protects, and handles your academic and institutional data.
          </p>
          
          <div className="mt-8 flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-500/60 dark:text-slate-400 uppercase italic">
            <span>Last Updated: March 2025</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10"></span>
            <span>Version 2.5.0</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {sections.map((section, i) => (
            <div key={i} className="p-8 bg-white/60 backdrop-blur-xl dark:bg-white/[0.02] border border-rose-200/50 dark:border-white/5 rounded-[2rem] hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 group shadow-sm">
              <div className={`w-12 h-12 rounded-xl bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                <div className={`text-rose-600 dark:text-indigo-400`}>
                  {section.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{section.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Clauses */}
        <div className="space-y-16">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
              <FileText className="w-6 h-6 text-rose-600" />
              1. Institutional Compliance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              ZenithEdu operates in strict compliance with international student privacy laws (FERPA/GDPR where applicable). All data processing is strictly for pedagogical purposes. We ensure that student records are not accessible by unauthorized entities outside the educational institution.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
              <Lock className="w-6 h-6 text-indigo-600" />
              2. Security Standards
            </h2>
            <ul className="space-y-4 list-none p-0">
              <li className="flex gap-3 items-start p-4 bg-rose-50/50 backdrop-blur-md dark:bg-white/[0.01] rounded-2xl border border-rose-200/50 dark:border-white/5 shadow-sm">
                <div className="mt-1 flex-shrink-0 text-emerald-600 font-bold">✓</div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Regular automated vulnerability assessments on our core API infrastructure.</div>
              </li>
              <li className="flex gap-3 items-start p-4 bg-rose-50/50 backdrop-blur-md dark:bg-white/[0.01] rounded-2xl border border-rose-200/50 dark:border-white/5 shadow-sm">
                <div className="mt-1 flex-shrink-0 text-emerald-600 font-bold">✓</div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Encrypted backups stored in globally redundant, secure server environments.</div>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="p-12 bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:to-violet-500/5 border border-rose-200/50 dark:border-white/10 rounded-[3rem] text-center shadow-inner">
            <Bell className="w-10 h-10 text-rose-600 dark:text-rose-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">Privacy Questions?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">
              If you have concerns about your data or wish to exercise your right to erasure, please contact our Data Protection Officer.
            </p>
            <a href="mailto:privacy@zenithedu.edu" className="inline-flex px-8 py-4 bg-rose-600 dark:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-900/30 hover:scale-105 transition-transform active:scale-95">
              Contact DPO
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-rose-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 dark:bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 italic">SECURE DATA PROTECTION</p>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/support" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors uppercase">Support</Link>
            <Link to="/login" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors uppercase">Login</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
