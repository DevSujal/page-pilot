import { useEffect } from "react";

export default function ThemeToggle({ isDark, toggleTheme, className }) {
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${className}`}
    >
      {isDark ? "🌞" : "🌙"}
    </button>
  );
}
