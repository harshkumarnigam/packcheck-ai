import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ theme, toggleTheme, currentPath }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    { name: 'Home', path: '/' },
    { name: 'Scanner', path: '/scanner' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Reports', path: '/reports' },
    { name: 'Rules', path: '/rules' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        backgroundColor: '#0b1120',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>PackCheck AI</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>TechVortex</span>
          </Link>

          <nav style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#38bdf8' : '#94a3b8',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            to="/scanner"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            📷 Scan Product
          </Link>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Logout ({userEmail.split('@')[0]})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '8px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Login
            </button>
          )}
        </div>
      </header>

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
            padding: '28px',
            width: '100%',
            maxWidth: '360px',
            color: '#f8fafc'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', margin: '0 0 6px 0', textAlign: 'center' }}>Welcome Back</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0', textAlign: 'center' }}>Sign in to your account</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    backgroundColor: '#1e293b',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    backgroundColor: '#1e293b',
                    color: '#ffffff'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  padding: '11px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}