import { describe, expect, it } from "vitest";
import { createEntitlementReader } from "../add-product-entitlement";

describe("plan card entitlement reader", () => {
  it("shares the read across cards within one session", async () => {
    let reads = 0;
    const read = createEntitlementReader(async (key: string) => { reads++; return key; });
    expect(await Promise.all([read("tenant:token"), read("tenant:token")])).toEqual(["tenant:token", "tenant:token"]);
    expect(reads).toBe(1);
  });
  it("isolates sessions and expires the short cache", async () => {
    let reads = 0;
    let now = 0;
    const read = createEntitlementReader(async (key: string) => { reads++; return key; }, () => now);
    await read("a:token");
    await read("b:token");
    await read("a:token");
    expect(reads).toBe(2);
    now = 6000;
    await read("a:token");
    expect(reads).toBe(3);
  });
  it("does not cache a refused read", async () => {
    let reads = 0;
    const read = createEntitlementReader(async () => { if (++reads === 1) throw new Error("network"); return true; });
    await expect(read("a")).rejects.toThrow("network");
    expect(await read("a")).toBe(true);
    expect(reads).toBe(2);
  });
});
