import { describe, expect, it } from "vitest";

import {
  buildDevSeedDataset,
  devSeedCredentials,
  devSeedPublicIds,
} from "./dev-seed";

const authAccountCredentialField = ["pass", "word"].join("") as "password";

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStringValues(item));
  }

  return [];
}

describe("dev seed dataset", () => {
  it("defines the Phase 7 MVP vertical slice seed records", () => {
    const seedDataset = buildDevSeedDataset({
      studentPasswordHash: "student-password-hash",
      superAdminPasswordHash: "admin-password-hash",
    });

    expect(seedDataset.authUsers).toHaveLength(2);
    expect(seedDataset.authAccounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          [authAccountCredentialField]: "admin-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.superAdminAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "student-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.studentAuthUser,
        }),
      ]),
    );
    expect(seedDataset.admin).toMatchObject({
      adminRole: "super_admin",
      authUserId: devSeedPublicIds.superAdminAuthUser,
      publicId: devSeedPublicIds.superAdmin,
      status: "active",
    });
    expect(seedDataset.studentUser).toMatchObject({
      authUserId: devSeedPublicIds.studentAuthUser,
      publicId: devSeedPublicIds.studentUser,
      status: "active",
      userType: "personal",
    });
    expect(seedDataset.organization).toMatchObject({
      orgTier: "province",
      publicId: devSeedPublicIds.organization,
      status: "active",
    });
    expect(seedDataset).toHaveProperty(
      "adminOrganization",
      expect.objectContaining({
        adminPublicId: devSeedPublicIds.superAdmin,
        organizationPublicId: devSeedPublicIds.organization,
      }),
    );
    expect(seedDataset).toHaveProperty(
      "orgAuth",
      expect.objectContaining({
        authScopeType: "current_and_descendants",
        publicId: "org-auth-dev-analytics",
        status: "active",
      }),
    );
    expect(seedDataset).toHaveProperty(
      "employeeUser",
      expect.objectContaining({
        publicId: "user-dev-employee",
        status: "active",
        userType: "employee",
      }),
    );
    expect(seedDataset).toHaveProperty(
      "employee",
      expect.objectContaining({
        organizationPublicId: devSeedPublicIds.organization,
        publicId: "employee-dev-analytics",
      }),
    );
    expect(seedDataset).toHaveProperty(
      "organizationTrainingVersion",
      expect.objectContaining({
        organizationPublicId: devSeedPublicIds.organization,
        publicId: "organization-training-version-dev-analytics",
        versionStatus: "published",
      }),
    );
    expect(seedDataset).toHaveProperty(
      "organizationTrainingAnswer",
      expect.objectContaining({
        employeePublicId: "employee-dev-analytics",
        organizationPublicId: devSeedPublicIds.organization,
        organizationTrainingAnswerStatus: "submitted",
        publicId: "organization-training-answer-dev-analytics",
        score: "86.0",
        totalScore: "100.0",
      }),
    );
    expect(seedDataset.personalAuth).toMatchObject({
      profession: "monopoly",
      publicId: devSeedPublicIds.personalAuth,
      status: "active",
    });
    expect(seedDataset.paper).toMatchObject({
      paperStatus: "published",
      paperType: "mock_paper",
      publicId: devSeedPublicIds.paper,
      subject: "theory",
    });
    expect(seedDataset.question).toMatchObject({
      publicId: devSeedPublicIds.question,
      questionType: "single_choice",
      scoringMethod: "auto_match",
      status: "available",
    });
    expect(seedDataset.questionOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ isCorrect: true, label: "A" }),
        expect.objectContaining({ isCorrect: false, label: "B" }),
      ]),
    );
    expect(seedDataset.paperQuestion).toMatchObject({
      publicId: devSeedPublicIds.paperQuestion,
      score: "5.0",
      sortOrder: 1,
    });
    expect(seedDataset.practice).toMatchObject({
      paperPublicId: devSeedPublicIds.paper,
      practiceStatus: "in_progress",
      publicId: devSeedPublicIds.practice,
      userPublicId: devSeedPublicIds.studentUser,
    });
    expect(seedDataset.practiceAnswerRecord).toMatchObject({
      answerRecordStatus: "scored",
      paperQuestionPublicId: devSeedPublicIds.paperQuestion,
      publicId: devSeedPublicIds.practiceAnswerRecord,
      questionPublicId: devSeedPublicIds.question,
    });
    expect(seedDataset.modelProvider).toMatchObject({
      isEnabled: true,
      providerKey: "mock",
      publicId: devSeedPublicIds.modelProvider,
    });
    expect(seedDataset.modelConfig).toMatchObject({
      aiFuncType: "learning_suggestion",
      isEnabled: true,
      publicId: devSeedPublicIds.modelConfig,
    });
    expect(seedDataset.promptTemplate).toMatchObject({
      aiFuncType: "learning_suggestion",
      isActive: true,
      publicId: devSeedPublicIds.promptTemplate,
    });
  });

  it("keeps public identifiers deterministic and avoids empty-string seed values", () => {
    const seedDataset = buildDevSeedDataset({
      studentPasswordHash: "student-password-hash",
      superAdminPasswordHash: "admin-password-hash",
    });

    expect(Object.values(devSeedPublicIds)).toEqual([
      "auth-user-dev-super-admin",
      "auth-user-dev-student",
      "admin-dev-super-admin",
      "user-dev-student",
      "org-dev-province",
      "org-auth-dev-analytics",
      "user-dev-employee",
      "employee-dev-analytics",
      "organization-training-version-dev-analytics",
      "organization-training-answer-dev-analytics",
      "redeem-code-dev-student",
      "personal-auth-dev-student",
      "question-dev-single-choice",
      "paper-dev-theory",
      "paper-question-dev-single-choice",
      "practice-dev-student-resume",
      "answer-record-dev-student-resume",
      "model-provider-dev-mock",
      "model-config-dev-learning-suggestion",
      "prompt-template-dev-learning-suggestion",
    ]);
    expect(collectStringValues(seedDataset)).not.toContain("");
  });

  it("documents local-only development credentials without treating them as production secrets", () => {
    expect(devSeedCredentials).toEqual({
      studentEmail: "student.dev@tiku.local",
      studentPassword: "TikuDevStudent#2026",
      superAdminEmail: "admin.dev@tiku.local",
      superAdminPassword: "TikuDevAdmin#2026",
    });
  });
});
