import type { Metadata } from "next";
import { Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-tiku-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-tiku-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "题库系统 - 烟草行业职业技能考试平台",
  description: "面向烟草行业的专业职业技能考试与模拟训练平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={cn(notoSansSC.variable, jetbrainsMono.variable, "font-sans")}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
