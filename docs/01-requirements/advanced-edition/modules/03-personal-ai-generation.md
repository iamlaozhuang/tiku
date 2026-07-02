# Advanced Edition Learner AI Generation Requirements

## Purpose

Define the learner-facing experience for AI question generation and AI `paper` generation.

## Source Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`

## Scope

- Personal advanced users request AI generated learning content within allowed `personal_auth` and computed `effectiveEdition`.
- Organization advanced employees request AI generated learning content within allowed `org_auth`, `organization`, and computed `effectiveEdition`.
- Both personal advanced users and organization advanced employees must have discoverable AI question generation and AI `paper` generation entries after login.
- Generated content may use formal `question`, `paper`, and `knowledge_node` metadata as read-only sources when allowed.
- Generated output stays in the learner AI learning content domain. Personal output is owned by the user; organization employee output is scoped to the employee/user inside the organization authorization context.
- Personal learning entrypoints default to the personal authorization context when available. Organization context is used only for organization entrypoints or when the user explicitly chooses to use organization authorization.
- The approved learner entry label for role-separated MVP repair is `AI训练`, with visible actions for `AI出题` and AI `paper` generation (`AI组卷`).
- `personal_standard_student` must not receive advanced AI generation capability. The acceptable standard outcome is hidden advanced entry, clear upgrade guidance, or clear denial for direct advanced routes.
- `personal_advanced_student` must see a discoverable `AI训练` entry after login; direct URL-only access is not acceptable.
- `org_standard_employee` must not see learner `AI训练` from organization context.
- `org_advanced_employee` must see learner `AI训练` when valid advanced `org_auth` and organization context permit it.

## Current SSOT Baseline

2026-07-02 后续 AI出题 / AI组卷 任务必须读取 `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md` 作为当前需求恢复入口。

- `personal_advanced_student` 使用学员端 `AI训练`，包含 `AI出题` 和 `AI组卷`。
- `org_advanced_employee` 使用组织授权上下文中的学员端 `AI训练`，包含 `AI出题` 和 `AI组卷`。
- `personal_standard_student` 和 `org_standard_employee` 不获得高级 AI 生成能力；可接受结果仍是隐藏、升级引导、清晰拒绝或不可用状态。
- 当前验收基线只覆盖已记录的 local owner-preview / bounded Provider 范围，不声明生产可用、发布就绪、最终 Pass 或 Cost Calibration。

## Acceptance Boundaries

- The learner entry is visible and obvious for eligible advanced learners; requiring manual URL input is not acceptable.
- The learner home or equivalent primary learner surface must make `AI训练` discoverable without explaining a hidden route outside the workflow.
- The UI must distinguish personal and organization authorization context before consuming organization quota.
- Standard learners and standard organization employees must receive clear unavailable/denied states for direct advanced AI route access.
- Personal AI generated content is visible to the owning user.
- Organization employee AI generated content is visible to the owning employee/user by default.
- Organization admins can see redacted employee AI usage, quota, and audit summaries for organization-context usage, but cannot see raw generated content, prompt, raw input/output, generated content summaries, single-task details, or task-list summaries.
- Generated content does not automatically become formal `question` or `paper`.
- Generated content does not create formal `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Adoption into formal `question` or `paper` draft flows requires a separate review and governance path.
- The system must not automatically switch context to obtain a higher `effectiveEdition` or more quota.

## Non-Goals

- No automatic formal content publishing.
- No provider cost measurement.
- No payment integration.
- No code-stage queue seeding.

Cost Calibration Gate remains blocked pending fresh explicit approval.
