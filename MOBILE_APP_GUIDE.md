# 📱 PackCheck AI — Android App Conversion Guide (Capacitor)

Turn your **PackCheck AI React Website** into an **Android APK** in less than 10 minutes without rewriting any code.

---

## 🚀 Why Capacitor is the Best Choice for PackCheck AI
- **100% Code Reuse**: Reuses your exact React + TypeScript frontend, styles, and vision engine.
- **Native Camera Access**: Automatically bridges HTML5 camera directly to native Android camera hardware.
- **Offline First**: Packages all HTML/JS/CSS assets directly inside the APK, so the app launches instantly even with zero network.
- **Fast Build**: Compiles directly to an Android Studio Gradle project.

---

## 🛠️ Step-by-Step Conversion Instructions

### Step 1: Install Capacitor in the `client` directory
Open PowerShell / Command Prompt and run:
```powershell
cd "c:\Users\vansh nigam\OneDrive\Desktop\packcheck ai project\packcheck-ai2026-main\packcheck-ai2026-main\client"

# Install Capacitor core and CLI
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor
```powershell
npx cap init "PackCheck AI" "com.packcheck.ai" --web-dir "dist"
```

### Step 3: Add Android Platform
```powershell
npx cap add android
```

### Step 4: Build React App & Sync with Android
Every time you make changes to your React website, run:
```powershell
# 1. Build the production web bundle
npm run build

# 2. Copy the bundle into the Android app
npx cap sync android
```

### Step 5: Open in Android Studio & Generate APK
```powershell
npx cap open android
```
Inside Android Studio:
1. Wait for Gradle sync to complete.
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
3. Your native `.apk` will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`!
4. Transfer the `.apk` to any Android phone and install it.

---

## 📷 Android Camera & Geolocation Permissions
To ensure native camera and GPS permissions work seamlessly, ensure these lines are inside `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

---

## 🏆 Presentation Tip for Judges (SIH / Hackathons)
- Show the web app live on laptop: `https://packcheck-ai2026.netlify.app/`
- Show the identical app running smoothly as a native Android APK on your phone!
- Demonstrate the **Rural Inspector Offline Mode** by turning on Airplane mode on your phone and scanning a packet live — it still evaluates compliance, stores evidence locally, and geo-tags the inspection!
