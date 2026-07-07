# 2026-07-06 AI Generation Final Local Goal Rollup Audit Evidence

## Metadata

- Task id: `ai-generation-final-local-goal-rollup-audit-2026-07-06`
- Branch: `codex/ai-generation-final-local-goal-rollup-audit-2026-07-06`
- Base chain: `master..HEAD`
- Evidence mode: redacted commit ids, file names, command names, test counts, role labels, route labels, and product-level categories only.
- Not recorded: credentials, sessions, cookies, tokens, headers, env values, DB URLs, raw DB rows, internal ids, PII, Provider payloads, raw prompts, raw AI output, full question, full answer, full paper, material/resource/chunk content, screenshots, traces, raw DOM, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Read Gate Result

- `AGENTS.md`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- `docs/01-requirements/00-index.md`: read.
- `docs/01-requirements/advanced-edition/00-index.md`: read.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`: read.
- 2026-07-02 / 2026-07-05 / 2026-07-06 AI generation traceability overlays: read.
- 2026-07-06 AI generation implementation and recheck evidence: read.

## Commit Chain Inventory

Current local chain from `master` contains the 2026-07-06 recontract implementation and recheck commits:

| Commit      | Scope                                                        |
| ----------- | ------------------------------------------------------------ |
| `8b5e5af5f` | AI组卷 plan-and-select backend contract                      |
| `2eb57e20f` | paper source adapters                                        |
| `353621e43` | route paper generation to plan contract                      |
| `3c95c0a15` | local route paper plan assembly                              |
| `0be0d7bed` | route paper source resolution                                |
| `c9fa69da9` | route plan/select wiring                                     |
| `e223eca23` | admin paper assembly containers                              |
| `38e4cb3a4` | admin route repository wiring                                |
| `acd5f927c` | personal paper assembly containers                           |
| `4d33fef62` | learning-session handoff                                     |
| `ea3aed826` | learning-session route handoff                               |
| `630a693d4` | learning-session source resolver wiring                      |
| `037aa9d24` | learner and employee AI训练 UI                               |
| `e12185b91` | organization admin AI training UI                            |
| `30dc9a09a` | content admin AI draft UI                                    |
| `d5f8d6137` | quantity validation and degradation messages                 |
| `5123b3f98` | source/unit plus synthetic browser local role-matrix recheck |
| `8103600f5` | credential-backed localhost role-matrix replay               |

Boundary diff check:

- Command: `git diff --name-only master..HEAD -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src/db/schema drizzle migrations seed compose.yaml`
- Result: pass, no matching files.

## Parent Requirement Coverage Matrix

| Requirement                                                                                                                  | Current evidence                                                                                                                                                      | Classification                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| AI组卷 means AI creates an assembly plan and local services select existing formal questions.                                | Backend plan/select, Provider instruction, assembly, source resolution, and route wiring packages; aggregate unit suite passed.                                       | Proven in source/unit scope.                                                             |
| Provider must not generate final full question content for AI组卷.                                                           | Plan/select service rejects unsafe generated question body fields; route assembly rejects nested generated question content; Provider instruction asks for plan only. | Proven in source/unit scope.                                                             |
| Platform source means `question.status = available`.                                                                         | Source adapter and source-resolution packages map platform selectable questions from available rows only; source scan observed current status filter.                 | Proven in source/unit scope.                                                             |
| Enterprise source v1 means same-organization published training snapshots.                                                   | Source adapter and source-resolution packages include published same-organization training snapshots for eligible organization contexts.                              | Proven in source/unit scope.                                                             |
| AI-generated drafts are excluded from AI组卷 sources unless later formalized.                                                | Source selectors only accept platform formal questions or enterprise training snapshots; unsafe generated content is rejected before assembly.                        | Proven in source/unit scope.                                                             |
| Personal advanced learner AI组卷 uses platform formal source and preview-before-answer flow.                                 | Personal route container, learning-session handoff, source resolver wiring, learner UI package, aggregate unit suite.                                                 | Proven in source/unit scope; browser entry proven, generation submit not browser-tested. |
| Organization advanced employee AI组卷 uses platform plus same-organization enterprise source and preview-before-answer flow. | Personal route and source-resolution packages cover organization owner context; learner/employee UI package exposes organization source label and preference.         | Proven in source/unit scope; browser entry proven, generation submit not browser-tested. |
| Organization advanced admin AI组卷 creates enterprise training paper draft.                                                  | Admin route container/repository packages and organization admin UI package.                                                                                          | Proven in source/unit scope; browser entry proven, draft mutation not DB-runtime-tested. |
| Content admin AI组卷 creates reviewable paper draft and does not directly publish formal paper.                              | Admin route container/repository packages and content admin UI package.                                                                                               | Proven in source/unit scope; browser entry proven, draft mutation not DB-runtime-tested. |
| AI出题 default 3 / max 10 and AI组卷 default 30 / max 80.                                                                    | Quantity validation package and current contract constants; aggregate unit suite passed.                                                                              | Proven in source/unit scope.                                                             |
| Degradation and insufficiency messages use Chinese product wording.                                                          | Quantity/degradation package and admin/learner UI tests; aggregate unit suite passed.                                                                                 | Proven in source/unit scope.                                                             |
| Four eligible advanced roles have discoverable AI出题 / AI组卷 surfaces.                                                     | Credential-backed localhost role replay: advanced learner, advanced employee, organization advanced admin, and content admin route checks passed.                     | Proven in browser entry scope.                                                           |
| Standard roles cannot use advanced AI generation.                                                                            | Credential-backed localhost role replay: personal standard, organization standard employee, and organization standard admin denial/unavailable checks passed.         | Proven in browser entry/denial scope.                                                    |
| Existing AI出题 closed loop is not broken.                                                                                   | Aggregate unit suite covers question-generation route contracts, UI contracts, and Provider-disabled route categories.                                                | Proven in source/unit scope; no Provider-enabled runtime rerun.                          |
| No dependency/package/lock/schema/migration/seed/env boundary crossed.                                                       | Boundary diff check returned no matching files; package evidence records same boundary.                                                                               | Proven for current local chain.                                                          |
| Evidence remains redacted.                                                                                                   | Module Run v2 sensitive evidence scans passed in package evidence; this rollup records categories only.                                                               | Proven for committed evidence scope.                                                     |

## Current Validation

Focused aggregate unit suite:

```text
npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts src/server/repositories/organization-training-repository.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts
```

- Result: pass.
- Test files: 20 passed.
- Tests: 286 passed.

Static source checks:

- Current source contains plan/select constants for AI组卷 default 30 and max 80.
- Current task-spec contract keeps AI出题 / AI组卷 split and bounded counts.
- Current Provider instruction for AI组卷 asks for a plan only and forbids final question body, options, answer, and analysis content.
- Current UI source exposes Chinese product labels for learner, employee, organization admin, and content admin surfaces.
- Identifier-level scans still show implementation terms such as `structuredPreview`, `payload`, and `ownerType` inside source code. Those are code identifiers, not sufficient evidence of user-visible copy leakage; user-facing copy remains covered by focused UI tests.

## Final Gate Evidence

| Command                            | Result                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `git diff --check`                 | pass                                                                        |
| `npm.cmd run typecheck`            | pass                                                                        |
| `npm.cmd run lint`                 | pass                                                                        |
| scoped `prettier --check`          | first failed on two new markdown files, then passed after scoped formatting |
| Module Run v2 pre-commit hardening | pass                                                                        |

## Role Matrix Evidence

Credential-backed localhost replay evidence recorded:

- Aggregate: 17 pass, 0 fail, 0 partial.
- Standard role denial/unavailable categories:
  - `personal_standard_student`
  - `org_standard_employee`
  - `org_standard_admin`
- Advanced/content role visible categories:
  - `personal_advanced_student`
  - `org_advanced_employee`
  - `org_advanced_admin`
  - `content_admin`

The replay did not submit AI generation forms and did not record credentials, sessions, screenshots, traces, DOM, raw output, or generated content.

## Conclusion Buckets

| Dimension                     | Conclusion                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------- |
| source/unit                   | pass                                                                         |
| DB-backed runtime             | not tested for new plan-and-select generation mutation                       |
| browser                       | pass for credential-backed role entry/denial; generation submit not executed |
| Provider-disabled             | pass in source/unit route/UI scope; not resubmitted in final browser replay  |
| Provider-enabled small sample | not tested / requires separate bounded approval                              |
| release readiness             | not claimed                                                                  |
| production usability          | not claimed                                                                  |
| staging                       | not executed / requires fresh approval                                       |
| Cost Calibration              | not executed / requires fresh approval                                       |

## Rollup Conclusion

Within the approved local source/unit plus localhost role-matrix scope, the 2026-07-06 AI出题 / AI组卷 recontract implementation is supported by current evidence.

This rollup does not claim DB-backed runtime pass, Provider-enabled pass, staging/prod readiness, release readiness, production usability, or Cost Calibration. Those remain separate approval-gated work.
