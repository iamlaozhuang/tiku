# 2026-07-09 Learner AI Paper Session Container Audit

## Adversarial Review

- Privacy boundary: this branch does not change request/result/session ownership queries; branch 1 actor scoping remains intact.
- Source boundary: AI组卷 no longer starts practice from preview question drafts alone; it requires an assembled formal-source container.
- Trust boundary: the frontend only forwards selected refs container data; the server remains responsible for resolving formal sources.
- Failure boundary: insufficient or missing assembly leaves start-practice disabled instead of falling into old preview-derived session creation.
- Role boundary: personal advanced and organization employee paths are both covered; organization admin enterprise training flow is not touched.
- Content boundary: preview remains redacted for paper drafts and does not expose answers or analysis before practice.
- Write boundary: isolated learner AI session remains separate from formal `practice`, `answer_record`, and `mistake_book` writes.

## Residual Risk

- Frontend still renders practice questions from local preview-derived state after session creation. That is intentionally deferred to the next branch, which will switch rendering to server-returned `session.questions`.
- History recovery of paper assembly containers is intentionally deferred to the later persistence branch.

## Conclusion

- Result: pass for this branch scope.
- Next required branch: learner AI learning-session frontend should use server-returned session questions as the rendering source.
