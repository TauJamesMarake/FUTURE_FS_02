# 🚀 Client Lead CRM - Modern Lead Management SaaS

[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat&logo=node.js)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-F7931E?style=flat&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000?style=flat&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Capture, track, and convert leads effortlessly.** Production-ready full-stack CRM with dashboard analytics, notes, and public API. Deploy in minutes!

## ✨ Features at a Glance
<div align="center">
  <img src="https://via.placeholder.com/800x400/1f2937/f8fafc?text=%F0%9F%9A%80+Client+Lead+CRM+Dashboard+-+Real-time+Analytics+%26+Stats" alt="CRM Dashboard Screenshot" width="48%">
  <img src="https://via.placeholder.com/800x400/1f2937/f8fafc?text=%F0%9F%93%8A+Smart+Leads+Table+-+Filter%2C+Search%2C+Notes" alt="CRM Leads Table Screenshot" width="48%">
</div>

- 🔐 **Secure JWT Auth** - Admin dashboard login
- 📊 **Real-time Analytics** - Charts for leads by status/source
- 📈 **Lead Lifecycle** - New → Contacted → Converted
- 🔍 **Smart Search/Filter** - Name, email, company, status, source
- 📝 **Follow-up Notes** - Timestamped per-lead notes
- 🌐 **Public API** - Capture leads from your website/forms
- 📱 **Responsive Design** - Works on mobile, tablet, desktop
- ⚡ **Fast & Scalable** - Vite + Express + Supabase Postgres

## 🛠 Tech Stack Badges
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Express-415868?style=flat&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-F7931E?style=flat&logo=supabase&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000?style=flat&logo=json-web-tokens&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)

## 🚀 Quick Start (5 Minutes)

1. **Clone & Install**
```bash
git clone <your-repo> crm
cd crm
```

2. **Supabase Setup** (2 min)
- Create project at [supabase.com](https://supabase.com)
- Run `backend/models/schema.sql` in SQL Editor
- Copy URL + Service Key

3. **One-Command Run**
```bash
# Backend
cd backend && npm i && npm start &amp;

# Frontend (new terminal)
cd frontend && npm i && npm run dev
```

**Backend:** `http://localhost:5000`  
**Frontend:** `http://localhost:5173`

## 📁 Clean Folder Structure
```
crm/
├── backend/     # Express API + Supabase
├── frontend/    # React + Vite + Tailwind-ish CSS
├── public/      # Screenshots go here
└── README.md
```

## 🔌 Test Public Lead API Instantly
```bash
curl -X POST http://localhost:5000/api/leads \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Lead",
    "email": "lead@example.com",
    "source": "website"
  }'
```

## ⚙️ Detailed Setup

### Backend (.env)
```
PORT=5000
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
JWT_SECRET=supersecret
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=admin123
```

**`cd backend && npm i && npm start`**

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

**`cd frontend && npm i && npm run dev`**

**Admin Login:** `admin@company.com` / `admin123` (change in .env!)

## 📊 API Endpoints
| Endpoint | Method | Auth | Desc |
|----------|--------|------|------|
`/api/leads` | GET/POST | admin/public | List/Create leads |
`/api/leads/:id` | GET/PATCH/DELETE | admin | Single lead ops |
`/api/leads/:id/notes` | GET/POST | admin | Lead notes |
`/api/auth/login` | POST | - | JWT token |

## 🎯 Why This CRM?
- **Lead Magnet:** Public API for website forms
- **No Vendor Lock:** Self-hosted or Supabase
- **Analytics Built-in:** No Google Analytics needed
- **Developer-Friendly:** Clean code, easy extend

## 🚀 Deploy Live
- **Backend:** Railway/Render → set .env vars
- **Frontend:** Vercel/Netlify → `npm run build`

## 🤝 Contributing
1. Fork → Branch → PR
2. Add features: AI lead scoring? Email integrations?
3. Issues welcome!

## 📈 Roadmap
- [x] Core CRM features
- [x] Analytics dashboard
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Multi-admin support

⭐ **Star if useful!** Questions? Open issue.

---
*Built with ❤️ for lead-hungry businesses*

