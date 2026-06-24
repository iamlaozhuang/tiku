# Task Plan: requirement-ssot-reading-governance-2026-06-24

## Required Reading

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/
- docs/04-agent-system/sop/task-lifecycle-governance.md
- docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Decision Map

- Requirement SSOT 入口以 `docs/01-requirements/00-index.md` 为根。
- 高级版任务必须补读 `docs/01-requirements/advanced-edition/00-index.md`。
- 授权、卡密、标准/高级版有效版本任务必须补读 `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` 和 ADR-007。
- role-separated / 角色验收任务必须读取最新 role-separated alignment 和 role experience fulfillment matrix。
- `docs/05-execution-logs/` 只作为证据、历史和上下文，不能单独作为需求 SSOT。

## Requirement Mapping

- 本任务把需求读取协议落地到 SOP、需求索引、任务计划模板、pre-commit hardening 和 smoke 测试。
- 后续 implementation / docs_requirement_alignment / docs_only / mechanism_hardening 任务必须在 task plan 中记录 SSOT 读取和 requirement mapping。
- acceptance runtime walkthrough 任务可用 `Role Mapping Result` 或 `Acceptance Mapping Result` 作为运行时验收映射结果。

## Evidence-Only Sources

- docs/05-execution-logs/evidence/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/05-execution-logs/acceptance/2026-06-23-role-separated-mvp-repair-issue-list-and-requirement-decisions.md

这些文件只用于理解历史证据和本次机制需求来源，不作为新的需求 SSOT。

## Conflict Check

- 若 execution logs 中出现新需求，必须先进入 `docs/01-requirements/` 或 traceability 决策，再进入实现任务。
- 若最新 traceability 与 module 文档无法裁决冲突，必须先创建 docs-only 需求对齐任务。
- 本任务不裁决新的产品需求，只建立读取与映射门禁。

## Scope

- Task id: requirement-ssot-reading-governance-2026-06-24
- Branch: codex/requirement-ssot-reading-governance-20260624
- Task kind: mechanism_hardening
- Allowed files:
  - docs/04-agent-system/state/project-state.yaml
  - docs/04-agent-system/state/task-queue.yaml
  - docs/04-agent-system/state/autodrive-control-schema.yaml
  - docs/04-agent-system/operating-manual.md
  - docs/04-agent-system/sop/requirement-ssot-reading-governance.md
  - docs/04-agent-system/sop/task-lifecycle-governance.md
  - docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md
  - docs/01-requirements/00-index.md
  - docs/01-requirements/advanced-edition/00-index.md
  - scripts/agent-system/New-TaskPlan.ps1
  - scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1
  - scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
  - scripts/agent-system/Test-ModuleRunV2RequirementSsotReadiness.Smoke.ps1
  - docs/05-execution-logs/task-plans/2026-06-24-requirement-ssot-reading-governance.md
  - docs/05-execution-logs/evidence/2026-06-24-requirement-ssot-reading-governance.md
  - docs/05-execution-logs/audits-reviews/2026-06-24-requirement-ssot-reading-governance.md
- Blocked files:
  - .env\*
  - package.json
  - package-lock.yaml
  - package-lock.json
  - pnpm-lock.yaml
  - src/\*\*
  - tests/\*\*
  - e2e/\*\*
  - src/db/schema/\*\*
  - drizzle/\*\*
  - playwright-report/\*\*
  - test-results/\*\*

## Implementation Notes

- 新增 SSOT 读取治理 SOP，并从需求入口和现有任务生命周期/覆盖审计 SOP 引用。
- 更新 task plan 模板，使新任务默认要求记录 SSOT Read List 和映射关系。
- 在现有 pre-commit hardening 脚本内局部新增 helper 和 SSOT readiness 检查，不做大重构。
- 新增 smoke 脚本覆盖通过、失败和 acceptance runtime 例外场景。
- 将 smoke 脚本登记到机制清单和 operating manual。

## Risk Gate

- Dependency change: blocked
- Database migration: blocked
- Auth or permission model runtime change: blocked
- Secret or environment change: blocked
- Destructive data operation: blocked
- Provider, Cost Calibration, staging/prod, payment, external service: blocked
- Merge or push: fresh approval required after local implementation unless task queue closeout policy explicitly permits

## Validation Commands

```powershell
npx.cmd prettier --check --ignore-unknown <changed files>
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2RequirementSsotReadiness.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId requirement-ssot-reading-governance-2026-06-24
```

## Evidence

- Evidence path: docs/05-execution-logs/evidence/2026-06-24-requirement-ssot-reading-governance.md
- Audit review path: docs/05-execution-logs/audits-reviews/2026-06-24-requirement-ssot-reading-governance.md
- Required reviews:
  - 机制覆盖复核
  - 误伤风险复核
