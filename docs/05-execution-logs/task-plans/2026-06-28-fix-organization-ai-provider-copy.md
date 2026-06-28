# 2026-06-28 Fix Organization AI Provider Copy

## Goal

Repair organization AI owner-facing pages so the visible copy does not expose Provider-facing implementation language while preserving redacted evidence states and without executing AI/Provider calls.

## Materialized Authorization

- Approved task: `fix-organization-ai-provider-copy-2026-06-28`.
- Approval source: inherited full acceptance goal and per-task closeout authorization from the current user on 2026-06-28.
- Closeout authorization: local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup are approved for this task only.
- Branch: `codex/fix-organization-ai-provider-copy-20260628`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-28-fix-organization-ai-provider-copy.md`
- `docs/05-execution-logs/evidence/2026-06-28-fix-organization-ai-provider-copy.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-fix-organization-ai-provider-copy.md`
- `docs/05-execution-logs/acceptance/2026-06-28-fix-organization-ai-provider-copy.md`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/organization-ai-generation/**`
- `src/app/(admin)/organization/**`
- `tests/unit/**`

## Blocked Files And Capabilities

- No `.env*`, package/lockfile, schema, migration, seed, AI/RAG/server provider directory, Playwright artifacts, `.next`, or local private resource changes.
- No direct database connection, read/write, migration, seed, schema change, or destructive operation.
- No Provider call, Provider configuration, Provider credential read, prompt capture, provider payload capture, raw AI input/output capture, or Cost Calibration Gate.
- No account credential, session, cookie, token, localStorage, Authorization header, or secret capture.
- No dependency introduction, deployment, PR, force push, release readiness claim, or final Pass claim.

## Evidence Redaction

Allowed evidence: command names, pass/fail status, test counts, failure class, redacted copy-gap summary, and commit SHA.

Forbidden evidence: credentials, env file content, DB URLs, API keys, connection strings, raw DOM, screenshots, traces, HTML reports, DB rows, internal IDs, emails, phone numbers, plaintext `redeem_code`, provider payloads, prompts, raw AI input/output, and complete question/paper/material/resource/chunk content.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Implementation Plan

1. Locate owner-facing organization AI page copy and existing unit coverage.
2. Add a focused RED unit test that fails when Provider-facing implementation terms are rendered to owner-facing users.
3. Replace only owner-facing copy with product-level wording; do not change Provider runtime logic.
4. Run focused GREEN, full unit baseline, lint, typecheck, formatting, and Module Run v2 gates.
5. Record redacted evidence, acceptance summary, audit review, then commit, fast-forward merge, push, and cleanup.

## Risk Controls

- Keep the repair copy-only unless a test exposes a strictly necessary render-state adjustment.
- The actual implementation path is `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`; the originally queued organization-specific feature directory does not exist in this repository snapshot.
- Do not inspect secrets, Provider config, prompt templates, raw AI content, DB rows, or browser session state.
- Do not expand scope to unresolved acceptance matrix gaps without a new queued task.
