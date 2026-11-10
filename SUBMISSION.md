# Submission

## What is included

| Item | Location |
|---|---|
| Source code | This repository |
| README with setup instructions | `README.md` |
| Architecture note | `docs/ARCHITECTURE.md` |
| AI workflow note | `docs/AI_WORKFLOW.md` |
| Build decision log | `docs/BUILD_STEPS.md` |
| Live deployment URL | See below |
| Walkthrough video | See below |

---

## Live URL

> _Add Railway deployment URL here_

## Test accounts

| Email | Password |
|---|---|
| user1@ajaia.dev | password123 |
| user2@ajaia.dev | password123 |

## Walkthrough video

> _Add Loom/YouTube unlisted link here_

---

## What works end to end

- Register and sign in with email/password
- Create new documents
- Edit documents with rich text formatting (bold, italic, underline, H1–H3, bullet + numbered lists)
- Rename documents inline
- Auto-save (3s idle) and manual save (Ctrl+S / Save button)
- Reopen documents after page refresh — content and formatting preserved
- Import `.txt`, `.md`, and `.docx` files as new editable documents
- Share a document by email — shared user sees it in their "Shared with me" tab
- Owned vs. shared documents visually distinguished on the dashboard
- Delete owned documents from the dashboard

---

## What is incomplete / would build next

| Feature | Status | Next steps |
|---|---|---|
| Real-time collaboration indicators | Not built | Add Supabase Realtime presence |
| Document version history | Not built | Add `document_versions` table, diff view |
| Export to PDF / Markdown | Not built | TipTap `getHTML()` → html2pdf or markdown-it |
| Role-based sharing (viewer vs editor) | Schema ready, UI not exposed | Add permission toggle to ShareModal |
| Revoke individual shares from editor | Not built | Add share list with remove buttons in ShareModal |

---

## Running locally

See `README.md` for full instructions. Quick version:

```bash
cp .env.local.example .env.local
# fill in Supabase credentials
npm install
npm run dev
```

Tests:

```bash
npm test
```
