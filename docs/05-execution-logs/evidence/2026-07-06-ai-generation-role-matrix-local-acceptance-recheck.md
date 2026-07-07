# 2026-07-06 AI Generation Role Matrix Local Acceptance Recheck Evidence

## Metadata

- Task id: `ai-generation-role-matrix-local-acceptance-recheck-2026-07-06`
- Branch: `codex/ai-generation-role-matrix-local-acceptance-recheck-2026-07-06`
- Scope: local source/unit role-matrix recheck plus narrow synthetic localhost browser denial smoke.
- Redaction: no credential, session, cookie, token, header, env value, DB URL, raw DB row, internal id, PII, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, screenshot, trace, raw DOM, private fixture value, employee raw answer, or plaintext `redeem_code` is recorded.

## Requirement Mapping Result

Mapped against `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`.

- Standard roles checked in source/unit scope:
  - `personal_standard_student`
  - `org_standard_employee`
  - `org_standard_admin`
- Advanced roles checked in source/unit scope:
  - `personal_advanced_student`
  - `org_advanced_employee`
  - `org_advanced_admin`
  - `content_admin`
- Browser smoke checked only synthetic admin cross-workspace denial:
  - `content_admin`
  - `ops_admin`
- Provider-enabled sample was not executed.
- DB-backed runtime role matrix was not executed.

## Source / Unit Recheck

Command:

```text
npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/personal-ai-generation-request-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts
```

Result:

- Exit code: `0`
- Test files: `7 passed`
- Tests: `165 passed`

Covered aggregate checks:

- learner home shows AI训练 only for advanced personal or advanced organization employee capability;
- learner home hides advanced learner AI entry when capability is absent;
- learner / employee AI训练 uses tabs without submitting on mode switch;
- AI出题 visible default quantity is `3`;
- AI组卷 visible default quantity is `30`;
- personal learner AI组卷 source is platform formal question bank;
- organization employee AI组卷 source includes platform formal question bank plus same-organization enterprise source;
- employee AI组卷 source preference and enterprise submit label are present;
- personal / employee local request route rejects non-advanced effective authorization before request persistence;
- personal / employee local request route rejects out-of-range quantity before request persistence;
- personal advanced AI组卷 uses platform formal questions only;
- organization advanced employee AI组卷 uses organization-context source assembly before result materialization;
- admin AI surfaces wire content admin and organization advanced admin routes to role-specific product surfaces;
- organization standard admin UI has no submit action for advanced AI generation;
- admin local route denies organization standard admin direct POST and GET before task/history exposure;
- admin local route denies organization advanced admin direct access when service-computed capability is missing or false;
- admin Provider-disabled checks keep runtime bridge / missing Provider categories redacted and prevent result persistence;
- admin UI maps rejection categories to Chinese product wording and hides local technical wording;
- backend workspace role guard requires service-computed advanced organization capability and keeps content, operations, and organization surfaces separated.

## Synthetic Browser Smoke

First command:

```text
npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --reporter=line --trace=off
```

First result:

- Exit code: `1`
- Category: setup preflight only.
- Reason: localhost port already had a running service; no test body executed.

Rerun command:

```text
$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --reporter=line --trace=off
```

Rerun result:

- Exit code: `0`
- Browser project: chromium
- Test files: `1 passed`
- Tests: `2 passed`

Covered aggregate checks:

- synthetic `content_admin` cannot access operations workspace browser data;
- synthetic `ops_admin` cannot access content authoring browser data;
- page shows user-facing denial state before denied backend data routes are called;
- synthetic session marker is not visible in page text;
- no screenshot or trace was requested.

## Static Gates

Command:

```text
git diff --check
```

Result:

- Exit code: `0`

Command:

```text
npm.cmd run typecheck
```

Result:

- Exit code: `0`

Command:

```text
npm.cmd run lint
```

Result:

- Exit code: `0`

Command:

```text
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md docs/05-execution-logs/evidence/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md
```

Result:

- First run: exit code `1`, two new Markdown files needed formatting.
- Scoped write: exit code `0`, formatted only the two new evidence/audit files.
- Final check: exit code `0`.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-role-matrix-local-acceptance-recheck-2026-07-06
```

Result:

- Exit code: `0`
- Scope scan: `5` changed files, all within task allowlist.
- Requirement SSOT readiness: pass.
- Sensitive evidence scan: pass.
- Terminology scan: pass.

## Boundary Confirmation

- Dependency change: none.
- Package or lockfile change: none.
- Source or test change: none.
- Schema, migration, seed change: none.
- Direct DB runtime access: not executed.
- Database mutation: not executed.
- Provider-disabled: pass in source/unit route and UI scope.
- Provider-enabled small sample: not executed; requires separate bounded approval.
- Browser: partial, synthetic cross-workspace denial smoke only.
- DB-backed runtime: not executed.
- staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.

## Conclusion Buckets

| Dimension                     | Result                                          |
| ----------------------------- | ----------------------------------------------- |
| source/unit                   | pass                                            |
| DB-backed runtime             | not tested                                      |
| browser                       | partial                                         |
| Provider-disabled             | pass in source/unit scope                       |
| Provider-enabled small sample | not tested / requires separate bounded approval |
| release readiness             | not claimed                                     |
| production usability          | not claimed                                     |
| staging                       | not executed / requires fresh approval          |
| Cost Calibration              | not executed / requires fresh approval          |
