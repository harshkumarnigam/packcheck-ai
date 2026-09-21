import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Printer,
  Trash2,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MapPin,
  Shield,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { exportInspectionsToCSV, type StoredScanRecord } from '../services/storage';

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'compliant' | 'warning' | 'violation'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadStored = () => {
    try {
      const saved = localStorage.getItem('packcheck_scan_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReports(parsed);
          setSelectedReport(parsed[0]);
          return;
        }
      }
      // Auto-load rich demo data so page is never empty and opens with 1-click ready data!
      loadDemoReports();
    } catch {
      loadDemoReports();
    }
  };

  useEffect(() => {
    loadStored();
  }, []);

  // 1-Click Demo Reports Loader
  const loadDemoReports = () => {
    const demoItems = [
      {
        id: `DEMO-${Date.now()}-1`,
        productName: 'Kissan Mixed Fruit Jam',
        brand: 'Hindustan Unilever Ltd.',
        category: 'Fruit Jams & Sweet Preserves',
        score: 68,
        statusText: 'PARTIALLY COMPLIANT',
        timestamp: new Date(Date.now() - 3600000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        imageThumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%23831843"/><text x="50%" y="45%" fill="%23F472B6" font-size="28" font-family="sans-serif" text-anchor="middle">🍓</text><text x="50%" y="75%" fill="%23FDF2F8" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">KISSAN JAM</text></svg>',
        geo: {
          latitude: 26.4499,
          longitude: 80.3319,
          district: 'Kanpur (Enforcement Zone 4), Uttar Pradesh',
          inspectorName: 'Inspector H. K. Nigam',
          inspectorBadge: 'FSSAI-ENF-704',
          evidenceHash: 'IND-FSS-7841B-2026',
        },
        fullData: {
          brand: 'Hindustan Unilever Ltd.',
          category: 'Fruit Jams & Sweet Preserves',
          fssaiLicense: '10013022001539',
          mrp: '₹ 145.00 (Incl. of all taxes)',
          netWeight: '500 g',
          verdict: {
            title: 'HIGH SUGAR WARNING ⚠️',
            subtext: 'Excessive Simple Sugar (54g / 100g). Exceeds ICMR-NIN recommended thresholds for children.',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.12)',
            borderColor: '#f59e0b',
          },
          harmfulItems: [
            { ingredient: 'High Simple Sugar (54g / 100g)', level: 'ADVISORY', problem: 'Elevated sugar content. Review against ICMR-NIN recommended thresholds.' },
            { ingredient: 'Preservative (INS 211 Sodium Benzoate)', level: 'MODERATE', problem: 'Chemical antimicrobial preservative.' }
          ],
          declarations: [
            { name: 'Maximum Retail Price (MRP)', status: 'PASS', details: '₹145 printed with unit price ₹0.29/g' },
            { name: 'Net Quantity', status: 'PASS', details: '500 g in standard metric SI units' },
            { name: 'FSSAI 14-Digit License', status: 'PASS', details: 'FSSAI Lic. 10013022001539 verified' },
            { name: 'Consumer Grievance Helpline', status: 'PASS', details: 'Toll-free 1800-10-22-221 declared' },
          ]
        }
      },
      {
        id: `DEMO-${Date.now()}-1b`,
        productName: 'Cadbury Choclairs / Caramel Toffee',
        brand: 'Mondelez India Foods Pvt. Ltd.',
        category: 'Sugar Confectionery & Candies',
        score: 64,
        statusText: 'ADVISORY ATTENTION',
        timestamp: new Date(Date.now() - 5400000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        imageThumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%234A044E"/><text x="50%" y="45%" fill="%23F43F5E" font-size="28" font-family="sans-serif" text-anchor="middle">🍬</text><text x="50%" y="75%" fill="%23FDF4FF" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">TOFFEE</text></svg>',
        geo: {
          latitude: 26.4510,
          longitude: 80.3325,
          district: 'Kanpur (Enforcement Zone 4), Uttar Pradesh',
          inspectorName: 'Inspector H. K. Nigam',
          inspectorBadge: 'FSSAI-ENF-704',
          evidenceHash: 'IND-FSS-5519D-2026',
        },
        fullData: {
          brand: 'Mondelez India Foods Pvt. Ltd.',
          category: 'Sugar Confectionery & Candies',
          fssaiLicense: '10014022002711',
          mrp: '₹ 50.00 (Incl. of taxes)',
          netWeight: '200 g',
          verdict: {
            title: 'CONFECTIONERY ADVISORY • HFSS REVIEW 💡',
            subtext: 'High simple sugars (62g/100g) and hydrogenated vegetable fat. Recommended for occasional consumption.',
            color: '#fb923c',
            bgColor: 'rgba(251, 146, 60, 0.12)',
            borderColor: '#fb923c',
          },
          harmfulItems: [
            { ingredient: 'Refined Sugar & Liquid Glucose (62%)', level: 'ADVISORY', problem: 'Rapid glycemic spike; tooth decay risk in young consumers.' },
            { ingredient: 'Hydrogenated Vegetable Oil', level: 'MODERATE', problem: 'Contains elevated saturated fatty acids.' }
          ],
          declarations: [
            { name: 'Maximum Retail Price (MRP)', status: 'PASS', details: '₹50.00 declared' },
            { name: 'Net Quantity', status: 'PASS', details: '200 g standard metric' },
            { name: 'FSSAI License', status: 'PASS', details: '10014022002711 verified' },
            { name: 'Consumer Grievance Helpline', status: 'PASS', details: 'Toll-free 1800-22-7080' }
          ]
        }
      },
      {
        id: `DEMO-${Date.now()}-2`,
        productName: 'Kurkure Masala Munch',
        brand: 'PepsiCo India Holdings Pvt. Ltd.',
        category: 'Extruded Savory Snack (Namkeen)',
        score: 58,
        statusText: 'ADVISORY ATTENTION',
        timestamp: new Date(Date.now() - 7200000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        imageThumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%237C2D12"/><text x="50%" y="45%" fill="%23FB923C" font-size="28" font-family="sans-serif" text-anchor="middle">🌶️</text><text x="50%" y="75%" fill="%23FFF7ED" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">KURKURE</text></svg>',
        geo: {
          latitude: 26.4520,
          longitude: 80.3340,
          district: 'Kanpur (Enforcement Zone 4), Uttar Pradesh',
          inspectorName: 'Inspector H. K. Nigam',
          inspectorBadge: 'FSSAI-ENF-704',
          evidenceHash: 'IND-FSS-9042C-2026',
        },
        fullData: {
          brand: 'PepsiCo India Holdings Pvt. Ltd.',
          category: 'Extruded Savory Snack (Namkeen)',
          fssaiLicense: '10014064000435',
          mrp: '₹ 20.00 (Incl. of all taxes)',
          netWeight: '75 g',
          verdict: {
            title: 'NUTRITIONAL ADVISORY • HFSS REVIEW 💡',
            subtext: 'Contains Palmolein oil and synthetic flavor enhancers (INS 627, 631). Review for front-of-pack HFSS clarity.',
            color: '#fb923c',
            bgColor: 'rgba(251, 146, 60, 0.12)',
            borderColor: '#fb923c',
          },
          harmfulItems: [
            { ingredient: 'Refined Palmolein Oil (48% Saturated Fat)', level: 'ADVISORY', problem: 'Elevated saturated fatty acids. Transparent front-of-pack labeling advised.' },
            { ingredient: 'Flavor Enhancers (INS 627, INS 631)', level: 'MODERATE', problem: 'Disodium inosinate & guanylate appetite stimulants.' }
          ],
          declarations: [
            { name: 'Maximum Retail Price (MRP)', status: 'PASS', details: '₹20.00 clearly legible' },
            { name: 'Net Quantity', status: 'PASS', details: '75 g declared' },
            { name: 'FSSAI License', status: 'PASS', details: 'License verified on PDP' },
            { name: 'Consumer Care Contact', status: 'PASS', details: 'Helpline & email verified' }
          ]
        }
      },
      {
        id: `DEMO-${Date.now()}-3`,
        productName: 'Amul Pure Cow Desi Ghee',
        brand: 'Amul (GCMMF)',
        category: 'Dairy & Clarified Butter',
        score: 94,
        statusText: 'FULLY COMPLIANT',
        timestamp: new Date(Date.now() - 14400000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        imageThumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%2314532D"/><text x="50%" y="45%" fill="%234ADE80" font-size="28" font-family="sans-serif" text-anchor="middle">🧈</text><text x="50%" y="75%" fill="%23F0FDF4" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">AMUL GHEE</text></svg>',
        geo: {
          latitude: 26.4460,
          longitude: 80.3290,
          district: 'Kanpur (Enforcement Zone 4), Uttar Pradesh',
          inspectorName: 'Inspector H. K. Nigam',
          inspectorBadge: 'FSSAI-ENF-704',
          evidenceHash: 'IND-FSS-1182A-2026',
        },
        fullData: {
          brand: 'Gujarat Cooperative Milk Marketing Federation',
          category: 'Dairy & Clarified Butter',
          fssaiLicense: '10012021000071',
          mrp: '₹ 320.00 (Incl. of all taxes)',
          netWeight: '500 ml',
          verdict: {
            title: 'AGMARK SPECIAL GRADE COMPLIANT ✅',
            subtext: '100% pure milk fat. Zero adulteration, zero trans fat, AGMARK Certificate & FSSAI verified.',
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.12)',
            borderColor: '#22c55e',
          },
          harmfulItems: [],
          declarations: [
            { name: 'AGMARK Special Grade Grading', status: 'PASS', details: 'Baudouin test passed, Reichert-Meissl value verified' },
            { name: 'Maximum Retail Price (MRP)', status: 'PASS', details: '₹320.00 inclusive of taxes' },
            { name: 'FSSAI 14-Digit License', status: 'PASS', details: '10012021000071 printed clearly' },
            { name: 'Customer Care Cell', status: 'PASS', details: 'Toll free 1800-258-3333' }
          ]
        }
      },
      {
        id: `DEMO-${Date.now()}-4`,
        productName: 'Bisleri Packaged Drinking Water',
        brand: 'Bisleri International Pvt. Ltd.',
        category: 'Packaged Drinking Water',
        score: 98,
        statusText: 'FULLY COMPLIANT',
        timestamp: new Date(Date.now() - 28800000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        imageThumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%230C4A6E"/><text x="50%" y="45%" fill="%2338BDF8" font-size="28" font-family="sans-serif" text-anchor="middle">💧</text><text x="50%" y="75%" fill="%23F0F9FF" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">BISLERI</text></svg>',
        geo: {
          latitude: 26.4410,
          longitude: 80.3210,
          district: 'Kanpur (Enforcement Zone 4), Uttar Pradesh',
          inspectorName: 'Inspector H. K. Nigam',
          inspectorBadge: 'FSSAI-ENF-704',
          evidenceHash: 'IND-FSS-4491F-2026',
        },
        fullData: {
          brand: 'Bisleri International Pvt. Ltd.',
          category: 'Packaged Drinking Water',
          fssaiLicense: '10013022001948',
          mrp: '₹ 20.00 (Incl. of all taxes)',
          netWeight: '1 Litre',
          verdict: {
            title: 'BIS IS 14543 CERTIFIED COMPLIANT ✅',
            subtext: 'Mandatory ISI mark CM/L-0002159 verified with batch code and tamper-proof seal.',
            color: '#38bdf8',
            bgColor: 'rgba(56, 189, 248, 0.12)',
            borderColor: '#38bdf8',
          },
          harmfulItems: [],
          declarations: [
            { name: 'BIS / ISI Standard Certification', status: 'PASS', details: 'Mandatory IS 14543 verified with CM/L license' },
            { name: 'Net Quantity', status: 'PASS', details: '1 Litre in standard SI volume unit' },
            { name: 'Ozonation & Mineralization', status: 'PASS', details: 'Declared on PDP' },
            { name: 'Crush After Use Advisory', status: 'PASS', details: 'Recycling guideline present' }
          ]
        }
      }
    ];

    localStorage.setItem('packcheck_scan_history', JSON.stringify(demoItems));
    setReports(demoItems);
    setSelectedReport(demoItems[0]);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all inspection records?')) {
      localStorage.removeItem('packcheck_scan_history');
      setReports([]);
      setSelectedReport(null);
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reports.filter((item) => item.id !== id);
    setReports(updated);
    localStorage.setItem('packcheck_scan_history', JSON.stringify(updated));
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
  };

  const handleExportCSV = () => {
    if (reports.length === 0) {
      alert('No inspection records to export. Click "Load Demo Reports" first!');
      return;
    }
    exportInspectionsToCSV(reports as StoredScanRecord[]);
  };

  // Filtered list
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'compliant') return r.score >= 80;
    if (filter === 'warning') return r.score >= 65 && r.score < 80;
    if (filter === 'violation') return r.score < 65;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '24px 20px 80px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ maxWidth: '1280px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#38bdf8', textTransform: 'uppercase' }}>
            REGULATORY HISTORY & EVIDENCE
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '4px 0 2px 0', color: '#f8fafc' }}>
            Inspection Reports Archive
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Official digital audit trail of packaging compliance scores, flagged ingredients, and GPS timestamps.
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={loadDemoReports}
            style={{
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="1-Click Demo Reports Loader"
          >
            <Sparkles size={14} /> ⚡ Load Demo Reports
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              color: '#4ade80',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={14} /> Print
          </button>

          {reports.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                padding: '8px 12px',
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Trash2 size={13} /> Clear
            </button>
          )}

          <button
            onClick={() => navigate('/scanner')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> 📷 Scan New Label
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* 1-Click Filter Bar & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          
          {/* Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${filter === 'all' ? '#38bdf8' : '#334155'}`,
                backgroundColor: filter === 'all' ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                color: filter === 'all' ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              All Records ({reports.length})
            </button>

            <button
              onClick={() => setFilter('compliant')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${filter === 'compliant' ? '#4ade80' : '#334155'}`,
                backgroundColor: filter === 'compliant' ? 'rgba(74, 222, 128, 0.15)' : '#0f172a',
                color: filter === 'compliant' ? '#4ade80' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              🟢 Compliant ({reports.filter(r => r.score >= 80).length})
            </button>

            <button
              onClick={() => setFilter('warning')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${filter === 'warning' ? '#fbbf24' : '#334155'}`,
                backgroundColor: filter === 'warning' ? 'rgba(251, 191, 36, 0.15)' : '#0f172a',
                color: filter === 'warning' ? '#fbbf24' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              🟡 Warnings ({reports.filter(r => r.score >= 65 && r.score < 80).length})
            </button>

            <button
              onClick={() => setFilter('violation')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${filter === 'violation' ? '#fb923c' : '#334155'}`,
                backgroundColor: filter === 'violation' ? 'rgba(251, 146, 60, 0.15)' : '#0f172a',
                color: filter === 'violation' ? '#fb923c' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              🟠 Needs Review ({reports.filter(r => r.score < 65).length})
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Filter by product or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '12px', outline: 'none', width: '180px' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}>✕</button>
            )}
          </div>
        </div>

        {/* Empty State with 1-Click Demo Loader */}
        {reports.length === 0 ? (
          <div style={{ backgroundColor: '#0f172a', border: '1px dashed #334155', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '46px', marginBottom: '12px' }}>📋</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
              No Inspection Reports in Archive
            </h2>
            <p style={{ margin: '0 auto 20px auto', fontSize: '13px', color: '#94a3b8', maxWidth: '480px' }}>
              Scan product packages via the live camera or upload food labels to build an evidence archive. You can also load realistic sample records instantly.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={loadDemoReports}
                style={{
                  padding: '11px 22px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Sparkles size={16} /> ⚡ Load Sample Reports (1-Click)
              </button>
              <button
                onClick={() => navigate('/scanner')}
                style={{
                  padding: '11px 20px',
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Go to Live Scanner
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1fr 440px' : '1fr', gap: '20px', alignItems: 'start' }}>
            
            {/* Reports List Table */}
            <div style={{ backgroundColor: '#0d1527', border: '1px solid #1e293b', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#131f37', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                      <th style={{ padding: '12px 16px' }}>PRODUCT & BRAND</th>
                      <th style={{ padding: '12px 16px' }}>COMPLIANCE SCORE</th>
                      <th style={{ padding: '12px 16px' }}>LEGAL STATUS</th>
                      <th style={{ padding: '12px 16px' }}>TIMESTAMP & STATION</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((item) => {
                      const isHighRisk = item.score < 65;
                      const isWarning = item.score >= 65 && item.score < 80;
                      const scoreColor = isHighRisk ? '#f87171' : isWarning ? '#fbbf24' : '#4ade80';
                      const isSelected = selectedReport?.id === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedReport(item)}
                          style={{
                            borderBottom: '1px solid #1e293b',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={item.imageThumbnail}
                                alt={item.productName}
                                style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#020617', border: '1px solid #334155', flexShrink: 0 }}
                              />
                              <div>
                                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '13px' }}>
                                  {item.productName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {item.brand || item.fullData?.brand || 'FMCG Packaged Goods'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 900, fontSize: '16px', color: scoreColor }}>
                                {item.score}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>/100</span>
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: `${scoreColor}15`,
                              color: scoreColor,
                              border: `1px solid ${scoreColor}30`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isHighRisk ? <AlertCircle size={11} /> : isWarning ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                              {isHighRisk ? 'HIGH RISK' : isWarning ? 'WARNING' : 'COMPLIANT'}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: '11px', color: '#94a3b8' }}>
                            <div>{item.timestamp}</div>
                            <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <MapPin size={10} /> {item.geo?.district || 'Kanpur Zone 4'}
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReport(item);
                                }}
                                style={{ padding: '5px 9px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                View ↗
                              </button>
                              <button
                                onClick={(e) => handleDeleteItem(item.id, e)}
                                style={{ padding: '5px 8px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1-Click Detailed Inspection Panel */}
            {selectedReport && (
              <div style={{ backgroundColor: '#0d1527', border: '1px solid #38bdf8', borderRadius: '14px', padding: '20px', position: 'sticky', top: '90px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} color="#38bdf8" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>Inspection Docket</h3>
                  </div>
                  <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <img
                    src={selectedReport.imageThumbnail}
                    alt={selectedReport.productName}
                    style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #334155', padding: '6px' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                    {selectedReport.productName}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {selectedReport.brand || selectedReport.fullData?.brand} • {selectedReport.timestamp}
                  </div>
                  <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '3px', fontFamily: 'monospace' }}>
                    Evidence Hash: {selectedReport.geo?.evidenceHash || 'IND-FSS-2026-X8'}
                  </div>
                </div>

                {/* Verdict Card */}
                {selectedReport.fullData?.verdict && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: selectedReport.fullData.verdict.bgColor,
                    border: `1px solid ${selectedReport.fullData.verdict.borderColor}`,
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: selectedReport.fullData.verdict.color, marginBottom: '2px' }}>
                      {selectedReport.fullData.verdict.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {selectedReport.fullData.verdict.subtext}
                    </div>
                  </div>
                )}

                {/* Flagged Harmful Items */}
                {selectedReport.fullData?.harmfulItems && selectedReport.fullData.harmfulItems.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', marginBottom: '4px' }}>
                      ⚠️ Flagged Additives / High-Risk Ingredients:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {selectedReport.fullData.harmfulItems.map((h: any, idx: number) => (
                        <div key={idx} style={{ backgroundColor: '#020617', padding: '6px 8px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px' }}>
                          <span style={{ fontWeight: 700, color: '#fca5a5' }}>{h.ingredient}: </span>
                          <span style={{ color: '#94a3b8' }}>{h.problem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Declarations Checklist */}
                {selectedReport.fullData?.declarations && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Mandatory Declarations Audit:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedReport.fullData.declarations.map((d: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '5px 8px', borderRadius: '6px', fontSize: '11px' }}>
                          <span style={{ color: '#cbd5e1' }}>{d.name}</span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: d.status === 'PASS' ? '#4ade80' : '#fbbf24' }}>
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button in drawer */}
                <button
                  onClick={() => navigate('/scanner')}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    padding: '9px',
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={13} /> Re-Examine in Scanner
                </button>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}