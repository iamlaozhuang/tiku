import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// --- Phase 3: 字体引入 (next/font/google) ---
// 遵循 ui-code.md §2.1 命名：--font-heading, --font-body, --font-mono
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn(inter.variable, notoSansSC.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
