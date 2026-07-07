# 2026-07-07 0704 DB Local Manual Role Acceptance Prep Plan

## Task

- Task id: `0704-db-local-manual-role-acceptance-prep-2026-07-07`
- Branch: `codex/0704-db-local-manual-role-acceptance-prep-2026-07-07`
- Goal: prepare a redacted localhost manual role acceptance thread for the 20260704 local DB target.

## Required Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`
- Current AI generation traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest AI generation baseline and goal completion evidence
- Latest login dev origin readiness fix evidence/audit
- Latest explicit 20260704 localhost browser replay evidence/audit
- Latest full DB-backed local runtime replay evidence/audit
- Latest post-recontract local adversarial acceptance consolidation evidence/audit
- 0704 DB/account boundary evidence, including full-chain account plan prep, 0704 DB-backed replay, org enterprise fixture materialization, no-Provider route grounding replay, and personal standard fixture acceptance evidence/audits

## Execution Boundary

- Local only.
- Use process-only DB override for the local service; do not edit `.env.local`.
- Do not output or record credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, phone, email, password, plaintext `redeem_code`, Provider payloads, prompts, raw AI output, full question/paper/material/resource/chunk content, screenshots, raw DOM, traces, or private fixture values.
- Do not run Provider-enabled flows without fresh approval.
- Do not execute staging, production, deploy, secret/env mutation, Cost Calibration, destructive DB operation, schema/migration/seed/package/lockfile changes, or dependency changes.

## Work Plan

1. Verify git and workspace state: `master` alignment, clean worktree, and current short branch.
2. Bind localhost runtime to the explicit 20260704 local DB using process-only override, then verify `/login` on `127.0.0.1:3000`.
3. Confirm the login dev-origin fix is active at loopback host without recording credentials or DOM.
4. Build a redacted account inventory for:
   - `personal_advanced_student`
   - `personal_standard_student`
   - `org_advanced_employee`
   - `org_standard_employee`
   - `org_advanced_admin`
   - `org_standard_admin`
   - `content_admin`
5. If required role material is missing, record a non-destructive 0704 fixture materialization proposal only and wait for explicit approval before any DB/private-file write.
6. Prepare the manual acceptance checklist by role, including login viability, entry routes, AI出题/AI组卷 visibility, standard denial, advanced error clarity, and content draft/review closure.
7. Write redacted evidence and adversarial audit review.
8. Run local validation gates for docs/state-only changes and record only redacted command results.

## Adversarial Checks

- Treat account fixture mismatch as fixture/config evidence, not source defect.
- Treat service DB target mismatch as environment binding issue.
- Treat stale browser session issues separately from current code.
- Open a separate fix branch only if current code defect is reproduced after fixture, DB target, and browser-state causes are excluded.
- Do not use 0601, 0623, dev seed, or historical role-separated account documents as 20260704 login evidence.

## Expected Deliverables

- This task plan.
- Redacted evidence file.
- Adversarial audit review file.
- Optional state/queue updates if validation supports closeout.
- No release readiness, production usability, staging, deploy, Provider-enabled, or Cost Calibration claim.
