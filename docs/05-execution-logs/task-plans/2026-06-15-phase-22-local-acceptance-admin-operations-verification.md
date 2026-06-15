# Task Plan: Phase 22 Admin Operations Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-admin-operations-verification`
- Branch: `codex/phase-22-local-acceptance-admin-operations-verification`
- Baseline: `10506150fceaf03e2eabfbbd998ca88d230376ae`
- Journey: `admin_operations`
- Target entities: `user`, `organization`, `employee`, `org_auth`, `redeem_code`, `resource`, `knowledge_base`, `model_config`, `audit_log`, `ai_call_log`

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
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-mistake-learning-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-mistake-learning-verification.md`

## Fresh Approval

The user approved v7 for this task only:

- Claim `phase-22-local-acceptance-admin-operations-verification`.
- Verify only non-provider, non-external-service, non-real-resource-transfer admin operations.
- Use localhost or `127.0.0.1` local dev server, Browser or Playwright local observation, app UI/API, and existing runtime/ORM paths for minimal local fixtures when needed.
- Do not read, output, summarize, or modify `.env*`; if a process uses the existing runtime/env loader for local `DATABASE_URL`, the value must stay in process and out of evidence.
- Keep provider/model calls, provider configuration, quota/cost measurement, Cost Calibration Gate, source/test/e2e/schema/drizzle/scripts/package/lockfile changes, raw SQL, seed/bootstrap scripts, destructive DB operations, staging/prod/cloud/deploy/payment/external-service, PR, and force push blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-admin-operations-verification.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-admin-operations-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-admin-operations-verification.md`

## Verification Plan

1. Reconfirm clean branch, master/origin alignment, and no local or remote `codex/*` residue before claim.
2. Start local dev server only on `localhost` or `127.0.0.1` if not already available.
3. Create or reuse minimal synthetic local admin fixtures through existing runtime/ORM or application API only. Keep generated credentials, tokens, cookies, headers, DB URL, public identifiers, card-code plaintext, row data, and private data out of output and evidence.
4. Verify local admin API/UI behavior for `user`, `organization`, `employee`, `org_auth`, and `redeem_code` where safe.
5. Observe `resource`, `knowledge_base`, `model_config`, `audit_log`, and `ai_call_log` only as metadata or governance surfaces. Do not upload files, rebuild vectors, call providers, inspect raw prompt/answer payloads, or measure cost/quota.
6. Record precise status labels:
   - `local_verified` only for covered local UI/API behavior.
   - `metadata_only` for metadata/governance surfaces without external object storage, provider, vector rebuild, raw payload, or cloud validation.
   - `deferred` or `needs_recheck` where v7 blocks full verification.
7. Write redacted evidence and audit review.
8. Run `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
9. If all gates pass, create one local commit, fast-forward merge to `master`, re-run necessary gates on `master`, push `origin/master`, delete the merged local branch, fetch prune, and confirm clean alignment.

## Stop Conditions

- Current task needs any blocked file.
- Verification requires `.env*` inspection/modification, provider/model call, provider config, quota/cost measurement, Cost Calibration Gate, source/test/e2e/schema/drizzle/scripts/package/lockfile change, raw SQL, seed/bootstrap script, destructive DB operation, real resource transfer, external object storage, vector rebuild/full indexing, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- Evidence cannot be redacted without leaking credentials, token/cookie/header values, DB URL, card-code plaintext, public identifiers, row data, private data, provider payloads, raw prompts, or raw answers.
- Local verification fails and cannot be represented honestly inside the allowed docs-only status vocabulary.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-admin-operations-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-admin-operations-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-admin-operations-verification`
