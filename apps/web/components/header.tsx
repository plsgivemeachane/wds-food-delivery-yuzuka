import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-5" aria-hidden="true" />
          </span>
          <span>Bếp Phố Giao Nhanh</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/"
            className="text-foreground/80 transition-colors hover:text-foreground"
          >
            Trang chủ
          </Link>
          <a
            href="#nha-hang-noi-bat"
            className="text-foreground/80 transition-colors hover:text-foreground"
          >
            Nhà hàng
          </a>
        </nav>
      </div>
    </header>
  );
}
