import { useRef, useState } from 'react';
import { Link, Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const themeLabel = theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef(null);
  const input = useRef(null);
  const closeMenu = () => setMenuOpen(false);
  function closeAndFocus() {
    closeMenu();
    menu.current?.focus();
  }

  return (
    <>
      <a className="skip-link" href="#workspace">К содержимому</a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" onClick={closeMenu}>Менеджер задач</Link>
          <button type="button" ref={menu} className="menu-button" aria-expanded={menuOpen}
            aria-controls="list-sidebar" onClick={() => setMenuOpen(!menuOpen)}>Списки</button>
          <button type="button" aria-label={`${themeLabel}. Переключить тему`} onClick={toggleTheme}>
            {themeLabel}
          </button>
        </div>
      </header>
      <div className="app-shell">
        <Sidebar open={menuOpen} onClose={closeMenu} inputRef={input} onEscape={closeAndFocus} />
        <main id="workspace" tabIndex={-1}>
          <Outlet context={{ openLists: () => {
            setMenuOpen(true);
            requestAnimationFrame(() => input.current?.focus());
          } }} />
        </main>
      </div>
    </>
  );
}
