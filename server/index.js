import express from 'express';
import cors from 'cors';
import { GoogleGenAI, createPartFromBase64 } from '@google/genai';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(serverDirectory, '.env') });

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const requestLog = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const recent = (requestLog.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many analysis requests. Please try again in a minute.' });
  }
  recent.push(now);
  requestLog.set(key, recent);
  return next();
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using a real, stable model fallback. Do NOT use 3.6.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const PORT = Number(process.env.PORT) || 4000;

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    isFoodPackaging: { type: 'boolean' },
    productName: { type: 'string' },
    productConfidence: { type: 'number' },
    identificationStatus: { type: 'string' },
    ocrText: { type: 'string' },
    category: { type: 'string' },
    brand: { type: 'string' },
    fssaiLicense: { type: 'string' },
    batchNumber: { type: 'string' },
    netWeight: { type: 'string' },
    mrp: { type: 'string' },
    score: { type: 'number' },
    isDiabeticSafe: { type: 'boolean' },
    isGlutenFree: { type: 'boolean' },
    verdict: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtext: { type: 'string' },
        color: { type: 'string' },
        bgColor: { type: 'string' },
        borderColor: { type: 'string' },
      },
      required: ['title', 'subtext', 'color', 'bgColor', 'borderColor'],
    },
    harmfulItems: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          ingredient: { type: 'string' },
          level: { type: 'string' },
          color: { type: 'string' },
          problem: { type: 'string' },
        },
        required: ['ingredient', 'level', 'color', 'problem'],
      },
    },
    healthyAlternatives: {
      type: 'array',
      maxItems: 2,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          brand: { type: 'string' },
          whyBetter: { type: 'string' },
          calories: { type: 'string' },
          tag: { type: 'string' },
        },
        required: ['name', 'brand', 'whyBetter', 'calories', 'tag'],
      },
    },
    ingredients: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          percentage: { type: 'string' },
          type: { type: 'string' },
          safety: { type: 'string' },
        },
        required: ['name', 'percentage', 'type', 'safety'],
      },
    },
    nutritionTable: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          parameter: { type: 'string' },
          value: { type: 'string' },
          perServe: { type: 'string' },
          status: { type: 'string' },
        },
        required: ['parameter', 'value', 'perServe', 'status'],
      },
    },
    declarations: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          status: { type: 'string' },
          details: { type: 'string' },
        },
        required: ['name', 'status', 'details'],
      },
    },
    barcode: { type: 'string' },
    qrCode: { type: 'string' },
    agmarkMark: { type: 'string' },
    bisIsiMark: { type: 'string' },
  },
  required: [
    'isFoodPackaging',
    'productName',
    'productConfidence',
    'identificationStatus',
    'ocrText',
    'category',
    'brand',
    'score',
    'verdict',
    'harmfulItems',
    'healthyAlternatives',
    'ingredients',
    'nutritionTable',
    'declarations',
  ],
};

const ANALYSIS_PROMPT = `You are PackCheck AI for Indian packaged food labels. Analyze the image and return only the required JSON.

First read the label text as OCR, then use that extracted text to perform the compliance analysis.
Return the most important OCR text in ocrText, identify the product only from visible evidence, and give productConfidence from 0 to 100.
Read visible: product name, brand, ingredients, nutrition, MRP, FSSAI license, batch number, net weight, declarations.

Rules:
- If this is not packaged food, set isFoodPackaging=false.
- Do not invent unreadable information. Use "Not detected".
- If the product name is unclear, set productName to "Not detected", identificationStatus to "UNSURE", and productConfidence below 60. Never guess a brand or product.
- Set identificationStatus to "IDENTIFIED" only when the visible label supports the product name.
- Score 0-100.
- Flag important harmful ingredients and risks.
- Give 2 healthier alternatives.
- Use visible nutrition values.
- Check FSSAI, veg/non-veg, allergens and declarations.
- Look specifically for AGMARK, BIS/ISI, barcode, and QR marks. Use "Not detected" when unreadable.
- Use ₹ for MRP.
- Keep arrays concise.
- Return factual information only.`;

function parseImagePayload(image) {
  const match = String(image).match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: String(image) };
}

function normalizeReport(raw) {
  const score = typeof raw.score === 'number' ? Math.round(raw.score) : 50;
  const isHealthy = score >= 70;
  const color = isHealthy ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const bgColor = isHealthy
    ? 'rgba(34, 197, 94, 0.14)'
    : score >= 50
      ? 'rgba(245, 158, 11, 0.14)'
      : 'rgba(239, 68, 68, 0.14)';

  return {
    isFoodPackaging: raw.isFoodPackaging !== false,
    productName: raw.productName || 'Not detected',
    productConfidence: Math.max(0, Math.min(100, Math.round(Number(raw.productConfidence) || 0))),
    identificationStatus: raw.identificationStatus === 'IDENTIFIED' ? 'IDENTIFIED' : 'UNSURE',
    ocrText: raw.ocrText || 'No readable text returned.',
    category: raw.category || 'Packaged Food',
    brand: raw.brand || 'Not detected',
    fssaiLicense: raw.fssaiLicense || 'Not detected',
    batchNumber: raw.batchNumber || 'Not detected',
    netWeight: raw.netWeight || 'Not detected',
    mrp: raw.mrp || 'Not detected',
    score,
    isDiabeticSafe: Boolean(raw.isDiabeticSafe),
    isGlutenFree: Boolean(raw.isGlutenFree),
    verdict: {
      title: raw.verdict?.title || (isHealthy ? 'MODERATELY HEALTHY ✅' : 'NEEDS REVIEW ❌'),
      subtext: raw.verdict?.subtext || 'Analysis based on visible label information.',
      color: raw.verdict?.color || color,
      bgColor: raw.verdict?.bgColor || bgColor,
      borderColor: raw.verdict?.borderColor || color,
    },
    harmfulItems: Array.isArray(raw.harmfulItems) ? raw.harmfulItems : [],
    healthyAlternatives: Array.isArray(raw.healthyAlternatives) ? raw.healthyAlternatives : [],
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    nutritionTable: Array.isArray(raw.nutritionTable) ? raw.nutritionTable : [],
    declarations: Array.isArray(raw.declarations) ? raw.declarations : [],
    barcode: raw.barcode || '',
    qrCode: raw.qrCode || '',
    agmarkMark: raw.agmarkMark || '',
    bisIsiMark: raw.bisIsiMark || '',
  };
}

async function analyzeWithGemini(base64Data, mimeType, fileName, language = 'English') {
  const fileHint = fileName ? `\nOriginal filename: ${fileName}` : '';
  const languageHint = `\nRead English, Hindi, or Hinglish text as requested. Return extracted values in ${language}.`;
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      createPartFromBase64(base64Data, mimeType),
      `${ANALYSIS_PROMPT}${languageHint}${fileHint}`,
    ],
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: ANALYSIS_JSON_SCHEMA,
      maxOutputTokens: 3000,
    },
  });

  const text = response.text;
  
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    return normalizeReport(JSON.parse(text));
  } catch (parseError) {
    console.error('Invalid Gemini JSON:', text);
    throw new Error('Gemini returned incomplete JSON. Please try again.');
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/analyze', rateLimit, async (req, res) => {
  try {
    const { image, fileName, language } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }
    if (image.length > 14_000_000) {
      return res.status(413).json({ error: 'Image is too large. Upload a compressed image under 10 MB.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it to server/.env and restart.',
      });
    }

    const { mimeType, data } = parseImagePayload(image);
    const report = await analyzeWithGemini(data, mimeType, fileName || '', language || 'English');

    if (!report.isFoodPackaging) {
      return res.status(422).json({
        error: 'No food packaging detected. Upload a clear photo of a packaged food label.',
        isFoodPackaging: false,
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('Analysis error:', error.message);

    let message = error.message || 'Analysis failed. Check GEMINI_API_KEY and GEMINI_MODEL on Render.';
    try {
      const parsed = JSON.parse(message);
      message = parsed?.error?.message || message;
    } catch {
      // keep original message
    }

    return res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`PackCheck AI API running on http://localhost:${PORT}`);
  console.log(`Gemini: ${GEMINI_API_KEY ? 'configured' : 'NOT configured — set GEMINI_API_KEY'}`);
  console.log(`Model: ${GEMINI_MODEL}`);
});