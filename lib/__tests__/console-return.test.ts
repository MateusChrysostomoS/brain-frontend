import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  consoleReturnFor,
  consoleReturnPath,
  normalizeBrainMessageUrl,
  returnToFromOrigem,
  withConsoleOrigin,
} from "../console-return";

const BASE = "https://msg.example.com";

describe("consoleReturnPath", () => {
  it("goes to /anamneses/ only when the purchase carried PreCheck", () => {
    expect(consoleReturnPath("precheck")).toBe("/anamneses/");
    expect(consoleReturnPath(null)).toBe("/");
    expect(consoleReturnPath("secretaria")).toBe("/");
  });

  it("never echoes the query value into the path", () => {
    expect(consoleReturnPath("../../evil")).toBe("/");
    expect(consoleReturnPath("//evil.com")).toBe("/");
  });
});

describe("normalizeBrainMessageUrl", () => {
  it.each([
    [BASE, BASE],
    [`${BASE}/`, BASE],
    [`${BASE}///`, BASE],
    ["http://localhost:3000", "http://localhost:3000"],
  ])("normalizes %s", (raw, expected) => {
    expect(normalizeBrainMessageUrl(raw)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    "",
    "   ",
    "msg.example.com",
    "javascript:alert(1)",
    "ftp://msg.example.com",
    "https://user:pw@msg.example.com",
    "https://msg.example.com/?x=1",
    "https://msg.example.com/#frag",
  ])("rejects %s", (raw) => {
    expect(normalizeBrainMessageUrl(raw)).toBeNull();
  });
});

describe("consoleReturnFor", () => {
  it("redirects to the console home or /anamneses/", () => {
    expect(consoleReturnFor({ origem: "console", produto: "precheck", baseUrl: BASE })).toEqual({
      kind: "redirect",
      href: `${BASE}/anamneses/`,
    });
    expect(consoleReturnFor({ origem: "console", produto: null, baseUrl: `${BASE}/` })).toEqual({
      kind: "redirect",
      href: `${BASE}/`,
    });
  });

  it("stays on the page (with a link) when the env var is unset or invalid", () => {
    for (const baseUrl of ["", undefined, "javascript:alert(1)"]) {
      expect(consoleReturnFor({ origem: "console", produto: "precheck", baseUrl })).toEqual({
        kind: "stay",
        why: "no-base-url",
      });
    }
  });

  it("does nothing without origem=console (the ordinary cold-signup flow)", () => {
    for (const origem of [null, "", "Console", "other", "//evil.com", "https://evil.com"]) {
      expect(consoleReturnFor({ origem, produto: "precheck", baseUrl: BASE })).toEqual({
        kind: "none",
      });
    }
  });

  it("builds the target only from the env base and a fixed path (no open redirect)", () => {
    const back = consoleReturnFor({
      origem: "console",
      produto: "https://evil.com",
      baseUrl: BASE,
    });
    expect(back).toEqual({ kind: "redirect", href: `${BASE}/` });
  });
});

describe("returnToFromOrigem", () => {
  it("only forwards the allowlisted keyword", () => {
    expect(returnToFromOrigem("console")).toBe("console");
    for (const v of [null, undefined, "", "Console", "https://evil.com", "console&x=1"]) {
      expect(returnToFromOrigem(v)).toBeUndefined();
    }
  });
});

describe("withConsoleOrigin", () => {
  it("carries origem=console into a safe next path, before the hash", () => {
    expect(withConsoleOrigin("/#planos", "console")).toBe("/?origem=console#planos");
    expect(withConsoleOrigin("/precos?x=1#planos", "console")).toBe(
      "/precos?x=1&origem=console#planos",
    );
  });

  it("leaves the route alone otherwise", () => {
    expect(withConsoleOrigin("/#planos", null)).toBe("/#planos");
    expect(withConsoleOrigin("/#planos", "other")).toBe("/#planos");
    expect(withConsoleOrigin("/doctor/dashboard", "console")).toBe(
      "/doctor/dashboard?origem=console",
    );
    expect(withConsoleOrigin("/?origem=console#planos", "console")).toBe("/?origem=console#planos");
  });

  it("never turns an unsafe route into something followable", () => {
    expect(withConsoleOrigin("//evil.com", "console")).toBe("//evil.com");
    expect(withConsoleOrigin("https://evil.com", "console")).toBe("https://evil.com");
  });
});

describe("NEXT_PUBLIC_BRAIN_MESSAGE_URL", () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), "utf8");

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function returnWithBuildValue(value: string | undefined) {
    vi.stubEnv("NEXT_PUBLIC_BRAIN_MESSAGE_URL", value);
    vi.resetModules();
    const module = await import("../console-return");
    return module.consoleReturnFor({ origem: "console", produto: "precheck", baseUrl: module.BRAIN_MESSAGE_URL });
  }

  it("returns a PreCheck purchase to the verified production console when no override is set", async () => {
    expect(await returnWithBuildValue(undefined)).toEqual({
      kind: "redirect",
      href: "https://precheckv2-brain-message-frontend.cpux9k.easypanel.host/anamneses/",
    });
  });

  it("preserves an explicitly empty override as the return kill switch", async () => {
    expect(await returnWithBuildValue("")).toEqual({ kind: "stay", why: "no-base-url" });
  });

  it("uses a custom console origin when supplied at build time", async () => {
    expect(await returnWithBuildValue("https://qa.example.com")).toEqual({
      kind: "redirect", href: "https://qa.example.com/anamneses/",
    });
  });

  it("returns a purchase to production with the Docker build default", async () => {
    const dockerfile = read("Dockerfile");
    const value = dockerfile.match(/^ARG NEXT_PUBLIC_BRAIN_MESSAGE_URL=(.*)\r?$/m)?.[1].trim();
    expect(value).toBeDefined();
    expect(await returnWithBuildValue(value)).toEqual({
      kind: "redirect",
      href: "https://precheckv2-brain-message-frontend.cpux9k.easypanel.host/anamneses/",
    });
    expect(dockerfile).toMatch(/^ENV NEXT_PUBLIC_BRAIN_MESSAGE_URL=\$\{NEXT_PUBLIC_BRAIN_MESSAGE_URL\}\r?$/m);
  });

  it("is read through the literal process.env name Next inlines", () => {
    expect(read("lib/console-return.ts")).toContain("process.env.NEXT_PUBLIC_BRAIN_MESSAGE_URL");
  });
});
