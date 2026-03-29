import React, { useState } from 'react';
import { 
  GraduationCap, Mail, Lock, Eye, EyeOff, Shield, Sparkles, 
  Home, Info, HelpCircle, Users, BarChart, Clock, Award,
  BookOpen, Calendar, CheckCircle, Sun, Moon
} from 'lucide-react';
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../src/contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
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
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { loginWithSSO } = useAuth();

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

  const handleSSO = async (provider: 'Google' | 'Microsoft' | 'Institution') => {
    if (isLoading || ssoLoading) return;
    
    setSsoLoading(provider);
    setError('');
    
    try {
      const success = await loginWithSSO(provider);
      if (!success) {
        setError(`${provider} authentication failed. Please try institutional login.`);
      }
    } catch (err) {
      setError('SSO connection error. Please try again later.');
    } finally {
      setSsoLoading(null);
    }
  };

  // Features list
  const features = [
    {
      icon: <BarChart className="w-5 h-5" />,
      title:"Real-time Analytics",
      description:"Live insights into academic performance",
      color:"indigo"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title:"Unified Platform",
      description:"Students, teachers, and parents in one place",
      color:"blue"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title:"24/7 Access",
      description:"Access your data anytime, anywhere",
      color:"emerald"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title:"Smart Reports",
      description:"Automated performance analysis",
      color:"amber"
    }
  ];

  // Quick start guide
  const quickStartSteps = [
    {
      step: 1,
      title:"Enter Credentials",
      description:"Use your institutional email and password"
    },
    {
      step: 2,
      title:"Secure Login",
      description:"Your data is encrypted end-to-end"
    },
    {
      step: 3,
      title:"Access Dashboard",
      description:"Start using all platform features"
    }
  ];

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-[#050508] bg-gradient-to-br from-amber-50 via-rose-100/10 to-amber-50 dark:from-[#050508] dark:via-[#0a0a1f] dark:to-[#050508] flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="px-6 py-4 border-b border-rose-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-600 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-indigo-900/40">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-rose-800 dark:text-white">ZenithEdu<span className="text-rose-600 dark:text-indigo-400">.</span></h1>
              <p className="text-xs text-rose-900/60 dark:text-white/60 tracking-widest font-black">CMS Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Portal Home
            </Link>
            <div className="w-px h-4 bg-rose-200 dark:bg-white/10" />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-white transition-all hover:bg-rose-100 dark:hover:bg-white/5 active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link 
              to="/support"
              className="px-5 py-2.5 text-[10px] font-black tracking-widest bg-rose-600 dark:bg-indigo-600 text-white rounded-xl shadow-lg shadow-rose-200/50 dark:shadow-indigo-900/40 hover:bg-rose-700 dark:hover:bg-indigo-700 transition-all active:scale-95 hidden sm:block"
            >
              Support Center
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-500/5 dark:bg-indigo-500/10 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 dark:bg-violet-500/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Info */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6 text-rose-600 dark:text-indigo-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold tracking-widest">Secure Login Portal</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tighter">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-400 dark:to-violet-600">ZenithEdu</span>
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300/80 mb-8 max-w-md font-medium leading-relaxed">
                Experience the future of education management with our all-in-one platform for students, teachers, and administrators.
              </p>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
                <Sparkles className="w-5 h-5 text-rose-500 dark:text-indigo-400" />
                Advanced Ecosystem
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="p-5 bg-white/40 dark:bg-white/[0.02] border border-rose-100/50 dark:border-white/5 backdrop-blur-md rounded-[1.5rem] hover:border-rose-400/50 dark:hover:border-indigo-500/30 transition-all group shadow-sm hover:shadow-rose-900/5"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                      <div className={`text-rose-600 dark:text-indigo-400`}>
                        {feature.icon}
                      </div>
                    </div>
                    <h4 className="text-[12px] font-black text-slate-900 dark:text-white tracking-tight mb-1.5">{feature.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500/60 dark:text-slate-400/60 tracking-widest leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="p-4 bg-white/40 dark:bg-white/[0.02] border border-rose-200/30 dark:border-white/5 backdrop-blur-sm rounded-xl shadow-sm">
              <h4 className="font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-500 dark:text-indigo-400" />
                Getting Started
              </h4>
              <div className="space-y-4">
                {quickStartSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-200/50 dark:border-white/5">
                      <span className="text-xs font-black text-rose-600 dark:text-indigo-400">{step.step}</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{step.title}</h5>
                      <p className="text-[10px] font-bold text-slate-500/60 dark:text-slate-400/60 tracking-widest mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-rose-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-sm /60">
                  <CheckCircle className="w-4 h-4  dark:" />
                  <span>Trusted by 500+ educational institutions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group w-full max-w-md mx-auto shadow-2xl bg-white/40 dark:bg-white/[0.03] border border-rose-200/50 dark:border-white/10 backdrop-blur-xl">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 dark:bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-rose-500/20 dark:group-hover:bg-indigo-500/30 transition-all duration-700"></div>
              
              <div className="mb-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-600/20 dark:shadow-indigo-600/40 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Sign In</h3>
                <p className="text-slate-500/60 dark:text-slate-400/60 text-[10px] font-black tracking-widest">Access your educational dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-900/50 dark:text-white/50 ml-1 tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-amber-50/50 dark:bg-white/5 border border-rose-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm placeholder:text-slate-900/30 dark:placeholder:text-white/20 focus:outline-none focus:border-rose-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-white/[0.08] transition-all shadow-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-900/50 dark:text-white/50 ml-1 tracking-widest">Password</label>
                    <a href="#" className="text-[10px] font-black text-rose-600 dark:text-indigo-400 hover:text-rose-700 dark:hover:text-indigo-300 tracking-widest">Forgot?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500">
                      <Lock className="w-full h-full" />
                    </div>
                    <input
                      type={showPassword ?"text" :"password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-amber-50/50 dark:bg-white/5 border border-rose-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm placeholder:text-slate-900/30 dark:placeholder:text-white/20 focus:outline-none focus:border-rose-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-white/[0.08] transition-all shadow-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-white"
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
                    className="w-4 h-4 bg-white/50 dark:bg-white/5 border border-rose-200 dark:border-white/10 rounded focus:ring-rose-500 dark:focus:ring-indigo-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-[10px] font-bold text-slate-500/60 dark:text-slate-400/60 tracking-widest">
                    Remember me for 30 days
                  </label>
                </div>
 
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-shake">
                    <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-600 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-500 text-white font-black text-[10px]  tracking-[0.25em] transition-all shadow-lg shadow-rose-900/20 dark:shadow-indigo-900/40 hover:shadow-xl hover:shadow-rose-900/30 dark:hover:shadow-indigo-900/60 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Enter Dashboard'
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-rose-200 dark:border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 bg-white/0 text-slate-500/30 dark:text-slate-400/30 font-black tracking-[0.3em]">Institutional</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleSSO('Google')}
                    disabled={isLoading || !!ssoLoading}
                    className="flex items-center justify-center gap-2 py-3 bg-white/50 dark:bg-white/[0.03] border border-rose-200 dark:border-white/10 rounded-xl font-black text-[9px] tracking-widest hover:bg-rose-50 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50"
                  >
                    {ssoLoading === 'Google' ? (
                      <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    STUDENT (GOOGLE)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSSO('Microsoft')}
                    disabled={isLoading || !!ssoLoading}
                    className="flex items-center justify-center gap-2 py-3 bg-white/50 dark:bg-white/[0.03] border border-rose-200 dark:border-white/10 rounded-xl font-black text-[9px] tracking-widest hover:bg-rose-50 dark:hover:bg-white/[0.08] transition-all disabled:opacity-50"
                  >
                    {ssoLoading === 'Microsoft' ? (
                      <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 23 23">
                        <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                    )}
                    TEACHER (MSFT)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSSO('Institution')}
                  disabled={isLoading || !!ssoLoading}
                  className="w-full py-3 bg-rose-500/5 dark:bg-white/[0.03] border border-rose-200 dark:border-white/10 rounded-xl font-black text-[10px] tracking-widest hover:bg-rose-500/10 dark:hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
                >
                  {ssoLoading === 'Institution' && <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />}
                  Admin Single Sign-On
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-6">
                <Link to="/support" className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-rose-500 transition-colors uppercase italic">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Need Help?
                </Link>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                <Link to="/privacy" className="text-[10px] font-black tracking-widest text-slate-400 hover:text-rose-500 transition-colors uppercase italic">
                  Privacy Policy
                </Link>
              </div>

              <div className="mt-6 text-center text-[10px] font-black tracking-widest text-slate-400/40 relative z-10">
                Don't have access?{' '}
                <a href="#" className="text-slate-400 hover:text-rose-500 dark:hover:text-white transition-colors font-black">
                  Request Credentials
                </a>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-slate-400/40">
              <Shield className="w-3 h-3 text-rose-500 dark:text-indigo-400" />
              <span>Secured with 256-bit AES Encryption</span>
            </div>

            {/* Trust Indicators */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-2">
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">500+</div>
                <div className="text-[9px] font-black text-slate-500/40 dark:text-slate-400/40 tracking-widest">Institutions</div>
              </div>
              <div className="p-2">
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">99.9%</div>
                <div className="text-[9px] font-black text-slate-500/40 dark:text-slate-400/40 tracking-widest">Uptime</div>
              </div>
              <div className="p-2">
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">SOC2</div>
                <div className="text-[9px] font-black text-slate-500/40 dark:text-slate-400/40 tracking-widest">Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-rose-200 dark:border-white/10 bg-amber-50/50 dark:bg-[#050508] backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-500/30 dark:text-slate-400/30 tracking-widest">© 2025 ZenithEdu. Final Year Portfolio.</span>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="text-[10px] font-black text-slate-500/30 dark:text-slate-400/30 hover:text-rose-600 dark:hover:text-white tracking-widest transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="text-[10px] font-black text-slate-500/30 dark:text-slate-400/30 hover:text-rose-600 dark:hover:text-white tracking-widest transition-colors">Terms</Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500/30 dark:text-slate-400/30 tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Core Online</span>
              </div>
              <span className="text-[10px] font-black text-slate-500/30 dark:text-slate-400/30 tracking-widest">v2.5.0-STABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};