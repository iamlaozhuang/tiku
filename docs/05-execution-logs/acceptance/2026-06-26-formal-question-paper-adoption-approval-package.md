# Formal question paper adoption approval package

Task id: `formal-question-paper-adoption-approval-package-2026-06-26`

## Decision status

Execution approval status: `NOT_APPROVED_REQUIRES_FRESH_HUMAN_DECISION`.

This package does not approve or execute formal question/paper writes. The current backend admin AI product remains isolated to generated result/history summaries with formal writes blocked.

## Approval options

Recommended approval path if the owner wants formal adoption:

1. Implement an explicit adoption command for reviewed generated results only.
2. Keep automatic Provider-to-formal-content writes blocked.
3. Add provenance/audit fields linking formal content back to generated result/task/request public ids.
4. Add idempotency and duplicate prevention for question and paper adoption.
5. Separate content admin platform adoption from organization-scoped admin adoption decisions.
6. Require focused repository/service TDD before any local DB mutation smoke.

## Future minimum implementation task

`admin-ai-generation-formal-adoption-contract-and-repository-tdd-2026-06-26`

Allowed only if freshly approved:

- Add adoption contract for generated result to formal question/paper draft.
- Add repository/service TDD for adoption mapping.
- Keep live DB migration/execution and browser smoke as separate approvals if schema/runtime mutation is required.

## Still blocked

- Formal question/paper write execution.
- Automatic adoption from Provider output.
- Live DB adoption mutation.
- Schema/migration changes.
- Staging/prod/release final Pass.
- Payment/deployment/external-service expansion.
