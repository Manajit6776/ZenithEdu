import React, { useState } from 'react';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, Shield, Sparkles,
  Home, Info, HelpCircle, Users, BarChart, Clock, Award,
  BookOpen, Calendar, CheckCircle, Sun, Moon
} from 'lucide-react';
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../src/contexts/ThemeContext";
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Features list
  const features = [
    {
      icon: <BarChart className="w-5 h-5" />,
      title: "Real-time Analytics",
      description: "Live insights into academic performance",
      color: "rose"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Unified Platform",
      description: "Students, teachers, and parents in one place",
      color: "blue"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "24/7 Access",
      description: "Access your data anytime, anywhere",
      color: "emerald"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Smart Reports",
      description: "Automated performance analysis",
      color: "amber"
    }
  ];

  // Quick start guide
  const quickStartSteps = [
    {
      step: 1,
      title: "Enter Credentials",
      description: "Use your institutional email and password"
    },
    {
      step: 2,
      title: "Secure Login",
      description: "Your data is encrypted end-to-end"
    },
    {
      step: 3,
      title: "Access Dashboard",
      description: "Start using all platform features"
    }
  ];

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-slate-950 bg-gradient-to-br from-amber-50 via-rose-100/10 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-blue-900/40">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-rose-900 dark:text-blue-400">EduNexus<span className="text-rose-600 dark:text-blue-500">.</span></h1>
              <p className="text-xs text-rose-500 dark:text-blue-600/60 uppercase tracking-widest font-black">CMS Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-blue-400 hover:text-rose-600 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Portal Home
            </Link>
            <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-rose-700 hover:text-rose-600 dark:text-blue-400 dark:hover:text-blue-300 transition-all hover:bg-rose-100 dark:hover:bg-white/5 active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200/50 hover:bg-rose-700 transition-all active:scale-95 hidden sm:block">
              Support Center
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Branding & Info (hidden on mobile) */}
          <div className="hidden lg:block space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
                <Shield className="w-4 h-4 text-rose-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-rose-600 dark:text-blue-400 uppercase tracking-widest">Secure Login Portal</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-black text-rose-900 dark:text-blue-300 mb-6 leading-[1.1] tracking-tighter">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-400 dark:to-blue-600">EduNexus</span>
              </h2>

              <p className="text-lg text-rose-800/80 dark:text-blue-500/80 mb-8 max-w-md font-medium">
                Experience the future of education management with our all-in-one platform for students, teachers, and administrators.
              </p>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="text-lg font-black text-rose-900 dark:text-blue-300 mb-4 flex items-center gap-2 uppercase tracking-tight">
                <Sparkles className="w-5 h-5 text-rose-600" />
                Advanced Ecosystem
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-5 bg-white/40 dark:bg-white/5 border border-rose-100/50 dark:border-white/5 backdrop-blur-md rounded-[1.5rem] hover:border-rose-400/50 transition-all group shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                      <div className={`text-rose-600 dark:text-blue-400`}>
                        {feature.icon}
                      </div>
                    </div>
                    <h4 className="text-[12px] font-black text-rose-900 dark:text-blue-300 uppercase tracking-tight mb-1.5">{feature.title}</h4>
                    <p className="text-[10px] font-bold text-rose-700/60 dark:text-blue-500/60 uppercase tracking-widest leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="p-4 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 backdrop-blur-sm rounded-xl shadow-sm">
              <h4 className="font-medium text-rose-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-600 dark:text-blue-500" />
                Getting Started
              </h4>
              <div className="space-y-4">
                {quickStartSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-200/50">
                      <span className="text-xs font-black text-rose-600 dark:text-blue-400">{step.step}</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-rose-900 dark:text-blue-300 uppercase tracking-tight">{step.title}</h5>
                      <p className="text-[10px] font-bold text-rose-700/60 dark:text-blue-500/60 uppercase tracking-widest mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Trusted by 50+ educational institutions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative">
            <div className="glass-panel rounded-2xl p-8 relative overflow-hidden group w-full max-w-md mx-auto shadow-2xl">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 dark:bg-blue-500/20 blur-[60px] rounded-full group-hover:bg-rose-500/20 dark:group-hover:bg-blue-500/30 transition-all duration-700"></div>

              <div className="mb-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-600/20 dark:shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-rose-900 dark:text-blue-300 tracking-tight mb-2 uppercase">Sign In</h3>
                <p className="text-rose-700/60 dark:text-blue-500/60 text-[10px] font-black uppercase tracking-widest">Access your educational dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-700/70 dark:text-blue-500/70 ml-1 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 dark:text-blue-700" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-amber-50 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 text-rose-900 dark:text-blue-300 rounded-lg py-3 pl-10 pr-4 text-sm placeholder:text-rose-300 dark:placeholder:text-blue-900 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-white/10 transition-colors shadow-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-rose-700/70 dark:text-blue-500/70 ml-1 uppercase tracking-widest">Password</label>
                    <a href="#" className="text-[10px] font-black text-rose-600 dark:text-blue-400 hover:text-rose-500 dark:hover:text-blue-300 uppercase tracking-widest">Forgot?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 dark:text-blue-700">
                      <Lock className="w-full h-full" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-amber-50 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 text-rose-900 dark:text-blue-300 rounded-lg py-3 pl-10 pr-10 text-sm placeholder:text-rose-300 dark:placeholder:text-blue-900 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-white/10 transition-colors shadow-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 dark:text-blue-700 hover:text-rose-900 dark:hover:text-blue-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-amber-50 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-[10px] font-bold text-rose-700/70 dark:text-blue-500/70 uppercase tracking-widest">
                    Remember me for 30 days
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-shake">
                    <p className="text-sm text-rose-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:shadow-rose-900/30 dark:hover:shadow-blue-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-rose-200 dark:border-blue-500/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 bg-amber-50 dark:bg-slate-950 text-rose-700/40 dark:text-blue-700 font-black uppercase tracking-[0.3em]">Advanced access</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 text-rose-900 dark:text-blue-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-colors"
                >
                  Single Sign-On (SSO)
                </button>
              </form>

              <div className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-rose-700/40 relative z-10">
                Don't have an account?{' '}
                <a href="#" className="text-rose-600 dark:text-blue-400 hover:text-rose-500 font-black">
                  Request institutional access
                </a>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-700/40">
              <Shield className="w-3 h-3" />
              <span>Your login is secured with 256-bit encryption</span>
            </div>

            {/* Trust Indicators */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-2">
                <div className="text-lg font-black text-rose-900 dark:text-blue-300 uppercase tracking-tighter">50+</div>
                <div className="text-[9px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">Institutions</div>
              </div>
              <div className="p-2">
                <div className="text-lg font-black text-rose-900 dark:text-blue-300 uppercase tracking-tighter">99.9%</div>
                <div className="text-[9px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">Uptime</div>
              </div>
              <div className="p-2">
                <div className="text-lg font-black text-rose-900 dark:text-blue-300 uppercase tracking-tighter">ISO</div>
                <div className="text-[9px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">Certified</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-rose-200 dark:border-blue-500/10 bg-amber-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">© 2024 EduNexus. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <a href="#" className="text-[10px] font-black text-rose-700/40 dark:text-blue-700 hover:text-rose-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">Privacy Policy</a>
                <a href="#" className="text-[10px] font-black text-rose-700/40 dark:text-blue-700 hover:text-rose-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">Terms</a>
                <a href="#" className="text-[10px] font-black text-rose-700/40 dark:text-blue-700 hover:text-rose-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">Cookies</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>System Online</span>
              </div>
              <span className="text-[10px] font-black text-rose-700/40 dark:text-blue-700 uppercase tracking-widest">v2.1.0-EDUNEXUS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};