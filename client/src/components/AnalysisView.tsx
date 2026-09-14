import { AlertTriangle, Download } from 'lucide-react';
import type { Analysis, Field } from '../types';

interface AnalysisViewProps {
  analysis: Analysis;
}

function scoreClass(score: number) {
  if (score >= 90) return 'pass';
  if (score >= 70) return 'warning';
  return 'fail';
}

export default function AnalysisView({ analysis }: AnalysisViewProps) {
  return (
    <div>
      <div className="result-head">
        <div>
          <span className="eyebrow">ANALYSIS COMPLETE</span>
          <h2>{analysis.productName}</h2>
          <p>AI-assisted prototype result • verify against official sources before use.</p>
        </div>
        <div className="score">
          <div className="score-ring" style={{ '--score': analysis.score } as React.CSSProperties}>
            <strong>{analysis.score}</strong>
            <span>/100</span>
          </div>
          <span className={'status ' + scoreClass(analysis.score)}>{analysis.status}</span>
        </div>
      </div>

      <div className="summary">
        {(
          [
            ['Compliant', analysis.summary.pass, 'pass'],
            ['Warnings', analysis.summary.warning, 'warning'],
            ['Violations', analysis.summary.fail, 'fail'],
          ] as const
        ).map(([label, count, cls]) => (
          <div className="summary-box" key={label}>
            <span>{label}</span>
            <strong className={cls}>{count}</strong>
          </div>
        ))}
      </div>

      <h3 className="subhead">Compliance checklist</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Declaration</th>
              <th>Detected Value</th>
              <th>Status</th>
              <th>Confidence</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {analysis.fields.map((f: Field) => (
              <tr key={f.name}>
                <td>{f.name}</td>
                <td>{f.value || '—'}</td>
                <td>
                  <span className={'badge ' + f.status.toLowerCase()}>{f.status}</span>
                </td>
                <td>{f.confidence ? f.confidence + '%' : '—'}</td>
                <td>{f.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {analysis.violations.length > 0 && (
        <>
          <h3 className="subhead">Violation details</h3>
          <div className="violations">
            {analysis.violations.map((v) => (
              <div className="violation" key={v.title}>
                <div className="vhead">
                  <div>
                    <span className="badge fail">{v.severity}</span>
                    <h3>{v.title}</h3>
                  </div>
                  <AlertTriangle />
                </div>
                <p>
                  <b>Detected:</b> {v.detected}
                </p>
                <p>
                  <b>Required:</b> {v.required}
                </p>
                <p>
                  <b>Recommendation:</b> {v.recommendation}
                </p>
                <small>{v.reference}</small>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="report-actions">
        <button className="primary" onClick={() => window.print()}>
          <Download /> Print / Save Report
        </button>
        <span className="disclaimer">Prototype rule engine • configurable references • not legal advice</span>
      </div>
    </div>
  );
}
