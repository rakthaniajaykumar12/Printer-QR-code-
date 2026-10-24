# Android Mobile Management & Development Guide

This guide explains how to manage, operate, and modify **Smart Xerox** using **only an Android phone**. You do not need a laptop or desktop computer for daily shop operations.

---

## 1. Daily Shop Operation (Android Phone)

### Step 1: Pin Owner Dashboard to Home Screen (App Experience)
Transform the website into a fullscreen mobile app on your Android phone:
1. Open Google Chrome (or your default Android browser).
2. Go to your live website URL (e.g., `https://your-shop.onrender.com`).
3. Tap **Owner** in the top navigation and log in.
4. Tap the **Three Dots (⋮)** menu at the top right of Chrome.
5. Tap **Add to Home screen** (or **Install app**).
6. Name it **"Smart Xerox Dashboard"** and tap **Add**.
7. An app icon with a printer will now appear on your phone home screen!
8. Tap this icon every morning to open your live print queue in full screen.

---

### Step 2: The Honest 9-Step Manual Android Printing Flow
When a customer scans your QR code and submits an order:

1. **Dashboard Alert:**
   - Your Android phone screen will highlight the new order in purple and display a live alert badge.
   - If audio is unmuted in Chrome, a soft chime will notify you.
2. **Review Order:**
   - Check the customer's Order ID (e.g., `SX-8492`), requested copies, paper size (A4), and color mode.
3. **Download Customer File:**
   - Tap the black **"Download File"** button on the order card.
   - The PDF or image is saved directly to your Android phone's `Download` folder (usually in under 2 seconds).
4. **Open in Epson App:**
   - Pull down your Android notification shade and tap the downloaded file, OR open **Epson Smart Panel** (or **Epson iPrint**).
   - Tap **Print Document** or **Print Photos** and choose the downloaded file.
5. **Printer Connection:**
   - Verify that your Android phone is connected to the shop Wi-Fi / Jio AirFiber.
   - The app will automatically see your **Epson EcoTank L3250**.
6. **Confirm Print Settings in App:**
   - **Paper Size:** A4 (or requested size)
   - **Color / Grayscale:** Select Grayscale for B&W, or Color for Color prints.
   - **Copies:** Enter the number of copies selected by customer.
7. **Print:**
   - Tap **Print**. The Epson L3250 will print the sheets.
8. **Mark as Printed on Website:**
   - Switch back to the Smart Xerox Dashboard in Chrome.
   - Tap the green **"Mark as Printed"** button.
   - The customer's status will update to *"Printed & Ready"* if they are tracking it on their phone!
9. **Collect Cash:**
   - Hand over the printouts and collect the exact cash total shown on the card (e.g. ₹20).

---

## 2. Managing Code & Updates Using Only an Android Phone

If you ever need to change prices, text, or configuration without a laptop:

### Option A: Edit Directly via GitHub Web (Zero Installation)
1. Open Chrome on your Android phone and go to your repository on [GitHub](https://github.com).
2. To edit any file (such as `backend/.env` or prices in `backend/app/config.py`):
   - Tap the file.
   - Tap the **Pencil icon (Edit)**.
   - Make your changes.
   - Tap **Commit changes**.
3. Render or Railway will automatically detect the commit and re-deploy in 2 minutes!

### Option B: GitHub.dev Browser Editor
1. In Chrome on Android, open your GitHub repository page.
2. Press the `.` (dot) key on a physical keyboard, OR replace `github.com` in the URL with `github.dev/username/repository`.
3. A full VS Code interface opens directly inside your mobile browser where you can edit files and commit directly!

### Option C: Running Locally on Android using Termux (Advanced)
If you want to run the backend and frontend locally inside your phone:
1. Install **Termux** from F-Droid (do not use Google Play version as it is deprecated).
2. Inside Termux, run:
   ```bash
   pkg update && pkg upgrade -y
   pkg install python nodejs git -y
   ```
3. Clone your repository:
   ```bash
   git clone <your-repo-url>
   cd "printer project"
   ```
4. Start Backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```
5. In a new Termux session, start Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host
   ```
6. Open Chrome on your phone and browse to `http://localhost:5173`.

---

## 3. Best Practices for Mobile Battery & Performance

- **Chrome Background Tab Audio:** To ensure audio chimes play when orders arrive, keep the dashboard tab active in Chrome during shop hours.
- **Auto-Download:** When tapping "Download File", set Chrome to save files directly to `Downloads` without asking where to save each time (Chrome Settings > Downloads > Ask where to save files: OFF).
- **Storage Cleanup:** Your Android `Download` folder can accumulate PDF files over weeks. Run Google Files app > "Clean" weekly to remove old downloaded customer documents.
