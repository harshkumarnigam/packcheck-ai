import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, currentPath }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      setIsLoggedIn(true);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setPassword('');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Scanner', path: '/scanner', icon: '📷' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Reports', path: '/reports', icon: '📋' },
    { name: 'Rules', path: '/rules', icon: '⚖️' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
  ];

  return (
    <>
      <header className="app-navbar-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#0b1120',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '19px',
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
              flexShrink: 0
            }}>
              🛡️
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, flexShrink: 0 }}>
              <span style={{ fontSize: '17px', fontWeight: 900, color: '#38bdf8', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                PackCheck AI
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                TechVortex
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '7px 11px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            to="/scanner"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📷 Scan
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-hamburger-btn"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* 1-Click Mobile Horizontal Quick Navigation Strip */}
      <nav className="mobile-quick-nav-strip" aria-label="1-Click Quick Navigation">
        {navLinks.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`quick-pill-item ${isActive ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: '#0b1120',
          borderBottom: '1px solid #1e293b',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'sticky',
          top: '60px',
          zIndex: 99
        }}>
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  padding: '6px 0'
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Login Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
            color: '#f8fafc'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', margin: '0 0 4px 0', textAlign: 'center' }}>Sign In</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0', textAlign: 'center' }}>Inspector / Enterprise Account</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <button
                type="submit"
                style={{ marginTop: '6px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '12px' }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent 1-Click Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0b1120',
        borderTop: '1px solid #1e293b',
        display: 'none', // Shown on mobile via styles.css
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 4px 10px',
        zIndex: 9999,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {navLinks.map((link) => {
          const isActive = currentPath === link.path;
          const icons: Record<string, string> = {
            '/': '🏠',
            '/scanner': '📷',
            '/dashboard': '📊',
            '/reports': '📋',
            '/rules': '⚖️',
            '/about': 'ℹ️',
          };
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                textDecoration: 'none',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontSize: '11px',
                fontWeight: isActive ? 800 : 500,
                padding: '4px 6px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                flex: 1,
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '16px' }}>{icons[link.path] || '🔗'}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}