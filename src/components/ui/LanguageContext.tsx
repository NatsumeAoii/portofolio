"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import contentData from '@/data/content.json';
import { SiteContent, LocalizedContent, SharedContent } from '@/types/content';

type Language = 'en' | 'id';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    content: LocalizedContent;
    shared: SharedContent;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const storedLang = localStorage.getItem('lang') as Language;
        if (storedLang && (storedLang === 'en' || storedLang === 'id')) {
            setLanguage(storedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
    };

    const value = {
        language,
        setLanguage: handleSetLanguage,
        content: (contentData as unknown as SiteContent)[language],
        shared: (contentData as unknown as SiteContent)._shared,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
