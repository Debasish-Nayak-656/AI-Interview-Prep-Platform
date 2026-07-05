# 🧠 AI Interview Preparation Platform

A full-stack, production-ready platform where candidates practice job interviews with an
AI interviewer (powered by Google Gemini), receive instant multi-dimensional scoring, and
track their progress over time.

---

## ✨ Features

- **Authentication** — JWT-based register/login/logout with protected routes
- **Resume Upload** — PDF upload → text extraction → AI-parsed skill summary
- **AI Interview Engine** — Gemini generates 10–15 role-specific questions, plus dynamic follow-ups
- **Interview Session** — one question at a time, text or voice answers, per-question timer, progress bar
- **AI Evaluation** — each answer scored 0–10 on technical accuracy, communication, clarity, problem solving, confidence
- **Results Page** — overall score, radar chart breakdown, question-wise feedback, downloadable PDF, email sharing
- **Dashboard & Analytics** — total interviews, average score, performance trend line chart, strengths/weaknesses
- **History** — searchable, paginated list of past interviews
- **Extras** — leaderboard, daily interview challenge, AI career tips
- **UI** — glassmorphism design, dark/light mode, responsive, loading skeletons, toast notifications

---

## 🏗️ Tech Stack

| Layer          | Technology                                             |
|----------------|---------------------------------------------------------|
| Frontend       | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Backend        | Node.js, Express.js                                     |
| Database       | MongoDB + Mongoose                                       |
| Auth           | JWT (jsonwebtoken, bcryptjs)                            |
| AI             | Google Gemini API (`@google/generative-ai`)             |
| Charts         | Recharts                                                 |
| State          | React Context API                                        |
| File Upload    | Multer + pdf-parse                                       |
| Forms          | React Hook Form + Zod                                    |
| PDF Reports    | PDFKit                                                   |
| Email          | Nodemailer                                                |

---

## 📁 Folder Structure

```
ai-interview-platform/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── Interview.js
│   │   ├── Question.js
│   │   └── Report.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── utils/
│   │   ├── gemini.js
│   │   ├── resumeParser.js
│   │   ├── pdfGenerator.js
│   │   └── mailer.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resume.js
│   │   ├── interview.js
│   │   ├── history.js
│   │   ├── report.js
│   │   └── dashboard.js
│   ├── uploads/               # resumes + generated PDF reports (gitignored)
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # /
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── upload-resume/page.tsx
│   │   ├── create-interview/page.tsx
│   │   ├── interview/[id]/page.tsx
│   │   ├── results/[id]/page.tsx
│   │   ├── history/page.tsx
│   │   └── profile/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/
│   │       ├── Card.tsx
│   │       └── Skeleton.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── validation.ts
│   │   └── utils.ts
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

---

## 🗄️ MongoDB Collections

- **Users** — profile + aggregate stats (totalInterviews, averageScore, bestScore, streak)
- **Resumes** — uploaded file metadata, extracted text, AI-parsed skill summary
- **Interviews** — job role, experience level, type, status, overall score
- **Questions** — per-question text, type, answer, per-dimension AI evaluation
- **Reports** — aggregated interview report (breakdown, strengths, weaknesses, PDF path)

---

## 🔌 Backend API Reference

| Method | Endpoint                          | Description                                      | Auth |
|--------|------------------------------------|---------------------------------------------------|------|
| POST   | `/api/auth/register`              | Register a new user                                | No   |
| POST   | `/api/auth/login`                 | Login, returns JWT                                 | No   |
| GET    | `/api/auth/me`                    | Get current user                                   | Yes  |
| POST   | `/api/auth/logout`                | Logout                                             | Yes  |
| POST   | `/api/resume/upload`              | Upload PDF resume (multipart `resume` field)       | Yes  |
| GET    | `/api/resume`                     | List user's resumes                                | Yes  |
| POST   | `/api/interview/create`           | Create interview + AI-generate questions           | Yes  |
| GET    | `/api/interview/:id`              | Get interview + its questions                      | Yes  |
| POST   | `/api/interview/:id/follow-up`    | Generate an AI follow-up question                  | Yes  |
| POST   | `/api/interview/submit`           | Submit + AI-evaluate one answer                    | Yes  |
| POST   | `/api/interview/:id/complete`     | Finalize interview, generate report + PDF          | Yes  |
| GET    | `/api/history`                    | Search/paginate past interviews                    | Yes  |
| GET    | `/api/report/:id`                 | Get full report for an interview                   | Yes  |
| GET    | `/api/report/:id/download`        | Download PDF report                                | Yes  |
| POST   | `/api/report/:id/email`           | Email PDF report to an address                     | Yes  |
| GET    | `/api/dashboard`                  | Dashboard stats, trend, strengths/weaknesses       | Yes  |
| GET    | `/api/dashboard/leaderboard`      | Top users by average score                         | Yes  |
| GET    | `/api/dashboard/daily-challenge`  | Question of the day + career tip                   | Yes  |

All protected routes require `Authorization: Bearer <token>`.

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Google Gemini API key](https://ai.google.dev/)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Ensure NEXT_PUBLIC_API_URL points to your backend
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## 🚀 Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo (or a subfolder of a monorepo).
2. On [Render](https://render.com), create a **New Web Service** pointing at that repo/folder.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example` (MONGO_URI, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL, SMTP_*).
6. Render assigns a public URL like `https://ai-interview-backend.onrender.com` — use this as `NEXT_PUBLIC_API_URL/api` on the frontend.
7. **Persistent uploads note:** Render's filesystem is ephemeral on free tiers — for production, swap local disk storage (Multer/PDFKit) for S3 or another object store if you need uploads/reports to survive redeploys.

### Frontend → Vercel

1. Push the `frontend/` folder to GitHub.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Set the root directory to `frontend` (if monorepo).
4. Add environment variable `NEXT_PUBLIC_API_URL=https://<your-render-backend>/api`.
5. Deploy — Vercel auto-detects Next.js and handles the build.
6. Update the backend's `CLIENT_URL` env var to your Vercel domain so CORS allows it.

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt; never returned in API responses.
- JWTs expire after 7 days by default (`JWT_EXPIRES_IN`).
- Rate limiting is applied to all `/api` routes to reduce abuse of AI endpoints.
- File uploads are restricted to PDF, 5MB max, via Multer's `fileFilter`.
- Set a strong, random `JWT_SECRET` in production — never commit `.env` files.

---

## 🧩 Notable Implementation Details

- **AI question generation & evaluation** live entirely in `backend/utils/gemini.js`, with prompts
  engineered to force strict JSON output, which is parsed and validated before being stored.
- **Voice answers** use the browser's native Web Speech API (Chrome/Edge) — no extra backend service required.
- **Dark/light mode** persists via `localStorage` and Tailwind's `class` strategy.
- **PDF reports** are generated server-side with PDFKit immediately after an interview completes,
  then served via `/api/report/:id/download` or emailed via Nodemailer.

---

## 📄 License

MIT — free to use and modify for personal or portfolio projects.
