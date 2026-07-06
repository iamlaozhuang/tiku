# 2026-07-06 Organization Admin AI Training UI Recontract Evidence

## Metadata

- Task id: `ai-training-org-admin-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-org-admin-ui-recontract-2026-07-06`
- Date: 2026-07-06
- Scope: local source and focused unit evidence only.
- Redaction: no credential, session, cookie, token, env value, DB URL, DB row, internal id, Provider payload, raw prompt, raw AI output, full material, full question, full paper, screenshot, DOM, or private fixture value recorded.

## Requirement Mapping Result

- Recontract SSOT: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Implemented package: organization advanced admin AI training content UI.
- Covered decisions:
  - organization admin page presents `企业 AI 训练内容`;
  - AI出题 page presents `训练题草稿` and submit label `生成训练题草稿`;
  - AI组卷 page presents `训练试卷草稿` and submit label `生成训练试卷草稿`;
  - organization AI出题 visible default is `3`, max `10`;
  - organization AI组卷 visible default is `30`, max `80`;
  - organization AI组卷 shows `平台正式题库` plus `本企业已发布训练题`;
  - organization AI组卷 shows source preference options `均衡使用`, `优先使用企业题`, and `优先使用平台题`;
  - organization AI组卷 shows structured knowledge coverage options, with `均衡覆盖` default;
  - organization paper draft next step includes edit, adjust, employee preview, save, and publish-oriented actions;
  - organization question draft next step uses question-oriented actions.
- Not covered by this package:
  - content admin UI repair;
  - DB-backed runtime;
  - Provider execution;
  - browser role matrix;
  - staging/prod/deploy;
  - Cost Calibration.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts -t "organization admin AI"`
- RED result: failed before implementation, 2 failed and 33 skipped.
- Observed failure summary: organization admin pages still showed old organization AI titles and old default/count/source-action contract.
- GREEN focused command: `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts -t "organization admin AI"`
- GREEN focused result: passed, 2 passed and 33 skipped.
- Regression command: `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- Regression result: passed, 2 files and 41 tests.

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

## Final Validation

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
  - Result: pass; scoped files formatted.
- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
  - Result: pass, 2 files, 41 tests.
- `npm.cmd run typecheck`
  - Result: pass.
- `npm.cmd run lint`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-training-org-admin-ui-recontract-2026-07-06`
  - Result: pass.
  - Scope scan: 8 changed files, all within task allowlist.
  - Sensitive evidence scan: pass.
  - Terminology scan: pass.
