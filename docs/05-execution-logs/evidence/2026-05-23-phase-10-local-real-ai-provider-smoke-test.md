# Evidence: phase-10-local-real-ai-provider-smoke-test

## Metadata

- Task id: `phase-10-local-real-ai-provider-smoke-test`
- Branch: `codex/phase-10-local-real-ai-provider-smoke-test`
- Base: `master`
- Evidence created at: `2026-05-23T19:31:30+08:00`
- Task plan: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
- Human approval: user explicitly requested this local smoke-test task, explicitly required the prior safety-plan rules, and explicitly approved pushing `origin/master` after local merge and closeout. No real provider call was executed because local prerequisites were incomplete.
- Security review: required by task queue and evaluated in this evidence. No separate security review file is created because this task is docs/state only and introduces no source, dependency, schema, environment, or provider configuration change.

## Scope

Allowed files followed:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

No dependency, lockfile, runtime source, database schema, migration file, environment example, local secret file, real provider call, staging resource, production resource, deployment, PR, cloud resource, raw prompt, raw answer, raw model response, provider payload, Authorization header, session token, password, API key, secret, signed URL, database URL, or real-content excerpt was changed, created, printed, or recorded.

## Local Provider Preflight

Redacted `.env.local` presence check:

- `.env.local`: present.
- `APP_ENV`: missing, so the task cannot prove local `dev` from this variable.
- `AI_PROVIDER_ENABLED`: missing, so a local provider feature flag was not enabled.
- `DEEPSEEK_API_KEY`: missing at the time of the redacted preflight.
- `DEEPSEEK_BASE_URL`: missing at the time of the redacted preflight.
- `DEEPSEEK_MODEL`: missing at the time of the redacted preflight.
- `ALIBABA_API_KEY`: present but empty.
- `OPENAI_API_KEY`: present but empty.
- `DATABASE_URL`: present and classified as local-like; raw value was not printed or recorded.
- `BETTER_AUTH_SECRET`: present; raw value was not printed or recorded.

User asked how to prepare a DeepSeek key safely. Guidance was limited to local `.env.local` variable names and boundaries:

- `APP_ENV`
- `AI_PROVIDER_ENABLED`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`

No key, secret, token, Authorization header, raw prompt, raw answer, raw model response, or provider payload was requested or recorded.

Existing provider runtime check:

- `package.json` has no `ai` dependency and no `@ai-sdk/*` provider dependency in the current checkout.
- `rg` found no existing `generateText`, `streamText`, `from "ai"`, `@ai-sdk`, `createOpenAI`, or `createAlibaba` runtime smoke entrypoint under `src`, `tests`, or `package.json`.
- Existing `qwen` references are seeded/mock model configuration, validators, tests, and admin display text. They do not provide a real provider call path.

## Smoke-Test Decision

Result: blocked before any provider call.

Blocking reasons:

- `APP_ENV` was not present in `.env.local`; local `dev` could not be proven through the expected variable.
- `AI_PROVIDER_ENABLED` was not present; local provider execution was not explicitly enabled.
- Provider key variables were empty, so no real provider credential was available from the local uncommitted secret store.
- DeepSeek variables were not present during the redacted preflight, and this task cannot add official runtime usage without changing blocked files.
- The current allowedFiles prohibit adding the missing runtime provider dependency or smoke-test entrypoint.
- The current checkout does not expose an existing real provider smoke-test command.

Safe preparation outcome:

- No provider request was attempted.
- No retry was attempted.
- The intended `bounded sample` stayed at request count `0` because prerequisites failed before the call boundary.
- Evidence uses `redacted` provider and environment summaries only.
- Evidence contains `no API key` and `no secret` values.
- No staging, prod, deployment, public object storage, production provider quota, or production database was touched.

## Validation Commands

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-ai-provider-smoke-test
Select-String -Path 'docs\05-execution-logs\evidence\2026-05-23-phase-10-local-real-ai-provider-smoke-test.md' -Pattern 'no API key|no secret|redacted|bounded sample'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results on `codex/phase-10-local-real-ai-provider-smoke-test`:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-ai-provider-smoke-test`: pass; task was pending, dependency `phase-10-local-real-ai-provider-safety-plan` was closed, `taskPlanPolicy: required`, and allowed/blocked files were confirmed.
- Redacted `.env.local` preflight: pass for secret hygiene; no values printed. Provider execution blocked because required local provider enablement and non-empty provider key values were absent.
- Existing provider runtime search: pass for secret hygiene; no provider payloads printed. Provider execution blocked because no existing real provider smoke entrypoint was present.
- `Select-String ... 'no API key|no secret|redacted|bounded sample'`: pass; matches found for `redacted`, `bounded sample`, `no API key`, and `no secret`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `103` files and `379` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js build completed successfully with `.env.local` loaded but no secret values printed.
- `Test-NamingConventions.ps1`: pass; banned business terms absent, standalone risky `section`/`option` absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files were limited to the four task-queue allowed files.

Post-evidence rerun:

- `Select-String ... 'no API key|no secret|redacted|bounded sample'`: pass.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-NamingConventions.ps1`: pass.
- `Invoke-QualityGate.ps1`: first post-evidence sandbox rerun failed during `test:unit` with eight UI test timeouts. Investigation found the current diff only touched docs/state files, and one timed-out test file rerun outside the sandbox passed. A full `Invoke-QualityGate.ps1` rerun outside the sandbox then passed:
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `103` files and `379` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass on post-evidence rerun; Next.js build completed successfully with `.env.local` loaded but no secret values printed.
- Post-evidence `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files remained limited to the four task-queue allowed files.
- Final `npm.cmd run format:check`: first sandbox run failed with local `EPERM` while opening the installed Prettier executable under `node_modules`; rerun outside the sandbox passed and reported all matched files use Prettier style.

## Residual Risk

- This task does not validate a real provider key, quota, latency, model response, AI scoring quality, AI explanation quality, AI hint quality, `kn_recommendation`, RAG retrieval, `citation`, `evidence_status`, or `ai_call_log` persistence against a real provider.
- A future task must either allow the missing provider runtime entrypoint/dependency work with dependency approval, or rerun this smoke test after an existing approved entrypoint is available.
- The user must prepare local-only `.env.local` values directly on the machine when a future approved provider-call task is ready; values must not be pasted into chat or evidence.

## Git Closeout

- implementationCommit: `0a72625 docs(agent): record phase 10 real provider smoke block`.
- metadataCommit: `b26a250 docs(agent): record phase 10 smoke metadata`.
- merge: `1ad7abd merge: phase 10 real provider smoke block`.
- masterCloseoutEvidenceCommit: `f8bc8e2 docs(agent): record phase 10 smoke closeout`.
- postMergeValidation on `master`:
  - `Test-AgentSystemReadiness.ps1`: pass.
  - `Invoke-QualityGate.ps1`: pass outside the sandbox after earlier local node_modules `EPERM` behavior was observed.
    - lint: pass.
    - typecheck: pass.
    - test:unit: pass, `103` files and `379` tests passed.
    - format:check: pass.
  - `npm.cmd run build`: pass; Next.js build completed successfully with `.env.local` loaded but no secret values printed.
  - `Test-NamingConventions.ps1`: pass.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`: pass inventory; ahead commits and changed files remained limited to this task.
- push: completed to `origin/master`; first push advanced `master` from `cb282eb` to `f8bc8e2`.
- cleanup: deleted local branch `codex/phase-10-local-real-ai-provider-smoke-test` after merge and first push. No remote short-lived branch was created. The first local deletion attempt hit a `.git` ref lock permission error; rerunning the same safe `git branch -d` outside the sandbox succeeded.

## Taste Compliance Self-Check

- Frontend visual taste: no UI or styling changes; no pure black, unreviewed gradient, token, Tailwind, or typography changes.
- Loading/empty/error: no runtime state handling changed.
- Interaction feedback: no interactive component behavior changed.
- Tailwind formatting: no Tailwind classes changed.
- Backend/API contract: no API runtime changed; ADR-002 route/service/repository/model layering remains unchanged.
- Naming discipline: evidence uses glossary identifiers such as `model_provider`, `model_config`, `ai_call_log`, `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, `citation`, and `evidence_status`.
- Data privacy: no session token, password, secret, API key, database URL, raw prompt, raw answer, raw model response, provider payload, Authorization header, raw OCR output, real content excerpt, or production data was recorded.
- Environment isolation: task stayed inside local `dev` preflight; no staging, prod, cloud, deployment, public object storage, or production-resource operation was performed.
- Dependency/schema isolation: no dependency, lockfile, environment example, schema, migration file, runtime source, or production-resource change was made.
