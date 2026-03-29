import React, { useState } from 'react';
import { 
  Search, Book, MessageCircle, Phone, Mail, 
  ChevronRight, ExternalLink, Shield, Zap,
  GraduationCap, Clock, FileText, HelpCircle,
  ArrowRight, CheckCircle2, LifeBuoy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../src/contexts/ThemeContext';

export const SupportCenter = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Student Portal",
      description: "Managing assignments, courses, and schedules",
      articles: 12,
      color: "rose"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Account & Billing",
      description: "Fees, transactions, and profile management",
      articles: 8,
      color: "indigo"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security",
      description: "SSO, privacy, and data protection",
      articles: 5,
      color: "emerald"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Tech Support",
      description: "Browser issues, connectivity, and performance",
      articles: 15,
      color: "amber"
    }
  ];

  const faqs = [
    {
      q: "How do I reset my portal password?",
      a: "Go to the login page and click 'Forgot Password'. You will receive a reset link on your institutional email."
    },
    {
      q: "When can I download my fee invoice?",
      a: "Invoices are available immediately after a payment is processed. Visit the 'Fees' section to download."
    },
    {
      q: "Can I access ZenithEdu offline?",
      a: "ZenithEdu is a web-based portal requiring an active connection, but you can download study materials for offline use."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] bg-gradient-to-br from-amber-50 via-rose-50/30 to-slate-50 dark:from-[#050508] dark:via-[#0a0a1f] dark:to-[#050508] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 border-b border-rose-200/50 dark:border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 dark:bg-violet-500/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 dark:bg-indigo-500/10 border border-rose-500/20 dark:border-indigo-500/20 rounded-full mb-8">
            <LifeBuoy className="w-4 h-4 text-rose-600 dark:text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-800 dark:text-indigo-300">Support Center</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-400 dark:to-violet-600">help you</span> today?
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-rose-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search for articles, guides, or tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/70 backdrop-blur-md dark:bg-white/[0.03] border border-rose-200/50 dark:border-white/10 rounded-3xl shadow-2xl shadow-rose-900/10 focus:outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/20 focus:border-rose-400 dark:focus:border-indigo-500/40 text-lg transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="group p-8 bg-white/60 backdrop-blur-xl dark:bg-white/[0.02] border border-rose-200/50 dark:border-white/5 rounded-[2.5rem] hover:shadow-2xl hover:shadow-rose-900/15 hover:-translate-y-2 transition-all duration-500">
              <div className={`w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                <div className={`text-rose-600 dark:text-indigo-400`}>
                  {cat.icon}
                </div>
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-white">{cat.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                {cat.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-600 dark:text-indigo-400 italic">
                {cat.articles} Articles <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured FAQ & Contact */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
              <HelpCircle className="w-8 h-8 text-rose-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 bg-white/40 backdrop-blur-md dark:bg-white/[0.01] border border-rose-200/50 dark:border-white/5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-lg mb-2 flex items-start gap-3 text-slate-900 dark:text-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 pl-8 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="p-8 bg-gradient-to-br from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-600 rounded-[2.5rem] text-white shadow-2xl shadow-rose-900/20">
              <h3 className="text-2xl font-black mb-4">Live Support</h3>
              <p className="text-white/80 mb-8 font-medium italic">Our academic support team is online 24/7 to help you with portal issues.</p>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-bold">Start Live Chat</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all border border-white/20">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span className="font-bold">0800-ZENITH-EDU</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-8 bg-white/60 backdrop-blur-xl dark:bg-white/[0.02] border border-rose-200/50 dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6">Send us a message</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Email Support</p>
                    <p className="font-black text-rose-700 dark:text-indigo-400">help@zenithedu.edu</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Knowledge Base</p>
                    <p className="font-black text-indigo-700 dark:text-indigo-400">docs.zenithedu.edu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-rose-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 dark:bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-black tracking-widest text-slate-400 italic">PORTAL SUPPORT v2.5.0</p>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors uppercase">Home</Link>
          <Link to="/login" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors uppercase">Login</Link>
          <Link to="/privacy" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors uppercase">Privacy</Link>
          <Link to="/terms" className="text-xs font-black tracking-widest hover:text-rose-500 transition-colors uppercase">Terms</Link>
        </div>
      </div>
    </div>
  );
};
