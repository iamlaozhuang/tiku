# Learner Org Employee AI Runtime Login Prompt Residual Repair Plan

Task id: learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25

Branch: codex/ai-runtime-login-prompt-20260625

Status: completed

## Inputs Read

- AGENTS.md
- docs/04-agent-system/operating-manual.md
- docs/04-agent-system/sop/requirement-ssot-reading-governance.md
- docs/04-agent-system/sop/task-lifecycle-governance.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/
- docs/01-requirements/00-index.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md
- docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md

## Scope Decision

The 2026-06-25 full eight-row browser rerun kept four authenticated learner and organization employee rows blocked on direct personal AI generation routes showing the login prompt. Source review found the route-level resolver for request and result history reads only the `Authorization` header. Browser sessions can be cookie-backed, and peer runtime routes already use `getRequestAuthorization(request)` to normalize explicit bearer headers and the `tiku_session` cookie.

Selected minimum repair:

- Normalize personal AI generation request route user resolution through `getRequestAuthorization(request)`.
- Normalize personal AI generation result route user resolution through `getRequestAuthorization(request)`.
- Add focused unit coverage for cookie-backed session resolution without exposing session material.

## Allowed Files

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md
- docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md
- src/server/services/personal-ai-generation-request-route.ts
- src/server/services/personal-ai-generation-request-route.test.ts
- src/server/services/personal-ai-generation-result-route.ts
- src/server/services/personal-ai-generation-result-route.test.ts

## Blocked Scope

- Browser runtime, e2e, dev-server/browser rerun
- Reading or entering credentials for this task
- `.env*`
- DB, seed, schema, migration, account mutation
- Provider, Cost Calibration, staging/prod, payment, external service
- Dependency, package, or lockfile changes
- PR creation, force push, deployment
- Standard/Advanced MVP final Pass claim

## TDD Plan

1. Add failing unit tests proving both route resolvers accept cookie-backed sessions when no `Authorization` header is present.
2. Run the focused route unit tests and record the RED failure.
3. Apply the smallest production change: use `getRequestAuthorization(request)` in the two resolvers.
4. Re-run focused unit tests, lint, typecheck, prettier, diff check, Module Run v2 hardening, and pre-push readiness.
5. Update evidence and audit-review before commit/merge/push/cleanup.

## Validation Commands

- npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts
- npm.cmd run lint
- npm.cmd run typecheck
- npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.ts src/server/services/personal-ai-generation-result-route.test.ts
- npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-login-prompt-residual-repair.md src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.ts src/server/services/personal-ai-generation-result-route.test.ts
- git diff --check
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25
- powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25 -SkipRemoteAheadCheck

## Risk Controls

- No route shape or API response format changes.
- No session token or cookie value is written to evidence.
- No browser acceptance rerun is executed in this task.
- Result can only close the source-level residual covered by focused tests; the full eight-row runtime gate remains blocked until a separately approved browser rerun passes.
