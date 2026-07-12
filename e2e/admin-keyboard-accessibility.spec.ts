import { expect, test, type Route } from "@playwright/test";

const sessionMarker = "keyboard-accessibility-session";
const questionStem = "键盘验收题干";

const sessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "keyboard-content-admin-user",
      phone: "local-keyboard-fixture",
      name: "内容验收管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "keyboard-content-admin",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-07-13T00:00:00.000Z",
    },
  },
};

const question = {
  publicId: "question-keyboard-fixture",
  questionType: "single_choice",
  profession: "marketing",
  level: 3,
  subject: "theory",
  stemRichText: questionStem,
  analysisRichText: "键盘验收解析",
  standardAnswerRichText: "A",
  status: "available",
  isLocked: true,
  lockedAt: "2026-07-11T00:00:00.000Z",
  multiChoiceRule: "all_correct_only",
  scoringMethod: "auto_match",
  materialPublicId: null,
  questionOptions: [
    {
      label: "A",
      contentRichText: "键盘验收选项",
      isCorrect: true,
      sortOrder: 1,
    },
  ],
  scoringPoints: [],
  knowledgeNodePublicIds: [],
  tagPublicIds: [],
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
};

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  await route.fulfill({
    body: JSON.stringify(payload),
    contentType: "application/json",
    status,
  });
}

test("keeps detail drawer focus trapped and restores the trigger on Escape", async ({
  page,
}) => {
  const unexpectedApiPaths: string[] = [];

  await page.addInitScript((marker) => {
    localStorage.setItem("tiku.localSessionToken", marker);
  }, sessionMarker);

  await page.route("**/api/v1/**", async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.pathname === "/api/v1/sessions") {
      await fulfillJson(route, sessionPayload);
      return;
    }

    if (requestUrl.pathname === "/api/v1/questions") {
      await fulfillJson(route, {
        code: 0,
        message: "ok",
        data: [question],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "updatedAt",
          sortOrder: "desc",
        },
      });
      return;
    }

    if (requestUrl.pathname === `/api/v1/questions/${question.publicId}`) {
      await fulfillJson(route, {
        code: 0,
        message: "ok",
        data: { question },
      });
      return;
    }

    if (requestUrl.pathname === "/api/v1/materials") {
      await fulfillJson(route, {
        code: 0,
        message: "ok",
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          sortBy: "updatedAt",
          sortOrder: "desc",
        },
      });
      return;
    }

    if (requestUrl.pathname === "/api/v1/knowledge-nodes") {
      await fulfillJson(route, {
        code: 0,
        message: "ok",
        data: { knowledgeNodes: [] },
      });
      return;
    }

    if (requestUrl.pathname === "/api/v1/tags") {
      await fulfillJson(route, {
        code: 0,
        message: "ok",
        data: { tags: [] },
      });
      return;
    }

    unexpectedApiPaths.push(requestUrl.pathname);
    await fulfillJson(
      route,
      { code: 404001, message: "fixture route missing", data: null },
      404,
    );
  });

  await page.goto("/content/questions");

  const trigger = page.getByRole("button", { name: /查看题目/ }).first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");

  const drawer = page.getByRole("dialog", { name: "题目详情" });
  const closeButton = drawer.getByRole("button", { name: "关闭题目详情" });

  await expect(drawer).toBeVisible();
  await expect(closeButton).toBeFocused();
  expect(
    await page.evaluate(() => document.activeElement !== document.body),
  ).toBe(true);
  expect(
    await closeButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" || style.boxShadow !== "none";
    }),
  ).toBe(true);

  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(unexpectedApiPaths).toEqual([]);
});
