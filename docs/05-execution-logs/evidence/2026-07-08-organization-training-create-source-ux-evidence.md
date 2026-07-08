# 2026-07-08 organization training create source UX evidence

## Scope

- Branch: `codex/org-training-create-source-ux`.
- Change: organization advanced admin enterprise-training creation entry and source/type clarity.
- Added: collapsed creation wizard, `题目训练` / `试卷训练` selector, organization AI handoff distinction for `AI出题结果` and `AI组卷结果`, safe links to existing organization AI pages.
- Explicitly not changed: API DTO, service, repository, DB/schema/migration/seed/fixture, Provider call chain, package/lockfile, formal content writes, employee answer flow, staging/prod/deploy/env/secret/Cost Calibration.

## Requirement Mapping Result

- Source requirement: enterprise training creation uses a four-step wizard and approved sources: platform paper snapshot, organization AI result, and manual grouping/manual questions.
- UX mapping: the list stays first; the wizard opens only after the admin chooses `新建企业训练`.
- Source mapping: organization AI result remains one approved source, while the UI clarifies the two upstream result kinds: `AI出题结果` and `AI组卷结果`.
- Shape mapping: `题目训练` and `试卷训练` are UI-only creation guidance in this stage; no new persistence contract was introduced.

## Red Test

- Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- Result: failed as expected before implementation.
- Failure class:
  - create wizard rendered immediately instead of behind the explicit entry;
  - source selector did not expose training shape or AI result kind controls.

## Validation

- Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- Result: pass, 1 file, 12 tests.

- Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts src/server/services/organization-training-route.test.ts --reporter=dot`
- Result: pass, 2 files, 52 tests.

- Command: `npm.cmd run lint`
- Result: pass.

- Command: `npm.cmd run typecheck`
- Result: pass.

- Command: `npm.cmd exec -- prettier --check <touched files>`
- Result: pass.

- Command: `git diff --check`
- Result: pass.

- Command: `npm.cmd run test:unit -- --reporter=dot`
- Result: pass, 349 files, 1775 tests.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-create-source-ux-2026-07-08`
- Result: pass.

## Localhost Browser Check

- Target: local `http://127.0.0.1:3000/organization/organization-training`.
- Result: default view showed the list surface without the creation wizard; clicking `新建企业训练` opened the wizard.
- Interaction check: selecting `企业 AI 结果` showed `AI出题结果`, `AI组卷结果`, `题目训练`, `试卷训练`, and existing organization AI page links.
- Screenshot artifacts, local private only:
  - `D:/tiku-local-private/browser-audits/2026-07-08-org-training-create-source-ux/before-open.png`
  - `D:/tiku-local-private/browser-audits/2026-07-08-org-training-create-source-ux/after-ai-source.png`

## Redaction Notes

- Evidence records command-level summaries only.
- Browser validation used screenshots and bounded visible-state checks only.
- No raw DOM, storage, session, cookie, token, env, DB, or Provider content was recorded.
- Screenshots are stored outside the repository in local private storage and are not committed.
