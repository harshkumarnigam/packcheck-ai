import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  CloudUpload,
  FileText,
  ScanLine,
  Search,
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  UserX,
  TrendingDown,
} from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface HomeProps {
  nav: NavigateFunction;
  loadSample: (index: number) => void;
}

const PROBLEMS = [
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

const STEPS: [string, string, typeof CloudUpload, string][] = [
  ['01', 'Upload Label', CloudUpload, '/scanner'],
  ['02', 'Extract with OCR', Search, '/scanner'],
  ['03', 'Validate Rules', ClipboardCheck, '/rules'],
  ['04', 'Generate Report', FileText, '/reports'],
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
              <ShieldCheck /> OCR Powered
            </span>
            <span>
              <Zap /> AI Assisted
            </span>
            <span>
              <ClipboardCheck /> Rule-Based
            </span>
            <span>
              <FileText /> Instant Report
            </span>
          </div>
        </div>

        {/* CLICKABLE & STYLED HERO CARD */}
        <div 
          className="hero-card interactive-card" 
          onClick={() => nav('/scanner')}
          title="Click to start Scanning"
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
              <ScanLine size={32} />
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
            <h2>See the full workflow in 30–60 seconds.</h2>
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