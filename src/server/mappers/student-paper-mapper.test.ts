import { describe, expect, it } from "vitest";

import {
  mapStudentPaperDetailToApi,
  mapStudentPaperListToApi,
  mapStudentPaperScopeToApi,
} from "./student-paper-mapper";
import type {
  StudentPaperAuthorizationScopeRow,
  StudentPublishedPaperRow,
} from "../repositories/student-paper-repository";

const publishedAt = new Date("2026-05-19T08:00:00.000Z");
const expiresAt = new Date("2026-06-19T08:00:00.000Z");

const paperSnapshot = {
  paperPublicId: "paper_public_123",
  name: "2024年专卖三级理论真题",
  profession: "monopoly",
  level: 3,
  subject: "theory",
  paperType: "past_paper",
  durationMinute: 120,
  totalScore: "100.0",
  publishedAt: "2026-05-19T08:00:00.000Z",
  paperSections: [],
};

function createScopeRow(
  overrides: Partial<StudentPaperAuthorizationScopeRow> = {},
): StudentPaperAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth", "org_auth"],
    expires_at: expiresAt,
    ...overrides,
  };
}

function createPaperRow(
  overrides: Partial<StudentPublishedPaperRow> = {},
): StudentPublishedPaperRow {
  return {
    public_id: "paper_public_123",
    name: "2024年专卖三级理论真题",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paper_type: "past_paper",
    duration_minute: 120,
    total_score: "100.0",
    published_at: publishedAt,
    question_count: 80,
    paper_snapshot: paperSnapshot,
    ...overrides,
  };
}

describe("student paper mapper", () => {
  it("maps effective authorization scope rows to student scope DTOs", () => {
    expect(mapStudentPaperScopeToApi(createScopeRow())).toEqual({
      profession: "monopoly",
      level: 3,
      authorizationTypes: ["personal_auth", "org_auth"],
      expiresAt: "2026-06-19T08:00:00.000Z",
      status: "active",
    });
  });

  it("maps published paper rows to student-facing summary DTOs", () => {
    expect(mapStudentPaperListToApi([createPaperRow()])).toEqual([
      {
        publicId: "paper_public_123",
        name: "2024年专卖三级理论真题",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paperType: "past_paper",
        durationMinute: 120,
        totalScore: "100.0",
        publishedAt: "2026-05-19T08:00:00.000Z",
        questionCount: 80,
        canPractice: true,
        canMockExam: true,
      },
    ]);
  });

  it("maps detail with paperSnapshot and without numeric database identifiers", () => {
    const detail = mapStudentPaperDetailToApi(createPaperRow());

    expect(detail).toEqual({
      publicId: "paper_public_123",
      name: "2024年专卖三级理论真题",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      durationMinute: 120,
      totalScore: "100.0",
      publishedAt: "2026-05-19T08:00:00.000Z",
      questionCount: 80,
      canPractice: true,
      canMockExam: true,
      paperSnapshot,
    });
    expect(detail).not.toHaveProperty("id");
  });
});
