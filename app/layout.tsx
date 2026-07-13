import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micro Landscape Studio",
  description: "3D 微观景象创作平台，支持四季模板、容器切换、照片元素入景与导出分享。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
