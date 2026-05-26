# Phase 12 Content Question Bank SSOT AC Coverage

## Task

- Task id: `phase-12-repair-content-question-bank-ssot-ac`
- Branch: `codex/phase-12-content-question-bank-ssot-ac`
- Source of truth:
  - `AGENTS.md`
  - `docs/03-standards/code-taste-ten-commandments.md`
  - `docs/02-architecture/adr/`
  - `docs/01-requirements/stories/epic-02-question-paper.md`
  - `docs/01-requirements/modules/02-question-paper.md`
  - `docs/01-requirements/stories/epic-06-admin-ops.md`
- Scope: content admin question authoring and listing AC coverage that can be implemented within the existing question/material runtime contract.

## Guardrails

- Do not modify `package.json`, lockfiles, schema, migrations, scripts, secrets, env files, cloud/staging/prod resources, deployments, or provider configuration.
- Do not add `case_analysis` or `calculation` question types in runtime code because that requires the blocked schema/enum expansion gate.
- Do not record raw private content, secrets, raw prompts, provider payloads, or full copyrighted material in evidence.
- Keep the task to one reviewable commit before moving to the next queue item.

## AC Implementation Plan

1. Re-read task queue and task claim readiness before edits.
2. Convert the SSOT gaps into focused UI/unit tests:
   - question type selection and type-specific fields;
   - true/false A/B authoring normalization;
   - option authoring behavior for single and multiple choice;
   - length guard for 10000-character stem/analysis limit;
   - profession/level/subject/type/status plus knowledge/tag filter behavior;
   - locked question edit suppression and copy-only affordance.
3. Repair `AdminQuestionMaterialManagementClient` using existing APIs only.
4. Record partial boundaries:
   - knowledge/tag persistence is not in the current create/update question API contract;
   - image upload/storage is outside this task and blocked by storage boundary;
   - additional question types require schema/enum approval.
5. Run the task validation commands and record exact pass/fail evidence.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-question-bank-ssot-ac
npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts src/server/services/question-service.test.ts src/server/services/question-route.test.ts
npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```

## Risk Notes

- This task is a local runtime/UI repair, not a schema expansion task.
- Any need for new persisted fields, new enum values, storage uploads, or cloud configuration must be logged as blocked follow-up instead of bypassed.
