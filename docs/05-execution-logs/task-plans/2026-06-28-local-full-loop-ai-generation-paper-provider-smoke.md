# Local Full Loop AI Generation Paper Provider Smoke Plan

## Task

- Task id: `local-full-loop-ai-generation-paper-provider-smoke-2026-06-28`
- Branch: `codex/local-full-loop-ai-generation-20260628`
- Task kind: `implementation`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user fresh approval on 2026-06-28 for local full-loop acceleration, including local DB,
  localhost/127.0.0.1 validation, focused unit/e2e tests, redacted evidence, small real Provider local smoke when safely
  available, local commit, fast-forward merge to `master`, push to `origin/master`, and short branch cleanup.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-knowledge-rag-maintenance-smoke.md`

## Requirement Decision Map

| Decision area                 | Active rule for this task                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content admin generation      | Prove `content_admin` can request AI question and AI `paper` generation through localhost API.                                                                                                        |
| Organization admin generation | Prove `org_advanced_admin` can request organization-owned AI question and AI `paper` generation through localhost API.                                                                                |
| Standard organization denial  | Prove `org_standard_admin` cannot use organization AI generation by direct localhost API request.                                                                                                     |
| Formal content boundary       | Generated results remain isolated and do not write or publish formal `question` or `paper` records.                                                                                                   |
| Provider smoke                | Use only existing redacted Provider smoke script/service. Do not read or modify `.env*`; if current process env lacks a Provider credential, record sanitized blocked status instead of failing open. |
| Evidence                      | Record only role labels, route labels, task/result statuses, redacted counts, execution summaries, and pass/fail.                                                                                     |
| Dependencies                  | No package or lockfile changes.                                                                                                                                                                       |
| Cost Calibration              | Cost Calibration Gate remains blocked. No pricing, quota defaults, release readiness, or final Pass decision.                                                                                         |

## Implementation Plan

1. Add a scoped localhost Playwright API smoke that:
   - logs in as `content_admin`, `org_advanced_admin`, and `org_standard_admin`;
   - submits content AI `question` and AI `paper` requests;
   - submits organization AI `question` and AI `paper` requests for `org_advanced_admin`;
   - verifies direct organization AI request denial for `org_standard_admin`;
   - verifies standard API envelope, camelCase JSON, no raw `id` key, redacted runtime bridge, and formal write/publish blocks;
   - attaches only a redacted status summary.
2. Run existing focused unit coverage for admin AI generation route/runtime bridge and personal Provider bridge redaction.
3. Run the existing Provider smoke script:
   - dry-run must pass without secret access;
   - execute mode is allowed only through the explicit local execution gate and current process env, never by reading `.env*`;
   - `pass`, `fail`, or `missing_env` is recorded as a redacted Provider smoke outcome, but raw prompt, payload, credential, and output remain absent.
4. Write traceability, evidence, audit, acceptance, and state/queue closeout records.
5. Run scoped Prettier, focused unit/e2e, lint, typecheck, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2
   gates.
6. Commit locally, fast-forward merge to `master`, push `origin/master`, and clean up the short branch after gates pass.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts tests/unit/run-personal-ai-provider-smoke.test.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts --reporter=line`
- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `$env:TIKU_PROVIDER_SMOKE_APPROVED="1"; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --execute`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-ai-generation-paper-provider-smoke-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-ai-generation-paper-provider-smoke-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- Any step requires package/lockfile or `.env*` modification.
- Any step requires Provider configuration change, fallback-chain change, staging/prod/deploy, payment, OCR/export,
  external-service, PR, force push, Cost Calibration, release readiness, or final Pass.
- Evidence would require raw prompt, Provider payload, raw AI output, credential value, token, cookie, localStorage,
  Authorization header, raw DB row, internal id, user email/phone, raw DOM, screenshot, trace, employee subjective answer,
  full question content, or full paper content.
- A repair would formally write or publish AI generated output into formal `question`, `paper`, `practice`, `mock_exam`,
  `exam_report`, or `mistake_book`.
