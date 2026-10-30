import { describe, expect, it } from "vitest";
import { checkoutSchema, customerProfileSchema, VALIDATION_MESSAGES } from "@/lib/schemas";

const validCheckoutInput = {
  fullName: "Nguyễn Văn An",
  phone: "0901234567",
  address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
};

describe("checkoutSchema - fullName", () => {
  it.each([
    { description: "standard Vietnamese full name", fullName: "Nguyễn Văn An", expected: "Nguyễn Văn An" },
    { description: "minimum 2 characters", fullName: "An", expected: "An" },
    { description: "maximum 50 characters", fullName: "A".repeat(50), expected: "A".repeat(50) },
    { description: "trims leading and trailing spaces", fullName: "   Trần Thị Bích Ngọc   ", expected: "Trần Thị Bích Ngọc" },
    { description: "trims spaces before checking 2-char minimum", fullName: "   An   ", expected: "An" },
    { description: "trims spaces before checking 50-char maximum", fullName: `  ${"A".repeat(50)}  `, expected: "A".repeat(50) },
  ])("accepts valid fullName: $description", ({ fullName, expected }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      fullName,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe(expected);
    }
  });

  it.each([
    {
      description: "empty string reports required message",
      fullName: "",
      expectedMessage: VALIDATION_MESSAGES.fullName.required,
    },
    {
      description: "whitespace-only string reports required message (not min/format)",
      fullName: "     ",
      expectedMessage: VALIDATION_MESSAGES.fullName.required,
    },
    {
      description: "single character after trimming reports min length message",
      fullName: "   A   ",
      expectedMessage: VALIDATION_MESSAGES.fullName.min,
    },
    {
      description: "single non-letter character reports min length message first (only one issue)",
      fullName: "1",
      expectedMessage: VALIDATION_MESSAGES.fullName.min,
    },
    {
      description: "more than 50 characters reports max length message",
      fullName: "A".repeat(51),
      expectedMessage: VALIDATION_MESSAGES.fullName.max,
    },
    {
      description: "51 non-letter characters reports max length message first (only one issue)",
      fullName: "1".repeat(51),
      expectedMessage: VALIDATION_MESSAGES.fullName.max,
    },
    {
      description: "contains digits reports pattern message",
      fullName: "Nguyễn Văn 123",
      expectedMessage: VALIDATION_MESSAGES.fullName.pattern,
    },
    {
      description: "contains special characters reports pattern message",
      fullName: "Nguyễn @ An",
      expectedMessage: VALIDATION_MESSAGES.fullName.pattern,
    },
  ])("rejects invalid fullName ($description) with exact Vietnamese message and single issue", ({ fullName, expectedMessage }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      fullName,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path[0] === "fullName");
      expect(issues).toHaveLength(1);
      expect(issues[0]?.message).toBe(expectedMessage);
    }
  });
});

describe("checkoutSchema - phone", () => {
  it.each([
    { description: "03 prefix with 10 digits", phone: "0321234567", expected: "0321234567" },
    { description: "05 prefix with 10 digits", phone: "0561234567", expected: "0561234567" },
    { description: "07 prefix with 10 digits", phone: "0701234567", expected: "0701234567" },
    { description: "08 prefix with 10 digits", phone: "0811234567", expected: "0811234567" },
    { description: "09 prefix with 10 digits (0901234567)", phone: "0901234567", expected: "0901234567" },
    { description: "trims leading and trailing spaces", phone: "  0901234567  ", expected: "0901234567" },
  ])("accepts valid phone: $description", ({ phone, expected }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      phone,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe(expected);
    }
  });

  it.each([
    {
      description: "empty string reports required message (not format)",
      phone: "",
      expectedMessage: VALIDATION_MESSAGES.phone.required,
    },
    {
      description: "whitespace-only string reports required message (not format)",
      phone: "    ",
      expectedMessage: VALIDATION_MESSAGES.phone.required,
    },
    {
      description: "too short (12345)",
      phone: "12345",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "invalid prefix 01 (0123456789)",
      phone: "0123456789",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "invalid prefix 02",
      phone: "0212345678",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "invalid prefix 04",
      phone: "0412345678",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "invalid prefix 06",
      phone: "0612345678",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "+84 international format (+84901234567)",
      phone: "+84901234567",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "9 digits (090123456)",
      phone: "090123456",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "11 digits (09012345678)",
      phone: "09012345678",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "contains letters (090123456a)",
      phone: "090123456a",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
  ])("rejects invalid phone ($description) with exact Vietnamese message and single issue", ({ phone, expectedMessage }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      phone,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path[0] === "phone");
      expect(issues).toHaveLength(1);
      expect(issues[0]?.message).toBe(expectedMessage);
    }
  });
});

describe("checkoutSchema - address", () => {
  it.each([
    {
      description: "standard Vietnamese address",
      address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
      expected: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    },
    {
      description: "minimum 10 characters",
      address: "123 Lê Lợi",
      expected: "123 Lê Lợi",
    },
    {
      description: "maximum 200 characters",
      address: "A".repeat(200),
      expected: "A".repeat(200),
    },
    {
      description: "trims leading and trailing spaces",
      address: "   123 Lê Lợi   ",
      expected: "123 Lê Lợi",
    },
    {
      description: "trims spaces before checking 200-char maximum",
      address: `   ${"A".repeat(200)}   `,
      expected: "A".repeat(200),
    },
  ])("accepts valid address: $description", ({ address, expected }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      address,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe(expected);
    }
  });

  it.each([
    {
      description: "empty string reports required message (not min length)",
      address: "",
      expectedMessage: VALIDATION_MESSAGES.address.required,
    },
    {
      description: "whitespace-only string reports required message (not min length)",
      address: "          ",
      expectedMessage: VALIDATION_MESSAGES.address.required,
    },
    {
      description: "fewer than 10 characters after trimming (9 chars)",
      address: "   123456789   ",
      expectedMessage: VALIDATION_MESSAGES.address.min,
    },
    {
      description: "more than 200 characters (201 chars)",
      address: "A".repeat(201),
      expectedMessage: VALIDATION_MESSAGES.address.max,
    },
  ])("rejects invalid address ($description) with exact Vietnamese message and single issue", ({ address, expectedMessage }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      address,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path[0] === "address");
      expect(issues).toHaveLength(1);
      expect(issues[0]?.message).toBe(expectedMessage);
    }
  });
});

describe("checkoutSchema - note", () => {
  it.each([
    { description: "omitted note (undefined)", note: undefined, expected: undefined },
    { description: "empty string note", note: "", expected: "" },
    { description: "short delivery note", note: "Ít cay, giao tại sảnh", expected: "Ít cay, giao tại sảnh" },
    { description: "maximum 200 characters", note: "G".repeat(200), expected: "G".repeat(200) },
    { description: "trims leading and trailing spaces", note: "  Không hành  ", expected: "Không hành" },
  ])("accepts valid optional note: $description", ({ note, expected }) => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      ...(note !== undefined ? { note } : {}),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe(expected);
    }
  });

  it("rejects note longer than 200 characters with exact Vietnamese message and single issue", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckoutInput,
      note: "G".repeat(201),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path[0] === "note");
      expect(issues).toHaveLength(1);
      expect(issues[0]?.message).toBe(VALIDATION_MESSAGES.note.max);
    }
  });
});

describe("Customer Profile schema (customerProfileSchema)", () => {
  it.each([
    {
      description: "shared required fields only (optional email and avatarUrl omitted)",
      input: {
        fullName: "  Lê Hoàng Nam  ",
        phone: "  0987654321  ",
        address: "  456 Điện Biên Phủ, Quận 3, TP.HCM  ",
      },
      expected: {
        fullName: "Lê Hoàng Nam",
        phone: "0987654321",
        address: "456 Điện Biên Phủ, Quận 3, TP.HCM",
      },
    },
    {
      description: "with valid email and avatarUrl",
      input: {
        ...validCheckoutInput,
        email: "  nam.le@example.com  ",
        avatarUrl: "  https://example.com/avatars/nam.webp  ",
      },
      expected: {
        ...validCheckoutInput,
        email: "nam.le@example.com",
        avatarUrl: "https://example.com/avatars/nam.webp",
      },
    },
    {
      description: "with empty string optional email and avatarUrl",
      input: {
        ...validCheckoutInput,
        email: "",
        avatarUrl: "",
      },
      expected: {
        ...validCheckoutInput,
        email: "",
        avatarUrl: "",
      },
    },
  ])("accepts valid Customer Profile: $description", ({ input, expected }) => {
    const result = customerProfileSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(expected);
    }
  });

  it.each([
    {
      description: "empty fullName reports required message",
      field: "fullName" as const,
      value: "   ",
      expectedMessage: VALIDATION_MESSAGES.fullName.required,
    },
    {
      description: "short fullName reports min message",
      field: "fullName" as const,
      value: "A",
      expectedMessage: VALIDATION_MESSAGES.fullName.min,
    },
    {
      description: "long fullName reports max message",
      field: "fullName" as const,
      value: "A".repeat(51),
      expectedMessage: VALIDATION_MESSAGES.fullName.max,
    },
    {
      description: "invalid fullName characters reports pattern message",
      field: "fullName" as const,
      value: "Nguyễn 99",
      expectedMessage: VALIDATION_MESSAGES.fullName.pattern,
    },
    {
      description: "empty phone reports required message",
      field: "phone" as const,
      value: "",
      expectedMessage: VALIDATION_MESSAGES.phone.required,
    },
    {
      description: "invalid phone (+84901234567) reports invalid message",
      field: "phone" as const,
      value: "+84901234567",
      expectedMessage: VALIDATION_MESSAGES.phone.invalid,
    },
    {
      description: "empty address reports required message",
      field: "address" as const,
      value: "   ",
      expectedMessage: VALIDATION_MESSAGES.address.required,
    },
    {
      description: "short address reports min message",
      field: "address" as const,
      value: "Ngắn",
      expectedMessage: VALIDATION_MESSAGES.address.min,
    },
    {
      description: "long address reports max message",
      field: "address" as const,
      value: "Đ".repeat(201),
      expectedMessage: VALIDATION_MESSAGES.address.max,
    },
    {
      description: "invalid email without @ reports email invalid message",
      field: "email" as const,
      value: "khong-phai-email",
      expectedMessage: VALIDATION_MESSAGES.email.invalid,
    },
    {
      description: "invalid email without domain reports email invalid message",
      field: "email" as const,
      value: "user@",
      expectedMessage: VALIDATION_MESSAGES.email.invalid,
    },
    {
      description: "invalid avatarUrl without protocol reports avatarUrl invalid message",
      field: "avatarUrl" as const,
      value: "not-a-valid-url",
      expectedMessage: VALIDATION_MESSAGES.avatarUrl.invalid,
    },
  ])("rejects invalid Customer Profile field $field ($description) with exact Vietnamese message and single issue", ({ field, value, expectedMessage }) => {
    const result = customerProfileSchema.safeParse({
      ...validCheckoutInput,
      [field]: value,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path[0] === field);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.message).toBe(expectedMessage);
    }
  });
});

describe("first-failing-rule invariant across all fields", () => {
  it("reports exactly one issue per field when every checkoutSchema field is empty", () => {
    const result = checkoutSchema.safeParse({
      fullName: "",
      phone: "   ",
      address: "",
      note: "N".repeat(205),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => ({ field: i.path[0], message: i.message }))).toEqual([
        { field: "fullName", message: VALIDATION_MESSAGES.fullName.required },
        { field: "phone", message: VALIDATION_MESSAGES.phone.required },
        { field: "address", message: VALIDATION_MESSAGES.address.required },
        { field: "note", message: VALIDATION_MESSAGES.note.max },
      ]);
    }
  });

  it("reports only the first failing rule per field in customerProfileSchema when multiple rules fail simultaneously", () => {
    const result = customerProfileSchema.safeParse({
      fullName: "1",
      phone: "",
      address: "   ",
      email: "bad-email",
      avatarUrl: "bad-url",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => ({ field: i.path[0], message: i.message }))).toEqual([
        { field: "fullName", message: VALIDATION_MESSAGES.fullName.min },
        { field: "phone", message: VALIDATION_MESSAGES.phone.required },
        { field: "address", message: VALIDATION_MESSAGES.address.required },
        { field: "email", message: VALIDATION_MESSAGES.email.invalid },
        { field: "avatarUrl", message: VALIDATION_MESSAGES.avatarUrl.invalid },
      ]);
    }
  });
});

