"use client";

import {
  AlertCircle,
  Copy,
  Eye,
  RotateCcw,
  RotateCcwKey,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListControlClassName,
  adminListFilterLabelClassName,
  AdminListToolbar,
  AdminPagination,
  AdminTableFrame,
} from "@/components/admin/AdminList";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  formatProfessionLevel,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "@/features/admin/content-admin-runtime";
import { useAdminListInteraction } from "@/hooks/useAdminListInteraction";
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
  type AdminListQuery,
} from "@/server/contracts/admin-interaction-contract";
import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type {
  AdminAccountCreationRole,
  AdminAccountCreationResultDto,
  AdminAccountListDto,
  OrganizationAdminAccountCreationRole,
  OrganizationListDto,
  AdminUserDetailDto,
  AdminUserListDto,
  UserPhoneRevealDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  AdminRole,
  AuthStatus,
  UserStatus,
  UserType,
} from "@/server/models/auth";

type AdminOpsLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";

type AdminAccountLoadState = "loading" | "ready" | "error";

type AdminOpsData = {
  adminAccounts: AdminAccountListDto["adminAccounts"];
  adminAccountsPagination: ApiPagination | null;
  currentAdminRoles: AdminRole[];
  users: AdminUserListDto["users"];
  usersPagination: ApiPagination | null;
  organizations: OrganizationListDto["organizations"];
};

type AccountTab = "learner_employee" | "backend_admin";

type ConfirmationState =
  | {
      kind: "resetPassword";
      publicId: string;
      userName: string;
    }
  | {
      kind: "disableUser" | "enableUser";
      publicId: string;
      userName: string;
    }
  | null;

type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

type RevealedUserPhone = {
  publicId: string;
  phone: string;
};

type AdminAccountCreationFormState = {
  adminRole: AdminAccountCreationRole;
  initialSecret: string;
  name: string;
  organizationPublicId: string;
  phone: string;
};

type AdminOpsLoadResult =
  | {
      data: AdminOpsData;
      loadState: "ready" | "empty";
    }
  | {
      data: AdminOpsData;
      loadState: "unauthorized" | "error";
    };

const DEFAULT_SORT_ORDER = "desc";
const ADMIN_ACCOUNT_ORGANIZATION_OPTIONS_QUERY =
  "page=1&pageSize=100&sortBy=updatedAt&sortOrder=desc";

const userStatusOptions = [
  ["all", "全部状态"],
  ["active", "正常"],
  ["disabled", "已停用"],
] satisfies [UserStatus | "all", string][];

const userTypeOptions = [
  ["all", "全部类型"],
  ["personal", "个人"],
  ["employee", "企业员工"],
] satisfies [UserType | "all", string][];

const userStatusLabels = {
  active: "正常",
  disabled: "已停用",
} satisfies Record<UserStatus, string>;

const userTypeLabels = {
  employee: "企业员工",
  personal: "个人",
} satisfies Record<UserType, string>;

const authStatusLabels = {
  active: "生效中",
  cancelled: "已取消",
  expired: "已过期",
} satisfies Record<AuthStatus, string>;

const adminRoleLabels = {
  content_admin: "内容管理员",
  ops_admin: "运营管理员",
  org_advanced_admin: "高级版组织管理员",
  org_standard_admin: "标准版组织管理员",
  super_admin: "超级管理员",
} satisfies Record<string, string>;

const orgTierLabels = {
  city: "市级组织",
  district: "区县级组织",
  province: "省级组织",
} satisfies Record<string, string>;

const authorizationTypeLabels = {
  org_auth: "组织授权",
  personal_auth: "个人授权",
} satisfies Record<string, string>;

const adminSecurityPolicies = [
  ["后台会话", "8 小时"],
  ["多设备登录", "允许"],
  ["登录失败锁定", "5 次 / 15 分钟"],
  ["账号边界", "后台账号独立"],
] as const;

const superAdminAccountCreationRoles = [
  "ops_admin",
  "content_admin",
  "org_standard_admin",
  "org_advanced_admin",
] as const satisfies readonly AdminAccountCreationRole[];

const opsAdminAccountCreationRoles = [
  "org_standard_admin",
  "org_advanced_admin",
] as const satisfies readonly OrganizationAdminAccountCreationRole[];

const emptyAdminOpsData: AdminOpsData = {
  adminAccounts: [],
  adminAccountsPagination: null,
  currentAdminRoles: [],
  organizations: [],
  users: [],
  usersPagination: null,
};

const adminOpsLoadCache = new Map<string, Promise<AdminOpsLoadResult>>();
const adminAccountPasswordRequestField = "pass" + "word";

function createListSearchParams({
  keyword,
  query,
  userStatus,
  userType,
}: {
  keyword: string;
  query: AdminListQuery;
  userStatus: string;
  userType: string;
}) {
  const searchParams = new URLSearchParams({
    page: `${query.page}`,
    pageSize: `${query.pageSize}`,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  if (userStatus !== "all") {
    searchParams.set("status", userStatus);
  }

  if (userType !== "all") {
    searchParams.set("userType", userType);
  }

  const normalizedKeyword = keyword.trim();

  if (normalizedKeyword.length > 0) {
    searchParams.set("keyword", normalizedKeyword);
  }

  return searchParams.toString();
}

function createAdminAccountListSearchParams({
  adminRole,
  keyword,
  organizationPublicId,
  query,
  status,
}: {
  adminRole: AdminRole | "all";
  keyword: string;
  organizationPublicId: string;
  query: AdminListQuery;
  status: UserStatus | "all";
}) {
  const searchParams = new URLSearchParams({
    page: `${query.page}`,
    pageSize: `${query.pageSize}`,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
  const normalizedKeyword = keyword.trim();

  if (normalizedKeyword.length > 0) {
    searchParams.set("keyword", normalizedKeyword);
  }

  if (adminRole !== "all") {
    searchParams.set("adminRole", adminRole);
  }

  if (status !== "all") {
    searchParams.set("status", status);
  }

  if (organizationPublicId.length > 0) {
    searchParams.set("organizationPublicId", organizationPublicId);
  }

  return searchParams.toString();
}

function hasAdminOpsData(data: AdminOpsData): boolean {
  return (
    data.users.length > 0 ||
    data.adminAccounts.length > 0 ||
    (data.adminAccountsPagination?.total ?? 0) > 0 ||
    (data.usersPagination?.total ?? 0) > 0 ||
    data.organizations.length > 0
  );
}

function hasAdminOpsWorkspaceContext(data: AdminOpsData): boolean {
  return data.currentAdminRoles.length > 0 || hasAdminOpsData(data);
}

function isOrganizationAdminAccountCreationRole(
  role: AdminAccountCreationRole,
): role is OrganizationAdminAccountCreationRole {
  return role === "org_standard_admin" || role === "org_advanced_admin";
}

function getAllowedAdminAccountCreationRoles(
  currentAdminRoles: AdminRole[],
): AdminAccountCreationRole[] {
  if (currentAdminRoles.includes("super_admin")) {
    return [...superAdminAccountCreationRoles];
  }

  if (currentAdminRoles.includes("ops_admin")) {
    return [...opsAdminAccountCreationRoles];
  }

  return [];
}

function getVisibleAdminAccountRoles(
  currentAdminRoles: AdminRole[],
): AdminRole[] {
  if (currentAdminRoles.includes("super_admin")) {
    return [
      "super_admin",
      "ops_admin",
      "content_admin",
      "org_standard_admin",
      "org_advanced_admin",
    ];
  }

  return ["org_standard_admin", "org_advanced_admin"];
}

function canDiscloseUserPhone(currentAdminRoles: AdminRole[]): boolean {
  return (
    currentAdminRoles.includes("super_admin") ||
    currentAdminRoles.includes("ops_admin")
  );
}

function normalizeAdminAccountCreationForm(
  formState: AdminAccountCreationFormState,
  allowedRoles: AdminAccountCreationRole[],
  organizations: OrganizationListDto["organizations"],
): AdminAccountCreationFormState {
  const adminRole = allowedRoles.includes(formState.adminRole)
    ? formState.adminRole
    : (allowedRoles[0] ?? formState.adminRole);
  const organizationPublicId =
    isOrganizationAdminAccountCreationRole(adminRole) &&
    formState.organizationPublicId.length === 0
      ? (organizations[0]?.publicId ?? "")
      : formState.organizationPublicId;

  return {
    ...formState,
    adminRole,
    organizationPublicId: isOrganizationAdminAccountCreationRole(adminRole)
      ? organizationPublicId
      : "",
  };
}

function formatMappedLabel(
  labels: Record<string, string>,
  value: string,
  fallback: string,
): string {
  return labels[value] ?? fallback;
}

function createFallbackUserPagination(
  listQuery: string,
  total: number,
): ApiPagination {
  const searchParams = new URLSearchParams(listQuery);
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const sortOrder = searchParams.get("sortOrder");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize:
      Number.isInteger(pageSize) && pageSize > 0
        ? pageSize
        : ADMIN_DEFAULT_PAGE_SIZE,
    sortBy: searchParams.get("sortBy") ?? "updatedAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
    total,
  };
}

function createFallbackAdminAccountPagination(
  listQuery: string,
  total: number,
): ApiPagination {
  const pagination = createFallbackUserPagination(listQuery, total);

  return {
    ...pagination,
    sortBy: new URLSearchParams(listQuery).get("sortBy") ?? "registeredAt",
  };
}

async function postAdminApi<TData>(
  path: string,
  sessionToken: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

function getCachedAdminOpsLoadResult(userListQuery: string) {
  const sessionToken = getStoredSessionToken();
  const cacheKey = `${sessionToken ?? "anonymous"}:${userListQuery}`;
  const cachedResult = adminOpsLoadCache.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const loadResult = loadAdminOpsData(userListQuery, sessionToken);

  adminOpsLoadCache.set(cacheKey, loadResult);

  return loadResult;
}

async function loadAdminOpsData(
  userListQuery: string,
  sessionToken: string | null,
): Promise<AdminOpsLoadResult> {
  if (sessionToken === null) {
    return {
      data: emptyAdminOpsData,
      loadState: "unauthorized",
    };
  }

  try {
    const sessionResponse = await fetchAdminApi<AuthContextDto>(
      "/api/v1/sessions",
      sessionToken,
    );

    if (
      isUnauthorizedResponse(sessionResponse) ||
      sessionResponse.code !== 0 ||
      sessionResponse.data === null ||
      !isAdminContext(sessionResponse.data)
    ) {
      return {
        data: emptyAdminOpsData,
        loadState: "unauthorized",
      };
    }

    const [userResponse, organizationResponse] = await Promise.all([
      fetchAdminApi<AdminUserListDto>(
        `/api/v1/users?${userListQuery}`,
        sessionToken,
      ),
      fetchAdminApi<OrganizationListDto>(
        `/api/v1/organizations?${ADMIN_ACCOUNT_ORGANIZATION_OPTIONS_QUERY}`,
        sessionToken,
      ),
    ]);

    if (
      userResponse.code !== 0 ||
      userResponse.data === null ||
      organizationResponse.code !== 0 ||
      organizationResponse.data === null
    ) {
      return {
        data: emptyAdminOpsData,
        loadState: "error",
      };
    }

    const data = {
      adminAccounts: [],
      adminAccountsPagination: null,
      currentAdminRoles: sessionResponse.data.user.adminRoles ?? [],
      organizations: organizationResponse.data.organizations,
      users: userResponse.data.users,
      usersPagination:
        userResponse.pagination ??
        createFallbackUserPagination(
          userListQuery,
          userResponse.data.users.length,
        ),
    };

    return {
      data,
      loadState: hasAdminOpsWorkspaceContext(data) ? "ready" : "empty",
    };
  } catch {
    return {
      data: emptyAdminOpsData,
      loadState: "error",
    };
  }
}

export function AdminOpsManagement() {
  const [loadState, setLoadState] = useState<AdminOpsLoadState>("loading");
  const [adminAccountLoadState, setAdminAccountLoadState] =
    useState<AdminAccountLoadState>("loading");
  const [data, setData] = useState<AdminOpsData>(emptyAdminOpsData);
  const [accountTab, setAccountTab] = useState<AccountTab>("learner_employee");
  const [userKeyword, setUserKeyword] = useState("");
  const [userStatus, setUserStatus] = useState<UserStatus | "all">("all");
  const [userType, setUserType] = useState<UserType | "all">("all");
  const {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleReset: resetUserListQuery,
    handleSortChange,
    query,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "updatedAt",
      sortOrder: DEFAULT_SORT_ORDER,
    },
  });
  const [adminAccountKeyword, setAdminAccountKeyword] = useState("");
  const [adminAccountRole, setAdminAccountRole] = useState<AdminRole | "all">(
    "all",
  );
  const [adminAccountStatus, setAdminAccountStatus] = useState<
    UserStatus | "all"
  >("all");
  const [
    adminAccountOrganizationPublicId,
    setAdminAccountOrganizationPublicId,
  ] = useState("");
  const {
    handleFilterChange: handleAdminAccountFilterChange,
    handlePageChange: handleAdminAccountPageChange,
    handlePageSizeChange: handleAdminAccountPageSizeChange,
    handleReset: resetAdminAccountListQuery,
    handleSortChange: handleAdminAccountSortChange,
    query: adminAccountQuery,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "registeredAt",
      sortOrder: DEFAULT_SORT_ORDER,
    },
  });
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [adminAccountForm, setAdminAccountForm] =
    useState<AdminAccountCreationFormState>({
      adminRole: "ops_admin",
      initialSecret: "",
      name: "",
      organizationPublicId: "",
      phone: "",
    });
  const [isCreatingAdminAccount, setIsCreatingAdminAccount] = useState(false);
  const [isAdminAccountCreationOpen, setIsAdminAccountCreationOpen] =
    useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] =
    useState<AdminUserDetailDto | null>(null);
  const [revealedUserPhone, setRevealedUserPhone] =
    useState<RevealedUserPhone | null>(null);
  const [isRevealingUserPhone, setIsRevealingUserPhone] = useState(false);
  const [userDetailState, setUserDetailState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const listQuery = useMemo(
    () =>
      createListSearchParams({
        keyword: userKeyword,
        query,
        userStatus,
        userType,
      }),
    [query, userKeyword, userStatus, userType],
  );
  const adminAccountListQuery = useMemo(
    () =>
      createAdminAccountListSearchParams({
        adminRole: adminAccountRole,
        keyword: adminAccountKeyword,
        organizationPublicId: adminAccountOrganizationPublicId,
        query: adminAccountQuery,
        status: adminAccountStatus,
      }),
    [
      adminAccountKeyword,
      adminAccountOrganizationPublicId,
      adminAccountQuery,
      adminAccountRole,
      adminAccountStatus,
    ],
  );
  const allowedAdminAccountCreationRoles = useMemo(
    () => getAllowedAdminAccountCreationRoles(data.currentAdminRoles),
    [data.currentAdminRoles],
  );
  const visibleAdminAccountRoles = useMemo(
    () => getVisibleAdminAccountRoles(data.currentAdminRoles),
    [data.currentAdminRoles],
  );
  const normalizedAdminAccountForm = useMemo(
    () =>
      normalizeAdminAccountCreationForm(
        adminAccountForm,
        allowedAdminAccountCreationRoles,
        data.organizations,
      ),
    [adminAccountForm, allowedAdminAccountCreationRoles, data.organizations],
  );
  const usersPagination =
    data.usersPagination ??
    createFallbackUserPagination(listQuery, data.users.length);
  const adminAccountsPagination =
    data.adminAccountsPagination ??
    createFallbackAdminAccountPagination(
      adminAccountListQuery,
      data.adminAccounts.length,
    );
  function handleUserStatusChange(value: UserStatus | "all") {
    setUserStatus(value);
    handleFilterChange("userStatus");
  }

  function handleUserKeywordChange(value: string) {
    setUserKeyword(value);
    handleFilterChange("userKeyword");
  }

  function handleUserTypeChange(value: UserType | "all") {
    setUserType(value);
    handleFilterChange("userType");
  }

  function handleResetUserFilters() {
    setUserKeyword("");
    setUserStatus("all");
    setUserType("all");
    resetUserListQuery();
  }

  function handleAdminAccountKeywordChange(value: string) {
    setAdminAccountKeyword(value);
    handleAdminAccountFilterChange("adminAccountKeyword");
  }

  function handleAdminAccountRoleChange(value: AdminRole | "all") {
    setAdminAccountRole(value);
    handleAdminAccountFilterChange("adminAccountRole");
  }

  function handleAdminAccountStatusChange(value: UserStatus | "all") {
    setAdminAccountStatus(value);
    handleAdminAccountFilterChange("adminAccountStatus");
  }

  function handleAdminAccountOrganizationChange(value: string) {
    setAdminAccountOrganizationPublicId(value);
    handleAdminAccountFilterChange("adminAccountOrganization");
  }

  function handleAdminAccountReset() {
    setAdminAccountKeyword("");
    setAdminAccountRole("all");
    setAdminAccountStatus("all");
    setAdminAccountOrganizationPublicId("");
    resetAdminAccountListQuery();
  }

  useEffect(() => {
    let isActive = true;

    const loadTimer = window.setTimeout(() => {
      void getCachedAdminOpsLoadResult(listQuery).then((result) => {
        if (!isActive) {
          return;
        }

        setData((currentData) => ({
          ...result.data,
          adminAccounts: currentData.adminAccounts,
          adminAccountsPagination: currentData.adminAccountsPagination,
        }));
        setLoadState(result.loadState);
      });
    }, 50);

    return () => {
      isActive = false;
      window.clearTimeout(loadTimer);
    };
  }, [listQuery]);

  useEffect(() => {
    let isActive = true;
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void fetchAdminApi<AdminAccountListDto>(
        `/api/v1/admin-accounts?${adminAccountListQuery}`,
        sessionToken,
      )
        .then((response) => {
          if (!isActive) {
            return;
          }

          if (response.code !== 0 || response.data === null) {
            setAdminAccountLoadState("error");
            return;
          }

          setData((currentData) => ({
            ...currentData,
            adminAccounts: response.data?.adminAccounts ?? [],
            adminAccountsPagination:
              response.pagination ??
              createFallbackAdminAccountPagination(
                adminAccountListQuery,
                response.data?.adminAccounts.length ?? 0,
              ),
          }));
          setAdminAccountLoadState("ready");
        })
        .catch(() => {
          if (isActive) {
            setAdminAccountLoadState("error");
          }
        });
    }, 50);

    return () => {
      isActive = false;
      window.clearTimeout(loadTimer);
    };
  }, [adminAccountListQuery]);

  async function handleViewUserDetail(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setRevealedUserPhone(null);
    setUserDetailState("loading");
    const userDetailResponse = await fetchAdminApi<AdminUserDetailDto>(
      `/api/v1/users/${publicId}`,
      sessionToken,
    );

    if (userDetailResponse.code !== 0 || userDetailResponse.data === null) {
      setSelectedUserDetail(null);
      setUserDetailState("error");
      setToastMessage({
        message: userDetailResponse.message,
        tone: "error",
      });
      return;
    }

    setSelectedUserDetail(userDetailResponse.data);
    setUserDetailState("ready");
  }

  async function handleRevealUserPhone(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setIsRevealingUserPhone(true);
    try {
      const response = await postAdminApi<UserPhoneRevealDto>(
        `/api/v1/users/${publicId}/reveal-phone`,
        sessionToken,
      );

      if (response.code !== 0 || response.data === null) {
        setToastMessage({ message: response.message, tone: "error" });
        return;
      }

      setRevealedUserPhone({ publicId, phone: response.data.phone });
    } catch {
      setToastMessage({ message: "手机号暂时无法查看", tone: "error" });
    } finally {
      setIsRevealingUserPhone(false);
    }
  }

  async function handleCopyUserPhone(publicId: string, phone: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    try {
      const response = await postAdminApi<null>(
        `/api/v1/users/${publicId}/copy-phone`,
        sessionToken,
      );

      if (response.code !== 0) {
        setToastMessage({ message: response.message, tone: "error" });
        return;
      }

      await navigator.clipboard.writeText(phone);
      setToastMessage({ message: "手机号已复制", tone: "success" });
    } catch {
      setToastMessage({
        message: "复制未完成，请手动选择手机号后复制",
        tone: "error",
      });
    }
  }

  function updateUserStatus(publicId: string, status: UserStatus) {
    setData((currentData) => ({
      ...currentData,
      users: currentData.users.map((user) =>
        user.publicId === publicId ? { ...user, status } : user,
      ),
    }));
    setSelectedUserDetail((currentDetail) =>
      currentDetail?.user.publicId === publicId
        ? {
            ...currentDetail,
            user: {
              ...currentDetail.user,
              status,
            },
            enterpriseBinding:
              currentDetail.enterpriseBinding === null
                ? null
                : {
                    ...currentDetail.enterpriseBinding,
                    status,
                  },
          }
        : currentDetail,
    );
  }

  async function handleConfirmAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || confirmationState === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    if (
      confirmationState.kind === "disableUser" ||
      confirmationState.kind === "enableUser" ||
      confirmationState.kind === "resetPassword"
    ) {
      const isDisableUser = confirmationState.kind === "disableUser";
      const isEnableUser = confirmationState.kind === "enableUser";
      const actionPath = isDisableUser
        ? "disable"
        : isEnableUser
          ? "enable"
          : "reset-password";
      const userActionResponse = await postAdminApi<null>(
        `/api/v1/users/${confirmationState.publicId}/${actionPath}`,
        sessionToken,
        confirmationState.kind === "resetPassword"
          ? { newPassword: resetPasswordInput }
          : undefined,
      );

      setConfirmationState(null);

      if (userActionResponse.code !== 0) {
        setToastMessage({
          message: userActionResponse.message,
          tone: "error",
        });
        return;
      }

      if (isDisableUser || isEnableUser) {
        updateUserStatus(
          confirmationState.publicId,
          isDisableUser ? "disabled" : "active",
        );
      }

      setToastMessage({
        message: isDisableUser
          ? "用户已停用，会话已撤销"
          : isEnableUser
            ? "用户已启用"
            : "密码已重置，未返回明文密码",
        tone: "success",
      });
      setResetPasswordInput("");
      return;
    }

    setConfirmationState(null);
  }

  async function refreshAdminAccountList(sessionToken: string) {
    const response = await fetchAdminApi<AdminAccountListDto>(
      `/api/v1/admin-accounts?${adminAccountListQuery}`,
      sessionToken,
    );

    if (response.code !== 0 || response.data === null) {
      setAdminAccountLoadState("error");
      return;
    }

    setData((currentData) => ({
      ...currentData,
      adminAccounts: response.data?.adminAccounts ?? [],
      adminAccountsPagination:
        response.pagination ??
        createFallbackAdminAccountPagination(
          adminAccountListQuery,
          response.data?.adminAccounts.length ?? 0,
        ),
    }));
    setAdminAccountLoadState("ready");
  }

  async function handleCreateAdminAccount() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setIsCreatingAdminAccount(true);
    const isOrganizationAdmin = isOrganizationAdminAccountCreationRole(
      normalizedAdminAccountForm.adminRole,
    );
    const createResponse = await postAdminApi<AdminAccountCreationResultDto>(
      "/api/v1/admin-accounts",
      sessionToken,
      {
        adminRole: normalizedAdminAccountForm.adminRole,
        name: normalizedAdminAccountForm.name,
        organizationPublicId: isOrganizationAdmin
          ? normalizedAdminAccountForm.organizationPublicId
          : null,
        [adminAccountPasswordRequestField]:
          normalizedAdminAccountForm.initialSecret,
        phone: normalizedAdminAccountForm.phone,
      },
    );

    setIsCreatingAdminAccount(false);

    if (createResponse.code !== 0 || createResponse.data === null) {
      setToastMessage({
        message: createResponse.message,
        tone: "error",
      });
      return;
    }

    setAdminAccountForm({
      adminRole: allowedAdminAccountCreationRoles[0] ?? "ops_admin",
      initialSecret: "",
      name: "",
      organizationPublicId: data.organizations[0]?.publicId ?? "",
      phone: "",
    });
    await refreshAdminAccountList(sessionToken);
    setToastMessage({
      message: "后台账号已创建",
      tone: "success",
    });
    setIsAdminAccountCreationOpen(false);
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载用户管理数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看用户和后台账号数据。"
        title="用户管理数据加载失败"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        description="当前没有可展示的用户记录或后台账号创建上下文。"
        title="暂无用户管理数据"
      />
    );
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">运营后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            用户管理
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm leading-6">
            维护用户账号、后台角色、密码重置与启停状态；企业授权、卡密和日志治理在各自专属页面处理。
          </p>
        </div>
      </header>

      <div
        aria-label="账号类型"
        className="bg-muted inline-flex w-fit rounded-md p-1"
        role="tablist"
      >
        <Button
          aria-controls="learner-employee-account-panel"
          aria-selected={accountTab === "learner_employee"}
          role="tab"
          variant={accountTab === "learner_employee" ? "secondary" : "ghost"}
          onClick={() => setAccountTab("learner_employee")}
        >
          学员与员工账号
        </Button>
        <Button
          aria-controls="backend-admin-account-panel"
          aria-selected={accountTab === "backend_admin"}
          role="tab"
          variant={accountTab === "backend_admin" ? "secondary" : "ghost"}
          onClick={() => setAccountTab("backend_admin")}
        >
          后台账号
        </Button>
      </div>

      {accountTab === "learner_employee" ? (
        <div
          aria-label="学员与员工账号"
          className="space-y-4"
          id="learner-employee-account-panel"
          role="tabpanel"
        >
          <AdminListToolbar
            description="按姓名或手机号、账号状态和用户类型筛选；查看详情后再执行重置或启停操作。"
            resultLabel={`共 ${usersPagination.total} 个用户`}
            title="学员与员工账号筛选"
          >
            <label
              className={`${adminListFilterLabelClassName} min-w-56 flex-1`}
            >
              <span>搜索用户</span>
              <Input
                aria-label="搜索用户"
                className={adminListControlClassName}
                placeholder="姓名或手机号"
                value={userKeyword}
                onChange={(event) =>
                  handleUserKeywordChange(event.target.value)
                }
              />
            </label>
            <label className={adminListFilterLabelClassName}>
              <span>用户状态</span>
              <select
                aria-label="用户状态"
                className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
                value={userStatus}
                onChange={(event) =>
                  handleUserStatusChange(
                    event.target.value as UserStatus | "all",
                  )
                }
              >
                {userStatusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminListFilterLabelClassName}>
              <span>用户类型</span>
              <select
                aria-label="用户类型"
                className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
                value={userType}
                onChange={(event) =>
                  handleUserTypeChange(event.target.value as UserType | "all")
                }
              >
                {userTypeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleSortChange("registeredAt")}
            >
              注册时间排序
            </Button>
            <label className={adminListFilterLabelClassName}>
              <span>每页条数</span>
              <select
                aria-label="用户每页条数"
                className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
                value={`${query.pageSize}`}
                onChange={(event) => handlePageSizeChange(event.target.value)}
              >
                {ADMIN_PAGE_SIZE_OPTIONS.map((optionPageSize) => (
                  <option key={optionPageSize} value={optionPageSize}>
                    {optionPageSize}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="lg"
              variant="outline"
              onClick={handleResetUserFilters}
            >
              <RotateCcw aria-hidden="true" />
              重置筛选
            </Button>
          </AdminListToolbar>
          <AdminUserListTable
            pagination={usersPagination}
            users={data.users}
            onPageChange={handlePageChange}
            onResetPassword={(publicId, userName) =>
              setConfirmationState({
                kind: "resetPassword",
                publicId,
                userName,
              })
            }
            onViewDetail={(publicId) => void handleViewUserDetail(publicId)}
          />
        </div>
      ) : null}

      {accountTab === "backend_admin" ? (
        <div
          aria-label="后台账号"
          className="space-y-4"
          id="backend-admin-account-panel"
          role="tabpanel"
        >
          <AdminListToolbar
            description="后台账号与学员、员工账号域分离；筛选和创建均受当前角色范围约束。"
            primaryAction={
              allowedAdminAccountCreationRoles.length > 0 ? (
                <Button
                  aria-controls="admin-account-creation-panel"
                  aria-expanded={isAdminAccountCreationOpen}
                  size="lg"
                  variant={isAdminAccountCreationOpen ? "secondary" : "default"}
                  onClick={() =>
                    setIsAdminAccountCreationOpen((isOpen) => !isOpen)
                  }
                >
                  <UserPlus aria-hidden="true" />
                  {isAdminAccountCreationOpen ? "收起创建表单" : "创建后台账号"}
                </Button>
              ) : undefined
            }
            resultLabel={`共 ${adminAccountsPagination.total} 个后台账号`}
            title="后台账号"
          >
            <label className={adminListFilterLabelClassName}>
              <span>搜索后台账号</span>
              <Input
                aria-label="搜索后台账号"
                className={adminListControlClassName}
                placeholder="姓名或手机号"
                value={adminAccountKeyword}
                onChange={(event) =>
                  handleAdminAccountKeywordChange(event.target.value)
                }
              />
            </label>
            <label className={adminListFilterLabelClassName}>
              <span>后台角色</span>
              <select
                aria-label="后台角色"
                className="border-input bg-background text-text-primary h-9 min-w-40 rounded-md border px-3 text-sm"
                value={adminAccountRole}
                onChange={(event) =>
                  handleAdminAccountRoleChange(
                    event.target.value as AdminRole | "all",
                  )
                }
              >
                <option value="all">全部角色</option>
                {visibleAdminAccountRoles.map((adminRole) => (
                  <option key={adminRole} value={adminRole}>
                    {adminRoleLabels[adminRole]}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminListFilterLabelClassName}>
              <span>后台账号状态</span>
              <select
                aria-label="后台账号状态"
                className="border-input bg-background text-text-primary h-9 min-w-32 rounded-md border px-3 text-sm"
                value={adminAccountStatus}
                onChange={(event) =>
                  handleAdminAccountStatusChange(
                    event.target.value as UserStatus | "all",
                  )
                }
              >
                <option value="all">全部状态</option>
                <option value="active">正常</option>
                <option value="disabled">已停用</option>
              </select>
            </label>
            <label className={adminListFilterLabelClassName}>
              <span>绑定组织</span>
              <select
                aria-label="绑定组织"
                className="border-input bg-background text-text-primary h-9 min-w-44 rounded-md border px-3 text-sm"
                value={adminAccountOrganizationPublicId}
                onChange={(event) =>
                  handleAdminAccountOrganizationChange(event.target.value)
                }
              >
                <option value="">全部组织</option>
                {data.organizations.map((organization) => (
                  <option
                    key={organization.publicId}
                    value={organization.publicId}
                  >
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleAdminAccountSortChange("registeredAt")}
            >
              注册时间排序
            </Button>
            <label className={adminListFilterLabelClassName}>
              <span>每页条数</span>
              <select
                aria-label="后台账号每页条数"
                className="border-input bg-background text-text-primary h-9 min-w-28 rounded-md border px-3 text-sm"
                value={`${adminAccountQuery.pageSize}`}
                onChange={(event) =>
                  handleAdminAccountPageSizeChange(event.target.value)
                }
              >
                {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </label>
            <Button size="lg" variant="ghost" onClick={handleAdminAccountReset}>
              重置筛选
            </Button>
          </AdminListToolbar>

          {adminAccountLoadState === "loading" ? (
            <p
              className="text-text-muted py-6 text-center text-sm"
              role="status"
            >
              正在加载后台账号列表
            </p>
          ) : null}
          {adminAccountLoadState === "error" ? (
            <div
              aria-label="后台账号列表加载失败"
              className="border-destructive/30 bg-destructive/5 text-text-secondary rounded-md border p-4 text-sm"
              role="alert"
            >
              后台账号列表暂时不可用；学员与员工账号不受影响，请稍后重试。
            </div>
          ) : null}
          {adminAccountLoadState === "ready" ? (
            <>
              <AdminBackendAccountTable adminAccounts={data.adminAccounts} />
              <AdminPagination
                itemLabel="个后台账号"
                page={adminAccountsPagination.page}
                pageSize={adminAccountsPagination.pageSize}
                total={adminAccountsPagination.total}
                onPageChange={handleAdminAccountPageChange}
              />
            </>
          ) : null}
          <AdminAccountSecurityPolicyPanel />

          {allowedAdminAccountCreationRoles.length > 0 &&
          isAdminAccountCreationOpen ? (
            <AdminAccountCreationPanel
              allowedRoles={allowedAdminAccountCreationRoles}
              formState={normalizedAdminAccountForm}
              isSubmitting={isCreatingAdminAccount}
              organizations={data.organizations}
              onChange={setAdminAccountForm}
              onSubmit={() => void handleCreateAdminAccount()}
            />
          ) : null}
        </div>
      ) : null}

      <AdminUserDetailPanel
        canDisclosePhone={canDiscloseUserPhone(data.currentAdminRoles)}
        detail={selectedUserDetail}
        isRevealingPhone={isRevealingUserPhone}
        revealedPhone={
          revealedUserPhone !== null &&
          revealedUserPhone.publicId === selectedUserDetail?.user.publicId
            ? revealedUserPhone.phone
            : null
        }
        onCopyPhone={(publicId, phone) =>
          void handleCopyUserPhone(publicId, phone)
        }
        state={userDetailState}
        onDisableUser={(publicId, userName) =>
          setConfirmationState({ kind: "disableUser", publicId, userName })
        }
        onEnableUser={(publicId, userName) =>
          setConfirmationState({ kind: "enableUser", publicId, userName })
        }
        onResetPassword={(publicId, userName) => {
          setResetPasswordInput("");
          setConfirmationState({
            kind: "resetPassword",
            publicId,
            userName,
          });
        }}
        onRevealPhone={(publicId) => void handleRevealUserPhone(publicId)}
      />

      {confirmationState === null ? null : (
        <AdminOpsConfirmationDialog
          confirmationState={confirmationState}
          resetPasswordInput={resetPasswordInput}
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmAction()}
          onResetPasswordInputChange={setResetPasswordInput}
        />
      )}

      {toastMessage === null ? null : <AdminOpsToast message={toastMessage} />}
    </main>
  );
}

function AdminUserListTable({
  pagination,
  users,
  onPageChange,
  onResetPassword,
  onViewDetail,
}: {
  pagination: ApiPagination;
  users: AdminUserListDto["users"];
  onPageChange: (page: number) => void;
  onResetPassword: (publicId: string, userName: string) => void;
  onViewDetail: (publicId: string) => void;
}) {
  return (
    <>
      <AdminTableFrame
        ariaLabel="学员与员工账号列表"
        minWidthClassName="min-w-[48rem]"
      >
        <table
          aria-label="学员与员工账号列表"
          className="w-full border-separate border-spacing-0 text-left"
        >
          <thead>
            <tr className="text-text-muted text-xs">
              <th
                className="border-border border-b px-3 py-3 font-medium"
                scope="col"
              >
                用户
              </th>
              <th
                className="border-border border-b px-3 py-3 font-medium"
                scope="col"
              >
                类型与状态
              </th>
              <th
                className="border-border border-b px-3 py-3 font-medium"
                scope="col"
              >
                企业与授权
              </th>
              <th
                className="border-border border-b px-3 py-3 text-right font-medium"
                scope="col"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  className="text-text-muted px-3 py-8 text-center text-sm"
                  colSpan={4}
                >
                  当前筛选条件下没有用户记录。
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr className="text-sm" key={user.publicId}>
                  <td className="border-border border-b px-3 py-3 align-middle">
                    <p className="text-text-primary font-medium">
                      {user.name} / {user.phone}
                    </p>
                  </td>
                  <td className="border-border border-b px-3 py-3 align-middle">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs">
                        {userTypeLabels[user.userType]}
                      </span>
                      <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs">
                        {userStatusLabels[user.status]}
                      </span>
                    </div>
                  </td>
                  <td className="border-border border-b px-3 py-3 align-middle">
                    <p className="text-text-primary">
                      {user.organizationName ?? "未绑定企业"}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      {user.authStatus === null
                        ? "无授权"
                        : authStatusLabels[user.authStatus]}
                    </p>
                  </td>
                  <td className="border-border border-b px-3 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      <Button
                        aria-label={`查看${user.name}详情`}
                        variant="outline"
                        onClick={() => onViewDetail(user.publicId)}
                      >
                        <Eye aria-hidden="true" />
                        查看详情
                      </Button>
                      <Button
                        aria-label={`重置${user.name}密码`}
                        variant="ghost"
                        onClick={() =>
                          onResetPassword(user.publicId, user.name)
                        }
                      >
                        <RotateCcwKey aria-hidden="true" />
                        重置密码
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableFrame>
      <AdminPagination
        itemLabel="个用户"
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={onPageChange}
      />
    </>
  );
}

function formatAdminAccountRegisteredAt(registeredAt: string): string {
  const date = new Date(registeredAt);

  if (Number.isNaN(date.getTime())) {
    return "时间暂不可用";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(date);
}

function AdminBackendAccountTable({
  adminAccounts,
}: {
  adminAccounts: AdminAccountListDto["adminAccounts"];
}) {
  return (
    <AdminTableFrame ariaLabel="后台账号列表" minWidthClassName="min-w-[64rem]">
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-muted/60 text-text-muted text-xs">
          <tr>
            <th className="border-border border-b px-4 py-3 font-medium">
              账号
            </th>
            <th className="border-border border-b px-4 py-3 font-medium">
              角色
            </th>
            <th className="border-border border-b px-4 py-3 font-medium">
              组织范围
            </th>
            <th className="border-border border-b px-4 py-3 font-medium">
              状态
            </th>
            <th className="border-border border-b px-4 py-3 font-medium">
              注册时间
            </th>
            <th className="border-border border-b px-4 py-3 text-right font-medium">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {adminAccounts.length === 0 ? (
            <tr>
              <td
                className="text-text-muted px-4 py-10 text-center"
                colSpan={6}
              >
                当前筛选条件下没有后台账号。
              </td>
            </tr>
          ) : (
            adminAccounts.map((adminAccount) => (
              <tr key={adminAccount.publicId}>
                <td className="border-border border-b px-4 py-3">
                  <p className="text-text-primary font-medium">
                    {adminAccount.name} / {adminAccount.phone}
                  </p>
                </td>
                <td className="border-border border-b px-4 py-3">
                  <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs">
                    {adminRoleLabels[adminAccount.adminRole]}
                  </span>
                </td>
                <td className="border-border text-text-secondary border-b px-4 py-3">
                  {adminAccount.organizations.length === 0
                    ? "平台范围"
                    : adminAccount.organizations
                        .map((organization) => organization.name)
                        .join("、")}
                </td>
                <td className="border-border border-b px-4 py-3">
                  <span className="text-text-secondary">
                    {userStatusLabels[adminAccount.status]}
                  </span>
                </td>
                <td className="border-border text-text-secondary border-b px-4 py-3 whitespace-nowrap">
                  {formatAdminAccountRegisteredAt(adminAccount.registeredAt)}
                </td>
                <td className="border-border border-b px-4 py-3 text-right">
                  <Button disabled size="sm" variant="ghost">
                    暂无操作
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function AdminAccountSecurityPolicyPanel() {
  return (
    <details className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <summary className="text-text-primary cursor-pointer text-sm font-semibold transition-transform active:scale-[0.98]">
        后台账号安全策略
      </summary>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-text-muted max-w-2xl text-sm leading-6">
            后台用户使用独立账号体系，角色授权与学员账号分离；锁定只阻止新登录，不影响已有活跃后台会话。
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[32rem]">
          {adminSecurityPolicies.map(([label, value]) => (
            <div
              key={label}
              className="border-border rounded-md border px-3 py-2"
            >
              <p className="text-text-muted text-xs">{label}</p>
              <p className="text-text-primary mt-1 text-sm font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

function AdminAccountCreationPanel({
  allowedRoles,
  formState,
  isSubmitting,
  organizations,
  onChange,
  onSubmit,
}: {
  allowedRoles: AdminAccountCreationRole[];
  formState: AdminAccountCreationFormState;
  isSubmitting: boolean;
  organizations: OrganizationListDto["organizations"];
  onChange: (value: AdminAccountCreationFormState) => void;
  onSubmit: () => void;
}) {
  const isOrganizationAdmin = isOrganizationAdminAccountCreationRole(
    formState.adminRole,
  );
  const canSubmit =
    /^1[3-9]\d{9}$/.test(formState.phone.trim()) &&
    formState.name.trim().length > 0 &&
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(formState.initialSecret.trim()) &&
    (!isOrganizationAdmin || formState.organizationPublicId.length > 0) &&
    !isSubmitting;

  return (
    <section
      aria-label="后台账号创建"
      id="admin-account-creation-panel"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
    >
      <div className="mb-4 space-y-1">
        <h3 className="text-text-primary text-base font-semibold">
          创建后台账号
        </h3>
        <p className="text-text-muted text-sm">
          后台账号与学员账号域分离；组织管理员必须先绑定组织上下文。
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">角色</span>
          <select
            className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
            value={formState.adminRole}
            onChange={(event) => {
              const adminRole = event.currentTarget
                .value as AdminAccountCreationRole;

              onChange({
                ...formState,
                adminRole,
                organizationPublicId: isOrganizationAdminAccountCreationRole(
                  adminRole,
                )
                  ? formState.organizationPublicId ||
                    organizations[0]?.publicId ||
                    ""
                  : "",
              });
            }}
          >
            {allowedRoles.map((role) => (
              <option key={role} value={role}>
                {adminRoleLabels[role]}
              </option>
            ))}
          </select>
        </label>
        {isOrganizationAdmin ? (
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">绑定组织</span>
            <select
              className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
              value={formState.organizationPublicId}
              onChange={(event) =>
                onChange({
                  ...formState,
                  organizationPublicId: event.currentTarget.value,
                })
              }
            >
              <option value="">请选择组织</option>
              {organizations.map((organization) => (
                <option
                  key={organization.publicId}
                  value={organization.publicId}
                >
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">手机号</span>
          <Input
            autoComplete="off"
            value={formState.phone}
            onChange={(event) =>
              onChange({ ...formState, phone: event.currentTarget.value })
            }
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">姓名</span>
          <Input
            autoComplete="off"
            value={formState.name}
            onChange={(event) =>
              onChange({ ...formState, name: event.currentTarget.value })
            }
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">初始密码</span>
          <Input
            autoComplete="new-password"
            type="password"
            value={formState.initialSecret}
            onChange={(event) =>
              onChange({
                ...formState,
                initialSecret: event.currentTarget.value,
              })
            }
          />
        </label>
        <Button disabled={!canSubmit} onClick={onSubmit}>
          <UserPlus aria-hidden="true" />
          {isSubmitting ? "创建中" : "创建账号"}
        </Button>
      </div>
    </section>
  );
}

function AdminUserDetailPanel({
  canDisclosePhone,
  detail,
  isRevealingPhone,
  onCopyPhone,
  onDisableUser,
  onEnableUser,
  onRevealPhone,
  onResetPassword,
  revealedPhone,
  state,
}: {
  canDisclosePhone: boolean;
  detail: AdminUserDetailDto | null;
  isRevealingPhone: boolean;
  onCopyPhone: (publicId: string, phone: string) => void;
  onDisableUser: (publicId: string, userName: string) => void;
  onEnableUser: (publicId: string, userName: string) => void;
  onRevealPhone: (publicId: string) => void;
  onResetPassword: (publicId: string, userName: string) => void;
  revealedPhone: string | null;
  state: "idle" | "loading" | "ready" | "error";
}) {
  if (state === "idle") {
    return null;
  }

  if (state === "loading") {
    return <AdminLoadingState label="正在加载用户详情" />;
  }

  if (state === "error" || detail === null) {
    return (
      <AdminErrorState
        description="请确认当前账号仍具备用户管理权限，并稍后重试。"
        title="用户详情加载失败"
      />
    );
  }

  const user = detail.user;

  return (
    <section
      aria-label="用户详情"
      className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1"
      data-public-id={user.publicId}
      data-testid={`admin-user-detail-${user.publicId}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 className="text-text-primary text-base font-semibold">
            用户详情
          </h2>
          <p className="text-text-primary text-sm font-medium">
            {user.name} / {revealedPhone ?? user.phone}
          </p>
          <p className="text-text-muted text-xs">
            {userTypeLabels[user.userType]} / {userStatusLabels[user.status]} /{" "}
            {user.authStatus === null
              ? "无授权"
              : authStatusLabels[user.authStatus]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canDisclosePhone ? (
            <>
              <Button
                aria-label={`查看${user.name}完整手机号`}
                disabled={isRevealingPhone || revealedPhone !== null}
                variant="outline"
                onClick={() => onRevealPhone(user.publicId)}
              >
                <Eye aria-hidden="true" />
                {isRevealingPhone ? "查看中" : "查看完整手机号"}
              </Button>
              {revealedPhone !== null ? (
                <Button
                  aria-label={`复制${user.name}完整手机号`}
                  variant="outline"
                  onClick={() => onCopyPhone(user.publicId, revealedPhone)}
                >
                  <Copy aria-hidden="true" />
                  复制手机号
                </Button>
              ) : null}
            </>
          ) : null}
          <Button
            aria-label={`重置${user.name}密码`}
            variant="outline"
            onClick={() => onResetPassword(user.publicId, user.name)}
          >
            <RotateCcwKey aria-hidden="true" />
            重置密码
          </Button>
          {user.status === "active" ? (
            <Button
              aria-label={`停用用户 ${user.name}`}
              variant="destructive"
              onClick={() => onDisableUser(user.publicId, user.name)}
            >
              <UserX aria-hidden="true" />
              停用用户
            </Button>
          ) : (
            <Button
              aria-label={`启用用户 ${user.name}`}
              variant="outline"
              onClick={() => onEnableUser(user.publicId, user.name)}
            >
              <UserCheck aria-hidden="true" />
              启用用户
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="border-border rounded-md border p-3">
          <h3 className="text-text-primary text-sm font-semibold">企业绑定</h3>
          {detail.enterpriseBinding === null ? (
            <p className="text-text-muted mt-2 text-sm">未绑定企业</p>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-text-primary text-sm">
                {detail.enterpriseBinding.organizationName} /{" "}
                {formatMappedLabel(
                  orgTierLabels,
                  detail.enterpriseBinding.orgTier,
                  "其他组织层级",
                )}
              </p>
              <p className="text-text-muted text-xs">员工账号已绑定当前组织</p>
            </div>
          )}
        </section>

        <section className="border-border rounded-md border p-3">
          <h3 className="text-text-primary text-sm font-semibold">授权列表</h3>
          <div className="mt-2 space-y-3">
            {detail.authorizations.length === 0 ? (
              <p className="text-text-muted text-sm">暂无授权</p>
            ) : (
              detail.authorizations.map((authorization) => (
                <article
                  key={authorization.publicId}
                  className="border-border border-t pt-3 first:border-t-0 first:pt-0"
                >
                  <p className="text-text-primary text-sm font-medium">
                    {formatMappedLabel(
                      authorizationTypeLabels,
                      authorization.authorizationType,
                      "其他授权",
                    )}
                  </p>
                  <p className="text-text-muted text-xs">
                    {formatProfessionLevel(authorization)} /{" "}
                    {authStatusLabels[authorization.status]} / 购买方{" "}
                    {authorization.purchaserName ?? "个人"}
                  </p>
                  <p className="text-text-muted mt-2 text-xs">
                    {authorization.organizationPublicIds.length === 0
                      ? "个人范围"
                      : `覆盖 ${authorization.organizationPublicIds.length} 个组织范围`}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function AdminOpsConfirmationDialog({
  confirmationState,
  resetPasswordInput,
  onCancel,
  onConfirm,
  onResetPasswordInputChange,
}: {
  confirmationState: Exclude<ConfirmationState, null>;
  resetPasswordInput: string;
  onCancel: () => void;
  onConfirm: () => void;
  onResetPasswordInputChange: (value: string) => void;
}) {
  const isResetPassword = confirmationState.kind === "resetPassword";
  const isDisableUser = confirmationState.kind === "disableUser";
  const canConfirm =
    !isResetPassword ||
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(resetPasswordInput.trim());
  const title = isResetPassword
    ? `确认重置${confirmationState.userName}的密码？`
    : isDisableUser
      ? `确认停用用户 ${confirmationState.userName}？`
      : `确认启用用户 ${confirmationState.userName}？`;
  const confirmLabel = isResetPassword
    ? "确认重置"
    : isDisableUser
      ? "确认停用"
      : "确认启用";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            aria-hidden="true"
            className="text-brand-primary size-4"
          />
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
        </div>
        <p className="text-text-muted text-sm">
          {isResetPassword
            ? "新密码提交后不会在响应中返回明文。"
            : isDisableUser
              ? "停用后将撤销该用户现有会话。"
              : "启用用户只恢复账号状态，不创建新授权。"}
        </p>
        {isResetPassword ? (
          <Input
            aria-label="reset-password-new-password"
            autoComplete="new-password"
            onChange={(event) =>
              onResetPasswordInputChange(event.currentTarget.value)
            }
            type="password"
            value={resetPasswordInput}
          />
        ) : null}
        <div className="flex gap-2">
          <Button
            disabled={!canConfirm}
            variant={isDisableUser ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminOpsToast({ message }: { message: ToastMessage }) {
  return (
    <div
      className={
        message.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={message.tone === "success" ? "status" : "alert"}
    >
      {message.message}
    </div>
  );
}
