# Owner Preview Local Walkthrough Preparation Package

Task id: `owner-preview-local-walkthrough-preparation-package-2026-06-30`

## What This Package Is

This is a docs/state-only preparation package for the owner to personally walk through the local Tiku experience in a
browser. It gives role lists, flow checklists, stop boundaries, and a redacted issue template.

This package is not an actual walkthrough, not browser evidence, not release readiness, not final Pass, and not Provider
or Cost Calibration evidence.

## Local Startup Precheck

Before opening the browser, the owner should check:

- The repo is on the intended local branch or `master` after the docs package has been merged.
- Any local service points only to `dev` / local resources; do not use staging, prod, cloud, or customer data.
- `.env.local` exists if the app needs it, but do not paste, screenshot, or copy any value into notes.
- Private role account material stays outside this repo and is used only by the owner as manual login input.
- Provider/AI real-call behavior is disabled or treated as a hard stop before submit.
- Any local database content is synthetic or test-owned; do not inspect or record raw rows.
- Browser notes record only role labels, page/flow labels, visible state summaries, and pass/fail/gap decisions.
- Do not record screenshots, traces, raw DOM, localStorage, cookies, tokens, sessions, Authorization headers, or raw
  URLs containing internal identifiers.

## Recommended Local Startup Commands

Codex did not run these commands in this task. They are owner-side suggestions only.

```powershell
docker compose up -d tiku-postgres
pnpm.cmd dev
```

Then open:

```text
http://localhost:3000
```

Optional, only if the owner intentionally wants to refresh local synthetic dev data and accepts the local-data effect:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1
```

Do not run the seed command if the goal is to preserve current local state. Do not paste seed output into issue notes if
it includes sensitive or detailed business content.

## Role List

Use role labels instead of real names, account identifiers, emails, phones, or internal IDs.

| Role label                  | Human description          | Primary purpose to inspect                                                 |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `anonymous_user`            | 未登录用户                 | Login entry, protected-route denial, safe unauthenticated state.           |
| `student`                   | 学员通用入口               | Student home, authorization status, ordinary learner navigation.           |
| `personal_standard_student` | 个人标准授权用户           | Standard learning, no usable advanced AI entry, clear unavailable states.  |
| `personal_advanced_student` | 个人高级授权用户           | Learner `AI训练`, `AI出题`, `AI组卷`, practice-like AI content boundary.   |
| `org_standard_admin`        | 企业标准版管理员           | Organization workspace basics, employee/auth summaries, advanced denial.   |
| `org_advanced_admin`        | 企业高级版管理员           | Organization analytics, `企业训练`, organization `AI出题` / `AI组卷`.      |
| `org_standard_employee`     | 企业标准版员工             | Organization-authorized learning, no advanced AI or training leakage.      |
| `org_advanced_employee`     | 企业高级版员工             | Assigned `企业训练`, learner AI workflows, privacy boundary.               |
| `content_admin`             | 内容/题库运营管理员        | Formal `question`, `material`, `paper`, `knowledge_node`, AI draft review. |
| `ops_admin`                 | 平台/运营管理员            | `user`, `organization`, `employee`, `redeem_code`, `authorization`, logs.  |
| `super_admin_boundary`      | 超级管理员/Prompt 治理边界 | Only note whether prompt governance is separated; do not edit prompts.     |

## Recommended Walkthrough Order

1. `anonymous_user`: confirm protected pages do not expose private surfaces.
2. `personal_standard_student`: confirm standard learner paths and advanced-unavailable states.
3. `personal_advanced_student`: inspect learner AI entries without triggering real Provider calls.
4. `org_standard_admin`: inspect organization workspace basics and advanced denial states.
5. `org_advanced_admin`: inspect analytics, training, and organization AI entry boundaries.
6. `org_standard_employee`: inspect standard organization learner boundaries.
7. `org_advanced_employee`: inspect assigned training and learner AI boundaries.
8. `content_admin`: inspect formal content and AI draft/review boundaries.
9. `ops_admin`: inspect operations, authorization, employee import, and redacted logs.
10. Review all gaps and mark whether each blocks later deployment preparation.

## Cross-Role Checklist

Apply this to every page/flow:

- Navigation is discoverable without typing hidden URLs.
- The visible role, `organization`, source `edition`, computed `effectiveEdition`, `profession`, `level`, and `subject`
  context is understandable where relevant.
- Loading, Empty, Error, Permission denied, advanced-unavailable, success, confirmation, and failure states are clear.
- Chinese UI is natural and role-appropriate; raw enum or database labels are not user-facing unless paired with a
  Chinese explanation on an admin technical surface.
- Direct route access fails safely for disallowed roles.
- No ordinary page exposes credentials, raw logs, prompts, Provider payloads, raw AI output, raw DB rows, internal IDs,
  plaintext `redeem_code`, PII, or complete business content.

## Role Flow Checklists

### `anonymous_user`

- Open the root or login entry.
- Try one protected learner route and one backend route by navigation only if already known from UI.
- Expected: login or denied state appears; no private navigation, data table, logs, or content details are visible.
- Stop if the page reveals session material, internal IDs, or private role data.

### `personal_standard_student`

- Confirm student home shows authorized learning context.
- Inspect `practice`, `mock_exam`, `exam_report`, and `mistake_book` entry clarity.
- Confirm `AI训练`, learner `AI出题`, and learner `AI组卷` are unavailable or clearly gated.
- Expected: no advanced AI action is usable; upgrade guidance does not imply payment, pricing, or Cost Calibration.

### `personal_advanced_student`

- Confirm learner `AI训练` is discoverable.
- Inspect `AI出题` form labels, required inputs, quota/blocked state, and failure state without submitting a real call.
- Inspect `AI组卷` form labels, distribution controls, and result boundary without recording generated content.
- Expected: generated content, if already visible from local state, is personal learning content and not formal
  `question` or formal `paper`.

### `org_standard_admin`

- Confirm the organization workspace is separate from global operations.
- Inspect employee/auth status summaries where available.
- Try to find analytics, `企业训练`, organization `AI出题`, and organization `AI组卷`.
- Expected: advanced surfaces are denied or standard-unavailable, not blank or broken.

### `org_advanced_admin`

- Inspect `organization analytics` summaries and filters.
- Inspect `企业训练` creation/management flow states without publishing or mutating real data unless the owner
  explicitly chooses a local test-owned action.
- Inspect organization `AI出题` and `AI组卷` entry forms without triggering real Provider calls.
- Expected: organization-owned drafts/training proposals remain separate from formal platform content and formal
  `mock_exam`.

### `org_standard_employee`

- Confirm learner surface shows organization context.
- Inspect ordinary learning entry points.
- Confirm no usable `企业训练`, learner `AI出题`, or learner `AI组卷` entry is exposed.
- Expected: direct advanced routes are denied or standard-unavailable.

### `org_advanced_employee`

- Inspect assigned `企业训练` list/detail states: no-task, active, expired, completed, and progress if available.
- Inspect learner AI entries without submitting real Provider calls.
- Confirm organization admins can see only redacted usage/summary, not raw generated content or raw employee answers.
- Expected: employee AI output does not become formal `practice`, `mock_exam`, `exam_report`, `mistake_book`,
  `question`, or `paper` by itself.

### `content_admin`

- Inspect formal `question`, `material`, `paper`, `paper_section`, `paper_asset`, `knowledge_node`, and tag surfaces.
- Inspect content `AI出题` and `AI组卷` draft/review entry states without triggering Provider calls.
- Confirm formal adoption requires human review and does not directly publish generated content.
- Expected: content admin cannot enter global ops, Provider config, Cost Calibration, deploy, payment, OCR/export, or
  external-service execution.

### `ops_admin`

- Inspect `user`, `organization`, `employee`, `redeem_code`, `authorization`, `personal_auth`, `org_auth`, resource,
  `knowledge_base`, `audit_log`, and `ai_call_log` summary surfaces.
- Confirm employee import/template flows do not require `profession`, `level`, `subject`, `edition`, or internal scope
  IDs as import inputs.
- Confirm `redeem_code` lists do not expose plaintext codes.
- Confirm `audit_log` and `ai_call_log` show redacted summaries only.
- Expected: content authoring, organization training/analytics, Provider config, Cost Calibration, deploy, payment,
  OCR/export, and external-service execution are unavailable.

### `super_admin_boundary`

- Only inspect whether prompt governance is separated from ordinary `ops_admin`.
- Do not edit `prompt_template`, Provider config, model settings, or prompt text.
- Expected: prompt/template governance remains a separately approved boundary.

## AI / Provider Stop Boundary

Allowed during owner preview:

- Inspect visible labels, route availability, disabled/enabled state, validation copy, and safe redacted status.
- Record role label, page/flow label, status label, and redacted pass/fail summary.

Stop before:

- Submitting a form that may call a real Provider.
- Reading or changing Provider key, endpoint, fallback, `model_config`, prompt template, quota default, or cost setting.
- Capturing prompt text, Provider payload, raw AI input, raw AI output, complete generated `question`, complete generated
  `paper`, or full generated material.
- Running Cost Calibration, pricing, quota measurement, or real-provider quality evaluation.

## Issue Recording Template

Use one row per issue. Keep observations short and redacted.

| Field                         | Value                                                  |
| ----------------------------- | ------------------------------------------------------ |
| `recordId`                    | `OWNER-PREVIEW-001`                                    |
| `role`                        | One role label from this package                       |
| `pageOrFlow`                  | Page or workflow label, no internal IDs                |
| `observedSummary`             | Redacted visible behavior summary                      |
| `expectedBehavior`            | Expected user-facing behavior                          |
| `severity`                    | `critical`, `major`, `minor`, `polish`                 |
| `blocksDeploymentPreparation` | `yes`, `no`, or `unknown`                              |
| `requiresSeparateApproval`    | `yes`, `no`, or `unknown`                              |
| `sensitiveDataChecked`        | `yes` only if no forbidden info is recorded            |
| `nextAction`                  | Docs clarification, local repair task, or blocked gate |

Markdown row format:

```markdown
| OWNER-PREVIEW-001 | org_advanced_admin | organization analytics | Redacted observed summary | Expected behavior | major | yes | unknown | yes | local repair task |
```

## Sensitive Information Ban List

Do not record:

- account passwords, credentials, cookies, tokens, sessions, localStorage, Authorization headers, or secret URLs;
- `.env*` contents, database URLs, connection strings, API keys, Provider keys, model endpoints, or registry tokens;
- raw DB rows, internal IDs, auto-increment IDs, public identifier inventories, PII, email, phone, or plaintext
  `redeem_code`;
- raw DOM, screenshots, traces, HAR files, HTML reports, or browser storage dumps;
- Provider payloads, prompts, raw AI input, raw AI output, full AI-generated `question`, or full AI-generated `paper`;
- complete `question`, `paper`, `material`, `resource`, `chunk`, employee answer text, or raw uploaded files;
- real customer, production, staging, cloud, payment, OCR/export, or external-service data.

## Owner Safety Notes

- Use localhost only: `http://localhost:3000` or `http://127.0.0.1:3000`.
- Keep private account material outside the repo and outside issue notes.
- If a page asks for a real Provider call, payment, deploy, export, OCR, staging, production, schema migration, or seed
  reset decision, stop and record a blocked gate instead.
- If sensitive data appears on screen, do not copy it; record only that a sensitive-data exposure was observed and mark
  severity.
- Do not label the result as release-ready or final Pass. The output of your walkthrough is only an owner issue list and
  next-task decision.

## Completion Criteria For The Owner Walkthrough

The manual owner walkthrough is ready to stop when:

- every selected role has either a pass summary or issue rows;
- every issue row has `blocksDeploymentPreparation` and `requiresSeparateApproval` filled;
- sensitive-data checks are confirmed for every recorded row;
- Provider, DB, seed, staging/prod, deployment, payment, external-service, final Pass, and Cost Calibration gates remain
  explicitly separated.
