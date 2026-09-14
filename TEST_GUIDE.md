# 🚀 How to Test PackCheck AI - WORKING VERSION

## ✅ Servers Status
- **Backend**: http://localhost:4000 ✅ Running
- **Frontend**: http://localhost:5173 ✅ Running

---

## 📸 HOW TO TEST SCANNER

### **STEP 1: Open Scanner Page**
1. Go to: **http://localhost:5173/scanner**
2. You should see the upload area on the left

### **STEP 2: Upload a Food Label Image**
1. Click **"📁 Upload Packet"** button
2. Select a CLEAR photo of a **packaged food label**
3. The image preview should show on the left

### **STEP 3: Click Scan Button**
1. Click **"⚡ Scan Product Now"** button
2. Wait 5-10 seconds (AI is analyzing)
3. You'll see a loading message: "🔍 Scanning Ingredients & Compliance..."

### **STEP 4: View Results**
Once scanning completes, you'll see:
- ✅ **Product Name** & Brand
- 📊 **Health Score** (0-100)
- 🚨 **Harmful Ingredients** (with severity levels)
- 🥗 **Healthy Alternatives** 
- 🧪 **Ingredient Breakdown**
- 📋 **Nutrition Table**
- 🛡️ **FSSAI Compliance**

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue: "Invalid Image Detected!"
**Solution:** 
- The image must be a **clear photo** of a packaged food label
- Make sure the label is:
  - ✅ Clearly visible (not blurry)
  - ✅ Well-lit (good brightness)
  - ✅ Not rotated or at odd angles
  - ✅ Shows product name and ingredients

**Try these images:**
- Kurkure packet (like in the screenshot)
- Maggi noodles package
- Biscuit box
- Cereal box
- Any labeled food product

### Issue: "Could not reach the analysis server"
**Solution:** Make sure backend is running:
```powershell
# Terminal 1: Check if backend is running
Get-Process node | Where-Object {$_.Name -like "*node*"}

# If not running, start it:
cd server
npm start
```

### Issue: Scanner button doesn't respond
**Solution:** Reload the page:
- Press `F5` or `Ctrl+R`
- Or click the browser refresh button

---

## 🔧 Full Setup Check

Run these commands to verify everything:

```powershell
# Check if ports are listening
Get-NetTCPConnection -LocalPort 4000, 5173 | Select-Object LocalPort, State

# Check backend health
curl http://localhost:4000/api/health

# Check frontend loading
curl http://localhost:5173
```

---

## 📝 What Each Tab Shows

| Tab | Shows |
|-----|-------|
| ⚠️ Harmful Additives | Dangerous ingredients with severity level |
| 🥗 Alternatives | Healthier product suggestions |
| 🧪 Ingredients | Complete ingredient list with percentages |
| 📊 Nutrition | Nutrition facts (per 100g & per serving) |
| 🛡️ FSSAI | Compliance declarations & certifications |

---

## 💡 Pro Tips

1. **Use Clear Images**: Better image quality = Better AI results
2. **Both Sides**: Scan front and back of package for complete analysis
3. **Save History**: Each scan is automatically saved in your browser
4. **File Reports**: Click "File FSSAI Report" for harmful products

---

## 🎯 You're All Set!

- ✅ Backend: Running
- ✅ Frontend: Running
- ✅ API: Connected
- ✅ Gemini: Configured (gemini-3.6-flash)

**Just upload an image and click scan!**

