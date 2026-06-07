# Phase 3 Paper Lifecycle Asset Baseline Plan

## Task

- Task id: `phase-3-paper-lifecycle-asset-baseline`
- Branch: `codex/phase-3-paper-lifecycle-asset-baseline`
- Base: `master` at `ea6b32c`
- Queue source: `docs/01-requirements/stories/epic-02-question-paper.md#us-02-09-试卷下架与删除`

## Sources Read

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
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-paper-publish-snapshot-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-paper-publish-snapshot-baseline-security-review.md`

## Scope

Implement the service, contract, validator, mapper, and API route baseline for:

- `POST /api/v1/papers/{publicId}/archive`
- `POST /api/v1/papers/{publicId}/copy`
- `DELETE /api/v1/papers/{publicId}`
- `GET /api/v1/paper-assets`
- `POST /api/v1/paper-assets`
- `GET /api/v1/paper-assets/{publicId}`
- `DELETE /api/v1/paper-assets/{publicId}`

Allowed files follow the queue entry:

- `src/app/api/v1/papers/**`
- `src/app/api/v1/paper-assets/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- task plan, evidence, and security review docs for this task

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## TDD Plan

1. Add failing unit tests for paper lifecycle service behavior:
   - archived transition only from `published`
   - delete allowed only for unreferenced draft paper
   - copy creates a draft with current source snapshots and copied paper-level scoring points
2. Add failing route tests for `archive`, `copy`, `delete`, and `paper-assets` response envelopes.
3. Implement the minimal contracts, repository hooks, validators, mappers, service methods, and route factories to pass the new tests.
4. Add Next.js route files using `[publicId]` dynamic params only, with unavailable runtime wiring where authenticated admin integration is not yet implemented.
5. Run task validation commands and record evidence.

## Risk Defenses

- Authorization/admin: live route wiring remains unavailable until authenticated admin runtime integration lands; service baseline does not claim live permission enforcement.
- API contract: all responses keep `{ code, message, data }`, JSON fields use camelCase, and URLs use public identifiers only.
- Data contract: `paper_asset.object_key` remains repository/internal and is not exposed through API DTOs.
- Lifecycle safety: published papers cannot be deleted; referenced papers cannot be deleted; archive is the non-destructive downlist action.
- Dependency safety: no dependency, lockfile, schema, migration, or env changes.

## Validation Plan

Run and record:

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'paper_asset|paper_attachment_usage|copy|disable'`
- `Select-String -Path 'src\app\api\v1\paper-assets\**\*.ts' -Pattern 'code|message|data'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`

Also run closeout gates from local CI before merge and after merge to `master`.
