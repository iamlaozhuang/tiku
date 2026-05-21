import { describe, expect, it } from "vitest";

import {
  buildDevSeedDataset,
  devSeedCredentials,
  devSeedPublicIds,
} from "./dev-seed";

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
          password: "admin-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.superAdminAuthUser,
        }),
        expect.objectContaining({
          password: "student-password-hash",
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
      "redeem-code-dev-student",
      "personal-auth-dev-student",
      "question-dev-single-choice",
      "paper-dev-theory",
      "paper-question-dev-single-choice",
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
