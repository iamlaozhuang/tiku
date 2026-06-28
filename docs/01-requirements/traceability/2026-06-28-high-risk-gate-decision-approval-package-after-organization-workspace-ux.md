# High-Risk Gate Decision Approval Package After Organization Workspace UX

## Status

- Date: 2026-06-28
- Scope: approval package only after local organization workspace UX closure.
- Execution status: not executed.
- Cost Calibration Gate remains blocked pending fresh explicit approval.
- Release readiness and final Pass are not claimed.

## Current Local Baseline

Organization workspace UX is locally closed at source/unit/contract/browser layers:

- source-only shell/navigation/gated copy: closed;
- source-only page states: closed;
- permission contract TDD: closed;
- credential-assisted local browser role matrix: closed;
- active queue archive and local closure rollup: closed.

This local baseline does not prove DB-backed `org_auth`, `auth_upgrade`, Provider, Cost Calibration, staging/prod, payment, OCR, export, release readiness, or final Pass.

## Gate Options

| Option | Gate                                          | Risk level | Execution in this task | Recommended decision                                           |
| ------ | --------------------------------------------- | ---------- | ---------------------- | -------------------------------------------------------------- |
| A      | DB-backed organization authorization proof    | high       | not executed           | Prepare a separate DB-read-only or test-owned target task only |
| B      | Provider and Cost Calibration                 | high       | not executed           | Keep blocked until Provider/cost packet is explicitly approved |
| C      | Isolated staging smoke                        | high       | not executed           | Require concrete isolated staging target and redaction rules   |
| D      | Payment/OCR/export/external-service decisions | high       | not executed           | Keep blocked unless product scope is explicitly selected       |

## Option A: DB-Backed Organization Authorization Proof

Purpose:

- prove `org_standard_admin` and `org_advanced_admin` behavior from DB-backed `org_auth`, `auth_upgrade`, and organization context instead of only visible local UI/session evidence.

Allowed only with fresh approval:

- read-only DB connection to an explicitly named local test-owned target, or an explicitly approved local seeded/dev target;
- task-scoped route/service verification that records only role labels, route labels, state labels, counts, and redacted pass/fail;
- no raw DB rows, no internal ids in URLs, no credentials or connection strings in evidence.

Forbidden:

- destructive DB writes, migrations, seeds, `drizzle-kit push`;
- `.env*` changes or secret output;
- production/staging DB access;
- Provider, Cost Calibration, payment, OCR, export, deploy.

Copyable approval text:

```text
我批准准备并执行一个单独的本地 DB-backed organization authorization proof 任务，用于验证 org_standard_admin 与 org_advanced_admin 的 org_auth/auth_upgrade/organization context 行为。范围仅限明确命名的本地 test-owned 或已批准本地 dev 目标；证据只记录角色、路由、状态、数量和脱敏结果。禁止记录凭据、连接串、token、cookie、localStorage、原始 DB 行、原始 DOM、截图、trace、Provider payload、prompt、原始 AI 输出、明文 redeem_code、员工主观答案或完整 question/paper 内容。禁止 schema/migration/seed/destructive DB、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、PR、force push、release readiness 和 final Pass。
```

## Option B: Provider And Cost Calibration

Purpose:

- decide whether organization AI generation can call a real Provider and whether quota/cost calibration can begin.

Allowed only with fresh approval:

- a separate Provider/Cost approval package with exact model/provider, maximum request count, prompt redaction plan, output redaction plan, cost ceiling, stop conditions, and evidence shape;
- Provider call execution only after that package is approved.

Forbidden in this package:

- real Provider/model calls;
- Provider endpoint/model/fallback configuration changes;
- env/secret read/write or `.env*` modification;
- Cost Calibration execution or quota default decisions.

Copyable approval text:

```text
我批准先准备 Provider 与 Cost Calibration 的单独审批包，不执行 Provider 调用或 Cost Calibration。审批包必须列明 provider/model、最大请求数、成本上限、prompt/output 脱敏规则、停止条件、证据字段和回滚/禁用策略。未经我后续 fresh approval，禁止读取/修改 .env* 或 secret、调用 Provider、配置 provider fallback、执行 Cost Calibration、决定生产 quota 默认值、触碰 staging/prod/deploy/payment/OCR/export/external-service、PR、force push、release readiness 和 final Pass。
```

## Option C: Isolated Staging Smoke

Purpose:

- prove organization workspace UX and route gates on an isolated staging target after local evidence is closed.

Allowed only with fresh approval:

- a concrete staging target URL and environment owner;
- redacted smoke evidence with route labels, role labels, state labels, counts, and pass/fail only;
- explicit statement that production is untouched.

Forbidden:

- production access;
- new cloud resource creation or deploy without a separate staging task;
- secret output, raw browser artifacts, DB rows, Provider payloads, prompt/output;
- release readiness/final Pass.

Copyable approval text:

```text
我批准准备一个 isolated staging smoke 计划包，目标是验证 organization workspace UX 与标准/高级角色路由门。必须先列明具体 staging URL、环境 owner、账号来源、证据脱敏规则、停止条件和 production untouched 证明。本批准不允许实际部署、不允许修改云资源或 secret、不允许连接 prod、不允许 Provider/Cost/payment/OCR/export/external-service、不允许记录凭据、token、cookie、localStorage、原始 DOM、截图、trace、DB 行、Provider payload、prompt、原始 AI 输出、明文 redeem_code、员工主观答案或完整 question/paper 内容；不允许 PR、force push、release readiness 或 final Pass。
```

## Option D: Payment, OCR, Export, External Service

Purpose:

- decide whether any non-local product scope should be opened after UX local closure.

Current recommendation:

- keep blocked. These are not required to close organization workspace UX local proof.

Copyable approval text:

```text
我暂不批准 payment、OCR、export 或 external-service 执行。请仅保留为 blocked gates，并在后续需要时分别准备单独审批包，列明业务目标、允许文件、禁止文件、数据脱敏、外部服务边界、成本/回滚/停止条件和证据格式。禁止顺手执行或合并到 DB、Provider、staging/prod、release readiness 或 final Pass 任务中。
```

## Recommended Sequencing

1. If the goal is to improve confidence without environment work, choose Option A as a local DB-backed proof package.
2. If the goal is AI generation readiness, prepare Option B package but keep Provider and Cost Calibration blocked until explicitly approved.
3. If owner acceptance requires environment proof, prepare Option C after a concrete isolated staging target exists.
4. Keep Option D blocked unless the product owner explicitly selects one scope.

## Non-Execution Statement

This approval package did not execute DB, Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, external-service, browser, e2e, PR, force push, release readiness, or final Pass.
