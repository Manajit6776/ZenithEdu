import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, LanguageCode } from '../src/data';

interface LanguageContextType {
    currentLanguage: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string, options?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

    const t = (key: string, options?: Record<string, string>): string => {
        const langData = translations[currentLanguage] || translations['en'];
        let translatedString: string = langData[key] !== undefined ? langData[key] : `[${key}]`;

        if (options) {
            for (const optionKey in options) {
                translatedString = translatedString.replace(new RegExp(`{{${optionKey}}}`, 'g'), options[optionKey]);
            }
        }
        return translatedString;
    };

    const setLanguage = (lang: LanguageCode) => {
        setCurrentLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
