# Content Admin AI Generation Detail Rerun After Safe Bootstrap Traceability

## Status

- Task: `full-acceptance-content-admin-ai-generation-detail-rerun-after-safe-bootstrap-2026-06-28`
- Branch: `codex/content-admin-ai-rerun-after-bootstrap-20260628`
- Status: in_progress
- Scope: local browser rerun for two `content_admin` AI generation detail-control rows.

## Required Inputs Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-local-safe-role-bootstrap-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-content-admin-test-owned-account-stage-b-repair.md`

## Requirement Mapping

| Checklist row                                  | Expected coverage in this task                                                                                                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `content_admin.content_ai_question_generation` | `/content/ai-question-generation` is reachable as `content_admin`; detail controls include `profession`, `level`, `subject`, `knowledge_node`, question type, count, difficulty/source/context categories where implemented; no Provider submit. |
| `content_admin.content_ai_paper_generation`    | `/content/ai-paper-generation` is reachable as `content_admin`; detail controls include `profession`, `level`, `subject`, count/distribution/difficulty/knowledge coverage/section/source pool categories where implemented; no Provider submit. |

## Durable Notes

- All role account material is in `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`, but
  this task does not read it; it uses the local safe bootstrap route.
- Multi-role `AI出题` and `AI组卷` implementation must reuse existing shared AI generation surfaces. This task only
  inspects existing behavior and does not change source.

## Blocked Gates

No AI submit, Provider call/configuration, prompt execution, raw AI IO, DB access/write, schema/migration/seed,
source/test/package change, screenshot/trace/raw DOM evidence, staging/prod/deploy, PR, force-push, release readiness,
final Pass, or Cost Calibration Gate execution is approved.
