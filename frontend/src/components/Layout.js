import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const navItems = [
  { to: '/dashboard', emoji: '🏠', label: 'Dashboard' },
  { to: '/profile', emoji: '👤', label: 'My Profile' },
  { to: '/roadmap', emoji: '📆', label: '30-Day Roadmap' },
  { to: '/tests/coding', emoji: '💻', label: 'Coding Test' },
  { to: '/tests/aptitude', emoji: '🧠', label: 'Aptitude Test' },
  { to: '/tests/communication', emoji: '🗣️', label: 'Communication' },
  { to: '/resources', emoji: '📚', label: 'Resources' },
  { to: '/results', emoji: '📊', label: 'My Results' },
];

const sidebarStyles = `
  .placeai-sidebar {
    width: 260px;
    min-height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    background: linear-gradient(
      175deg,
      #eef2ff 0%,
      #e8eeff 18%,
      #ede8ff 36%,
      #e8f5f0 58%,
      #edf4ff 78%,
      #f0eeff 100%
    );
    border-right: 1px solid rgba(139, 92, 246, 0.13);
    box-shadow: 4px 0 32px rgba(99, 102, 241, 0.07), 2px 0 8px rgba(0,0,0,0.04);
    transition: transform 0.3s ease;
  }

  .placeai-sidebar::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 240px 280px at 0% 5%,   rgba(99,  102, 241, 0.11) 0%, transparent 65%),
      radial-gradient(ellipse 200px 220px at 100% 95%, rgba(16,  185, 129, 0.09) 0%, transparent 65%),
      radial-gradient(ellipse 180px 160px at 90%  30%, rgba(139, 92,  246, 0.08) 0%, transparent 65%);
    pointer-events: none;
  }

  /* ── Logo ── */
  .placeai-logo-area {
    padding: 22px 20px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(139, 92, 246, 0.1);
    position: relative;
  }

  .placeai-logo-gem {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    box-shadow: 0 4px 18px rgba(99, 102, 241, 0.42), 0 2px 6px rgba(0,0,0,0.1);
    flex-shrink: 0;
  }

  .placeai-logo-text {
    font-size: 20px;
    font-weight: 800;
    font-family: 'Space Grotesk', sans-serif;
    background: linear-gradient(130deg, #3730a3 0%, #6d28d9 55%, #0e7490 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.4px;
  }

  .placeai-logo-badge {
    margin-left: auto;
    font-size: 8.5px;
    font-weight: 700;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.22);
    border-radius: 4px;
    padding: 2px 6px;
    letter-spacing: 0.6px;
    flex-shrink: 0;
  }

  /* ── Nav ── */
  .placeai-nav {
    flex: 1;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }

  .placeai-nav-section {
    font-size: 9px;
    font-weight: 700;
    color: rgba(100, 116, 139, 0.5);
    letter-spacing: 1.4px;
    text-transform: uppercase;
    padding: 10px 8px 5px;
  }

  .placeai-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    cursor: pointer;
    color: #475569;
    font-size: 13.5px;
    font-weight: 500;
    transition: all 0.16s ease;
    text-decoration: none;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .placeai-nav-item:hover {
    color: #4338ca;
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.15);
  }

  .placeai-nav-item.active {
    color: #3730a3;
    font-weight: 600;
    background: linear-gradient(135deg,
      rgba(99, 102, 241, 0.16) 0%,
      rgba(139, 92,  246, 0.11) 100%
    );
    border-color: rgba(99, 102, 241, 0.24);
    box-shadow:
      0 2px 14px rgba(99, 102, 241, 0.13),
      inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }

  .placeai-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 18%;
    bottom: 18%;
    width: 3px;
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.55);
  }

  .placeai-nav-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.65);
    flex-shrink: 0;
    transition: all 0.16s ease;
    box-shadow: 0 1px 4px rgba(99, 102, 241, 0.08);
  }

  .placeai-nav-item.active .placeai-nav-icon {
    background: linear-gradient(135deg,
      rgba(99,  102, 241, 0.2),
      rgba(139, 92,  246, 0.16)
    );
    box-shadow: 0 2px 10px rgba(99, 102, 241, 0.22);
  }

  .placeai-nav-item:hover .placeai-nav-icon {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.16);
  }

  .placeai-divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(139, 92, 246, 0.18),
      transparent
    );
    margin: 6px 8px;
  }

  /* ── Bottom / User ── */
  .placeai-bottom {
    padding: 12px 12px 18px;
    border-top: 1px solid rgba(139, 92, 246, 0.1);
  }

  .placeai-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.16s ease;
    border: 1px solid rgba(139, 92, 246, 0.1);
    background: rgba(255, 255, 255, 0.55);
    box-shadow: 0 1px 4px rgba(99, 102, 241, 0.07);
  }

  .placeai-user-card:hover {
    background: rgba(255, 241, 242, 0.85);
    border-color: rgba(239, 68, 68, 0.2);
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
  }

  .placeai-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 10px rgba(99, 102, 241, 0.32);
  }

  .placeai-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 130px;
  }

  .placeai-user-action {
    font-size: 11px;
    color: #ef4444;
    margin-top: 1px;
    opacity: 0.72;
  }

  /* ── Main content offset ── */
  .placeai-main {
    flex: 1;
    margin-left: 260px;
    min-height: 100vh;
    background: var(--bg);
  }

  @media (max-width: 768px) {
    .placeai-sidebar { transform: translateX(-100%); }
    .placeai-main   { margin-left: 0; }
  }
`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <style>{sidebarStyles}</style>
      <div className="app-container">

        {/* ── Sidebar ── */}
        <aside className="placeai-sidebar">

          <div className="placeai-logo-area">
            <div className="placeai-logo-gem">🎯</div>
            <span className="placeai-logo-text">PlaceAI</span>
            <span className="placeai-logo-badge">BETA</span>
          </div>

          <nav className="placeai-nav">

            <div className="placeai-nav-section">Overview</div>
            {navItems.slice(0, 3).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `placeai-nav-item${isActive ? ' active' : ''}`}
              >
                <div className="placeai-nav-icon">{item.emoji}</div>
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="placeai-divider" />
            <div className="placeai-nav-section">Practice</div>
            {navItems.slice(3, 6).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `placeai-nav-item${isActive ? ' active' : ''}`}
              >
                <div className="placeai-nav-icon">{item.emoji}</div>
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="placeai-divider" />
            <div className="placeai-nav-section">Insights</div>
            {navItems.slice(6).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `placeai-nav-item${isActive ? ' active' : ''}`}
              >
                <div className="placeai-nav-icon">{item.emoji}</div>
                <span>{item.label}</span>
              </NavLink>
            ))}

          </nav>

          <div className="placeai-bottom">
            <div className="placeai-user-card" onClick={handleLogout} title="Click to logout">
              <div className="placeai-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <div style={{ overflow: 'hidden' }}>
                <div className="placeai-user-name">{user?.name}</div>
                <div className="placeai-user-action">Sign out →</div>
              </div>
            </div>
          </div>

        </aside>

        {/* ── Page content ── */}
        <main className="placeai-main">
          <Outlet />
        </main>

      </div>
    </>
  );
}