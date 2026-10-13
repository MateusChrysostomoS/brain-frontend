import { beforeEach, describe, expect, it, vi } from "vitest";

let mem: typeof import("../password-reset-memory");

beforeEach(async () => {
  vi.resetModules();
  mem = await import("../password-reset-memory");
});

describe("password reset memory", () => {
  it("hands the login e-mail over once", () => {
    mem.rememberLoginEmail("  doc@clinic.com ");
    expect(mem.takeLoginEmail()).toBe("doc@clinic.com");
    expect(mem.takeLoginEmail()).toBe("");
  });

  it("keeps e-mail and token until cleared", () => {
    mem.setResetEmail("doc@clinic.com");
    mem.setResetToken("tok-1");
    expect(mem.getResetEmail()).toBe("doc@clinic.com");
    expect(mem.getResetToken()).toBe("tok-1");
    mem.clearResetFlow();
    expect(mem.getResetEmail()).toBe("");
    expect(mem.getResetToken()).toBeNull();
  });

  it("normalizes pasted codes and mirrors the password rule", () => {
    expect(mem.normalizeResetCode("123 45-6")).toBe("123456");
    expect(mem.newPasswordError("abc12345", "abc12345")).toBeNull();
    expect(mem.newPasswordError("abc12345", "x")).toBe("As senhas não coincidem.");
    expect(mem.newPasswordError("abcdefgh", "abcdefgh")).toMatch(/uma letra e um número/);
  });

  it("never touches web storage", () => {
    const storage = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() };
    (globalThis as any).sessionStorage = storage;
    (globalThis as any).localStorage = storage;
    mem.setResetToken("tok-1");
    mem.rememberLoginEmail("a@b.com");
    mem.setResetEmail("a@b.com");
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

describe("forgetResetToken", () => {
  it("drops only the token, keeping the e-mail being reset", async () => {
    const mem = await import("../password-reset-memory");
    mem.setResetEmail("doc@clinic.com");
    mem.setResetToken("tok-1");
    mem.forgetResetToken();
    expect(mem.getResetToken()).toBeNull();
    expect(mem.getResetEmail()).toBe("doc@clinic.com");
  });
});
