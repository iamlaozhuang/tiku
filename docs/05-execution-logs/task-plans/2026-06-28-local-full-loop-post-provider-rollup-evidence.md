# Local Full Loop Post Provider Rollup Evidence Task Plan

Task id: `local-full-loop-post-provider-rollup-evidence-2026-06-28`

Sprint id: `local-full-loop-acceleration-2026-06-28`

Branch: `codex/local-post-provider-rollup-20260628`

Cost Calibration Gate remains blocked.

## Approval Boundary

The user fresh-approved executing `local-full-loop-post-provider-rollup-evidence-2026-06-28` as a rollup-only task.

This task may:

- summarize existing local full-loop, local browser, and Provider diagnostic evidence;
- update task/state/traceability/evidence/audit/acceptance documents;
- run docs/state quality gates and Module Run v2 readiness checks;
- commit, fast-forward merge to `master`, push `origin/master`, and clean the merged short branch under the standing
  local full-loop closeout approval.

This task must not:

- call Provider/model services;
- read or modify `.env*`;
- run Cost Calibration, cost measurement, pricing, quota defaults, release readiness, or final Pass;
- run browser/e2e/dev-server/DB runtime;
- modify source, tests, scripts, package/lockfile, schema, migration, or seed files;
- execute staging/prod/deploy, payment/OCR/export, external-service, PR, force push, or `drizzle-kit push`;
- record credentials, secrets, connection strings, tokens, cookies, localStorage, Authorization headers, raw DB rows,
  internal ids, user emails/phones, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider payloads, prompts,
  raw AI output, raw answers, or full question/paper/resource/chunk content.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- Local full-loop, local role browser acceptance, and Provider diagnostic evidence files.

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-rollup-evidence.md`
- `docs/01-requirements/traceability/2026-06-28-local-role-browser-acceptance-hardening.md`
- `docs/01-requirements/traceability/2026-06-28-local-ai-provider-error-diagnostic.md`

## Requirement Mapping Result

| Requirement surface                   | Rollup evidence result                                                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User/auth and six-role baseline       | Existing local full-loop and role-browser evidence covers six role labels with redacted proof.                                                                    |
| Knowledge/RAG maintenance             | Existing local evidence covers knowledge node, resource publish, vector rebuild, and retrieval governance.                                                        |
| AI question and AI `paper` generation | Existing local contract evidence covers content and organization generation; Provider diagnostic evidence covers the viable local Provider route.                 |
| Student answer and AI explanation     | Existing local evidence covers practice, `mistake_book`, AI explanation, mock exam, report, and learning suggestion.                                              |
| Organization training and analytics   | Existing local evidence covers organization training, employee answer, aggregate analytics, organization AI generation local contract, and standard-admin denial. |
| Edition-aware authorization           | Existing local evidence covers standard/advanced role boundaries while preserving `effectiveEdition` as a service-computed boundary.                              |
| Residual governance gates             | Cost Calibration, pricing/quota defaults, staging/prod, release readiness, final Pass, payment/OCR/export, and external service remain blocked.                   |

## Rollup Inputs

- `local-full-loop-rollup-evidence-2026-06-28`
- `local-role-browser-acceptance-hardening-2026-06-28`
- `local-ai-provider-env-local-readonly-smoke-retry-2026-06-28`
- `local-ai-provider-error-diagnostic-2026-06-28`

## Execution Plan

1. Create this task plan before state/evidence edits.
2. Create traceability, evidence, audit, and acceptance documents with redacted rollup summaries only.
3. Update `project-state.yaml` and `task-queue.yaml` to close the approved rollup task.
4. Run scoped Prettier, `git diff --check`, `Get-TikuProjectStatus`, Module Run v2 pre-commit, and pre-push readiness.
5. Commit, fast-forward merge, push `origin/master`, and delete the merged short branch.

## Risk Defense

- This task is docs/state only; no runtime command may touch Provider, DB, browser, e2e, dev server, `.env*`, source,
  package/lockfile, schema, migration, seed, staging/prod/deploy, payment, OCR/export, or external service surfaces.
- Evidence records only task ids, command pass/fail summaries, role labels, and redacted status counts.
- Any request to convert this rollup into Cost Calibration, release readiness, final Pass, quota default, pricing,
  Provider configuration, or additional Provider execution must stop for a new fresh approval.
