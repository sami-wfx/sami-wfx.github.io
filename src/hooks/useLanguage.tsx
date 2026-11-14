"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { LOCALES, translations, type Locale, type Translation } from "@/lib/i18n/translations";

const STORAGE_KEY = "saivo-locale";
const listeners = new Set<() => void>();
let cachedLocale: Locale = "ru";

function isLocale(value: string | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Server and first client render both resolve to "ru" — never blocked on localStorage. */
function getServerSnapshot(): Locale {
  return "ru";
}

function getClientSnapshot(): Locale {
  return cachedLocale;
}

function setStoredLocale(locale: Locale) {
  cachedLocale = locale;
  window.localStorage.setItem(STORAGE_KEY, locale);
  listeners.forEach((callback) => callback());
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  // Hydrate the store from localStorage once, after mount (avoids SSR mismatch).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored) && stored !== cachedLocale) {
      cachedLocale = stored;
      listeners.forEach((callback) => callback());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value: LanguageContextValue = {
    locale,
    setLocale: setStoredLocale,
    t: translations[locale],
  };

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
