# Phase 23 Evidence Consolidation And Closeout Plan

## Scope

- Consolidate child task results.
- Run required validation commands, local CI, readiness, naming, quality gate, and `git diff --check`.
- Complete required security review artifacts.
- Commit, merge to `master`, push `master`, clean merged branch, and confirm final master/origin alignment.

## Validation Commands

- `git diff --check`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
