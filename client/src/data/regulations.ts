// PackCheck AI - Comprehensive Multi-Regulation Regulatory Engine
// Covers:
// 1. Legal Metrology (Packaged Commodities) Rules, 2011
// 2. Food Safety & Standards (Labelling and Display) Regulations, 2020 (FSSAI)
// 3. AGMARK (Agricultural Produce Grading and Marking Act, 1937)
// 4. BIS / ISI (Bureau of Indian Standards Act, 2016)
// 5. Nutritional HFSS Traffic Light (High Fat, Sugar, Sodium)
// 6. Barcode & Smart QR Verification (EAN-13 & FoSCoS)

export type RegulationStatus = 'PASS' | 'REVIEW' | 'FAIL' | 'NOT_APPLICABLE';

export interface RegulationCheck {
  id: string;
  name: string;
  shortName: string;
  category: 'LEGAL_METROLOGY' | 'FSSAI' | 'AGMARK' | 'BIS_ISI' | 'NUTRITION' | 'BARCODE';
  status: RegulationStatus;
  scoreImpact: number;
  actSection: string;
  detail: string;
  detailHi?: string;
  detailHinglish?: string;
  recommendation: string;
  penalty?: string;
}

export interface ProductAnalysisData {
  productName: string;
  productConfidence?: number;
  identificationStatus?: 'IDENTIFIED' | 'UNSURE';
  ocrText?: string;
  category?: string;
  brand?: string;
  score: number;
  fssaiLicense?: string;
  batchNumber?: string;
  netWeight?: string;
  mrp?: string;
  mfgDate?: string;
  expiryDate?: string;
  consumerCare?: string;
  manufacturerAddress?: string;
  countryOfOrigin?: string;
  barcode?: string;
  qrCode?: string;
  agmarkMark?: string;
  agmarkGrade?: string;
  bisIsiMark?: string;
  cmlNumber?: string;
  isVeg?: boolean;
  isDiabeticSafe?: boolean;
  isGlutenFree?: boolean;
  declarations?: Array<{ name: string; status: string; details?: string }>;
  ingredients?: Array<{ name: string; percentage?: string; type?: string; safety?: string }>;
  nutritionTable?: Array<{ parameter: string; value: string; perServe?: string; status: string }>;
  harmfulItems?: Array<{ ingredient: string; level: string; color: string; problem: string }>;
  healthyAlternatives?: Array<{ name: string; brand: string; whyBetter: string; calories: string; tag: string }>;
  verdict?: {
    title: string;
    subtext: string;
    color: string;
    bgColor: string;
    borderColor: string;
  };
}

// EAN-13 Check Digit Calculation & Validation
export function validateEAN13(barcode?: string): boolean {
  if (!barcode) return false;
  const cleaned = barcode.replace(/\D/g, '');
  if (cleaned.length !== 13) return false;

  const digits = cleaned.split('').map(Number);
  const checksum = digits.slice(0, 12).reduce((sum, d, idx) => {
    return sum + (idx % 2 === 0 ? d : d * 3);
  }, 0);

  const checkDigit = (10 - (checksum % 10)) % 10;
  return checkDigit === digits[12];
}

// 14-Digit FSSAI License Number Validation
export function validateFSSAILicense(lic?: string): { isValid: boolean; stateCode?: string; category?: string } {
  if (!lic) return { isValid: false };
  const cleaned = lic.replace(/\D/g, '');
  if (cleaned.length !== 14) return { isValid: false };

  // FSSAI 14 digits format:
  // Digit 1: 1 (Central license) or 2 (State license)
  // Digits 2-3: State code (e.g., 00 = Central, 14 = Punjab, 33 = UP)
  // Digits 4-5: Year of registration
  // Digits 6-8: Registrar code
  // Digits 9-14: Serial number
  const prefix = cleaned.charAt(0);
  const stateCode = cleaned.slice(1, 3);
  const isTypeValid = prefix === '1' || prefix === '2';

  return {
    isValid: isTypeValid,
    stateCode,
    category: prefix === '1' ? 'Central FSSAI License' : 'State Food Authority License',
  };
}

// Helper to test if any declaration contains specified terms
function hasDeclaration(
  declarations: Array<{ name: string; status: string; details?: string }> | undefined,
  terms: string[]
): boolean {
  if (!declarations || declarations.length === 0) return false;
  return declarations.some((dec) => {
    const text = `${dec.name} ${dec.details || ''}`.toLowerCase();
    const isPass = dec.status.toLowerCase().includes('pass') || dec.status.toLowerCase().includes('clear') || dec.status.toLowerCase().includes('valid');
    return terms.some((t) => text.includes(t.toLowerCase())) && isPass;
  });
}

// Main Multi-Regulation Builder
export function buildRegulationChecks(data: ProductAnalysisData): RegulationCheck[] {
  const decs = data.declarations || [];
  const nutri = data.nutritionTable || [];
  const ingr = data.ingredients || [];
  const cat = (data.category || '').toLowerCase();
  const prod = (data.productName || '').toLowerCase();

  // 1. Legal Metrology - MRP
  const hasMRP = Boolean(
    (data.mrp && data.mrp !== 'Not detected' && !data.mrp.includes('Missing')) ||
    hasDeclaration(decs, ['mrp', 'price', 'retail price', 'inclusive'])
  );

  // 2. Legal Metrology - Net Quantity with Metric SI Units
  const hasNetQty = Boolean(
    (data.netWeight && data.netWeight !== 'Not detected') ||
    hasDeclaration(decs, ['net qty', 'net weight', 'quantity', 'weight'])
  );

  // 3. Legal Metrology - Complete Manufacturer Postal Address with PIN
  const hasAddress = Boolean(
    (data.manufacturerAddress && data.manufacturerAddress !== 'Not detected' && data.manufacturerAddress.length > 10) ||
    hasDeclaration(decs, ['manufacturer', 'address', 'mfd by', 'packaged by', 'pincode', 'pin'])
  );

  // 4. Legal Metrology - Consumer Care Helpline / Grievance Officer
  const hasCustomerCare = Boolean(
    (data.consumerCare && data.consumerCare !== 'Not detected') ||
    hasDeclaration(decs, ['consumer care', 'customer care', 'helpline', 'grievance', 'feedback', 'care email', 'care phone'])
  );

  // 5. Legal Metrology - Date of Packing / Import (Month & Year)
  const hasMfgDate = Boolean(
    (data.mfgDate && data.mfgDate !== 'Not detected') ||
    hasDeclaration(decs, ['packing date', 'mfg date', 'pkd', 'best before', 'use by', 'date of packing'])
  );

  // 6. FSSAI - 14 Digit License Validation
  const fssaiLic = data.fssaiLicense || '';
  const licValidation = validateFSSAILicense(fssaiLic);
  const hasFSSAILic = Boolean(
    (licValidation.isValid) ||
    (fssaiLic.length >= 10 && !fssaiLic.toLowerCase().includes('not detected')) ||
    hasDeclaration(decs, ['fssai', 'license no', 'lic no'])
  );

  // 7. FSSAI - Veg / Non-Veg Symbol
  const hasVegSymbol = Boolean(
    data.isVeg !== undefined ||
    hasDeclaration(decs, ['veg', 'non-veg', 'green dot', 'vegetarian', 'symbol'])
  );

  // 8. FSSAI - Ingredients List with QID %
  const hasQIDIngredients = ingr.length > 0 || hasDeclaration(decs, ['ingredient', 'ingredients', 'composition']);

  // 9. AGMARK - Agricultural Commodities Check
  const isAgmarkCategory = cat.includes('ghee') || cat.includes('oil') || cat.includes('honey') || cat.includes('spice') || cat.includes('pulse') || cat.includes('atta') || cat.includes('rice') || prod.includes('ghee') || prod.includes('honey') || prod.includes('oil') || prod.includes('rice') || prod.includes('flour');
  const hasAgmark = Boolean(
    (data.agmarkMark && data.agmarkMark !== 'Not detected') ||
    hasDeclaration(decs, ['agmark', 'agmark grade', 'ca number'])
  );

  // 10. BIS / ISI - Mandatory for Packaged Water, Infant Milk, Condensed Milk
  const isBISCategory = cat.includes('water') || cat.includes('drinking') || cat.includes('infant') || cat.includes('formula') || cat.includes('milk powder') || prod.includes('water') || prod.includes('infant');
  const hasBIS = Boolean(
    (data.bisIsiMark && data.bisIsiMark !== 'Not detected') ||
    (data.cmlNumber && data.cmlNumber !== 'Not detected') ||
    hasDeclaration(decs, ['bis', 'isi', 'is 14543', 'is 13428', 'cml'])
  );

  // 11. Nutrition Label HFSS (High Fat, Sugar, Sodium)
  const sodiumRow = nutri.find(n => n.parameter.toLowerCase().includes('sodium'));
  const sugarRow = nutri.find(n => n.parameter.toLowerCase().includes('sugar'));
  const satFatRow = nutri.find(n => n.parameter.toLowerCase().includes('saturated fat') || n.parameter.toLowerCase().includes('sat fat'));

  let sodiumVal = 0;
  if (sodiumRow) {
    const match = sodiumRow.value.match(/(\d+(\.\d+)?)/);
    if (match) sodiumVal = parseFloat(match[1]);
  }
  let sugarVal = 0;
  if (sugarRow) {
    const match = sugarRow.value.match(/(\d+(\.\d+)?)/);
    if (match) sugarVal = parseFloat(match[1]);
  }

  const isHighSodium = sodiumVal > 250; // >250mg per 100g is HFSS in India
  const isHighSugar = sugarVal > 10;   // >10g per 100g is HFSS threshold

  // 12. Barcode / QR Check
  const isBarcodePresent = Boolean(data.barcode || data.qrCode || hasDeclaration(decs, ['barcode', 'ean', 'qr', 'upc']));
  const isEanValid = data.barcode ? validateEAN13(data.barcode) : true;

  const checks: RegulationCheck[] = [
    // 1. Legal Metrology - MRP
    {
      id: 'lm-mrp',
      name: 'Legal Metrology (MRP Declaration)',
      shortName: 'LM (MRP)',
      category: 'LEGAL_METROLOGY',
      status: hasMRP ? 'PASS' : 'FAIL',
      scoreImpact: hasMRP ? 15 : -15,
      actSection: 'Rule 6(1)(e) - Legal Metrology (Packaged Commodities) Rules, 2011',
      detail: hasMRP
        ? `Maximum Retail Price declared: ${data.mrp || '₹ Inclusive of all taxes'}`
        : 'Missing or illegible MRP declaration. Must include "Inclusive of all taxes" and Unit Sale Price.',
      detailHi: hasMRP
        ? `अधिकतम खुदरा मूल्य घोषित: ${data.mrp || '₹ सभी करों सहित'}`
        : 'एमआरपी घोषणा गायब या अस्पष्ट है। सभी करों सहित लिखना अनिवार्य है।',
      detailHinglish: hasMRP
        ? `MRP declared: ${data.mrp || '₹ (taxes included)'}`
        : 'MRP declaration missing hai. Rule 6(1)(e) ke tahat taxes included likhna zaroori hai.',
      recommendation: 'Declare MRP clearly with ₹ symbol and "Inclusive of all taxes". Include Unit Sale Price for packages over 1kg/1L.',
      penalty: 'Fine up to ₹25,000 for first offence under Section 36(1) of LM Act.',
    },

    // 2. Legal Metrology - Net Quantity
    {
      id: 'lm-qty',
      name: 'Legal Metrology (Net Quantity & SI Units)',
      shortName: 'LM (Net Qty)',
      category: 'LEGAL_METROLOGY',
      status: hasNetQty ? 'PASS' : 'FAIL',
      scoreImpact: hasNetQty ? 10 : -15,
      actSection: 'Rule 6(1)(b) & Rule 7 - Legal Metrology Rules, 2011',
      detail: hasNetQty
        ? `Net weight/quantity declared: ${data.netWeight || 'Standard metric units detected'}`
        : 'Net quantity not declared in standard metric units (g, kg, ml, l).',
      detailHi: hasNetQty
        ? `शुद्ध मात्रा घोषित: ${data.netWeight || 'मानक मीट्रिक इकाई मौजूद'}`
        : 'शुद्ध मात्रा मानक मीट्रिक इकाइयों (g, kg, ml, l) में घोषित नहीं है।',
      detailHinglish: hasNetQty
        ? `Net quantity declared: ${data.netWeight || 'Standard metric SI units detected'}`
        : 'Net Quantity standard units me nahi mila. Correct units (g, kg, ml) use karein.',
      recommendation: 'Print Net Qty in lowercase standard symbols (e.g., "g" or "kg", never "Gms"). Adhere to font size norms.',
      penalty: 'Seizure of non-standard commodity lots and compounding fees.',
    },

    // 3. Legal Metrology - Manufacturer Name & Address with PIN
    {
      id: 'lm-mfg',
      name: 'Legal Metrology (Manufacturer Full Address & Origin)',
      shortName: 'LM (Mfr/Origin)',
      category: 'LEGAL_METROLOGY',
      status: hasAddress ? 'PASS' : 'FAIL',
      scoreImpact: hasAddress ? 10 : -10,
      actSection: 'Rule 6(1)(a) & (aa) - Legal Metrology Rules, 2011',
      detail: hasAddress
        ? `Manufacturer postal address & country of origin verified: ${data.manufacturerAddress || data.countryOfOrigin || 'India'}`
        : 'Complete postal address with State and PIN code missing from package.',
      detailHi: hasAddress
        ? `निर्माता का डाक पता एवं मूल देश सत्यापित: ${data.manufacturerAddress || 'भारत'}`
        : 'पिन कोड एवं राज्य सहित निर्माता का पूरा डाक पता पैकेज पर मौजूद नहीं है।',
      detailHinglish: hasAddress
        ? `Manufacturer address & origin verified hai.`
        : 'Manufacturer ka complete address with PIN code missing hai.',
      recommendation: 'Include full registered corporate identity, factory street address, State, Pin Code, and Country of Origin.',
      penalty: 'Deemed misbranded and untraceable packaging under Legal Metrology Act.',
    },

    // 4. Legal Metrology - Consumer Care Contact
    {
      id: 'lm-care',
      name: 'Legal Metrology (Consumer Care Contact & Grievance)',
      shortName: 'LM (Customer Care)',
      category: 'LEGAL_METROLOGY',
      status: hasCustomerCare ? 'PASS' : 'FAIL',
      scoreImpact: hasCustomerCare ? 10 : -10,
      actSection: 'Rule 6(1)(h) - Legal Metrology Rules, 2011',
      detail: hasCustomerCare
        ? `Consumer helpline & email address detected: ${data.consumerCare || 'Helpline active'}`
        : 'Mandatory consumer grievance contact (Phone number + Email/Address) missing.',
      detailHi: hasCustomerCare
        ? `ग्राहक सेवा हेल्पलाइन एवं ईमेल दर्ज है: ${data.consumerCare || 'सक्रिय'}`
        : 'अनिवार्य उपभोक्ता शिकायत निवारण संपर्क (फोन नंबर + ईमेल) गायब है।',
      detailHinglish: hasCustomerCare
        ? `Customer care phone & email detected hai.`
        : 'Consumer care contact missing hai. Phone ya email add karna mandatory hai.',
      recommendation: 'Declare consumer helpline telephone number, email address, and postal address of grievance cell.',
      penalty: 'Notice for misleading packaging and consumer complaint penalty up to ₹50,000.',
    },

    // 5. FSSAI - License Number
    {
      id: 'fssai-lic',
      name: 'FSSAI License & FoSCoS Traceability',
      shortName: 'FSSAI (License)',
      category: 'FSSAI',
      status: hasFSSAILic ? 'PASS' : 'FAIL',
      scoreImpact: hasFSSAILic ? 15 : -20,
      actSection: 'Section 23, 31 - Food Safety and Standards Act, 2006 & Regulations 2020',
      detail: hasFSSAILic
        ? `14-digit FSSAI License: ${data.fssaiLicense || 'Valid registration detected'} (${licValidation.category || 'FSSAI Verified'})`
        : '14-digit FSSAI License number missing, expired, or improperly formatted.',
      detailHi: hasFSSAILic
        ? `14-अंकीय FSSAI लाइसेंस: ${data.fssaiLicense || 'सत्यापित'}`
        : '14-अंकीय FSSAI लाइसेंस नंबर गायब या अमान्य है।',
      detailHinglish: hasFSSAILic
        ? `14-digit FSSAI License valid detected: ${data.fssaiLicense || 'Valid'}`
        : 'FSSAI 14-digit license missing ya invalid format me hai.',
      recommendation: 'Print the FSSAI logo and 14-digit license number prominently on the information panel of the label.',
      penalty: 'Penalty up to ₹5,00,000 for carrying on food business without valid license (Section 63).',
    },

    // 6. FSSAI - Veg / Non-Veg Indicator
    {
      id: 'fssai-veg',
      name: 'FSSAI Veg / Non-Veg Logo Declaration',
      shortName: 'FSSAI (Veg/Non-Veg)',
      category: 'FSSAI',
      status: hasVegSymbol ? 'PASS' : 'REVIEW',
      scoreImpact: hasVegSymbol ? 10 : -5,
      actSection: 'FSS (Labelling and Display) Regulations, 2020 - Regulation 2.2.2',
      detail: hasVegSymbol
        ? (data.isVeg ? 'Vegetarian Green Dot Symbol verified' : 'Non-Vegetarian Brown Triangle Symbol verified')
        : 'Green/Brown dietary classification logo not distinctly detected on the principal display panel.',
      detailHi: hasVegSymbol
        ? (data.isVeg ? 'शाकाहारी हरा प्रतीक सत्यापित' : 'मांसाहारी भूरा प्रतीक सत्यापित')
        : 'शाकाहारी/मांसाहारी प्रतीक मुख्य डिस्प्ले पैनल पर स्पष्ट नहीं है।',
      detailHinglish: hasVegSymbol
        ? (data.isVeg ? 'Green Veg dot logo verified' : 'Brown Non-veg logo verified')
        : 'Veg/Non-veg logo clear nahi hai PDP par.',
      recommendation: 'Display the vegetarian (green circle in square) or non-vegetarian (brown triangle in square) logo prominently.',
      penalty: 'Violation notice under FSSAI Labelling Regulations.',
    },

    // 7. FSSAI - Ingredients & QID %
    {
      id: 'fssai-qid',
      name: 'FSSAI Quantitative Ingredient Declaration (QID)',
      shortName: 'FSSAI (QID)',
      category: 'FSSAI',
      status: hasQIDIngredients ? 'PASS' : 'REVIEW',
      scoreImpact: hasQIDIngredients ? 10 : -5,
      actSection: 'Regulation 5(2) - FSS (Labelling and Display) Regulations, 2020',
      detail: hasQIDIngredients
        ? `${ingr.length || 'Multiple'} ingredients declared in descending order of incoming weight.`
        : 'Ingredient listing is missing or does not state quantitative percentages for highlighted ingredients.',
      detailHi: hasQIDIngredients
        ? `घटक सूची वजन के घटते क्रम में घोषित है।`
        : 'सामग्री सूची गायब है या प्रमुख घटकों का प्रतिशत नहीं दर्शाया गया है।',
      detailHinglish: hasQIDIngredients
        ? `Ingredients descending order me listed hain.`
        : 'Ingredient list missing hai ya percentage clearly marked nahi hai.',
      recommendation: 'List all ingredients in descending order of weight. Mention exact percentage for ingredients highlighted in name/pictures.',
      penalty: 'Misbranding violation under Section 52 of FSS Act.',
    },

    // 8. AGMARK Certification Check
    {
      id: 'agmark-seal',
      name: 'AGMARK Grade & Quality Certification',
      shortName: 'AGMARK',
      category: 'AGMARK',
      status: !isAgmarkCategory ? 'NOT_APPLICABLE' : hasAgmark ? 'PASS' : 'REVIEW',
      scoreImpact: isAgmarkCategory ? (hasAgmark ? 10 : -5) : 0,
      actSection: 'Agricultural Produce (Grading and Marking) Act, 1937',
      detail: !isAgmarkCategory
        ? 'Not mandatory for this commodity category (applicable to Ghee, Honey, Edible Oils, Spices, Grains).'
        : hasAgmark
        ? `AGMARK Quality Grade verified: ${data.agmarkGrade || 'Standard Grade Certified'}`
        : 'Agricultural commodity lacking AGMARK grade designation mark on packaging.',
      detailHi: !isAgmarkCategory
        ? 'इस उत्पाद श्रेणी के लिए अनिवार्य नहीं है (घी, शहद, खाद्य तेल, दालों पर लागू)।'
        : hasAgmark
        ? 'एगमार्क गुणवत्ता ग्रेड सत्यापित है।'
        : 'कृषि उत्पाद पैकेज पर एगमार्क ग्रेड मार्क गायब है।',
      detailHinglish: !isAgmarkCategory
        ? 'Iss commodity par AGMARK mandatory nahi hai.'
        : hasAgmark
        ? 'AGMARK grading mark verified hai.'
        : 'AGMARK certification seal missing hai for agricultural product.',
      recommendation: isAgmarkCategory
        ? 'Affix the AGMARK replica with serial number, certificate of authorization (CA), and grading code.'
        : 'N/A for manufactured extruded/bakery snacks.',
      penalty: isAgmarkCategory ? 'Prohibition of sale under Agricultural Grading Rules.' : undefined,
    },

    // 9. BIS / ISI Mandatory Standard Check
    {
      id: 'bis-isi',
      name: 'BIS / ISI Mandatory Safety Certification',
      shortName: 'BIS / ISI',
      category: 'BIS_ISI',
      status: !isBISCategory ? 'NOT_APPLICABLE' : hasBIS ? 'PASS' : 'FAIL',
      scoreImpact: isBISCategory ? (hasBIS ? 15 : -25) : 0,
      actSection: 'Section 16 - Bureau of Indian Standards Act, 2016',
      detail: !isBISCategory
        ? 'Mandatory only for specified notified goods (Packaged Drinking Water, Infant Foods, Milk Powders).'
        : hasBIS
        ? `Mandatory ISI Mark verified: ${data.bisIsiMark || 'IS 14543 / CM/L Verified'}`
        : 'CRITICAL: Mandatory ISI Standard Mark & 7-digit CM/L license number missing on notified commodity.',
      detailHi: !isBISCategory
        ? 'केवल अधिसूचित वस्तुओं (पैकेज्ड पेयजल, शिशु आहार आदि) के लिए अनिवार्य है।'
        : hasBIS
        ? 'अनिवार्य ISI मार्क सत्यापित है।'
        : 'गंभीर: अधिसूचित वस्तु पर अनिवार्य ISI मानक मार्क और CM/L लाइसेंस गायब है।',
      detailHinglish: !isBISCategory
        ? 'Notified categories (Water, Baby food) ke alawa ISI mandatory nahi hai.'
        : hasBIS
        ? 'ISI Standard mark verified hai.'
        : 'CRITICAL: Packaged water/infant food par mandatory ISI mark missing hai.',
      recommendation: isBISCategory
        ? 'Obtain and print BIS ISI mark along with valid 7-digit CM/L license number.'
        : 'Ensure packaging material complies with BIS food grade polymer standards.',
      penalty: isBISCategory ? 'Non-bailable offence under BIS Act 2016 with imprisonment and seizure of product inventory.' : undefined,
    },

    // 10. Nutrition & HFSS Traffic Light (Indian Health Thresholds)
    {
      id: 'nutri-hfss',
      name: 'Nutrition Traffic Light & HFSS Health Risk',
      shortName: 'Nutrition (HFSS)',
      category: 'NUTRITION',
      status: (isHighSodium || isHighSugar) ? 'REVIEW' : (nutri.length > 0 ? 'PASS' : 'FAIL'),
      scoreImpact: (isHighSodium || isHighSugar) ? -10 : (nutri.length > 0 ? 10 : -10),
      actSection: 'FSSAI Front-of-Pack Labelling (FOPL) & Dietary Guidelines for Indians (ICMR-NIN)',
      detail: nutri.length === 0
        ? 'Mandatory nutrition facts panel missing from label.'
        : (isHighSodium || isHighSugar)
        ? `HFSS WARNING: High ${isHighSodium ? 'Sodium (' + sodiumVal + 'mg/100g)' : ''} ${isHighSugar ? 'Sugar (' + sugarVal + 'g/100g)' : ''} exceeds safe threshold limits.`
        : 'Nutritional declarations comply with per 100g/per serve disclosure thresholds.',
      detailHi: nutri.length === 0
        ? 'लेबल से अनिवार्य पोषण सूचना तालिका गायब है।'
        : (isHighSodium || isHighSugar)
        ? `HFSS चेतावनी: उच्च ${isHighSodium ? 'सोडियम' : ''} ${isHighSugar ? 'शर्करा' : ''} सुरक्षित सीमा से अधिक है।`
        : 'पोषण घोषणाएं सुरक्षित सीमा के भीतर हैं।',
      detailHinglish: (isHighSodium || isHighSugar)
        ? `HFSS Alert: High ${isHighSodium ? 'Sodium' : 'Sugar'} detected beyond ICMR-NIN safe limits.`
        : 'Nutrition panel clear hai aur safe dietary limits me hai.',
      recommendation: (isHighSodium || isHighSugar)
        ? 'Consider Front-of-Pack red warning label or reformulate sodium/sugar content to meet ICMR safe limits.'
        : 'Maintain transparent nutrition declarations per 100g and per standard serve.',
    },

    // 11. Barcode & QR Verification
    {
      id: 'code-ean',
      name: 'EAN-13 Barcode / FoSCoS Smart QR',
      shortName: 'Barcode / QR',
      category: 'BARCODE',
      status: isBarcodePresent ? (isEanValid ? 'PASS' : 'REVIEW') : 'REVIEW',
      scoreImpact: isBarcodePresent && isEanValid ? 10 : -5,
      actSection: 'GS1 India Standards & Legal Metrology Electronic Verification',
      detail: isBarcodePresent
        ? (isEanValid
          ? `Machine-readable EAN-13 code (${data.barcode || '890 Prefix / India'}) checksum validated.`
          : 'Barcode detected but checksum failed EAN-13 mathematical validation.')
        : 'No machine-readable barcode or FoSCoS smart QR detected on the scanned panel.',
      detailHi: isBarcodePresent
        ? 'मशीन द्वारा पठनीय EAN-13 बारकोड सत्यापित है।'
        : 'स्कैन किए गए पैनल पर कोई बारकोड या FoSCoS QR नहीं मिला।',
      detailHinglish: isBarcodePresent
        ? 'EAN-13 barcode valid checksum ke saath detected hai.'
        : 'Barcode ya FoSCoS QR code missing hai packaging par.',
      recommendation: 'Print an unobstructed GS1 compliant EAN-13 barcode with minimum 80% magnification and valid check digit.',
    },
  ];

  return checks;
}

// Compute Overall Weighted Compliance Score (0 - 100)
export function computeComplianceScore(checks: RegulationCheck[]): number {
  let totalWeight = 0;
  let earnedScore = 0;

  checks.forEach((check) => {
    if (check.status === 'NOT_APPLICABLE') return;

    const weight = Math.abs(check.scoreImpact);
    totalWeight += weight;

    if (check.status === 'PASS') {
      earnedScore += weight;
    } else if (check.status === 'REVIEW') {
      earnedScore += weight * 0.45;
    } else if (check.status === 'FAIL') {
      earnedScore += 0;
    }
  });

  if (totalWeight === 0) return 50;
  return Math.min(100, Math.max(10, Math.round((earnedScore / totalWeight) * 100)));
}
