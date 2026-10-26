<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository delivery workflow

- For every substantive code, database, deployment, or configuration change, update or add durable documentation under `docs/` covering the behavior, configuration, and operational implications. Keep claims grounded in the current implementation and verified service state.
- Keep `README.md` aligned with the repository: update its status, documentation index, setup instructions, or deployment notes whenever the change makes them stale or adds user-facing documentation.
- Treat documentation and README updates as part of implementation, not as an optional follow-up. Skip unrelated documentation churn for purely mechanical changes.
- After validation, commit and push the task's intentional changes to the current branch when an `origin` remote is available. Do not wait for a separate push request.
- Stage only files belonging to the current task. Never include unrelated worktree changes, generated `.next/` files, environment files, credentials, or user-created files. Do not amend existing commits.
- If validation, commit, or push is blocked, report the exact blocker and leave unrelated changes untouched.
