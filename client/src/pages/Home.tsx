import {
  ArrowRight,
  ChevronRight,
  CheckSquare,
  UploadCloud,
  FileText as FileTextIcon,
  Scan,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  UserX,
  TrendingDown,
  Search,
  type LucideIcon,
} from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface HomeProps {
  nav: NavigateFunction;
  loadSample: (index: number) => void;
}

interface ProblemItem {
  title: string;
  body: string;
  Icon: LucideIcon;
}

const PROBLEMS: ProblemItem[] = [
  {
    title: 'Manual Verification',
    body: 'Inspecting every field by hand takes time.',
    Icon: Clock,
  },
  {
    title: 'Missing Declarations',
    body: 'Important fields can be overlooked.',
    Icon: AlertTriangle,
  },
  {
    title: 'Human Error',
    body: 'Repeated checks can introduce inconsistency.',
    Icon: UserX,
  },
  {
    title: 'Time-Consuming',
    body: 'Large product volumes need faster triage.',
    Icon: TrendingDown,
  },
];

type StepItem = [string, string, LucideIcon, string];

const STEPS: StepItem[] = [
  ['01', 'Upload Label', UploadCloud, '/scanner'],
  ['02', 'Extract with OCR', Search, '/scanner'],
  ['03', 'Validate Rules', CheckSquare, '/rules'],
  ['04', 'Generate Report', FileTextIcon, '/reports'],
];

export default function Home({ nav, loadSample }: HomeProps) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse" /> AI + OCR + Rule Engine
          </div>
          <h1>
            AI-Powered <span>Packaged Label</span> Compliance Scanner
          </h1>
          <p>
            Scan product labels, extract visible declarations, detect potential issues, and generate an
            intelligent compliance report in seconds.
          </p>
          <div className="hero-buttons">
            <button className="primary" onClick={() => nav('/scanner')}>
              Scan Product <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => loadSample(1)}>
              View Live Demo
            </button>
          </div>
          <div className="trust">
            <span>
              <Shield /> OCR Powered
            </span>
            <span>
              <Zap /> AI Assisted
            </span>
            <span>
              <CheckSquare /> Rule-Based
            </span>
            <span>
              <FileTextIcon /> Instant Report
            </span>
          </div>
        </div>

        {/* CLICKABLE & STYLED HERO CARD */}
        <div 
          className="hero-card interactive-card" 
          onClick={() => nav('/scanner')}
          title="Click to start Scanning"
          role="button"
          tabIndex={0}
        >
          <div className="scan-top">
            <span>LIVE ANALYSIS</span>
            <span className="online">
              <i /> Ready
            </span>
          </div>

          <div className="mock-label">
            <div className="label-header">
              <div className="rice-badge">B</div>
              <div className="label-meta">
                <span className="brand-tag">PREMIUM</span>
                <h4 className="product-title">BASMATI RICE</h4>
                <small>Long Grain • Aromatic</small>
              </div>
            </div>

            <div className="scan-ring">
              <Scan size={32} />
            </div>

            {/* OCR Detection Highlights */}
            <div className="box one">
              Product Name <em>98%</em>
            </div>
            <div className="box two">
              MRP ₹240 <em>99%</em>
            </div>
            <div className="box three">
              Net Qty 1kg <em>96%</em>
            </div>
          </div>

          <div className="score-mini">
            <div>
              <small>COMPLIANCE SCORE</small>
              <strong>
                82<span>/100</span>
              </strong>
            </div>
            <span className="status warning">Partially Compliant</span>
          </div>
        </div>
      </section>

      {/* ⚡ 1-CLICK QUICK ACCESS HUB TO ALL PAGES */}
      <section className="section" style={{ paddingTop: '0', paddingBottom: '30px' }}>
        <div style={{
          backgroundColor: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#38bdf8', textTransform: 'uppercase' }}>
                ⚡ 1-CLICK SYSTEM MODULES
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                Directly Open Any Page in 1 Click
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Instant One-Touch Navigation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div
              onClick={() => nav('/scanner')}
              style={{
                backgroundColor: '#070e1c',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📷</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>AI Scanner</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Live camera & instant presets</div>
            </div>

            <div
              onClick={() => nav('/reports')}
              style={{
                backgroundColor: '#070e1c',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📋</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#4ade80' }}>Inspection Reports</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Audit dockets & CSV export</div>
            </div>

            <div
              onClick={() => nav('/rules')}
              style={{
                backgroundColor: '#070e1c',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚖️</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24' }}>Statutory Rules</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>FSSAI 2020 & Metrology laws</div>
            </div>

            <div
              onClick={() => nav('/dashboard')}
              style={{
                backgroundColor: '#070e1c',
                border: '1px solid rgba(129, 140, 248, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📊</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#818cf8' }}>Analytics Dashboard</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Compliance KPIs & Pareto rankings</div>
            </div>

            <div
              onClick={() => nav('/about')}
              style={{
                backgroundColor: '#070e1c',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>ℹ️</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#cbd5e1' }}>About & Team</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Architecture & TechVortex roadmap</div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">THE PROBLEM</span>
            <h2>Why label compliance matters</h2>
          </div>
          <p>Manual verification can be slow, inconsistent, and difficult to scale across thousands of packaged products.</p>
        </div>
        <div className="grid4">
          {PROBLEMS.map(({ title, body, Icon }) => (
            <div 
              className="card" 
              key={title}
              onClick={() => nav('/scanner')}
              style={{ cursor: 'pointer' }}
              title="Click to scan product"
              role="button"
              tabIndex={0}
            >
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE SOLUTION SECTION */}
      <section className="section solution">
        <div className="center">
          <span className="eyebrow">THE SOLUTION</span>
          <h2>Meet PackCheck AI</h2>
          <p>One simple flow from image to actionable report.</p>
        </div>
        <div className="steps">
          {STEPS.map(([number, title, Icon, path], i) => (
            <div 
              className="step" 
              key={title}
              onClick={() => nav(path)}
              style={{ cursor: 'pointer' }}
              title={`Open ${title}`}
              role="button"
              tabIndex={0}
            >
              <span>{number}</span>
              <Icon size={24} />
              <h3>{title}</h3>
              {i < STEPS.length - 1 && <ChevronRight className="step-arrow" />}
            </div>
          ))}
        </div>
      </section>

      {/* JUDGE DEMO */}
      <section className="section demo-section">
        <div className="demo-banner">
          <div>
            <span className="eyebrow">JUDGE DEMO</span>
            <h2>See the full workflow in 30-60 seconds.</h2>
            <p>Choose a sample product and jump straight to OCR, compliance score, violations and recommendations.</p>
          </div>
          <button className="primary" onClick={() => loadSample(1)}>
            Launch Demo <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}