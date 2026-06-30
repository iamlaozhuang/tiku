import Link from "next/link";

/**
 * 根页面 — 导航入口
 */
export default function RootPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-heading text-brand-primary text-3xl font-bold">
        题库系统
      </h1>
      <p className="text-text-secondary">烟草行业职业技能考试平台</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/home"
          className="rounded-radius-md bg-brand-primary text-text-inverse px-6 py-3 text-center text-sm font-medium shadow-sm transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          进入学员端
        </Link>
        <Link
          href="/content/papers"
          className="rounded-radius-md border-border bg-surface text-text-primary hover:bg-muted border px-6 py-3 text-center text-sm font-medium shadow-sm transition-transform active:scale-[0.98]"
        >
          内容后台
        </Link>
        <Link
          href="/ops/users"
          className="rounded-radius-md border-border bg-surface text-text-primary hover:bg-muted border px-6 py-3 text-center text-sm font-medium shadow-sm transition-transform active:scale-[0.98]"
        >
          运营后台
        </Link>
      </div>
    </div>
  );
}
