import { Outlet, NavLink } from 'react-router-dom';
import { useI18n } from './i18n.jsx';

export default function App() {
  const { t, toggle } = useI18n();
  return (
    <>
      <nav className="topnav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.booking')}
        </NavLink>
        <NavLink to="/list" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.list')}
        </NavLink>
        <button type="button" className="lang-toggle" onClick={toggle} aria-label="language">
          {t('lang.switch')}
        </button>
      </nav>
      <Outlet />
    </>
  );
}
