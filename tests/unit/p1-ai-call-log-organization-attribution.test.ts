import { describe, expect, it } from "vitest";

import { createStudentFlowUserResolver } from "@/server/services/student-flow-runtime";
import { createStudentMistakeBookUserResolver } from "@/server/services/student-mistake-book-runtime";

function createEmployeeSessionService() {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "user-public-001",
            phone: "13800000000",
            name: "Employee",
            userType: "employee" as const,
            status: "active" as const,
            lockedUntilAt: null,
            employeePublicId: "employee-public-001",
            organizationPublicId: "organization-public-001",
            adminPublicId: null,
            adminRoles: [],
          },
          session: {
            expiresAt: "2026-07-22T00:00:00.000Z",
          },
        },
      };
    },
  };
}

function createPersonalSessionService() {
  return {
    async getCurrentSession() {
      const response = await createEmployeeSessionService().getCurrentSession();

      return {
        ...response,
        data: {
          ...response.data,
          user: {
            ...response.data.user,
            userType: "personal" as const,
            employeePublicId: null,
            organizationPublicId: null,
          },
        },
      };
    },
  };
}

describe("P1 F-0038 authenticated organization attribution", () => {
  it("keeps the session organization fact in the student flow context", async () => {
    const resolveUser = createStudentFlowUserResolver(
      createEmployeeSessionService(),
    );

    await expect(
      resolveUser(
        new Request("http://localhost/api/v1/mock-exams", {
          headers: { authorization: "Bearer employee-session" },
        }),
      ),
    ).resolves.toEqual({
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
    });
  });

  it("keeps the session organization fact in the mistake-book context", async () => {
    const resolveUser = createStudentMistakeBookUserResolver(
      createEmployeeSessionService(),
    );

    await expect(
      resolveUser(
        new Request("http://localhost/api/v1/mistake-books", {
          headers: { authorization: "Bearer employee-session" },
        }),
      ),
    ).resolves.toEqual({
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
    });
  });

  it("preserves null organization attribution for a personal user", async () => {
    const resolveUser = createStudentFlowUserResolver(
      createPersonalSessionService(),
    );

    await expect(
      resolveUser(new Request("http://localhost/api/v1/mock-exams")),
    ).resolves.toEqual({
      userPublicId: "user-public-001",
      organizationPublicId: null,
    });
  });
});
