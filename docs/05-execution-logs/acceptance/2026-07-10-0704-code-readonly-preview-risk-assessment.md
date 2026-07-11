# 2026-07-10 0704 Code Readonly Preview Risk Assessment

## Status

- taskId: `0704-code-readonly-preview-risk-assessment-2026-07-10`
- branch: `codex/0704-code-readonly-preview-risk-assessment`
- assessmentMode: product code read-only, docs/state/evidence writable
- decision: `defer_code_review_findings`
- browserRuntime: not executed
- directDatabaseConnection: not executed
- ProviderExecution: not executed
- stagingProdDeploy: not executed

## Executive Decision

Current source/test/config evidence is strong for localhost business closure and ordinary preview preparation planning, but it is not clean enough to mark code as fully ready for preview preparation.

The defer reason is a code-level Provider/environment governance finding: the owner-preview Qwen runtime control is wired into AI request routes by default and is disabled for production, but the route-level enablement condition still depends on runtime environment classification and provider credential availability. Before any task creates or injects preview/staging env values or enables Provider traffic, this needs a dedicated hardening or explicit Provider gate decision.

Safe next move:

- Continue docs-only and resource planning tasks that do not create env, secret, Provider, staging, deploy, DB, or browser runtime actions.
- Do not start any env/secret injection, Provider-enabled preview preparation, or staging execution until `owner-preview-provider-gate-hardening` or equivalent Provider policy gate is closed.

## Decision Rule Result

| Result option                        | Status   | Reason                                                                                                  |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `code_ready_for_preview_preparation` | rejected | One code review finding remains in Provider/env default enablement behavior.                            |
| `defer_code_review_findings`         | selected | No P0/P1 auth/privacy/data-boundary bug found, targeted tests pass, but Provider/env hardening remains. |
| `block_preview_preparation`          | rejected | No direct proof of current prod exposure, sensitive leakage, data crossing, or gate failure was found.  |

## Code Map

| Surface                   | File count | Assessment use                                              |
| ------------------------- | ---------- | ----------------------------------------------------------- |
| `src/app/api/v1`          | 125        | Public route wiring, AI route Provider controls.            |
| `src/server/services`     | 285        | Authorization, organization, AI/RAG, logs, training, stats. |
| `src/server/repositories` | 68         | Persistence boundary and runtime DB dependency checks.      |
| `src/server/contracts`    | 108        | API DTO, redaction, runtime bridge, log governance.         |
| `src/server/validators`   | 141        | Input normalization and API query guards.                   |
| `src/server/mappers`      | 40         | DB-to-API field mapping and redaction mapping.              |
| `src/features`            | 28         | Admin/student state and route surface behavior.             |
| `tests`                   | 112        | Unit/component/contract coverage.                           |
| source/test matched tests | 349        | Repository-wide test file inventory count.                  |

## Dimension Assessment

| Dimension                              | Status | Evidence anchor                                                                                             | Notes                                                                                                 |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Authorization and edition boundary     | pass   | `effective-authorization-service`, `edition-aware-authorization-service`, targeted authorization tests.     | `effectiveEdition`, `personal_auth`, `org_auth`, and upgrade decisions are service-layer concerns.    |
| Role and route boundary                | pass   | `admin-workspace-role-guard-service`, admin workspace guard tests.                                          | Admin workspaces and organization advanced routes are guarded beyond menu visibility.                 |
| Multitenancy and organization boundary | pass   | `organization-training-service`, `organization-analytics-service`, organization route tests.                | Organization scope is carried through service/route layers; cross-organization denial has tests.      |
| Data-domain separation                 | pass   | organization training/analytics tests, personal AI learning-session/result tests, content/RAG tests.        | Enterprise training, formal learning, AI result, and content domains have separation checks.          |
| AI/RAG safety boundary                 | defer  | `owner-preview-qwen-visible-ai-runtime-control`, AI runtime bridge tests, RAG mapper/validator tests.       | RAG/citation paths pass; Provider default route wiring needs hardening before env/Provider prep.      |
| Log and privacy boundary               | pass   | `admin-ai-audit-log-ops-contract`, `audit-ai-call-log-reference-service`, admin log redaction tests.        | Contracts use summaries/status categories and raw payload exclusion markers.                          |
| Exception and degradation behavior     | pass   | `route-error-response`, Provider-disabled runtime bridge tests, failure/degradation acceptance baseline.    | Unexpected route errors use generic envelope; Provider-disabled paths are covered.                    |
| API contract consistency               | pass   | `api-response`, route handler tests, validator/mapping tests.                                               | Standard `{ code, message, data, pagination? }` shape remains central.                                |
| Input validation and safety            | pass   | validators and route tests for auth, AI, RAG, logs, pagination, organization routes.                        | Normalizers and route-level tests cover key risky input surfaces.                                     |
| Frontend state completeness            | pass   | admin/student UI tests for loading/empty/error/unauthorized/standard-unavailable states.                    | No browser runtime executed; assessment relies on component/unit coverage only.                       |
| Config and environment assumptions     | defer  | `owner-preview-qwen-visible-ai-runtime-control`, AI request route wiring, ADR-005/staging readiness design. | Production is disabled, but preview/staging env classification and Provider kill switch need closure. |
| Data model and migration consistency   | pass   | repository runtime checks, schema tests, prior localhost acceptance evidence.                               | No migration/schema execution was done; no new migration dependency was introduced.                   |
| Test coverage credibility              | pass   | 30 targeted files / 298 targeted tests passed.                                                              | Selected tests cover the code-risk dimensions rather than every historical long-chain test.           |
| Build and runtime risk                 | pass   | lint/typecheck/diff passed; route and service tests passed before report authoring.                         | Browser runtime and staging/prod runtime were not executed.                                           |
| Dependency and supply-chain risk       | pass   | `package.json` read-only inspection, no package/lockfile change.                                            | Existing dependencies unchanged; no new package or script added.                                      |

## Finding CR-001

- category: `Provider/env governance`
- severity: `defer`
- code anchors:
  - `src/app/api/v1/personal-ai-generation-requests/route.ts`
  - `src/app/api/v1/content-ai-generation-requests/route.ts`
  - `src/app/api/v1/organization-ai-generation-requests/route.ts`
  - `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- observation: AI request routes default to owner-preview runtime bridge control. The control is disabled in production and tests confirm redaction behavior, but non-production Provider execution is controlled by runtime environment and credential availability rather than a preview/staging Provider policy artifact.
- risk: A future preview/staging setup could accidentally enable real Provider traffic if env classification or credential injection is wrong.
- required before env/Provider preview prep: add or close a Provider gate that proves disabled-by-default preview behavior, explicit allowlist, quota, kill switch, logging allowlist, and redacted evidence policy.
- current containment: no Provider call was executed in this task; no env values were read or recorded.

## Non-Claims

This assessment does not claim:

- staging readiness;
- production readiness;
- release readiness;
- deployment readiness;
- Provider readiness;
- Cost Calibration completion;
- DB migration readiness;
- browser/runtime acceptance pass;
- full e2e pass.

## Result

Current code decision category: `defer_code_review_findings`.

The project can continue approval-gated planning that does not touch env, secret, Provider, staging, prod, deploy, DB, or browser runtime. Before any Provider-capable preview preparation proceeds, close the Provider/env hardening finding.
