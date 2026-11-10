# Build Steps

A running log of every decision made during the build, in order.

---

## Step 1 — Project Scaffold

**Command:**
```bash
npx create-next-app@latest ajaia --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

**Why these flags:**
- `--typescript` — Type safety, required for TipTap's generics
- `--tailwind` — Included in template, faster than setting up manually
- `--eslint` — Catches obvious issues
- `--app` — Next.js App Router (latest pattern, better server component support)
- `--no-src-dir` — Keeps `app/` at the root, less nesting
- `--import-alias "@/*"` — Cleaner imports

---

## Step 2 — Dependencies

```bash
npm install \
  @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-underline @tiptap/extension-text-style @tiptap/extension-color \
  @supabase/supabase-js @supabase/ssr \
  mammoth lucide-react

npm install --save-dev vitest @vitejs/plugin-react
```

**Package decisions:**
| Package | Purpose |
|---|---|
| `@tiptap/starter-kit` | Bold, italic, headings, lists, history in one bundle |
| `@tiptap/extension-underline` | Underline (not in StarterKit) |
| `@tiptap/extension-text-style` | Required peer for Color extension |
| `@tiptap/extension-color` | Text color (optional enhancement) |
| `@supabase/ssr` | Correct Supabase client for Next.js App Router (handles cookies) |
| `mammoth` | .docx → HTML conversion |
| `lucide-react` | Icon library — consistent, tree-shakeable |
| `vitest` | Fast unit test runner, TypeScript-native |

---

## Step 3 — Supabase Setup

**What to do in the Supabase dashboard:**

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration in `supabase/migrations/001_initial.sql`
3. Go to **Project Settings → API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Paste into `.env.local` (copy from `.env.local.example`)

**Why Supabase for auth:**
Supabase Auth handles email/password signup, session tokens, and JWT verification. Combined with RLS, it means auth is enforced at the database layer — no session bugs possible.

---

## Step 4 — File Structure

```
app/
  (auth)/
    login/page.tsx          — Email + password sign in
    register/page.tsx       — New account creation
  dashboard/
    page.tsx                — Document list (owned + shared tabs)
  editor/
    [id]/page.tsx           — TipTap editor
  api/
    documents/
      route.ts              — GET (list), POST (create)
      [id]/route.ts         — GET, PUT (update), DELETE
    shares/
      route.ts              — POST (create share), DELETE
    upload/
      route.ts              — POST (parse file → new document)
  layout.tsx                — Root layout with font
  page.tsx                  — Redirect → /dashboard or /login
  globals.css               — Tailwind base + TipTap prose styles

lib/
  supabase/
    client.ts               — Browser client (createBrowserClient)
    server.ts               — Server client (createServerClient + cookies)

components/
  Editor.tsx                — TipTap editor with auto/manual save
  Toolbar.tsx               — Formatting buttons
  ShareModal.tsx            — Share by email dialog
  DocumentCard.tsx          — Card in dashboard list

middleware.ts               — Protect /dashboard and /editor routes

supabase/
  migrations/
    001_initial.sql         — Tables + RLS policies

docs/
  ARCHITECTURE.md           — Architecture decisions
  AI_WORKFLOW.md            — AI tool usage
  BUILD_STEPS.md            — This file

vitest.config.ts            — Test config
__tests__/
  documents.test.ts         — Unit test for document utilities
```

---

## Step 5 — Supabase Schema + RLS

See `supabase/migrations/001_initial.sql`.

Key RLS rules:
- `documents` SELECT: `owner_id = auth.uid()` OR `id IN (SELECT document_id FROM document_shares WHERE shared_with_id = auth.uid())`
- `documents` INSERT/UPDATE/DELETE: `owner_id = auth.uid()`
- `document_shares` SELECT/INSERT/DELETE: tied to document owner

---

## Step 6 — Auth Pages

Simple email/password forms using Supabase Auth client-side:
- `/register` → `supabase.auth.signUp()`
- `/login` → `supabase.auth.signInWithPassword()`
- Both redirect to `/dashboard` on success
- Middleware redirects unauthenticated users to `/login`

---

## Step 7 — Dashboard

Shows two tabs:
- **My Documents** — docs where `owner_id = auth.uid()`
- **Shared With Me** — docs via `document_shares`

Each card shows: title, last updated, owner (for shared), and an open button.

---

## Step 8 — Editor

TipTap editor with:
- Toolbar: Bold, Italic, Underline, H1, H2, H3, Bullet List, Numbered List
- Title field (inline, editable)
- Save button + Ctrl+S shortcut
- 3-second idle auto-save
- Share button → opens ShareModal

Content stored as HTML string in `documents.content`.

---

## Step 9 — File Upload

Supported types: `.txt`, `.md`, `.docx`

Flow:
1. User selects file from dashboard
2. POST to `/api/upload` with FormData
3. Server parses content:
   - `.txt` / `.md` → read as UTF-8 text, wrap in `<p>` tags
   - `.docx` → `mammoth.convertToHtml()` → returns HTML
4. Creates new document with parsed content
5. Redirects to editor

---

## Step 10 — Sharing

Flow:
1. In editor, click Share
2. Enter another user's email
3. POST to `/api/shares` → looks up user by email → inserts `document_shares` row
4. Shared user sees document in "Shared With Me" tab on their dashboard

---

## Step 11 — Tests

`__tests__/documents.test.ts` — unit test for document title validation and content sanitization utilities.

---

## Step 12 — Deployment

Railway deployment:
1. Push to GitHub
2. Connect repo in Railway
3. Add environment variables
4. Deploy
