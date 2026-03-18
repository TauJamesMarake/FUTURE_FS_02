# Client Lead Management System (Mini CRM)

A production-ready full-stack CRM application for capturing, tracking, and managing business leads. Built with React, Node.js/Express, and Supabase.

---

## 📸 Features

- 🔐 JWT-based admin authentication
- 📋 Lead capture via public API endpoint
- 📊 Analytics dashboard with charts
- 🔍 Search & filter leads by name, email, company, status, source, date
- 📝 Per-lead follow-up notes
- 🔄 Lead status lifecycle (New → Contacted → Converted)
- 📱 Fully responsive SaaS-style UI

---

## 🛠 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18, React Router, Recharts |
| Backend    | Node.js, Express.js     |
| Database   | Supabase (PostgreSQL)   |
| Auth       | JWT (jsonwebtoken)      |
| Styling    | CSS Modules + Custom CSS |

---

## 📁 Folder Structure

```
crm/
├── server/
│   ├── config/
│   │   └── supabase.js          # Supabase client setup
│   ├── controllers/
│   │   ├── authController.js    # Login & profile
│   │   ├── leadsController.js   # Lead CRUD
│   │   └── notesController.js   # Notes CRUD
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/
│   │   └── schema.sql           # Supabase SQL schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leads.js
│   │   └── notes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── LeadTable.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── NoteItem.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leads.jsx
│   │   │   └── LeadDetail.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API calls
│   │   ├── hooks/
│   │   │   └── useLeads.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/client-lead-management-crm.git
cd client-lead-management-crm
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** in your Supabase dashboard
3. Run the contents of `server/models/schema.sql` to create all tables
4. Copy your **Project URL** and **anon/service role key** from Project Settings → API

### 3. Configure the Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=yourpassword
```

Install dependencies and start:
```bash
npm install
npm start
```

The backend will run at `http://localhost:5000`

### 4. Configure the Frontend

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start:
```bash
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login, returns JWT |
| GET | `/api/auth/profile` | Get current admin profile |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get all leads (with search/filter) |
| POST | `/api/leads` | Create new lead (public) |
| GET | `/api/leads/:id` | Get single lead |
| PATCH | `/api/leads/:id/status` | Update lead status |
| DELETE | `/api/leads/:id` | Delete a lead |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads/:id/notes` | Get notes for a lead |
| POST | `/api/leads/:id/notes` | Add a note to a lead |

---

## 🧪 Testing the Lead Capture API

You can test lead submission with curl:

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "source": "website"
  }'
```

---

## 🔐 Default Admin Credentials

Set via environment variables in `server/.env`:
- **Email**: value of `ADMIN_EMAIL`
- **Password**: value of `ADMIN_PASSWORD`

> ⚠️ Change these before deploying to production.

---

## 📊 Analytics

The dashboard shows:
- Total Leads
- New Leads
- Contacted Leads
- Converted Leads
- Leads by source (bar chart)
- Lead trend over time (line chart)

---

## 🚀 Deployment

### Backend (Railway / Render)
- Set all environment variables in the platform dashboard
- Point to `server/server.js` as the entry point

### Frontend (Vercel / Netlify)
- Set `VITE_API_URL` to your deployed backend URL
- Build command: `npm run build`
- Output directory: `dist`

---

## 📄 License

MIT — free to use, modify, and distribute.
