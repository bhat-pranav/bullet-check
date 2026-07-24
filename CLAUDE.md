Bullet Check - Project Status Summary
What it is: A single-purpose AI resume-coaching tool. User pastes a job description + resume text; the app calls Claude (claude-haiku-4-5) and returns the 3 weakest resume bullets, why each is weak, and a rewritten version tailored to the role.

Status: complete, working MVP. No TODOs, stubs, or half-finished code anywhere. The git history (8 commits) shows a clean arc: scaffold → build core feature → dark-mode redesign → polish pass (tests/CI/README/LICENSE) → favicon. Reads like a finished small project, not something mid-flight.

Architecture
Next.js 16 App Router, TypeScript, Tailwind v4 — deliberately minimal:

app/page.tsx — the entire UI (single client component: form → loading → error/results)
app/api/analyze/route.ts — the entire backend, one POST route
app/types.ts — shared request/response types
No database, no auth, no other routes/pages — fully stateless
Backend detail
The API route calls Anthropic's REST API directly via raw fetch (no SDK dependency), with notably thorough error handling — distinct failure paths for missing API key, bad input, network failure, upstream non-2xx, malformed JSON, missing content, and wrong response shape.

Testing & CI
Vitest suite (5 tests) covering the API route's main branches, mocking fetch
GitHub Actions CI: lint → test → build on push/PR to main
No frontend tests, no .env.example (README documents ANTHROPIC_API_KEY instead)
Known gaps (not flagged as TODO, just genuinely absent)
No rate limiting — anyone hitting the API burns the configured key
No streaming, no client-side input length limits
Model name (claude-haiku-4-5) hardcoded, not env-configurable
Doesn't validate the shape of individual bullet results from the model, only that results is an array
Notable environment note
AGENTS.md explicitly flags this as a non-standard Next.js build with breaking changes vs. training data, instructing that node_modules/next/dist/docs/ be checked before writing new code — worth keeping in mind for any future work here.

Bottom line: it does exactly what it says, cleanly, with decent error handling and a real (if thin) test/CI setup. The main things missing if you wanted to harden it further are rate limiting, output validation, and configurability — none are broken, just absent.
