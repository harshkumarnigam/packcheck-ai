import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ScanReport {
  id: string;
  productName: string;
  score: number;
  statusText: string;
  timestamp: string;
  imageThumbnail: string;
  brand?: string;
  category?: string;
  fullData: any;
}

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ScanReport | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('packcheck_scan_history');
      if (saved) {
        setReports(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load reports from localStorage', err);
    }
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved reports?')) {
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '32px 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 28px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#38bdf8', textTransform: 'uppercase' }}>HISTORY ARCHIVE</span>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '6px 0 4px 0', color: '#f8fafc' }}>Scanned Reports</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Real-time archive of food labels, FSSAI compliance scores, and flagged ingredients.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {reports.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{ padding: '10px 18px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              🗑️ Clear Archive
            </button>
          )}
          <button
            onClick={() => navigate('/scanner')}
            style={{ padding: '10px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
          >
            ⚡ Scan New Product
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {reports.length === 0 ? (
          <div style={{ backgroundColor: '#0f172a', border: '2px dashed #334155', borderRadius: '16px', padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>📄</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8', margin: '0 0 6px 0' }}>No Reports Stored Yet</h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px' }}>Scan any packaged food label using the Scanner page to generate and store your first compliance report.</p>
            <button
              onClick={() => navigate('/scanner')}
              style={{ padding: '10px 22px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Go to Scanner
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1fr 480px' : '1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Table of Reports */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '14px 18px' }}>REPORT ID</th>
                    <th style={{ padding: '14px 18px' }}>PRODUCT</th>
                    <th style={{ padding: '14px 18px' }}>HEALTH SCORE</th>
                    <th style={{ padding: '14px 18px' }}>STATUS</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((item) => {
                    const isHighRisk = item.score < 70;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedReport(item)}
                        style={{
                          borderBottom: '1px solid #1e293b',
                          cursor: 'pointer',
                          backgroundColor: selectedReport?.id === item.id ? '#1e293b' : 'transparent',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8' }}>
                          #{item.id.slice(-6)}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={item.imageThumbnail}
                              alt={item.productName}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#020617', border: '1px solid #334155' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.productName}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{item.timestamp}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 900, fontSize: '15px', color: isHighRisk ? '#f87171' : '#4ade80' }}>
                            {item.score}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>/100</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: isHighRisk ? 'rgba(239, 68, 68, 0.12)' : 'rgba(74, 222, 128, 0.12)',
                            color: isHighRisk ? '#f87171' : '#4ade80'
                          }}>
                            {isHighRisk ? 'HIGH RISK' : 'COMPLIANT'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            style={{ padding: '6px 10px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            title="Delete this report"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Detail Drawer on Right */}
            {selectedReport && (
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#38bdf8' }}>Report Summary</h3>
                  <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <img
                    src={selectedReport.imageThumbnail}
                    alt={selectedReport.productName}
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #334155', padding: '6px' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', color: '#f8fafc' }}>{selectedReport.productName}</h4>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{selectedReport.fullData?.brand || 'PepsiCo India Holdings'} • {selectedReport.timestamp}</div>
                </div>

                {/* Verdict Card */}
                {selectedReport.fullData?.verdict && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: selectedReport.fullData.verdict.bgColor,
                    border: `1px solid ${selectedReport.fullData.verdict.borderColor}`,
                    marginBottom: '14px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: selectedReport.fullData.verdict.color, marginBottom: '2px' }}>
                      {selectedReport.fullData.verdict.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                      {selectedReport.fullData.verdict.subtext}
                    </div>
                  </div>
                )}

                {/* Harmful ingredients mini list */}
                {selectedReport.fullData?.harmfulItems && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>⚠️ Flagged Risk Additives:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedReport.fullData.harmfulItems.map((h: any, i: number) => (
                        <div key={i} style={{ backgroundColor: '#020617', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px' }}>
                          <span style={{ fontWeight: 700, color: '#fca5a5' }}>{h.ingredient}: </span>
                          <span style={{ color: '#94a3b8' }}>{h.problem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}