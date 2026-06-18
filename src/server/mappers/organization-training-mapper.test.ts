import { describe, expect, it } from "vitest";

import {
  mapOrganizationTrainingDraftRowToDto,
  mapOrganizationTrainingSourceContextRowToDto,
  mapOrganizationTrainingVersionRowToDto,
  type OrganizationTrainingDraftRow,
  type OrganizationTrainingSourceContextRow,
  type OrganizationTrainingVersionRow,
} from "./organization-training-mapper";

function createVersionRow(
  overrides: Partial<OrganizationTrainingVersionRow> = {},
): OrganizationTrainingVersionRow {
  return {
    id: 901,
    public_id: "training_version_public_123",
    draft_public_id: "training_draft_public_123",
    version_number: 2,
    organization_id: 501,
    organization_public_id: "organization_public_123",
    org_auth_id: 601,
    authorization_source: "org_auth",
    authorization_public_id: "org_auth_public_123",
    owner_type: "organization",
    owner_public_id: "organization_public_123",
    quota_owner_type: "organization",
    quota_owner_public_id: "organization_public_123",
    publish_scope_snapshot: {
      organizationPublicIds: [
        "organization_public_123",
        "organization_branch_public_456",
      ],
      capturedAt: "2026-06-15T19:20:13.000Z",
    },
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training",
    description: null,
    question_count: 2,
    total_score: "5.0",
    question_type_summary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 1,
    },
    version_status: "published",
    published_at: new Date("2026-06-15T19:20:13.000Z"),
    taken_down_at: null,
    takedown_reason: null,
    created_at: new Date("2026-06-15T19:20:13.000Z"),
    updated_at: new Date("2026-06-15T19:20:13.000Z"),
    ...overrides,
  };
}

function createDraftRow(
  overrides: Partial<OrganizationTrainingDraftRow> = {},
): OrganizationTrainingDraftRow {
  return {
    id: 801,
    public_id: "training_draft_public_123",
    source_task_public_id: null,
    source_version_public_id: "training_version_public_source_123",
    organization_id: 501,
    organization_public_id: "organization_public_123",
    org_auth_id: 601,
    authorization_source: "org_auth",
    authorization_public_id: "org_auth_public_123",
    owner_type: "organization",
    owner_public_id: "organization_public_123",
    quota_owner_type: "organization",
    quota_owner_public_id: "organization_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training draft",
    description: null,
    question_count: 2,
    total_score: "5.0",
    question_type_summary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 1,
    },
    evidence_status: "none",
    validation_status: "needs_review",
    retention_status: "active",
    created_at: new Date("2026-06-15T19:20:13.000Z"),
    updated_at: new Date("2026-06-15T19:20:13.000Z"),
    expires_at: null,
    ...overrides,
  };
}

function createSourceContextRow(
  overrides: Partial<OrganizationTrainingSourceContextRow> = {},
): OrganizationTrainingSourceContextRow {
  return {
    id: 811,
    public_id: "training_source_context_public_123",
    organization_training_draft_id: 801,
    organization_training_draft_public_id: "training_draft_public_123",
    organization_id: 501,
    organization_public_id: "organization_public_123",
    org_auth_id: 601,
    authorization_source: "org_auth",
    authorization_public_id: "org_auth_public_123",
    source_type: "paper",
    source_public_id: "paper_public_123",
    title: "Formal paper reference",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    question_count: 20,
    total_score: "100.0",
    source_status: "published",
    redaction_status: "metadata_only",
    formal_usage_policy: {
      createFormalPaper: false,
      createMockExam: false,
      exposeQuestionBody: false,
      exposeStandardAnswer: false,
      exposeAnalysis: false,
      exposeProviderPayload: false,
    },
    created_at: new Date("2026-06-15T19:20:13.000Z"),
    updated_at: new Date("2026-06-15T19:20:13.000Z"),
    ...overrides,
  };
}

describe("organization training mapper", () => {
  it("maps a manual draft row to the public metadata-only DTO", () => {
    const dto = mapOrganizationTrainingDraftRowToDto(createDraftRow());
    const serializedDto = JSON.stringify(dto);

    expect(dto).toEqual({
      publicId: "training_draft_public_123",
      sourceTaskPublicId: null,
      organizationPublicId: "organization_public_123",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training draft",
      description: null,
      questionCount: 2,
      totalScore: 5,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 1,
      },
      evidenceStatus: "none",
      validationStatus: "needs_review",
      retentionStatus: "active",
      createdAt: "2026-06-15T19:20:13.000Z",
      expiresAt: null,
    });
    expect(serializedDto).not.toContain("sourceVersionPublicId");
    expect(serializedDto).not.toMatch(/"id":|"organizationId":|"orgAuthId":/);
  });

  it("maps a source-context row to redacted source metadata only", () => {
    const row = {
      ...createSourceContextRow(),
      standard_answer: "LEAK_STANDARD_ANSWER",
      analysis: "LEAK_ANALYSIS",
      full_question_body: "LEAK_QUESTION_BODY",
      provider_payload: "LEAK_PROVIDER_PAYLOAD",
    } as OrganizationTrainingSourceContextRow;

    const dto = mapOrganizationTrainingSourceContextRowToDto(row);
    const serializedDto = JSON.stringify(dto);

    expect(dto).toEqual({
      sourceType: "paper",
      sourcePublicId: "paper_public_123",
      title: "Formal paper reference",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      questionCount: 20,
      totalScore: 100,
      sourceStatus: "published",
      redactionStatus: "metadata_only",
    });
    expect(serializedDto).not.toContain("LEAK_STANDARD_ANSWER");
    expect(serializedDto).not.toContain("LEAK_ANALYSIS");
    expect(serializedDto).not.toContain("LEAK_QUESTION_BODY");
    expect(serializedDto).not.toContain("LEAK_PROVIDER_PAYLOAD");
    expect(serializedDto).not.toMatch(/"id":|"organizationId":|"orgAuthId":/);
  });

  it("maps a publish-version row to the public camelCase DTO", () => {
    const dto = mapOrganizationTrainingVersionRowToDto(createVersionRow());

    expect(dto).toEqual({
      publicId: "training_version_public_123",
      draftPublicId: "training_draft_public_123",
      versionNumber: 2,
      organizationPublicId: "organization_public_123",
      publishScopeSnapshot: {
        organizationPublicIds: [
          "organization_public_123",
          "organization_branch_public_456",
        ],
        capturedAt: "2026-06-15T19:20:13.000Z",
      },
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training",
      description: null,
      questionCount: 2,
      totalScore: 5,
      status: "published",
      publishedAt: "2026-06-15T19:20:13.000Z",
      takenDownAt: null,
      takedownReason: null,
    });
  });

  it("preserves lifecycle takedown metadata without internal lineage exposure", () => {
    const dto = mapOrganizationTrainingVersionRowToDto(
      createVersionRow({
        version_status: "taken_down",
        taken_down_at: new Date("2026-06-16T08:00:00.000Z"),
        takedown_reason: "manual owner takedown",
      }),
    );

    expect(dto).toMatchObject({
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect("id" in dto).toBe(false);
    expect("organizationId" in dto).toBe(false);
    expect("orgAuthId" in dto).toBe(false);
    expect("authorizationSource" in dto).toBe(false);
    expect("authorizationPublicId" in dto).toBe(false);
  });

  it("does not leak provider, raw answer, formal target, or employee answer fields", () => {
    const rowWithUnexpectedPrivateFields = {
      ...createVersionRow(),
      provider_payload: { redactionStatus: "redacted" },
      raw_prompt: "private prompt",
      raw_answer: "private answer",
      employee_answer: "private employee answer",
      formal_question_public_id: "formal_question_public_123",
      formal_paper_public_id: "formal_paper_public_123",
      practice_public_id: "practice_public_123",
      mock_exam_public_id: "mock_exam_public_123",
      answer_record_public_id: "answer_record_public_123",
      exam_report_public_id: "exam_report_public_123",
      mistake_book_public_id: "mistake_book_public_123",
    } as OrganizationTrainingVersionRow;

    const serializedDto = JSON.stringify(
      mapOrganizationTrainingVersionRowToDto(rowWithUnexpectedPrivateFields),
    );

    expect(serializedDto).not.toContain("provider_payload");
    expect(serializedDto).not.toContain("providerPayload");
    expect(serializedDto).not.toContain("raw_prompt");
    expect(serializedDto).not.toContain("rawPrompt");
    expect(serializedDto).not.toContain("raw_answer");
    expect(serializedDto).not.toContain("rawAnswer");
    expect(serializedDto).not.toContain("employee_answer");
    expect(serializedDto).not.toContain("employeeAnswer");
    expect(serializedDto).not.toContain("formal_question_public_id");
    expect(serializedDto).not.toContain("formalQuestionPublicId");
    expect(serializedDto).not.toContain("formal_paper_public_id");
    expect(serializedDto).not.toContain("formalPaperPublicId");
    expect(serializedDto).not.toContain("practicePublicId");
    expect(serializedDto).not.toContain("mockExamPublicId");
    expect(serializedDto).not.toContain("answerRecordPublicId");
    expect(serializedDto).not.toContain("examReportPublicId");
    expect(serializedDto).not.toContain("mistakeBookPublicId");
  });
});
