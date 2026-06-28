# Local Full Loop Acceleration Planning State Queue Plan

## Task

- Task id: `local-full-loop-acceleration-planning-state-queue-2026-06-28`
- Branch: `codex/local-full-loop-acceleration-20260628`
- Task kind: `docs_state_queue_sprint_planning`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user fresh approval on 2026-06-28 to start the local full-loop acceleration sprint and to perform
  local commit, fast-forward merge to `master`, push to `origin/master`, and short branch cleanup after each validated
  independent task.
- For agentic workers: this task only seeds and closes the planning/state/queue work. Runtime, DB, Provider, browser,
  and source implementation are delegated to the newly queued successor tasks.

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
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `docs/01-requirements/traceability/2026-06-28-organization-workspace-ux-local-closure-rollup.md`
- `docs/01-requirements/traceability/2026-06-28-high-risk-gate-decision-approval-package-after-organization-workspace-ux.md`
- `docs/01-requirements/traceability/2026-06-28-organization-auth-test-owned-db-schema-alignment-execution.md`

## Requirement Decision Map

| Decision area            | Active rule for this sprint                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Local full loop priority | Prefer localhost/127.0.0.1, local DB, and role-visible interaction over docs-only or UI polish tasks.                                          |
| Role coverage            | The local loop must cover `student`, `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `employee`.                 |
| Authorization            | Use edition-aware source of truth from ADR-007. UI visibility is not an authorization boundary.                                                |
| Knowledge and RAG        | Validate knowledge node/resource/knowledge base maintenance and retrieval with redacted local evidence.                                        |
| AI generation            | Personal/content/organization generation may smoke locally with Provider only when task-specific redaction and local-only constraints apply.   |
| Formal adoption          | Generated AI content must not directly write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.            |
| Student experience       | Answering, AI scoring, AI explanation, AI hint, mistake-book/report behavior stay local and redacted.                                          |
| Organization experience  | Organization training, analytics, and organization AI generation are separate from formal mock exams and must redact employee subjective data. |
| Cost Calibration         | Cost Calibration Gate remains blocked. No pricing, quota default, release readiness, or final Pass decision is allowed.                        |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-test-owned-db-schema-alignment-execution.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-local-closure-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-28-high-risk-gate-decision-approval-package-after-organization-workspace-ux.md`

These execution logs are historical evidence only. Requirement authority remains with the SSOT files above.

## Conflict Check

No executable pending task exists in `task-queue.yaml`. Existing active items are blocked by staging, approval, or older
standard-role acceptance gates and must not be treated as the next local implementation task. The local DB was recently
aligned for `org_auth.edition` and `auth_upgrade`, so the sprint can begin with local role/account/authorization/DB
baseline verification before expanding into knowledge, AI generation, student answering, and organization flows.

## Allowed Scope

- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create traceability, task-plan, evidence, audit-review, and acceptance files for this planning/state/queue task.
- Seed successor tasks for the local full-loop sprint with explicit allowed files, blocked files, capability boundaries,
  validation expectations, evidence paths, and closeout policy.
- Run scoped Prettier, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2 state/queue hardening gates.
- Commit locally, fast-forward merge to `master`, push `origin/master`, and delete the short branch after validation.

## Blocked Scope

- No source, test, e2e, script, schema, migration, seed, package, lockfile, or `.env*` change in this planning task.
- No dev server, browser, e2e runtime, DB connection, DB mutation, or Provider call in this planning task.
- No staging/prod/deploy.
- No payment, OCR, export, or external-service action.
- No PR and no force push.
- No `drizzle-kit push`.
- No release readiness or final Pass claim.
- No Cost Calibration, pricing decision, quota default decision, or Provider cost decision.
- No evidence containing credentials, connection strings, secrets, tokens, cookies, localStorage, Authorization headers,
  raw DB rows, internal ids, user email or phone, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider
  payloads, prompts, raw AI output, employee subjective answers, or complete `question` or `paper` content.

## Implementation Approach

1. Insert `local-full-loop-acceleration-planning-state-queue-2026-06-28` at the top of the active queue and close it
   after evidence/audit/acceptance are written.
2. Seed the following serial successor tasks as the new local-first pending queue:
   - `local-full-loop-baseline-accounts-auth-db-2026-06-28`
   - `local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28`
   - `local-full-loop-ai-generation-paper-provider-smoke-2026-06-28`
   - `local-full-loop-student-answer-ai-explanation-smoke-2026-06-28`
   - `local-full-loop-organization-training-analytics-ai-generation-role-flow-2026-06-28`
   - `local-full-loop-rollup-evidence-2026-06-28`
3. Update `project-state.yaml` to make the sprint and first successor task discoverable after this planning task closes.
4. Record a traceability map from the successor tasks to user/auth, question-paper, student experience, AI scoring,
   RAG, admin ops, advanced AI generation, organization training, organization analytics, and organization AI generation.
5. Write redacted evidence, self-audit, and acceptance files for this planning task.
6. Run scoped formatting and Module Run v2 hardening/readiness gates.
7. Close out through the approved local commit, fast-forward merge, push, and branch cleanup.

## Risk Defenses

- Keep this task docs/state-only so runtime validation is not blended with queue creation.
- Preserve existing blocked tasks; do not silently unblock staging, release, Cost Calibration, payment, OCR/export, PR,
  force-push, or production-like work.
- Make Provider successor task local smoke only, with redacted metadata evidence and no prompt/payload/raw output.
- Make browser successor tasks localhost/127.0.0.1 only, with no screenshots, traces, raw DOM, cookies, localStorage, or
  credentials in evidence.
- Make DB successor tasks local Docker/dev target only and stop before shared/prod destructive work.
- Forbid package, lockfile, and `.env*` changes across the seeded successor tasks unless a later fresh approval says
  otherwise.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-acceleration-planning-state-queue-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-acceleration-planning-state-queue-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- A change would require `package.json`, a lockfile, `.env*`, schema/migration/source/test/e2e/script mutation in this
  planning task.
- A successor task cannot be expressed with clear local-only capabilities and redaction boundaries.
- Any validation gate detects sensitive evidence, missing task anchors, forbidden terminology, or ambiguous git state.
- Any step would require staging/prod/deploy, Cost Calibration, payment, OCR/export, external service, PR, or force push.
