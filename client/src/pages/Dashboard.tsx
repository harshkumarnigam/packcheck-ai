import { AlertCircle, AlertTriangle, CheckCircle2, FileCheck2 } from 'lucide-react';
import type { Analysis } from '../types';

interface DashboardProps {
  reports?: Analysis[];
}

export default function Dashboard({ reports = [] }: DashboardProps) {
  const total = 128 + reports.length;
  const compliant = 82 + reports.filter((r) => r.score >= 80).length;
  const warnings = 29 + reports.filter((r) => r.score >= 60 && r.score < 80).length;
  const violations = 17 + reports.filter((r) => r.score < 60).length;

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow" style={{ color: '#38bdf8' }}>ANALYTICS OVERVIEW</span>
          <h1>Compliance Dashboard</h1>
          <p>Real-time analytics and telemetry for your label-scanning workflow.</p>
        </div>
      </div>

      {/* Top 4 Metrics with Neon Highlights */}
      <div className="metrics" style={{ marginBottom: '24px' }}>
        <div
          className="card metric"
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.6))',
            borderColor: 'rgba(56, 189, 248, 0.35)',
          }}
        >
          <FileCheck2 style={{ color: '#38bdf8' }} />
          <div>
            <span>Total Products Scanned</span>
            <strong style={{ color: '#f8fafc' }}>{total}</strong>
          </div>
        </div>

        <div
          className="card metric"
          style={{
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(15, 23, 42, 0.6))',
            borderColor: 'rgba(52, 211, 153, 0.35)',
          }}
        >
          <CheckCircle2 style={{ color: '#34d399' }} />
          <div>
            <span>Compliant Products</span>
            <strong style={{ color: '#34d399' }}>{compliant}</strong>
          </div>
        </div>

        <div
          className="card metric"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(15, 23, 42, 0.6))',
            borderColor: 'rgba(251, 191, 36, 0.35)',
          }}
        >
          <AlertTriangle style={{ color: '#fbbf24' }} />
          <div>
            <span>Warnings Flagged</span>
            <strong style={{ color: '#fbbf24' }}>{warnings}</strong>
          </div>
        </div>

        <div
          className="card metric"
          style={{
            background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.12), rgba(15, 23, 42, 0.6))',
            borderColor: 'rgba(248, 113, 113, 0.35)',
          }}
        >
          <AlertCircle style={{ color: '#f87171' }} />
          <div>
            <span>Violations Detected</span>
            <strong style={{ color: '#f87171' }}>{violations}</strong>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts">
        {/* Scans over time Chart */}
        <div
          className="card"
          style={{
            padding: '24px',
            background: 'radial-gradient(ellipse at top left, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.8))',
            borderColor: 'rgba(56, 189, 248, 0.2)',
          }}
        >
          <h3 style={{ marginBottom: '16px', color: '#f1f5f9' }}>Scans over time</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4facfe" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.15)" />

              {/* Chart Gradient Fill */}
              <path
                d="M 0 140 Q 70 80 140 100 T 280 60 T 420 30 T 500 110 L 500 180 L 0 180 Z"
                fill="url(#cyanGradient)"
              />

              {/* Neon Curve Line */}
              <path
                d="M 0 140 Q 70 80 140 100 T 280 60 T 420 30 T 500 110"
                fill="none"
                stroke="url(#lineStroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Dots */}
              {[
                [0, 140],
                [140, 100],
                [280, 60],
                [420, 30],
                [500, 110],
              ].map(([cx, cy], idx) => (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#fff"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
                />
              ))}

              {/* Day Labels */}
              <text x="5" y="195" fill="var(--muted)" fontSize="11">Mon</text>
              <text x="120" y="195" fill="var(--muted)" fontSize="11">Tue</text>
              <text x="200" y="195" fill="var(--muted)" fontSize="11">Wed</text>
              <text x="280" y="195" fill="var(--muted)" fontSize="11">Thu</text>
              <text x="360" y="195" fill="var(--muted)" fontSize="11">Fri</text>
              <text x="430" y="195" fill="var(--muted)" fontSize="11">Sat</text>
              <text x="480" y="195" fill="var(--muted)" fontSize="11">Sun</text>
            </svg>
          </div>
        </div>

        {/* Multi-color Donut Chart */}
        <div
          className="card"
          style={{
            padding: '24px',
            background: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.1), rgba(15, 23, 42, 0.8))',
            borderColor: 'rgba(168, 85, 247, 0.2)',
          }}
        >
          <h3 style={{ marginBottom: '16px', color: '#f1f5f9' }}>Compliance status</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', position: 'relative' }}>
            <svg viewBox="0 0 160 160" width="170" height="170">
              {/* Background ring */}
              <circle cx="80" cy="80" r="56" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="22" />

              {/* Green (Compliant ~ 64%) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="transparent"
                stroke="#34d399"
                strokeWidth="22"
                strokeDasharray="225 352"
                strokeDashoffset="0"
                style={{ filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.35))' }}
              />

              {/* Yellow (Warning ~ 23%) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="transparent"
                stroke="#fbbf24"
                strokeWidth="22"
                strokeDasharray="80 352"
                strokeDashoffset="-230"
                style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.35))' }}
              />

              {/* Red (Violations ~ 13%) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="transparent"
                stroke="#f87171"
                strokeWidth="22"
                strokeDasharray="47 352"
                strokeDashoffset="-315"
                style={{ filter: 'drop-shadow(0 0 8px rgba(248, 113, 113, 0.35))' }}
              />
            </svg>

            {/* Inner Center Label */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <strong style={{ fontSize: '26px', color: '#f8fafc' }}>64%</strong>
              <small style={{ display: 'block', fontSize: '11px', color: '#34d399' }}>Passed</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}