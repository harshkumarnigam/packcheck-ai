# PackCheck AI — TechVortex
### 🌐 Live Demo
[PackCheck AI](https://packcheckai.netlify.app/)
### 💻 GitHub Repository
[PackCheck AI](https://github.com/harshkumarnigam/packcheck-ai)
SIH-ready full-stack prototype: React + TypeScript frontend, Express backend, Gemini multimodal image analysis.

## 1. Requirements
- Node.js 20+
- Gemini API key (server-side only)

## 2. Install
From the project root:

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

## 3. Configure Gemini
Copy `server/.env.example` to `server/.env` and set:

```env
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-3.6-flash
PORT=4000
```

Never put this key in `client/.env` or frontend code.

## 4. Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

The frontend proxies `/api` to `http://localhost:4000`.

## 5. Demo without API key
Use **Try Sample Product** / Sample 1–3. This demonstrates the complete judge flow without making an AI call.

## 6. Real image analysis
Upload JPG/PNG/WebP (max 8 MB) and click Analyze Label. The image is sent to the Express backend, which calls Gemini. The browser never receives the Gemini API key.

## 7. Production build

```bash
npm run build
npm start
```

The Express server serves `client/dist` when it exists.

## 8. Important product note
The rule engine in this prototype is configurable/demo-only. Replace it with verified official regulatory data before using PackCheck AI for real compliance decisions.
