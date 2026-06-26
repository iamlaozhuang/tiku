# Admin AI generation formal draft adapter route integration approval package

Task id: `admin-ai-generation-formal-draft-adapter-route-integration-approval-package-2026-06-26`

## Decision

Approve the next implementation task:

`admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd-2026-06-26`

The task may connect the existing content admin formal adoption route/service/runtime to the formal draft adapter and add
adoption metadata update support after a formal `question` or `paper` draft is created. It must remain test-driven and
must use fake or injected writer/repository surfaces for focused tests.

## Approved Implementation Boundary

Allowed for the successor TDD task:

- content admin route/runtime/service integration for `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`;
- formal draft adapter invocation for content workspace, platform owner, organization null, reviewer-approved adoption;
- adoption metadata update source contract and DB adapter TDD for `formalTargetWriteStatus = draft_created` plus the created formal draft public id;
- reuse existing `QuestionService.createQuestion` and `PaperDraftService.createPaper` writer boundaries;
- focused unit tests proving content question and content paper paths, writer failure handling, metadata update failure handling, organization denial, and response redaction.

Not approved for that task:

- live DB connection or route smoke;
- schema or migration file change;
- migration execution, seed, fixture creation, or local data setup;
- real formal draft writes against a live database;
- organization-scoped adoption;
- Provider call, Provider credential read, Provider configuration, raw prompt, raw output, or raw Provider payload;
- staging/prod/cloud/deploy, payment, external service, release readiness, final Pass, PR, force push, dependency, package, or lockfile change.

## Later Local Route Smoke Boundary

If the successor TDD task closes successfully, approve a separate local route smoke execution task:

`admin-ai-generation-formal-draft-local-db-route-smoke-execution-2026-06-26`

Allowed for that later task:

- use existing local dev DB state only;
- perform at most two sanitized eligible-source lookups;
- perform at most two content admin route-handler POST calls:
  - one content `question` adoption if an eligible local source exists;
  - one content `paper` adoption if an eligible local source exists;
- allow the route to create formal `question` or `paper` draft records and update adoption metadata for those calls only;
- record only redacted route/workflow/status/latency/identifier/count summaries.

Not approved for the later smoke:

- migration execution, seed, fixture, or data setup to force a paper source;
- publishing formal `paper`, adding paper sections/questions, or making content student-visible;
- organization-scoped adoption;
- Provider call, Provider credential read, Provider configuration, raw prompt, raw output, or raw Provider payload;
- staging/prod/cloud/deploy, payment, external service, release readiness, final Pass, PR, force push, dependency, package, or lockfile change.

## Evidence Redaction

Evidence may include:

- route/workflow name;
- content target type;
- call count and lookup count;
- status code/message class;
- latency summary;
- adoption public id and formal draft public id only when already public identifiers;
- `formalTargetWriteStatus`;
- sanitized error category.

Evidence must not include:

- raw generated result body;
- prompt, raw output, raw Provider payload, model request, or model response;
- API key, token, cookie, Authorization header, password, DB URL, secret, or env values;
- raw DB rows or internal numeric ids;
- full formal `question`, `paper`, `material`, `paper_section`, `question_group`, `question_option`, `standard_answer`, `analysis`, or `scoring_point` content.

## Failure Branches

- If existing local DB has no eligible generated result, stop with `blocked_no_eligible_content_generated_result`; do not seed.
- If writer integration fails, stop with focused source diagnostic; do not run route smoke.
- If adoption metadata update cannot be represented without schema change, stop for a schema approval package.
- If paper adoption requires composing sections/questions beyond creating a formal paper draft shell, split that into a paper composition adoption task.
- If Provider output is needed to create eligible content generated results, return to Provider/Cost gate separately.

## Boundaries

This package does not declare staging/prod/release final Pass. Provider/Cost, deployment/release readiness, payment,
external service, organization-scoped adoption, and formal publish remain separate approval gates.
