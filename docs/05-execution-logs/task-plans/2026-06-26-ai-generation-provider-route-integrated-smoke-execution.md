# AI generation Provider route-integrated smoke execution

Task id: `ai-generation-provider-route-integrated-smoke-execution-2026-06-26`

## Boundary

- Branch: `codex/admin-ai-real-provider-route-smoke-20260626`
- Approval consumed: `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`
- Precondition satisfied: fake Provider route runner passed in `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-enabled-route-runtime-bridge-fake-provider-tdd.md`
- Maximum real Provider calls: 4 total, one per workflow.
- Allowed workflows: `content_ai_question_generation`, `content_ai_paper_generation`, `organization_ai_question_generation`, `organization_ai_paper_generation`.

## Credential and evidence rules

- Credential source: local approved private Provider credential source only, loaded into process env through the existing local runtime path; do not print or persist the credential.
- Evidence may record: provider/model identifier, workflow, status, latency, token/cost summary, error category, route/local contract summary, call count.
- Evidence must not record: raw prompt, raw output, raw provider payload, API key, token, cookie, Authorization header, local env file contents, or self-increment ids.

## Execution plan

1. Run an inline local `tsx` smoke runner that imports the admin route handler, creates injected in-memory repositories, and executes POST requests for the four allowed workflows.
2. Use the existing admin route runtime bridge controlled runner with the default real Provider executor.
3. Stop after at most four attempts; no retries beyond the route-integrated Provider limit.
4. If credential is missing or Provider fails, close with minimal redacted diagnostic and do not continue to gate closeout.
5. If all workflows pass, record Provider/Cost route smoke pass and continue to the closeout review task.

## Blocked

- Source/test/DB/schema/migration/seed/package/lockfile/env changes.
- Live DB connection or writes.
- Formal question/paper write/adoption.
- Browser/dev-server/e2e.
- Staging/prod/payment/external service/deployment/release readiness.
- Final Pass.
