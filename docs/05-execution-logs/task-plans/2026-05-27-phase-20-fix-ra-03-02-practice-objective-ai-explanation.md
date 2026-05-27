# Phase 20 Fix RA-03-02 Practice Objective AI Explanation Plan

**Task id:** `phase-20-fix-ra-03-02-practice-objective-ai-explanation`

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-03-student-experience.md`

## Finding

- `F-RA-03-02-001`: objective `practice` lacks wrong-answer automatic `ai_explanation` and a correct-answer manual explanation trigger.

## Implementation Plan

1. Add focused RED unit tests for:
   - wrong objective practice answers returning local deterministic `ai_explanation` feedback automatically;
   - correct objective practice feedback exposing a manual explanation trigger state without calling a real provider.
2. Extend the `practice` service with an injected local-only objective explanation runtime:
   - no real provider, no env, no schema, no migration;
   - wrong objective answers invoke the runtime with `triggerReason = "wrong_answer_auto"`;
   - correct objective answers return a manual trigger state so the UI can show the learner action.
3. Add UI coverage for objective practice:
   - wrong-answer feedback renders generated AI explanation text/evidence state;
   - correct-answer feedback shows a manual “AI 讲解” action entry.
4. Keep existing API response envelope and `PracticeAnswerFeedbackDto` field names unchanged.
5. Run task validation and local CI gates, then update evidence/state and close the task through commit, merge, push, and branch cleanup.

## Risk Boundaries

- No real provider, staging/prod/cloud/deploy, secret/env, dependency, schema, migration, or destructive data work.
- No `.env.local` or `.env.example` read/write.
- AI behavior remains local deterministic/mock-first and redaction-safe.
- Scope is limited to `practice` service/UI/tests plus task plan/evidence/state.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-02-practice-objective-ai-explanation`
- focused RED/GREEN unit tests
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
