import ThemeToggle from "./ThemeToggle";

// components/Header.jsx
export default function Header({ isDark, toggleTheme }) {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold animate-fade-in">Chrome Chat</h1>
        <p className="text-sm opacity-75">Connected</p>
      </div>
      <ThemeToggle className="h-10" isDark={isDark} toggleTheme={toggleTheme} />
    </header>
  );
}
