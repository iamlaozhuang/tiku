# formal publish local execution for one draft paper evidence

## Scope evidence

- Task id: `formal-publish-local-execution-one-draft-paper-2026-06-27`
- Branch: `codex/formal-publish-local-execution-20260627`
- Approval source: current user serial batch request on 2026-06-27.
- Runtime exclusions: no Provider call/credential read, no Cost Calibration, no env file read/edit, no browser/e2e/dev server, no staging/prod/payment/external-service, no source/test/schema/package/lockfile edit, no release readiness or final Pass claim.

## Local preflight evidence

- Local Docker DB target: `tiku-postgres-dev` on loopback local development service.
- Existing draft count: 5.
- Existing publishable draft decision: not used, because the observed draft candidates have no questions and would fail publish validation.
- Source published sample selected: `paper-de7955bc-d827-4b23-bbf6-8bae5e14fe6b`.
- Source sample metadata: `profession=monopoly`, `level=3`, `subject=theory`, `total_score=5.0`.
- Local actor selected: `admin-dev-super-admin`, role `super_admin`, status `active`.

## Execution evidence

- Application-service copy response:
  - `code`: 0
  - source paper public id: `paper-de7955bc-d827-4b23-bbf6-8bae5e14fe6b`
  - target draft public id: `paper-989beac0-471f-493e-ad83-26cef5461a92`
  - target status after copy: `draft`
  - question count: 1
- Application-service publish response:
  - `code`: 0
  - publish call count: 1
  - target paper public id: `paper-989beac0-471f-493e-ad83-26cef5461a92`
  - target status after publish: `published`
  - question count: 1
  - locked question count: 1
  - locked material count: 1
  - `publishedAt` present: true
- Application-service archive rollback response:
  - `code`: 0
  - target paper public id: `paper-989beac0-471f-493e-ad83-26cef5461a92`
  - final status after rollback: `archived`
  - question count: 1
  - `archivedAt` present: true
- Final local DB read-only verification:
  - target: `paper-989beac0-471f-493e-ad83-26cef5461a92|archived|published_at=true|archived_at=true`
  - source: `paper-de7955bc-d827-4b23-bbf6-8bae5e14fe6b|published`

## Validation evidence

- `npx.cmd prettier --write --ignore-unknown ...` completed for scoped docs/state/evidence/audit files.
- `npx.cmd prettier --check --ignore-unknown ...` passed.
- `git diff --check` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId formal-publish-local-execution-one-draft-paper-2026-06-27` passed.
- First `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1` returned `current_task_active` with recommended action `finish_current_task_closeout`, as expected before terminal state update.
- Final `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1` returned `idle_no_pending_task`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId formal-publish-local-execution-one-draft-paper-2026-06-27 -SkipRemoteAheadCheck` passed.

## Boundary evidence

- Publish call budget: maximum 1.
- Publish call count consumed: 1.
- Browser/student-visible runtime verification: not executed.
- Rollback/cleanup strategy: archive the copied target paper after publish evidence is captured; preserve the archived local evidence artifact rather than deleting data.
