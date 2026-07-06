"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "Light" | "Dark" | "System";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "Light" | "Dark";
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "bookhaven-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeClass(theme: Theme) {
  const isDark = theme === "Dark" || (theme === "System" && getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
  return isDark;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("Light");
  const [resolvedTheme, setResolvedTheme] = useState<"Light" | "Dark">("Light");

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) || "Light";
    setThemeState(stored);
    setResolvedTheme(applyThemeClass(stored) ? "Dark" : "Light");

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) || "Light";
      if (current === "System") {
        setResolvedTheme(applyThemeClass(current) ? "Dark" : "Light");
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
    setResolvedTheme(applyThemeClass(next) ? "Dark" : "Light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var theme = localStorage.getItem('${THEME_STORAGE_KEY}') || 'Light';
    var isDark = theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;
