# PackCheck AI - Complete Setup Guide

## 🚀 STEP 1: Start Backend Server

**Open PowerShell and run:**

```powershell
cd "c:\Users\vansh nigam\Downloads\packcheck-ai-main\packcheck-ai-main\server"
npm start
```

**Expected Output:**
```
PackCheck AI API running on http://localhost:4000
Gemini: configured
Model: gemini-3.6-flash
```

**✅ Leave this terminal OPEN**

---

## 🎨 STEP 2: Start Frontend Server

**Open NEW PowerShell and run:**

```powershell
cd "c:\Users\vansh nigam\Downloads\packcheck-ai-main\packcheck-ai-main\client"
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: http://10.92.208.144:5173/
```

**✅ Leave this terminal OPEN**

---

## 🌐 STEP 3: Open In Browser

**Go to:**
```
http://localhost:5173
```

**✅ You should see the PackCheck AI homepage**

---

## 📸 STEP 4: Test Scanner

1. Click **"Scanner"** in top navigation
2. Click **"📁 Upload Packet"** button
3. Select a **CLEAR food product image** (JPG/PNG)
4. Click **"Scan Product Now"** button
5. Wait 5-10 seconds for AI analysis

**✅ You should see results!**

---

## 🔍 Troubleshooting

### Backend won't start?
- Check: Is GEMINI_API_KEY set in server/.env?
- Run: `cat server/.env`

### Frontend won't load?
- Check: Is backend running on port 4000?
- Run: `curl http://localhost:4000/api/health`

### Image analysis fails?
- Make sure image is a REAL food product label
- Try with clear, well-lit photo
- JPG/PNG format only

### Port already in use?
```powershell
Get-Process node | Stop-Process -Force
```

---

## ✨ All Features Ready:
✅ Upload food label images
✅ Camera capture
✅ AI analysis (gemini-3.6-flash)
✅ Compliance scoring
✅ Harmful ingredients detection
✅ Healthy alternatives
✅ Nutrition facts extraction
✅ Scan history saving

---

**Need help?** Check the terminal output for error messages.
