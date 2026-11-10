# Architecture Note

## What This Is

A lightweight collaborative document editor built as a take-home assignment for Ajaia. The goal was to ship a coherent, working product slice within a 4–6 hour timebox — not to recreate Google Docs.

---

## Stack Decisions

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full stack in one repo. API routes colocate with UI. Railway deploy in one command. |
| Rich Text Editor | TipTap v3 | Best-in-class React rich text library. StarterKit v3 bundles bold, italic, underline, headings, and lists out of the box. |
| Database + Auth | Supabase | Hosted Postgres + Auth + Storage in one free-tier service. Row-Level Security handles sharing logic without custom middleware. |
| Styling | Tailwind CSS | Fast to write, no context switching to CSS files. Ships with Next.js template. |
| Deployment | Railway | Supports Next.js with environment variables cleanly. Free tier available. |
| File Parsing | mammoth | Best library for .docx → HTML conversion. .txt and .md are parsed natively. |
| Testing | Vitest | Fast, TypeScript-native, works without a browser for unit tests. |

---

## What I Prioritized

**1. Document editing experience first.**  
The core loop — create, edit, save, reopen — had to be solid. TipTap was chosen over Quill or Slate because it has first-class TypeScript support and the StarterKit covers all required formatting in one install.

**2. Supabase for auth + sharing in one move.**  
Building auth from scratch would have consumed 2+ hours. Supabase Auth gives email/password login in ~30 minutes. Row-Level Security policies then enforce sharing access at the database layer, so I don't need custom permission middleware.

**3. File upload as "import to document" not "attachment".**  
The assignment gives flexibility here. Turning an uploaded file into an editable document is more product-relevant and simpler to implement than a file attachment system (no storage bucket management needed for the core flow).

**4. Sharing as email-based invite.**  
Document owners enter another user's email to share. The backend looks up the user by email and writes a `document_shares` row. This demonstrates intent and working logic without building a full access-control system.

---

## What I Cut

- **Real-time collaboration** (stretch goal) — WebSocket/Supabase Realtime adds significant complexity. Deferred.
- **Document version history** — Useful but not in core requirements. Would use a `document_versions` table.
- **Rich permissions** (viewer vs editor) — The schema is designed to support it (`permission` column on `document_shares`) but the UI only exposes one level for now.
- **Export to PDF/Markdown** — Deferred. TipTap's `getHTML()` makes this straightforward to add later.
- **Offline support** — Out of scope for this timebox.

---

## Database Schema

```sql
-- documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  title text not null default 'Untitled Document',
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- document_shares
create table document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade not null,
  shared_with_id uuid references auth.users not null,
  permission text default 'editor',
  created_at timestamptz default now(),
  unique(document_id, shared_with_id)
);
```

Row-Level Security ensures:
- Users can only read documents they own or have been shared with
- Only owners can update or delete documents
- Only owners can create/delete shares

**Note:** The `document_shares` policy originally caused infinite recursion (`documents` policy queried `document_shares`, which queried `documents` again). Fixed by extracting ownership check into a `security definer` function (`owns_document`) that queries `documents` bypassing RLS, breaking the cycle.

---

## File Structure

```
ajaia/
  app/
    (auth)/
      login/        — Sign in page
      register/     — Sign up page
    dashboard/      — Lists owned + shared documents
    editor/[id]/    — TipTap editor for a document
    api/
      documents/    — CRUD routes
      shares/       — Share management
      upload/       — File import route
  lib/
    supabase/       — Server + client Supabase helpers
  components/
    Editor/         — TipTap editor component
    Toolbar/        — Formatting toolbar
    ShareModal/     — Share dialog
  docs/             — This folder
```

---

## If I Had 2–4 More Hours

1. Real-time presence indicators (who else is viewing)
2. Document version history with diff view
3. Export to Markdown / PDF
4. Role-based sharing (viewer vs editor)
5. Better error states and loading skeletons
