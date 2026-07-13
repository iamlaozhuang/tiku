"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function AdminDetailDrawer({
  ariaLabel,
  children,
  description,
  eyebrow = "只读详情",
  onClose,
  title,
}: {
  ariaLabel: string;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  onClose: () => void;
  title: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      const eventDialog =
        event.target instanceof Element
          ? event.target.closest('[role="dialog"][aria-modal="true"]')
          : null;

      if (
        event.defaultPrevented ||
        (eventDialog !== null && eventDialog !== drawerRef.current)
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || drawerRef.current === null) {
        return;
      }

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      const activeElement = document.activeElement;

      if (firstElement === undefined || lastElement === undefined) {
        return;
      }

      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          !drawerRef.current.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement ||
          !drawerRef.current.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label={`点击遮罩关闭${ariaLabel}`}
        className="bg-foreground/20 absolute inset-0 cursor-default"
        tabIndex={-1}
        type="button"
        onClick={onClose}
      />
      <aside
        aria-label={ariaLabel}
        aria-modal="true"
        className="bg-background border-border absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col border-l shadow-lg"
        ref={drawerRef}
        role="dialog"
      >
        <header className="bg-background border-border sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <p className="text-brand-primary text-xs font-medium">{eyebrow}</p>
            <h2 className="text-text-primary mt-1 text-base font-semibold">
              {title}
            </h2>
            {description === undefined ? null : (
              <p className="text-text-secondary mt-1 text-xs leading-5">
                {description}
              </p>
            )}
          </div>
          <button
            aria-label={`关闭${ariaLabel}`}
            className="border-border bg-background hover:bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-md border"
            ref={closeButtonRef}
            title="关闭"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
