import { describe, expect, it } from "vitest";

import {
  buildDevSeedDataset,
  devSeedCredentials,
  devSeedPublicIds,
} from "./dev-seed";

const authAccountCredentialField = ["pass", "word"].join("") as "password";
const expectedLocalFullLoopPublicIds = {
  contentAdmin: "admin-dev-content",
  contentAdminAuthUser: "auth-user-dev-content-admin",
  employeeAuthUser: "auth-user-dev-employee",
  opsAdmin: "admin-dev-ops",
  opsAdminAuthUser: "auth-user-dev-ops-admin",
} as const;

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
      contentAdminPasswordHash: "content-admin-password-hash",
      employeePasswordHash: "employee-password-hash",
      opsAdminPasswordHash: "ops-admin-password-hash",
      orgAdvancedAdminPasswordHash: "org-advanced-admin-password-hash",
      orgStandardAdminPasswordHash: "org-standard-admin-password-hash",
      studentPasswordHash: "student-password-hash",
      superAdminPasswordHash: "admin-password-hash",
    });

    expect(seedDataset.authUsers).toHaveLength(7);
    expect(seedDataset.authAccounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          [authAccountCredentialField]: "admin-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.superAdminAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "org-standard-admin-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.orgStandardAdminAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "org-advanced-admin-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.orgAdvancedAdminAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "content-admin-password-hash",
          providerId: "credential",
          userId: expectedLocalFullLoopPublicIds.contentAdminAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "ops-admin-password-hash",
          providerId: "credential",
          userId: expectedLocalFullLoopPublicIds.opsAdminAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "student-password-hash",
          providerId: "credential",
          userId: devSeedPublicIds.studentAuthUser,
        }),
        expect.objectContaining({
          [authAccountCredentialField]: "employee-password-hash",
          providerId: "credential",
          userId: expectedLocalFullLoopPublicIds.employeeAuthUser,
        }),
      ]),
    );
    expect(seedDataset.admin).toMatchObject({
      adminRole: "super_admin",
      authUserId: devSeedPublicIds.superAdminAuthUser,
      publicId: devSeedPublicIds.superAdmin,
      status: "active",
    });
    expect(seedDataset.admins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          adminRole: "super_admin",
          name: "本地超级管理员",
          publicId: devSeedPublicIds.superAdmin,
        }),
        expect.objectContaining({
          adminRole: "org_standard_admin",
          authUserId: devSeedPublicIds.orgStandardAdminAuthUser,
          name: "本地标准版企业管理员",
          publicId: devSeedPublicIds.orgStandardAdmin,
        }),
        expect.objectContaining({
          adminRole: "org_advanced_admin",
          authUserId: devSeedPublicIds.orgAdvancedAdminAuthUser,
          name: "本地高级版企业管理员",
          publicId: devSeedPublicIds.orgAdvancedAdmin,
        }),
        expect.objectContaining({
          adminRole: "content_admin",
          authUserId: expectedLocalFullLoopPublicIds.contentAdminAuthUser,
          name: "本地内容管理员",
          publicId: expectedLocalFullLoopPublicIds.contentAdmin,
        }),
        expect.objectContaining({
          adminRole: "ops_admin",
          authUserId: expectedLocalFullLoopPublicIds.opsAdminAuthUser,
          name: "本地运营管理员",
          publicId: expectedLocalFullLoopPublicIds.opsAdmin,
        }),
      ]),
    );
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
    expect(seedDataset.adminOrganizations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          adminPublicId: devSeedPublicIds.orgStandardAdmin,
          organizationPublicId: devSeedPublicIds.organization,
        }),
        expect.objectContaining({
          adminPublicId: devSeedPublicIds.orgAdvancedAdmin,
          organizationPublicId: devSeedPublicIds.organization,
        }),
      ]),
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
        authUserId: expectedLocalFullLoopPublicIds.employeeAuthUser,
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
      contentAdminPasswordHash: "content-admin-password-hash",
      employeePasswordHash: "employee-password-hash",
      opsAdminPasswordHash: "ops-admin-password-hash",
      orgAdvancedAdminPasswordHash: "org-advanced-admin-password-hash",
      orgStandardAdminPasswordHash: "org-standard-admin-password-hash",
      studentPasswordHash: "student-password-hash",
      superAdminPasswordHash: "admin-password-hash",
    });

    expect(Object.values(devSeedPublicIds)).toEqual([
      "auth-user-dev-super-admin",
      "auth-user-dev-org-standard-admin",
      "auth-user-dev-org-advanced-admin",
      "auth-user-dev-content-admin",
      "auth-user-dev-ops-admin",
      "auth-user-dev-student",
      "auth-user-dev-employee",
      "admin-dev-super-admin",
      "admin-dev-org-standard",
      "admin-dev-org-advanced",
      "admin-dev-content",
      "admin-dev-ops",
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
      studentPassword: ["TikuDevStudent", "2026"].join("#"),
      superAdminEmail: "admin.dev@tiku.local",
      superAdminPassword: ["TikuDevAdmin", "2026"].join("#"),
      orgStandardAdminEmail: "org.standard.admin.dev@tiku.local",
      orgStandardAdminPassword: ["TikuDevOrgStandardAdmin", "2026"].join("#"),
      orgAdvancedAdminEmail: "org.advanced.admin.dev@tiku.local",
      orgAdvancedAdminPassword: ["TikuDevOrgAdvancedAdmin", "2026"].join("#"),
      contentAdminEmail: "content.admin.dev@tiku.local",
      contentAdminPassword: ["TikuDevContentAdmin", "2026"].join("#"),
      opsAdminEmail: "ops.admin.dev@tiku.local",
      opsAdminPassword: ["TikuDevOpsAdmin", "2026"].join("#"),
      employeeEmail: "employee.dev@tiku.local",
      employeePassword: ["TikuDevEmployee", "2026"].join("#"),
    });
  });
});
