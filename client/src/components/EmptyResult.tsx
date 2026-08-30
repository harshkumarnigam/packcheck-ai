import { ShieldCheck } from 'lucide-react';

interface EmptyResultProps {
  loadSample: (index: number) => void;
}

export default function EmptyResult({ loadSample }: EmptyResultProps) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <ShieldCheck />
      </div>
      <h2>Your compliance report appears here</h2>
      <p>Try a sample product to see OCR fields, score, warnings, violations and recommendations.</p>
      <button className="secondary" onClick={() => loadSample(1)}>
        Try Sample Product
      </button>
    </div>
  );
}
