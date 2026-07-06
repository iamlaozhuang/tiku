# AI Paper Source Adapters Evidence

## Metadata

- Task id: `ai-paper-source-adapters-2026-07-06`
- Branch: `codex/ai-paper-source-adapters-2026-07-06`
- Date: 2026-07-06
- Base: stacked on package 1 local branch; package 1 has not been merged to `master`.
- Scope: local source adapter and focused unit evidence only.
- Redaction: no credential, session, cookie, token, env value, DB URL, DB row, internal id, Provider payload, raw prompt, raw AI output, full material, full question, full paper, screenshot, DOM, or private fixture value recorded.

## Requirement Mapping Result

- Recontract SSOT: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Implemented package: package 2, AI组卷 source adapter foundation.
- Covered decisions:
  - platform formal source maps from available platform question rows;
  - enterprise source v1 maps from same-organization published and not taken-down organization training question snapshots;
  - adapter output is metadata-only for selector input and does not expose full question, answer, analysis, option body, material body, or internal ids;
  - AI-generated drafts are not mapped by this adapter;
  - unsupported enterprise snapshot question types are skipped.
- Not covered by this package:
  - repository SQL expansion or DB runtime.
  - route wiring.
  - Provider instruction/parser update.
  - paper container persistence.
  - UI/UX.
  - browser acceptance.
  - staging/prod/deploy/Cost Calibration.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- src/server/services/ai-paper-source-adapter-service.test.ts`
- RED result: failed before implementation because `src/server/services/ai-paper-source-adapter-service.ts` did not exist.
- GREEN command: `npm.cmd run test:unit -- src/server/services/ai-paper-source-adapter-service.test.ts`
- GREEN result: passed, 1 test file, 3 tests.
- Combined focused unit command: `npm.cmd run test:unit -- src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts`
- Combined focused unit result: passed, 2 files, 8 tests.

## Validation Notes

- `npm.cmd run typecheck`
  - First result: fail due invalid local fixture enum value.
  - Remediation: changed test fixture to existing project enum value.
  - Final observed focused typecheck result: pass.
- `npm.cmd run lint`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
  - First result: fail on one new TypeScript file.
  - Remediation: ran scoped Prettier write on that file only.
  - Final result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-source-adapters-2026-07-06`
  - Result: pass.
  - Scope scan: 7 changed files, all within task allowlist.
  - Sensitive evidence scan: pass.
  - Terminology scan: pass.

## Known Limitation

- Existing organization training version question snapshots do not carry knowledge-node public ids or difficulty metadata. The adapter maps enterprise snapshot `difficulty` to `null` and knowledge-node arrays to `[]`. Later DB/repository enrichment can improve match quality, but this package intentionally avoids schema or DB query work.

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
