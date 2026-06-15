# Task Plan: Phase 22 Security Evidence Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-security-evidence-verification`
- Branch: `codex/phase-22-local-acceptance-security-evidence-verification`
- Baseline: `cf5a0395e41449688cfb3f5ea71aea86a2f3bfa7`
- Journey: `security_and_evidence`
- Target entities: `audit_log`, `ai_call_log`, `session`, `authorization`, `user`, `model_config`

## Inputs Re-Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-admin-operations-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-admin-operations-verification.md`

## Fresh Approval

The user approved Phase 22 task 6 only:

- Claim `phase-22-local-acceptance-security-evidence-verification`.
- Verify only narrow local security evidence for session route guard, role denial, authorization boundary, public identifier safety, audit_log redaction, ai_call_log redaction, and model_config metadata-only.
- Use localhost or `127.0.0.1` local dev server, Browser or Playwright local observation, and app UI/API only.
- Use existing local UI/API sessions only when they can be safely established without exposing credentials, tokens, cookies, Authorization headers, public identifiers, or row data.
- Do not read, output, summarize, or modify `.env*`.
- Keep provider/model calls, provider payloads, raw prompt/raw answer capture, quota/cost measurement, Cost Calibration Gate, source/test/e2e/schema/drizzle/scripts/package/lockfile changes, dependency changes, raw SQL, migration, seed/bootstrap, destructive DB operations, staging/prod/cloud/deploy/payment/external-service, PR, and force push blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-security-evidence-verification.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-security-evidence-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-security-evidence-verification.md`

## Verification Plan

1. Reconfirm branch isolation, master/origin alignment, clean worktree, and no local or remote `codex/*` residue before claim.
2. Start local dev server only on `localhost` or `127.0.0.1` if not already available.
3. Verify unauthenticated session guard through local app API and/or UI observation.
4. Establish a minimal local user session through public UI/API only if available without secret disclosure.
5. Verify normal-user role denial on admin/security evidence surfaces such as audit_log, ai_call_log, model_config, and admin user routes.
6. Verify authorization boundary behavior through local app API without recording dynamic identifiers or row data.
7. Treat audit_log and ai_call_log redaction as evidence-bound: if an admin session is unavailable without direct DB fixture or secret/env access, record non-admin denial as local evidence and mark redaction inspection as `needs_recheck`.
8. Treat model_config as `metadata_only` or `needs_recheck`; do not mutate provider configuration, call providers, or measure quota/cost.
9. Write redacted evidence and audit review.
10. Run `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
11. If gates pass, create one local commit, fast-forward merge to `master`, re-run necessary gates on `master`, push `origin/master`, delete the merged local branch, fetch prune, and confirm clean alignment.

## Stop Conditions

- Current task needs any blocked file.
- A required role can only be established by reading `.env*`, direct DB fixture, raw SQL, seed/bootstrap, migration, or destructive DB operation.
- Verification requires provider/model calls, provider payloads, raw prompts, raw answers, quota/cost measurement, Cost Calibration Gate, source/test/e2e/schema/drizzle/scripts/package/lockfile changes, dependency changes, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- Evidence cannot be redacted without leaking secrets, tokens, cookies, Authorization headers, DB URL, provider payloads, raw prompts, raw answers, public identifiers, row data, or private data.
- Local verification fails and cannot be represented honestly inside the approved status vocabulary.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-security-evidence-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-security-evidence-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-security-evidence-verification`
