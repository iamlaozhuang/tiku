/**
 * (auth) 路由组布局
 * 用于登录/注册等无导航栏的页面
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  );
}
