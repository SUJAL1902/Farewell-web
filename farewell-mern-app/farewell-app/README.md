# 🎓 Farewell Batch 2022–2026

A beautiful, full-stack MERN farewell tribute website for the seniors of Batch 2022–2026.

---

## ✨ Features

- 🔐 **Passcode-gated access** — guests use one code, admins use another
- 🖼️ **Photo Gallery** — masonry layout with lightbox, admin upload & delete
- 🎬 **Video Section** — card-grid video player, admin upload & delete
- 💬 **Quotes Wall** — beautiful quote cards, admin can add/remove
- ⚙️ **Floating Admin Panel** — only visible after admin login
- 🌸 **Warm custom palette** — amber, rose, cream, sand (zero stock-blue)
- 📱 **Fully responsive** — mobile-first design
- 💾 **Persistent storage** — MongoDB Atlas or local MongoDB

---

## 🗂️ Project Structure

```
farewell-app/
├── backend/
│   ├── middleware/auth.js       ← JWT verification
│   ├── models/
│   │   ├── Media.js             ← Photo & video schema
│   │   └── Quote.js             ← Quote schema
│   ├── routes/
│   │   ├── auth.js              ← Passcode → JWT login
│   │   ├── media.js             ← Upload, fetch, delete media
│   │   └── quotes.js            ← CRUD quotes
│   ├── uploads/                 ← Stored media files (gitignored)
│   ├── .env                     ← Environment variables
│   └── server.js                ← Express entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.js/.css
│       │   ├── Hero.js/.css     ← Full-screen hero with particle canvas
│       │   ├── Gallery.js/.css  ← Masonry photo grid + lightbox
│       │   ├── Videos.js/.css   ← Video card grid
│       │   ├── Quotes.js/.css   ← Quote wall
│       │   ├── AdminPanel.js/.css ← Floating admin upload panel
│       │   ├── Footer.js/.css
│       │   └── ProtectedRoute.js
│       ├── context/AuthContext.js ← JWT + role state
│       ├── pages/
│       │   ├── Login.js/.css    ← Passcode gate
│       │   └── Home.js          ← Main page
│       ├── api.js               ← Axios instance with auth header
│       ├── App.js               ← React Router setup
│       └── index.css            ← Global design tokens & fonts
│
├── package.json                 ← Root scripts (concurrently)
└── README.md
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Install dependencies

```bash
npm run install-all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/farewell2226
JWT_SECRET=your_super_secret_key_here
GUEST_PASSCODE=batch2226          ← what guests type
ADMIN_PASSCODE=admin@farewell2226 ← what admin types
```

> **MongoDB Atlas:** replace `MONGO_URI` with your Atlas connection string.

### 3. Run in development

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### 4. Open the app

Visit `http://localhost:3000`

---

## 🔐 Passcode Guide

| Role  | Default Code          | Access |
|-------|-----------------------|--------|
| Guest | `batch2226`           | View gallery, videos, quotes |
| Admin | `admin@farewell2226`  | Upload/delete media & quotes |

> Change these in `backend/.env`. Do NOT share the admin code.

---

## 📤 Admin Usage

1. Log in with the **admin passcode**
2. A ⚙ floating button appears at **bottom-right**
3. Click it → select image or video → add caption → Upload
4. To delete: hover over any image/video → click **✕**
5. To add quotes: scroll to the Quotes section → use the form at the top

---

## 🌐 Deployment

### Frontend (Vercel / Netlify)
```bash
cd frontend && npm run build
```
Upload the `build/` folder. Set environment variable:
```
REACT_APP_API_URL=https://your-backend-url.com
```
Update `frontend/src/api.js` `baseURL` to point to your deployed backend.

### Backend (Railway / Render / VPS)
- Set all `.env` variables in your hosting dashboard
- Ensure `uploads/` directory exists and is writable
- For production media storage, consider AWS S3 or Cloudinary

---

## 🎨 Design System

| Token           | Value     | Usage |
|----------------|-----------|-------|
| `--amber`       | `#E8A87C` | Primary accent, CTAs |
| `--rose`        | `#C97B84` | Secondary accent, italic text |
| `--cream`       | `#FDF6ED` | Page background |
| `--cream-dark`  | `#F5E9D7` | Alternate section bg |
| `--charcoal`    | `#2C2420` | Headings, text |
| `--warm-gray`   | `#6B5A52` | Body text |
| `--sand`        | `#D4B896` | Borders, dividers |

Fonts: **Playfair Display** (headings) + **DM Sans** (body)

---

## 🤝 Built with ❤️ by

**Sujal Bhawsar** · [@cosmic_sujal](https://instagram.com/cosmic_sujal)
