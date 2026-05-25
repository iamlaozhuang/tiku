# Evidence: Phase 11 Local System Validation

## Status

`validated_with_findings`

## Scope Boundary

This task is local/dev validation only. Phase 11 staging implementation planning remains paused.

Forbidden actions not performed:

- no staging/prod connection;
- no deployment;
- no cloud resource, DNS, Tencent Cloud COS, or public object storage URL change;
- no dependency, package, lockfile, schema, migration, or script change;
- no secret value, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/customer-like private content recorded.

## Recovery Records

- Branch: `codex/phase-11-local-system-validation`.
- Started from clean `master`.
- Phase 11 pause baseline: `phase_11_paused_until_external_resources_ready`.
- External readiness from user report:
  - domain `jiandingtiku.cn` has been applied for;
  - DNS resolution is not configured;
  - ICP filing is pending;
  - cloud server has not been purchased;
  - database services have not been purchased.

## Queue And Readiness Consistency

| Check                               | Result                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `project-state.yaml` current phase  | `phase-11-staging-release-planning`                                                                                                     |
| Latest closed task in project state | `phase-11-local-validation-prompt-ai-content-update`                                                                                    |
| Handoff intent                      | next local validation from clean `master`, with controlled content-backend experience and at most five local/dev real AI provider calls |
| External readiness                  | consistent with Phase 11 pause: DNS/ICP/cloud server/database not ready                                                                 |
| Staging implementation planning     | remains paused                                                                                                                          |

## Validation Commands

| Command                                                                                                        | Result                   | Notes                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `git fetch origin`                                                                                             | pass                     | Remote refs fetched before branch creation.                                                                                                |
| `git switch -c codex/phase-11-local-system-validation`                                                         | pass                     | Created short-lived branch from clean `master`.                                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` | pass                     | Agent system required files, scripts, npm scripts, and skill availability passed.                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`        | initial fail, rerun pass | Initial fail only because this evidence Markdown needed Prettier. After formatting, lint, typecheck, `test:unit`, and format check passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`    | pass                     | Banned terms absent; API DTO fields camelCase; route folders kebab-case/public-id compliant.                                               |
| `git diff --check`                                                                                             | pass                     | No whitespace errors.                                                                                                                      |
| `npm.cmd run build`                                                                                            | pass                     | Next.js 16.2.6 build passed; 47 static pages generated; dynamic API routes listed.                                                         |
| `npm.cmd run test:e2e`                                                                                         | fail                     | 11 passed, 2 failed, 2 did not run. Failure category: local PostgreSQL connection exhaustion under default parallel workers.               |
| `npm.cmd run test:e2e -- --workers=1`                                                                          | pass                     | 15/15 E2E passed serially. Hydration mismatch warnings still appeared in web server logs.                                                  |

Unit test detail from quality gate:

- 119 test files passed.
- 449 tests passed.

## E2E Failure Detail

Default E2E command:

```powershell
npm.cmd run test:e2e
```

Observed:

- `e2e/local-business-flow.spec.ts` failed while parsing an empty JSON response.
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts` failed in Student Positive Flow while parsing an empty JSON response.
- Server log cause: PostgreSQL `53300` / `sorry, too many clients already`.
- Several protected route checks also emitted React hydration mismatch logs.

Isolation rerun:

```powershell
npm.cmd run test:e2e -- --workers=1
```

Result:

- 15/15 passed.
- This points to local parallelism/connection pool pressure rather than a deterministic business-flow break.

## Build Record

`npm.cmd run build` passed.

Important sanitized observations:

- Next build recognized `.env.local`, but no secret value was printed or recorded.
- API routes are under `/api/v1/` and use publicId route params where externally visible.
- Build did not require staging/prod, cloud, object storage, deployment, or external provider connection.

## Runtime And Product Risk Review

| Area                                        | Runtime observation                                                                                                                                                                                    | Risk                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `auth/session`                              | Login/session APIs worked in local UI/API scripts. Route guard emits hydration mismatch when server renders `checking` and client immediately becomes `unauthorized` without a local token.            | P2                                                   |
| `student practice/mock/report/mistake_book` | Serial E2E passed practice, mock_exam, exam_report, negative no-auth flow, and mistake_book visibility. Controlled wrong answer created a mistake_book item and local AI explanation returned success. | no blocker                                           |
| `content question/material/paper`           | API-backed local content creation worked for material, question, past_paper, paper_question, publish, and student practice answer. Admin content pages are runtime-backed in `src/features/admin/**`.  | no blocker                                           |
| `paper_asset`                               | Local metadata binding worked for `paper_source`; no object storage upload or public URL was created. Object key was omitted from output and evidence.                                                 | P3: metadata-only upload rehearsal, not real storage |
| `admin ops`                                 | Serial E2E passed users, orgs, redeem_code, resources, audit, AI audit navigation, and read-only guards.                                                                                               | no blocker                                           |
| `audit_log`                                 | Content/paper mutations are routed through audit appenders with redacted summaries; serial E2E and local scripts did not surface secret leakage.                                                       | no blocker                                           |
| `ai_call_log`                               | `learning_suggestion` logs are visible. Filtered runtime queries after local `kn_recommendation` and `ai_explanation` returned zero rows for those function types.                                     | P2                                                   |
| AI/RAG boundary                             | Runtime AI paths are mock/local deterministic except existing DeepSeek smoke script. No raw prompts/answers/provider payloads were recorded.                                                           | no staging blocker, real provider remains gated      |

## Manual Content-Backend Experience

Local dev server:

- started at `http://127.0.0.1:3000`;
- stopped after validation;
- no secret output recorded.

Controlled local content created through the local backend:

| Step                                 | Result | Public/local reference                                |
| ------------------------------------ | ------ | ----------------------------------------------------- |
| Create material                      | pass   | `material-de5f575c-2a53-4817-ba1c-61e11b1aa1a4`       |
| Create question referencing material | pass   | `question-ed47bffb-d044-4672-a6a0-17a830365518`       |
| Create `past_paper`                  | pass   | `paper-720f90e5-141a-4659-8398-ccd2d510338b`          |
| Add question to paper                | pass   | `paper-question-92f220ff-d99c-4d0f-9e1f-c6df866ea3c4` |
| Bind paper source asset metadata     | pass   | `paper-asset-c945ee73-09a2-4254-91ba-ba63fd0d4287`    |
| Publish paper                        | pass   | `paperStatus=published`                               |
| Student practice answer              | pass   | `isCorrect=true`                                      |

Screenshots:

- `C:\tmp\tiku-local-validation-20260525\content-materials-before.png`
- `C:\tmp\tiku-local-validation-20260525\content-papers-after.png`
- `C:\tmp\tiku-local-validation-20260525\student-home-after-content.png`

Redaction:

- Did not record session tokens.
- Did not record object key.
- Did not record full paper, textbook, OCR, raw prompt, raw answer, raw model response, provider payload, or customer-like content.
- No Tencent Cloud COS or public object storage URL was created.

## Local/Dev AI Experience

Allowed maximum real provider calls: 5.

Real provider:

- Sandbox run of the existing DeepSeek smoke script returned a redacted blocked result: `failureClass=network_or_runtime_error`, `result=blocked`.
- A sandbox-outside rerun was rejected by approval review because the existing script reads `.env.local` secret internally.
- No workaround was attempted.
- Real provider call count recorded for this task: `0`.

Mock/local AI:

| AI function           | Entry                                                                                    | Result                                                |
| --------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `learning_suggestion` | serial E2E `exam-reports/{publicId}/retry-learning-suggestion`                           | pass; local mock/noop path returned standard response |
| `kn_recommendation`   | `POST /api/v1/questions/{publicId}/recommend-knowledge-nodes`                            | pass; `recommendationStatus=recommended`              |
| `ai_explanation`      | wrong answer -> `mistake_book` -> `POST /api/v1/mistake-books/{publicId}/ai-explanation` | pass; `explanationStatus=explained`                   |

AI log follow-up:

- `GET /api/v1/ai-call-logs?page=1&pageSize=20&aiFuncType=learning_suggestion`: `count=20`.
- `GET /api/v1/ai-call-logs?page=1&pageSize=20&aiFuncType=ai_explanation`: `count=0`.
- `GET /api/v1/ai-call-logs?page=1&pageSize=20&aiFuncType=kn_recommendation`: `count=0`.

## Issue Register

| Severity | Area                   | Finding                                                                                                                                       | Evidence                                                                                                                       | Proposed next action                                                                                                                                                    |
| -------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Local runtime/E2E      | Default fully parallel E2E can exhaust local PostgreSQL connections.                                                                          | `npm.cmd run test:e2e` failed with PostgreSQL `53300 too many clients already`; serial `--workers=1` passed.                   | Add a queued local-runtime hardening task to share/constrain DB pools or cap E2E workers for local runs. Requires runtime/test config approval if changing code/config. |
| P2       | Auth/session UI        | Protected route guard causes hydration mismatch when no local session token exists.                                                           | Web server logs show server `role=status` + loader and client `role=alert` + alert icon mismatch in `ProtectedRouteGuard.tsx`. | Fix in a dedicated UI bug task by making initial SSR/client unauthorized state consistent without weakening route protection.                                           |
| P2       | AI auditability        | Local `kn_recommendation` and `ai_explanation` returned success but filtered `ai_call_log` queries showed zero rows for those function types. | Local API calls succeeded; filtered `ai_call_log` counts: `kn_recommendation=0`, `ai_explanation=0`, `learning_suggestion=20`. | Investigate repository append/filter path and add runtime evidence. Pause before schema/migration/script changes.                                                       |
| P3       | Content upload realism | Paper asset validation is metadata-only locally; no real file bytes, object storage, OCR, or public URL path was validated.                   | `paper_asset` metadata binding succeeded; object key omitted; no COS/public URL used.                                          | Keep as expected local/dev limitation until cloud/object-storage implementation is approved.                                                                            |

No P0 was found in this pass.

## AC-To-Runtime Matrix

| Acceptance area                                       | Runtime evidence                                                                                                  | Status  | Residual risk                                                                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| Repository and queue state restored from clean master | Required docs and latest handoff read; branch created from clean `master`.                                        | pass    | None.                                                                                                            |
| External readiness recorded consistently              | Domain/DNS/ICP/cloud server/database status matches paused Phase 11 docs.                                         | pass    | Update when external status changes.                                                                             |
| Local quality gates                                   | Readiness, quality gate, naming, diff check passed after formatting evidence.                                     | pass    | None.                                                                                                            |
| Local build                                           | `npm.cmd run build` passed.                                                                                       | pass    | Build uses `.env.local`; no secret printed.                                                                      |
| Default E2E                                           | `npm.cmd run test:e2e` failed under parallel workers.                                                             | fail    | P1 local connection pressure.                                                                                    |
| Serial E2E                                            | `npm.cmd run test:e2e -- --workers=1` passed.                                                                     | pass    | Does not remove default E2E failure.                                                                             |
| Auth/session                                          | Login/session works; unauthorized route guard redirects.                                                          | partial | P2 hydration mismatch.                                                                                           |
| Student practice/mock/report/mistake_book             | Serial E2E and local scripts passed positive/negative flows.                                                      | pass    | Default parallel E2E can fail before completion.                                                                 |
| Content material/question/paper                       | Local APIs and admin UI route surface available; controlled content-to-student path worked.                       | pass    | Upload remains metadata-only.                                                                                    |
| Admin ops/audit                                       | Serial E2E covered users/orgs/redeem/resources/audit navigation and read-only guards.                             | pass    | None found.                                                                                                      |
| AI/RAG mock/local                                     | `learning_suggestion`, `kn_recommendation`, and `ai_explanation` local paths returned standard success responses. | partial | P2 `ai_call_log` visibility gap for two function types.                                                          |
| Real AI provider                                      | Existing smoke script was blocked by network in sandbox; sandbox-outside rerun rejected due secret-boundary risk. | not run | Needs explicit approval for a safer provider invocation path that does not violate `.env.local` secret boundary. |

## Repository Hygiene Closeout Checklist

| Check                                                                              | Result |
| ---------------------------------------------------------------------------------- | ------ |
| Only task plan/evidence changed                                                    | pass   |
| No package or lockfile change                                                      | pass   |
| No schema, migration, or script change                                             | pass   |
| No runtime source change                                                           | pass   |
| No `.env.local` or `.env.example` change                                           | pass   |
| No staging/prod, deployment, cloud, DNS, COS, public URL, or object storage change | pass   |
| No secret/token/raw provider/full content recorded                                 | pass   |
| Local dev server stopped after validation                                          | pass   |

## stagingDecision

`phase_11_stays_paused_until_external_resources_ready_and_local_findings_are_triaged`

## Next Recommended Action

1. Create a queued P1 task for local E2E/PostgreSQL connection pressure.
2. Create a queued P2 task for `ProtectedRouteGuard` hydration consistency.
3. Create a queued P2 task for `ai_call_log` runtime visibility of `kn_recommendation` and `ai_explanation`.
4. Keep Phase 11 staging implementation tasks paused until DNS, ICP, cloud server, and database readiness changes are reported and recorded.

## Taste Compliance Self-Check

- Frontend visual taste: no UI, Tailwind, color, font, layout, or interaction code changed.
- Loading/empty/error states: no frontend state implementation changed; hydration mismatch recorded as P2 instead of ignored.
- Interaction feedback: no clickable UI implementation changed.
- Tailwind class order: no Tailwind classes changed; Prettier check passed.
- Backend/API contract: no API implementation changed; exercised APIs returned standard envelopes in passing paths.
- N+1/SQL/schema: no query, schema, migration, or Drizzle code changed.
- Naming discipline: used registered terms including `paper_asset`, `paper_attachment_usage`, `mock_exam`, `mistake_book`, `ai_call_log`, `kn_recommendation`, and `learning_suggestion`.
- Clean logic: only validation evidence and task plan were added.
- Secret hygiene: no secret, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, or raw model response recorded.
- Environment isolation: no cloud resources, deployment, staging/prod connection, production database, public object storage URL, dependency, schema, migration, script, package, or lockfile change.
