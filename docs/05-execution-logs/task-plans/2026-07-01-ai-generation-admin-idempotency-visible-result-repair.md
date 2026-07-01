# AI generation admin idempotency and visible result repair

## Scope

Task id: `ai-generation-admin-idempotency-visible-result-repair-2026-07-01`.

This task fixes the first source-level batch after the resource-grounded provider sample. It is source and focused-test only: no database connection or mutation, no schema or migration, no seed, no package or lockfile changes, no `.env*` access, no browser runtime, and no Provider call.

## Norms read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack.md`
- `docs/02-architecture/adr/adr-002-layered-architecture.md`
- `docs/02-architecture/adr/adr-003-desktop-web-architecture.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-runtime-config.md`
- `docs/02-architecture/adr/adr-005-staging-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-dependency-alignment-and-governance.md`
- `docs/02-architecture/adr/adr-007-standard-advanced-edition-authorization-boundary.md`

## Cross-role scan gate

The following shared surfaces must be covered before implementation is considered complete:

| Role surface                                     | Entry                                  | Shared code path                                                                                       |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| content admin AI question                        | `/content/ai-question-generation`      | `AdminAiGenerationEntryPage`, admin local contract route                                               |
| content admin AI paper                           | `/content/ai-paper-generation`         | `AdminAiGenerationEntryPage`, admin local contract route                                               |
| organization advanced admin AI question          | `/organization/ai-question-generation` | `AdminAiGenerationEntryPage`, admin local contract route                                               |
| organization advanced admin AI paper             | `/organization/ai-paper-generation`    | `AdminAiGenerationEntryPage`, admin local contract route                                               |
| personal advanced student AI question/paper      | `/ai-generation`                       | `StudentPersonalAiGenerationPage`, personal AI route contracts                                         |
| organization advanced employee AI question/paper | `/ai-generation`                       | `StudentPersonalAiGenerationPage`, personal AI route contracts with organization authorization context |

Two cross-cutting issues are mandatory scope:

1. Resource/RAG grounding: generated content must not be treated as valid when the current request has absent, stale, or mismatched evidence. This task repairs the known stale admin result path; deeper retrieval quality work remains separate if focused tests show a different retrieval root cause.
2. Product UI wording: ordinary users and operators must not see internal governance wording such as local contract, redaction status, raw evidence field names, or persistence implementation terms.

## Known root causes

- `ADMIN-AI-IDEMPOTENCY-01`: Admin task public id and idempotency key are actor/function singletons, so later requests can reuse old task/result state.
- `ADMIN-AI-EVIDENCE-01`: A provider-succeeded request can still display stale `none/0` evidence after result reuse.
- `ADMIN-AI-PAPER-VISIBLE-01`: AI paper generation can execute but fail to leave a clear structured preview in the ordinary UI.
- `PRODUCT-UI-GOVERNANCE-01`: ordinary AI UI still contains technical/governance labels.
- `AI-GENERATION-RAG-SCOPE-01`: validation must distinguish resource-grounded generation from generic model completion.

## Implementation plan

1. Add failing focused tests for admin per-request task/result identity and evidence propagation.
2. Add focused UI tests proving ordinary admin/student AI surfaces do not render governance wording and still show business labels.
3. Implement the smallest shared service fix: each admin generation request receives a unique task/idempotency scope unless the caller provides an explicit retry key in a future task.
4. Keep result persistence idempotent for the exact task only, so stale actor-level results cannot be reused.
5. Replace ordinary UI wording with business language; leave audit/governance terms out of normal pages.
6. Run focused tests, lint, typecheck, diff check, Module Run v2 gates, then commit, merge, push, and clean branch under the existing approval.

## Validation commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-admin-idempotency-visible-result-repair.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-admin-idempotency-visible-result-repair.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-admin-idempotency-visible-result-repair.md src/server/services/admin-ai-generation-local-contract-route.ts src/server/repositories/admin-ai-generation-task-persistence-repository.ts src/server/repositories/admin-ai-generation-result-persistence-repository.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-admin-idempotency-visible-result-repair-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-admin-idempotency-visible-result-repair-2026-07-01 -SkipRemoteAheadCheck`

## Evidence boundary

Evidence records only file names, route labels, role-surface labels, pass/fail status, counts, and redacted summaries. It must not include credentials, `.env*` values, DB rows, internal numeric ids, raw prompt, Provider payload, raw AI output, or full generated/question/material/resource/chunk content.
