# Local Full Loop Acceleration Planning State Queue Traceability

## Task

- Task id: `local-full-loop-acceleration-planning-state-queue-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-full-loop-acceleration-20260628`
- Result: `pass_local_full_loop_sprint_queue_seeded`

## Requirement Mapping

| Seeded task                                                                          | Requirement source                                                                                                                                                                                                  | Local closure intent                                                                                                                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `local-full-loop-baseline-accounts-auth-db-2026-06-28`                               | `modules/01-user-auth.md`, `advanced-edition/edition-aware-authorization-requirements.md`, `advanced-edition/modules/01-authorization-context.md`, `role-experience-fulfillment-matrix.md`                          | Prove local accounts, roles, authorization context, and DB baseline for `student`, `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `employee`. |
| `local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28`                         | `modules/05-rag-knowledge.md`, `advanced-edition/modules/02-ai-task-domain.md`                                                                                                                                      | Prove local knowledge node, knowledge base, resource, chunk, citation, and retrieval maintenance loop with redacted evidence.                                                |
| `local-full-loop-ai-generation-paper-provider-smoke-2026-06-28`                      | `modules/02-question-paper.md`, `advanced-edition/modules/03-personal-ai-generation.md`, `advanced-edition/modules/08-organization-ai-generation.md`, `2026-06-23-advanced-ai-generation-scope-clarification.md`    | Prove local AI question generation and AI paper composition smoke without direct formal adoption or publish.                                                                 |
| `local-full-loop-student-answer-ai-explanation-smoke-2026-06-28`                     | `modules/03-student-experience.md`, `modules/04-ai-scoring.md`, `stories/epic-03-student-experience.md`, `stories/epic-04-ai-scoring.md`                                                                            | Prove local student answering, AI scoring, AI explanation, AI hint, report, and mistake-book loop with redacted evidence.                                                    |
| `local-full-loop-organization-training-analytics-ai-generation-role-flow-2026-06-28` | `advanced-edition/modules/04-organization-training.md`, `advanced-edition/modules/05-organization-analytics.md`, `advanced-edition/modules/08-organization-ai-generation.md`, advanced stories epics 02, 03, and 07 | Prove local organization standard/advanced admin and employee training, analytics, and organization AI generation role flow.                                                 |
| `local-full-loop-rollup-evidence-2026-06-28`                                         | `00-index.md`, `advanced-edition/00-index.md`, `local-experience-coverage-matrix.yaml`                                                                                                                              | Roll up completed local evidence, residual gaps, and explicitly blocked release, staging, Provider cost, payment, OCR/export, and Cost Calibration gates.                    |

## Role Mapping

| Role                 | Queued coverage                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `student`            | Baseline role/auth DB, student answering, AI scoring, AI explanation, AI hint, report or mistake-book local loop. |
| `content_admin`      | Baseline role/auth DB and local AI question/paper generation smoke through governed content paths.                |
| `ops_admin`          | Baseline role/auth DB and organization authorization/analytics visibility checks.                                 |
| `org_standard_admin` | Baseline role/auth DB and standard organization training/analytics role flow.                                     |
| `org_advanced_admin` | Baseline role/auth DB and advanced organization training/analytics/organization AI generation role flow.          |
| `employee`           | Baseline role/auth DB and organization training employee experience, with subjective answers redacted.            |

## Boundary Mapping

| Boundary                                                                   | Decision                                                                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Localhost/127.0.0.1                                                        | Allowed in successor tasks only, with redacted evidence and no raw DOM/screenshot/trace artifacts.                                                     |
| Local Docker dev DB                                                        | Allowed in successor tasks only, with no shared/prod destructive DB work and no raw row evidence.                                                      |
| Provider local smoke                                                       | Allowed only in the seeded AI successor tasks, with no prompt, payload, raw AI output, or cost-calibration evidence.                                   |
| Formal AI adoption                                                         | Blocked in Provider smoke unless a later task has separate approval. Generated content cannot directly write formal `question`/`paper`/exam artifacts. |
| Package/lockfile and `.env*`                                               | Blocked unless later fresh approval explicitly permits them.                                                                                           |
| Staging/prod/deploy, payment, OCR/export, external service, PR, force push | Blocked.                                                                                                                                               |
| Cost Calibration, pricing, quota defaults, release readiness, final Pass   | Blocked.                                                                                                                                               |

## Traceability Decision

The active queue is now local full-loop first. The next executable task after this planning task is
`local-full-loop-baseline-accounts-auth-db-2026-06-28`.
