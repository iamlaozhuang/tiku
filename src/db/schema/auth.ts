import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

const createdAtColumn = () => timestampColumn("created_at").defaultNow();

const updatedAtColumn = () => timestampColumn("updated_at").defaultNow();

export const professionValues = ["monopoly", "marketing", "logistics"] as const;
export const userTypeValues = ["personal", "employee"] as const;
export const userStatusValues = ["active", "disabled"] as const;
export const adminRoleValues = [
  "super_admin",
  "ops_admin",
  "content_admin",
  "org_standard_admin",
  "org_advanced_admin",
] as const;
export const orgTierValues = [
  "province",
  "city",
  "district",
  "station",
] as const;
export const orgStatusValues = ["active", "disabled"] as const;
export const redeemCodeStatusValues = ["unused", "used", "expired"] as const;
export const authStatusValues = ["active", "expired", "cancelled"] as const;
export const authScopeTypeValues = [
  "current_and_descendants",
  "specified_nodes",
] as const;
export const authorizationEditionValues = ["standard", "advanced"] as const;
export const redeemCodeTypeValues = [
  "personal_standard_activation",
  "personal_advanced_activation",
  "edition_upgrade",
] as const;
export const authUpgradeSourceTypeValues = [
  "redeem_code",
  "ops_manual",
] as const;
export const authUpgradeStatusValues = [
  "active",
  "expired",
  "revoked",
] as const;

export const professionEnum = pgEnum("profession", professionValues);
export const userTypeEnum = pgEnum("user_type", userTypeValues);
export const userStatusEnum = pgEnum("user_status", userStatusValues);
export const adminRoleEnum = pgEnum("admin_role", adminRoleValues);
export const orgTierEnum = pgEnum("org_tier", orgTierValues);
export const orgStatusEnum = pgEnum("org_status", orgStatusValues);
export const redeemCodeStatusEnum = pgEnum(
  "redeem_code_status",
  redeemCodeStatusValues,
);
export const authStatusEnum = pgEnum("auth_status", authStatusValues);
export const authScopeTypeEnum = pgEnum("auth_scope_type", authScopeTypeValues);
export const authorizationEditionEnum = pgEnum(
  "authorization_edition",
  authorizationEditionValues,
);
export const redeemCodeTypeEnum = pgEnum(
  "redeem_code_type",
  redeemCodeTypeValues,
);
export const authUpgradeSourceTypeEnum = pgEnum(
  "auth_upgrade_source_type",
  authUpgradeSourceTypeValues,
);
export const authUpgradeStatusEnum = pgEnum(
  "auth_upgrade_status",
  authUpgradeStatusValues,
);

export const authUser = pgTable(
  "auth_user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    email_verified: timestampColumn("email_verified").defaultNow(),
    image: text("image"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_auth_user_email").on(table.email),
    index("idx_auth_user_created_at").on(table.created_at),
  ],
);

export const authSession = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expires_at: timestampColumn("expires_at"),
    token: text("token").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
    ip_address: text("ip_address"),
    user_agent: text("user_agent"),
    user_id: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("udx_auth_session_token").on(table.token),
    index("idx_auth_session_user_id").on(table.user_id),
    index("idx_auth_session_expires_at").on(table.expires_at),
  ],
);

export const authAccount = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    account_id: text("account_id").notNull(),
    provider_id: text("provider_id").notNull(),
    user_id: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    access_token: text("access_token"),
    refresh_token: text("refresh_token"),
    id_token: text("id_token"),
    access_token_expires_at: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refresh_token_expires_at: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_auth_account_provider_id_account_id").on(
      table.provider_id,
      table.account_id,
    ),
    index("idx_auth_account_user_id").on(table.user_id),
  ],
);

export const authVerification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expires_at: timestampColumn("expires_at"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    index("idx_auth_verification_identifier").on(table.identifier),
    index("idx_auth_verification_expires_at").on(table.expires_at),
  ],
);

export const user = pgTable(
  "user",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    auth_user_id: text("auth_user_id").references(() => authUser.id, {
      onDelete: "set null",
    }),
    phone: text("phone").notNull(),
    name: text("name").notNull(),
    user_type: userTypeEnum("user_type").notNull(),
    status: userStatusEnum("status").default("active").notNull(),
    login_failed_count: integer("login_failed_count").default(0).notNull(),
    locked_until_at: timestamp("locked_until_at", { withTimezone: true }),
    disabled_at: timestamp("disabled_at", { withTimezone: true }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_user_public_id").on(table.public_id),
    uniqueIndex("udx_user_auth_user_id").on(table.auth_user_id),
    uniqueIndex("udx_user_phone").on(table.phone),
    index("idx_user_status").on(table.status),
    index("idx_user_user_type").on(table.user_type),
  ],
);

export const student = pgTable(
  "student",
  {
    id: idColumn(),
    user_id: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_student_user_id").on(table.user_id),
    index("idx_student_created_at").on(table.created_at),
  ],
);

export const admin = pgTable(
  "admin",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    auth_user_id: text("auth_user_id").references(() => authUser.id, {
      onDelete: "set null",
    }),
    phone: text("phone").notNull(),
    name: text("name").notNull(),
    admin_role: adminRoleEnum("admin_role").notNull(),
    status: userStatusEnum("status").default("active").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_admin_public_id").on(table.public_id),
    uniqueIndex("udx_admin_auth_user_id").on(table.auth_user_id),
    uniqueIndex("udx_admin_phone").on(table.phone),
    index("idx_admin_admin_role").on(table.admin_role),
    index("idx_admin_status").on(table.status),
  ],
);

export const organization = pgTable(
  "organization",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    name: text("name").notNull(),
    org_tier: orgTierEnum("org_tier").notNull(),
    parent_organization_id: bigint("parent_organization_id", {
      mode: "number",
    }).references((): AnyPgColumn => organization.id, { onDelete: "restrict" }),
    status: orgStatusEnum("status").default("active").notNull(),
    contact_name: text("contact_name"),
    contact_phone: text("contact_phone"),
    remark: text("remark"),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_organization_public_id").on(table.public_id),
    index("idx_organization_parent_organization_id").on(
      table.parent_organization_id,
    ),
    index("idx_organization_org_tier").on(table.org_tier),
    index("idx_organization_status").on(table.status),
  ],
);

export const adminOrganization = pgTable(
  "admin_organization",
  {
    id: idColumn(),
    admin_id: bigint("admin_id", { mode: "number" })
      .notNull()
      .references(() => admin.id, { onDelete: "cascade" }),
    organization_id: bigint("organization_id", { mode: "number" })
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_admin_organization_admin_id_organization_id").on(
      table.admin_id,
      table.organization_id,
    ),
    index("idx_admin_organization_admin_id").on(table.admin_id),
    index("idx_admin_organization_organization_id").on(table.organization_id),
  ],
);

export const employee = pgTable(
  "employee",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    organization_id: bigint("organization_id", { mode: "number" })
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_employee_public_id").on(table.public_id),
    uniqueIndex("udx_employee_user_id").on(table.user_id),
    index("idx_employee_organization_id").on(table.organization_id),
  ],
);

export const redeemCode = pgTable(
  "redeem_code",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    code_hash: text("code_hash").notNull(),
    code_display: text("code_display").notNull(),
    redeem_code_type: redeemCodeTypeEnum("redeem_code_type")
      .default("personal_standard_activation")
      .notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    duration_day: integer("duration_day").notNull(),
    redeem_deadline_at: timestampColumn("redeem_deadline_at"),
    status: redeemCodeStatusEnum("status").default("unused").notNull(),
    used_by_user_id: bigint("used_by_user_id", { mode: "number" }).references(
      () => user.id,
      { onDelete: "restrict" },
    ),
    used_at: timestamp("used_at", { withTimezone: true }),
    generation_group_id: text("generation_group_id").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_redeem_code_public_id").on(table.public_id),
    uniqueIndex("udx_redeem_code_code_hash").on(table.code_hash),
    index("idx_redeem_code_status").on(table.status),
    index("idx_redeem_code_used_by_user_id").on(table.used_by_user_id),
    index("idx_redeem_code_generation_group_id").on(table.generation_group_id),
  ],
);

export const personalAuth = pgTable(
  "personal_auth",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    user_id: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    redeem_code_id: bigint("redeem_code_id", { mode: "number" })
      .notNull()
      .references(() => redeemCode.id, { onDelete: "restrict" }),
    edition: authorizationEditionEnum("edition").default("standard").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    starts_at: timestampColumn("starts_at"),
    expires_at: timestampColumn("expires_at"),
    status: authStatusEnum("status").default("active").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_personal_auth_public_id").on(table.public_id),
    uniqueIndex("udx_personal_auth_redeem_code_id").on(table.redeem_code_id),
    index("idx_personal_auth_user_id").on(table.user_id),
    index("idx_personal_auth_status").on(table.status),
    index("idx_personal_auth_profession_level").on(
      table.profession,
      table.level,
    ),
    index("idx_personal_auth_expires_at").on(table.expires_at),
  ],
);

export const orgAuth = pgTable(
  "org_auth",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    name: text("name").notNull(),
    purchaser_organization_id: bigint("purchaser_organization_id", {
      mode: "number",
    })
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    auth_scope_type: authScopeTypeEnum("auth_scope_type").notNull(),
    edition: authorizationEditionEnum("edition").default("standard").notNull(),
    profession: professionEnum("profession").notNull(),
    level: integer("level").notNull(),
    account_quota: integer("account_quota").notNull(),
    used_quota: integer("used_quota").default(0).notNull(),
    starts_at: timestampColumn("starts_at"),
    expires_at: timestampColumn("expires_at"),
    status: authStatusEnum("status").default("active").notNull(),
    cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_org_auth_public_id").on(table.public_id),
    index("idx_org_auth_purchaser_organization_id").on(
      table.purchaser_organization_id,
    ),
    index("idx_org_auth_status").on(table.status),
    index("idx_org_auth_profession_level").on(table.profession, table.level),
    index("idx_org_auth_expires_at").on(table.expires_at),
  ],
);

export const orgAuthOrganization = pgTable(
  "org_auth_organization",
  {
    id: idColumn(),
    org_auth_id: bigint("org_auth_id", { mode: "number" })
      .notNull()
      .references(() => orgAuth.id, { onDelete: "cascade" }),
    organization_id: bigint("organization_id", { mode: "number" })
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    created_at: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_org_auth_organization_org_auth_id_organization_id").on(
      table.org_auth_id,
      table.organization_id,
    ),
    index("idx_org_auth_organization_org_auth_id").on(table.org_auth_id),
    index("idx_org_auth_organization_organization_id").on(
      table.organization_id,
    ),
  ],
);

export const authUpgrade = pgTable(
  "auth_upgrade",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    personal_auth_id: bigint("personal_auth_id", {
      mode: "number",
    }).references(() => personalAuth.id, { onDelete: "restrict" }),
    org_auth_id: bigint("org_auth_id", { mode: "number" }).references(
      () => orgAuth.id,
      { onDelete: "restrict" },
    ),
    target_edition: authorizationEditionEnum("target_edition")
      .default("advanced")
      .notNull(),
    source_type: authUpgradeSourceTypeEnum("source_type").notNull(),
    redeem_code_id: bigint("redeem_code_id", { mode: "number" }).references(
      () => redeemCode.id,
      { onDelete: "restrict" },
    ),
    ops_reference: text("ops_reference"),
    ops_note: text("ops_note"),
    operator_admin_id: bigint("operator_admin_id", {
      mode: "number",
    }).references(() => admin.id, { onDelete: "restrict" }),
    starts_at: timestampColumn("starts_at"),
    expires_at: timestampColumn("expires_at"),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
    revoked_by_admin_id: bigint("revoked_by_admin_id", {
      mode: "number",
    }).references(() => admin.id, { onDelete: "restrict" }),
    status: authUpgradeStatusEnum("status").default("active").notNull(),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_auth_upgrade_public_id").on(table.public_id),
    uniqueIndex("udx_auth_upgrade_redeem_code_id").on(table.redeem_code_id),
    index("idx_auth_upgrade_personal_auth_id").on(table.personal_auth_id),
    index("idx_auth_upgrade_org_auth_id").on(table.org_auth_id),
    index("idx_auth_upgrade_source_type").on(table.source_type),
    index("idx_auth_upgrade_status").on(table.status),
    index("idx_auth_upgrade_expires_at").on(table.expires_at),
    check(
      "chk_auth_upgrade_exactly_one_source_auth",
      sql`(("personal_auth_id" is not null and "org_auth_id" is null) or ("personal_auth_id" is null and "org_auth_id" is not null))`,
    ),
  ],
);

export const authUserRelations = relations(authUser, ({ many }) => ({
  accounts: many(authAccount),
  sessions: many(authSession),
  admins: many(admin),
  users: many(user),
}));

export const authSessionRelations = relations(authSession, ({ one }) => ({
  authUser: one(authUser, {
    fields: [authSession.user_id],
    references: [authUser.id],
  }),
}));

export const authAccountRelations = relations(authAccount, ({ one }) => ({
  authUser: one(authUser, {
    fields: [authAccount.user_id],
    references: [authUser.id],
  }),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  authUser: one(authUser, {
    fields: [user.auth_user_id],
    references: [authUser.id],
  }),
  employee: one(employee),
  personalAuths: many(personalAuth),
  redeemCodes: many(redeemCode),
  student: one(student),
}));

export const studentRelations = relations(student, ({ one }) => ({
  user: one(user, {
    fields: [student.user_id],
    references: [user.id],
  }),
}));

export const adminRelations = relations(admin, ({ many, one }) => ({
  adminOrganizations: many(adminOrganization),
  authUser: one(authUser, {
    fields: [admin.auth_user_id],
    references: [authUser.id],
  }),
  operatedAuthUpgrades: many(authUpgrade, {
    relationName: "auth_upgrade_operator_admin",
  }),
  revokedAuthUpgrades: many(authUpgrade, {
    relationName: "auth_upgrade_revoked_by_admin",
  }),
}));

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    children: many(organization),
    adminOrganizations: many(adminOrganization),
    employee: many(employee),
    orgAuthOrganizations: many(orgAuthOrganization),
    parent: one(organization, {
      fields: [organization.parent_organization_id],
      references: [organization.id],
    }),
    purchasedOrgAuths: many(orgAuth),
  }),
);

export const adminOrganizationRelations = relations(
  adminOrganization,
  ({ one }) => ({
    admin: one(admin, {
      fields: [adminOrganization.admin_id],
      references: [admin.id],
    }),
    organization: one(organization, {
      fields: [adminOrganization.organization_id],
      references: [organization.id],
    }),
  }),
);

export const employeeRelations = relations(employee, ({ one }) => ({
  organization: one(organization, {
    fields: [employee.organization_id],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [employee.user_id],
    references: [user.id],
  }),
}));

export const redeemCodeRelations = relations(redeemCode, ({ many, one }) => ({
  authUpgrades: many(authUpgrade),
  personalAuths: many(personalAuth),
  usedByUser: one(user, {
    fields: [redeemCode.used_by_user_id],
    references: [user.id],
  }),
}));

export const personalAuthRelations = relations(
  personalAuth,
  ({ many, one }) => ({
    authUpgrades: many(authUpgrade),
    redeemCode: one(redeemCode, {
      fields: [personalAuth.redeem_code_id],
      references: [redeemCode.id],
    }),
    user: one(user, {
      fields: [personalAuth.user_id],
      references: [user.id],
    }),
  }),
);

export const orgAuthRelations = relations(orgAuth, ({ many, one }) => ({
  authUpgrades: many(authUpgrade),
  organizations: many(orgAuthOrganization),
  purchaserOrganization: one(organization, {
    fields: [orgAuth.purchaser_organization_id],
    references: [organization.id],
  }),
}));

export const orgAuthOrganizationRelations = relations(
  orgAuthOrganization,
  ({ one }) => ({
    orgAuth: one(orgAuth, {
      fields: [orgAuthOrganization.org_auth_id],
      references: [orgAuth.id],
    }),
    organization: one(organization, {
      fields: [orgAuthOrganization.organization_id],
      references: [organization.id],
    }),
  }),
);

export const authUpgradeRelations = relations(authUpgrade, ({ one }) => ({
  orgAuth: one(orgAuth, {
    fields: [authUpgrade.org_auth_id],
    references: [orgAuth.id],
  }),
  operatorAdmin: one(admin, {
    fields: [authUpgrade.operator_admin_id],
    references: [admin.id],
    relationName: "auth_upgrade_operator_admin",
  }),
  personalAuth: one(personalAuth, {
    fields: [authUpgrade.personal_auth_id],
    references: [personalAuth.id],
  }),
  redeemCode: one(redeemCode, {
    fields: [authUpgrade.redeem_code_id],
    references: [redeemCode.id],
  }),
  revokedByAdmin: one(admin, {
    fields: [authUpgrade.revoked_by_admin_id],
    references: [admin.id],
    relationName: "auth_upgrade_revoked_by_admin",
  }),
}));
