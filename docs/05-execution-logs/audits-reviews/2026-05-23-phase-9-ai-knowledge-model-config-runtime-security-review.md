# Security Review: phase-9-ai-knowledge-model-config-runtime

## Scope

- `POST /api/v1/questions/{publicId}/recommend-knowledge-nodes`
- `POST /api/v1/model-configs/{publicId}/enable`
- `POST /api/v1/model-configs/{publicId}/disable`
- Local deterministic `kn_recommendation` runtime behavior.
- `audit_log` and `ai_call_log` write boundaries used by these routes.

## Review Results

- Auth/session boundary: pass. Question recommendation requires an authenticated admin session and content-admin capability. Model config enable/disable requires `super_admin`.
- Authorization bypass: pass. Non-super admins cannot mutate `model_config`; content-ineligible admins cannot run question recommendation.
- Identifier exposure: pass. Routes use `publicId` and DTOs return public identifiers only. No numeric auto-increment IDs are returned.
- Secret handling: pass. No API key, password, session token, provider secret, raw prompt, raw question body, raw standard answer, or raw model response is returned in API DTOs.
- AI provider boundary: pass. Recommendation uses a local deterministic runner only. No real provider, production credential, external network, or production resource is called.
- AI call logging: pass. `kn_recommendation` writes through the existing redaction snapshot path. Raw question and answer content are hashed/redacted before persistence.
- Audit logging: pass. Model config enable/disable and question recommendation append redacted audit entries. Permission denial for model config mutation is also audited when an admin actor is known.
- Dependency and schema boundary: pass. No dependency, lockfile, `.env.example`, `drizzle/**`, or schema migration change was introduced.

## Residual Risks

- The task queue blocks schema and migration changes, and the current schema does not include a persisted question-to-knowledge-node recommendation/binding table. This task returns pending-confirmation candidates and records logs, but does not persist recommendation candidates onto the question.
- The requirement's asynchronous first-save trigger remains deferred until a later task approves queue and persistence infrastructure.
- The local deterministic runner is suitable for runtime contract verification only; production model-provider behavior remains disabled by policy.
