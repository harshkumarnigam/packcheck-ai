import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Rules from './pages/Rules';
import About from './pages/About';
import { samples } from './data/samples';

function toScannerSample(index: number) {
  const sample = samples[index] ?? samples[0];
  return {
    ...sample,
    brand: 'PackCheck demo',
    category: 'Packaged food',
    harmfulItems: [],
    healthyAlternatives: [],
    ingredients: [],
    nutritionTable: [],
    declarations: sample.fields.map((field) => ({
      name: field.name,
      details: field.value,
      status: field.status,
    })),
    verdict: {
      title: sample.status,
      subtext: sample.notes,
      color: sample.score >= 90 ? '#4ade80' : sample.score >= 70 ? '#fbbf24' : '#f87171',
      bgColor: 'rgba(56, 189, 248, 0.08)',
      borderColor: 'rgba(56, 189, 248, 0.35)',
    },
    fssaiLicense: 'Demo data',
    batchNumber: 'Demo data',
  };
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('packcheck_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('packcheck_theme', theme);
  }, [theme]);

  // Scroll to top immediately on route change so pages open at the top on 1-click
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadSample = (index: number) => {
    localStorage.setItem('packcheck_demo_sample', JSON.stringify(toScannerSample(index)));
    navigate('/scanner');
  };

  return (
    <div className="app">
      <Navbar theme={theme} toggleTheme={toggleTheme} currentPath={location.pathname} />

      <Routes>
        <Route path="/" element={<Home nav={navigate} loadSample={loadSample} />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}