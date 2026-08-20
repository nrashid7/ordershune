import { describe, expect, it } from "vitest";
import {
  desktopNavItems,
  mobileNavItems,
  secondaryNavItems,
} from "@/components/dashboard/navigation";

describe("dashboard navigation", () => {
  it("keeps the mobile primary bar focused on five core destinations", () => {
    expect(mobileNavItems).toHaveLength(5);
    expect(mobileNavItems.map((item) => item.label)).toEqual([
      "Home",
      "Orders",
      "Inbox",
      "Customers",
      "More",
    ]);
    expect(mobileNavItems.map((item) => item.href)).not.toEqual(
      expect.arrayContaining(["/cod", "/notifications", "/settings/profile"])
    );
  });

  it("keeps operational destinations available outside the mobile primary bar", () => {
    expect(desktopNavItems.map((item) => item.href)).toEqual(
      expect.arrayContaining(["/cod", "/notifications", "/settings/profile"])
    );
    expect(secondaryNavItems.map((item) => item.href)).toEqual([
      "/cod",
      "/notifications",
      "/settings/profile",
    ]);
  });
});
