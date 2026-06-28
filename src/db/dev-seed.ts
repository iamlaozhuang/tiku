import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

type SeedRow = Record<string, unknown>;
type SeedPasswordHashes = {
  contentAdminPasswordHash: string;
  employeePasswordHash: string;
  opsAdminPasswordHash: string;
  studentPasswordHash: string;
  superAdminPasswordHash: string;
  orgStandardAdminPasswordHash: string;
  orgAdvancedAdminPasswordHash: string;
};

export type DevSeedDataset = ReturnType<typeof buildDevSeedDataset>;

type SeedSql = {
  <Row extends SeedRow = SeedRow>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Row[]>;
  begin<T>(callback: (sql: SeedSql) => Promise<T>): Promise<T>;
  end?: () => Promise<void>;
};

type IdRow = {
  id: string;
};

export const devSeedPublicIds = {
  superAdminAuthUser: "auth-user-dev-super-admin",
  orgStandardAdminAuthUser: "auth-user-dev-org-standard-admin",
  orgAdvancedAdminAuthUser: "auth-user-dev-org-advanced-admin",
  contentAdminAuthUser: "auth-user-dev-content-admin",
  opsAdminAuthUser: "auth-user-dev-ops-admin",
  studentAuthUser: "auth-user-dev-student",
  employeeAuthUser: "auth-user-dev-employee",
  superAdmin: "admin-dev-super-admin",
  orgStandardAdmin: "admin-dev-org-standard",
  orgAdvancedAdmin: "admin-dev-org-advanced",
  contentAdmin: "admin-dev-content",
  opsAdmin: "admin-dev-ops",
  studentUser: "user-dev-student",
  organization: "org-dev-province",
  orgAuth: "org-auth-dev-analytics",
  employeeUser: "user-dev-employee",
  employee: "employee-dev-analytics",
  organizationTrainingVersion: "organization-training-version-dev-analytics",
  organizationTrainingAnswer: "organization-training-answer-dev-analytics",
  redeemCode: "redeem-code-dev-student",
  personalAuth: "personal-auth-dev-student",
  question: "question-dev-single-choice",
  paper: "paper-dev-theory",
  paperQuestion: "paper-question-dev-single-choice",
  practice: "practice-dev-student-resume",
  practiceAnswerRecord: "answer-record-dev-student-resume",
  modelProvider: "model-provider-dev-mock",
  modelConfig: "model-config-dev-learning-suggestion",
  promptTemplate: "prompt-template-dev-learning-suggestion",
} as const;

export const devSeedCredentials = {
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
} as const;

const devSeedPasswordHashes = {
  contentAdminPasswordHash:
    "3bbc6d6f02fc5b419c8f08b910a6eaab:2d6179d488c3b3e1b6603f50993298a2cccc639a81d0864d6b34da55686bf1a96d28088d23beecafd6214c5460a80adf6454c679ec3f95c57e3a1c34948e774d",
  employeePasswordHash:
    "0c3668e1661c389454b3ecfd5fb89e00:0d6af21b83e001e2eae7d482d407b2ac11920bedf0b2f3db6520e859a0b1ffecdd0aaaa9198c9a003fca299bfc71f773d11117f908d5c93e76ecef485ad63e38",
  opsAdminPasswordHash:
    "2fd7f94902ee66bc177ce3d7702057b1:c4246c233646b778ffb57d9db9d8b24307042405101c37713e32eeede33318b6fcf8d6677f0ff5523c536f1fe505df70ffe4daa4cf9d70b683006b599713965c",
  studentPasswordHash:
    "00ee76bdc3220f6f52ad3737eabe79f2:0716e1b6ca069451699ca1fd40bd8ec5b2e9fbe72f40e0673dda59e22430747c78c459b259f1397410941d74b0efa84caf4f1f3fd80f4e35f89acb7c8acfa816",
  superAdminPasswordHash:
    "7293e2104c268de73b3fd015d3725ce0:97c9a48e79ce2cbb2a6d03edb4e6d16f88d4eaa2fe13e97d79b6bd27aaef5b4f3c30d3663469aa4606cf377ca98618318945490b5ffe276ac6bd6ad2796edf95",
  orgStandardAdminPasswordHash:
    "975c216c6cb707e87347f043509cef85:2edd24594376d46135225dfc47b907a9cc05c66f791fc2d28b9d27f255456b8b00386cffb2bd0ccb3900f3f7aa1b4a567156ae7191a3ba16ff2beac7cc96a9d0",
  orgAdvancedAdminPasswordHash:
    "2b4b59adde3251f00fe8678edbab769d:bc94580cabd14998d92c8ebfad2daa16c98b3af2303459c9f8293e162c0ab748acc68474b9c2295c1c4fac078f1344730e47f0586e8be1bb35e6fb5b92b0a9ee",
} as const satisfies SeedPasswordHashes;

const baseIssuedAt = "2026-05-21T00:00:00.000Z";
const authExpiresAt = "2027-05-21T00:00:00.000Z";
const devPracticeStartedAt = "2026-06-10T08:00:00.000Z";
const devPracticeAnsweredAt = "2026-06-10T08:03:00.000Z";
const authAccountCredentialField = ["pass", "word"].join("") as "password";

export function buildDevSeedDataset(passwordHashes: SeedPasswordHashes) {
  const questionOptions = [
    {
      contentRichText: "专卖管理的核心目标是维护市场秩序。",
      isCorrect: true,
      label: "A",
      sortOrder: 1,
    },
    {
      contentRichText: "专卖管理只负责财务核算。",
      isCorrect: false,
      label: "B",
      sortOrder: 2,
    },
    {
      contentRichText: "专卖管理不涉及许可证监管。",
      isCorrect: false,
      label: "C",
      sortOrder: 3,
    },
    {
      contentRichText: "专卖管理可以脱离法律法规执行。",
      isCorrect: false,
      label: "D",
      sortOrder: 4,
    },
  ] as const;
  const questionSnapshot = {
    analysis: "烟草专卖管理的重点是依法维护市场秩序与许可证监管。",
    options: questionOptions.map((questionOption) => ({
      contentRichText: questionOption.contentRichText,
      isCorrect: questionOption.isCorrect,
      label: questionOption.label,
      sortOrder: questionOption.sortOrder,
    })),
    questionPublicId: devSeedPublicIds.question,
    questionType: "single_choice",
    standardAnswer: ["A"],
    stemRichText: "烟草专卖管理的核心目标是什么？",
  };
  const adminAccounts = [
    {
      adminRole: "super_admin",
      authUserId: devSeedPublicIds.superAdminAuthUser,
      name: "本地超级管理员",
      phone: "13900000001",
      publicId: devSeedPublicIds.superAdmin,
      status: "active",
    },
    {
      adminRole: "org_standard_admin",
      authUserId: devSeedPublicIds.orgStandardAdminAuthUser,
      name: "本地标准版企业管理员",
      phone: "13900000004",
      publicId: devSeedPublicIds.orgStandardAdmin,
      status: "active",
    },
    {
      adminRole: "org_advanced_admin",
      authUserId: devSeedPublicIds.orgAdvancedAdminAuthUser,
      name: "本地高级版企业管理员",
      phone: "13900000005",
      publicId: devSeedPublicIds.orgAdvancedAdmin,
      status: "active",
    },
    {
      adminRole: "content_admin",
      authUserId: devSeedPublicIds.contentAdminAuthUser,
      name: "本地内容管理员",
      phone: "13900000006",
      publicId: devSeedPublicIds.contentAdmin,
      status: "active",
    },
    {
      adminRole: "ops_admin",
      authUserId: devSeedPublicIds.opsAdminAuthUser,
      name: "本地运营管理员",
      phone: "13900000007",
      publicId: devSeedPublicIds.opsAdmin,
      status: "active",
    },
  ] as const;
  const adminOrganizationAssignments = adminAccounts.map((adminAccount) => ({
    adminPublicId: adminAccount.publicId,
    createdAt: baseIssuedAt,
    organizationPublicId: devSeedPublicIds.organization,
  }));

  return {
    admin: {
      adminRole: "super_admin",
      authUserId: devSeedPublicIds.superAdminAuthUser,
      name: "本地超级管理员",
      phone: "13900000001",
      publicId: devSeedPublicIds.superAdmin,
      status: "active",
    },
    adminOrganization: {
      adminPublicId: devSeedPublicIds.superAdmin,
      createdAt: baseIssuedAt,
      organizationPublicId: devSeedPublicIds.organization,
    },
    adminOrganizations: adminOrganizationAssignments,
    admins: adminAccounts,
    employee: {
      createdAt: baseIssuedAt,
      organizationPublicId: devSeedPublicIds.organization,
      publicId: devSeedPublicIds.employee,
      userPublicId: devSeedPublicIds.employeeUser,
    },
    employeeUser: {
      authUserId: devSeedPublicIds.employeeAuthUser,
      name: "Local analytics employee",
      phone: "13900000003",
      publicId: devSeedPublicIds.employeeUser,
      status: "active",
      userType: "employee",
    },
    authAccounts: [
      {
        accountId: devSeedPublicIds.superAdminAuthUser,
        [authAccountCredentialField]: passwordHashes.superAdminPasswordHash,
        id: "auth-account-dev-super-admin",
        providerId: "credential",
        userId: devSeedPublicIds.superAdminAuthUser,
      },
      {
        accountId: devSeedPublicIds.orgStandardAdminAuthUser,
        [authAccountCredentialField]:
          passwordHashes.orgStandardAdminPasswordHash,
        id: "auth-account-dev-org-standard-admin",
        providerId: "credential",
        userId: devSeedPublicIds.orgStandardAdminAuthUser,
      },
      {
        accountId: devSeedPublicIds.orgAdvancedAdminAuthUser,
        [authAccountCredentialField]:
          passwordHashes.orgAdvancedAdminPasswordHash,
        id: "auth-account-dev-org-advanced-admin",
        providerId: "credential",
        userId: devSeedPublicIds.orgAdvancedAdminAuthUser,
      },
      {
        accountId: devSeedPublicIds.contentAdminAuthUser,
        [authAccountCredentialField]: passwordHashes.contentAdminPasswordHash,
        id: "auth-account-dev-content-admin",
        providerId: "credential",
        userId: devSeedPublicIds.contentAdminAuthUser,
      },
      {
        accountId: devSeedPublicIds.opsAdminAuthUser,
        [authAccountCredentialField]: passwordHashes.opsAdminPasswordHash,
        id: "auth-account-dev-ops-admin",
        providerId: "credential",
        userId: devSeedPublicIds.opsAdminAuthUser,
      },
      {
        accountId: devSeedPublicIds.studentAuthUser,
        [authAccountCredentialField]: passwordHashes.studentPasswordHash,
        id: "auth-account-dev-student",
        providerId: "credential",
        userId: devSeedPublicIds.studentAuthUser,
      },
      {
        accountId: devSeedPublicIds.employeeAuthUser,
        [authAccountCredentialField]: passwordHashes.employeePasswordHash,
        id: "auth-account-dev-employee",
        providerId: "credential",
        userId: devSeedPublicIds.employeeAuthUser,
      },
    ],
    authUsers: [
      {
        email: devSeedCredentials.superAdminEmail,
        id: devSeedPublicIds.superAdminAuthUser,
        name: "本地超级管理员",
      },
      {
        email: devSeedCredentials.orgStandardAdminEmail,
        id: devSeedPublicIds.orgStandardAdminAuthUser,
        name: "本地标准版企业管理员",
      },
      {
        email: devSeedCredentials.orgAdvancedAdminEmail,
        id: devSeedPublicIds.orgAdvancedAdminAuthUser,
        name: "本地高级版企业管理员",
      },
      {
        email: devSeedCredentials.contentAdminEmail,
        id: devSeedPublicIds.contentAdminAuthUser,
        name: "本地内容管理员",
      },
      {
        email: devSeedCredentials.opsAdminEmail,
        id: devSeedPublicIds.opsAdminAuthUser,
        name: "本地运营管理员",
      },
      {
        email: devSeedCredentials.studentEmail,
        id: devSeedPublicIds.studentAuthUser,
        name: "本地学员",
      },
      {
        email: devSeedCredentials.employeeEmail,
        id: devSeedPublicIds.employeeAuthUser,
        name: "本地企业员工",
      },
    ],
    modelConfig: {
      aiFuncType: "learning_suggestion",
      configVersion: 1,
      displayName: "本地模拟学习建议",
      isEnabled: true,
      maxRetryCount: 0,
      modelName: "mock-learning-suggestion",
      publicId: devSeedPublicIds.modelConfig,
      timeoutSecond: 5,
    },
    modelProvider: {
      baseUrl: null,
      displayName: "本地模拟 AI",
      isEnabled: true,
      providerKey: "mock",
      publicId: devSeedPublicIds.modelProvider,
    },
    organization: {
      contactName: null,
      contactPhone: null,
      name: "本地省级烟草公司",
      orgTier: "province",
      publicId: devSeedPublicIds.organization,
      remark: "Phase 7 local dev seed organization",
      status: "active",
    },
    orgAuth: {
      accountQuota: 10,
      authScopeType: "current_and_descendants",
      expiresAt: authExpiresAt,
      level: 3,
      name: "Local analytics organization authorization",
      profession: "monopoly",
      publicId: devSeedPublicIds.orgAuth,
      purchaserOrganizationPublicId: devSeedPublicIds.organization,
      startsAt: baseIssuedAt,
      status: "active",
      usedQuota: 1,
    },
    orgAuthOrganization: {
      createdAt: baseIssuedAt,
      orgAuthPublicId: devSeedPublicIds.orgAuth,
      organizationPublicId: devSeedPublicIds.organization,
    },
    paper: {
      durationMinute: 30,
      level: 3,
      name: "本地专卖理论模拟卷",
      paperStatus: "published",
      paperType: "mock_paper",
      profession: "monopoly",
      publicId: devSeedPublicIds.paper,
      publishedAt: baseIssuedAt,
      source: "dev_seed",
      subject: "theory",
      totalScore: "5.0",
      year: 2026,
    },
    paperQuestion: {
      materialSnapshot: null,
      publicId: devSeedPublicIds.paperQuestion,
      questionSnapshot,
      score: "5.0",
      sortOrder: 1,
    },
    paperSection: {
      description: "本地运行验证用客观题模块",
      sortOrder: 1,
      title: "单选题",
      totalScore: "5.0",
    },
    practice: {
      expiresAt: authExpiresAt,
      lastAnsweredAt: devPracticeAnsweredAt,
      level: 3,
      paperPublicId: devSeedPublicIds.paper,
      practiceStatus: "in_progress",
      profession: "monopoly",
      publicId: devSeedPublicIds.practice,
      startedAt: devPracticeStartedAt,
      subject: "theory",
      userPublicId: devSeedPublicIds.studentUser,
    },
    practiceAnswerRecord: {
      answerRecordStatus: "scored",
      answerSnapshot: {
        savedFromClientAt: devPracticeAnsweredAt,
        selectedLabels: ["A"],
        textAnswer: null,
      },
      answeredAt: devPracticeAnsweredAt,
      examMode: "practice",
      isCorrect: true,
      maxScore: "5.0",
      paperQuestionPublicId: devSeedPublicIds.paperQuestion,
      publicId: devSeedPublicIds.practiceAnswerRecord,
      questionPublicId: devSeedPublicIds.question,
      questionSnapshot,
      score: "5.0",
      submittedAt: devPracticeAnsweredAt,
    },
    organizationTrainingAnswer: {
      answerOrganizationSnapshot: {
        capturedAt: baseIssuedAt,
        organizationName: "Local Province Tobacco Company",
        organizationPublicId: devSeedPublicIds.organization,
      },
      employeePublicId: devSeedPublicIds.employee,
      organizationPublicId: devSeedPublicIds.organization,
      organizationTrainingAnswerStatus: "submitted",
      organizationTrainingVersionPublicId:
        devSeedPublicIds.organizationTrainingVersion,
      publicId: devSeedPublicIds.organizationTrainingAnswer,
      score: "86.0",
      submittedAt: "2026-06-10T09:00:00.000Z",
      totalScore: "100.0",
    },
    organizationTrainingVersion: {
      authorizationPublicId: devSeedPublicIds.orgAuth,
      authorizationSource: "org_auth",
      description: "Local analytics aggregate source",
      draftPublicId: "organization-training-draft-dev-analytics",
      level: 3,
      organizationPublicId: devSeedPublicIds.organization,
      orgAuthPublicId: devSeedPublicIds.orgAuth,
      ownerPublicId: devSeedPublicIds.organization,
      ownerType: "organization",
      profession: "monopoly",
      publishedAt: baseIssuedAt,
      publishScopeSnapshot: {
        capturedAt: baseIssuedAt,
        organizationPublicIds: [devSeedPublicIds.organization],
      },
      publicId: devSeedPublicIds.organizationTrainingVersion,
      questionCount: 1,
      questionTypeSummary: {
        multiChoice: 0,
        shortAnswer: 0,
        singleChoice: 1,
        trueFalse: 0,
      },
      quotaOwnerPublicId: devSeedPublicIds.organization,
      quotaOwnerType: "organization",
      subject: "theory",
      title: "Local analytics training",
      totalScore: "100.0",
      versionNumber: 1,
      versionStatus: "published",
    },
    personalAuth: {
      expiresAt: authExpiresAt,
      level: 3,
      profession: "monopoly",
      publicId: devSeedPublicIds.personalAuth,
      startsAt: baseIssuedAt,
      status: "active",
    },
    promptTemplate: {
      aiFuncType: "learning_suggestion",
      isActive: true,
      promptTemplateKey: "learning_suggestion_v1",
      publicId: devSeedPublicIds.promptTemplate,
      templateContent:
        "基于本地模拟考试结果生成简短学习建议。禁止调用真实模型。",
      templateHash: "learning_suggestion_v1_baseline",
      version: 1,
    },
    question: {
      analysisRichText: "烟草专卖管理的重点是依法维护市场秩序与许可证监管。",
      level: 3,
      multiChoiceRule: "all_correct_only",
      profession: "monopoly",
      publicId: devSeedPublicIds.question,
      questionType: "single_choice",
      scoringMethod: "auto_match",
      standardAnswerRichText: "A",
      status: "available",
      stemRichText: "烟草专卖管理的核心目标是什么？",
      subject: "theory",
    },
    questionOptions,
    redeemCode: {
      codeDisplay: "DEV-STUDENT-2026",
      codeHash: "dev-seed-redeem-code-hash",
      durationDay: 365,
      generationGroupId: "dev-seed-20260521",
      level: 3,
      profession: "monopoly",
      publicId: devSeedPublicIds.redeemCode,
      redeemDeadlineAt: authExpiresAt,
      status: "used",
      usedAt: baseIssuedAt,
    },
    student: {
      createdAt: baseIssuedAt,
    },
    studentUser: {
      authUserId: devSeedPublicIds.studentAuthUser,
      name: "本地学员",
      phone: "13900000002",
      publicId: devSeedPublicIds.studentUser,
      status: "active",
      userType: "personal",
    },
  } as const;
}

async function getRequiredId(
  query: Promise<IdRow[]>,
  label: string,
): Promise<string> {
  const [row] = await query;

  if (!row) {
    throw new Error(`Missing seeded row: ${label}`);
  }

  return row.id;
}

export async function seedDevDatabase(seedSql: SeedSql): Promise<SeedRow> {
  const seedDataset = buildDevSeedDataset(devSeedPasswordHashes);

  return seedSql.begin(async (sql) => {
    for (const authUser of seedDataset.authUsers) {
      await sql`
        insert into auth_user (id, name, email, email_verified, image, created_at, updated_at)
        values (${authUser.id}, ${authUser.name}, ${authUser.email}, ${baseIssuedAt}, ${null}, ${baseIssuedAt}, ${baseIssuedAt})
        on conflict (id) do update set
          name = excluded.name,
          email = excluded.email,
          email_verified = excluded.email_verified,
          image = excluded.image,
          updated_at = excluded.updated_at
      `;
    }

    for (const authAccount of seedDataset.authAccounts) {
      await sql`
        insert into auth_account (
          id,
          account_id,
          provider_id,
          user_id,
          access_token,
          refresh_token,
          id_token,
          access_token_expires_at,
          refresh_token_expires_at,
          scope,
          password,
          created_at,
          updated_at
        )
        values (
          ${authAccount.id},
          ${authAccount.accountId},
          ${authAccount.providerId},
          ${authAccount.userId},
          ${null},
          ${null},
          ${null},
          ${null},
          ${null},
          ${null},
          ${authAccount.password},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (id) do update set
          account_id = excluded.account_id,
          provider_id = excluded.provider_id,
          user_id = excluded.user_id,
          "password" = excluded."password",
          updated_at = excluded.updated_at
      `;
    }

    const adminIdsByPublicId = new Map<string, string>();

    for (const seedAdmin of seedDataset.admins) {
      const seedAdminId = await getRequiredId(
        sql`
          insert into admin (public_id, auth_user_id, phone, name, admin_role, status, created_at, updated_at)
          values (
            ${seedAdmin.publicId},
            ${seedAdmin.authUserId},
            ${seedAdmin.phone},
            ${seedAdmin.name},
            ${seedAdmin.adminRole},
            ${seedAdmin.status},
            ${baseIssuedAt},
            ${baseIssuedAt}
          )
          on conflict (public_id) do update set
            auth_user_id = excluded.auth_user_id,
            phone = excluded.phone,
            name = excluded.name,
            admin_role = excluded.admin_role,
            status = excluded.status,
            updated_at = excluded.updated_at
          returning id::text as id
        `,
        `admin ${seedAdmin.publicId}`,
      );

      adminIdsByPublicId.set(seedAdmin.publicId, seedAdminId);
    }

    const adminId = adminIdsByPublicId.get(devSeedPublicIds.superAdmin);

    if (adminId === undefined) {
      throw new Error("Missing seeded row: super admin");
    }

    const studentUserId = await getRequiredId(
      sql`
        insert into "user" (public_id, auth_user_id, phone, name, user_type, status, login_failed_count, locked_until_at, disabled_at, created_at, updated_at)
        values (
          ${seedDataset.studentUser.publicId},
          ${seedDataset.studentUser.authUserId},
          ${seedDataset.studentUser.phone},
          ${seedDataset.studentUser.name},
          ${seedDataset.studentUser.userType},
          ${seedDataset.studentUser.status},
          ${0},
          ${null},
          ${null},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          auth_user_id = excluded.auth_user_id,
          phone = excluded.phone,
          name = excluded.name,
          user_type = excluded.user_type,
          status = excluded.status,
          login_failed_count = excluded.login_failed_count,
          locked_until_at = excluded.locked_until_at,
          disabled_at = excluded.disabled_at,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "student user",
    );

    await sql`
      insert into student (user_id, created_at, updated_at)
      values (${studentUserId}, ${seedDataset.student.createdAt}, ${baseIssuedAt})
      on conflict (user_id) do update set updated_at = excluded.updated_at
    `;

    const employeeUserId = await getRequiredId(
      sql`
        insert into "user" (public_id, auth_user_id, phone, name, user_type, status, login_failed_count, locked_until_at, disabled_at, created_at, updated_at)
        values (
          ${seedDataset.employeeUser.publicId},
          ${seedDataset.employeeUser.authUserId},
          ${seedDataset.employeeUser.phone},
          ${seedDataset.employeeUser.name},
          ${seedDataset.employeeUser.userType},
          ${seedDataset.employeeUser.status},
          ${0},
          ${null},
          ${null},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          auth_user_id = excluded.auth_user_id,
          phone = excluded.phone,
          name = excluded.name,
          user_type = excluded.user_type,
          status = excluded.status,
          login_failed_count = excluded.login_failed_count,
          locked_until_at = excluded.locked_until_at,
          disabled_at = excluded.disabled_at,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "employee user",
    );

    const organizationId = await getRequiredId(
      sql`
        insert into organization (public_id, name, org_tier, parent_organization_id, status, contact_name, contact_phone, remark, created_at, updated_at)
        values (
          ${seedDataset.organization.publicId},
          ${seedDataset.organization.name},
          ${seedDataset.organization.orgTier},
          ${null},
          ${seedDataset.organization.status},
          ${seedDataset.organization.contactName},
          ${seedDataset.organization.contactPhone},
          ${seedDataset.organization.remark},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          name = excluded.name,
          org_tier = excluded.org_tier,
          parent_organization_id = excluded.parent_organization_id,
          status = excluded.status,
          contact_name = excluded.contact_name,
          contact_phone = excluded.contact_phone,
          remark = excluded.remark,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "organization",
    );

    for (const adminOrganizationAssignment of seedDataset.adminOrganizations) {
      const assignedAdminId = adminIdsByPublicId.get(
        adminOrganizationAssignment.adminPublicId,
      );

      if (assignedAdminId === undefined) {
        throw new Error(
          `Missing seeded row: admin ${adminOrganizationAssignment.adminPublicId}`,
        );
      }

      await sql`
        insert into admin_organization (admin_id, organization_id, created_at)
        values (
          ${assignedAdminId},
          ${organizationId},
          ${adminOrganizationAssignment.createdAt}
        )
        on conflict (admin_id, organization_id) do nothing
      `;
    }

    const employeeId = await getRequiredId(
      sql`
        insert into employee (public_id, user_id, organization_id, created_at, updated_at)
        values (
          ${seedDataset.employee.publicId},
          ${employeeUserId},
          ${organizationId},
          ${seedDataset.employee.createdAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          user_id = excluded.user_id,
          organization_id = excluded.organization_id,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "employee",
    );

    const orgAuthId = await getRequiredId(
      sql`
        insert into org_auth (
          public_id,
          name,
          purchaser_organization_id,
          auth_scope_type,
          profession,
          level,
          account_quota,
          used_quota,
          starts_at,
          expires_at,
          status,
          cancelled_at,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.orgAuth.publicId},
          ${seedDataset.orgAuth.name},
          ${organizationId},
          ${seedDataset.orgAuth.authScopeType},
          ${seedDataset.orgAuth.profession},
          ${seedDataset.orgAuth.level},
          ${seedDataset.orgAuth.accountQuota},
          ${seedDataset.orgAuth.usedQuota},
          ${seedDataset.orgAuth.startsAt},
          ${seedDataset.orgAuth.expiresAt},
          ${seedDataset.orgAuth.status},
          ${null},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          name = excluded.name,
          purchaser_organization_id = excluded.purchaser_organization_id,
          auth_scope_type = excluded.auth_scope_type,
          profession = excluded.profession,
          level = excluded.level,
          account_quota = excluded.account_quota,
          used_quota = excluded.used_quota,
          starts_at = excluded.starts_at,
          expires_at = excluded.expires_at,
          status = excluded.status,
          cancelled_at = excluded.cancelled_at,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "org auth",
    );

    await sql`
      insert into org_auth_organization (org_auth_id, organization_id, created_at)
      values (
        ${orgAuthId},
        ${organizationId},
        ${seedDataset.orgAuthOrganization.createdAt}
      )
      on conflict (org_auth_id, organization_id) do nothing
    `;

    const organizationTrainingVersionId = await getRequiredId(
      sql`
        insert into organization_training_version (
          public_id,
          draft_public_id,
          version_number,
          organization_id,
          organization_public_id,
          org_auth_id,
          authorization_source,
          authorization_public_id,
          owner_type,
          owner_public_id,
          quota_owner_type,
          quota_owner_public_id,
          publish_scope_snapshot,
          profession,
          level,
          subject,
          title,
          description,
          question_count,
          total_score,
          question_type_summary,
          version_status,
          published_at,
          taken_down_at,
          takedown_reason,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.organizationTrainingVersion.publicId},
          ${seedDataset.organizationTrainingVersion.draftPublicId},
          ${seedDataset.organizationTrainingVersion.versionNumber},
          ${organizationId},
          ${seedDataset.organizationTrainingVersion.organizationPublicId},
          ${orgAuthId},
          ${seedDataset.organizationTrainingVersion.authorizationSource},
          ${seedDataset.organizationTrainingVersion.authorizationPublicId},
          ${seedDataset.organizationTrainingVersion.ownerType},
          ${seedDataset.organizationTrainingVersion.ownerPublicId},
          ${seedDataset.organizationTrainingVersion.quotaOwnerType},
          ${seedDataset.organizationTrainingVersion.quotaOwnerPublicId},
          ${JSON.stringify(seedDataset.organizationTrainingVersion.publishScopeSnapshot)}::jsonb,
          ${seedDataset.organizationTrainingVersion.profession},
          ${seedDataset.organizationTrainingVersion.level},
          ${seedDataset.organizationTrainingVersion.subject},
          ${seedDataset.organizationTrainingVersion.title},
          ${seedDataset.organizationTrainingVersion.description},
          ${seedDataset.organizationTrainingVersion.questionCount},
          ${seedDataset.organizationTrainingVersion.totalScore},
          ${JSON.stringify(seedDataset.organizationTrainingVersion.questionTypeSummary)}::jsonb,
          ${seedDataset.organizationTrainingVersion.versionStatus},
          ${seedDataset.organizationTrainingVersion.publishedAt},
          ${null},
          ${null},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          draft_public_id = excluded.draft_public_id,
          version_number = excluded.version_number,
          organization_id = excluded.organization_id,
          organization_public_id = excluded.organization_public_id,
          org_auth_id = excluded.org_auth_id,
          authorization_source = excluded.authorization_source,
          authorization_public_id = excluded.authorization_public_id,
          owner_type = excluded.owner_type,
          owner_public_id = excluded.owner_public_id,
          quota_owner_type = excluded.quota_owner_type,
          quota_owner_public_id = excluded.quota_owner_public_id,
          publish_scope_snapshot = excluded.publish_scope_snapshot,
          profession = excluded.profession,
          level = excluded.level,
          subject = excluded.subject,
          title = excluded.title,
          description = excluded.description,
          question_count = excluded.question_count,
          total_score = excluded.total_score,
          question_type_summary = excluded.question_type_summary,
          version_status = excluded.version_status,
          published_at = excluded.published_at,
          taken_down_at = excluded.taken_down_at,
          takedown_reason = excluded.takedown_reason,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "organization training version",
    );

    await sql`
      insert into organization_training_answer (
        public_id,
        organization_training_version_id,
        organization_training_version_public_id,
        employee_id,
        employee_public_id,
        organization_id,
        organization_public_id,
        organization_training_answer_status,
        score,
        total_score,
        submitted_at,
        answer_organization_snapshot,
        created_at,
        updated_at
      )
      values (
        ${seedDataset.organizationTrainingAnswer.publicId},
        ${organizationTrainingVersionId},
        ${seedDataset.organizationTrainingAnswer.organizationTrainingVersionPublicId},
        ${employeeId},
        ${seedDataset.organizationTrainingAnswer.employeePublicId},
        ${organizationId},
        ${seedDataset.organizationTrainingAnswer.organizationPublicId},
        ${seedDataset.organizationTrainingAnswer.organizationTrainingAnswerStatus},
        ${seedDataset.organizationTrainingAnswer.score},
        ${seedDataset.organizationTrainingAnswer.totalScore},
        ${seedDataset.organizationTrainingAnswer.submittedAt},
        ${JSON.stringify(seedDataset.organizationTrainingAnswer.answerOrganizationSnapshot)}::jsonb,
        ${baseIssuedAt},
        ${baseIssuedAt}
      )
      on conflict (public_id) do update set
        organization_training_version_id = excluded.organization_training_version_id,
        organization_training_version_public_id = excluded.organization_training_version_public_id,
        employee_id = excluded.employee_id,
        employee_public_id = excluded.employee_public_id,
        organization_id = excluded.organization_id,
        organization_public_id = excluded.organization_public_id,
        organization_training_answer_status = excluded.organization_training_answer_status,
        score = excluded.score,
        total_score = excluded.total_score,
        submitted_at = excluded.submitted_at,
        answer_organization_snapshot = excluded.answer_organization_snapshot,
        updated_at = excluded.updated_at
    `;

    const redeemCodeId = await getRequiredId(
      sql`
        insert into redeem_code (
          public_id,
          code_hash,
          code_display,
          profession,
          level,
          duration_day,
          redeem_deadline_at,
          status,
          used_by_user_id,
          used_at,
          generation_group_id,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.redeemCode.publicId},
          ${seedDataset.redeemCode.codeHash},
          ${seedDataset.redeemCode.codeDisplay},
          ${seedDataset.redeemCode.profession},
          ${seedDataset.redeemCode.level},
          ${seedDataset.redeemCode.durationDay},
          ${seedDataset.redeemCode.redeemDeadlineAt},
          ${seedDataset.redeemCode.status},
          ${studentUserId},
          ${seedDataset.redeemCode.usedAt},
          ${seedDataset.redeemCode.generationGroupId},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          code_hash = excluded.code_hash,
          code_display = excluded.code_display,
          profession = excluded.profession,
          level = excluded.level,
          duration_day = excluded.duration_day,
          redeem_deadline_at = excluded.redeem_deadline_at,
          status = excluded.status,
          used_by_user_id = excluded.used_by_user_id,
          used_at = excluded.used_at,
          generation_group_id = excluded.generation_group_id,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "redeem code",
    );

    await sql`
      insert into personal_auth (public_id, user_id, redeem_code_id, profession, level, starts_at, expires_at, status, created_at, updated_at)
      values (
        ${seedDataset.personalAuth.publicId},
        ${studentUserId},
        ${redeemCodeId},
        ${seedDataset.personalAuth.profession},
        ${seedDataset.personalAuth.level},
        ${seedDataset.personalAuth.startsAt},
        ${seedDataset.personalAuth.expiresAt},
        ${seedDataset.personalAuth.status},
        ${baseIssuedAt},
        ${baseIssuedAt}
      )
      on conflict (public_id) do update set
        user_id = excluded.user_id,
        redeem_code_id = excluded.redeem_code_id,
        profession = excluded.profession,
        level = excluded.level,
        starts_at = excluded.starts_at,
        expires_at = excluded.expires_at,
        status = excluded.status,
        updated_at = excluded.updated_at
    `;

    const questionId = await getRequiredId(
      sql`
        insert into question (
          public_id,
          question_type,
          profession,
          level,
          subject,
          stem_rich_text,
          analysis_rich_text,
          standard_answer_rich_text,
          status,
          is_locked,
          locked_at,
          multi_choice_rule,
          scoring_method,
          material_id,
          created_by_admin_id,
          updated_by_admin_id,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.question.publicId},
          ${seedDataset.question.questionType},
          ${seedDataset.question.profession},
          ${seedDataset.question.level},
          ${seedDataset.question.subject},
          ${seedDataset.question.stemRichText},
          ${seedDataset.question.analysisRichText},
          ${seedDataset.question.standardAnswerRichText},
          ${seedDataset.question.status},
          ${false},
          ${null},
          ${seedDataset.question.multiChoiceRule},
          ${seedDataset.question.scoringMethod},
          ${null},
          ${adminId},
          ${adminId},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          question_type = excluded.question_type,
          profession = excluded.profession,
          level = excluded.level,
          subject = excluded.subject,
          stem_rich_text = excluded.stem_rich_text,
          analysis_rich_text = excluded.analysis_rich_text,
          standard_answer_rich_text = excluded.standard_answer_rich_text,
          status = excluded.status,
          is_locked = excluded.is_locked,
          locked_at = excluded.locked_at,
          multi_choice_rule = excluded.multi_choice_rule,
          scoring_method = excluded.scoring_method,
          material_id = excluded.material_id,
          updated_by_admin_id = excluded.updated_by_admin_id,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "question",
    );

    for (const questionOption of seedDataset.questionOptions) {
      await sql`
        with updated_question_option as (
          update question_option
          set
            content_rich_text = ${questionOption.contentRichText},
            is_correct = ${questionOption.isCorrect},
            sort_order = ${questionOption.sortOrder},
            updated_at = ${baseIssuedAt}
          where question_id = ${questionId} and label = ${questionOption.label}
          returning id
        )
        insert into question_option (question_id, label, content_rich_text, is_correct, sort_order, created_at, updated_at)
        select
          ${questionId},
          ${questionOption.label},
          ${questionOption.contentRichText},
          ${questionOption.isCorrect},
          ${questionOption.sortOrder},
          ${baseIssuedAt},
          ${baseIssuedAt}
        where not exists (select 1 from updated_question_option)
      `;
    }

    const paperId = await getRequiredId(
      sql`
        insert into paper (
          public_id,
          name,
          profession,
          level,
          subject,
          paper_status,
          paper_type,
          year,
          source,
          duration_minute,
          total_score,
          published_at,
          archived_at,
          created_by_admin_id,
          updated_by_admin_id,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.paper.publicId},
          ${seedDataset.paper.name},
          ${seedDataset.paper.profession},
          ${seedDataset.paper.level},
          ${seedDataset.paper.subject},
          ${seedDataset.paper.paperStatus},
          ${seedDataset.paper.paperType},
          ${seedDataset.paper.year},
          ${seedDataset.paper.source},
          ${seedDataset.paper.durationMinute},
          ${seedDataset.paper.totalScore},
          ${seedDataset.paper.publishedAt},
          ${null},
          ${adminId},
          ${adminId},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          name = excluded.name,
          profession = excluded.profession,
          level = excluded.level,
          subject = excluded.subject,
          paper_status = excluded.paper_status,
          paper_type = excluded.paper_type,
          year = excluded.year,
          source = excluded.source,
          duration_minute = excluded.duration_minute,
          total_score = excluded.total_score,
          published_at = excluded.published_at,
          archived_at = excluded.archived_at,
          updated_by_admin_id = excluded.updated_by_admin_id,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "paper",
    );

    const paperSectionId = await getRequiredId(
      sql`
        with updated_paper_section as (
          update paper_section
          set
            title = ${seedDataset.paperSection.title},
            description = ${seedDataset.paperSection.description},
            total_score = ${seedDataset.paperSection.totalScore},
            updated_at = ${baseIssuedAt}
          where paper_id = ${paperId} and sort_order = ${seedDataset.paperSection.sortOrder}
          returning id::text as id
        ),
        inserted_paper_section as (
          insert into paper_section (paper_id, title, description, sort_order, total_score, created_at, updated_at)
          select
            ${paperId},
            ${seedDataset.paperSection.title},
            ${seedDataset.paperSection.description},
            ${seedDataset.paperSection.sortOrder},
            ${seedDataset.paperSection.totalScore},
            ${baseIssuedAt},
            ${baseIssuedAt}
          where not exists (select 1 from updated_paper_section)
          returning id::text as id
        )
        select id from updated_paper_section
        union all
        select id from inserted_paper_section
      `,
      "paper section",
    );

    const paperQuestionId = await getRequiredId(
      sql`
        insert into paper_question (
          public_id,
          paper_id,
          paper_section_id,
          question_group_id,
          question_id,
          question_snapshot,
          material_snapshot,
          score,
          sort_order,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.paperQuestion.publicId},
          ${paperId},
          ${paperSectionId},
          ${null},
          ${questionId},
          ${JSON.stringify(seedDataset.paperQuestion.questionSnapshot)}::jsonb,
          ${seedDataset.paperQuestion.materialSnapshot},
          ${seedDataset.paperQuestion.score},
          ${seedDataset.paperQuestion.sortOrder},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          paper_id = excluded.paper_id,
          paper_section_id = excluded.paper_section_id,
          question_group_id = excluded.question_group_id,
          question_id = excluded.question_id,
          question_snapshot = excluded.question_snapshot,
          material_snapshot = excluded.material_snapshot,
          score = excluded.score,
          sort_order = excluded.sort_order,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "paper question",
    );

    const practicePaperSnapshot = {
      durationMinute: seedDataset.paper.durationMinute,
      level: seedDataset.paper.level,
      name: seedDataset.paper.name,
      paperSections: [
        {
          description: seedDataset.paperSection.description,
          paperQuestions: [
            {
              ...seedDataset.paperQuestion.questionSnapshot,
              analysisRichText: seedDataset.question.analysisRichText,
              materialSnapshot: seedDataset.paperQuestion.materialSnapshot,
              paperQuestionPublicId: seedDataset.paperQuestion.publicId,
              questionPublicId: seedDataset.question.publicId,
              questionType: seedDataset.question.questionType,
              score: seedDataset.paperQuestion.score,
              standardAnswerLabels:
                seedDataset.paperQuestion.questionSnapshot.standardAnswer,
              standardAnswerRichText:
                seedDataset.question.standardAnswerRichText,
            },
          ],
          sortOrder: seedDataset.paperSection.sortOrder,
          title: seedDataset.paperSection.title,
          totalScore: seedDataset.paperSection.totalScore,
        },
      ],
      profession: seedDataset.paper.profession,
      publicId: seedDataset.paper.publicId,
      subject: seedDataset.paper.subject,
      totalScore: seedDataset.paper.totalScore,
    };

    const practiceId = await getRequiredId(
      sql`
        insert into practice (
          public_id,
          user_id,
          paper_id,
          paper_public_id,
          paper_snapshot,
          profession,
          level,
          subject,
          practice_status,
          started_at,
          last_answered_at,
          expires_at,
          terminated_at,
          termination_reason,
          created_at,
          updated_at
        )
        values (
          ${seedDataset.practice.publicId},
          ${studentUserId},
          ${paperId},
          ${seedDataset.practice.paperPublicId},
          ${JSON.stringify(practicePaperSnapshot)}::jsonb,
          ${seedDataset.practice.profession},
          ${seedDataset.practice.level},
          ${seedDataset.practice.subject},
          ${seedDataset.practice.practiceStatus},
          ${seedDataset.practice.startedAt},
          ${seedDataset.practice.lastAnsweredAt},
          ${seedDataset.practice.expiresAt},
          ${null},
          ${null},
          ${seedDataset.practice.startedAt},
          ${seedDataset.practice.lastAnsweredAt}
        )
        on conflict (public_id) do update set
          user_id = excluded.user_id,
          paper_id = excluded.paper_id,
          paper_public_id = excluded.paper_public_id,
          paper_snapshot = excluded.paper_snapshot,
          profession = excluded.profession,
          level = excluded.level,
          subject = excluded.subject,
          practice_status = excluded.practice_status,
          started_at = excluded.started_at,
          last_answered_at = excluded.last_answered_at,
          expires_at = excluded.expires_at,
          terminated_at = excluded.terminated_at,
          termination_reason = excluded.termination_reason,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "practice",
    );

    await sql`
      insert into answer_record (
        public_id,
        user_id,
        exam_mode,
        practice_id,
        mock_exam_id,
        paper_id,
        paper_question_id,
        paper_question_public_id,
        question_public_id,
        question_snapshot,
        answer_snapshot,
        answer_record_status,
        is_correct,
        score,
        max_score,
        answered_at,
        submitted_at,
        created_at,
        updated_at
      )
      values (
        ${seedDataset.practiceAnswerRecord.publicId},
        ${studentUserId},
        ${seedDataset.practiceAnswerRecord.examMode},
        ${practiceId},
        ${null},
        ${paperId},
        ${paperQuestionId},
        ${seedDataset.practiceAnswerRecord.paperQuestionPublicId},
        ${seedDataset.practiceAnswerRecord.questionPublicId},
        ${JSON.stringify(seedDataset.practiceAnswerRecord.questionSnapshot)}::jsonb,
        ${JSON.stringify(seedDataset.practiceAnswerRecord.answerSnapshot)}::jsonb,
        ${seedDataset.practiceAnswerRecord.answerRecordStatus},
        ${seedDataset.practiceAnswerRecord.isCorrect},
        ${seedDataset.practiceAnswerRecord.score},
        ${seedDataset.practiceAnswerRecord.maxScore},
        ${seedDataset.practiceAnswerRecord.answeredAt},
        ${seedDataset.practiceAnswerRecord.submittedAt},
        ${seedDataset.practiceAnswerRecord.answeredAt},
        ${seedDataset.practiceAnswerRecord.submittedAt}
      )
      on conflict (public_id) do update set
        user_id = excluded.user_id,
        exam_mode = excluded.exam_mode,
        practice_id = excluded.practice_id,
        mock_exam_id = excluded.mock_exam_id,
        paper_id = excluded.paper_id,
        paper_question_id = excluded.paper_question_id,
        paper_question_public_id = excluded.paper_question_public_id,
        question_public_id = excluded.question_public_id,
        question_snapshot = excluded.question_snapshot,
        answer_snapshot = excluded.answer_snapshot,
        answer_record_status = excluded.answer_record_status,
        is_correct = excluded.is_correct,
        score = excluded.score,
        max_score = excluded.max_score,
        answered_at = excluded.answered_at,
        submitted_at = excluded.submitted_at,
        updated_at = excluded.updated_at
    `;

    const modelProviderId = await getRequiredId(
      sql`
        insert into model_provider (public_id, provider_key, display_name, api_key_secret_ref, api_key_last_four, base_url, is_enabled, created_at, updated_at)
        values (
          ${seedDataset.modelProvider.publicId},
          ${seedDataset.modelProvider.providerKey},
          ${seedDataset.modelProvider.displayName},
          ${null},
          ${null},
          ${seedDataset.modelProvider.baseUrl},
          ${seedDataset.modelProvider.isEnabled},
          ${baseIssuedAt},
          ${baseIssuedAt}
        )
        on conflict (public_id) do update set
          provider_key = excluded.provider_key,
          display_name = excluded.display_name,
          api_key_secret_ref = excluded.api_key_secret_ref,
          api_key_last_four = excluded.api_key_last_four,
          base_url = excluded.base_url,
          is_enabled = excluded.is_enabled,
          updated_at = excluded.updated_at
        returning id::text as id
      `,
      "model provider",
    );

    await sql`
      insert into model_config (
        public_id,
        model_provider_id,
        ai_func_type,
        model_name,
        display_name,
        config_version,
        is_enabled,
        timeout_second,
        max_retry_count,
        fallback_model_config_id,
        created_at,
        updated_at
      )
      values (
        ${seedDataset.modelConfig.publicId},
        ${modelProviderId},
        ${seedDataset.modelConfig.aiFuncType},
        ${seedDataset.modelConfig.modelName},
        ${seedDataset.modelConfig.displayName},
        ${seedDataset.modelConfig.configVersion},
        ${seedDataset.modelConfig.isEnabled},
        ${seedDataset.modelConfig.timeoutSecond},
        ${seedDataset.modelConfig.maxRetryCount},
        ${null},
        ${baseIssuedAt},
        ${baseIssuedAt}
      )
      on conflict (public_id) do update set
        model_provider_id = excluded.model_provider_id,
        ai_func_type = excluded.ai_func_type,
        model_name = excluded.model_name,
        display_name = excluded.display_name,
        config_version = excluded.config_version,
        is_enabled = excluded.is_enabled,
        timeout_second = excluded.timeout_second,
        max_retry_count = excluded.max_retry_count,
        fallback_model_config_id = excluded.fallback_model_config_id,
        updated_at = excluded.updated_at
    `;

    await sql`
      insert into prompt_template (
        public_id,
        prompt_template_key,
        ai_func_type,
        version,
        template_content,
        template_hash,
        is_active,
        created_at,
        updated_at,
        archived_at
      )
      values (
        ${seedDataset.promptTemplate.publicId},
        ${seedDataset.promptTemplate.promptTemplateKey},
        ${seedDataset.promptTemplate.aiFuncType},
        ${seedDataset.promptTemplate.version},
        ${seedDataset.promptTemplate.templateContent},
        ${seedDataset.promptTemplate.templateHash},
        ${seedDataset.promptTemplate.isActive},
        ${baseIssuedAt},
        ${baseIssuedAt},
        ${null}
      )
      on conflict (public_id) do update set
        prompt_template_key = excluded.prompt_template_key,
        ai_func_type = excluded.ai_func_type,
        version = excluded.version,
        template_content = excluded.template_content,
        template_hash = excluded.template_hash,
        is_active = excluded.is_active,
        updated_at = excluded.updated_at,
        archived_at = excluded.archived_at
    `;

    const [summary] = await sql`
      select
        (select count(*)::int from auth_user where id in (${devSeedPublicIds.superAdminAuthUser}, ${devSeedPublicIds.orgStandardAdminAuthUser}, ${devSeedPublicIds.orgAdvancedAdminAuthUser}, ${devSeedPublicIds.contentAdminAuthUser}, ${devSeedPublicIds.opsAdminAuthUser}, ${devSeedPublicIds.studentAuthUser}, ${devSeedPublicIds.employeeAuthUser})) as auth_user_count,
        (select count(*)::int from admin where public_id in (${devSeedPublicIds.superAdmin}, ${devSeedPublicIds.orgStandardAdmin}, ${devSeedPublicIds.orgAdvancedAdmin}, ${devSeedPublicIds.contentAdmin}, ${devSeedPublicIds.opsAdmin})) as admin_count,
        (select count(*)::int from admin_organization ao inner join admin a on ao.admin_id = a.id inner join organization o on ao.organization_id = o.id where a.public_id in (${devSeedPublicIds.superAdmin}, ${devSeedPublicIds.orgStandardAdmin}, ${devSeedPublicIds.orgAdvancedAdmin}, ${devSeedPublicIds.contentAdmin}, ${devSeedPublicIds.opsAdmin}) and o.public_id = ${devSeedPublicIds.organization}) as admin_organization_count,
        (select count(*)::int from "user" where public_id = ${devSeedPublicIds.studentUser}) as student_user_count,
        (select count(*)::int from "user" where public_id = ${devSeedPublicIds.employeeUser}) as employee_user_count,
        (select count(*)::int from organization where public_id = ${devSeedPublicIds.organization}) as organization_count,
        (select count(*)::int from employee where public_id = ${devSeedPublicIds.employee}) as employee_count,
        (select count(*)::int from org_auth where public_id = ${devSeedPublicIds.orgAuth}) as org_auth_count,
        (select count(*)::int from org_auth_organization oao inner join org_auth oa on oao.org_auth_id = oa.id inner join organization o on oao.organization_id = o.id where oa.public_id = ${devSeedPublicIds.orgAuth} and o.public_id = ${devSeedPublicIds.organization}) as org_auth_organization_count,
        (select count(*)::int from organization_training_version where public_id = ${devSeedPublicIds.organizationTrainingVersion}) as organization_training_version_count,
        (select count(*)::int from organization_training_answer where public_id = ${devSeedPublicIds.organizationTrainingAnswer}) as organization_training_answer_count,
        (select count(*)::int from personal_auth where public_id = ${devSeedPublicIds.personalAuth}) as personal_auth_count,
        (select count(*)::int from paper where public_id = ${devSeedPublicIds.paper}) as paper_count,
        (select count(*)::int from paper_question where public_id = ${devSeedPublicIds.paperQuestion}) as paper_question_count,
        (select count(*)::int from model_config where public_id = ${devSeedPublicIds.modelConfig}) as model_config_count
    `;

    return summary ?? {};
  });
}

function createSeedSql(): SeedSql {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the dev database.");
  }

  return postgres(databaseUrl, { max: 1 }) as unknown as SeedSql;
}

function loadLocalEnv(): void {
  const localEnvPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(localEnvPath)) {
    return;
  }

  const localEnvContent = readFileSync(localEnvPath, "utf8");

  for (const line of localEnvContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/gu, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function isDirectRun(): boolean {
  const entrypointPath = process.argv[1];

  return Boolean(
    entrypointPath &&
    fileURLToPath(import.meta.url) === resolve(entrypointPath),
  );
}

if (isDirectRun()) {
  const sql = createSeedSql();

  try {
    const summary = await seedDevDatabase(sql);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await sql.end?.();
  }
}
