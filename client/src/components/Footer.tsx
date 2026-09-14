import { ScanLine } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface FooterProps {
  nav: NavigateFunction;
}

const FOOTER_LINKS = ['/', '/scanner', '/dashboard', '/reports', '/rules', '/about'];

function labelFor(url: string) {
  if (url === '/') return 'Home';
  const name = url.slice(1);
  return name[0].toUpperCase() + name.slice(1);
}

export default function Footer({ nav }: FooterProps) {
  return (
    <footer>
      <div>
        <div className="brand">
          <span className="brand-icon">
            <ScanLine size={18} />
          </span>
          <span>
            PackCheck <b>AI</b>
          </span>
        </div>
        <p>AI-assisted packaged label compliance analysis.</p>
      </div>

      <div className="footer-links">
        {FOOTER_LINKS.map((url) => (
          <button key={url} onClick={() => nav(url)}>
            {labelFor(url)}
          </button>
        ))}
      </div>

      <small>© 2026 PackCheck AI — Team TechVortex</small>
    </footer>
  );
}
