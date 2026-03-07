import React from 'react';
import { languages } from '../src/data';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { currentLanguage, setLanguage } = useLanguage();

    return (
        <div className="flex gap-2">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all font-bold text-white ${currentLanguage === lang.code
                            ? `${lang.color} shadow-lg scale-110 ring-2 ring-white dark:ring-slate-800`
                            : 'bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 hover:scale-105'
                        }`}
                    title={lang.name}
                    aria-label={`Switch to ${lang.name}`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
