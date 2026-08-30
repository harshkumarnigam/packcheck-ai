import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, createPartFromBase64 } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const PORT = Number(process.env.PORT) || 4000;

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    isFoodPackaging: { type: 'boolean' },
    productName: { type: 'string' },
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
  },
  required: [
    'isFoodPackaging',
    'productName',
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

const ANALYSIS_PROMPT = `You are PackCheck AI, an expert in Indian packaged food label analysis (FSSAI compliance and consumer health).

Analyze the uploaded food packaging image. Read visible text from the label (product name, ingredients, nutrition facts, MRP, FSSAI license, batch, net weight, declarations).

Rules:
- If the image is NOT a packaged food product label, set isFoodPackaging to false and still return the schema with best-effort placeholder strings.
- Score 0-100 for overall health/compliance (higher = healthier/more compliant).
- harmfulItems: flag palm oil, excess sodium, added sugar, MSG/flavor enhancers, artificial colors, trans fats, etc. Use level "HIGH RISK" (color #ef4444), "MODERATE" (#f59e0b), or "CRITICAL RISK" (#ef4444).
- healthyAlternatives: suggest 2 realistic Indian-market healthier swaps.
- ingredients: list main ingredients with estimated QID % if visible, else "—".
- nutritionTable: per 100g and per serve where visible; status like "Safe", "High Risk", "Warning".
- declarations: FSSAI license, veg/non-veg, allergen, QID list checks.
- verdict colors: score >= 70 use green (#22c55e), 50-69 amber (#f59e0b), below 50 red (#ef4444). Set matching bgColor (rgba with 0.14 alpha) and borderColor.
- Use ₹ for MRP when applicable. Be factual based on what you can read; say "Not detected" for missing fields.`;

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
    productName: raw.productName || 'Unknown Product',
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
  };
}

async function analyzeWithGemini(base64Data, mimeType, fileName) {
  const fileHint = fileName ? `\nOriginal filename: ${fileName}` : '';
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      createPartFromBase64(base64Data, mimeType),
      `${ANALYSIS_PROMPT}${fileHint}`,
    ],
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: ANALYSIS_JSON_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return normalizeReport(JSON.parse(text));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { image, fileName } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Add it to server/.env and restart.',
      });
    }

    const { mimeType, data } = parseImagePayload(image);
    const report = await analyzeWithGemini(data, mimeType, fileName || '');

    if (!report.isFoodPackaging) {
      return res.status(422).json({
        error: 'No food packaging detected. Upload a clear photo of a packaged food label.',
        isFoodPackaging: false,
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('Analysis error:', error.message);

    let message = error.message || 'Analysis failed. Check GEMINI_API_KEY and GEMINI_MODEL in server/.env.';
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
  console.log(`Gemini: ${GEMINI_API_KEY ? 'configured' : 'NOT configured — set GEMINI_API_KEY in server/.env'}`);
  console.log(`Model: ${GEMINI_MODEL}`);
});
