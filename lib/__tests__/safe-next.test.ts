import { describe, expect, it } from "vitest";

import { postLoginRoute, safeNextPath } from "../safe-next";

// Values as `useSearchParams().get("next")` hands them over: already decoded ONCE.
describe("safeNextPath", () => {
  it.each([
    ["/#planos"],
    ["/doctor/dashboard"],
    ["/?origem=console#planos"],
    ["/app?checkout=success"],
  ])("accepts the same-origin relative path %s unchanged", (value) => {
    expect(safeNextPath(value)).toBe(value);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty", ""],
    ["absolute https", "https://evil.com"],
    ["absolute http", "http://evil.com/#planos"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html,<script>alert(1)</script>"],
    ["relative without slash", "evil.com"],
    ["protocol-relative", "//evil.com"],
    ["triple slash", "///evil.com"],
    ["backslash after slash", "/\\evil.com"],
    ["leading backslashes", "\\\\evil.com"],
    ["encoded double slash", "/%2F%2Fevil.com"],
    ["encoded without leading slash", "%2F%2Fevil.com"],
    ["double-encoded double slash", "/%252F%252Fevil.com"],
    ["encoded backslash", "/%5Cevil.com"],
    ["tab (browsers strip it)", "/\t/evil.com"],
    ["encoded tab", "/%09/evil.com"],
    ["newline", "/\n/evil.com"],
    ["malformed percent", "/%E0%A4%A"],
    ["quadruple-encoded", "/%25252F%25252Fevil.com"],
    ["too long", "/" + "a".repeat(600)],
  ])("rejects %s", (_label, value) => {
    expect(safeNextPath(value)).toBeNull();
  });
});

describe("postLoginRoute", () => {
  it("follows a safe next for any role", () => {
    expect(postLoginRoute("doctor", "/#planos")).toBe("/#planos");
    expect(postLoginRoute("manager", "/#planos")).toBe("/#planos");
  });

  it("falls back to the role home when next is absent or hostile", () => {
    expect(postLoginRoute("admin", null)).toBe("/admin/dashboard");
    expect(postLoginRoute("doctor", null)).toBe("/doctor/dashboard");
    expect(postLoginRoute("manager", "//evil.com")).toBe("/doctor/dashboard");
    expect(postLoginRoute("admin", "https://evil.com")).toBe("/admin/dashboard");
  });
});
