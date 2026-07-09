# 2026-07-09 content AI formal draft detail entry audit

## Review Scope

- Task id: `content-ai-formal-draft-detail-entry-2026-07-09`
- Branch: `codex/content-ai-formal-draft-detail-entry`
- Reviewed change set: content-admin AI history entry, formal question/paper destination query handling, targeted tests, state/queue/task plan/evidence.

## Adversarial Review Findings

- Finding: no blocking issue found.
- Publish boundary: unchanged; the branch adds navigation/entry state only and does not publish, adopt, mutate formal draft creation, or bypass validation.
- Data boundary: navigation uses `formalQuestionPublicId` / `formalPaperPublicId` only; no internal numeric ids are exposed in links or evidence.
- Content boundary: evidence records field-level status and code symbols only; no full question, paper, material, resource, chunk, prompt, Provider IO, or raw AI output is recorded.
- Role boundary: adjacent personal AI generation, learner UI, organization training route, and organization admin training entry tests passed, reducing regression risk for personal advanced, org employee, and org admin surfaces.
- Edition/auth boundary: no authorization source-of-truth, entitlement, standard/advanced split, content-admin role gate, or super_admin organization context code was changed.
- Runtime boundary: no Provider, DB, env, credential, browser screenshot, staging/prod/deploy, Cost Calibration, schema/migration/seed, dependency, or lockfile action was executed.
- UI boundary: question query target is dismissed when the user switches to material view, avoiding stale cross-tab detail panels.

## Residual Risk

- Local browser acceptance was not executed for this branch because the task was scoped to source-level public-id entry handling and screenshot/browser evidence was not approved for this turn.
- The paper destination remains a management-list detail entry/highlight rather than a new dedicated paper-detail page; this matches the branch scope and avoids changing publish/review logic.

## Gate Result

- Focused entry tests: pass.
- Adjacent role-boundary tests: pass.
- Typecheck: pass.
- Lint: pass.
- Diff check: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 prepush readiness: pass.
- Master post-merge targeted tests: pass.
- Master post-merge adjacent role-boundary tests: pass.
- Master post-merge typecheck/lint/diff check: pass.
