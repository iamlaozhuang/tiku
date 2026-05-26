# Phase 12 Content Paper Composition SSOT AC Coverage

## Task

- Task id: `phase-12-repair-content-paper-composition-ssot-ac`
- Branch: `codex/phase-12-content-paper-composition-ssot-ac`
- Source of truth:
  - `AGENTS.md`
  - `docs/03-standards/code-taste-ten-commandments.md`
  - `docs/02-architecture/adr/`
  - `docs/01-requirements/stories/epic-02-question-paper.md`
  - `docs/01-requirements/modules/02-question-paper.md`
  - `docs/01-requirements/stories/epic-06-admin-ops.md`
- Scope: content admin paper metadata, composition, scoring, publish validation, copy/archive, and original-file metadata affordances that fit the existing local runtime contract.

## Guardrails

- Do not modify package files, lockfiles, schema, migrations, scripts, secrets, env files, cloud/staging/prod resources, deployments, or storage configuration.
- Do not create real storage URLs or upload files to cloud storage.
- If an AC requires unavailable schema or external storage, record it as partial/blocked instead of pretending it is complete.
- Keep this task to one reviewable commit before moving to the next queue task.

## AC Implementation Plan

1. Re-run task claim readiness and inspect current paper management UI/service tests.
2. Map SSOT ACs:
   - US-02-07: add questions to draft with snapshot semantics, order, score, section/group assignment, no editing mother-question content, subject scoring point override.
   - US-02-08: publish validation blocks incomplete score/empty-section issues and locks content after publish.
   - US-02-09: archive/delete boundary for paper lifecycle.
   - US-02-10: copy published/archived papers to draft.
   - US-02-11: metadata and original-file attachment metadata.
   - US-06-09: paper admin list/actions/filter visibility.
3. Add or adjust unit/E2E coverage first where feasible.
4. Repair existing UI within `src/features/admin/paper-management/**` and allowed service tests only.
5. Run declared validation commands and record pass/fail evidence.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-paper-composition-ssot-ac
npm.cmd run test:unit -- tests/unit/admin-paper-ui.test.ts src/server/services/paper-draft-service.test.ts
npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```

## Risk Notes

- This is a local UI/runtime AC repair task, not a schema or storage implementation task.
- Original-file support is limited to existing paper asset metadata APIs unless a later approved storage task expands it.
