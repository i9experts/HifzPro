"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/lib/translations/en";
import ar from "@/lib/translations/ar";
import type { Translations } from "@/lib/translations/en";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  t: Translations;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: en,
  toggleLanguage: () => {},
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ar" : "en");
  };

  const t = language === "ar" ? ar : en;
  const isRTL = language === "ar";

  // Apply dir and lang to html element
  useEffect(() => {
    document.documentElement.dir  = t.dir;
    document.documentElement.lang = t.lang;
    document.body.style.fontFamily = t.fontBody;
  }, [language, t]);

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
