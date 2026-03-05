# 🏛️ NFSU Projects Database

**National Forensic Sciences University — Student Project Repository**

A full-stack web application to document and browse student major/minor projects across all NFSU campuses, courses, and specializations.

---

## 🚀 Features

- **Public browsing** — Campus → Course → Batch → Major/Minor Projects → Project Detail
- **Faculty login** — Add and manage student projects  
- **Admin panel** — Full CRUD, user management, analytics dashboard
- **15 campuses** pre-loaded including Gandhinagar, Delhi, Goa, Uganda, and more
- **All programs** — B.Tech, M.Tech, M.Sc, BSc-MSc, BBA-MBA, MA Criminology, PhD
- **Specializations** — Cyber Security, Digital Forensics, AI/ML, IoT, and more
- **NFSU brand colors** — Navy (#003366), Blue (#0057A8), Gold (#C8972A)

---

## 🗂️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (raw `pg` driver, no Prisma)
- **Auth**: JWT via `jose` + HTTP-only cookies
- **Styling**: Tailwind CSS
- **Deployment**: Vercel + Vercel Postgres (or Neon / Supabase)

---

## 📦 Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd nfsu-projects-database
npm install
```

### 2. Create `.env.local`

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/nfsu_projects"
JWT_SECRET="your-random-secret-min-32-chars"
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### 3. Create the PostgreSQL database

```bash
createdb nfsu_projects
```

### 4. Run database setup

```bash
npm run db:setup
```

This creates all tables, seeds campuses/courses/specializations, and creates:
- **Admin**: `admin@nfsu.ac.in` / `Admin@NFSU2024`
- **Faculty**: `faculty@nfsu.ac.in` / `Faculty@NFSU2024`

⚠️ **Change these passwords immediately after first login!**

### 5. Run development server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## ☁️ Deploying to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial NFSU Projects Database"
git remote add origin https://github.com/yourusername/nfsu-projects.git
git push -u origin main
```

### Step 2: Create Vercel project

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### Step 3: Add PostgreSQL database

**Option A: Vercel Postgres (Recommended)**
1. In Vercel dashboard → **Storage** → **Create Database** → **Postgres**
2. Name it `nfsu-projects-db`
3. Click **Connect to project** → environment variables are added automatically

**Option B: Neon (Free tier)**
1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy the connection string
3. Add to Vercel: **Settings** → **Environment Variables** → `DATABASE_URL`

**Option C: Supabase**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Settings → Database → Connection string (URI)
3. Add as `DATABASE_URL` in Vercel

### Step 4: Add environment variables in Vercel

Go to **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Run `openssl rand -base64 32` to generate |

### Step 5: Run database setup on production

After first deployment, run the schema in your PostgreSQL client:

**If using Neon or Supabase** — paste the contents of `lib/schema.sql` into their SQL editor.

**If using Vercel Postgres** — use the Vercel dashboard query runner or:
```bash
# Install Vercel CLI
npm i -g vercel
vercel env pull .env.local
npm run db:setup
```

### Step 6: Deploy

```bash
vercel --prod
```

Or just push to main — Vercel auto-deploys!

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@nfsu.ac.in | Admin@NFSU2024 |
| Faculty | faculty@nfsu.ac.in | Faculty@NFSU2024 |

**⚠️ Change these immediately via the admin panel after first login!**

---

## 📂 Project Structure

```
nfsu-projects/
├── app/
│   ├── page.tsx                    # Home - Campus listing
│   ├── campus/[id]/
│   │   └── course/[courseId]/      # Course + project browser
│   ├── project/[id]/               # Project detail page
│   ├── search/                     # Global search
│   ├── login/                      # Faculty login
│   ├── admin/
│   │   ├── login/                  # Admin login
│   │   ├── dashboard/              # Admin overview
│   │   ├── projects/               # Manage all projects
│   │   └── users/                  # Manage users
│   ├── faculty/
│   │   ├── dashboard/              # Faculty overview
│   │   └── projects/new/           # Add project form
│   └── api/
│       ├── auth/{login,logout,me}/ # Auth endpoints
│       ├── projects/               # Projects CRUD
│       ├── campuses/               # List campuses
│       ├── courses/                # List courses
│       ├── specializations/        # List specializations
│       └── admin/{users,stats}/    # Admin-only endpoints
├── components/
│   └── ProjectForm.tsx             # Shared project form
├── lib/
│   ├── db.ts                       # PostgreSQL connection pool
│   ├── auth.ts                     # JWT utilities
│   ├── constants.ts                # Campuses, courses data
│   ├── schema.sql                  # Full database schema + seed data
│   └── db-setup.js                 # Database setup script
├── middleware.ts                   # Route protection
└── .env.example                    # Environment variables template
```

---

## 🗄️ Database Schema

```sql
campuses        -- 15 NFSU campuses
courses         -- Programs (B.Tech, M.Tech, etc.) per campus
specializations -- Specializations per course
users           -- Admin and faculty accounts
projects        -- Student project records
```

---

## 👩‍💻 Adding Projects (Faculty)

1. Login at `/login`
2. Go to **Add Project**
3. Fill in: Title, Type (Major/Minor), Student details, Campus/Course/Batch, Guide info, Technologies, Description
4. Click **Add Project** → immediately visible to public

## 🛡️ Admin Features

- Add/manage ALL projects
- Create faculty and admin accounts
- View analytics (projects by campus, recent additions)
- Delete projects

---

## 🎨 NFSU Brand Colors

```css
Navy:  #003366  (primary background)
Blue:  #0057A8  (links, accents)
Gold:  #C8972A  (highlights, CTA)
Amber: #E8A820  (hover states)
```

---

## 📝 Adding More Courses/Campuses

Edit `lib/schema.sql` → `INSERT INTO courses` or `INSERT INTO campuses` sections, then re-run `npm run db:setup`.

Or directly insert via SQL:
```sql
INSERT INTO campuses (name, location, state, code, description)
VALUES ('New Campus', 'City', 'State', 'NEW', 'Description');
```

---

## 🔧 Troubleshooting

**Database connection failed**
- Ensure `DATABASE_URL` is set correctly
- For local dev, PostgreSQL must be running: `pg_ctl start`

**SSL error on production**
- The `pg` pool is configured with `ssl: { rejectUnauthorized: false }` in production

**Login not working**
- Run `npm run db:setup` to ensure password hashes are correct
- Check `JWT_SECRET` is set in environment variables

---

Built with ❤️ for National Forensic Sciences University
