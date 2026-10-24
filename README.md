# Smart Xerox — QR Code Printing Website

A complete, responsive, mobile-first QR code printing system tailored for a Xerox shop using an **Epson EcoTank L3250** printer connected via Wi-Fi router / Jio AirFiber.

Built specifically for shop owners who manage and operate their printing business using **only an Android phone**.

---

## 🌟 How It Works (The Honest Manual Android Workflow)

There are no fake automatic printer bridges or unsupported silent browser printing claims. The system follows an honest, reliable, 2-phase workflow:

```
[Customer at Shop Counter]
        │
        ▼ Scans Shop QR Code on Phone
[Mobile Web Portal]
        │
        ▼ Uploads PDF/Photo, Chooses B&W/Color, Copies
[Order Received in Cloud / Local Queue] ─── Unique Order ID (e.g. SX-8492)
        │
        ▼ Live Notification & Badge
[Owner Dashboard on Android Phone]
        │
        ├─ 1. Tap "Download File" (Saved to Phone Downloads)
        ├─ 2. Open File in Epson Smart Panel / Epson iPrint App
        ├─ 3. Print over Shop Wi-Fi to Epson EcoTank L3250
        ├─ 4. Return to Dashboard & Tap "Mark as Printed"
        │
        ▼
[Cash Payment Collected at Counter on Pickup] (No Gateways / No UPI Hassles)
```

---

## 📱 Key Features

### 1. Customer Mobile Interface
- **Mobile-First Design:** Optimized specifically for smartphone viewports (touch targets $\ge 48\text{px}$).
- **File Upload:** Accepts PDF, JPG, JPEG, and PNG files up to 15 MB.
- **Instant Preview:** Thumbnail preview for photos and document badge for PDFs.
- **Flexible Options:** Black & White vs Color toggle, paper sizes (A4, A5, Legal, 4x6 Photo), copies stepper, and page count estimator.
- **Live Price Calculator:** Real-time breakdown: $\text{Pages} \times \text{Copies} \times \text{Per-Page Rate} = \text{Total Cash Payable}$.
- **Prominent Order ID:** Generates clean, human-readable IDs (e.g., `#SX-4829`) that customers can easily read aloud at the counter.
- **Celebration & Guidance:** Confetti feedback on submit, step-by-step counter collection instructions.
- **Live Order Tracking:** Customers can track their order status (`Submitted` $\rightarrow$ `Ready to Print` $\rightarrow$ `Printed & Ready`).
- **100% Cash-on-Pickup:** Zero payment gateways, zero transaction fees, zero online payment failures.

### 2. Owner Dashboard (Engineered for Android Phones)
- **Password-Protected:** Secure JWT authentication with PBKDF2 hashing.
- **Live Print Queue:** Automatic background polling every 12 seconds with Web Audio synthesized chime and visual notification banner for incoming orders.
- **Status Tabs:** Filter by *All*, *New Orders*, *Ready to Print*, *Printed*, and *Cancelled*.
- **Quick Order Search:** Instant search by Order ID, customer name, or phone number.
- **One-Tap Actions:**
  - **Download File:** Saves document directly to Android phone's Downloads directory for Epson Smart Panel.
  - **Click-to-Call / WhatsApp:** One tap to call or message customer if instructions are unclear.
  - **Status Advancement:** One-tap to mark *Ready* or *Printed*.
- **Shop Analytics:** Tracks today's total orders and estimated counter cash sales.
- **Dynamic Pricing Controls:** Change B&W rate (default ₹2) and Color rate (default ₹10) anytime without restarting the server.
- **Shop QR Generator:** Display or download high-resolution printable QR cards directly from the phone screen.
- **Privacy & Security:** Private file storage (no public guessable URLs) and configurable auto-retention cleanup (default 24 hours).

---

## 🗂️ Project Structure

```
printer project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Environment configuration & defaults
│   │   ├── database.py            # SQLite / PostgreSQL engine & session
│   │   ├── models.py              # SQLAlchemy Order, Setting, & Owner models
│   │   ├── schemas.py             # Pydantic validation & response schemas
│   │   ├── auth.py                # PBKDF2 password hashing & JWT tokens
│   │   ├── main.py                # FastAPI app, CORS, routes & SPA static mount
│   │   ├── routes/
│   │   │   ├── auth.py            # Owner login & password update
│   │   │   ├── orders.py          # Public order submission & status tracking
│   │   │   ├── owner.py           # Protected orders queue, download, & stats
│   │   │   └── settings.py        # Pricing adjustments & QR code endpoint
│   │   ├── services/
│   │   │   ├── storage.py         # Private storage, traversal protection, & cleanup
│   │   │   └── qr.py              # High-resolution printable QR code generator
│   │   └── utils/
│   │       └── helpers.py         # Unique Order ID generator & PDF page counter
│   ├── uploads/                   # Private customer uploads directory (gitignored)
│   │   └── .gitkeep
│   ├── test_api.py                # 10-step automated integration test suite
│   ├── requirements.txt           # Python dependencies (FastAPI, SQLAlchemy, etc.)
│   ├── .env.example               # Environment variables template with placeholders
│   ├── .env                       # Local development settings
│   └── run.py                     # Convenience runner script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Sticky mobile navigation
│   │   │   ├── FileUploader.jsx   # Drag-and-drop & mobile file selector
│   │   │   ├── PriceCalculator.jsx# Real-time price breakdown card
│   │   │   ├── OrderCard.jsx      # Touch-friendly owner order card
│   │   │   ├── StatusBadge.jsx    # Animated color-coded status badges
│   │   │   ├── SettingsModal.jsx  # Pricing & password configuration modal
│   │   │   └── QrCodeModal.jsx    # Printable QR display & download modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Owner authentication state & persistence
│   │   ├── pages/
│   │   │   ├── CustomerOrderPage.jsx  # Fast 1-minute order submission flow
│   │   │   ├── OrderSuccessPage.jsx   # Order ID confirmation & counter guidance
│   │   │   ├── TrackOrderPage.jsx     # Customer order progress timeline
│   │   │   ├── OwnerLoginPage.jsx     # Owner credentials login
│   │   │   └── OwnerDashboardPage.jsx # Full-featured mobile control center
│   │   ├── api.js                 # API client with token management
│   │   ├── App.jsx                # Main application coordinator
│   │   ├── index.css              # Tailwind CSS v4 styling & navy/purple theme
│   │   └── main.jsx               # React entry point
│   ├── index.html                 # Mobile-first viewport, meta tags & PWA icon
│   ├── vite.config.js             # Vite configuration with Tailwind & dev proxy
│   └── package.json               # Frontend dependencies & scripts
├── scripts/
│   └── generate_qr.py             # Standalone CLI script to generate shop QR card
├── docs/
│   ├── ANDROID_SETUP_GUIDE.md     # Managing the entire shop using an Android phone
│   ├── EPSON_L3250_GUIDE.md       # Connecting printer to Jio AirFiber & mobile printing
│   └── DEPLOYMENT_GUIDE.md        # Beginner-friendly cloud deployment guide
├── render.yaml                    # 1-Click Render.com deployment Blueprint
├── Procfile                       # Cloud runner configuration
├── .gitignore                     # Git ignore rules
└── README.md                      # Complete system documentation
```

---

## 🚀 Quick Start (Local Testing)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the server
python run.py
```
The backend starts at `http://127.0.0.1:8000`.
- Health check: `http://127.0.0.1:8000/api/health`
- Interactive API Docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` on your browser (or your local network IP on your phone, e.g. `http://192.168.1.X:5173`).

### 4. Running Integration Tests
To verify all 10 API endpoints, authentication, and file security:
```bash
python backend/test_api.py
```

---

## 🔒 Security & Privacy Implementation

1. **Private File Storage:** Customer files are stored with random UUID filenames outside the public root. There are no public file URLs.
2. **Owner-Only Downloads:** The `/api/owner/orders/{order_id}/download` endpoint strictly requires a verified JWT bearer token belonging to the authenticated shop owner.
3. **MIME & Extension Validation:** Server-side validation inspects and restricts files strictly to `.pdf`, `.jpg`, `.jpeg`, and `.png` under 15 MB.
4. **Data Minimization:** Customer name and phone number are completely optional.
5. **Configurable Retention & Auto-Cleanup:** Files older than the retention period (default 24 hours) are automatically deleted from disk on server startup and can be manually cleared via the owner dashboard.
6. **Zero Hardcoded Secrets:** Password hashing uses OWASP-standard PBKDF2-HMAC-SHA256 with cryptographically secure random salts. Initial credentials are configured via environment variables.

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SHOP_NAME` | `Smart Xerox` | Displayed on website and QR cards |
| `SHOP_TAGLINE` | `Fast Mobile Printing • Epson EcoTank L3250` | Subtitle under shop name |
| `DATABASE_URL` | `sqlite:///./smart_xerox.db` | Database connection string (SQLite or PostgreSQL) |
| `SECRET_KEY` | *(Random string)* | Key for signing JWT tokens |
| `OWNER_USERNAME` | `admin` | Initial owner username |
| `OWNER_PASSWORD` | `admin123` | Initial owner password (change in dashboard) |
| `MAX_FILE_SIZE_MB`| `15` | Maximum upload size in megabytes |
| `RATE_BW_PER_PAGE`| `2.0` | Default Black & White rate (₹/page) |
| `RATE_COLOR_PER_PAGE`| `10.0` | Default Color rate (₹/page) |
| `FILE_RETENTION_HOURS`| `24` | Auto-delete customer files after this many hours |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |

---

## 🌐 Deploying to a Live Public Website (Free)

Follow [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed, beginner-friendly instructions using only an Android phone.

### 1-Click Deploy on Render.com:
1. Push this project to a private GitHub repository.
2. Go to [render.com](https://render.com), tap **New +** > **Blueprint**, and select your repository.
3. Render reads `render.yaml`, builds the React frontend, installs Python packages, and deploys everything to a permanent URL (e.g. `https://my-smart-xerox.onrender.com`).
4. Set your `SECRET_KEY` and `OWNER_PASSWORD` in the environment settings.

---

## 🖨️ Epson EcoTank L3250 & Wi-Fi Router Setup

See [docs/EPSON_L3250_GUIDE.md](docs/EPSON_L3250_GUIDE.md) for full instructions:
1. Connect the Epson L3250 to your shop Wi-Fi / Jio AirFiber (2.4 GHz).
2. Install **Epson Smart Panel** and **Epson Print Enabler** on your Android phone from Google Play.
3. Test print a B&W document and a Color photo over Wi-Fi before opening to customers.

---

## 📱 Pinning the Dashboard to Android Phone Home Screen

See [docs/ANDROID_SETUP_GUIDE.md](docs/ANDROID_SETUP_GUIDE.md):
1. Open your live website URL in Chrome on your phone.
2. Tap **Owner** and log in.
3. Tap Chrome's **(⋮)** menu $\rightarrow$ **Add to Home screen** (or **Install app**).
4. Tap the new **Smart Xerox** icon on your home screen to open the live dashboard in full-screen anytime.

---

## 🧰 Troubleshooting Guide

### 1. Upload Fails or Takes Too Long
- **Symptoms:** Customer sees an upload error or the progress spinner never stops.
- **Cause 1:** File exceeds 15 MB. The client and server will block files larger than 15 MB. Advise the customer to compress the PDF or crop unnecessary pages.
- **Cause 2:** Unsupported format (.docx, .zip). Ask the customer to export to PDF or take a screenshot (JPG/PNG).
- **Cause 3:** Weak mobile cellular signal inside the shop. Connect the customer to your shop Wi-Fi / Jio AirFiber.

### 2. Printer Not Found in Epson Smart Panel
- **Symptoms:** Android app says *"Printer offline"* or *"Searching for printer..."*.
- **Fix 1:** Verify your phone is connected to the **same Wi-Fi network** as the printer. On Jio AirFiber routers with separate 2.4G and 5G bands, ensure the phone is connected to the **2.4 GHz** SSID.
- **Fix 2:** Check printer Wi-Fi indicator:
  - If **solid green**: Printer is connected to router. Toggle phone Wi-Fi off and on.
  - If **flashing green/orange**: Printer lost connection. Hold Wi-Fi button for 5 seconds to reconnect.
- **Fix 3:** Restart the Jio AirFiber router and the printer.

### 3. Customer Files Disappear from Dashboard
- **Symptoms:** Clicking "Download File" returns a 404 error saying the file has expired.
- **Cause:** Files are automatically cleaned up after the retention window (default 24 hours) to protect customer privacy and prevent disk filling.
- **Fix:** If you need longer storage, open **Owner Settings** $\rightarrow$ **File Retention** $\rightarrow$ increase hours to 48 or 72 hours.

### 4. Audio Chime Doesn't Play on New Orders
- **Symptoms:** New orders arrive with visual highlights, but no chime plays.
- **Cause:** Android Chrome blocks audio until the user has interacted with the page at least once.
- **Fix:** Tap anywhere on the dashboard screen once in the morning after opening Chrome. Keep the tab open or active.

---

## 📄 License
MIT License. Created for Xerox and print shop entrepreneurs.
