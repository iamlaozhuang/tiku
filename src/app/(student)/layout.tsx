import { StudentAppLayout } from "@/components/StudentAppLayout";

/**
 * (student) 路由组布局
 * 学员端 Mobile-first: Header + 底部 3-Tab Bar
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentAppLayout>{children}</StudentAppLayout>;
}
