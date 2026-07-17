# P1 F-0132 Scope Correction Hotfix Authorization

Date: 2026-07-16

Status: approved

Human approval source: current user message in the Codex conversation on 2026-07-16.

Task ID: `p1-f0132-scope-correction-hotfix-2026-07-16`

Parent task: `p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`

Base: `5a5d9ac9c66f00991c17c3af7410958199d02a79`

Branch: `codex/p1-f0132-scope-correction-hotfix`

## Approved Scope

The user approved one independent governance hotfix that adds only `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts` to the active F-0132 task `allowedFiles` and establishes an exact, one-time, smoke-tested P1/Module Run transition-only guard path for that correction.

The hotfix may modify only the task queue's single allowlist insertion, the P1 Program guard and smoke, the Module Run pre-commit/pre-push guards and smokes, and this hotfix's approval, design, plan, evidence, and audit artifacts.

## Explicitly Preserved Hard Blocks

- Every other `in_progress` SHA drift remains hard-blocked.
- The bridge requires the exact base, branch, active task, `in_progress` status, file set, queue delta, and fresh approval artifact absent from the parent commit.
- A missing or extra path, any other queue change, invalid approval, wrong branch/base/task/status, product implementation, dependency, schema, migration, database, Provider, runtime/browser acceptance, P2, PR, force push, deployment, or audit-repository write remains blocked.
- This approval does not authorize `--no-verify`, hook bypass, history rewrite, broad allowlist expansion, or modification of the phase-11 test content inside the governance hotfix.
