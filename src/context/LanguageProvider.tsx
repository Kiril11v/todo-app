import { useState, useEffect, type ReactNode } from "react";
import { LanguageContext } from "./languageContext";
import type { Language } from "./translations";

const langMap: Record<Language, string> = {
    ua: "uk",
    en: "en",
    pl: "pl",
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [language, setLanguage] = useState<Language>("en");

    const changeLanguage = (lang: Language) => setLanguage(lang);

    useEffect(() => {
        document.documentElement.lang = langMap[language];
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};