import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Premium ThemeToggle button that toggles Tailwind's 'dark' class.
 * Saves preference in localStorage. Dark mode is default.
 */
export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    
    // Default to dark unless explicit light theme is saved
    if (savedTheme === 'light') {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-surface-lightBorder dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-text-lightPrimary dark:text-text-darkPrimary hover:bg-zinc-100 dark:hover:bg-zinc-800/80 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-primary hover:rotate-45 transition-transform duration-300" />
      ) : (
        <FiMoon className="w-5 h-5 text-text-lightSecondary hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
