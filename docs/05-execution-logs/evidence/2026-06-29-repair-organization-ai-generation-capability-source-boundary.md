# Repair Organization AI Generation Capability Source Boundary Evidence

## Task

- Task id: `repair-organization-ai-generation-capability-source-boundary-2026-06-29`
- Branch: `codex/org-ai-generation-capability-repair-20260629`
- Finding id: `role-inv-003`
- Authorization consumed: `current_thread_central_authorization_for_items_1_to_5_local_repair_loop_only`

## Redaction Boundary

- Allowed evidence: file paths, route/service/contract/test labels, risk category, severity, status, command names, counts, redacted expected/observed summaries, commit/branch/merge/push/cleanup results.
- Forbidden evidence not recorded: credentials, cookies, tokens, sessions, localStorage, Authorization header values, env content, connection strings, raw DB rows, internal IDs, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, complete question/paper/material/resource/chunk content, raw exception payloads.

## Change Evidence

| Item                           | Redacted Evidence                                                                                                                                    | Result   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Route capability source repair | Organization workspace access now requires service-computed organization capability metadata before local-contract task creation or history listing. | repaired |
| Owner/history source repair    | Organization owner/history scope now uses capability metadata organization public id rather than route-synthesized role/session context.             | repaired |
| Regression coverage            | Added role-present missing-capability POST rejection and false-capability GET rejection before repository use.                                       | pass     |
| Provider-disabled behavior     | Existing Provider-disabled local contract behavior remains covered by focused tests.                                                                 | pass     |

## Validation Commands

| Command                                                                                                                                        | Result                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts` | pass: 2 files, 35 tests  |
| `npm run typecheck`                                                                                                                            | pass                     |
| scoped prettier write/check                                                                                                                    | pending final validation |
| `git diff --check`                                                                                                                             | pending final validation |
| Module Run v2 precommit/closeout/prepush readiness                                                                                             | pending final validation |

## Prohibited Actions Check

| Boundary                                                                               | Status                   |
| -------------------------------------------------------------------------------------- | ------------------------ |
| DB connection, raw row read, mutation, schema, migration, seed                         | not executed             |
| Real Provider/AI call, Provider configuration, model config, prompt/payload/raw AI I/O | not executed             |
| Browser runtime, dev server, raw DOM, screenshots, traces                              | not executed             |
| Package/lockfile/dependency changes                                                    | not executed             |
| Staging/prod/cloud/deploy                                                              | not executed             |
| Release readiness, final Pass, Cost Calibration                                        | not declared or executed |
| PR creation or force-push                                                              | not executed             |

## Closeout Evidence

- Local commit: pending
- Fast-forward merge to `master`: pending
- Push to `origin/master`: pending
- Short branch cleanup: pending
