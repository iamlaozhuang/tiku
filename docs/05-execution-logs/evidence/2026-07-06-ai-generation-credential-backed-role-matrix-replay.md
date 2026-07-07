# 2026-07-06 AI Generation Credential-Backed Role Matrix Replay Evidence

## Metadata

- Task id: `ai-generation-credential-backed-role-matrix-replay-2026-07-06`
- Branch: `codex/ai-generation-credential-backed-role-matrix-replay-2026-07-06`
- Scope: localhost browser role-matrix replay for AI出题 / AI组卷 entry and denial states.
- Redaction: no credential, session, cookie, token, header, env value, DB URL, raw DB row, internal id, PII, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, screenshot, trace, raw DOM, private fixture value, employee raw answer, or plaintext `redeem_code` is recorded.

## Requirement Mapping Result

Mapped against `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`.

Roles replayed:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`

Covered route/surface categories:

- learner `AI训练` route for personal and employee roles;
- organization admin AI出题 / AI组卷 routes;
- content admin AI出题 / AI组卷 routes;
- standard personal, employee, and organization admin denial/unavailable states.

Not covered:

- Provider-enabled generation submit;
- AI generation DB-backed closed-loop mutation;
- screenshots, traces, raw DOM, or page body dumps;
- staging, production, deploy, release readiness, production usability, or Cost Calibration.

## Browser Replay Command

Command category:

```text
node <inline redacted credential-backed role matrix replay>
```

Execution notes:

- Reused existing localhost service on `127.0.0.1:3000`.
- Loaded private role fixture in memory only.
- Used local session runtime for seven role labels.
- Navigated role-specific AI routes.
- Did not submit AI generation forms.
- Did not request screenshots or traces.
- Output contained only role labels, route labels, status categories, and aggregate counts.

Initial adversarial attempt result:

- Exit code: `1`
- Aggregate: `15 pass`, `2 fail`
- Failure categories:
  - `personal_advanced_ai_training_incomplete`
  - `org_employee_advanced_ai_training_incomplete`
- Root cause after source inspection and safe boolean diagnostics: script expected AI组卷 controls to be visible without switching tabs and searched for `AI组卷` as a button, while the UI correctly exposes `AI组卷` as an ARIA tab.
- Source defect found: no.

Focused diagnostic result:

- Exit code: `0`
- Category: safe boolean diagnostics only.
- Finding: advanced learner and employee browser pages showed AI训练 and AI出题 markers; AI组卷 markers require switching the ARIA tab.
- Sensitive output: none.

Final replay result:

- Exit code: `0`
- Aggregate: `17 pass`, `0 fail`, `0 partial`

Final aggregate rows:

| Role                        | Route category            | Result | Category                                    |
| --------------------------- | ------------------------- | ------ | ------------------------------------------- |
| `personal_standard_student` | login                     | pass   | `session_established`                       |
| `personal_standard_student` | learner AI route          | pass   | `standard_student_ai_unavailable`           |
| `personal_advanced_student` | login                     | pass   | `session_established`                       |
| `personal_advanced_student` | learner AI route          | pass   | `personal_advanced_ai_training_visible`     |
| `org_standard_employee`     | login                     | pass   | `session_established`                       |
| `org_standard_employee`     | learner AI route          | pass   | `standard_student_ai_unavailable`           |
| `org_advanced_employee`     | login                     | pass   | `session_established`                       |
| `org_advanced_employee`     | learner AI route          | pass   | `org_employee_advanced_ai_training_visible` |
| `org_standard_admin`        | login                     | pass   | `session_established`                       |
| `org_standard_admin`        | organization AI出题 route | pass   | `org_standard_admin_ai_unavailable`         |
| `org_standard_admin`        | organization AI组卷 route | pass   | `org_standard_admin_ai_unavailable`         |
| `org_advanced_admin`        | login                     | pass   | `session_established`                       |
| `org_advanced_admin`        | organization AI出题 route | pass   | `org_advanced_admin_question_visible`       |
| `org_advanced_admin`        | organization AI组卷 route | pass   | `org_advanced_admin_paper_visible`          |
| `content_admin`             | login                     | pass   | `session_established`                       |
| `content_admin`             | content AI出题 route      | pass   | `content_admin_question_visible`            |
| `content_admin`             | content AI组卷 route      | pass   | `content_admin_paper_visible`               |

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
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md docs/05-execution-logs/evidence/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md
```

Result:

- First run: exit code `1`, two new Markdown files needed formatting.
- Scoped write: exit code `0`, formatted only the two new evidence/audit files.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-credential-backed-role-matrix-replay-2026-07-06
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
- Direct DB inspection: not executed.
- Browser runtime: pass for credential-backed role entry/denial replay.
- AI generation form submission: not executed.
- Provider-enabled call: not executed.
- Provider-disabled: not re-submitted in this browser replay; covered by prior source/unit package.
- DB-backed generation closed loop: not executed in this replay.
- staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.

## Conclusion Buckets

| Dimension                     | Result                                           |
| ----------------------------- | ------------------------------------------------ |
| source/unit                   | pass via prior package 6 focused tests           |
| DB-backed runtime             | not tested for generation closed-loop mutation   |
| browser                       | pass for credential-backed role entry/denial     |
| Provider-disabled             | pass in prior source/unit scope; not resubmitted |
| Provider-enabled small sample | not tested / requires separate bounded approval  |
| release readiness             | not claimed                                      |
| production usability          | not claimed                                      |
| staging                       | not executed / requires fresh approval           |
| Cost Calibration              | not executed / requires fresh approval           |
