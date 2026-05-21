# Local Business Flow Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:verification-before-completion` before any completion claim. Browser verification must follow `docs/04-agent-system/sop/automation-loop.md#browser-verification-tool-discovery`.

**Goal:** Produce local, evidence-first verification for the MVP student, admin, audit_log, and mock AI flows without feature development.

**Architecture:** This is an evidence-only verification task. Browser automation is the primary proof surface; API and database commands are supporting evidence for runtime state, persistence, and redaction checks.

**Tech Stack:** Next.js dev server, Docker PostgreSQL/pgvector, Drizzle migrations, dev seed, Playwright or Browser plugin automation, PowerShell evidence commands.

---

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-21-local-business-flow-verification.md`
- `docs/05-execution-logs/evidence/2026-05-21-local-business-flow-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `src/**`
- `drizzle/**`

No dependency changes, no business-code fixes, no remote push, no PR, no production or preview credentials.

## Verification Steps

- [ ] Confirm repository status and latest commit on `codex/local-business-flow-verification`.
- [ ] Record that no existing `pending` queue task cleanly carries this verification and use this plan as an evidence-only task.
- [ ] Run Docker/database readiness checks: `docker compose ps`, container health, pgvector extension, migration table, seed counts.
- [ ] Run Drizzle migrate and dev seed if the local database is available; record if seed is repeated or skipped with reason.
- [ ] Start the local app with `npm.cmd run dev -- --hostname 127.0.0.1`; use port `3000` unless occupied.
- [ ] Discover and use Browser plugin or Playwright for browser automation against `http://127.0.0.1:3000`.
- [ ] Verify student-facing browser-visible pages and interactions where UI exists.
- [ ] Verify admin-facing browser-visible pages and interactions where UI exists.
- [ ] Use API requests with seeded dev sessions only as auxiliary evidence for student/admin/audit/mock AI flows.
- [ ] Check `audit_log`, `ai_call_log`, and `model_config` responses for redaction of secrets, raw prompts, raw answers, session tokens, and API keys.
- [ ] Run required gates:
  - `docker compose ps`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  - `npm.cmd run build`
  - `npm.cmd run test:e2e`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- [ ] Write full findings, command results, residual risk, and coverage gaps to evidence.
- [ ] Commit only evidence/state files if validation reaches a reviewable checkpoint.
