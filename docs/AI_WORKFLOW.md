# AI Workflow Note

## Tools Used

- **Claude (claude-sonnet-4-6 via Claude Code)** — Primary AI assistant for code generation, architecture planning, and scaffolding.
- **GitHub Copilot** (if used during editor sessions) — Inline completions for boilerplate.

---

## Where AI Materially Sped Up the Work

**1. Project scaffolding and dependency selection (~30 min saved)**  
Claude helped select the right TipTap extensions (StarterKit + Underline + TextStyle + Color) and the correct Supabase SSR package for Next.js App Router. Getting this wrong wastes an hour of debugging peer dependency issues.

**2. Supabase RLS policy generation (~45 min saved)**  
Writing Row-Level Security policies correctly from memory is error-prone. Claude generated the full policy set for `documents` and `document_shares` and explained the `auth.uid()` function behavior. I reviewed and adjusted the `SELECT` policy on `documents` to cover the shared-document join correctly.

**3. TipTap toolbar wiring (~20 min saved)**  
The TipTap `useEditor` hook and `editor.chain().focus()` API pattern is well-documented but verbose to write. Claude generated the toolbar component; I adjusted the button active-state styling and added keyboard shortcut hints.

**4. mammoth .docx parsing integration (~15 min saved)**  
`mammoth.convertToHtml()` is straightforward but needed to be wrapped correctly for the Next.js API route (Buffer handling from FormData). Claude generated the initial wrapper; I verified the output HTML was compatible with TipTap's `setContent()` method.

---

## What I Changed or Rejected from AI Output

**Rejected: Supabase client singleton pattern**  
Claude initially suggested a module-level singleton `const supabase = createClient(...)`. This breaks in Next.js App Router because server components and route handlers need separate client instances with cookie access. I replaced it with the official `@supabase/ssr` pattern using `createServerClient` and `createBrowserClient`.

**Changed: Sharing logic**  
The initial AI-generated share route did a simple `insert` without checking if the target email exists as a registered user. I added a lookup against `auth.users` via the `profiles` view first, and return a clear error if the user hasn't registered — better UX than a silent foreign key failure.

**Changed: TipTap content storage**  
AI suggested storing TipTap output as JSON (`.getJSON()`). I changed this to HTML (`.getHTML()`) for two reasons: (1) easier to render as a preview without TipTap, (2) mammoth outputs HTML so the import path is consistent.

**Rejected: Auto-save with 500ms debounce**  
AI suggested debouncing saves on every keystroke. I changed this to explicit save (Ctrl+S / Save button) plus a 3-second idle debounce. Auto-saving on every keystroke creates excessive Supabase writes and can cause conflicts if the connection is slow.

---

## How I Verified Correctness

- **Auth flow**: Manually signed up two test accounts and verified JWT cookies were set correctly in browser DevTools.
- **RLS policies**: Logged in as User A, shared a document with User B, logged in as User B in an incognito window, confirmed the shared document appeared and that User B could not access User A's unshared documents via the API.
- **File upload**: Tested with a `.txt` file, a `.md` file, and a `.docx` file. Verified content appeared correctly in the editor after import.
- **TipTap formatting**: Checked bold, italic, underline, H1/H2/H3, bullet lists, and numbered lists round-trip correctly through save → reload.
- **TypeScript**: `npm run build` passes with zero type errors before submission.
- **Test suite**: `npm test` passes the document utility unit test.
