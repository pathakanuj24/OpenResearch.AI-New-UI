# Insightway frontend (Atlas)

Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui primitives, TanStack Query, the Vercel AI SDK (`useChat`), and Firebase Auth.
The visual direction is **Atlas**. Its spec is `../docs/redesign/standalone/OpenResearch-Atlas-Design-System.html`.

## Rules

- **Colour:** use only the tokens in `src/styles/tokens.css`, copied verbatim from the spec. Tailwind utilities are named
  after them: `bg-moss`, `text-ink-2`, `bg-sun-soft`, `text-known`, `bg-f-econ` and so on. No raw colours.
- **Fonts:** **Bricolage Grotesque** for the interface (`font-display`) and **Literata** for reading text (`font-read`,
  `.reading`, `.answer`).
- **Moss** is the only action colour. **Sun** is only for citation pins, highlighted passages and "you are here".
- WCAG 2.2 AA in both themes. Theme comes from `data-theme` on `<html>` via next-themes; system is the default.

## Structure

```
src/app/(site)        public site: /, /features, /how-it-works, /about, /contact
src/app/(auth)        /login, /signup, /forgot-password   (+ /signed-out)
src/app/(app)         signed-in app: /today, /papers/[id] (Read · Trail · Guide), /resources, /learning, /settings
src/components/atlas  design-system components (Button, ConceptChip, CitePin, Term, Segmented, Toggle, TextField,
                      Topo, MiniTrail, FieldCover, ProgressRing, Steps, Stamp, ResourceCard)
src/components/app    app shell (nav pill, ⌘K palette, account menu, mobile bar, drop-anywhere upload)
src/features/*        screens: today, reading, guide, trail, resources, learning, settings, auth
src/lib/data.ts       React Query hooks for every backend call, plus uploads and job polling
src/lib/trail.ts      trail model (stops, "you are here", blocking concept)
src/lib/prefs.ts      browser-local preferences (until the backend stores them)
```

All data comes from the backend; nothing is mocked. The endpoints used, and the ones still missing (each with the
fallback the UI uses meanwhile), are listed in `../docs/frontend-api-contract.md`.

## Run

```bash
cp .env.local.example .env.local   # if missing: NEXT_PUBLIC_API_BASE_URL + the Firebase web config
npm install
npm run dev                        # http://localhost:3000 (backend on :8001)
```

Checks: `npx tsc --noEmit -p . && npx eslint src && npm run build`.
