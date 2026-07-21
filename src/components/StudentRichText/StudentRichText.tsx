"use client";

import { Fragment, createElement, type ReactNode } from "react";

type StudentRichTextMode = "block" | "inline";

type StudentRichTextProps = {
  as?: "div" | "h2" | "span";
  className?: string;
  fallback?: string;
  mode?: StudentRichTextMode;
  value: string | null | undefined;
};

const blockedTagNames = new Set([
  "base",
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "meta",
  "object",
  "script",
  "select",
  "style",
  "textarea",
]);

const inlineFlattenedTagNames = new Set([
  "article",
  "blockquote",
  "div",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

function isSafeUrl(value: string | null): value is string {
  if (value === null) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue.startsWith("/") ||
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
  );
}

function readManagedContentImageSource(element: Element): string | null {
  const publicId = element.getAttribute("data-content-image-public-id");
  const source = element.getAttribute("src");

  if (
    publicId === null ||
    !/^[a-z][a-z0-9-]{2,}$/u.test(publicId) ||
    source !== `/api/v1/content-images/${publicId}`
  ) {
    return null;
  }

  return source;
}

export function getStudentRichTextPlainText(value: string): string {
  return value
    .replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/giu, "")
    .replace(/<[^>]*>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function renderChildNodes(
  childNodes: NodeListOf<ChildNode>,
  mode: StudentRichTextMode,
  keyPrefix: string,
): ReactNode[] {
  return Array.from(childNodes).flatMap((childNode, childIndex) => {
    const renderedNode = renderRichTextNode(
      childNode,
      mode,
      `${keyPrefix}-${childIndex}`,
    );

    return renderedNode === null ? [] : [renderedNode];
  });
}

function renderInlineChildren(element: Element, key: string): ReactNode {
  return (
    <Fragment key={key}>
      {renderChildNodes(element.childNodes, "inline", key)}
    </Fragment>
  );
}

function renderRichTextNode(
  node: ChildNode,
  mode: StudentRichTextMode,
  key: string,
): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = node.textContent?.replace(/\s+/gu, " ") ?? "";

    return textContent.trim().length === 0 ? null : textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();

  if (blockedTagNames.has(tagName)) {
    return null;
  }

  if (mode === "inline" && inlineFlattenedTagNames.has(tagName)) {
    return renderInlineChildren(element, key);
  }

  const children = renderChildNodes(element.childNodes, mode, key);

  switch (tagName) {
    case "a": {
      const href = element.getAttribute("href");

      return isSafeUrl(href) ? (
        <a
          key={key}
          className="text-brand-primary underline-offset-4 hover:underline"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {children}
        </a>
      ) : (
        <Fragment key={key}>{children}</Fragment>
      );
    }
    case "br":
      return <br key={key} />;
    case "code":
      return (
        <code key={key} className="bg-muted rounded px-1 py-0.5">
          {children}
        </code>
      );
    case "em":
    case "i":
      return <em key={key}>{children}</em>;
    case "img": {
      const src = readManagedContentImageSource(element);
      const alt = element.getAttribute("alt") ?? "";

      return src !== null && alt.trim().length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          alt={alt}
          className="border-border my-2 max-w-full rounded-lg border"
          src={src}
        />
      ) : null;
    }
    case "li":
      return (
        <li key={key} className="leading-6">
          {children}
        </li>
      );
    case "ol":
      return (
        <ol key={key} className="list-decimal space-y-1 ps-5">
          {children}
        </ol>
      );
    case "p":
      return (
        <p key={key} className="leading-6">
          {children}
        </p>
      );
    case "strong":
    case "b":
      return <strong key={key}>{children}</strong>;
    case "sub":
      return <sub key={key}>{children}</sub>;
    case "sup":
      return <sup key={key}>{children}</sup>;
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table className="border-border min-w-full border-collapse border text-left">
            {children}
          </table>
        </div>
      );
    case "tbody":
      return <tbody key={key}>{children}</tbody>;
    case "td":
      return (
        <td key={key} className="border-border border px-2 py-1 align-top">
          {children}
        </td>
      );
    case "tfoot":
      return <tfoot key={key}>{children}</tfoot>;
    case "th":
      return (
        <th key={key} className="border-border bg-muted border px-2 py-1">
          {children}
        </th>
      );
    case "thead":
      return <thead key={key}>{children}</thead>;
    case "tr":
      return <tr key={key}>{children}</tr>;
    case "ul":
      return (
        <ul key={key} className="list-disc space-y-1 ps-5">
          {children}
        </ul>
      );
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

function renderRichText(value: string, mode: StudentRichTextMode): ReactNode[] {
  if (!value.includes("<")) {
    return [value];
  }

  if (typeof DOMParser === "undefined") {
    return [getStudentRichTextPlainText(value)];
  }

  const parser = new DOMParser();
  const documentValue = parser.parseFromString(value, "text/html");

  return renderChildNodes(documentValue.body.childNodes, mode, "root");
}

export function StudentRichText({
  as = "div",
  className,
  fallback = "内容暂不可见",
  mode = "block",
  value,
}: StudentRichTextProps) {
  const normalizedValue = value?.trim();
  const richTextValue =
    normalizedValue === undefined || normalizedValue.length === 0
      ? fallback
      : normalizedValue;

  return createElement(as, { className }, renderRichText(richTextValue, mode));
}
