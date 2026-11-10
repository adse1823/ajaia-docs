# Ajaia Docs

A lightweight collaborative document editor. Create, edit, share, and import documents — all in the browser.

---

## Live Demo

> Deployment URL goes here after Railway deploy.

**Test accounts (pre-seeded):**

- `user1@ajaia.dev` / `password123`
- `user2@ajaia.dev` / `password123`

---

## Local Setup

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier is fine)

### 1. Clone and install

```bash
git clone <repo-url>
cd ajaia
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the entire contents of `supabase/migrations/001_initial.sql`
3. Go to **Project Settings → API** and copy your URL and anon key

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Run tests

```bash
npm test
```

---

## Features

### Document editing

- Create, rename, save, and reopen documents
- Rich text: bold, italic, underline, H1/H2/H3, bullet lists, numbered lists
- Auto-save (3s idle) + manual save (Ctrl+S or Save button)

### File import

- Upload `.txt`, `.md`, or `.docx` files
- File is parsed and opened as a new editable document
- `.docx` files are converted using `mammoth`

### Sharing

- Document owners can share by entering another user's email
- Shared documents appear in the "Shared with me" tab on the dashboard
- Shared users can read but not rename or delete

### Persistence

- All documents and sharing data stored in Supabase Postgres
- Formatting (HTML) preserved across save/reload
- Auth via Supabase email/password

---

## Stack

| Layer         | Technology              |
| ------------- | ----------------------- |
| Framework     | Next.js 14 (App Router) |
| Editor        | TipTap                  |
| Database+Auth | Supabase                |
| Styling       | Tailwind CSS            |
| Deployment    | Railway                 |
| Testing       | Vitest                  |

---

## Deployment (Railway)

1. Push to GitHub
2. Create a new Railway project → "Deploy from GitHub repo"
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Railway auto-detects Next.js and deploys

---

## Project Structure

```text
app/
  (auth)/login        — Sign in
  (auth)/register     — Sign up
  dashboard/          — Document list
  editor/[id]/        — Editor
  api/documents/      — CRUD API
  api/shares/         — Sharing API
  api/upload/         — File import API
components/
  Editor.tsx          — TipTap wrapper
  Toolbar.tsx         — Formatting buttons
  ShareModal.tsx      — Share dialog
  DocumentCard.tsx    — Dashboard card
lib/
  supabase/           — Client + server helpers
  document-utils.ts   — Pure utility functions
supabase/
  migrations/         — SQL schema + RLS policies
docs/
  ARCHITECTURE.md
  AI_WORKFLOW.md
  BUILD_STEPS.md
__tests__/
  document-utils.test.ts
```
