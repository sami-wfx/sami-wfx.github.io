"use client";

import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/translations";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.a11y.languageSwitcher}
      className={cn("flex items-center gap-1 font-mono text-[11px] tracking-[0.1em]", className)}
    >
      {LOCALES.map((code, i) => (
        <div key={code} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            className={cn(
              "group/lang relative rounded-sm py-1 pr-1 pl-1.5 uppercase transition-colors duration-300",
              locale === code ? "text-accent" : "text-ink-faint hover:text-ink-dim"
            )}
          >
            {LOCALE_LABELS[code]}
            <span
              className={cn(
                "absolute inset-x-1.5 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[var(--ease-out-quart)]",
                locale === code ? "scale-x-100" : "group-hover/lang:scale-x-100"
              )}
            />
          </button>
          {i < LOCALES.length - 1 && <span className="text-ink-faint">/</span>}
        </div>
      ))}
    </div>
  );
}
