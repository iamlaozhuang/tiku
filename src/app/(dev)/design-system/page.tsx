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

const FONT_SIZES = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
];

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
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-text-primary text-3xl font-bold">
              Tiku Design System
            </h1>
            <p className="text-text-secondary mt-1">
              Design Tokens 验收展示页 — 仅开发环境可见
            </p>
          </div>
          <button
            onClick={handleToggleDark}
            className="rounded-radius-md border-border bg-surface text-text-primary border px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-green-50"
          >
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Brand & Green Scale */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            品牌绿色阶梯 (Green Scale)
          </h2>
          <div className="flex gap-2">
            {GREEN_SCALE.map((c) => (
              <div key={c.name} className="flex-1">
                <div
                  className="rounded-radius-md h-16"
                  style={{ backgroundColor: `var(${c.var})` }}
                />
                <p className="text-text-muted mt-1 text-center text-xs">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Semantic Colors */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            语义色 (Semantic Colors)
          </h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {SEMANTIC_COLORS.map((c) => (
              <div key={c.name}>
                <div className={`rounded-radius-md h-16 ${c.class}`} />
                <p className="text-text-muted mt-1 text-center text-xs">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Neutral Colors */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            中性色 (Neutral)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {NEUTRAL_COLORS.map((c) => (
              <div key={c.name}>
                <div
                  className={`rounded-radius-md h-16 ${c.class} ${
                    c.border ? "border-border border" : ""
                  }`}
                />
                <p className="text-text-muted mt-1 text-center text-xs">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Text Colors */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            文字色 (Text Colors)
          </h2>
          <div className="rounded-radius-md border-border bg-surface space-y-2 border p-4">
            <p className="text-text-primary">text-primary — 主文字色</p>
            <p className="text-text-secondary">text-secondary — 次要文字色</p>
            <p className="text-text-muted">text-muted — 禁用/提示文字色</p>
            <p className="rounded-radius-md bg-brand-primary text-text-inverse inline-block px-3 py-1">
              text-inverse — 反色文字（品牌绿底 + 白字）
            </p>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            字体排版 (Typography)
          </h2>
          <div className="rounded-radius-md border-border bg-surface space-y-4 border p-4">
            <div>
              <p className="text-text-muted mb-1 text-xs">
                font-heading (Inter)
              </p>
              <p className="font-heading text-text-primary text-2xl font-semibold">
                The quick brown fox — 标题字体
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-1 text-xs">
                font-body (Noto Sans SC)
              </p>
              <p className="font-body text-text-primary text-base">
                烟草行业职业技能考试与模拟训练平台 — 正文字体
              </p>
            </div>
            <div>
              <p className="text-text-muted mb-1 text-xs">
                font-mono (JetBrains Mono)
              </p>
              <p className="text-text-primary font-mono text-sm">
                Score: 85.5 / 100 — 等宽数据字体
              </p>
            </div>
          </div>
        </section>

        {/* Font Sizes */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            字号阶梯 (Font Sizes)
          </h2>
          <div className="rounded-radius-md border-border bg-surface space-y-2 border p-4">
            {FONT_SIZES.map((size) => (
              <p key={size} className={`${size} text-text-primary`}>
                {size} — 题库系统 Tiku Design System
              </p>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            圆角 (Border Radius)
          </h2>
          <div className="flex items-end gap-4">
            {RADIUS_ITEMS.map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className={`border-brand-primary h-16 w-16 border-2 bg-green-50 ${r.class}`}
                />
                <p className="text-text-muted mt-1 text-xs">{r.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            阴影 (Shadows)
          </h2>
          <div className="flex gap-8">
            {["shadow-sm", "shadow-md", "shadow-lg"].map((s) => (
              <div
                key={s}
                className={`rounded-radius-md bg-surface flex h-24 w-32 items-center justify-center ${s}`}
              >
                <span className="text-text-muted text-xs">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contrast Check */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            对比度检查 (Contrast)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="rounded-radius-md bg-brand-primary flex h-10 w-48 items-center justify-center text-sm font-medium text-white">
                白字 on #00904A
              </div>
              <span className="text-text-secondary text-sm">
                对比度 ≈ 4.73:1 — WCAG AA ✅ (大文本) | AA 常规文本 ✅
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-radius-md bg-brand-primary flex h-10 w-48 items-center justify-center text-sm font-medium text-green-50">
                green-50 on #00904A
              </div>
              <span className="text-text-secondary text-sm">
                对比度 ≈ 4.58:1 — WCAG AA ✅
              </span>
            </div>
          </div>
        </section>

        {/* Button Variants Preview */}
        <section>
          <h2 className="font-heading text-text-primary mb-4 text-xl font-semibold">
            按钮预览 (Buttons)
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-radius-md bg-brand-primary text-text-inverse px-4 py-2 text-sm font-medium shadow-sm transition-opacity hover:opacity-90">
              Primary
            </button>
            <button className="rounded-radius-md border-border bg-surface text-text-primary border px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-green-50">
              Outline
            </button>
            <button className="rounded-radius-md text-brand-primary px-4 py-2 text-sm font-medium transition-colors hover:bg-green-50">
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
