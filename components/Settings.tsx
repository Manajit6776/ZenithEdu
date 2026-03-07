import React, { useState, useEffect } from 'react';
import { Bell, Moon, Lock, Save, Smartphone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

export const Settings: React.FC = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { currentLanguage, t } = useLanguage();

  // Load saved preferences on mount
  useEffect(() => {
    const savedEmailNotif = localStorage.getItem('emailNotif');
    const savedSmsNotif = localStorage.getItem('smsNotif');

    if (savedEmailNotif !== null) setEmailNotif(savedEmailNotif === 'true');
    if (savedSmsNotif !== null) setSmsNotif(savedSmsNotif === 'true');
  }, []);

  const handleSaveChanges = () => {
    // Save all preferences to localStorage
    localStorage.setItem('emailNotif', emailNotif.toString());
    localStorage.setItem('smsNotif', smsNotif.toString());
    // Theme and Language are handled by their contexts

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleChangePassword = () => {
    alert(t('passwordResetSent'));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'system' | 'light' | 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {t('settingsSaved') || 'Settings saved!'}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-rose-800 dark:text-white">{t('settings')}</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t('settingsDescription')}</p>
      </div>

      <div className="bg-white/40 dark:bg-slate-800 rounded-xl shadow-xl shadow-rose-200/5 border border-rose-200/30 dark:border-slate-700 divide-y divide-rose-100 dark:divide-slate-700">
        {/* Notifications */}
        <div className="p-6">
          <h3 className="text-lg font-black text-rose-800 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            {t('notifications')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-black dark:text-slate-200">{t('emailAlerts')}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('emailAlertsDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300/30 dark:peer-focus:ring-rose-800/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 shadow-inner"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{t('smsNotifications')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('smsNotificationsDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotif}
                  onChange={(e) => setSmsNotif(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300/30 dark:peer-focus:ring-rose-800/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-500" />
            {t('appearance')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('language')}
              </label>
              <LanguageSwitcher />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('themePreference')}
              </label>
              <select
                value={theme}
                onChange={handleThemeChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="system">{t('systemDefault')}</option>
                <option value="light">{t('lightMode')}</option>
                <option value="dark">{t('darkMode')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            {t('security')}
          </h3>
          <button
            onClick={handleChangePassword}
            className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 transition-all active:scale-95"
          >
            {t('changePassword')}
          </button>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t('lastPasswordChange')}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-rose-200/50 font-black uppercase text-[10px] tracking-widest active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};