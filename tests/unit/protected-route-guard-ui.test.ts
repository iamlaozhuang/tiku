import { createElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { StudentAppLayout } from "@/components/StudentAppLayout";

const replaceMock = vi.fn();
let pathnameMock = "/home";

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

function createSessionResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

const studentSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-student-public",
      phone: "13800000001",
      name: "Student User",
      userType: "personal",
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: null,
      adminRoles: [],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-public",
      phone: "13900000001",
      name: "Admin User",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-public-001",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

function getFirstFetchInit(fetchMock: ReturnType<typeof vi.fn>): RequestInit {
  const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];

  return init;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  replaceMock.mockReset();
  pathnameMock = "/home";
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("protected route guard UI", () => {
  it("redirects an unauthenticated student route after checking the server session", async () => {
    const fetchMock = vi.fn(async () =>
      createSessionResponse({
        code: 401001,
        message: "Unauthorized.",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(
        StudentAppLayout,
        null,
        createElement("div", { "data-testid": "student-child" }, "student"),
      ),
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({
        credentials: "same-origin",
      }),
    );
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByTestId("student-child")).toBeNull();
  });

  it("allows a valid cookie-backed student session to render the student shell", async () => {
    const fetchMock = vi.fn(async () =>
      createSessionResponse(studentSessionPayload),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(
        StudentAppLayout,
        null,
        createElement("div", { "data-testid": "student-child" }, "student"),
      ),
    );

    expect(await screen.findByTestId("student-child")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({
        credentials: "same-origin",
      }),
    );
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");
  });

  it("redirects an unauthenticated admin route after checking the server session", async () => {
    pathnameMock = "/content/questions";
    const fetchMock = vi.fn(async () =>
      createSessionResponse({
        code: 401001,
        message: "Unauthorized.",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", { "data-testid": "admin-child" }, "admin"),
      ),
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({
        credentials: "same-origin",
      }),
    );
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByTestId("admin-child")).toBeNull();
  });

  it("allows a valid cookie-backed admin session to render admin navigation and blocks student sessions", async () => {
    pathnameMock = "/ops/users";
    const fetchMock = vi.fn(async () =>
      createSessionResponse(adminSessionPayload),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", { "data-testid": "admin-child" }, "admin"),
      ),
    );

    expect(await screen.findByTestId("admin-child")).toBeInTheDocument();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(replaceMock).not.toHaveBeenCalled();
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");

    cleanup();
    replaceMock.mockReset();
    fetchMock.mockResolvedValue(createSessionResponse(studentSessionPayload));

    render(
      createElement(
        AdminDashboardLayout,
        null,
        createElement("div", { "data-testid": "admin-child" }, "admin"),
      ),
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByTestId("admin-child")).toBeNull();
  });
});
