import { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useI18n } from './i18n.jsx';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function App() {
  const { t, toggle: toggleLang } = useI18n();
  const [theme, toggleTheme] = useTheme();
  return (
    <>
      <nav className="topnav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.booking')}
        </NavLink>
        <NavLink to="/list" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.list')}
        </NavLink>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button type="button" className="lang-toggle" onClick={toggleLang} aria-label="language">
          {t('lang.switch')}
        </button>
      </nav>
      <Outlet />
    </>
  );
}
