# 2026-07-08 organization training list management evidence

## Scope

- Branch: `codex/org-training-list-management`.
- Change: organization advanced admin enterprise-training lifecycle list UX.
- Added: lifecycle filters, read-only detail panel, list-level `查看`, `复制为新草稿`, `下架`, and existing draft `发布` action visibility.
- Explicitly not changed: DB/schema/migration/seed/fixture, Provider call chain, package/lockfile, formal content writes, employee answer flow, organization AI generation flow, staging/prod/deploy/env/secret/Cost Calibration.

## Requirement Mapping Result

- Source requirement: advanced edition organization training requires organization admins to manage training drafts, publish employee-visible training, and keep published versions immutable except lifecycle actions.
- Implementation mapping: lifecycle list now separates draft, published, and taken-down states; published rows expose read-only view, copy-to-new-draft, and takedown entries.
- Boundary mapping: formal platform question/paper stores, Provider execution, database schema, and organization AI generation flows remain unchanged.

## Red Test

- Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- Result: failed as expected before implementation.
- Failure class:
  - lifecycle filter group was missing;
  - published version list card did not expose `复制为新草稿` or `下架`.

## Validation

- Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- Result: pass, 1 file, 11 tests.

- Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts src/server/services/organization-training-route.test.ts --reporter=dot`
- Result: pass, 2 files, 51 tests.

- Command: `npm.cmd run lint`
- Result: pass.

- Command: `npm.cmd run typecheck`
- Result: pass.

- Command: `npm.cmd exec -- prettier --check <touched files>`
- Result: pass.

- Command: `git diff --check`
- Result: pass.

- Command: `npm.cmd run test:unit -- --reporter=dot`
- Result: pass, 349 files, 1774 tests.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-list-management-2026-07-08`
- Result: pass after current-task pointer and allowedFiles sync.

## Localhost Browser Check

- Target: local `http://127.0.0.1:3000/organization/organization-training`.
- Result: page rendered organization training workspace with lifecycle filters, creation entry, and visible lifecycle actions.
- Interaction check: selected `已发布` filter; filter state changed to `已发布`.
- Screenshot artifacts, local private only:
  - `D:/tiku-local-private/browser-audits/2026-07-08-org-training-list-management/org-training-list-loaded-after-stage1.png`
  - `D:/tiku-local-private/browser-audits/2026-07-08-org-training-list-management/org-training-list-published-filter-after-stage1.png`

## Adversarial Review

- Authorization remains service-enforced; UI only exposes actions declared by existing metadata-only lifecycle DTO.
- Published versions remain immutable in the UI; editing path is copy-to-new-draft.
- Takedown uses the existing route and requires confirmation plus reason.
- Standard organization admin unavailable state remains covered by unit tests.
- No new dependency, route contract, database object, Provider path, or package metadata change.
- UI/evidence do not expose tokens, session values, cookies, env values, DB URLs, raw DB rows, Provider payloads, raw prompts, raw AI output, full questions, papers, materials, or numeric internal ids.

## Redaction Notes

- Evidence records command-level summaries only.
- Browser validation used screenshots and bounded visible-state checks only.
- No raw DOM, storage, session, cookie, token, env, DB, or Provider content was recorded.
- Screenshots are stored outside the repository in local private storage and are not committed.
