import { createContext, useContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

const langMap = {
    ua: "uk",
    en: "en",
    pl: "pl",
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("en")  // ua en pl

    const changeLanguage = (lang) => setLanguage(lang);

    useEffect(() => {
        document.documentElement.lang = langMap[language] ?? language;
    }, [language]);

    return(
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext);