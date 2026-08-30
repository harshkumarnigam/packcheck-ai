import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Rules from './pages/Rules';
import About from './pages/About';

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadSample = (_index: number) => {
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