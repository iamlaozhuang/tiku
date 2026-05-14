import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";

/**
 * (admin) 路由组布局
 * 后台端 Desktop-first: 左侧 Sidebar + 顶部 TopBar
 * content/ 和 ops/ 共用此布局，通过菜单配置区分
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
