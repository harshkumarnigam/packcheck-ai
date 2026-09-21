import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Info,
  Search,
  ShieldAlert,
  X,
  Scale,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface RuleDetail {
  id: string;
  category: 'Legal Metrology' | 'FSSAI' | 'AGMARK' | 'BIS / ISI' | 'HFSS Traffic Light' | 'Barcode GS1';
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
  // 1. Legal Metrology - Name & Identity
  {
    id: 'lm-name',
    category: 'Legal Metrology',
    title: 'Product Name / Identity & Nature',
    shortDesc: 'Verify generic or common name declaring the true nature of the packaged commodity.',
    actSection: 'Rule 6(1)(a) - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'Every package must bear the generic or common name of the commodity on the Principal Display Panel (PDP). Fanciful or brand names alone are non-compliant.',
    specifications: [
      'Must clearly state the true commercial nature of food (e.g., "Extruded Corn Snack" not just "Kurkure").',
      'Letter height must adhere to the minimum PDP area proportion requirements (minimum 2mm to 4mm).',
      'Must not mislead the consumer regarding actual ingredients or composition.',
    ],
    examples: {
      compliant: 'Doritos - Nacho Cheese Flavored Tortilla Chips (Namkeen 15.1)',
      nonCompliant: 'Crunchy Bites (No generic commodity description printed on front)',
    },
    penaltyInfo: 'Section 36(1) of Legal Metrology Act - Compounded penalty up to ₹25,000 for first offence.',
  },

  // 2. Legal Metrology - Net Quantity
  {
    id: 'lm-qty',
    category: 'Legal Metrology',
    title: 'Net Quantity in Metric SI Units',
    shortDesc: 'Verify net weight, volume, or count declared in lowercase standard metric SI units.',
    actSection: 'Rule 6(1)(b) & Rule 7 - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'The net quantity in terms of standard unit of weight (g, kg) or volume (ml, l) must be declared conspicuously on the principal display panel.',
    specifications: [
      'Must strictly use SI symbols: "g" or "kg" for solid food, "ml" or "l" for liquids.',
      'Symbols like "Gms", "gm", "KG", "ML" are non-standard metric symbols and punishable.',
      'Minimum font height ranges from 2mm (<50g) to 4mm (200g - 1kg) and 6mm (>1kg).',
    ],
    examples: {
      compliant: 'Net Qty: 500 g (or 1.0 kg / 750 ml)',
      nonCompliant: 'Net Wt.: 500 Gms / 500 gm (Non-standard metric abbreviation)',
    },
    penaltyInfo: 'Misleading quantity declaration invites product seizure and penalty under Rule 7.',
  },

  // 3. Legal Metrology - Maximum Retail Price (MRP)
  {
    id: 'lm-mrp',
    category: 'Legal Metrology',
    title: 'Maximum Retail Price (MRP & Unit Price)',
    shortDesc: 'Verify retail price formatted in ₹ inclusive of all taxes, plus unit sale price.',
    actSection: 'Rule 6(1)(e) - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'Retail sale price shall be printed in Indian Rupees (₹ or Rs.) clearly inclusive of all taxes. For packages containing >1kg/1L, Unit Sale Price is mandatory.',
    specifications: [
      'Must clearly state: "MRP ₹ xx.xx (incl. of all taxes)" or "MRP Rs. xx.xx (incl. of all taxes)".',
      'Unit Sale Price (e.g. ₹ 0.40 / g or ₹ 25.00 / 100g) mandatory on packages > 1kg or > 1L.',
      'Stickers, smudging, or alteration over printed prices is strictly prohibited under Rule 6(2).',
    ],
    examples: {
      compliant: 'MRP ₹ 95.00 (Incl. of all taxes) | Unit Sale Price: ₹ 0.19 / g',
      nonCompliant: 'Price: 95/- (Missing ₹/Rs. currency symbol and "incl. of all taxes" text)',
    },
    penaltyInfo: 'Strict liability under LM Act with fines up to ₹50,000 for subsequent offences.',
  },

  // 4. Legal Metrology - Consumer Care Grievance
  {
    id: 'lm-contact',
    category: 'Legal Metrology',
    title: 'Consumer Care & Grievance Contact',
    shortDesc: 'Verify designated contact person, phone helpline, email, and full postal address.',
    actSection: 'Rule 6(1)(n) - Legal Metrology (Packaged Commodities) Rules, 2011',
    mandatoryRequirement:
      'Every package shall bear the name, address, telephone number, and e-mail address of the person who can be contacted by the consumer in case of complaints.',
    specifications: [
      'Designated contact title (e.g. Consumer Care Manager) must be explicitly stated.',
      'Toll-Free or landline telephone number must be printed in legible font.',
      'Active official email ID for consumer grievance redressal is compulsory.',
    ],
    examples: {
      compliant: 'Consumer Care: Manager, Address as above, Tel: 1800-10-222, Email: care@fmcg.com',
      nonCompliant: 'For feedback visit website www.brand.com (Missing email/toll-free phone)',
    },
    penaltyInfo: 'Deficiency in consumer grievance redressal violates Section 36 of LM Act.',
  },

  // 5. FSSAI - 14-Digit License & Logo
  {
    id: 'fssai-license',
    category: 'FSSAI',
    title: 'FSSAI 14-Digit License Number & Logo',
    shortDesc: 'Verify mandatory 14-digit FSSAI license number and regulatory logo on food packages.',
    actSection: 'Section 23 & 31 - Food Safety and Standards (Packaging and Labelling) 2020',
    mandatoryRequirement:
      'The FSSAI logo and 14-digit license number of the manufacturing, packaging, and marketing entities must be displayed on the back label in contrasting color.',
    specifications: [
      'Must follow the official FSSAI logo geometry and typeface.',
      'First digit indicates registration/license tier (e.g. 1 = Central License, 2 = State).',
      'Next 2 digits indicate State Code (e.g. 00 = Central, 14 = Punjab, 33 = Tamil Nadu).',
    ],
    examples: {
      compliant: 'FSSAI Logo | Lic. No. 10014011002014 (Central License)',
      nonCompliant: 'FSSAI Lic Applied For / Missing 14-digit number (Deemed un-licensed food)',
    },
    penaltyInfo: 'Unlicensed food distribution invites Section 63 penalties: up to 6 months imprisonment & ₹5 Lakh fine.',
  },

  // 6. FSSAI - Vegetarian / Non-Vegetarian Logo
  {
    id: 'fssai-veg',
    category: 'FSSAI',
    title: 'Veg / Non-Veg Green/Brown Symbol',
    shortDesc: 'Verify green circle in green square for veg food and brown triangle for non-veg.',
    actSection: 'Regulation 2.2.2(4) - FSSAI Food Safety and Standards (Packaging) Regulations',
    mandatoryRequirement:
      'Every package of vegetarian food shall bear a green color filled circle inside a green square border. Non-vegetarian food shall bear a brown filled triangle.',
    specifications: [
      'Must be placed prominently near the product name or brand logo on PDP.',
      'Minimum dimension of square border: 6mm for packages up to 100cm² PDP.',
      'Colors must conform to BIS Indian Standard colors.',
    ],
    examples: {
      compliant: '🟩 Green square border containing filled green circle on white background',
      nonCompliant: 'Black & white symbol or ambiguous icon without green square border',
    },
    penaltyInfo: 'Misleading vegetarian declaration invites prosecution for misbranded food under Section 52.',
  },

  // 7. AGMARK - Agricultural Grading (Ghee / Honey / Oils)
  {
    id: 'agmark-grading',
    category: 'AGMARK',
    title: 'AGMARK Grade Certification (Ghee, Oils, Honey)',
    shortDesc: 'Verify AGMARK grade replica (Special / Standard) for agricultural and dairy products.',
    actSection: 'Agricultural Produce (Grading and Marking) Act, 1937 & Ghee Grading Rules',
    mandatoryRequirement:
      'All commercial desi ghee, blended vegetable oils, and honey must undergo mandatory chemical grading and display official AGMARK replica with serial number.',
    specifications: [
      'Must specify grade designation: "Special Grade" or "Standard Grade".',
      'Ghee must meet Baudouin test (negative for sesame oil) and Reichert-Meissl value (minimum 26-28).',
      'Must display official AGMARK emblem with unique batch lot serial.',
    ],
    examples: {
      compliant: 'AGMARK "Special Grade" Ghee - Certificate of Agmark Grading No. AG-7489',
      nonCompliant: 'Pure Village Desi Ghee (No AGMARK seal, no Reichert-Meissl grading certification)',
    },
    penaltyInfo: 'Unauthorized use of AGMARK mark is a cognizable offence under Section 5 of 1937 Act.',
  },

  // 8. BIS / ISI - Mandatory Safety Standard (Packaged Water)
  {
    id: 'bis-water',
    category: 'BIS / ISI',
    title: 'BIS Certification IS 14543 (Packaged Water)',
    shortDesc: 'Verify mandatory ISI mark and CM/L license number on packaged drinking water.',
    actSection: 'Bureau of Indian Standards (BIS) Act, 2016 & IS 14543 Mandatory Order',
    mandatoryRequirement:
      'No person shall manufacture, sell, or distribute packaged drinking water without the standard ISI mark under certification of BIS.',
    specifications: [
      'Must prominently display official ISI mark with standard number "IS:14543".',
      'Must bear the valid 7-digit Certification Marks License (CM/L) number.',
      'Must declare treatment technology: Ozonation / Reverse Osmosis / Mineral Infusion.',
    ],
    examples: {
      compliant: 'IS:14543 ISI Mark | CM/L-0002159 | Packaged Drinking Water (with Minerals)',
      nonCompliant: 'Packaged Pure Spring Water (Missing BIS ISI logo and CM/L license code)',
    },
    penaltyInfo: 'Sale of non-ISI water is prohibited under FSSAI Section 31(2) with immediate factory sealing.',
  },

  // 9. HFSS - Nutritional Traffic Light Thresholds (ICMR)
  {
    id: 'hfss-limits',
    category: 'HFSS Traffic Light',
    title: 'HFSS High Sugar, Sodium & Saturated Fat Warning',
    shortDesc: 'Verify front-of-pack warning triggers for products exceeding ICMR-NIN safe limits.',
    actSection: 'ICMR-National Institute of Nutrition (NIN) Dietary Guidelines & FSSAI Draft',
    mandatoryRequirement:
      'Pre-packaged snacks containing >10g sugar, >5g saturated fat, or >250mg sodium per 100g trigger mandatory HFSS warning classifications.',
    specifications: [
      'Simple Sugar: >10g / 100g triggers Amber; >35g / 100g triggers Red (High Risk).',
      'Saturated Fat: >5g / 100g triggers Saturated Fat Health Alert.',
      'Sodium: >250mg / 100g triggers High Sodium (Salt) Traffic Light Warning.',
    ],
    examples: {
      compliant: 'Roasted Makhana: 1.2g Saturated Fat, 110mg Sodium per 100g (🟢 Safe Green)',
      nonCompliant: 'Cream Sandwich Biscuit: 42g Sugar, 14g Saturated Palm Fat (🔴 HFSS Red Alert)',
    },
    penaltyInfo: 'Misleading health claims on HFSS foods violate Consumer Protection (Misleading Ads) Act 2019.',
  },

  // 10. Barcode - EAN-13 GS1 Standard
  {
    id: 'barcode-gs1',
    category: 'Barcode GS1',
    title: 'EAN-13 Retail Barcode & Origin Prefix (890)',
    shortDesc: 'Verify standard 13-digit EAN barcode with GS1 India prefix 890 for retail traceability.',
    actSection: 'GS1 Global Standards & Legal Metrology Advisory on Point-of-Sale Scanners',
    mandatoryRequirement:
      'All retail packaged goods intended for modern trade must carry a scan-compatible EAN-13 or GS1-128 barcode encoding GTIN, batch, and origin.',
    specifications: [
      '13-digit standard EAN: Prefix "890" denotes product allocated by GS1 India.',
      'Must maintain clean quiet zones (margins) on left and right for optical checkout scanners.',
      'Human-readable numerical digits must be printed beneath the bar lines.',
    ],
    examples: {
      compliant: 'EAN-13: 8901030865421 (GS1 India registered with clear scan contrast)',
      nonCompliant: 'Truncated or un-registered 8-digit custom barcode non-scannable by POS',
    },
    penaltyInfo: 'Defective barcodes that cause checkout mismatches violate Weights & Measures retail provisions.',
  },
];

export default function Rules() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRule, setSelectedRule] = useState<RuleDetail | null>(null);

  const categories = [
    { id: 'all', label: 'All Regulations', icon: '📜', count: RULES_DATA.length },
    { id: 'Legal Metrology', label: 'Legal Metrology 2011', icon: '⚖️', count: 4 },
    { id: 'FSSAI', label: 'FSSAI Food Safety 2020', icon: '🥗', count: 2 },
    { id: 'AGMARK', label: 'AGMARK (Ghee & Oils)', icon: '🌾', count: 1 },
    { id: 'BIS / ISI', label: 'BIS / ISI Standards', icon: '🏅', count: 1 },
    { id: 'HFSS Traffic Light', label: 'HFSS Limits (ICMR)', icon: '🚦', count: 1 },
    { id: 'Barcode GS1', label: 'Barcode GS1 (EAN-13)', icon: '📊', count: 1 },
  ];

  const filteredRules = RULES_DATA.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
      r.actSection.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="page" style={{ padding: '24px 20px 80px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '18px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#38bdf8', textTransform: 'uppercase' }}>
            REGULATORY REPOSITORY
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc', margin: '4px 0 2px 0' }}>
            Statutory Rules & Compliance Standards
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Interactive reference guide covering Legal Metrology, FSSAI 2020, AGMARK, BIS, and ICMR-NIN safe limits.
          </p>
        </div>

        {/* 1-Click Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '8px 14px', width: '100%', maxWidth: '300px' }}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search rules (MRP, FSSAI, Ghee, Sugar)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '13px', outline: 'none', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 1-Click Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '24px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${isActive ? '#38bdf8' : '#1e293b'}`,
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : '#0d1527',
                color: isActive ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', backgroundColor: isActive ? 'rgba(56, 189, 248, 0.3)' : '#1e293b', color: isActive ? '#38bdf8' : '#64748b' }}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredRules.map((rule) => {
          const isFSSAI = rule.category === 'FSSAI';
          const isAgmark = rule.category === 'AGMARK';
          const isBIS = rule.category === 'BIS / ISI';
          const isHFSS = rule.category === 'HFSS Traffic Light';
          const isBarcode = rule.category === 'Barcode GS1';

          const badgeColor = isFSSAI
            ? '#4ade80'
            : isAgmark
            ? '#fbbf24'
            : isBIS
            ? '#818cf8'
            : isHFSS
            ? '#f87171'
            : isBarcode
            ? '#e879f9'
            : '#38bdf8';

          return (
            <div
              key={rule.id}
              onClick={() => setSelectedRule(rule)}
              style={{
                backgroundColor: '#0d1527',
                border: '1px solid #1e293b',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = badgeColor;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div>
                {/* Category & Legal Citation Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30`, textTransform: 'uppercase' }}>
                    {rule.category}
                  </span>
                  <Info size={14} color="#64748b" />
                </div>

                {/* Rule Title */}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                  {rule.title}
                </h3>
                
                {/* Statute reference */}
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginBottom: '10px' }}>
                  {rule.actSection}
                </div>

                {/* Plain-language summary */}
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  {rule.shortDesc}
                </p>

                {/* Visual Pass vs Fail Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', backgroundColor: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '6px 8px', borderRadius: '6px' }}>
                    <CheckCircle2 size={13} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: '#dcfce7' }}>{rule.examples.compliant}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', backgroundColor: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '6px 8px', borderRadius: '6px' }}>
                    <ShieldAlert size={13} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: '#fee2e2' }}>{rule.examples.nonCompliant}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>⚖️ {rule.penaltyInfo.split('-')[0]}</span>
                <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Inspect Full Law →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Click Interactive Legal Detail Modal */}
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
            padding: '16px',
          }}
          onClick={() => setSelectedRule(null)}
        >
          <div
            style={{
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0d1527',
              border: '1px solid #38bdf8',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              padding: '24px',
              color: '#f8fafc'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  {selectedRule.category}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '6px 0 2px 0', color: '#f8fafc' }}>
                  {selectedRule.title}
                </h2>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
                  {selectedRule.actSection}
                </div>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Statutory Mandate */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>
                <BookOpen size={14} /> Statutory Legal Mandate
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', backgroundColor: '#070e1c', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                {selectedRule.mandatoryRequirement}
              </p>
            </div>

            {/* Checklist Specifications */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                <FileText size={14} /> Officer Verification Checklist:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                {selectedRule.specifications.map((spec, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Pass vs Fail Examples */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ade80', fontWeight: 800, fontSize: '11px', marginBottom: '4px' }}>
                  <CheckCircle2 size={13} /> Compliant Format
                </div>
                <div style={{ fontSize: '11px', color: '#f8fafc' }}>
                  {selectedRule.examples.compliant}
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f87171', fontWeight: 800, fontSize: '11px', marginBottom: '4px' }}>
                  <ShieldAlert size={13} /> Violation Example
                </div>
                <div style={{ fontSize: '11px', color: '#f8fafc' }}>
                  {selectedRule.examples.nonCompliant}
                </div>
              </div>
            </div>

            {/* Penalty Warning Box */}
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#070e1c', borderLeft: '4px solid #fbbf24', fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
              <span style={{ color: '#fbbf24', fontWeight: 800 }}>Statutory Notice & Penalties: </span>
              {selectedRule.penaltyInfo}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedRule(null)}
                style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}