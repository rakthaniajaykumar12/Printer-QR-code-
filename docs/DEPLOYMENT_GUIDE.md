# Deployment Guide for Smart Xerox

Deploy Smart Xerox to a permanent public HTTPS website URL for free, completely using an Android phone browser.

---

## Architecture Overview

Smart Xerox is designed as a clean, unified application:
- **Frontend:** React 19 + Vite + Tailwind CSS v4 (built into static HTML/CSS/JS in `frontend/dist`).
- **Backend:** FastAPI (Python 3.10 - 3.14) serving both the `/api/*` endpoints and the frontend SPA files from a single web service.
- **Database:** SQLite (default for zero configuration) or PostgreSQL.
- **Storage:** Private, authenticated uploads directory with configurable retention cleanup.

---

## Method 1: Deploy on Render.com (Recommended - 100% Free & Automatic)

Render offers a generous free tier with permanent `https://your-shop.onrender.com` URLs and automatic SSL certificates.

### Step 1: Upload Code to GitHub
1. Open [github.com](https://github.com) on your Android phone browser.
2. Sign in or create a free account.
3. Tap **New repository**, name it `smart-xerox`, set to **Private** (recommended) or Public, and create it.
4. Upload the project files or push them via Git.

### Step 2: Deploy using Render Blueprint (`render.yaml`)
1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Tap **New +** > **Blueprint**.
3. Select your `smart-xerox` repository.
4. Render will automatically read `render.yaml` and configure:
   - Python Environment
   - Build command: `cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt`
   - Start command: `cd backend && python run.py`
   - All required environment variables
5. Set your secret variables:
   - `SECRET_KEY`: Enter a long random string.
   - `OWNER_PASSWORD`: Enter your private admin password (e.g. `MyShopSecret@2026`).
6. Tap **Apply**.
7. In about 3–4 minutes, your service will be live at `https://smart-xerox-xxxx.onrender.com`!

---

## Method 2: Manual Web Service on Render (Step-by-Step)

If not using Blueprints:
1. Tap **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name:** `smart-xerox`
   - **Region:** Singapore (or closest to India)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Add Environment Variables (tap **Environment**):
   - `SECRET_KEY` = (A secure random string)
   - `OWNER_USERNAME` = `admin`
   - `OWNER_PASSWORD` = (Your chosen password)
   - `RATE_BW_PER_PAGE` = `2.0`
   - `RATE_COLOR_PER_PAGE` = `10.0`
   - `FILE_RETENTION_HOURS` = `24`
   - `CORS_ORIGINS` = `*`
5. Tap **Deploy Web Service**.

---

## Method 3: Deploy on Railway.app

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Tap **New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically detect the `Procfile` and Python requirements.
5. In project settings, tap **Variables** and add:
   - `SECRET_KEY` = (random string)
   - `OWNER_PASSWORD` = (your password)
6. Tap **Generate Domain** under Networking.
7. Your site is live with HTTPS!

---

## Setting Up Persistent File Storage on Production (Optional)

On cloud free tiers (like Render or Railway), the filesystem is ephemeral (resets on server restart). For a Xerox shop:
- Customers submit documents, and you print them within minutes or hours.
- Files are kept during the day and auto-cleaned after 24 hours.
- If you want files to persist across server sleep restarts, you can add a **Render Persistent Disk** (`/opt/render/project/src/backend/uploads`) mounted in Render settings for $1/month, or use local disk during working hours.

---

## Generating Your Permanent Shop Counter QR Code

Once your website is deployed and you have your live public URL (e.g., `https://smart-xerox.onrender.com`):

### Option A: From Owner Dashboard (Instant on Phone)
1. Open your live website in Chrome on your phone.
2. Tap **Owner**, log in, and tap the **Shop QR** button in the dashboard.
3. Enter your live website URL.
4. Tap **Download Printable Shop Card**.
5. Save the PNG image, open it in **Epson Smart Panel**, and print it on A4 paper or photo paper!
6. Laminate or place in a plastic stand on your Xerox shop counter.

### Option B: Using the CLI Script
Run from terminal or Termux:
```bash
python scripts/generate_qr.py --url https://your-shop.onrender.com --shop "Smart Xerox"
```

---

## Testing with a Second Phone Before Opening

To ensure everything is 100% working:
1. Take a second phone (a friend's, family member's, or customer's phone).
2. Open the camera app on the second phone and point it at the printed QR code.
3. Tap the link that pops up.
4. Verify:
   - The Smart Xerox upload screen opens immediately.
   - Upload a test PDF or photo.
   - Select "Black & White", 2 copies.
   - Tap **SUBMIT PRINT ORDER**.
   - Confirm the success screen shows Order ID `#SX-XXXX`.
5. On your shop owner phone:
   - Watch the order appear in the Owner Dashboard.
   - Tap **Download File**.
   - Print via **Epson Smart Panel** to the Epson L3250 over Wi-Fi.
   - Tap **Mark as Printed**.
6. Check the second phone:
   - Tap "Track Order Status" and observe the status showing "Printed & Ready"!
