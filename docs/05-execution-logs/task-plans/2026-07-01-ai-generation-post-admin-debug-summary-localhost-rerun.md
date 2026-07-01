# AI generation post admin debug summary localhost rerun plan

## Task

- Task id: `ai-generation-post-admin-debug-summary-localhost-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-admin-debug-summary-rerun`
- Scope: restart the local dev server, rerun localhost browser checks across the 8 owner preview roles for AI 出题 / AI组卷 entry surfaces, and run bounded real Provider samples only when the UI reports sufficient grounding.
- Out of scope: source/test changes, dependency/package/lockfile changes, schema/migration/seed changes, `.env*` reads/writes, staging/prod/cloud/deploy, e2e automation, Cost Calibration, release readiness, final Pass.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- All ADR files under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Execution Plan

1. Restart `http://127.0.0.1:3000` locally and confirm HTTP 200.
2. Use the in-app browser only against localhost.
3. Log in each scoped owner-preview role using local private credentials in memory only.
4. Check eligible AI 出题 / AI组卷 pages for route access, business wording, grounding status, and absence of diagnostic governance wording.
5. For ineligible roles, verify absence of submit-capable AI generation UI instead of forcing access.
6. Run Provider samples only if the page shows sufficient grounding. Evidence records only status/count/duration bucket/failure category, never prompt, Provider payload, raw AI output, or full generated content.
7. Update evidence and audit, then close with docs/state-only validation.

## Risk Controls

- No screenshots, raw DOM, traces, HTML dumps, credentials, cookies, tokens, localStorage, Authorization headers, `.env*`, raw DB rows, internal ids, PII, Provider payloads, prompts, raw AI input/output, or full question/paper/material/resource/chunk content in evidence.
- Stop if the page requires a scope not materialized here.
- Stop if a Provider result is not grounded or if UI again exposes diagnostic wording.
