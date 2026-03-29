import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme;
        return saved || 'system';
    });

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (currentTheme: Theme) => {
            let actualTheme = currentTheme;
            if (currentTheme === 'system') {
                actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            if (actualTheme === 'dark') {
                root.classList.add('dark');
                setIsDark(true);
            } else {
                root.classList.remove('dark');
                setIsDark(false);
            }
        };

        applyTheme(theme);

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme('system');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
