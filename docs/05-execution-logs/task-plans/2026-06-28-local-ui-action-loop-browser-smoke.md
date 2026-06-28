# 2026-06-28 Local UI Action Loop Browser Smoke Task Plan

- Task id: `local-ui-action-loop-browser-smoke-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-ui-action-loop-browser-smoke-20260628`
- Local target: `localhost:3000` / `127.0.0.1:3000`
- Approval source: current user approved execution after the recommended next step.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- AI generation, RAG, authorization, organization training, student experience, analytics, organization AI generation requirements and traceability documents.
- Browser validation and frontend debugging skill instructions for localhost UI runtime checks.

## Target Flow

The flow under test is: role-separated localhost login -> target role surface -> one safe UI action or boundary check -> rendered state remains nonblank, authorized, and free of framework/runtime error overlays.

## Requirement Decision Map

| Requirement area           | Local UI smoke target                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-role local loop      | Run browser UI checks for `student`, `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `employee`.                              |
| Student experience         | Exercise a safe student UI action surface such as mistake_book/practice navigation or explanation affordance availability without recording answer content. |
| Content AI generation      | Submit provider-disabled/local-contract AI question and paper generation UI actions where the route permits it, recording only status markers.              |
| Organization AI generation | Exercise advanced organization AI generation UI action and standard organization unavailable boundary.                                                      |
| Organization training      | Exercise advanced admin and employee organization training UI routes and safe action/boundary states without recording training content.                    |
| Analytics                  | Exercise organization analytics summary load action for advanced admin and standard unavailable boundary for standard admin.                                |
| Authorization              | Verify role-separated browser sessions do not collapse into permission-denied or login states.                                                              |
| Evidence safety            | Persist redacted role/action/status evidence only.                                                                                                          |

## Implementation Plan

1. Materialize this task in `project-state.yaml` and `task-queue.yaml` with local browser, localhost dev server reuse, local private credential input, and existing local e2e validation explicitly scoped.
2. Connect to the in-app browser and reuse the existing localhost dev server.
3. Read local private acceptance credentials only as input for localhost login; never write credential values to terminal, docs, evidence, browser logs, or commits.
4. Execute a role-separated browser smoke:
   - `student`: login and exercise a safe student interaction surface.
   - `content_admin`: login and exercise content AI question/paper local-contract submit where available.
   - `ops_admin`: login and exercise a read-only ops surface action or render check.
   - `org_standard_admin`: login and verify advanced-only organization routes render standard-unavailable boundaries.
   - `org_advanced_admin`: login and exercise organization training/analytics/AI generation action surfaces.
   - `employee`: login and exercise organization training entry/read action surface.
5. Record only aggregate role/action results, counts, command statuses, and blocked-gate preservation.
6. Run focused existing local validation plus scoped formatting, lint/typecheck, diff check, project status, and Module Run v2 gates.
7. If validation passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Risk Defense

- No Cost Calibration, pricing, quota default decision, release readiness, or final Pass.
- No staging/prod/deploy, payment/OCR/export, PR, force push, or external-service execution.
- No package/lockfile or `.env*` change.
- No schema/migration, `drizzle-kit push`, destructive DB operation, or shared/production database target.
- No Provider payload, prompt, raw AI output, raw DOM, screenshot, trace, credential, token, cookie, localStorage, Authorization header, DB row, internal id, email/phone, plaintext redeem_code, employee subjective answer, or full question/paper/resource/chunk content in evidence.
- If a product defect is discovered, stop after recording a redacted blocker unless it is safely repairable within the task's allowed files and fresh scope.

## Validation Plan

- In-app browser local UI action smoke against `localhost:3000` / `127.0.0.1:3000`, redacted role/action/status summary only.
- Existing local e2e focused smoke:

```powershell
$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-baseline-accounts-auth-db.spec.ts e2e/local-full-loop-student-answer-ai-explanation-smoke.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line
```

- `npx.cmd prettier --write --ignore-unknown` on scoped docs/state files.
- `npx.cmd prettier --check --ignore-unknown` on scoped docs/state files.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-ui-action-loop-browser-smoke-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-ui-action-loop-browser-smoke-2026-06-28 -SkipRemoteAheadCheck`
