import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { CartBadge } from "@/components/cart-badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Bếp Phố Giao Nhanh — Đặt món Việt nóng hổi tận nơi",
  description:
    "Khám phá các quán ăn Việt được yêu thích, chọn món nhanh chóng và giao hàng tận cửa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className=" flex min-h-screen flex-col bg-background text-foreground antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartBadge />
        <Toaster richColors position="top-center" duration={2000} />
      </body>
    </html>
  );
}
