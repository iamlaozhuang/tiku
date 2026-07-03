# Advanced Edition Organization AI Generation Requirements

## Purpose

Define how advanced organization admins use AI question generation and AI `paper` generation for organization-owned content.

## Source Documents

- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`

## Scope

- `org_advanced_admin` requests AI question generation and AI `paper` generation inside valid advanced `org_auth` and
  organization scope.
- The generated output belongs to the `organization` and is managed by eligible `org_advanced_admin` users.
- Generated output may support organization-managed training or internal learning use after `org_advanced_admin`
  confirmation.
- Generated output must remain separate from platform formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` records.
- The organization backend must expose a discoverable entry; requiring manual URL input is not acceptable.
- The approved role-separated MVP entry labels are `AI出题` and `AI组卷` inside the organization advanced backend.
- `org_standard_admin` must not see or use organization AI generation. Direct route access must be denied or show standard-unavailable state.
- `org_advanced_admin` must see organization AI generation entries from the organization backend navigation or equivalent primary workspace surface.
- Organization-owned AI generation consumes organization quota according to the approved quota owner rules; exact point values remain under the Cost Calibration Gate.
- Organization admins do not see enterprise AI quota consumption summary in the first release.

## Current SSOT Baseline

2026-07-02 后续组织 AI出题 / AI组卷 任务必须读取 `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md` 作为当前需求恢复入口。

- `org_advanced_admin` 的组织后台入口为 `AI出题` 和 `AI组卷`。
- `org_standard_admin` 不获得组织 AI 生成能力；直接路由必须拒绝或展示标准版不可用状态。
- 组织 AI 生成输出属于 `organization` 草稿域，不直接写入平台正式 `question`、`paper`、`practice`、`mock_exam`、`exam_report` 或 `mistake_book`。
- 当前验收基线只覆盖已记录的 local owner-preview / bounded Provider 范围，不声明生产可用、发布就绪、最终 Pass 或 Cost Calibration。

## Acceptance Boundaries

- Eligible `org_advanced_admin` users can find an organization AI generation entry from the organization backend.
- The system checks effective advanced organization authorization before allowing generation.
- The organization backend landing and navigation must prove a separated organization admin workspace, not a redirect into system operations pages.
- Organization standard admin access to organization AI generation must fail with a clear denied/unavailable state.
- AI question generation and AI `paper` generation create trackable tasks and redacted operational evidence.
- Organization-owned AI output is not written into the platform formal question bank or paper library.
- Employee-visible training or paper-like assignments require explicit `org_advanced_admin` confirmation.
- Organization-owned AI output may be copied into an organization training draft, where generated stem, options,
  `standard_answer`, and `analysis` can be edited before publish.
- `evidence_status = none` blocks training draft publish or formal content adoption. `evidence_status = weak` requires
  explicit confirmation.
- Unpublished organization drafts are editable before publish.
- Published organization training/content cannot be directly edited; changes require copying to a new draft and publishing a new version.
- Takedown stops new employee answers while preserving historical result summaries and audit evidence.

## Confirmed Boundaries

- Organization admins cannot inspect raw employee learner AI outputs, Prompt text, raw AI input/output, Provider payload,
  global AI logs, or raw task payloads outside their scoped `organization`.
- Eligible `org_advanced_admin` users can inspect their own organization AI task status/history and generated output
  needed to review or copy into an organization training draft. Evidence and audit summaries for this activity remain
  redacted.
- `org_standard_admin` visibility is limited to authorization/status, scoped roster/status, and support surfaces.
  Organization AI usage summaries and training statistics require eligible `org_advanced_admin` scope.
- Organization admins do not see enterprise AI quota consumption summaries in the first release.
- Organization training unpublished drafts follow the first-release draft retention policy.
- Published organization training/content follows the approved long-term published retention policy.
- Employee statistics export and organization aggregate export remain deferred in the first release.

## Non-Goals

- No automatic platform formal content adoption.
- No direct publish to formal `paper` or formal `mock_exam`.
- No Provider, env/secret, staging/prod/cloud/deploy, payment, or Cost Calibration Gate work.
