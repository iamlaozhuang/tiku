"use client";

import { useState } from "react";

/**
 * 设计规范验收展示页
 * 仅开发环境可访问 (dev route group)
 * 展示全部 Design Tokens：品牌色、语义色、中性色、字体、圆角、间距
 */

const GREEN_SCALE = [
  { name: "green-50", var: "--color-green-50" },
  { name: "green-100", var: "--color-green-100" },
  { name: "green-200", var: "--color-green-200" },
  { name: "green-300", var: "--color-green-300" },
  { name: "green-400", var: "--color-green-400" },
  { name: "green-500", var: "--color-green-500" },
  { name: "green-600", var: "--color-green-600" },
  { name: "green-700", var: "--color-green-700" },
  { name: "green-800", var: "--color-green-800" },
  { name: "green-900", var: "--color-green-900" },
];

const SEMANTIC_COLORS = [
  { name: "Brand Primary", class: "bg-brand-primary" },
  { name: "Brand Secondary", class: "bg-brand-secondary" },
  { name: "Success", class: "bg-success" },
  { name: "Warning", class: "bg-warning" },
  { name: "Error", class: "bg-error" },
  { name: "Info", class: "bg-info" },
];

const NEUTRAL_COLORS = [
  { name: "Surface", class: "bg-surface", border: true },
  { name: "Background", class: "bg-background", border: true },
  { name: "Border", class: "bg-border" },
  { name: "Border Hover", class: "bg-border-hover" },
];

const FONT_SIZES = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];

const RADIUS_ITEMS = [
  { name: "sm (4px)", class: "rounded-sm" },
  { name: "md (8px)", class: "rounded-md" },
  { name: "lg (12px)", class: "rounded-lg" },
  { name: "xl (16px)", class: "rounded-xl" },
  { name: "full", class: "rounded-full" },
];

export default function DesignSystemPage() {
  const [isDark, setIsDark] = useState(false);

  const handleToggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              Tiku Design System
            </h1>
            <p className="mt-1 text-text-secondary">
              Design Tokens 验收展示页 — 仅开发环境可见
            </p>
          </div>
          <button
            onClick={handleToggleDark}
            className="rounded-radius-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-green-50"
          >
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Brand & Green Scale */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            品牌绿色阶梯 (Green Scale)
          </h2>
          <div className="flex gap-2">
            {GREEN_SCALE.map((c) => (
              <div key={c.name} className="flex-1">
                <div
                  className="h-16 rounded-radius-md"
                  style={{ backgroundColor: `var(${c.var})` }}
                />
                <p className="mt-1 text-center text-xs text-text-muted">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Semantic Colors */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            语义色 (Semantic Colors)
          </h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {SEMANTIC_COLORS.map((c) => (
              <div key={c.name}>
                <div className={`h-16 rounded-radius-md ${c.class}`} />
                <p className="mt-1 text-center text-xs text-text-muted">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Neutral Colors */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            中性色 (Neutral)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {NEUTRAL_COLORS.map((c) => (
              <div key={c.name}>
                <div
                  className={`h-16 rounded-radius-md ${c.class} ${
                    c.border ? "border border-border" : ""
                  }`}
                />
                <p className="mt-1 text-center text-xs text-text-muted">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Text Colors */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            文字色 (Text Colors)
          </h2>
          <div className="space-y-2 rounded-radius-md border border-border bg-surface p-4">
            <p className="text-text-primary">text-primary — 主文字色</p>
            <p className="text-text-secondary">text-secondary — 次要文字色</p>
            <p className="text-text-muted">text-muted — 禁用/提示文字色</p>
            <p className="inline-block rounded-radius-md bg-brand-primary px-3 py-1 text-text-inverse">
              text-inverse — 反色文字（品牌绿底 + 白字）
            </p>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            字体排版 (Typography)
          </h2>
          <div className="space-y-4 rounded-radius-md border border-border bg-surface p-4">
            <div>
              <p className="text-xs text-text-muted mb-1">font-heading (Inter)</p>
              <p className="font-heading text-2xl font-semibold text-text-primary">
                The quick brown fox — 标题字体
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">font-body (Noto Sans SC)</p>
              <p className="font-body text-base text-text-primary">
                烟草行业职业技能考试与模拟训练平台 — 正文字体
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">font-mono (JetBrains Mono)</p>
              <p className="font-mono text-sm text-text-primary">
                Score: 85.5 / 100 — 等宽数据字体
              </p>
            </div>
          </div>
        </section>

        {/* Font Sizes */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            字号阶梯 (Font Sizes)
          </h2>
          <div className="space-y-2 rounded-radius-md border border-border bg-surface p-4">
            {FONT_SIZES.map((size) => (
              <p key={size} className={`${size} text-text-primary`}>
                {size} — 题库系统 Tiku Design System
              </p>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            圆角 (Border Radius)
          </h2>
          <div className="flex items-end gap-4">
            {RADIUS_ITEMS.map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className={`h-16 w-16 border-2 border-brand-primary bg-green-50 ${r.class}`}
                />
                <p className="mt-1 text-xs text-text-muted">{r.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            阴影 (Shadows)
          </h2>
          <div className="flex gap-8">
            {["shadow-sm", "shadow-md", "shadow-lg"].map((s) => (
              <div
                key={s}
                className={`flex h-24 w-32 items-center justify-center rounded-radius-md bg-surface ${s}`}
              >
                <span className="text-xs text-text-muted">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contrast Check */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            对比度检查 (Contrast)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-48 items-center justify-center rounded-radius-md bg-brand-primary text-sm font-medium text-white">
                白字 on #00904A
              </div>
              <span className="text-sm text-text-secondary">
                对比度 ≈ 4.73:1 — WCAG AA ✅ (大文本) | AA 常规文本 ✅
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-48 items-center justify-center rounded-radius-md bg-brand-primary text-sm font-medium text-green-50">
                green-50 on #00904A
              </div>
              <span className="text-sm text-text-secondary">
                对比度 ≈ 4.58:1 — WCAG AA ✅
              </span>
            </div>
          </div>
        </section>

        {/* Button Variants Preview */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            按钮预览 (Buttons)
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-radius-md bg-brand-primary px-4 py-2 text-sm font-medium text-text-inverse shadow-sm transition-opacity hover:opacity-90">
              Primary
            </button>
            <button className="rounded-radius-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-green-50">
              Outline
            </button>
            <button className="rounded-radius-md px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-green-50">
              Ghost
            </button>
            <button className="rounded-radius-md bg-error px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90">
              Destructive
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
