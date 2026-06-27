# Layer 3 Staging Prod Deploy Pre-Release Approval Package Plan

Task id: `layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27`

Branch: `codex/staging-pre-release-approval-package-20260627`

Task kind: `docs_state_approval_package`

## Approval Boundary

This task consumes the current Goal serial high-risk package approval for
`layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27`.

It may update only:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`

This package may define isolated staging resources, deploy target requirements, rollback owner, monitoring owner,
incident route, allowed accounts/data, no-prod-data boundary, prod/deploy separation strategy, redaction rules, and
follow-up execution text.

It must not execute staging/prod/deploy, connect to DB, open `.env*`, read credentials, call Providers, execute Cost
Calibration, run browser/dev-server/e2e, mutate runtime data, modify source/tests/scripts/package/lockfiles/schema/
migration/seed, touch payment/external-service, execute OCR/export, move archive/index entries, create PRs, force push,
or claim release readiness/final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/02-architecture/interfaces/phase-11-cloud-adapter-readiness-contract.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-owner-assignment-staging-boundary-packet.yaml`
- `docs/05-execution-logs/evidence/2026-06-22-preview-staging-resource-boundary-planning.md`
- `docs/05-execution-logs/evidence/2026-06-22-preview-owner-acceptance-owner-assignment-staging-boundary-packet.md`
- `docs/05-execution-logs/acceptance/2026-06-23-provider-cost-staging-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum.md`

## Requirement Decision Map

- Layer 1 remains complete by prior role/entry/permission evidence; this task does not change it.
- Layer 2 minimum local business loop remains the local PostgreSQL test-owned `rejected` review-command evidence; this
  task does not change it.
- Layer 3 Provider smoke passed for `openai_compatible` / `alibaba-qwen` / `qwen3.7-max` / `dashscope.aliyuncs.com`.
- Layer 3 Cost Calibration minimum local single-sample estimate passed and was rolled up.
- Layer 3 staging/pre-release is not executed in this task. This package defines the next execution boundary and must
  preserve prod/deploy/release/final Pass blocks.

## Existing Staging Readiness Facts

- ADR-004 and ADR-005 require strict `dev` / `staging` / `prod` isolation.
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md` records a historical external readiness snapshot:
  domain applied for, DNS not configured, ICP pending, cloud server not purchased, and database service not purchased.
- `preview-owner-acceptance-owner-assignment-staging-boundary-packet.yaml` records `laozhuang` as the single owner model
  and names owner slots for staging resource, monitoring, incident, rollback, stop, data, and redaction.
- No current document read by this task registers a concrete isolated staging URL, deploy target, staging database,
  object storage, callback origin, or staging credential alias as executable.

These facts make the next staging execution task safe to seed, but not safe to assume a runnable target. If no concrete
target is registered when execution starts, the execution task must close as blocked evidence only.

## Approval Package Boundary

```yaml
stagingPreReleaseApprovalPackage:
  stagingScope: staging_only_no_prod
  ownerModel:
    accountableOwnerRef: laozhuang
    rollbackOwner: laozhuang
    monitoringOwner: laozhuang
    incidentOwner: laozhuang
    stopOwner: laozhuang
    evidenceRedactionOwner: laozhuang
  isolatedResourcesRequiredBeforeExecution:
    stagingRuntimeTarget: required_registered_staging_url_or_registered_staging_deploy_target
    stagingDatabase: isolated_staging_database_or_namespace_required_if_db_is_used
    stagingObjectStorage: dedicated_bucket_or_strict_staging_prefix_required_if_storage_is_used
    authCallbackOrigin: staging_only_origin_required_if_auth_flow_is_used
    secretBoundary: no_secret_value_output_no_env_file_content_recording
    providerBoundary: provider_disabled_unless_separately_approved_for_staging
  allowedAccountsAndData:
    accountClass: owner_acceptance_or_synthetic_staging_account_only
    dataClass: synthetic_or_reviewed_non_sensitive_sample_data_only
    productionData: forbidden
    productionDatabaseClone: forbidden
    productionObjectStorageReuse: forbidden
  executionCapsForSuccessor:
    maxStagingTargets: 1
    maxDeployOrSmokeAttempts: 1
    maxRuntimeValidationRounds: 1
    browserOrE2E: blocked_without_fresh_expansion
    screenshotsTraceCookieLocalStorageEvidence: forbidden
    providerCall: blocked
    costCalibration: blocked
    paymentExternalService: blocked
    ocrExport: blocked
    prodDeploy: blocked
  redaction:
    evidenceAllowedFields:
      - stagingTargetLabel
      - targetType
      - targetRegistrationStatus
      - deployOrSmokeExecuted
      - requestOrCommandCount
      - passFailBlocked
      - capStatus
      - redactionStatus
      - stopCondition
      - forbiddenActionChecklist
    forbiddenEvidence:
      - secret
      - token
      - databaseUrl
      - authorizationHeader
      - rawRequest
      - rawResponse
      - rawLog
      - rawPageText
      - rawPrompt
      - rawProviderPayload
      - rawGeneratedAiContent
      - fullPaperOrMaterialContent
      - screenshot
      - trace
      - cookie
      - localStorage
  stopConditions:
    - no_registered_isolated_staging_target
    - any_prod_target_or_prod_data_needed
    - any_env_secret_value_or_unregistered_credential_needed
    - second_deploy_or_second_smoke_needed
    - browser_e2e_screenshot_trace_cookie_or_local_storage_needed
    - provider_cost_payment_ocr_export_needed
    - raw_private_or_sensitive_evidence_needed
    - mechanism_gate_failure
```

## Successor Execution Boundary

Seed `layer-3-staging-pre-release-redacted-execution-2026-06-27` as the next serial task.

The successor may proceed only if, at execution start, the durable state or queue records exactly one concrete isolated
staging target label that does not expose a secret value. If the target is absent, ambiguous, not isolated, or appears to
be production, the successor must stop and write blocked evidence under its own task without attempting deploy, smoke,
browser, DB, Provider, credential, payment, OCR, export, or prod work.

## Risk Defenses

- No execution happens in this package.
- The package separates staging-only validation from prod deploy and release decisions.
- Historical external readiness is treated as stale-but-blocking until newer durable evidence names a concrete staging
  target.
- The successor execution task is capped to one target and one deploy-or-smoke attempt with no browser/e2e and no
  screenshots/traces/cookies/localStorage evidence.
- Failure or missing target must close as blocked evidence; it must not expand into unregistered deployment, credential,
  DB, Provider, or browser work.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to execute staging/prod/deploy in this package.
- Any need to read `.env*`, credential values, raw logs, raw requests/responses, Provider payloads, raw prompts, raw
  responses, or raw generated AI content.
- Any need to modify source/tests/scripts/package/lockfiles/schema/migration/seed.
- Any need for browser/dev-server/e2e, DB, Provider, Cost Calibration, payment/external-service/OCR/export.
- Any need to record screenshot, trace, cookie, localStorage, raw page text, raw row data, or private data.
- Any mechanism gate failure that cannot be repaired inside the six allowed files.
- Any release readiness or final Pass claim.
