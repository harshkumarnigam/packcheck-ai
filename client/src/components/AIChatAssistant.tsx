import React, { useState } from 'react';
import { Send, Bot, Sparkles, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductAnalysisData } from '../data/regulations';

interface AIChatAssistantProps {
  productData: ProductAnalysisData;
  language: 'English' | 'Hindi' | 'Hinglish';
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function AIChatAssistant({ productData, language }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: getInitialGreeting(productData, language),
      timestamp: 'Just now',
    },
  ]);

  const quickQuestions = getQuickQuestions(language);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiReplyText = generateLegalReply(userText, productData, language);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <div style={{
      backgroundColor: '#0b1329',
      border: '1px solid #1e3a8a',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '20px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
    }}>
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          backgroundColor: '#0f172a',
          borderBottom: isOpen ? '1px solid #1e293b' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              PackCheck AI Legal Counsel & Nutrition Assistant
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Law & Safety Grounded
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Instant answers on Legal Metrology 2011, FSSAI Section 23/24, and packaging rectification
            </div>
          </div>
        </div>

        <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: '14px 16px' }}>
          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '12px' }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={11} /> {q}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div style={{
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '12px',
            paddingRight: '4px'
          }}>
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '88%',
                    backgroundColor: isAi ? '#1e293b' : '#0284c7',
                    color: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: isAi ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    border: isAi ? '1px solid #334155' : 'none'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                  <div style={{ fontSize: '9px', color: isAi ? '#64748b' : '#e0f2fe', marginTop: '4px', textAlign: 'right' }}>
                    {m.timestamp}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'Hindi'
                  ? 'कानूनी या पोषण संबंधी कोई भी प्रश्न पूछें...'
                  : language === 'Hinglish'
                  ? 'Regulation ya labeling ke baare me kuch bhi poochhein...'
                  : 'Ask any regulatory, penalty, or formulation question...'
              }
              style={{
                flex: 1,
                padding: '9px 12px',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '9px 16px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function getQuickQuestions(lang: 'English' | 'Hindi' | 'Hinglish'): string[] {
  if (lang === 'Hindi') {
    return [
      'यह उत्पाद क्यों गैर-अनुपालन है?',
      'लीगल मेट्रोलॉजी अधिनियम में क्या जुर्माना है?',
      'पैकेजिंग में क्या सुधार आवश्यक है?',
      'क्या इसमें सोडियम सीमा से अधिक है?',
    ];
  }
  if (lang === 'Hinglish') {
    return [
      'Yeh product kyu non-compliant hai?',
      'Legal Metrology me kya fine lag sakta hai?',
      'Labeling me kya correct karna hoga?',
      'Sodium HFSS limits se jyada hai kya?',
    ];
  }
  return [
    'Why is this product non-compliant?',
    'What is the statutory penalty under LM Act?',
    'What label corrections are required before distribution?',
    'Does sodium exceed FSSAI HFSS threshold?',
  ];
}

function getInitialGreeting(data: ProductAnalysisData, lang: 'English' | 'Hindi' | 'Hinglish'): string {
  const prod = data.productName || 'this product';
  if (lang === 'Hindi') {
    return `नमस्ते! मैंने "${prod}" का नियामक विश्लेषण पूरा कर लिया है (अनुपालन स्कोर: ${data.score}/100)। आप लीगल मेट्रोलॉजी, FSSAI नियम, AGMARK/BIS, या पोषण संबंधी कोई भी प्रश्न पूछ सकते हैं।`;
  }
  if (lang === 'Hinglish') {
    return `Hello! Maine "${prod}" ka regulatory audit complete kar liya hai (Score: ${data.score}/100). Aap Legal Metrology Rules, FSSAI penalties, ya packaging corrections ke baare me poochh sakte hain.`;
  }
  return `Hello! I have completed the regulatory audit for "${prod}" (Compliance Score: ${data.score}/100). You can ask me any question regarding Legal Metrology Rules 2011, FSSAI statutory citations, penalties, or label rectification before distribution.`;
}

function generateLegalReply(
  question: string,
  data: ProductAnalysisData,
  lang: 'English' | 'Hindi' | 'Hinglish'
): string {
  const q = question.toLowerCase();
  const prod = data.productName || 'the product';

  // 1. Why non-compliant / Why flagged
  if (q.includes('why') || q.includes('kyu') || q.includes('flag') || q.includes('issue') || q.includes('कारण')) {
    if (data.score >= 85) {
      if (lang === 'Hindi') {
        return `यह उत्पाद अधिकांश कानूनी आवश्यकताओं का अनुपालन करता है (${data.score}/100)। मुख्य घोषणाएं जैसे MRP, निर्माता पता, और FSSAI लाइसेंस मौजूद हैं।`;
      }
      return `This product has a high compliance score (${data.score}/100). Core Legal Metrology and FSSAI declarations (MRP, FSSAI License, Net Weight) are in place. Ensure packaging font sizes meet minimum proportion tables under Rule 7.`;
    }

    if (lang === 'Hindi') {
      return `उत्पाद "${prod}" में निम्नलिखित मुख्य आपत्तियां पाई गईं:\n1. उच्च सोडियम (880mg/100g) और पामोलिन तेल: यह FSSAI HFSS सीमा से अधिक है।\n2. पोषण स्तर पर चेतावनी: अतिरिक्त वसा और MSG/INS 627, 631 की मौजूदगी।\n3. उपभोक्ता राहत: फ्रंट-ऑफ-पैक लेबलिंग में स्पष्ट चेतावनी की सिफारिश की जाती है।`;
    }
    if (lang === 'Hinglish') {
      return `"${prod}" me ye main issues detect huye hain:\n1. High Sodium (880mg/100g) & Palmolein Oil jo safe dietary limit cross karta hai.\n2. Flavor Enhancers (INS 627, 631) sensitive logo ke liye unadvisable hain.\n3. Market distribution se pehle front panel par clear nutritional disclosures hona chahiye.`;
    }
    return `"${prod}" was flagged for the following regulatory and health reasons:\n1. High Sodium (880mg/100g): Exceeds FSSAI/ICMR safe threshold of 250mg/100g by 3.5x.\n2. Palmolein Oil Base: ~48% saturated fatty acid profile flagged as a cardiovascular risk factor.\n3. Flavor Enhancers (INS 627, INS 631): Chemical ribonucleotides present without prominent front panel disclosure.`;
  }

  // 2. Penalty question
  if (q.includes('penalty') || q.includes('fine') || q.includes('जुर्माना') || q.includes('act') || q.includes('सज़ा')) {
    if (lang === 'Hindi') {
      return `कानूनी दंड विवरण:\n• लीगल मेट्रोलॉजी अधिनियम की धारा 36(1): गैर-मानक पैकेज या एमआरपी/पते में त्रुटि पर प्रथम अपराध के लिए ₹25,000 तक जुर्माना, द्वितीय अपराध पर ₹50,000 और कारावास का प्रावधान है।\n• FSSAI अधिनियम की धारा 52 (गलत ब्रांडिंग): ₹3,00,000 तक का जुर्माना। धारा 63 के तहत बिना वैध लाइसेंस के खाद्य व्यवसाय पर ₹5,00,000 तक जुर्माना और 6 माह की जेल हो सकती है।`;
    }
    if (lang === 'Hinglish') {
      return `Statutory Penalties under Indian Law:\n• Legal Metrology Act Sec 36(1): ₹25,000 fine for first offense; up to ₹50,000 or jail for subsequent offenses.\n• FSSAI Act Sec 52 (Misbranding): Penalty up to ₹3,00,000.\n• FSSAI Sec 63: Selling food without valid FSSAI license carries up to ₹5,00,000 fine and up to 6 months imprisonment.`;
    }
    return `Statutory Penalties under Applicable Indian Acts:\n1. Legal Metrology Act, 2009 (Section 36(1)): Penalty up to ₹25,000 for the first offence of manufacturing/packing non-compliant commodities. Repeat offences attract fines up to ₹50,000 and possible imprisonment up to 1 year.\n2. Food Safety & Standards Act, 2006 (Section 52): Penalty up to ₹3,00,000 for misbranded food.\n3. Section 63: Operating without a valid FSSAI license attracts penalties up to ₹5,00,000 and imprisonment up to 6 months.`;
  }

  // 3. Fix / Corrections question
  if (q.includes('fix') || q.includes('correct') || q.includes('सुधार') || q.includes('remediat') || q.includes('karein')) {
    if (lang === 'Hindi') {
      return `बाजार वितरण से पूर्व आवश्यक सुधार:\n1. ग्राहक सेवा हेल्पलाइन नंबर और ईमेल आईडी न्यूनतम 1.5mm फॉन्ट में स्पष्ट रूप से प्रिंट करें।\n2. शुद्ध मात्रा (Net Qty) के लिए मानक लोअरकेस प्रतीक 'g' या 'kg' का उपयोग करें।\n3. पोषण तालिका में प्रति सर्विंग (Per Serve) और प्रतिशत दैनिक योगदान (% RDA) स्पष्ट रूप से दर्शाएं।\n4. पैकेजिंग पर निर्माण तिथि (Pkd Date) और एमआरपी के साथ 'सभी करों सहित' अनिवार्य रूप से लिखें।`;
    }
    return `Mandatory Label Rectification Steps for QC & Production:\n1. Consumer Care: Ensure telephone number, email, and postal grievance cell are legible in at least 1.5mm font.\n2. Standard Units: Use lowercase 'g' or 'kg' (Rule 7), never non-standard abbreviations like 'Gms'.\n3. Front-of-Pack Disclosures: Include Veg/Non-Veg logo (green circle in square) on principal display panel.\n4. Nutrition Transparency: Disclose per-serve and % RDA contribution for added sugars and sodium.`;
  }

  // 4. Sodium / HFSS question
  if (q.includes('sodium') || q.includes('sugar') || q.includes('hfss') || q.includes('नमक') || q.includes('health')) {
    return `Under FSSAI Front-of-Pack Labelling guidelines and ICMR-NIN safe limits, any packaged snack with Sodium > 250mg per 100g is classified as HFSS (High Fat, Sugar, Sodium). At 880mg/100g, this product contains over 3.5 times the recommended threshold and should carry clear dietary warning indicators.`;
  }

  // Default fallback answer
  return `Regarding "${prod}": Under Rule 6(1) of Legal Metrology (Packaged Commodities) Rules 2011 and FSSAI Labelling Regulations 2020, every package distributed in India must bear unambiguous declarations of MRP (inclusive of all taxes), Net Quantity in metric units, complete registered manufacturer postal address with PIN, FSSAI 14-digit license, and active consumer helpline contacts. Non-compliance subjects inventory to seizure under Section 15 of Legal Metrology Act.`;
}
