# AI Task Provider Auto Seed And History Dependency Plan

## Task

- Task id: `mechanism-ai-task-provider-auto-seed-history-dependency`
- User approval: `将该本地提交 fast-forward merge 到 master；之后再处理 ai-task-and-provider 的 auto seed approval。`
- Scope: low-risk local Module Run v2 seed transaction and next-action history dependency parser repair.

## Read Before Edit

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Plan

1. Apply ai-task-and-provider auto-seed only after the authorization seed de-dup fix is merged into local `master`.
2. Verify the seed does not reuse historical task ids and generates only low-risk local implementation task packets.
3. Run seed self-review and next-action diagnostics.
4. If next-action cannot resolve archived source planning dependencies from `task-history-index.yaml` `entries:`, add a
   focused RED/GREEN smoke and minimal parser repair.
5. Write evidence/audit, keep high-risk gates blocked, and create a local commit only.

## Boundaries

- No provider/model call.
- No `.env*` access or edit.
- No schema, migration, dependency, package, lockfile, deploy, payment, PR, force-push, or Cost Calibration Gate work.
- No product runtime source change.
