import { Shield } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface FooterProps {
  nav: NavigateFunction;
}

const FOOTER_LINKS = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Scanner', path: '/scanner', icon: '📷' },
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Reports', path: '/reports', icon: '📋' },
  { name: 'Rules', path: '/rules', icon: '⚖️' },
  { name: 'About', path: '/about', icon: 'ℹ️' },
];

export default function Footer({ nav }: FooterProps) {
  return (
    <footer style={{
      borderTop: '1px solid #1e293b',
      backgroundColor: '#07101e',
      padding: '32px 24px 48px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
              PackCheck <span style={{ color: '#38bdf8' }}>AI</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              AI-Powered Indian Packaged Commodity Regulatory Intelligence • SIH 2026
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FOOTER_LINKS.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => nav(link.path)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '20px auto 0',
        paddingTop: '16px',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <span>© 2026 PackCheck AI • Built by Team TechVortex (Harsh Kumar Nigam & Team)</span>
        <span style={{ color: '#0284c7', fontWeight: 700 }}>Legal Metrology • FSSAI 2020 • AGMARK • BIS/ISI</span>
      </div>
    </footer>
  );
}
