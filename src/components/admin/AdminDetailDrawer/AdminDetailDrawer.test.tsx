import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";

afterEach(() => {
  cleanup();
});

function DrawerHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        查看详情
      </button>
      {isOpen ? (
        <AdminDetailDrawer
          ariaLabel="合成详情"
          onClose={() => setIsOpen(false)}
          title="合成对象"
        >
          <button type="button">详情末尾动作</button>
        </AdminDetailDrawer>
      ) : null}
    </>
  );
}

describe("AdminDetailDrawer", () => {
  it("loops focus in both directions, closes on Escape, and restores the trigger", async () => {
    render(<DrawerHarness />);
    const trigger = screen.getByRole("button", { name: "查看详情" });

    trigger.focus();
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "关闭合成详情" });
    const lastAction = screen.getByRole("button", { name: "详情末尾动作" });
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(lastAction).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "合成详情" })).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("does not restart the focus lifecycle when the close callback identity changes", async () => {
    const firstClose = vi.fn();
    const nextClose = vi.fn();
    const { rerender } = render(
      <AdminDetailDrawer
        ariaLabel="合成详情"
        onClose={firstClose}
        title="合成对象"
      >
        <button type="button">详情动作</button>
      </AdminDetailDrawer>,
    );
    const detailAction = screen.getByRole("button", { name: "详情动作" });

    detailAction.focus();
    expect(detailAction).toHaveFocus();

    rerender(
      <AdminDetailDrawer
        ariaLabel="合成详情"
        onClose={nextClose}
        title="合成对象"
      >
        <button type="button">详情动作</button>
      </AdminDetailDrawer>,
    );

    await waitFor(() => expect(detailAction).toHaveFocus());

    fireEvent.keyDown(detailAction, { key: "Escape" });
    expect(firstClose).not.toHaveBeenCalled();
    expect(nextClose).toHaveBeenCalledTimes(1);
  });

  it("does not consume Escape from a nested modal alert dialog", () => {
    const handleClose = vi.fn();

    render(
      <AdminDetailDrawer
        ariaLabel="用户详情"
        onClose={handleClose}
        title="用户详情"
      >
        <div aria-modal="true" role="alertdialog">
          <button type="button">确认停用</button>
        </div>
      </AdminDetailDrawer>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "确认停用" }), {
      key: "Escape",
    });

    expect(handleClose).not.toHaveBeenCalled();
  });

  it("does not close while a sibling modal alert dialog owns the interaction", () => {
    const handleClose = vi.fn();

    render(
      <>
        <AdminDetailDrawer
          ariaLabel="用户详情"
          onClose={handleClose}
          title="用户详情"
        >
          <button type="button">停用用户</button>
        </AdminDetailDrawer>
        <div aria-modal="true" role="alertdialog">
          <button type="button">确认停用</button>
        </div>
      </>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "停用用户" }), {
      key: "Escape",
    });

    expect(handleClose).not.toHaveBeenCalled();
  });
});
