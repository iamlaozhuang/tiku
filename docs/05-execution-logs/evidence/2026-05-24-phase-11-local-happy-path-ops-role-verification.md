# Evidence: phase-11-local-happy-path-ops-role-verification

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-local-happy-path-ops-role-verification`
- Goal: verify local `system ops`, `content ops`, and student-associated happy path behavior before any Tencent Cloud, preview, staging, prod, deployment, secret/env, dependency, schema, migration, or script work resumes.

## Boundary

- No runtime source code changed.
- No dependency, package, or lockfile changed.
- No schema, migration, or script changed.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No provider call.
- No secret/env change.
- No plaintext `redeem_code` value recorded.

## Recovery And Claim

```text
git status --short --branch
Result: branch codex/phase-11-local-happy-path-ops-role-verification, modified docs/state and new task docs only.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-ops-role-verification
Result: task claim readiness passed while the task was pending.
```

## Local Role Experience Path Planning

See `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-local-happy-path-ops-role-verification.md`.

## Verification Record

### Environment

- Base URL: `http://127.0.0.1:3000`
- Browser path: Codex in-app browser.
- Docker: local `tiku-postgres-dev` was healthy.
- Dev server: already running and responding on `127.0.0.1:3000`.
- Screenshot capture: intentionally not saved into the repository. A first attempt to save screenshots outside the repo was blocked by local file permissions; evidence remains route/state-level to avoid recording full seeded content.

### Commands And Browser Checks

```text
docker compose ps
Result: tiku-postgres-dev Up, healthy, 127.0.0.1:5432->5432/tcp

Invoke-WebRequest http://127.0.0.1:3000/login
Result: 200

npm.cmd run test:e2e -- --grep "staging required role flows|student practice mock entry|content action closures|admin audit navigation"
Result: 4 passed

npm.cmd run test:unit -- --run tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts
Result: 8 files passed, 55 tests passed

npm.cmd run test:e2e -- --grep "local auth route guards"
Result: 3 passed
```

In-app browser route checks:

- `/ops/users`: rendered with operations filters, user management, org_auth, redeem_code, audit_log, and ai_call_log panels.
- `/ops/organizations`: rendered with organization, org_auth, status/hierarchy, and `新增企业授权` entry.
- `/ops/redeem-codes`: rendered with masked redeem_code management and generation entry; no plaintext card value was rendered or recorded.
- `/ops/ai-audit-logs`: rendered combined audit_log and ai_call_log read-only sections.
- `/content/questions`: rendered content ops required arrangement and explicit unavailable write-action state.
- `/content/materials`: rendered content ops required arrangement and explicit unavailable write-action state.
- `/content/papers`: rendered content ops required arrangement and explicit unavailable write-action state.
- `/content/knowledge-nodes`: rendered content ops required arrangement and `新增节点` entry.
- `/ops/resources`: rendered RAG/resource entry with status controls.
- `/home`: rendered student practice and mock_exam entries.
- `/practice?paperPublicId=paper-dev-theory`: rendered objective options and restart control; after restart, selecting an option and submitting showed answer feedback.
- `/mock-exam?paperPublicId=paper-dev-theory`: rendered objective options; selecting an option and saving showed a saved-answer state; submit remained available.
- `/profile`: rendered `退出登录`.

Browser console health:

- Relevant warn/error count: 0 during the final browser summary pass.

## Validation Results

```text
Select-String -Path 'docs\05-execution-logs\audits-reviews\2026-05-24-phase-11-local-happy-path-ops-role-verification.md' -Pattern 'system ops|content ops|student|P0|P1|P2|P3|stagingDecision'
Result: passed; required planning, findings, severity, and stagingDecision terms are present.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: passed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: naming convention scan completed; banned terms absent, risky generic terms absent, API route folder case passed, API contract DTO field case passed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: inventory completed; changed files are limited to this planning/verification task scope.

First powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: failed only on format:check for two newly added Markdown files. lint, typecheck, and all unit tests passed before the formatting failure.

node .\node_modules\prettier\bin\prettier.cjs --write docs\05-execution-logs\audits-reviews\2026-05-24-phase-11-local-happy-path-ops-role-verification.md docs\05-execution-logs\evidence\2026-05-24-phase-11-local-happy-path-ops-role-verification.md
Result: passed after sandbox escalation because local sandbox could not read node_modules. Only this task's two Markdown files were formatted.

Second powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: passed.
- lint: passed.
- typecheck: passed.
- test:unit: 107 files passed, 395 tests passed.
- format:check: passed.

npm.cmd run format:check
Result: passed after sandbox escalation for the same node_modules read permission issue; all matched files use Prettier style.
```

## Findings

| id            | severity                                                                                                       | role                 | result                                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPS-HVP-001` | `P1` for full fresh redeem_code local happy path; `P2` if first staging keeps redeem_code lifecycle read-heavy | system ops, student  | Local system ops still cannot provide a safe student-facing plaintext redeem_code source under current approved boundaries. Do not fake this closure. |
| `OPS-HVP-002` | `P2`                                                                                                           | student, error-state | Missing-object student deep links still need explicit not-found/recovery copy before broader UAT.                                                     |
| `OPS-HVP-003` | `P3`                                                                                                           | system ops           | Direct `/ops/audit-logs` is not a standalone route; audit_log and ai_call_log are available through `/ops/ai-audit-logs`.                             |

No new P0 issue was found. No new P1 code defect was found in the already-approved local role experience surfaces.

## Staging Decision

`stagingDecision`: `local_ops_role_verification_pass_with_named_limitations`

Reason: system ops and content ops pass local read/entry validation, and student practice/mock_exam/profile regressions remain fixed. Full fresh redeem_code generation/redemption and missing-object student error states remain named limitations requiring separate follow-up tasks.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, plaintext `redeem_code` values, and customer/private data.
