import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  admin,
  adminOrganization,
  adminRoleValues,
  authAccount,
  authScopeTypeValues,
  authSession,
  authStatusValues,
  authUser,
  authVerification,
  employee,
  orgAuth,
  orgAuthOrganization,
  orgTierValues,
  organization,
  personalAuth,
  professionValues,
  redeemCode,
  redeemCodeStatusValues,
  student,
  user,
  userStatusValues,
  userTypeValues,
} from "@/db/schema/auth";

export {
  adminRoleValues,
  authScopeTypeValues,
  authStatusValues,
  orgTierValues,
  professionValues,
  redeemCodeStatusValues,
  userStatusValues,
  userTypeValues,
};

export type Profession = (typeof professionValues)[number];
export type UserType = (typeof userTypeValues)[number];
export type UserStatus = (typeof userStatusValues)[number];
export type AdminRole = (typeof adminRoleValues)[number];
export type OrgTier = (typeof orgTierValues)[number];
export type AuthScopeType = (typeof authScopeTypeValues)[number];
export type AuthStatus = (typeof authStatusValues)[number];
export type RedeemCodeStatus = (typeof redeemCodeStatusValues)[number];

export type AuthUserRow = InferSelectModel<typeof authUser>;
export type NewAuthUserRow = InferInsertModel<typeof authUser>;

export type AuthSessionRow = InferSelectModel<typeof authSession>;
export type NewAuthSessionRow = InferInsertModel<typeof authSession>;

export type AuthAccountRow = InferSelectModel<typeof authAccount>;
export type NewAuthAccountRow = InferInsertModel<typeof authAccount>;

export type AuthVerificationRow = InferSelectModel<typeof authVerification>;
export type NewAuthVerificationRow = InferInsertModel<typeof authVerification>;

export type UserRow = InferSelectModel<typeof user>;
export type NewUserRow = InferInsertModel<typeof user>;

export type StudentRow = InferSelectModel<typeof student>;
export type NewStudentRow = InferInsertModel<typeof student>;

export type AdminRow = InferSelectModel<typeof admin>;
export type NewAdminRow = InferInsertModel<typeof admin>;

export type AdminOrganizationRow = InferSelectModel<typeof adminOrganization>;
export type NewAdminOrganizationRow = InferInsertModel<
  typeof adminOrganization
>;

export type OrganizationRow = InferSelectModel<typeof organization>;
export type NewOrganizationRow = InferInsertModel<typeof organization>;

export type EmployeeRow = InferSelectModel<typeof employee>;
export type NewEmployeeRow = InferInsertModel<typeof employee>;

export type RedeemCodeRow = InferSelectModel<typeof redeemCode>;
export type NewRedeemCodeRow = InferInsertModel<typeof redeemCode>;

export type PersonalAuthRow = InferSelectModel<typeof personalAuth>;
export type NewPersonalAuthRow = InferInsertModel<typeof personalAuth>;

export type OrgAuthRow = InferSelectModel<typeof orgAuth>;
export type NewOrgAuthRow = InferInsertModel<typeof orgAuth>;

export type OrgAuthOrganizationRow = InferSelectModel<
  typeof orgAuthOrganization
>;
export type NewOrgAuthOrganizationRow = InferInsertModel<
  typeof orgAuthOrganization
>;
