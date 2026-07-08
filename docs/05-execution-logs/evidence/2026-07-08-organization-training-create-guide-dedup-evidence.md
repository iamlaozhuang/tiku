# Organization Training Create Guide Dedup Evidence

- Task: `organization-training-create-guide-dedup-2026-07-08`
- Branch: `codex/org-training-create-guide-dedup`
- Time: `2026-07-08T14:50:07-07:00`
- Scope: organization training create section copy/layout and focused unit test only.
- Evidence mode: redacted command status only; no credentials, session, cookie, token, env values, DB URL, DB rows, internal ids, Provider payload, raw prompt, raw AI output, full question, paper, material, or resource content.

## Preconditions

- Read `AGENTS.md`, project state, task queue, code taste rules, UI code standard, ADRs, advanced edition index, organization training requirements, and related traceability/evidence.
- Started from clean `master` aligned with `origin/master`.
- Created short branch from `origin/master`: `codex/org-training-create-guide-dedup`.
- No package/lockfile, DB/schema/migration/seed/fixture, Provider, AI chain, interface, DTO, service, or repository changes.

## Requirement Mapping Result

- `CT-REQ-016`: preserved the organization training four-step creation flow.
- `CT-REQ-055`: kept the change inside the advanced organization training admin surface.
- Advanced-edition module 04: reduced duplicate guidance without changing creation behavior.
- Batch 2 org-admin workspace baseline P1 item 3: creation area now keeps one progress guide and clearer content headings.

## Red / Green

- TDD red:
  - Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: failed for expected duplicate step guidance condition before UI change.
- Targeted unit:
  - Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, `1` file, `14` tests.

## Static Gates

- Command: `npm.cmd run lint`
  - Result: pass.
- Command: `npm.cmd run typecheck`
  - Result: pass.
- Command: `npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-08-organization-training-create-guide-dedup.md src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts`
  - Result: pass.
- Command: `git diff --check`
  - Result: pass.

## Localhost Browser Visibility Check

- Target: `http://127.0.0.1:3000/organization/organization-training`.
- Method: in-app browser, read-only route/visible-label check; no screenshot, no raw DOM dump, no browser storage access, no credential/session/cookie/token/localStorage capture.
- Result:
  - Route remained on allowed localhost organization training page.
  - Create section expanded with UI-only click.
  - Top progress guide showed one ordered list: `1选择来源`, `2配置训练`, `3设置范围`, `4预览发布`.
  - Content labels visible: `来源类型`, `训练配置`, `发布范围`, `发布检查`.
  - Lower duplicate step-heading set absent.
  - Old heading `新建企业训练四步向导` absent.
  - Framework/load failure overlay absent.
  - Browser console error count: `0`.

## Module Run V2 Gates

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-create-guide-dedup-2026-07-08`
  - Result: pass.
- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-create-guide-dedup-2026-07-08 -SkipRemoteAheadCheck`
  - Result: pass after repository checkpoint alignment.

## Pending Closeout Gates

- Post-merge master gates: pending until merge.
