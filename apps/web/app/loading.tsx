export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải dữ liệu..."
      className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="space-y-3 rounded-2xl border bg-muted/30 p-6 sm:p-10">
        <div className="h-5 w-44 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-full max-w-lg animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex flex-col overflow-hidden rounded-xl border bg-card"
            >
              <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
              <div className="space-y-3 p-6">
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">
        Đang tải dữ liệu nhà hàng và thực đơn, vui lòng chờ trong giây lát...
      </span>
    </div>
  );
}
