import { describe, expect, it } from "vitest";
import { formatVnd } from "@/lib";

describe("formatVnd", () => {
  it("formats integer VND with dot separators and a non-breaking space (U+00A0) before ₫", () => {
    expect(formatVnd(45000)).toBe("45.000\u00A0₫");
    expect(formatVnd(0)).toBe("0\u00A0₫");
    expect(formatVnd(1250000)).toBe("1.250.000\u00A0₫");
  });
});
