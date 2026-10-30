import { expect, test } from "@playwright/test";

test("Trang chủ hiển thị nội dung tiếng Việt, Header, Footer và không bị tràn ngang", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toContainText("Bếp Phố Giao Nhanh");
  await expect(
    page.getByRole("heading", { level: 1 })
  ).toContainText("Món ngon chuẩn vị Việt");
  await expect(page.getByRole("contentinfo")).toContainText(
    "Bếp Phố Giao Nhanh"
  );

  const hasOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });
  expect(hasOverflow).toBe(false);
});
