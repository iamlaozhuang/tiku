# Phase 3 Question Library Baseline Task Plan

## Task

- Task id: `phase-3-question-library-baseline`
- Branch: `codex/phase-3-question-library-baseline`
- Base: `master`
- Date: `2026-05-19`

## Required Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-schema-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-material-library-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-material-library-baseline-security-review.md`

## Scope

Implement the question library baseline for:

- `question`
- `question_option`
- `scoring_point`
- `analysis`
- `standard_answer`
- material association read boundary through `materialPublicId`

Allowed implementation areas are limited to:

- `src/app/api/v1/questions/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `tests/unit/**`
- task plan, evidence, security review, project state, and task queue files

Explicitly forbidden:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## TDD Plan

1. Add failing question service and route tests covering list/create/detail/update/disable/copy.
2. Verify RED with targeted `npm.cmd run test:unit -- src/server/services/question-service.test.ts src/server/services/question-route.test.ts`.
3. Implement the smallest service, repository contract, mapper, validator, contract DTO, and route factory needed to pass.
4. Add Next.js route files under `/api/v1/questions` using `[publicId]`, `disable`, and `copy`.
5. Re-run targeted tests, then full task validation commands from `task-queue.yaml`.

## Implementation Notes

- Match the existing material baseline shape for service, route handler factory, unavailable runtime wiring, mapper, validator, and tests.
- Return standard API envelopes `{ code, message, data, pagination? }`.
- Use camelCase API JSON fields and keep database-like snake_case fields inside repository access rows only.
- Expose `publicId` and `materialPublicId`; never expose internal numeric `id` or `material_id`.
- Normalize optional fields to `null` and empty lists to `[]`.
- Keep runtime route files unavailable until authenticated admin service wiring is implemented, matching the material baseline security posture.
- Defer `knowledgeNodePublicIds` and `tagPublicIds` to empty arrays because Phase 3 schema evidence deferred relationship schema until validated contracts exist.

## Risk Defense

- `authorization`: route files must not enable real data access before authenticated admin context exists.
- `api_contract`: route folders use kebab-case plural nouns and dynamic `[publicId]`; JSON stays camelCase.
- `data_contract`: repository rows remain internal and DTO mapping strips numeric ids.
- `admin`: state-changing operations are represented behind service boundaries and unavailable runtime route wiring until admin permission injection lands.
- Locked questions cannot be edited; copying produces an unlocked independent source question.
- Disabled questions remain readable but may be excluded by later composition tasks.

## Validation Plan

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\app\api\v1\questions\**\*.ts' -Pattern 'code|message|data'`
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'question|question_option|scoring_point|analysis|standard_answer'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Record results in `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-library-baseline.md`.
- Write security review at `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-library-baseline-security-review.md`.
