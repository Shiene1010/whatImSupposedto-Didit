---
name: mvp-agent
description: Implement and improve the guest-first MVP for whatImSupposedto-Didit using the repository's actual stack, code, and verified service configuration.
---

# MVP development instructions

## Product goal

Help a perfectionist user notice one small attempt toward a goal and make the next action easier. Prioritize a complete, understandable user journey over implementing the entire long-term PRD.

## Match the repository

- The web app uses Next.js 16 App Router, React 19, strict TypeScript, and CSS in `src/app/`. Check `package.json` before adding dependencies; do not assume Tailwind, Framer Motion, Lucide, Zustand, or other uninstalled packages.
- Read the relevant guide under `node_modules/next/dist/docs/` before changing Next.js behavior. Follow the installed version, not generic or older Next.js conventions.
- The current guest experience is in `src/app/page.tsx` and `src/app/globals.css`.
- Reuse the existing domain logic: `src/core/parser/mdStaticParser.ts`, `src/core/splitter/scriptSplitter.ts`, and `src/metrics/purpleKpiEngine.ts`. `src/demo/demoSession.ts` composes these for the guest demo.
- Web app tests live under `tests/` and use Jest. Supabase Edge Function tests use Deno.
- Vercel deploys the Next.js app. Supabase Edge Functions are a separate backend deployment.

## MVP behavior and truthful UI

- The current MVP is a no-login, browser-local flow: enter a goal and attempt log, analyze them, show evidence for any detected attempt, and suggest a small next step.
- Guest input must remain in transient browser component state. Do not send it to a database, AI provider, analytics, or logging endpoint, or persist it across refreshes, unless the user explicitly approves a scope change and its privacy requirements are implemented.
- Existing KPI results are keyword/rule-based signals. Show the matching evidence and do not present a match as proof of completion, semantic understanding, or clinical advice.
- Demo prescriptions are rule-based templates, not AI output. Do not claim Gemini or OpenAI generation unless an integration is configured, securely implemented, and verified.
- Treat `docs/mvp_refs.md` as legacy product intent. Verify each proposed feature against current code and the live Supabase schema before describing it as implemented.
- Login utilities in `src/lib/auth.ts` do not mean that login, account migration, quotas, or saved prescriptions are part of the current guest journey.
- Do not assume peer sharing, realtime feedback, BYOK key storage, demo-account resets, or IndexedDB sync are implemented or approved. Do not add them without explicit scope, data-ownership, privacy, and security decisions.
- Never place service-role credentials or provider secrets in browser code. Do not autofill, log, or commit user API keys. Browser storage is not a secure secret vault.
- Before any database change, inspect the live schema, migration history, grants, and RLS. Do not create public-read policies or enable writes based only on PRD examples or legacy SQL.
- The webhook Edge Function is a private GitHub service event receiver, not an application-user API. Preserve its HMAC authentication and data separation.

## Implementation and delivery

1. Read the relevant product requirements and inspect current code, tests, and service state before editing. Keep each change within the requested feature.
2. Use explicit TypeScript types; never use `any`. Follow existing naming, formatting, localization, and CSS conventions.
3. Add focused tests for behavior changes. For web changes run `npm test -- --runInBand` and `npm run build`; run relevant Deno checks/tests for Edge Function changes.
4. Update the relevant `docs/` material and `README.md` when behavior, setup, privacy, or deployment changes. Document only verified behavior.
5. Review `git status` and stage only files for this task. Preserve user changes; exclude `.next/`, `next-env.d.ts` generated edits, `.env`, credentials, and unrelated files.
6. Follow repository delivery instructions for commit and push. Never amend a commit or discard unrelated worktree changes.

## Completion criteria

- The requested behavior works in the running application and satisfies explicit acceptance criteria.
- Empty, error, success, and no-match states are clear; interactive UI is keyboard-accessible and communicates dynamic results to assistive technology.
- UI copy accurately describes data handling, persistence, and whether output is rule-based or AI-generated.
- Relevant tests and build pass, or the exact blocker is reported.
