# 🛡️ TaxShield AI — Smart Bill & Tax Intelligence Platform

<p align="center">
  <a href="https://taxshield-ai-zeta.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel%20App-0284C7?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/Adichowdary/taxshield-ai" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" />
  </a>
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI%20SDK-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT" />
</p>

---

## 🌟 Overview

**TaxShield AI** is an intelligent, full-stack financial platform designed to protect consumers and businesses from overbilling, tax calculation discrepancies, and hidden charges. Powered by **Google Gemini AI**, TaxShield extracts data from physical receipts and digital invoices, analyzes GST/VAT breakdowns against statutory tax rates, flags fraudulent line items, and generates formal consumer complaints with legal clause citations.

🌐 **Production URL:** [https://taxshield-ai-zeta.vercel.app](https://taxshield-ai-zeta.vercel.app)

---

## ✨ Key Features

### 🔍 1. AI Receipt & Invoice Scanner
- Multi-format ingestion (JPG, PNG, PDF receipts) via Cloudinary & OCR.
- Extracts vendor details, dates, items, quantities, sub-totals, and applicable tax rates.
- Validates GSTIN / Tax Identification Numbers in real time.

### 📊 2. Smart Tax & Bill Intelligence
- Automatic cross-checking of GST/VAT slab rates against official tax tariffs.
- Flags math discrepancies, hidden service surcharges, and incorrect tax brackets.
- Recommends actionable savings and allowable tax deductions.

### ⚖️ 3. Automated Consumer Complaint Generator
- Turns unfair charges or fraudulent billing into formal grievance letters.
- Maps issues directly to relevant Consumer Protection acts and statutory provisions.
- Pre-formats ready-to-file legal complaints and consumer court drafts.

### 📈 4. Financial Spending Dashboard & Comparative Insights
- Interactive charts powered by Recharts detailing monthly tax trends and spending breakdowns.
- Side-by-side bill comparison to identify rising recurring costs.
- Complete scan history with search, category filtering, and export tools.

### 🎨 5. World-Class Dual-Theme Design
- **Dark Mode:** Signature luxury aesthetic with deep obsidian surfaces, glassmorphism, and metallic gold accents.
- **Light Mode:** High-clarity **Sky Blue (`#0284C7`) + Crisp White** design with optimal contrast and readability.
- **Liquid Metal Shader:** Dynamic 3D WebGL background powered by Three.js that transitions smoothly between themes.
- **Instagram-Inspired Mobile UI:** Floating bottom bar navigation, haptic-style transitions, and ergonomic thumb-friendly layouts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, React Router v7, Framer Motion, GSAP, Lucide Icons, Recharts |
| **Styling & 3D** | Tailwind CSS v4, Vanilla CSS Design System, Three.js, WebGL Shaders |
| **AI Engine** | Google Gemini Generative AI SDK (`@google/generative-ai`) |
| **Backend** | Node.js, Express.js (v5), Vercel Serverless Functions |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | Firebase Auth (Google & Email/Password) + JWT |
| **File Storage** | Cloudinary API & Multer |
| **Deployment** | Vercel (Edge CDN + Serverless Functions) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **MongoDB Atlas** database URI
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))
- **Firebase Project** credentials

### 1. Clone the Repository
```bash
git clone https://github.com/Adichowdary/taxshield-ai.git
cd taxshield-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root with the following variables:

```env
# Frontend Environment Variables
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend Environment Variables
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Servers
To run both the Vite frontend and the Express backend locally:

```bash
# Start Vite Frontend
npm run dev

# In another terminal, start the Backend Server
npm run server
```

Access the application at `http://localhost:5173` (or `http://localhost:5174`).

---

## 📁 Project Architecture

```
taxshield-ai/
├── api/                    # Vercel Serverless Function entry point (api/index.js)
├── server/                 # Express.js backend server
│   ├── config/             # DB and service configurations
│   ├── controllers/        # Request handlers & Gemini AI orchestration
│   ├── middleware/         # Auth, upload, and validation middlewares
│   ├── models/             # Mongoose schemas (User, Bill, Complaint, etc.)
│   ├── routes/             # RESTful API endpoints
│   └── index.js            # Express server initialization
├── src/                    # React Frontend
│   ├── assets/             # Images, icons, and static assets
│   ├── components/         # Reusable UI components & 3D Shaders
│   │   ├── BottomNav.jsx   # Mobile bottom navigation bar
│   │   ├── LiquidMetalHero.jsx # Three.js WebGL hero animation
│   │   └── Navbar.jsx      # Desktop & tablet navigation
│   ├── pages/              # Main route views
│   │   ├── Landing.jsx     # Hero landing page
│   │   ├── DashboardHome.jsx # Core analytics overview
│   │   ├── ScanPage.jsx    # Receipt capture & processing
│   │   ├── AnalysisPage.jsx# Detailed tax breakdown
│   │   ├── ComplaintPage.jsx # Consumer grievance filing
│   │   ├── HistoryPage.jsx # Bill archive & audit logs
│   │   └── AuthPages.jsx   # Login, registration, & reset
│   ├── index.css           # Design tokens, themes, & responsive utilities
│   ├── App.jsx             # Router and application root
│   └── main.jsx            # React DOM bootstrap
├── vercel.json             # Vercel deployment & rewrite rules
├── render.yaml             # Render deployment configuration
└── package.json            # Project dependencies and npm scripts
```

---

## 🚢 Deployment

### Deploy to Vercel
The repository is pre-configured for zero-config Vercel deployment with `vercel.json` routing both client assets and serverless `/api` endpoints:

1. Import this repository in [Vercel Dashboard](https://vercel.com/new).
2. Configure the **Environment Variables** matching your `.env`.
3. Click **Deploy**. Vercel will automatically build the client bundle and wire the serverless API.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for consumer financial empowerment.
</p>
