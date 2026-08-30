// Hardcoded demo analyses used by the "Try Sample Product" flow.
// These let judges/users see the full report UI without calling Gemini.

import type { Analysis } from '../types';

export const samples: Analysis[] = [
  {
    productName: 'Organic Basmati Rice',
    score: 95,
    status: 'Compliant',
    summary: { pass: 9, warning: 1, fail: 0 },
    notes:
      'Demo result. Replace configurable rules with verified regulatory sources before real-world use.',
    fields: [
      { name: 'Product Name', value: 'Organic Basmati Rice', status: 'PASS', confidence: 99, action: '—' },
      { name: 'Net Quantity', value: '5 kg', status: 'PASS', confidence: 98, action: '—' },
      { name: 'MRP', value: '₹650', status: 'PASS', confidence: 99, action: '—' },
      { name: 'Manufacturer', value: 'ABC Foods Pvt. Ltd.', status: 'PASS', confidence: 96, action: '—' },
      { name: 'Manufacturer Address', value: 'Kanpur, Uttar Pradesh, India', status: 'PASS', confidence: 94, action: '—' },
      { name: 'Consumer Care', value: '1800-000-000', status: 'PASS', confidence: 95, action: '—' },
      { name: 'Packing Date', value: '07/2026', status: 'PASS', confidence: 93, action: '—' },
      { name: 'Country of Origin', value: 'India', status: 'PASS', confidence: 94, action: '—' },
      { name: 'Batch/Lot', value: 'ABR-0726', status: 'PASS', confidence: 91, action: '—' },
      { name: 'Declaration Clarity', value: 'Clear', status: 'WARNING', confidence: 78, action: 'Review image clarity' },
    ],
    violations: [],
  },
  {
    productName: 'Premium Basmati Rice',
    score: 82,
    status: 'Partially Compliant',
    summary: { pass: 7, warning: 2, fail: 2 },
    notes: 'Demo result. Rule references are configurable and not a substitute for legal advice.',
    fields: [
      { name: 'Product Name', value: 'Premium Basmati Rice', status: 'PASS', confidence: 98, action: '—' },
      { name: 'Net Quantity', value: '5 kg', status: 'PASS', confidence: 96, action: '—' },
      { name: 'MRP', value: '₹650', status: 'PASS', confidence: 99, action: '—' },
      { name: 'Manufacturer', value: 'ABC Foods Pvt. Ltd.', status: 'PASS', confidence: 91, action: '—' },
      { name: 'Manufacturer Address', value: 'Not detected', status: 'FAIL', confidence: 0, action: 'Add address' },
      { name: 'Consumer Care', value: '1800-000-000', status: 'PASS', confidence: 94, action: '—' },
      { name: 'Packing Date', value: '07/2026', status: 'WARNING', confidence: 82, action: 'Verify date format' },
      { name: 'Country of Origin', value: 'Not detected', status: 'FAIL', confidence: 0, action: 'Review required declaration' },
      { name: 'Batch/Lot', value: 'ABR-0726', status: 'PASS', confidence: 89, action: '—' },
      { name: 'Declaration Clarity', value: 'Slightly unclear', status: 'WARNING', confidence: 71, action: 'Retake image' },
    ],
    violations: [
      {
        title: 'Manufacturer Address Missing',
        severity: 'High',
        detected: 'No complete manufacturer address was detected.',
        required: 'A clear address should be present according to the configured rule set.',
        recommendation: 'Add and verify the manufacturer/packer/importer address.',
        reference: 'Configurable rule: Manufacturer Details',
      },
      {
        title: 'Declaration Not Detected',
        severity: 'High',
        detected: 'Expected declaration was not detected by the prototype analyzer.',
        required: 'Verify the configured declaration list for this product category.',
        recommendation: 'Review the label manually and update the configured rule set if necessary.',
        reference: 'Configurable rule: Product Information',
      },
    ],
  },
  {
    productName: 'Everyday Wheat Flour',
    score: 58,
    status: 'Needs Review',
    summary: { pass: 5, warning: 2, fail: 4 },
    notes: 'Demo result. Low score indicates the label needs manual review.',
    fields: [
      { name: 'Product Name', value: 'Everyday Wheat Flour', status: 'PASS', confidence: 95, action: '—' },
      { name: 'Net Quantity', value: '5 kg', status: 'PASS', confidence: 93, action: '—' },
      { name: 'MRP', value: '₹290', status: 'PASS', confidence: 98, action: '—' },
      { name: 'Manufacturer', value: 'Not detected', status: 'FAIL', confidence: 0, action: 'Add manufacturer' },
      { name: 'Manufacturer Address', value: 'Not detected', status: 'FAIL', confidence: 0, action: 'Add address' },
      { name: 'Consumer Care', value: 'Not detected', status: 'FAIL', confidence: 0, action: 'Add contact' },
      { name: 'Packing Date', value: 'Unclear', status: 'WARNING', confidence: 62, action: 'Retake image' },
      { name: 'Country of Origin', value: 'Not detected', status: 'FAIL', confidence: 0, action: 'Review declaration' },
      { name: 'Batch/Lot', value: 'WF-882', status: 'PASS', confidence: 88, action: '—' },
      { name: 'Declaration Clarity', value: 'Low contrast', status: 'WARNING', confidence: 59, action: 'Use clearer image' },
    ],
    violations: [
      {
        title: 'Manufacturer Details Missing',
        severity: 'High',
        detected: 'Manufacturer and address fields were not detected.',
        required: 'Verify required manufacturer details using the configured rules.',
        recommendation: 'Add complete manufacturer details and rescan.',
        reference: 'Configurable rule: Manufacturer Details',
      },
      {
        title: 'Consumer Care Missing',
        severity: 'Medium',
        detected: 'No consumer-care contact was detected.',
        required: 'Verify the configured consumer-care requirement.',
        recommendation: 'Add a valid consumer-care contact and rescan.',
        reference: 'Configurable rule: Consumer Care',
      },
    ],
  },
];
