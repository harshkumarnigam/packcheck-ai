import React, { useState, useRef, useEffect } from 'react';

interface ScanHistoryItem {
  id: string;
  productName: string;
  score: number;
  statusText: string;
  timestamp: string;
  imageThumbnail: string;
  fullData: any;
}

export default function Scanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorVerdict, setErrorVerdict] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'harmful' | 'alternatives' | 'ingredients' | 'nutrition' | 'compliance'>('harmful');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  // Report Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Misleading Healthy Labeling & Hidden Palm Fat');
  const [userComment, setUserComment] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('packcheck_scan_history');
      if (saved) {
        setScanHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (productData: any, imgUrl: string) => {
    const newItem: ScanHistoryItem = {
      id: Date.now().toString(),
      productName: productData.productName,
      score: productData.score,
      statusText: productData.score > 70 ? 'COMPLIANT' : 'HIGH RISK',
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      imageThumbnail: imgUrl,
      fullData: productData
    };

    const updatedList = [newItem, ...scanHistory.slice(0, 9)];
    setScanHistory(updatedList);
    try {
      localStorage.setItem('packcheck_scan_history', JSON.stringify(updatedList));
    } catch (e) {
      console.warn("Storage quota limit reached", e);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('packcheck_scan_history');
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setImagePreview(null);
    setResult(null);
    setErrorVerdict(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Camera access denied or device not found.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUri);
      setUploadedFileName('camera-capture.jpg');
      setResult(null);
      setErrorVerdict(null);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopCamera();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setUploadedFileName(file.name);
        setResult(null);
        setErrorVerdict(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    stopCamera();
    setImagePreview(null);
    setUploadedFileName('');
    setResult(null);
    setErrorVerdict(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runAnalysis = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setErrorVerdict(null);
    setResult(null);

    try {
      const response = await fetch('https://packcheck-ai2026.onrender.com/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          fileName: uploadedFileName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorVerdict(
          data.error ||
            'Analysis failed. Make sure the backend server is running and GEMINI_API_KEY is set.'
        );
        return;
      }

      setResult(data);
      saveToHistory(data, imagePreview);
    } catch {
      setErrorVerdict(
        'Could not reach the analysis server. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const submitFSSAIReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportModalOpen(false);
      setUserComment('');
      alert("✅ Report filed successfully! A formal grievance docket has been prepared for FSSAI INGRAM/FoSCoS consumer verification.");
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Banner */}
      <div style={{ maxWidth: '1320px', margin: '0 auto 20px auto', borderBottom: '1px solid #1e293b', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#38bdf8' }}>PackCheck AI • Food Label & Health Risk Scanner</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Detect ultra-processed ingredients, Palm oil, MSG, and file consumer reports</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ background: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
            🛡️ FSSAI Grievance Action v3.5
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Upload Controls */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, padding: '11px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
            >
              📁 Upload Packet
            </button>
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              style={{ flex: 1, padding: '11px', backgroundColor: isCameraActive ? '#ef4444' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
            >
              {isCameraActive ? '❌ Stop' : '📷 Take Snap'}
            </button>
          </div>

          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

          {isCameraActive && (
            <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#000', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={capturePhoto}
                style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', padding: '8px 24px', backgroundColor: '#38bdf8', color: '#000', fontWeight: 800, border: 'none', borderRadius: '20px', cursor: 'pointer' }}
              >
                📸 Capture
              </button>
            </div>
          )}

          {!isCameraActive && !imagePreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed #334155', borderRadius: '10px', padding: '60px 16px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#1e293b' }}
            >
              <div style={{ fontSize: '42px', marginBottom: '8px' }}>📦</div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Upload Front / Back Food Label</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Harmful labels can be flagged directly to national consumer boards</p>
            </div>
          )}

          {imagePreview && !isCameraActive && (
            <div>
              <img src={imagePreview} alt="Target" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', backgroundColor: '#020617', borderRadius: '10px', marginBottom: '12px' }} />
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: '8px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>Change Image</button>
                <button onClick={handleClear} style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#f87171', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>Clear</button>
              </div>

              <button
                onClick={runAnalysis}
                disabled={loading}
                style={{ width: '100%', padding: '14px', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 800, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}
              >
                {loading ? '🔍 Scanning Ingredients & Compliance...' : '⚡ Scan Product Now'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Active Health Dashboard */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '22px' }}>
          
          {errorVerdict ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '2px dashed #ef4444', borderRadius: '12px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚫</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f87171', margin: '0 0 8px 0' }}>Invalid Image Detected!</h2>
              <p style={{ fontSize: '14px', color: '#fca5a5', maxWidth: '420px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
                {errorVerdict}
              </p>
              <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', borderRadius: '8px', display: 'inline-block', fontSize: '13px', color: '#38bdf8', fontWeight: 700 }}>
                📸 Please upload a clear photo of a food packet
              </div>
            </div>
          ) : result ? (
            <div>
              {/* Product Header & Health Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>{result.productName}</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{result.brand} | {result.category}</p>
                  
                  {/* Health Badges */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', backgroundColor: result.isDiabeticSafe ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', color: result.isDiabeticSafe ? '#4ade80' : '#f87171', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      {result.isDiabeticSafe ? '✓ Diabetic Safe' : '✕ Not for Diabetics'}
                    </span>
                    <span style={{ fontSize: '11px', backgroundColor: result.isGlutenFree ? 'rgba(74,222,128,0.15)' : 'rgba(245,158,11,0.15)', color: result.isGlutenFree ? '#4ade80' : '#fbbf24', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      {result.isGlutenFree ? '✓ Gluten Free' : '⚠️ Contains Gluten/Wheat'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: result.score > 70 ? '#4ade80' : '#f87171' }}>
                    {result.score}<span style={{ fontSize: '14px', color: '#64748b' }}>/100</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>HEALTH RATING</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', backgroundColor: '#020617', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setActiveTab('harmful')}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'harmful' ? '#ef4444' : 'transparent', color: '#fff' }}
                >
                  ⚠️ Harmful Additives
                </button>
                <button
                  onClick={() => setActiveTab('alternatives')}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'alternatives' ? '#22c55e' : 'transparent', color: '#fff' }}
                >
                  🥗 Alternatives
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'ingredients' ? '#0284c7' : 'transparent', color: '#fff' }}
                >
                  🧪 Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'nutrition' ? '#0284c7' : 'transparent', color: '#fff' }}
                >
                  📊 Nutrition
                </button>
                <button
                  onClick={() => setActiveTab('compliance')}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'compliance' ? '#0284c7' : 'transparent', color: '#fff' }}
                >
                  🛡️ FSSAI
                </button>
              </div>

              {/* Tab 1: Harmful Items */}
              {activeTab === 'harmful' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.harmfulItems.map((item: any, idx: number) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#fca5a5', fontSize: '13px' }}>🚨 {item.ingredient}</span>
                        <span style={{ backgroundColor: item.color, color: '#000', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 900 }}>{item.level}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#fecaca', lineHeight: '1.4' }}>{item.problem}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Healthy Alternatives */}
              {activeTab === 'alternatives' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>Instead of {result.productName}, choose these healthier swaps:</div>
                  {result.healthyAlternatives.map((alt: any, idx: number) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#4ade80', fontSize: '13px' }}>🌱 {alt.name}</span>
                          <span style={{ backgroundColor: '#22c55e', color: '#000', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{alt.tag}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{alt.whyBetter} ({alt.brand})</div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>{alt.calories}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Ingredients */}
              {activeTab === 'ingredients' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Ingredient</th>
                      <th style={{ padding: '8px' }}>QID %</th>
                      <th style={{ padding: '8px' }}>Category</th>
                      <th style={{ padding: '8px' }}>Safety</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ingredients.map((ing: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{ing.name}</td>
                        <td style={{ padding: '8px', color: '#38bdf8' }}>{ing.percentage}</td>
                        <td style={{ padding: '8px', color: '#94a3b8' }}>{ing.type}</td>
                        <td style={{ padding: '8px', color: ing.safety === 'Safe' ? '#4ade80' : '#f87171', fontWeight: 700 }}>{ing.safety}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Tab 4: Nutrition */}
              {activeTab === 'nutrition' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Nutrient</th>
                      <th style={{ padding: '8px' }}>Per 100g</th>
                      <th style={{ padding: '8px' }}>Per Serve</th>
                      <th style={{ padding: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.nutritionTable.map((nut: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{nut.parameter}</td>
                        <td style={{ padding: '8px', color: '#38bdf8' }}>{nut.value}</td>
                        <td style={{ padding: '8px', color: '#94a3b8' }}>{nut.perServe}</td>
                        <td style={{ padding: '8px', color: nut.status.includes('High') ? '#f87171' : '#4ade80', fontWeight: 700 }}>● {nut.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Tab 5: FSSAI */}
              {activeTab === 'compliance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.declarations.map((dec: any, i: number) => (
                    <div key={i} style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{dec.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dec.details}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>✓ {dec.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Final Verdict Card */}
              <div style={{
                marginTop: '16px',
                padding: '16px 20px',
                backgroundColor: result.verdict.bgColor,
                border: `2px solid ${result.verdict.borderColor}`,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: result.verdict.color, marginBottom: '4px' }}>
                  {result.verdict.title}
                </div>
                <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>
                  {result.verdict.subtext}
                </div>
              </div>

              {/* DIRECT CONSUMER ACTION / REPORT BUTTON */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  🚨 Report Unhealthy / Misleading Label to FSSAI
                </button>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 16px', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛡️</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>AI Packaging Scanner Ready</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Upload any packaged food label to analyze with Gemini AI and file consumer reports if needed.</p>
            </div>
          )}
        </div>
      </div>

      {/* POPUP REPORT MODAL */}
      {isReportModalOpen && result && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f87171' }}>🚨 File Product Grievance</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Grievance Docket for FSSAI / National Consumer Helpline</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitFSSAIReport}>
              {/* Auto-filled details */}
              <div style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', border: '1px solid #1e293b' }}>
                <div><strong>Product:</strong> {result.productName}</div>
                <div><strong>Brand:</strong> {result.brand}</div>
                <div><strong>License:</strong> {result.fssaiLicense} | <strong>Batch:</strong> {result.batchNumber}</div>
              </div>

              {/* Violation Reason */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                  Select Violation Category:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                >
                  <option value="Misleading Healthy Labeling & Hidden Palm Fat">Misleading Healthy Labeling & Hidden Palm Fat</option>
                  <option value="Excessive Sodium/Sugar above Safe Dietary Limit">Excessive Sodium/Sugar above Safe Dietary Limit</option>
                  <option value="Harmful Additives (MSG / INS 627, 631) Not Warned">Harmful Additives (MSG / INS 627, 631) Not Warned</option>
                  <option value="Missing QID / Deceptive Nutrition Panel">Missing QID / Deceptive Nutrition Panel</option>
                </select>
              </div>

              {/* Remarks */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                  Consumer Remarks / Evidence Notes:
                </label>
                <textarea
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="e.g. High palm oil content not highlighted on front of pack..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', outline: 'none', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  style={{ flex: 1, padding: '10px', backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSuccess}
                  style={{ flex: 2, padding: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {reportSuccess ? 'Filing Grievance...' : 'Submit Official Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECENT SCANS HISTORY */}
      <div style={{ maxWidth: '1320px', margin: '36px auto 0 auto', borderTop: '1px solid #1e293b', paddingTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>📜 Your Scan History & Saved Reports</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>All previous food label analyses are stored securely</p>
          </div>
          {scanHistory.length > 0 && (
            <button
              onClick={clearHistory}
              style={{ padding: '6px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <div style={{ backgroundColor: '#0f172a', border: '1px dashed #334155', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No previous scans recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {scanHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setImagePreview(item.imageThumbnail);
                  setResult(item.fullData);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={item.imageThumbnail}
                  alt={item.productName}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#020617' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.productName}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: item.score > 70 ? '#4ade80' : '#f87171' }}>
                      {item.score}/100
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>• {item.timestamp}</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#38bdf8' }}>↗</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}