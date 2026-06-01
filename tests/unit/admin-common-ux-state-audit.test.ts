import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
} from "@/features/admin/content-admin-runtime";

const forbiddenMarkers = [
  "rawPrompt",
  "rawAnswer",
  "rawModelResponse",
  "providerPayload",
  "Authorization",
  "Bearer ",
  "databaseUrl",
  "secretValue",
];

afterEach(() => {
  cleanup();
});

function expectRedactionSafe(container: HTMLElement) {
  const renderedText = container.textContent ?? "";

  for (const marker of forbiddenMarkers) {
    expect(renderedText).not.toContain(marker);
  }
}

describe("admin common UX state audit", () => {
  it("exposes loading and empty states as non-alert status regions", () => {
    const loadingView = render(
      createElement(AdminLoadingState, { label: "正在加载运营后台数据" }),
    );

    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus).toHaveAttribute("data-admin-ux-state", "loading");
    expect(loadingStatus).toHaveTextContent("正在加载运营后台数据");
    expectRedactionSafe(loadingView.container);

    cleanup();

    const emptyView = render(
      createElement(AdminEmptyState, {
        description:
          "当前没有可展示的用户、企业、卡密、审计日志或 AI 调用日志。",
        title: "暂无运营后台数据",
      }),
    );

    const emptyStatus = screen.getByRole("status");
    expect(emptyStatus).toHaveAttribute("data-admin-ux-state", "empty");
    expect(emptyStatus).toHaveTextContent("暂无运营后台数据");
    expectRedactionSafe(emptyView.container);
  });

  it("exposes error and permission-denied states as alert regions", () => {
    const errorView = render(
      createElement(AdminErrorState, {
        description: "请稍后刷新页面，或重新登录后再查看运营后台数据。",
        title: "运营后台数据加载失败",
      }),
    );

    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toHaveAttribute("data-admin-ux-state", "error");
    expect(errorAlert).toHaveTextContent("运营后台数据加载失败");
    expectRedactionSafe(errorView.container);

    cleanup();

    const unauthorizedView = render(createElement(AdminUnauthorizedState));

    const permissionAlert = screen.getByRole("alert");
    expect(permissionAlert).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(permissionAlert).toHaveTextContent("请先登录后台");
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expectRedactionSafe(unauthorizedView.container);
  });
});
