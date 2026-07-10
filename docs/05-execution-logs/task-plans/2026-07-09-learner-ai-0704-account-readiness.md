# 2026-07-09 Learner AI 0704 Account Readiness Plan

## Task

- Task id: `learner-ai-0704-account-readiness-2026-07-09`
- Branch: `codex/learner-ai-0704-account-readiness`
- Scope type: validation and fixture-readiness correction only.
- Target roles:
  - `personal_advanced_student`
  - `org_standard_employee`
- Closure rule: identify whether the blocker is private fixture mismatch, missing/broken account binding, or current 0704 DB account state. If a non-destructive product-path or controlled aggregate correction is needed, apply only to the target role fixtures and rerun the credential-backed matrix.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-credential-localhost-acceptance-evidence.md`

## Boundaries

- Localhost / `127.0.0.1` and local 0704 DB only.
- Private account values may be read and used in memory only.
- Evidence may record role labels, status categories, aggregate counts, and safe blocker categories only.
- No credential, phone, password, cookie, token, session, Authorization header, localStorage, env value, DB URL, raw DB row, internal numeric id, Provider payload, prompt, raw AI output, full question, full paper, material, resource, chunk, or private fixture content may be recorded.
- No Provider execution, AI generation submit action, destructive DB operation, schema migration, seed, package, lockfile, dependency, staging/prod/deploy, PR, force push, or Cost Calibration.
- Direct DB work is limited to controlled aggregate/readiness checks and, if required, non-destructive target account readiness correction for the two target roles only.

## Validation Plan

1. Reproduce the two role login failures through `/api/v1/sessions` with credentials held in process memory.
2. Run controlled aggregate checks for each target role:
   - account presence category;
   - auth user binding presence category;
   - student/employee role binding category;
   - target authorization context aggregate category;
   - login failure state category when available.
3. If the issue is private fixture mismatch, update only the private file outside the repository and record field-presence evidence only.
4. If the issue is local 0704 account state and can be fixed non-destructively, apply the minimum target correction and record only aggregate before/after categories.
5. Rerun the credential-backed role matrix from the previous task.
6. Run focused learner AI regression, `typecheck`, `lint`, scoped prettier, `git diff --check`, and Module Run v2 gates.

## Adversarial Review Focus

- Do not broaden from two target roles.
- Do not leak private values or raw DB rows.
- Do not treat fixture repair as product-code repair.
- Do not perform destructive DB writes, schema changes, or Provider execution.
- Do not claim final acceptance unless the credential-backed matrix actually passes after correction.
