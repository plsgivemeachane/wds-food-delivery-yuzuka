"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkoutSchema,
  type CheckoutFormValues,
  type CheckoutInput,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";

export interface CheckoutFormProps {
  onSubmit: (values: CheckoutInput) => Promise<void> | void;
  isReady?: boolean;
}

export function CheckoutForm({ onSubmit, isReady = true }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      note: "",
    },
    mode: "onSubmit",
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      data-testid="checkout-form"
    >
      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-foreground"
        >
          Họ và tên <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          aria-invalid={errors.fullName ? "true" : "false"}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            errors.fullName &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
          {...register("fullName")}
        />
        {errors.fullName?.message && (
          <p
            id="fullName-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label
          htmlFor="phone"
          className="text-sm font-medium text-foreground"
        >
          Số điện thoại <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Ví dụ: 0901234567"
          aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            errors.phone &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
          {...register("phone")}
        />
        {errors.phone?.message && (
          <p
            id="phone-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label
          htmlFor="address"
          className="text-sm font-medium text-foreground"
        >
          Địa chỉ giao hàng <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="address"
          type="text"
          autoComplete="street-address"
          placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Nghé, Quận 1"
          aria-invalid={errors.address ? "true" : "false"}
          aria-describedby={errors.address ? "address-error" : undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            errors.address &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
          {...register("address")}
        />
        {errors.address?.message && (
          <p
            id="address-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label
          htmlFor="note"
          className="text-sm font-medium text-foreground"
        >
          Ghi chú đơn hàng{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (không bắt buộc)
          </span>
        </label>
        <textarea
          id="note"
          rows={3}
          placeholder="Ví dụ: Giao trước 12h, ít đá, nhiều ớt..."
          aria-invalid={errors.note ? "true" : "false"}
          aria-describedby={errors.note ? "note-error" : undefined}
          className={cn(
            "flex min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            errors.note &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
          {...register("note")}
        />
        {errors.note?.message && (
          <p
            id="note-error"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.note.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || !isReady}
        className="w-full font-semibold"
        data-testid="checkout-submit-button"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Đang xử lý đặt hàng...</span>
          </>
        ) : !isReady ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Đang chuẩn bị...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <span>Xác nhận đặt hàng</span>
          </>
        )}
      </Button>
    </form>
  );
}
