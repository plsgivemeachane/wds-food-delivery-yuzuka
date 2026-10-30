import { z } from "zod";

export const FULL_NAME_REGEX = /^[\p{L}\p{M}\s]+$/u;
export const PHONE_REGEX = /^0[35789]\d{8}$/;

export const VALIDATION_MESSAGES = {
  fullName: {
    required: "Vui lòng nhập họ và tên",
    min: "Họ và tên phải có ít nhất 2 ký tự",
    max: "Họ và tên không được vượt quá 50 ký tự",
    pattern: "Họ và tên chỉ được chứa chữ cái và khoảng trắng",
  },
  phone: {
    required: "Vui lòng nhập số điện thoại",
    invalid: "Số điện thoại không hợp lệ",
  },
  address: {
    required: "Vui lòng nhập địa chỉ giao hàng",
    min: "Địa chỉ phải có ít nhất 10 ký tự",
    max: "Địa chỉ không được vượt quá 200 ký tự",
  },
  note: {
    max: "Ghi chú không được vượt quá 200 ký tự",
  },
  email: {
    invalid: "Email không hợp lệ",
  },
  avatarUrl: {
    invalid: "URL ảnh đại diện không hợp lệ",
  },
} as const;

export const fullNameSchema = z
  .string({
    required_error: VALIDATION_MESSAGES.fullName.required,
    invalid_type_error: VALIDATION_MESSAGES.fullName.required,
  })
  .trim()
  .min(1, VALIDATION_MESSAGES.fullName.required)
  .pipe(
    z
      .string()
      .min(2, VALIDATION_MESSAGES.fullName.min)
      .max(50, VALIDATION_MESSAGES.fullName.max),
  )
  .pipe(z.string().regex(FULL_NAME_REGEX, VALIDATION_MESSAGES.fullName.pattern));

export const phoneSchema = z
  .string({
    required_error: VALIDATION_MESSAGES.phone.required,
    invalid_type_error: VALIDATION_MESSAGES.phone.required,
  })
  .trim()
  .min(1, VALIDATION_MESSAGES.phone.required)
  .pipe(z.string().regex(PHONE_REGEX, VALIDATION_MESSAGES.phone.invalid));

export const addressSchema = z
  .string({
    required_error: VALIDATION_MESSAGES.address.required,
    invalid_type_error: VALIDATION_MESSAGES.address.required,
  })
  .trim()
  .min(1, VALIDATION_MESSAGES.address.required)
  .pipe(
    z
      .string()
      .min(10, VALIDATION_MESSAGES.address.min)
      .max(200, VALIDATION_MESSAGES.address.max),
  );

export const noteSchema = z
  .string({
    invalid_type_error: VALIDATION_MESSAGES.note.max,
  })
  .trim()
  .max(200, VALIDATION_MESSAGES.note.max)
  .optional();

export const emailSchema = z
  .string({
    invalid_type_error: VALIDATION_MESSAGES.email.invalid,
  })
  .trim()
  .pipe(
    z.union([
      z.literal(""),
      z.string().email(VALIDATION_MESSAGES.email.invalid),
    ]),
  )
  .optional();

export const avatarUrlSchema = z
  .string({
    invalid_type_error: VALIDATION_MESSAGES.avatarUrl.invalid,
  })
  .trim()
  .pipe(
    z.union([
      z.literal(""),
      z.string().url(VALIDATION_MESSAGES.avatarUrl.invalid),
    ]),
  )
  .optional();

/**
 * Validation schema for Customer delivery details at checkout.
 */
export const checkoutSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  address: addressSchema,
  note: noteSchema,
});

/**
 * Validation schema for Customer Profile details.
 * Reuses the shared fullName, phone, and address rules and adds optional email and avatarUrl.
 */
export const customerProfileSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  address: addressSchema,
  email: emailSchema,
  avatarUrl: avatarUrlSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutFormValues = CheckoutInput;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type CustomerProfileInput = CustomerProfile;
