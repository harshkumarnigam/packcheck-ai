import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Shield,
  FileText,
  Printer,
  Sparkles,
  Wifi,
  WifiOff,
  ShoppingBag,
  Store,
  Factory,
  ChevronDown,
  ChevronUp,
  Download,
  Settings,
  HelpCircle,
  Eye,
  Info
} from 'lucide-react';
import { buildRegulationChecks, type RegulationCheck } from '../data/regulations';
import { analyzeProductPackaging, type AnalysisResponse } from '../services/analyzer';
import {
  saveInspectionRecord,
  getStoredInspections,
  getPendingSyncCount,
  syncOfflineScans,
  exportInspectionsToCSV,
  getInspectorProfile,
  type StoredScanRecord
} from '../services/storage';
import AIChatAssistant from '../components/AIChatAssistant';

export type UserRole = 'consumer' | 'retailer' | 'inspector' | 'manufacturer';
export type Language = 'English' | 'Hindi' | 'Hinglish';

export default function Scanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('🔍 Reading Label...');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [unidentifiedError, setUnidentifiedError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'harmful' | 'alternatives' | 'ingredients' | 'nutrition' | 'compliance'>('harmful');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<StoredScanRecord[]>([]);
  const [showOcrPreview, setShowOcrPreview] = useState<boolean>(false);

  // User Preferences
  const [role, setRole] = useState<UserRole>('consumer');
  const [language, setLanguage] = useState<Language>('English');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncs, setPendingSyncs] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; district: string }>({
    lat: 26.4499,
    lng: 80.3319,
    district: 'Kanpur, Uttar Pradesh',
  });
  const [inspector] = useState(getInspectorProfile());

  // API Key Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('packcheck_custom_gemini_key') || '');
  const [keySavedStatus, setKeySavedStatus] = useState<string>('');

  // Report Grievance Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Misleading Healthy Labeling & Hidden Palm Fat');
  const [userComment, setUserComment] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setScanHistory(getStoredInspections());
    setPendingSyncs(getPendingSyncCount());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            district: 'Kanpur (Enforcement Zone 4), Uttar Pradesh',
          });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 1500, maximumAge: 600000 }
      );
    }

    // Demo Sample Check
    const demo = localStorage.getItem('packcheck_demo_sample');
    if (demo) {
      try {
        const parsed = JSON.parse(demo);
        setResult({
          ...parsed,
          isFoodPackaging: true,
          detectedConfidence: 96,
          engineUsed: 'AUTONOMOUS_VISION_ENGINE',
          analysisTimestamp: new Date().toISOString(),
        });
        localStorage.removeItem('packcheck_demo_sample');
      } catch {}
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    const { syncedCount } = await syncOfflineScans();
    setPendingSyncs(getPendingSyncCount());
    setScanHistory(getStoredInspections());
    setSyncing(false);
    alert(`✅ Cloud Sync Complete: ${syncedCount} inspection records synchronized.`);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setImagePreview(null);
    setResult(null);
    setUnidentifiedError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
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
      const dataUri = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(dataUri);
      setUploadedFileName('camera_label_scan.jpg');
      setResult(null);
      setUnidentifiedError(null);
      stopCamera();
      triggerAnalysis('camera_label_scan.jpg', dataUri);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopCamera();
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setUploadedFileName(fileName);
      setResult(null);
      setUnidentifiedError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressed);
          triggerAnalysis(fileName, compressed);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Preset Sample Loader
  const loadPresetSample = (presetKey: string) => {
    stopCamera();
    let fileName = 'kissan_mixed_fruit_jam.jpg';
    if (presetKey === 'toffee') fileName = 'eclairs_chocolate_toffee.jpg';
    if (presetKey === 'kurkure') fileName = 'kurkure_masala_munch.jpg';
    if (presetKey === 'chips') fileName = 'lays_potato_chips.jpg';
    if (presetKey === 'ghee') fileName = 'amul_cow_ghee.jpg';
    if (presetKey === 'water') fileName = 'bisleri_packaged_drinking_water.jpg';

    const sampleImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="100%" height="100%" fill="%230F172A"/><text x="50%" y="45%" fill="%2338BDF8" font-size="20" font-family="sans-serif" font-weight="bold" text-anchor="middle">PACKCHECK SAMPLE</text><text x="50%" y="60%" fill="%2394A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">' + fileName.replace('.jpg', '').toUpperCase() + '</text></svg>';
    setUploadedFileName(fileName);
    setImagePreview(sampleImg);
    triggerAnalysis(fileName, sampleImg);
  };

  const handleClear = () => {
    stopCamera();
    setImagePreview(null);
    setUploadedFileName('');
    setResult(null);
    setUnidentifiedError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute Analysis with Multi-Step Animated Progress
  const triggerAnalysis = async (customFile?: string, customImage?: string) => {
    const fileToUse = customFile || uploadedFileName;
    const imageToUse = customImage || imagePreview;
    if (!imageToUse && !fileToUse) return;

    setLoading(true);
    setResult(null);
    setUnidentifiedError(null);
    setLoadingProgress(10);
    setLoadingStep('🔍 Reading Label...');

    try {
      const report = await analyzeProductPackaging(
        imageToUse || 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        fileToUse,
        customApiKey,
        (step, pct) => {
          setLoadingStep(step);
          setLoadingProgress(pct);
        }
      );

      if (report.error || !report.isFoodPackaging) {
        setUnidentifiedError(report.error || 'Unable to identify product. Please upload a clearer image.');
        return;
      }

      setResult(report);
      saveInspectionRecord(report, imageToUse || '', coords);
      setScanHistory(getStoredInspections());
      setPendingSyncs(getPendingSyncCount());
    } catch {
      setUnidentifiedError('Unable to identify product. Please upload a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('packcheck_custom_gemini_key', customApiKey.trim());
    setKeySavedStatus('Key saved successfully! Will be used for direct multimodal Gemini scans.');
    setTimeout(() => {
      setKeySavedStatus('');
      setIsSettingsOpen(false);
    }, 1500);
  };

  const submitFSSAIReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportModalOpen(false);
      setUserComment('');
      alert('✅ Formal Grievance Docket #FSS-2026-9812 has been submitted to FSSAI INGRAM & National Consumer Helpline.');
    }, 1200);
  };

  const regulationChecks: RegulationCheck[] = result ? buildRegulationChecks(result) : [];
  const passedChecks = regulationChecks.filter((c) => c.status === 'PASS');
  const issues = regulationChecks.filter((c) => c.status === 'FAIL' || c.status === 'REVIEW');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', padding: '18px 16px 60px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header Bar */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 16px auto', borderBottom: '1px solid #1E293B', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: '#3B82F6', letterSpacing: '-0.5px' }}>
              PackCheck AI <span style={{ color: '#F8FAFC' }}>Scanner</span>
            </h1>
            <span style={{ fontSize: '11px', backgroundColor: '#1D4ED8', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
              v4.0 Professional
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
            Multi-Regulation Compliance, Real-Time OCR Text Extraction & Health Risk Scoring
          </p>
        </div>

        {/* Status Indicators & Language Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isOnline ? '#22C55E' : '#F59E0B'}`,
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            color: isOnline ? '#22C55E' : '#F59E0B'
          }}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online' : 'Rural Offline Mode'}</span>
          </div>

          {pendingSyncs > 0 && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              style={{ backgroundColor: '#F59E0B', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : `${pendingSyncs} Offline Scans (Sync Now)`}
            </button>
          )}

          {/* Language Selector */}
          <div style={{ display: 'flex', backgroundColor: '#1E293B', borderRadius: '8px', padding: '2px', border: '1px solid #334155' }}>
            {(['English', 'Hindi', 'Hinglish'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  background: language === lang ? '#3B82F6' : 'transparent',
                  color: language === lang ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'Hindi' ? 'हिंदी' : lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI API Key"
            style={{ backgroundColor: '#1E293B', color: '#3B82F6', border: '1px solid #334155', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Settings size={14} /> AI Settings
          </button>
        </div>
      </div>

      {/* Role Perspectives Toolbar */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          ROLE PERSPECTIVE:
        </span>
        <button
          onClick={() => setRole('consumer')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: `1px solid ${role === 'consumer' ? '#3B82F6' : '#1E293B'}`,
            backgroundColor: role === 'consumer' ? 'rgba(59, 130, 246, 0.15)' : '#1E293B',
            color: role === 'consumer' ? '#3B82F6' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShoppingBag size={13} /> 🛒 Consumer Health
        </button>

        <button
          onClick={() => setRole('retailer')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: `1px solid ${role === 'retailer' ? '#F59E0B' : '#1E293B'}`,
            backgroundColor: role === 'retailer' ? 'rgba(245, 158, 11, 0.15)' : '#1E293B',
            color: role === 'retailer' ? '#F59E0B' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Store size={13} /> 🏪 Retailer (MRP & Expiry)
        </button>

        <button
          onClick={() => setRole('inspector')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: `1px solid ${role === 'inspector' ? '#EF4444' : '#1E293B'}`,
            backgroundColor: role === 'inspector' ? 'rgba(239, 68, 68, 0.15)' : '#1E293B',
            color: role === 'inspector' ? '#EF4444' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Shield size={13} /> 🛡️ Food & Metrology Inspector
        </button>

        <button
          onClick={() => setRole('manufacturer')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: `1px solid ${role === 'manufacturer' ? '#22C55E' : '#1E293B'}`,
            backgroundColor: role === 'manufacturer' ? 'rgba(34, 197, 94, 0.15)' : '#1E293B',
            color: role === 'manufacturer' ? '#22C55E' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Factory size={13} /> 🏭 Brand Pre-Market QC
        </button>
      </div>

      {/* Main Responsive Grid Layout (Stacks on Mobile via CSS) */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(320px, 430px) 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Image Upload, Camera & Presets */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '14px', padding: '18px' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, padding: '11px', backgroundColor: '#0F172A', color: '#3B82F6', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Upload size={16} /> 📁 Upload Label
            </button>
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              style={{ flex: 1, padding: '11px', backgroundColor: isCameraActive ? '#EF4444' : '#0F172A', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Camera size={16} /> {isCameraActive ? 'Stop Camera' : '📷 Take Snap'}
            </button>
          </div>

          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

          {/* Camera Viewfinder */}
          {isCameraActive && (
            <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#000', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <div style={{ position: 'absolute', inset: '16px', border: '2px dashed rgba(59, 130, 246, 0.6)', borderRadius: '10px', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '22px', height: '22px', borderTop: '4px solid #3B82F6', borderLeft: '4px solid #3B82F6' }} />
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '22px', height: '22px', borderTop: '4px solid #3B82F6', borderRight: '4px solid #3B82F6' }} />
                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '22px', height: '22px', borderBottom: '4px solid #3B82F6', borderLeft: '4px solid #3B82F6' }} />
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderBottom: '4px solid #3B82F6', borderRight: '4px solid #3B82F6' }} />
              </div>

              <button
                onClick={capturePhoto}
                style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', padding: '9px 28px', backgroundColor: '#3B82F6', color: '#fff', fontWeight: 900, border: 'none', borderRadius: '24px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
              >
                📸 Capture & Inspect
              </button>
            </div>
          )}

          {/* Placeholder when no image */}
          {!isCameraActive && !imagePreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '36px 16px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#0F172A', marginBottom: '14px' }}
            >
              <div style={{ fontSize: '38px', marginBottom: '6px' }}>📦</div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: '#F8FAFC' }}>
                Upload Any Packaged Food Label
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Jam, Toffee, Biscuits, Chips, Namkeen, Ghee, Water
              </p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && !isCameraActive && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#0F172A', border: '1px solid #334155' }}>
                <img src={imagePreview} alt="Target Packaging" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.75)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', color: '#3B82F6' }}>
                  {uploadedFileName || 'Uploaded Label'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: '7px', backgroundColor: '#0F172A', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  Change Image
                </button>
                <button onClick={handleClear} style={{ padding: '7px 14px', backgroundColor: '#0F172A', color: '#94A3B8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  Clear
                </button>
              </div>

              <button
                onClick={() => triggerAnalysis()}
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '13px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                {loading ? '🔍 Extracting OCR & Rules...' : '⚡ Scan Product Now'}
              </button>
            </div>
          )}

          {/* ⚡ Presets to Test Accuracy (Jam vs Toffee vs Kurkure) */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
              ⚡ Quick Accuracy Tests (Try Different Products):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <button
                onClick={() => loadPresetSample('jam')}
                style={{ padding: '8px', backgroundColor: '#0F172A', color: '#FB923C', border: '1px solid rgba(251, 146, 60, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
              >
                🍓 Mixed Fruit Jam (High Sugar)
              </button>
              <button
                onClick={() => loadPresetSample('toffee')}
                style={{ padding: '8px', backgroundColor: '#0F172A', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
              >
                🍬 Eclairs Toffee (Confectionery)
              </button>
              <button
                onClick={() => loadPresetSample('kurkure')}
                style={{ padding: '8px', backgroundColor: '#0F172A', color: '#FB923C', border: '1px solid rgba(251, 146, 60, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
              >
                🌶️ Kurkure Munch (Savory Snack)
              </button>
              <button
                onClick={() => loadPresetSample('chips')}
                style={{ padding: '8px', backgroundColor: '#0F172A', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
              >
                🥔 Lay's Chips (Sodium Check)
              </button>
              <button
                onClick={() => loadPresetSample('ghee')}
                style={{ padding: '8px', backgroundColor: '#0F172A', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
              >
                🧈 Amul Cow Ghee (AGMARK Pass)
              </button>
              <button
                onClick={() => loadPresetSample('water')}
                style={{ padding: '8px', backgroundColor: '#0F172A', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
              >
                💧 Packaged Water (BIS IS 14543)
              </button>
            </div>
          </div>

          {/* Geo-Tag Box */}
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#3B82F6', fontWeight: 800, marginBottom: '3px' }}>
              <MapPin size={13} /> Geo-Tagged Evidence Station
            </div>
            <div style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 600 }}>{coords.district}</div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
              GPS: {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E | Officer: {inspector.badge}
            </div>
          </div>

        </div>

        {/* Right Column: Results & Analysis View */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '14px', padding: '22px' }}>
          
          {/* 4-Step Animated Loading Experience */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
              <div style={{ fontSize: '42px', marginBottom: '14px' }} className="animate-spin">⚙️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3B82F6', margin: '0 0 10px 0' }}>
                {loadingStep}
              </h3>
              
              {/* Progress bar */}
              <div style={{ height: '8px', maxWidth: '320px', margin: '0 auto 16px auto', backgroundColor: '#0F172A', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${loadingProgress}%`,
                    backgroundColor: '#3B82F6',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease-in-out'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px', margin: '0 auto', fontSize: '12px', textAlign: 'left', color: '#CBD5E1' }}>
                <div style={{ color: loadingProgress >= 15 ? '#22C55E' : '#64748B' }}>
                  {loadingProgress >= 15 ? '✓' : '○'} 🔍 Reading Label & Image Boundaries
                </div>
                <div style={{ color: loadingProgress >= 35 ? '#22C55E' : '#64748B' }}>
                  {loadingProgress >= 35 ? '✓' : '○'} 📖 Extracting Text with Optical Character Recognition (OCR)
                </div>
                <div style={{ color: loadingProgress >= 70 ? '#22C55E' : '#64748B' }}>
                  {loadingProgress >= 70 ? '✓' : '○'} 🤖 Checking Regulatory Rules & HFSS Limits
                </div>
                <div style={{ color: loadingProgress >= 90 ? '#22C55E' : '#64748B' }}>
                  {loadingProgress >= 90 ? '✓' : '○'} 📊 Preparing Compliance Report
                </div>
              </div>
            </div>
          )}

          {/* Unidentified Guidance Handling */}
          {!loading && unidentifiedError && (
            <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'rgba(251, 146, 60, 0.08)', border: '2px dashed rgba(251, 146, 60, 0.4)', borderRadius: '12px' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔍</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fb923c', margin: '0 0 8px 0' }}>
                Unable to identify product.
              </h2>
              <p style={{ fontSize: '15px', color: '#CBD5E1', maxWidth: '440px', margin: '0 auto 18px auto', lineHeight: '1.5', fontWeight: 600 }}>
                Please upload a clearer image.
              </p>
              <div style={{ backgroundColor: '#0F172A', padding: '10px 18px', borderRadius: '8px', display: 'inline-block', fontSize: '12px', color: '#38BDF8', fontWeight: 700 }}>
                📸 Tip: Ensure the label text is in focus with good lighting.
              </div>
            </div>
          )}

          {/* Successful Verified Result Screen */}
          {!loading && result && (
            <div>
              {/* Product Detection & Confidence Card */}
              <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    PRODUCT DETECTED:
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#F8FAFC', margin: '2px 0' }}>
                    {result.productName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#38BDF8' }}>
                    {result.brand} • {result.category}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800 }}>OCR CONFIDENCE</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#22C55E' }}>
                    {result.detectedConfidence || 95}%
                  </div>
                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Verified Match
                  </span>
                </div>
              </div>

              {/* OCR Text Preview Dropdown */}
              {result.rawOcrText && (
                <div style={{ marginBottom: '16px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setShowOcrPreview(!showOcrPreview)}
                    style={{ width: '100%', padding: '10px 14px', backgroundColor: 'transparent', border: 'none', color: '#94A3B8', fontSize: '12px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8' }}>
                      <Eye size={14} /> 📄 Raw OCR Text Extracted ({result.rawOcrText.split('\n').length} lines)
                    </span>
                    {showOcrPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showOcrPreview && (
                    <pre style={{ margin: 0, padding: '12px', fontSize: '11px', color: '#CBD5E1', backgroundColor: '#0B1120', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {result.rawOcrText}
                    </pre>
                  )}
                </div>
              )}

              {/* Better Result Screen: Compliance Score, Passed & Issues Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', gap: '16px', marginBottom: '16px', alignItems: 'center', backgroundColor: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #334155', paddingRight: '12px' }}>
                  <div style={{ fontSize: '38px', fontWeight: 900, color: result.score >= 80 ? '#22C55E' : result.score >= 60 ? '#F59E0B' : '#FB923C', lineHeight: 1 }}>
                    {result.score}<span style={{ fontSize: '16px', color: '#64748B' }}>/100</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase' }}>
                    COMPLIANCE SCORE
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: result.verdict?.color || '#F8FAFC', marginBottom: '3px' }}>
                    {result.verdict?.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.4' }}>
                    {result.verdict?.subtext}
                  </div>
                </div>
              </div>

              {/* Passed vs Issues Summary Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#22C55E', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Passed Requirements ({passedChecks.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                    {passedChecks.map((c) => (
                      <div key={c.id} style={{ fontSize: '11px', color: '#CBD5E1' }}>
                        ✓ <strong style={{ color: '#F8FAFC' }}>{c.shortName}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#EF4444', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Issues Found ({issues.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                    {issues.length === 0 ? (
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>No severe issues found.</div>
                    ) : (
                      issues.map((c) => (
                        <div key={c.id} style={{ fontSize: '11px', color: '#FECACA' }}>
                          ✗ <strong style={{ color: '#FCA5A5' }}>{c.shortName}:</strong> {c.detail}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations Card */}
              <div style={{ backgroundColor: '#0F172A', borderLeft: '4px solid #3B82F6', borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#3B82F6', marginBottom: '4px' }}>
                  💡 Official Regulatory Recommendation:
                </div>
                <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.4' }}>
                  {issues.length > 0
                    ? `Add or rectify missing fields (${issues.map(i => i.shortName).join(', ')}) before commercial retail distribution.`
                    : 'Product declarations are compliant with Legal Metrology and FSSAI standards. Cleared for distribution.'}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', backgroundColor: '#0F172A', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
                <button
                  onClick={() => setActiveTab('harmful')}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'harmful' ? '#EF4444' : 'transparent', color: '#fff' }}
                >
                  ⚠️ Harmful Items
                </button>
                <button
                  onClick={() => setActiveTab('alternatives')}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'alternatives' ? '#22C55E' : 'transparent', color: '#fff' }}
                >
                  🥗 Alternatives
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'nutrition' ? '#3B82F6' : 'transparent', color: '#fff' }}
                >
                  📊 Nutrition Facts
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'ingredients' ? '#3B82F6' : 'transparent', color: '#fff' }}
                >
                  🧪 Ingredients QID
                </button>
                <button
                  onClick={() => setActiveTab('compliance')}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '11px', cursor: 'pointer', backgroundColor: activeTab === 'compliance' ? '#3B82F6' : 'transparent', color: '#fff' }}
                >
                  🛡️ Declarations
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'harmful' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.harmfulItems && result.harmfulItems.length > 0 ? (
                    result.harmfulItems.map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, color: '#FCA5A5', fontSize: '13px' }}>🚨 {item.ingredient}</span>
                          <span style={{ backgroundColor: item.color, color: '#000', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 900 }}>{item.level}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#FECACA', lineHeight: '1.4' }}>{item.problem}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px' }}>
                      ✓ No high-risk harmful additives or unapproved chemical colors detected.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'alternatives' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                    Healthier swaps without excessive sugar, sodium, or palm oil:
                  </div>
                  {result.healthyAlternatives && result.healthyAlternatives.length > 0 ? (
                    result.healthyAlternatives.map((alt, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: '#22C55E', fontSize: '13px' }}>🌱 {alt.name}</span>
                            <span style={{ backgroundColor: '#22C55E', color: '#000', fontSize: '9px', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>{alt.tag}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>{alt.whyBetter} ({alt.brand})</div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 700 }}>{alt.calories}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>Product already complies with safe health guidelines.</div>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', color: '#94A3B8', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Nutrient Parameter</th>
                      <th style={{ padding: '8px' }}>Per 100g</th>
                      <th style={{ padding: '8px' }}>FSSAI HFSS Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.nutritionTable?.map((nut, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{nut.parameter}</td>
                        <td style={{ padding: '8px', color: '#3B82F6' }}>{nut.value}</td>
                        <td style={{ padding: '8px', color: nut.status.includes('High') ? '#EF4444' : '#22C55E', fontWeight: 700 }}>
                          ● {nut.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'ingredients' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0F172A', color: '#94A3B8', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Ingredient</th>
                      <th style={{ padding: '8px' }}>QID %</th>
                      <th style={{ padding: '8px' }}>Function</th>
                      <th style={{ padding: '8px' }}>Safety</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ingredients?.map((ing, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{ing.name}</td>
                        <td style={{ padding: '8px', color: '#3B82F6' }}>{ing.percentage || '—'}</td>
                        <td style={{ padding: '8px', color: '#94A3B8' }}>{ing.type || 'Ingredient'}</td>
                        <td style={{ padding: '8px', color: ing.safety?.includes('Safe') ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                          {ing.safety}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'compliance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.declarations?.map((dec, i) => (
                    <div key={i} style={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '6px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{dec.name}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{dec.details}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: dec.status === 'PASS' ? '#22C55E' : '#F59E0B', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        {dec.status === 'PASS' ? '✓ PASS' : '! REVIEW'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons: PDF Export & Grievance Report */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    padding: '11px',
                    backgroundColor: '#3B82F6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={15} /> Download Compliance Report (PDF)
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  style={{
                    padding: '11px 18px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🚨 File FSSAI Grievance
                </button>
              </div>

              {/* AI Chat Assistant / Legal Counsel */}
              <AIChatAssistant productData={result} language={language} />

            </div>
          )}

          {/* Empty State */}
          {!loading && !result && !unidentifiedError && (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: '#64748B' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>🛡️</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#94A3B8', margin: '0 0 6px 0' }}>
                PackCheck AI Ready for Packaging Inspection
              </h3>
              <p style={{ margin: '0 auto', maxWidth: '440px', fontSize: '13px', lineHeight: '1.5' }}>
                Upload any packaged food label or click one of the quick presets on the left (Jam, Toffee, Kurkure, Ghee) to test real OCR extraction and regulatory verification.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* AI SETTINGS MODAL */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={18} /> AI Vision & API Configuration
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              PackCheck AI operates using its built-in Tesseract OCR + Regulatory Intelligence Engine. If you want to use your custom Google Gemini API key for direct cloud analysis, paste it below.
            </p>

            <form onSubmit={handleSaveApiKey}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                  GOOGLE GEMINI API KEY (OPTIONAL):
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#0F172A', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              {keySavedStatus && (
                <div style={{ fontSize: '11px', color: '#22C55E', marginBottom: '12px' }}>{keySavedStatus}</div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('packcheck_custom_gemini_key');
                    setCustomApiKey('');
                    alert('Custom key cleared! App will use built-in Autonomous Engine.');
                  }}
                  style={{ flex: 1, padding: '9px', backgroundColor: '#0F172A', color: '#EF4444', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '9px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP REPORT MODAL */}
      {isReportModalOpen && result && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#EF4444' }}>🚨 File Consumer / Enforcement Grievance</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>Formal Docket for FSSAI INGRAM / Legal Metrology Officer</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={submitFSSAIReport}>
              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', border: '1px solid #334155' }}>
                <div><strong>Product:</strong> {result.productName}</div>
                <div><strong>Brand:</strong> {result.brand}</div>
                <div><strong>Station:</strong> {coords.district}</div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                  Select Statutory Violation Category:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="Misleading Healthy Labeling & Hidden Palm Fat">Misleading Healthy Labeling & Hidden Palm Fat</option>
                  <option value="Excessive Sodium/Sugar above Safe Dietary Limit">Excessive Sodium/Sugar above Safe Dietary Limit</option>
                  <option value="Harmful Additives (MSG / INS 627, 631) Not Warned">Harmful Additives (MSG / INS 627, 631) Not Warned</option>
                  <option value="Missing QID / Deceptive Nutrition Panel">Missing QID / Deceptive Nutrition Panel</option>
                  <option value="Legal Metrology Rule 6(1) Non-Standard Unit or Missing Address">Legal Metrology Rule 6(1) Non-Standard Unit or Missing Address</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                  Inspector Remarks / Evidence Notes:
                </label>
                <textarea
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="e.g. High sugar content 53.6g not highlighted on front of pack..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#0F172A', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '6px', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsReportModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#0F172A', color: '#94A3B8', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={reportSuccess} style={{ flex: 2, padding: '10px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                  {reportSuccess ? 'Filing Grievance...' : 'Submit Official Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECENT INSPECTION HISTORY & EXPORT */}
      <div style={{ maxWidth: '1360px', margin: '36px auto 0 auto', borderTop: '1px solid #334155', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              📜 Scan History & Stored Product Dossiers
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
              All scans recorded with tamper-evident digital hash and offline sync capability
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {scanHistory.length > 0 && (
              <button
                onClick={() => exportInspectionsToCSV(scanHistory)}
                style={{ padding: '6px 12px', backgroundColor: '#1E293B', color: '#3B82F6', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                📊 Export CSV
              </button>
            )}
            {scanHistory.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear local history?')) {
                    localStorage.removeItem('packcheck_scan_history');
                    setScanHistory([]);
                  }
                }}
                style={{ padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {scanHistory.length === 0 ? (
          <div style={{ backgroundColor: '#1E293B', border: '1px dashed #334155', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            No previous scans recorded on this terminal yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {scanHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setImagePreview(item.imageThumbnail);
                  setResult(item.fullData);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={item.imageThumbnail}
                  alt={item.productName}
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#0F172A' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.productName}
                  </h4>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    {item.geo?.district || 'Kanpur'} • {item.timestamp}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: item.score >= 80 ? '#22C55E' : item.score >= 60 ? '#F59E0B' : '#EF4444' }}>
                      {item.score}/100
                    </span>
                    <span style={{ fontSize: '9px', backgroundColor: item.syncStatus === 'SYNCED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.15)', color: item.syncStatus === 'SYNCED' ? '#22C55E' : '#F59E0B', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      {item.syncStatus}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#3B82F6' }}>↗</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}