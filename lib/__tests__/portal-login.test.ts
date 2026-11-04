import { describe, expect, it } from "vitest";

import { LOCAL_LOGIN_PATH, portalLoginHref } from "../portal-login";

describe("portalLoginHref", () => {
  it("points at the portal's login page", () => {
    expect(portalLoginHref("https://portal.example.com")).toBe("https://portal.example.com/login/");
  });

  it("does not double the slash when the base ends with one", () => {
    expect(portalLoginHref("https://portal.example.com/")).toBe("https://portal.example.com/login/");
  });

  it.each([[""], ["   "], [null], [undefined], ["not a url"], ["javascript:alert(1)"], ["https://user:pw@portal.example.com"]])(
    "falls back to this app's own login for %j",
    (base) => {
      expect(portalLoginHref(base)).toBe(LOCAL_LOGIN_PATH);
    },
  );
});
