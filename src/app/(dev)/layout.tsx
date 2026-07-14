import type { ReactNode } from "react";
import { notFound } from "next/navigation";

export function isDevelopmentRouteEnabled(
  environment: string | undefined = process.env.NODE_ENV,
) {
  return environment === "development";
}

export default function DevelopmentOnlyLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (!isDevelopmentRouteEnabled()) {
    notFound();
  }

  return children;
}
