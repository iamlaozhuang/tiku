# Phase 22 Student MVP Smoke Plan

## Scope

Validate student MVP local flows through existing e2e without recording raw student answers.

## Coverage Targets

- `practice`
- `mock_exam`
- `answer_record`
- `exam_report`
- `mistake_book`
- local authorization/redeem behavior

## Commands

- `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts e2e/role-based-acceptance/role-based-full-flow.spec.ts`

## Stop Conditions

If student core flow fails after auth has passed, record the exact route/test failure summary and block dependent AI scoring persistence checks when applicable.
