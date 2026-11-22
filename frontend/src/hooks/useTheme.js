import { useCallback, useEffect, useState } from "react";

const KEY = "airsense_theme";
const DEFAULT_THEME = "dark"; // change to "light" to make light the default

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage unavailable: fall through to the default
  }
  return DEFAULT_THEME;
}

export default function useTheme() {
  const [theme, setThemeState] = useState(readInitialTheme);

  // Apply the theme to the whole page
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Only a choice made by the user is saved
  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // ignore: the theme just won't survive a reload
    }
  }, []);

  return { theme, setTheme };
}