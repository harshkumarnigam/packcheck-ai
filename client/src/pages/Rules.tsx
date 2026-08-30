import { useState } from 'react';
import { BookOpen, CheckCircle2, FileText, Info, Search, ShieldAlert, X } from 'lucide-react';

interface RuleDetail {
  id: string;
  category: string;
  title: string;
  shortDesc: string;
  actSection: string;
  mandatoryRequirement: string;
  specifications: string[];
  examples: {
    compliant: string;
    nonCompliant: string;
  };
  penaltyInfo: string;
}

const RULES_DATA: RuleDetail[] = [
  {
    id: 'rule-name',
    category: 'Product Information',
    title: 'Product Name / Identity',
    shortDesc: 'Verify generic/common name and clear nature of the packaged commodity.',
    actSection: 'Rule 6(1)(a) - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'Every package shall bear the name and common or generic names of the commodity contained in the package on the Principal Display Panel (PDP).',
    specifications: [
      'Must clearly describe the true nature of food/commodity (not just a brand/trademark name).',
      'Letter height must adhere to the minimum PDP area proportion requirements.',
      'Must not mislead the consumer regarding ingredients or product quality.',
    ],
    examples: {
      compliant: 'Doritos - Corn Chips (Proprietary Food - Namkeen 15.1)',
      nonCompliant: 'Crunchy Crunch (No generic description or category mentioned)',
    },
    penaltyInfo: 'Section 36(1) of Legal Metrology Act - Fine up to ₹25,000 for first offence.',
  },
  {
    id: 'rule-qty',
    category: 'Quantity',
    title: 'Net Quantity',
    shortDesc: 'Verify quantity declaration, standard metric units, and font sizing.',
    actSection: 'Rule 6(1)(b) & Rule 7 - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'The net quantity in terms of standard unit of weight or measure (g, kg, ml, l) or number must be declared conspicuously on the principal display panel.',
    specifications: [
      'Must use SI units: "g" or "kg" for solids, "ml" or "l" for liquids.',
      'Font height depends on net quantity (e.g. 4mm minimum height for packages between 200g to 1kg).',
      'Symbols must be lowercase standard abbreviations (e.g. "g" not "Gms", "kg" not "KG").',
    ],
    examples: {
      compliant: 'Net Qty: 100 g (or 1.0 kg)',
      nonCompliant: 'Net Weight: 100 Gms / 100 gm (Non-standard metric symbol)',
    },
    penaltyInfo: 'Misleading quantity declaration invites seizure and compounded penalty.',
  },
  {
    id: 'rule-mrp',
    category: 'Price / MRP',
    title: 'Maximum Retail Price (MRP)',
    shortDesc: 'Verify displayed price format including "inclusive of all taxes".',
    actSection: 'Rule 6(1)(e) - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'The retail sale price of the package shall be clearly printed in Indian Rupees (₹ or Rs.) inclusive of all taxes, along with unit sale price where applicable.',
    specifications: [
      'Must clearly state: "MRP ₹ xx.xx (incl. of all taxes)" or "MRP Rs. xx.xx incl. of all taxes".',
      'For packages containing more than 1kg/1L, Unit Sale Price (e.g., ₹ per 100g/ml) is mandatory.',
      'Over-writing, smudging or pasting over existing price stickers is prohibited.',
    ],
    examples: {
      compliant: 'MRP ₹ 40.00 (Incl. of all taxes) | Unit Price: ₹ 0.40/g',
      nonCompliant: 'Price: 40/- (Missing ₹/Rs. symbol & taxes declaration)',
    },
    penaltyInfo: 'Strict liability under LM Act with fines up to ₹50,000 for subsequent offences.',
  },
  {
    id: 'rule-mfg',
    category: 'Manufacturer Details',
    title: 'Manufacturer / Packer / Importer',
    shortDesc: 'Verify full corporate identity, postal address, and manufacturing origin.',
    actSection: 'Rule 6(1)(aa) & FSSAI Labeling Regulations',
    mandatoryRequirement:
      'The name and complete postal address of the manufacturer, or packer, or importer must be explicitly declared on the package.',
    specifications: [
      'Complete address must include Pin Code, State, and Country of origin if imported.',
      'In case of contract packaging: "Manufactured by X for Y" must be specified.',
      'FSSAI 14-digit license number and logo must be printed on the back label for food products.',
    ],
    examples: {
      compliant: 'Mfd by: PepsiCo India Holdings Pvt. Ltd., Village Channo, Sangrur, Punjab - 148026',
      nonCompliant: 'Mfd by: PepsiCo India, Sangrur (Incomplete postal address, missing pincode)',
    },
    penaltyInfo: 'Packaging without traceable manufacturer address is deemed contraband.',
  },
  {
    id: 'rule-contact',
    category: 'Consumer Care',
    title: 'Consumer Contact & Grievance',
    shortDesc: 'Verify consumer helpline phone, email, and designated grievance address.',
    actSection: 'Rule 6(1)(n) - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'Every package shall bear the name, address, telephone number, and e-mail address of the person who can be contacted by the consumer in case of complaints.',
    specifications: [
      'Designated contact person or Consumer Care Cell title must be stated.',
      'Valid Toll-Free / Landline / Mobile number must be legible.',
      'Active official email ID for consumer redressal is compulsory.',
    ],
    examples: {
      compliant: 'Consumer Care: Manager, Address as above, Tel: 1800-22-4020, Email: feedback@brand.com',
      nonCompliant: 'For feedback visit our website www.brand.com (Missing email/phone number)',
    },
    penaltyInfo: 'Deficiency in grievance contact violates consumer rights protection rules.',
  },
  {
    id: 'rule-date',
    category: 'Date Information',
    title: 'Packing / Manufacturing Date',
    shortDesc: 'Verify month and year of manufacture, expiry, or best before declaration.',
    actSection: 'Rule 6(1)(d) - Legal Metrology & FSSR (Labelling and Display) 2020',
    mandatoryRequirement:
      'The month and year in which the commodity is manufactured, packed or pre-packed shall be clearly indicated.',
    specifications: [
      'Format can be MM/YYYY or DD/MM/YYYY.',
      'Food items must declare "Best Before" or "Expiry Date" along with storage conditions.',
      'Inkjet printing of batch number and date must be smudge-proof and readable.',
    ],
    examples: {
      compliant: 'Pkd Date: 12/08/2026 | Best Before 6 months from packaging',
      nonCompliant: 'Pkd: 08/26 (Unclear day/month format without storage conditions)',
    },
    penaltyInfo: 'Selling post-expiry commodities is a criminal offence under Food Safety Act.',
  },
];

export default function Rules() {
  const [search, setSearch] = useState('');
  const [selectedRule, setSelectedRule] = useState<RuleDetail | null>(null);

  const filteredRules = RULES_DATA.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.shortDesc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow" style={{ color: '#38bdf8' }}>REGULATORY COMPLIANCE</span>
          <h1>Rules & References</h1>
          <p>Click on any rule to inspect statutory standards, Legal Metrology (2011) mandates, and validation checks.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="searchbox">
        <Search size={18} color="var(--muted)" />
        <input
          type="text"
          placeholder="Search rules (e.g. MRP, Net quantity, Manufacturer, Date)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Rules Grid */}
      <div className="rules-grid">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="card rule-card-item"
            onClick={() => setSelectedRule(rule)}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge info" style={{ fontSize: '10px' }}>
                  {rule.category}
                </span>
                <Info size={16} style={{ color: 'var(--primary)', opacity: 0.8 }} />
              </div>

              <h2 style={{ fontSize: '19px', marginTop: '6px', marginBottom: '8px', color: 'var(--text)' }}>
                {rule.title}
              </h2>
              <p style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 12px' }}>{rule.shortDesc}</p>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--line)',
                paddingTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'var(--muted)',
              }}
            >
              <span>{rule.actSection.split('-')[0]}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Click to inspect →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rule Detail Modal Popup */}
      {selectedRule && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 999,
            padding: '20px',
          }}
          onClick={() => setSelectedRule(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--surface)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge info" style={{ marginBottom: '8px' }}>
                  {selectedRule.category}
                </span>
                <h2 style={{ fontSize: '26px', margin: '4px 0 6px', color: 'var(--text)' }}>{selectedRule.title}</h2>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                  {selectedRule.actSection}
                </span>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--text)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--line)', margin: '14px 0' }} />

            {/* Mandatory Requirement */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px', color: '#38bdf8' }}>
                <BookOpen size={16} /> Statutory Mandate
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                {selectedRule.mandatoryRequirement}
              </p>
            </div>

            {/* Validation Checklist */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px', color: 'var(--text)' }}>
                <FileText size={16} /> Verification Checklist
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                {selectedRule.specifications.map((spec, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Examples: Pass vs Fail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(52, 211, 153, 0.08)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontWeight: 700, fontSize: '12px' }}>
                  <CheckCircle2 size={15} /> Compliant Format
                </div>
                <p style={{ fontSize: '12px', margin: '6px 0 0', color: 'var(--text)' }}>
                  {selectedRule.examples.compliant}
                </p>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(248, 113, 113, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red)', fontWeight: 700, fontSize: '12px' }}>
                  <ShieldAlert size={15} /> Non-Compliant / Violation
                </div>
                <p style={{ fontSize: '12px', margin: '6px 0 0', color: 'var(--text)' }}>
                  {selectedRule.examples.nonCompliant}
                </p>
              </div>
            </div>

            {/* Penalty Warning */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--surface2)',
                borderLeft: '4px solid var(--yellow)',
                fontSize: '11px',
                color: 'var(--muted)',
              }}
            >
              <b style={{ color: 'var(--yellow)' }}>Statutory Notice: </b>
              {selectedRule.penaltyInfo}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}