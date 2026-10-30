import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Không tìm thấy nhà hàng hoặc trang yêu cầu
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Nhà hàng hoặc đường dẫn bạn vừa truy cập không tồn tại trong hệ thống.
        Hãy quay về trang chủ để khám phá các quán ngon đang mở cửa.
      </p>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
