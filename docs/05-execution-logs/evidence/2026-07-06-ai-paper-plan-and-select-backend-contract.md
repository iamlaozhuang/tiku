# AI Paper Plan-And-Select Backend Contract Evidence

## Metadata

- Task id: `ai-paper-plan-and-select-backend-contract-2026-07-06`
- Branch: `codex/ai-paper-plan-and-select-backend-contract-2026-07-06`
- Date: 2026-07-06
- Scope: local backend contract and focused unit evidence only.
- Redaction: no credential, session, cookie, token, env value, DB URL, DB row, internal id, Provider payload, raw prompt, raw AI output, full material, full question, full paper, screenshot, DOM, or private fixture value recorded.

## Requirement Mapping Result

- Recontract SSOT: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Implemented package: package 1, AI组卷 backend plan-and-select contract foundation.
- Covered decisions:
  - AI组卷 accepts assembly plan structure, not generated complete questions.
  - Platform source means formal available platform questions.
  - Enterprise source v1 means same-organization published training snapshots.
  - Personal advanced learner source is platform only.
  - Organization advanced employee source is platform plus same organization enterprise snapshots.
  - Organization advanced admin source is platform plus same organization enterprise snapshots.
  - Content admin source is platform only.
  - AI-generated drafts are excluded from AI组卷 source candidates.
  - Insufficient source returns a typed insufficiency category instead of inventing questions.
  - Degradation order is exact, nearby parent knowledge, then same scope.
- Not covered by this package:
  - Route wiring.
  - Provider prompt/instruction update.
  - Repository adapters or DB runtime.
  - UI/UX.
  - Browser acceptance.
  - staging/prod/deploy/Cost Calibration.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts`
- RED result: failed before implementation because `src/server/services/ai-paper-plan-and-select-service.ts` did not exist.
- GREEN command: `npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts`
- GREEN result: passed, 1 test file, 5 tests.
- Adversarial RED follow-up: after initial GREEN, a stricter degradation fixture with difficulty mismatch failed because fallback tiers were still over-constrained by exact difficulty.
- Adversarial RED follow-up resolution: exact difficulty now applies only to exact matches; nearby-knowledge and same-scope fallback can recover usable formal questions without inventing content.
- Test coverage summary:
  - rejects full question content in AI组卷 Provider plan payload;
  - rejects target count above 80;
  - rejects target/section count mismatch;
  - asserts default target count 30 and max target count 80;
  - asserts personal advanced learner platform-only selection;
  - asserts content admin platform-only selection;
  - asserts organization advanced employee/admin platform plus same-organization enterprise source;
  - excludes AI-generated drafts, other-organization snapshots, and taken-down snapshots;
  - asserts exact, nearby-knowledge, same-scope degradation and insufficient-source result.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts`
  - Result: pass after implementation.
- `npm.cmd run typecheck`
  - First result: fail due invalid local fixture enum value.
  - Remediation: changed test fixture to existing project question type enum.
  - Final result: pass.
- `npm.cmd run lint`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
  - First result: fail on two new TypeScript files.
  - Remediation: ran scoped Prettier write on those two files only.
  - Final result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-plan-and-select-backend-contract-2026-07-06`
  - Result: pass.
  - Scope scan: 8 changed files, all within task allowlist.
  - Sensitive evidence scan: pass.
  - Terminology scan: pass.

## Boundary Confirmation

- Dependency change: none.
- Package or lockfile change: none.
- Schema, migration, seed change: none.
- DB runtime access: not executed.
- Provider call: not executed.
- Browser/runtime/e2e: not executed.
- staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.
