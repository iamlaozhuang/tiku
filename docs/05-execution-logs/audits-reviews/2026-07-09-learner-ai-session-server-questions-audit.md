# 2026-07-09 Learner AI Session Server Questions Audit

## Adversarial Review

- Source boundary: answer panels now use server-created `session.questions`; AI组卷 no longer renders final answer content from `paper_draft` preview bodies.
- Trust boundary: the server still owns question resolution; the frontend only renders the created session result.
- Empty-session boundary: created responses with zero questions are treated as insufficient and do not open the panel.
- Role boundary: personal advanced AI出题 and organization employee AI组卷 tests both cover the server question source.
- Write boundary: formal practice, answer record, exam report, and mistake book writes remain blocked by the existing learning-session contract.
- Scope boundary: organization admin enterprise training and content admin AI flows are not touched.

## Residual Risk

- Refresh/history recovery still depends on a later branch persisting a redacted paper assembly container summary and selected refs.
- Preview UX still needs a later branch to show richer AI组卷 source composition and insufficiency reasons.

## Conclusion

- Result: pass for this branch scope.
- Next required branch: AI组卷 container redacted persistence and history recovery.
