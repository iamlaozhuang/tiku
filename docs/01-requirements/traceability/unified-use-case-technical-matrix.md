# Unified Use Case Technical Landing Matrix

## Scope

This matrix is derived from:

- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`

It maps requirement traceability rows to candidate architecture landing surfaces only. It does not inspect runtime
implementation, mark coverage, create a code audit, create an implementation queue, change schema, run e2e, call a
provider, read env/secret files, deploy, create a PR, force-push, or execute Cost Calibration Gate work.

## Field Model

Each landing row includes:

- `landingId`: stable audit id for this matrix.
- `sourceIds`: frozen source index ids carried into the row.
- `capabilityIds`: capability catalog ids carried into the row.
- `useCaseIds`: use case catalog ids carried into the row.
- `deltaIds`: edition delta ids carried into the row.
- `targetTechnicalLayer`: architecture layer or governance surface where a future task would inspect or implement.
- `candidateFilesOrModules`: candidate module paths or module families inferred from architecture and requirements.
- `implementationEligible`: future eligibility state; this is not implementation approval.
- `blockedGates`: gates that still block implementation or execution.
- `conflictRefs`: unresolved `CFX-*` references carried forward.
- `auditUseOnly`: `true` means this row must not seed implementation work.
- `notes`: boundary summary; no raw secret, provider payload, raw response, database URL, row data, prompt, or private
  content.

Candidate file/module paths are planning targets only. They are not evidence that the path exists or is implemented.

## Landing Rows

### LAND-AUTH-ACCOUNT-SESSION

- `sourceIds`: `STD-REQ-01`, `STD-STORY-01`, `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-PLAN-02`, `ADV-MOD-01`,
  `ADV-STORY-04`
- `capabilityIds`: `CAP-STD-ACCOUNT-SESSION`, `CAP-ADV-AUTH-CONTEXT`
- `useCaseIds`: `UC-STD-ACCOUNT-SESSION`, `UC-ADV-AUTH-CONTEXT-UPGRADE`
- `deltaIds`: `DELTA-AUTH-ACCOUNT-SESSION`
- `targetTechnicalLayer`: route handler/server action adapter, service, repository, model/schema, validator, mapper,
  UI surface
- `candidateFilesOrModules`: `src/app/api/v1/users/**`, `src/server/services/user-auth/**`,
  `src/server/repositories/user-auth/**`, `src/server/validators/user-auth/**`,
  `src/server/mappers/user-auth/**`, `src/db/schema/*user*`, `src/app/(auth)/**`, `src/app/(admin)/**`,
  `src/app/(student)/**`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: auth model, schema, API, service, UI, payment, env/secret, provider, deploy, and Cost Calibration
  gates remain blocked unless a later task approves exact files and validation.
- `conflictRefs`: `CFX-ORG-001`, `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: Standard session work and advanced edition context must remain separable; no code coverage is asserted here.

### LAND-PERSONAL-AUTH-REDEEM-QUOTA

- `sourceIds`: `STD-REQ-01`, `STD-STORY-01`, `STD-REQ-06`, `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-SPEC-03`,
  `ADV-MOD-01`, `ADV-MOD-06`, `ADV-STORY-04`
- `capabilityIds`: `CAP-STD-PERSONAL-AUTH`, `CAP-ADV-AUTH-CONTEXT`, `CAP-ADV-OPS-AUTH-QUOTA`
- `useCaseIds`: `UC-STD-PERSONAL-AUTH-REDEEM`, `UC-ADV-AUTH-CONTEXT-UPGRADE`, `UC-ADV-OPS-AUTH-QUOTA`
- `deltaIds`: `DELTA-PERSONAL-AUTH`
- `targetTechnicalLayer`: service, repository, model/schema, validator, mapper, admin UI, student UI, audit logging
- `candidateFilesOrModules`: `src/server/services/authorization/**`, `src/server/services/quota/**`,
  `src/server/repositories/authorization/**`, `src/server/repositories/quota/**`,
  `src/server/validators/authorization/**`, `src/server/mappers/authorization/**`,
  `src/db/schema/*authorization*`, `src/db/schema/*redeem-code*`, `src/app/(admin)/**`, `src/app/(student)/**`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: cleartext `redeem_code` outside the 2026-07-02 eligible operations UI exception, payment, provider
  measurement, env/secret, schema, and Cost Calibration
  gates remain blocked.
- `conflictRefs`: `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: This row can guide later auth/quota inspection but cannot authorize schema, payment, or provider work.

### LAND-ORG-AUTH-PORTAL

- `sourceIds`: `STD-REQ-00`, `STD-REQ-01`, `STD-REQ-06`, `STD-STORY-01`, `STD-STORY-06`, `ADV-SPEC-01`,
  `ADV-SPEC-02`, `ADV-MOD-04`, `ADV-MOD-05`, `ADV-STORY-02`, `ADV-STORY-03`
- `capabilityIds`: `CAP-STD-ORG-AUTH-OPS-MANAGED`, `CAP-STD-FUTURE-ORG-SELF-SERVICE-NON-GOAL`,
  `CAP-ADV-ORG-PORTAL-ADMIN`, `CAP-ADV-ORG-TRAINING-CONTENT`, `CAP-ADV-ORG-ANALYTICS`
- `useCaseIds`: `UC-STD-ORG-AUTH-MANAGED`, `UC-FUTURE-STANDARD-ORG-SELF-SERVICE-NON-GOAL`,
  `UC-ADV-ORG-PORTAL-ADMIN`, `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`, `UC-ADV-ORG-ANALYTICS-SUMMARY`
- `deltaIds`: `DELTA-ORG-AUTH-PORTAL`
- `targetTechnicalLayer`: admin UI, organization UI, route handler/server action adapter, service, repository,
  model/schema, contract, mapper, validator, audit logging
- `candidateFilesOrModules`: `src/app/(admin)/**`, `src/app/(organization)/**`,
  `src/app/api/v1/organizations/**`, `src/server/services/organization/**`,
  `src/server/repositories/organization/**`, `src/server/contracts/organization/**`,
  `src/server/mappers/organization/**`, `src/server/validators/organization/**`, `src/db/schema/*organization*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: organization portal implementation, privacy, export, staging/prod/cloud/deploy, schema, UI, and raw
  answer access remain blocked.
- `conflictRefs`: `CFX-ORG-001`, `CFX-FORMAL-001`
- `auditUseOnly`: `false`
- `notes`: Standard platform-managed enterprise authorization must stay separate from advanced organization portal work.

### LAND-FORMAL-CONTENT-QUESTION-PAPER

- `sourceIds`: `STD-REQ-02`, `STD-STORY-02`, `STD-REQ-06`, `STD-STORY-06`, `ADV-SPEC-02`, `ADV-MOD-03`,
  `ADV-MOD-04`, `ADV-STORY-01`, `ADV-STORY-05`, `STD-REQ-05`
- `capabilityIds`: `CAP-STD-QUESTION-CONTENT`, `CAP-STD-PAPER-LIFECYCLE`,
  `CAP-ADV-FORMAL-CONTENT-SEPARATION`, `CAP-ADV-PERSONAL-AI-QUESTION-GENERATION`,
  `CAP-ADV-PERSONAL-AI-PAPER-GENERATION`, `CAP-ADV-ORG-TRAINING-CONTENT`
- `useCaseIds`: `UC-STD-QUESTION-MATERIAL-MANAGE`, `UC-STD-PAPER-LIFECYCLE`,
  `UC-ADV-FORMAL-CONTENT-SEPARATION`, `UC-ADV-PERSONAL-AI-QUESTION-GENERATION`,
  `UC-ADV-PERSONAL-AI-PAPER-GENERATION`, `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
- `deltaIds`: `DELTA-FORMAL-CONTENT`
- `targetTechnicalLayer`: admin UI, service, repository, model/schema, storage boundary, mapper, validator, snapshot
  boundary, adoption governance
- `candidateFilesOrModules`: `src/app/(admin)/**`, `src/app/api/v1/questions/**`,
  `src/app/api/v1/exam-papers/**`, `src/server/services/question-paper/**`,
  `src/server/repositories/question-paper/**`, `src/server/contracts/question-paper/**`,
  `src/server/mappers/question-paper/**`, `src/server/validators/question-paper/**`, `src/db/schema/*question*`,
  `src/db/schema/*paper*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: provider/env/secret/quota/cost, storage/schema/UI, and formal adoption review gates remain blocked.
- `conflictRefs`: `CFX-FORMAL-001`, `CFX-AI-001`, `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: Later tasks must verify read, isolated output, and formal adoption paths separately.

### LAND-PRACTICE-MOCK-REPORT

- `sourceIds`: `STD-REQ-03`, `STD-STORY-03`, `STD-REQ-04`, `STD-STORY-04`, `ADV-SPEC-02`, `ADV-MOD-04`,
  `ADV-STORY-02`, `ADV-STORY-03`, `STD-REQ-02`
- `capabilityIds`: `CAP-STD-PRACTICE`, `CAP-STD-MOCK-EXAM`, `CAP-STD-EXAM-REPORT-MISTAKE-BOOK`,
  `CAP-ADV-EMPLOYEE-TRAINING-ANSWER`, `CAP-ADV-FORMAL-CONTENT-SEPARATION`
- `useCaseIds`: `UC-STD-PRACTICE`, `UC-STD-MOCK-EXAM`, `UC-STD-REPORT-MISTAKE-BOOK`,
  `UC-ADV-EMPLOYEE-TRAINING-ANSWER`, `UC-ADV-FORMAL-CONTENT-SEPARATION`
- `deltaIds`: `DELTA-PRACTICE-MOCK-REPORT`
- `targetTechnicalLayer`: student UI, employee UI, route handler/server action adapter, service, repository,
  model/schema, contract, mapper, validator, report snapshot boundary
- `candidateFilesOrModules`: `src/app/(student)/**`, `src/app/(organization)/**`,
  `src/app/api/v1/practices/**`, `src/app/api/v1/mock-exams/**`, `src/app/api/v1/exam-reports/**`,
  `src/server/services/student-experience/**`, `src/server/repositories/student-experience/**`,
  `src/server/contracts/student-experience/**`, `src/server/mappers/student-experience/**`,
  `src/server/validators/student-experience/**`, `src/db/schema/*answer-record*`, `src/db/schema/*exam-report*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: e2e, runtime implementation, organization snapshots, raw answer viewer, and provider gates for AI
  scoring remain blocked.
- `conflictRefs`: `CFX-FORMAL-001`, `CFX-ORG-001`, `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: Candidate surfaces are for later scoped inspection only; no student or employee answer content is recorded.

### LAND-AI-SCORING-AND-GENERATION

- `sourceIds`: `STD-REQ-00`, `STD-REQ-04`, `STD-STORY-04`, `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-SPEC-03`,
  `ADV-MOD-02`, `ADV-MOD-03`, `ADV-STORY-01`, `ADV-STORY-04`
- `capabilityIds`: `CAP-STD-AI-SCORING-EXPLANATION`, `CAP-STD-FUTURE-AI-GENERATION-NON-GOAL`,
  `CAP-ADV-AI-TASK-DOMAIN`, `CAP-ADV-PERSONAL-AI-QUESTION-GENERATION`,
  `CAP-ADV-PERSONAL-AI-PAPER-GENERATION`
- `useCaseIds`: `UC-STD-AI-SCORING-EXPLANATION`, `UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL`,
  `UC-ADV-AI-TASK-LIFECYCLE`, `UC-ADV-PERSONAL-AI-QUESTION-GENERATION`,
  `UC-ADV-PERSONAL-AI-PAPER-GENERATION`
- `deltaIds`: `DELTA-AI-SCORING-VS-GENERATION`
- `targetTechnicalLayer`: service, provider adapter boundary, worker/job, prompt template governance, repository,
  model/schema, mapper, validator, UI surface, audit logging
- `candidateFilesOrModules`: `src/server/services/ai-scoring/**`, `src/server/services/ai-task/**`,
  `src/server/repositories/ai-task/**`, `src/server/contracts/ai-task/**`, `src/server/mappers/ai-task/**`,
  `src/server/validators/ai-task/**`, `src/ai/**`, `src/db/schema/*ai-call-log*`, `src/app/(student)/**`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: provider call, model request, env/secret, quota, Cost Calibration, worker, schema, deploy, and cost
  gates remain blocked.
- `conflictRefs`: `CFX-AI-001`, `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: Standard AI scoring and advanced AI generation must remain edition-scoped; this row does not authorize model
  requests.

### LAND-RAG-KNOWLEDGE

- `sourceIds`: `STD-REQ-04`, `STD-STORY-04`, `STD-REQ-05`, `STD-STORY-05`, `STD-REQ-06`, `STD-STORY-06`,
  `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-MOD-03`, `ADV-STORY-01`
- `capabilityIds`: `CAP-STD-KN-RECOMMENDATION`, `CAP-STD-RAG-KNOWLEDGE-BASE`,
  `CAP-ADV-PERSONAL-AI-QUESTION-GENERATION`, `CAP-ADV-PERSONAL-AI-PAPER-GENERATION`,
  `CAP-ADV-FORMAL-CONTENT-SEPARATION`
- `useCaseIds`: `UC-STD-KN-RECOMMENDATION`, `UC-STD-RAG-KNOWLEDGE-BASE`,
  `UC-ADV-PERSONAL-AI-QUESTION-GENERATION`, `UC-ADV-PERSONAL-AI-PAPER-GENERATION`,
  `UC-ADV-FORMAL-CONTENT-SEPARATION`
- `deltaIds`: `DELTA-RAG-KNOWLEDGE`
- `targetTechnicalLayer`: service, repository, model/schema, resource ingestion boundary, vector/search boundary,
  citation mapper, validator, admin UI, student UI
- `candidateFilesOrModules`: `src/server/services/rag-knowledge/**`, `src/server/repositories/rag-knowledge/**`,
  `src/server/contracts/rag-knowledge/**`, `src/server/mappers/rag-knowledge/**`,
  `src/server/validators/rag-knowledge/**`, `src/db/schema/*knowledge*`, `src/db/schema/*resource*`,
  `src/db/schema/*embedding*`, `src/app/(admin)/**`, `src/app/(student)/**`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: dependency, vector provider, storage, schema, env/secret, provider/RAG execution, and cost gates
  remain blocked.
- `conflictRefs`: `CFX-PROVIDER-001`, `CFX-FORMAL-001`, `CFX-AI-001`
- `auditUseOnly`: `false`
- `notes`: This row cannot authorize dependency installation, vector work, raw source documents, or private file URLs.

### LAND-ORG-TRAINING

- `sourceIds`: `STD-REQ-00`, `STD-REQ-01`, `STD-REQ-06`, `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-MOD-04`,
  `ADV-STORY-02`, `ADV-STORY-03`, `ADV-STORY-05`
- `capabilityIds`: `CAP-STD-FUTURE-ORG-SELF-SERVICE-NON-GOAL`, `CAP-ADV-ORG-TRAINING-CONTENT`,
  `CAP-ADV-EMPLOYEE-TRAINING-ANSWER`, `CAP-ADV-ORG-PORTAL-ADMIN`
- `useCaseIds`: `UC-FUTURE-STANDARD-ORG-SELF-SERVICE-NON-GOAL`,
  `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`, `UC-ADV-EMPLOYEE-TRAINING-ANSWER`, `UC-ADV-ORG-PORTAL-ADMIN`
- `deltaIds`: `DELTA-ORG-TRAINING`
- `targetTechnicalLayer`: organization UI, employee UI, route handler/server action adapter, service, repository,
  model/schema, validator, mapper, versioning/snapshot boundary
- `candidateFilesOrModules`: `src/app/(organization)/**`, `src/app/(student)/**`,
  `src/app/api/v1/organization-trainings/**`, `src/server/services/organization-training/**`,
  `src/server/repositories/organization-training/**`, `src/server/contracts/organization-training/**`,
  `src/server/mappers/organization-training/**`, `src/server/validators/organization-training/**`,
  `src/db/schema/*organization-training*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: staging/prod/cloud/deploy, schema, UI, privacy, raw answer viewer, and formal adoption gates remain
  blocked.
- `conflictRefs`: `CFX-ORG-001`, `CFX-FORMAL-001`
- `auditUseOnly`: `false`
- `notes`: Advanced training remains isolated from formal `question` and `paper` records until separate governance.

### LAND-ORG-ANALYTICS

- `sourceIds`: `STD-REQ-06`, `STD-STORY-06`, `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-MOD-05`, `ADV-STORY-03`
- `capabilityIds`: `CAP-STD-ADMIN-OPS-LOGS`, `CAP-ADV-ORG-ANALYTICS`, `CAP-FUTURE-DATA-EXPORT`
- `useCaseIds`: `UC-STD-ADMIN-OPS-LOGS`, `UC-ADV-ORG-ANALYTICS-SUMMARY`, `UC-FUTURE-ORG-DATA-EXPORT`
- `deltaIds`: `DELTA-ORG-ANALYTICS`
- `targetTechnicalLayer`: organization UI, admin UI, service, repository, model/schema, mapper, contract, privacy
  filter, audit logging
- `candidateFilesOrModules`: `src/app/(organization)/**`, `src/app/(admin)/**`,
  `src/app/api/v1/organization-analytics/**`, `src/server/services/organization-analytics/**`,
  `src/server/repositories/organization-analytics/**`, `src/server/contracts/organization-analytics/**`,
  `src/server/mappers/organization-analytics/**`, `src/server/validators/organization-analytics/**`,
  `src/db/schema/*organization*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: export, raw sensitive viewer, external-service, provider, deploy, privacy, and schema gates remain
  blocked.
- `conflictRefs`: `CFX-ORG-001`, `CFX-AI-001`, `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: Online summary views and export must remain separate.

### LAND-OPS-QUOTA-LEDGER

- `sourceIds`: `STD-REQ-06`, `STD-STORY-06`, `ADV-SPEC-02`, `ADV-SPEC-03`, `ADV-MOD-06`, `ADV-STORY-04`,
  `GATE-B178-EV`, `GATE-B180-EV`
- `capabilityIds`: `CAP-STD-ADMIN-OPS-LOGS`, `CAP-ADV-OPS-AUTH-QUOTA`,
  `CAP-GATE-PROVIDER-STAGING-EXECUTION`
- `useCaseIds`: `UC-STD-ADMIN-OPS-LOGS`, `UC-ADV-OPS-AUTH-QUOTA`, `UC-GATE-PROVIDER-STAGING-EXECUTION`
- `deltaIds`: `DELTA-OPS-QUOTA`
- `targetTechnicalLayer`: admin UI, service, repository, model/schema, contract, mapper, validator, audit logging,
  provider gate policy
- `candidateFilesOrModules`: `src/app/(admin)/**`, `src/app/api/v1/quotas/**`,
  `src/server/services/quota/**`, `src/server/repositories/quota/**`, `src/server/contracts/quota/**`,
  `src/server/mappers/quota/**`, `src/server/validators/quota/**`, `src/db/schema/*quota*`,
  `src/db/schema/*audit-log*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: Cost Calibration, provider measurement, payment, external-service, env/secret, schema, and provider
  gates remain blocked.
- `conflictRefs`: `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: Blocked gate sources document future package requirements only; they are not execution approval.

### LAND-RETENTION-LOG-GOVERNANCE

- `sourceIds`: `STD-REQ-06`, `STD-STORY-06`, `ADV-SPEC-01`, `ADV-SPEC-03`, `ADV-MOD-07`, `ADV-STORY-06`
- `capabilityIds`: `CAP-STD-ADMIN-OPS-LOGS`, `CAP-ADV-RETENTION-LOG-GOVERNANCE`
- `useCaseIds`: `UC-STD-ADMIN-OPS-LOGS`, `UC-ADV-RETENTION-LOG-GOVERNANCE`
- `deltaIds`: `DELTA-RETENTION-LOG`
- `targetTechnicalLayer`: admin UI, service, repository, model/schema, audit logging, retention policy boundary,
  redaction boundary
- `candidateFilesOrModules`: `src/app/(admin)/**`, `src/app/api/v1/audit-logs/**`,
  `src/app/api/v1/ai-call-logs/**`, `src/server/services/audit-log/**`,
  `src/server/services/ai-call-log/**`, `src/server/repositories/audit-log/**`,
  `src/server/repositories/ai-call-log/**`, `src/server/mappers/audit-log/**`,
  `src/server/validators/audit-log/**`, `src/db/schema/*audit-log*`, `src/db/schema/*ai-call-log*`
- `implementationEligible`: `blocked_until_gate_approved`
- `blockedGates`: raw prompt viewer, provider response viewer, hard-delete executor, deploy, schema, and raw log access
  gates remain blocked.
- `conflictRefs`: None
- `auditUseOnly`: `false`
- `notes`: Only public ids, counts, statuses, timestamps, and redacted summaries may appear in later evidence.

### LAND-PAYMENT-NON-GOAL

- `sourceIds`: `STD-REQ-00`, `ADV-SPEC-02`, `ADV-SPEC-03`, `ADV-MOD-06`, `ADV-STORY-04`
- `capabilityIds`: `CAP-FUTURE-ONLINE-PAYMENT`, `CAP-ADV-AUTH-CONTEXT`, `CAP-ADV-OPS-AUTH-QUOTA`
- `useCaseIds`: `UC-FUTURE-ONLINE-PAYMENT`, `UC-ADV-AUTH-CONTEXT-UPGRADE`, `UC-ADV-OPS-AUTH-QUOTA`
- `deltaIds`: `DELTA-PAYMENT`
- `targetTechnicalLayer`: excluded/future external-service surface
- `candidateFilesOrModules`: no implementation candidate for current release; future payment modules would require a
  separate approved task before any path is named as executable work.
- `implementationEligible`: `false`
- `blockedGates`: payment, refund, invoice, reconciliation, external-service, env/secret, deployment, and provider
  gates remain blocked.
- `conflictRefs`: `CFX-PROVIDER-001`
- `auditUseOnly`: `false`
- `notes`: This row prevents quota/auth requirements from being misread as payment implementation approval.

### LAND-OCR-AUTO-IMPORT-NON-GOAL

- `sourceIds`: `STD-REQ-00`, `EXC-CODE-001`, `EXC-SCHEMA-001`, `STD-REQ-02`, `STD-STORY-02`
- `capabilityIds`: `CAP-FUTURE-OCR-AND-AUTO-IMPORT`, `CAP-STD-QUESTION-CONTENT`,
  `CAP-STD-PAPER-LIFECYCLE`
- `useCaseIds`: `UC-FUTURE-OCR-AUTO-IMPORT`, `UC-STD-QUESTION-MATERIAL-MANAGE`, `UC-STD-PAPER-LIFECYCLE`
- `deltaIds`: `DELTA-OCR-AUTO-IMPORT`
- `targetTechnicalLayer`: excluded/future OCR import surface
- `candidateFilesOrModules`: no current implementation candidate; scanned PDFs remain preprocessed outside the system.
- `implementationEligible`: `false`
- `blockedGates`: OCR, parser implementation, schema, storage, provider/external-service, and code work remain blocked.
- `conflictRefs`: None
- `auditUseOnly`: `false`
- `notes`: Excluded source ids are carried only to preserve the non-goal boundary.

### LAND-DATA-EXPORT-NON-GOAL

- `sourceIds`: `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-MOD-05`, `ADV-STORY-03`
- `capabilityIds`: `CAP-ADV-ORG-ANALYTICS`, `CAP-FUTURE-DATA-EXPORT`
- `useCaseIds`: `UC-ADV-ORG-ANALYTICS-SUMMARY`, `UC-FUTURE-ORG-DATA-EXPORT`
- `deltaIds`: `DELTA-DATA-EXPORT`
- `targetTechnicalLayer`: excluded/future export surface
- `candidateFilesOrModules`: no current implementation candidate; future export endpoints, file generation, and
  download surfaces require separate approval.
- `implementationEligible`: `false`
- `blockedGates`: export, file generation/download, external-service, privacy, deployment, and raw sensitive viewer
  gates remain blocked.
- `conflictRefs`: `CFX-ORG-001`
- `auditUseOnly`: `false`
- `notes`: Organization analytics summary must not imply data export.

### LAND-RUNTIME-CAPABILITY-LIST-AUDIT-ONLY

- `sourceIds`: `ADV-SPEC-01`, `ADV-PLAN-01`, `ADV-PLAN-02`, `PLAN-UNIFIED-01`, `PLAN-UNIFIED-02`
- `capabilityIds`: `CAP-FUTURE-RUNTIME-CAPABILITY-LIST`, `CAP-AUDIT-SOURCE-GOVERNANCE`
- `useCaseIds`: `UC-FUTURE-RUNTIME-CAPABILITY-LIST`, `UC-AUDIT-SOURCE-GOVERNANCE`
- `deltaIds`: `DELTA-RUNTIME-CAPABILITY-LIST`
- `targetTechnicalLayer`: governance-only runtime capability-list boundary
- `candidateFilesOrModules`: no current implementation candidate; this audit catalog is not the runtime capability-list
  system.
- `implementationEligible`: `false`
- `blockedGates`: runtime capability model implementation and later catalog/code tasks require separate approval.
- `conflictRefs`: `CFX-CAP-001`, `CFX-CHECKPOINT-001`
- `auditUseOnly`: `true`
- `notes`: Prevents confusing traceability artifacts with runtime product features.

### LAND-PROVIDER-STAGING-GATE

- `sourceIds`: `GATE-B178-EV`, `GATE-B178-AUD`, `GATE-B180-EV`, `GATE-B180-AUD`, `STD-REQ-04`,
  `STD-REQ-05`, `ADV-SPEC-03`, `ADV-MOD-02`, `ADV-STORY-04`
- `capabilityIds`: `CAP-GATE-PROVIDER-STAGING-EXECUTION`, `CAP-STD-AI-SCORING-EXPLANATION`,
  `CAP-STD-RAG-KNOWLEDGE-BASE`, `CAP-ADV-AI-TASK-DOMAIN`, `CAP-ADV-OPS-AUTH-QUOTA`
- `useCaseIds`: `UC-GATE-PROVIDER-STAGING-EXECUTION`, `UC-STD-AI-SCORING-EXPLANATION`,
  `UC-STD-RAG-KNOWLEDGE-BASE`, `UC-ADV-AI-TASK-LIFECYCLE`, `UC-ADV-OPS-AUTH-QUOTA`
- `deltaIds`: `DELTA-PROVIDER-STAGING-GATE`
- `targetTechnicalLayer`: blocked-gate provider/staging/deploy approval surface
- `candidateFilesOrModules`: no executable candidate in this task; future provider/staging work requires a fresh
  approval package before any command or env path is touched.
- `implementationEligible`: `false`
- `blockedGates`: real provider calls, model requests, quota use, env/secret, staging/prod/cloud/deploy, payment, and
  Cost Calibration remain blocked.
- `conflictRefs`: `CFX-PROVIDER-001`
- `auditUseOnly`: `true`
- `notes`: Historical local smoke or approval-package evidence cannot be reused as execution approval.

### LAND-CURRENT-CHECKPOINT-AUDIT

- `sourceIds`: `GATE-CHECK-EV`, `GATE-CHECK-AUD`, `PLAN-UNIFIED-01`, `PLAN-UNIFIED-02`
- `capabilityIds`: `CAP-GATE-CURRENT-CHECKPOINT`, `CAP-AUDIT-SOURCE-GOVERNANCE`
- `useCaseIds`: `UC-GATE-CURRENT-CHECKPOINT`, `UC-AUDIT-SOURCE-GOVERNANCE`
- `deltaIds`: `DELTA-CURRENT-CHECKPOINT-AUDIT`
- `targetTechnicalLayer`: audit-only current-checkpoint reference surface
- `candidateFilesOrModules`: no implementation candidate in this task; current findings may be inspected only by a
  later scoped audit task.
- `implementationEligible`: `false`
- `blockedGates`: code audit, code fixes, implementation, e2e, env/secret, provider, deploy, PR, and force-push remain
  blocked.
- `conflictRefs`: `CFX-CHECKPOINT-001`
- `auditUseOnly`: `true`
- `notes`: Current checkpoint findings do not rewrite requirements and cannot trigger source changes here.

## Matrix Use Rules

1. Later audit tasks may cite `landingId` only together with `sourceIds`, `capabilityIds`, `useCaseIds`, and `deltaIds`.
2. Candidate files/modules are architecture-derived planning surfaces, not implementation evidence.
3. `auditUseOnly: true` rows and `implementationEligible: false` rows must not seed implementation tasks.
4. `blocked_until_gate_approved` rows require a later queued task with exact `allowedFiles`, approvals, and passing
   validation before any implementation, code audit, provider/env/schema/e2e/deploy/payment, or Cost Calibration work.
5. `CFX-*` conflict references remain unresolved unless a later adjudication task explicitly approves a decision.
6. This matrix stops before code audit, gap register construction, implementation queue seeding, or runtime coverage
   claims.
