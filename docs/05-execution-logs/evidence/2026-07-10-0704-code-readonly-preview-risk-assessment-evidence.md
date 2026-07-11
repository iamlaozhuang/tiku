# 2026-07-10 0704 Code Readonly Preview Risk Assessment Evidence

## Scope

- taskId: `0704-code-readonly-preview-risk-assessment-2026-07-10`
- branch: `codex/0704-code-readonly-preview-risk-assessment`
- evidenceMode: redacted file path, code symbol, status category, command result, and test count only
- privateCredentialUse: not used
- envSecretRead: not executed
- directDatabaseConnection: not executed
- browserRuntime: not executed
- ProviderExecution: not executed
- stagingProdDeploy: not executed

## Restore And Reading

Read or rechecked:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-localhost-acceptance-summary-archive.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-project-reality-preview-readiness-assessment.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-staging-readiness-design.md`

## Git Baseline

- startBranch: `codex/0704-code-readonly-preview-risk-assessment`
- startSha: `ac0169d946f602441024810daa380df0b6fdfbfd`
- startOriginMasterSha: `ac0169d946f602441024810daa380df0b6fdfbfd`
- startStatus: only this task plan existed as an untracked docs file before state/queue updates

## Code Inventory

| Surface                   | Count |
| ------------------------- | ----: |
| `src/app/api/v1`          |   125 |
| `src/server/services`     |   285 |
| `src/server/repositories` |    68 |
| `src/server/contracts`    |   108 |
| `src/server/validators`   |   141 |
| `src/server/mappers`      |    40 |
| `src/features`            |    28 |
| `tests`                   |   112 |
| `scripts`                 |   128 |
| source/test test files    |   349 |

## Source Inspection Summary

Only file paths, code symbols, and status categories were retained in evidence. Raw question, paper, material, resource, chunk, raw AI output, raw prompt, DB row, credential, session, cookie, token, env value, and internal id content were not recorded.

| Area                       | Command category               | Result category |
| -------------------------- | ------------------------------ | --------------- |
| Authorization / edition    | targeted `rg` code-symbol scan | pass            |
| Organization/multitenancy  | targeted `rg` code-symbol scan | pass            |
| AI/RAG / Provider controls | targeted `rg` code-symbol scan | defer_finding   |
| Logs / privacy             | targeted `rg` code-symbol scan | pass            |
| API response contract      | targeted `rg` code-symbol scan | pass            |
| Validators/input safety    | targeted `rg` code-symbol scan | pass            |
| Config/script risk         | targeted `rg` code-symbol scan | defer_finding   |
| Frontend states            | targeted `rg` code-symbol scan | pass            |

Key code anchors retained:

- `src/server/services/effective-authorization-service.ts`
- `src/server/services/edition-aware-authorization-service.ts`
- `src/server/services/organization-auth-service.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- `src/server/contracts/api-response.ts`
- `src/server/services/route-error-response.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/app/api/v1/content-ai-generation-requests/route.ts`
- `src/app/api/v1/organization-ai-generation-requests/route.ts`

## Targeted Tests

Command category:

```text
corepack pnpm@10.26.1 exec vitest run TARGETED_CODE_RISK_TEST_FILES
```

Result:

```text
Test Files 30 passed
Tests 298 passed
```

Targeted coverage areas:

- authorization and edition boundary
- organization authorization lifecycle
- admin workspace route guard
- organization training and employee/admin surfaces
- organization analytics and privacy summaries
- personal AI request/result/history/learning session paths
- AI runtime bridge and Provider redaction
- audit and AI call log references
- RAG validator/mapper behavior
- owner-preview runtime control behavior
- admin content/resource/RAG management baseline

## Finding Evidence

`CR-001_provider_env_governance_default_route_wiring`

- status: `defer_finding`
- observed via read-only source inspection
- affected route labels:
  - `personal-ai-generation-requests`
  - `content-ai-generation-requests`
  - `organization-ai-generation-requests`
- affected code symbol: owner-preview runtime bridge control
- sensitive material recorded: none
- Provider executed: no
- env values read: no

## Closeout Gate Results

| Gate                                      | Result |
| ----------------------------------------- | ------ |
| targeted vitest                           | pass   |
| scoped prettier write/check               | pass   |
| lint                                      | pass   |
| typecheck                                 | pass   |
| `git diff --check`                        | pass   |
| Module Run v2 pre-commit hardening        | pass   |
| Module Run v2 pre-push readiness          | pass   |
| sensitive evidence redaction spot-check   | pass   |
| product code/test/package/schema changes  | none   |
| browser/DB/Provider/staging/prod executed | none   |
