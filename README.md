# StudyNotes AI

An AI-powered study tool that generates Q&A pairs from your notes using Google Gemini, built with Next.js, TypeScript, Tailwind CSS, and Supabase (PostgreSQL).

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (REST API)
- **Database**: PostgreSQL via Supabase
- **AI**: Google Gemini 1.5 Flash
- **Deployment**: Vercel

---

## Setup Instructions

### Step 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/study-notes-app.git
cd study-notes-app
npm install
```

### Step 2 — Set up Supabase (free PostgreSQL)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** → paste the contents of `supabase-setup.sql` → click **Run**
4. Go to **Project Settings → API** → copy:
   - Project URL
   - anon/public key

### Step 3 — Get Gemini API key (free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key** → Create API key
3. Copy the key

### Step 4 — Add environment variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### Step 5 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add the same 3 environment variables in Vercel's project settings
4. Click **Deploy**

Your app is live at a public URL instantly.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── notes/route.ts       # GET & POST notes
│   │   └── generate/route.ts    # POST generate questions via Gemini
│   ├── history/
│   │   └── page.tsx             # History page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main page
├── components/
│   └── QuestionCard.tsx         # Reusable Q&A card
└── lib/
    └── supabase.ts              # Supabase client + types
```

## Features

- Paste study notes → get 5 AI-generated Q&A pairs
- Toggle answers on/off (great for self-testing)
- All notes and questions saved to PostgreSQL
- History page to revisit past sessions
- Fully deployed on Vercel
