"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Đã xảy ra lỗi khi tải trang
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Rất tiếc, hệ thống gặp sự cố bất ngờ khi hiển thị nội dung. Bạn có thể
        bấm thử lại hoặc quay về trang chủ để tiếp tục chọn món.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          <RotateCcw className="size-4" aria-hidden="true" />
          <span>Thử lại</span>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
