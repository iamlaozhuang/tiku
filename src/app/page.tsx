import Link from "next/link";

/**
 * 根页面 — 导航入口
 */
export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <h1 className="font-heading text-3xl font-bold text-brand-primary">
        题库系统
      </h1>
      <p className="text-text-secondary">烟草行业职业技能考试平台</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/home"
          className="rounded-radius-md bg-brand-primary px-6 py-3 text-center text-sm font-medium text-text-inverse shadow-sm transition-opacity hover:opacity-90"
        >
          进入学员端
        </Link>
        <Link
          href="/content/papers"
          className="rounded-radius-md border border-border bg-surface px-6 py-3 text-center text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-green-50"
        >
          内容后台
        </Link>
        <Link
          href="/ops/users"
          className="rounded-radius-md border border-border bg-surface px-6 py-3 text-center text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-green-50"
        >
          运营后台
        </Link>
      </div>
    </div>
  );
}
