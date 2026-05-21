import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

type SeedRow = Record<string, unknown>;
type SeedPasswordHashes = {
  studentPasswordHash: string;
  superAdminPasswordHash: string;
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
  studentAuthUser: "auth-user-dev-student",
  superAdmin: "admin-dev-super-admin",
  studentUser: "user-dev-student",
  organization: "org-dev-province",
  redeemCode: "redeem-code-dev-student",
  personalAuth: "personal-auth-dev-student",
  question: "question-dev-single-choice",
  paper: "paper-dev-theory",
  paperQuestion: "paper-question-dev-single-choice",
  modelProvider: "model-provider-dev-mock",
  modelConfig: "model-config-dev-learning-suggestion",
  promptTemplate: "prompt-template-dev-learning-suggestion",
} as const;

export const devSeedCredentials = {
  studentEmail: "student.dev@tiku.local",
  studentPassword: "TikuDevStudent#2026",
  superAdminEmail: "admin.dev@tiku.local",
  superAdminPassword: "TikuDevAdmin#2026",
} as const;

const devSeedPasswordHashes = {
  studentPasswordHash:
    "00ee76bdc3220f6f52ad3737eabe79f2:0716e1b6ca069451699ca1fd40bd8ec5b2e9fbe72f40e0673dda59e22430747c78c459b259f1397410941d74b0efa84caf4f1f3fd80f4e35f89acb7c8acfa816",
  superAdminPasswordHash:
    "7293e2104c268de73b3fd015d3725ce0:97c9a48e79ce2cbb2a6d03edb4e6d16f88d4eaa2fe13e97d79b6bd27aaef5b4f3c30d3663469aa4606cf377ca98618318945490b5ffe276ac6bd6ad2796edf95",
} as const satisfies SeedPasswordHashes;

const baseIssuedAt = "2026-05-21T00:00:00.000Z";
const authExpiresAt = "2027-05-21T00:00:00.000Z";

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

  return {
    admin: {
      adminRole: "super_admin",
      authUserId: devSeedPublicIds.superAdminAuthUser,
      name: "本地超级管理员",
      phone: "13900000001",
      publicId: devSeedPublicIds.superAdmin,
      status: "active",
    },
    authAccounts: [
      {
        accountId: devSeedPublicIds.superAdminAuthUser,
        id: "auth-account-dev-super-admin",
        password: passwordHashes.superAdminPasswordHash,
        providerId: "credential",
        userId: devSeedPublicIds.superAdminAuthUser,
      },
      {
        accountId: devSeedPublicIds.studentAuthUser,
        id: "auth-account-dev-student",
        password: passwordHashes.studentPasswordHash,
        providerId: "credential",
        userId: devSeedPublicIds.studentAuthUser,
      },
    ],
    authUsers: [
      {
        email: devSeedCredentials.superAdminEmail,
        id: devSeedPublicIds.superAdminAuthUser,
        name: "本地超级管理员",
      },
      {
        email: devSeedCredentials.studentEmail,
        id: devSeedPublicIds.studentAuthUser,
        name: "本地学员",
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
      promptTemplateKey: "dev_learning_suggestion",
      publicId: devSeedPublicIds.promptTemplate,
      templateContent:
        "基于本地模拟考试结果生成简短学习建议。禁止调用真实模型。",
      templateHash: "dev-learning-suggestion-template-v1",
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
          password = excluded.password,
          updated_at = excluded.updated_at
      `;
    }

    const adminId = await getRequiredId(
      sql`
        insert into admin (public_id, auth_user_id, phone, name, admin_role, status, created_at, updated_at)
        values (
          ${seedDataset.admin.publicId},
          ${seedDataset.admin.authUserId},
          ${seedDataset.admin.phone},
          ${seedDataset.admin.name},
          ${seedDataset.admin.adminRole},
          ${seedDataset.admin.status},
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
      "admin",
    );

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

    await sql`
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

    await sql`
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
        (select count(*)::int from auth_user where id in (${devSeedPublicIds.superAdminAuthUser}, ${devSeedPublicIds.studentAuthUser})) as auth_user_count,
        (select count(*)::int from admin where public_id = ${devSeedPublicIds.superAdmin}) as admin_count,
        (select count(*)::int from "user" where public_id = ${devSeedPublicIds.studentUser}) as student_user_count,
        (select count(*)::int from organization where public_id = ${devSeedPublicIds.organization}) as organization_count,
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
