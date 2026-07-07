# 2026-07-07 全角色 UIUX 一致性收口执行方案

Task id: `full-role-uiux-consistency-closeout-2026-07-07`

Branch: `codex/full-role-uiux-consistency-closeout-2026-07-07`

## Goal

完成分支 8：对分支 2-7 已落地的学员端、组织后台、内容后台、运营后台与 `super_admin` 工作区做全角色一致性收口。

本分支只核销跨分支不一致、遗漏的状态/文案/测试覆盖与矩阵登记；不新增功能，不扩大业务语义，不处理 Provider、DB、env、依赖、schema/migration/seed、fixture、截图、e2e、staging/prod/deploy 或 Cost Calibration。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- AI generation SSOT and recontract overlays from 2026-07-02, 2026-07-05, and 2026-07-06.
- Full-role UIUX source implementation entry, remediation baseline, batch 0-5 baselines, local design-board materialization, baseline design review, and branch 2-7 evidence/audit.
- Repository-external design board:
  `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`.

## Scope

Allowed:

- Files touched or explicitly scoped by branches 2-7.
- Targeted cross-role unit tests.
- Branch 8 task plan, evidence, audit, project state, and task queue.
- Total matrix status/closure notes if needed.

Forbidden:

- `package.json`, lockfiles, `.env*`, DB schema, migrations, seed, fixture, Provider execution/configuration, screenshots, e2e artifacts, raw DOM, staging/prod/deploy, Cost Calibration.
- Runtime role, login, authorization, `effectiveEdition`, organization-context, quota, content lifecycle, or Provider semantics.
- New feature surfaces, broad refactors, unrelated formatting, or reopening old superseded findings without fresh current evidence.

## Cross-Role核销清单

| Area                 | Required closeout                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Learner shell        | Personal and organization learners keep desktop-readable shell, bounded navigation, and context band while preserving mobile-first behavior.                                   |
| Learner AI           | Standard learners/employees show pure unavailable state; advanced contexts show context, mode, parameters, boundary, result/history.                                           |
| Organization admin   | Standard admin remains standard-unavailable for advanced routes; advanced admin keeps training/analytics/AI entries and organization-to-training handoff.                      |
| Content workspace    | Content admin and `super_admin` share lifecycle-first formal content, resource, knowledge, and AI draft/review/adoption vocabulary.                                            |
| Operations workspace | `ops_admin` and `super_admin` keep summary-first operations surfaces; plaintext `redeem_code` product UI exception remains role-limited and never appears in evidence.         |
| Super admin          | Operations/content authority remains discoverable; organization workspace requires explicit organization context and never shows login-like wording for a valid admin session. |
| Shared states        | Empty, error, disabled, unavailable, missing-context, no-result, draft/review/adoption, quota/provider-unavailable copy stays role-aware and redacted.                         |

## Validation Plan

1. Inspect branch 2-7 source/test diff surface and existing targeted tests.
2. Add or adjust targeted cross-role unit tests for any current inconsistency found.
3. Run focused role matrix test set covering learner, admin shell, organization, content, operations, and AI UI.
4. Run `npm.cmd run lint`.
5. Run `npm.cmd run typecheck`.
6. Run `npm.cmd run test:unit`.
7. Run scoped Prettier check for touched files.
8. Run `git diff --check`.
9. Run Module Run v2 precommit and prepush gates.

## Adversarial Review Focus

- UI visibility cannot grant advanced capability, organization context, quota, or content lifecycle bypass.
- Standard roles cannot see usable advanced AI or `企业训练` controls.
- Advanced entries remain discoverable for eligible roles.
- AI组卷 wording stays plan-and-select and does not claim Provider/backend completion.
- Organization AI output stays organization training draft; content AI output stays review/adoption draft.
- Operations does not become content owner; content does not become operations owner.
- `super_admin` does not bypass redaction, content lifecycle, or organization context.
- Evidence remains脱敏 and records only paths, file labels, command names, statuses, and safe counts.

## Planned Evidence

- Evidence: `docs/05-execution-logs/evidence/2026-07-07-full-role-uiux-consistency-closeout-evidence.md`
- Audit: `docs/05-execution-logs/audits-reviews/2026-07-07-full-role-uiux-consistency-closeout-adversarial-audit.md`

Cost Calibration Gate remains blocked.
