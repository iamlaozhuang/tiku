# AI Scoring Retry Persistence Implementation Security Review

## Decision

Status: COMMENT.

## Scope

- Additive `ai_scoring_attempt` table and runtime append path for AI scoring retry metadata.
- No secret/env file changes.
- No dependency changes.
- No staging/prod/cloud/deploy or real provider calls.
- No destructive data operation.

## Review Checklist

- Raw prompt is not persisted in `ai_scoring_attempt`.
- Raw student answer is not persisted in `ai_scoring_attempt`.
- Raw model response is not persisted in `ai_scoring_attempt`.
- Raw provider payload is not persisted in `ai_scoring_attempt`.
- Secrets, Authorization headers, tokens, and database URLs are not persisted.
- Migration is additive and reviewable.
- Rollback requires separate approval before data removal.
- Attempt metadata links to `answer_record` and optionally `ai_call_log` without exposing internal ids externally.

## Result

Implementation security review result:

- APPROVE: `ai_scoring_attempt` persists redaction-safe retry metadata only.
- APPROVE: additive SQL migration creates the new table, enum, indexes, and foreign keys without destructive operations.
- APPROVE: runtime append links to `answer_record` by public id and optionally links `ai_call_log` without exposing internal ids externally.
- COMMENT: `npm.cmd run build` passed but Next.js reported `Environments: .env.local`. No env value was printed or modified, but this conflicts with the task's explicit no-`.env.local` read constraint and is recorded in evidence for human review.
