// Shared TypeScript types used across the PackCheck AI frontend.

export type Status = 'PASS' | 'WARNING' | 'FAIL';

export interface Field {
  name: string;
  value: string;
  status: Status;
  confidence: number | null;
  action: string;
}

export interface Violation {
  title: string;
  severity: string;
  detected: string;
  required: string;
  recommendation: string;
  reference: string;
}

export interface AnalysisSummary {
  pass: number;
  warning: number;
  fail: number;
}

export interface Analysis {
  productName: string;
  score: number;
  status: string;
  fields: Field[];
  violations: Violation[];
  summary: AnalysisSummary;
  notes: string;
}
