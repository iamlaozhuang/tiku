# Phase 12 Content Question Bank SSOT AC Coverage Evidence

## Task

- Task id: `phase-12-repair-content-question-bank-ssot-ac`
- Branch: `codex/phase-12-content-question-bank-ssot-ac`
- Status: closed
- Scope: content admin question bank SSOT AC repair within existing local runtime boundaries.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`

## Claim Readiness

```text
Command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-question-bank-ssot-ac
Result: pass
Key output: task claim readiness passed
```

## AC Matrix

| SSOT AC                                                      | Runtime result    | Evidence                                                                                                                                            |
| ------------------------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-02-01 AC-1 structured question form by type               | Partial pass      | Existing-schema types are selectable and type-specific option/scoring fields are covered. `case_analysis` and `calculation` remain blocked.         |
| US-02-01 AC-2 rich text, image/table support                 | Partial pass      | Text fields and bounded local helper affordances for image placeholder/table markup are covered. Real upload/storage remains blocked.               |
| US-02-01 AC-3 10000 character stem/analysis limit            | Pass              | UI guard disables save and shows the over-limit state; server validator already enforces the same limit.                                            |
| US-02-01 AC-4 material, knowledge_node, tag association      | Partial pass      | Material is persisted. DTO-based knowledge/tag filters and recommendation review exist; create/update persistence is blocked by current API/schema. |
| US-02-01 AC-5 locked questions copy-only                     | Pass              | Locked rows suppress edit and keep copy action available in unit and E2E coverage.                                                                  |
| US-02-01 AC-6 true_false A/B conversion                      | Pass              | Authoring `A`/`B` submits `正确`/`错误` and uses A/B options.                                                                                       |
| US-02-01 AC-7 subjective scoring points with 0.5 granularity | Pass              | Existing service/route tests cover scoring point values and 0.5 validator granularity; UI keeps subjective scoring point fields.                    |
| US-02-03 AC-1 profession/level/subject/type/status filters   | Pass              | UI local filter coverage includes level and question type in addition to existing profession/subject/status filters.                                |
| US-02-03 AC-2 keyword search                                 | Existing coverage | Existing tests cover keyword search.                                                                                                                |
| US-02-03 AC-3 tag and knowledge_node filters                 | Partial pass      | Filters work over returned DTO arrays; real persistence remains blocked by missing schema/repository binding.                                       |
| US-06-08 content admin question CRUD                         | Pass              | Create/edit/disable/copy through protected local APIs remain covered.                                                                               |

## Validation Log

```text
Command: npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts src/server/services/question-service.test.ts src/server/services/question-route.test.ts
Result: pass
Key output: Test Files 3 passed; Tests 21 passed
```

```text
Command: npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts
First result: fail
Failure: E2E selected the first question row, which can now be locked and therefore has disabled edit.
Fix: Select the first enabled edit action and assert locked rows remain disabled/copy-only.
Final result: pass
Key output: 1 passed
```

```text
Command: npm.cmd run build
Result: pass
Key output: Compiled successfully; TypeScript finished; static pages generated.
Note: build reported .env.local as loaded by Next.js, but no secret file was read or output by this task.
```

```text
Command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass
Key output: readiness files/scripts/skills checked; Phase 7 anchors present.
```

```text
Command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass
Key output: naming convention scan completed; banned terms absent; DTO fields camelCase.
```

```text
Command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: pass inventory
Key output: branch codex/phase-12-content-question-bank-ssot-ac; changed files are within task allowlist.
```

```text
Command: git diff --check
Result: pass
Key output: no whitespace errors.
```

## Boundary Decisions

- No dependency/package/lockfile changes.
- No schema/migration/script changes.
- No secret/env access.
- No cloud/staging/prod/deploy/provider work.
- Knowledge/tag persistence and extra question-type enum expansion are logged as blocked boundaries, not silently implemented.

## Repository Hygiene Closeout Checklist

- [x] Short-lived branch used: `codex/phase-12-content-question-bank-ssot-ac`
- [x] Task plan created before closeout.
- [x] Evidence updated before closeout.
- [x] No package, lockfile, schema, migration, script, secret, env, cloud, staging, prod, deployment, or provider changes.
- [x] Validation commands completed and recorded.
- [x] Workspace ready for commit/merge/push/cleanup.

## Next Recommended Action

Claim `phase-12-repair-content-paper-composition-ssot-ac` after this branch is committed, merged to `master`, pushed, and cleaned up according to the semi-automation mechanism.
