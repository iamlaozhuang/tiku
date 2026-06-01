# Phase 22 Validation Data Requirement Matrix Plan

## Objective

Define the minimum synthetic validation data needed for complete local/dev e2e acceptance on a fresh migrated DB.

## Required Entities

- `user` and `session`
- `authorization`
- `organization` and `org_auth`
- `redeem_code`
- `question`, `material`, `paper`, and `paper_section`
- `practice`
- `mock_exam`
- `answer_record`
- `exam_report`
- `mistake_book`
- `ai_call_log`

## Commands

- `rg -n "user|session|authorization|organization|org_auth|redeem_code|question|material|paper|paper_section|practice|mock_exam|answer_record|exam_report|mistake_book|ai_call_log" docs e2e src/server src/db/schema -g "!*.env*" -g "!node_modules/**"`
- `git status --short --branch`

## Output

- Evidence file: `docs/05-execution-logs/evidence/2026-06-01-phase-22-validation-data-requirement-matrix.md`
- No data creation, no secret exposure, no raw answers/prompts/model outputs.
