import { describe, expect, it } from "vitest";
import { createClinicRoute, newClinicDestination, wantsNewClinic, rememberClinicDestination, getClinicDestination, loginClinicDestination } from "../new-clinic";

describe("new clinic intent", () => {
  it("does not replace an explicit existing-clinic billing destination with stale creation intent", () => {
    rememberClinicDestination("/criar-clinica?plan=precheck_basic");
    expect(loginClinicDestination("/app/billing")).toBeNull();
    expect(loginClinicDestination(null)).toBe("/criar-clinica?plan=precheck_basic");
    expect(loginClinicDestination("/criar-clinica?plan=precheck_start")).toBe("/criar-clinica?plan=precheck_start");
  });
  it("recognizes only the explicit creation gesture, independently of clinic session", () => {
    expect(wantsNewClinic(new URLSearchParams("intencao=nova-clinica&origem=console-acesso-revogado"))).toBe(true);
    expect(wantsNewClinic(new URLSearchParams("origem=console"))).toBe(false);
    expect(createClinicRoute("precheck_basic", ["precheck_basic"])).toBe("/criar-clinica?plan=precheck_basic&catalog=precheck_basic");
  });
  it("preserves only non-sensitive, same-origin creation destination across reset", () => {
    rememberClinicDestination("/criar-clinica?plan=precheck_basic&token=secret&email=person%40example.com");
    expect(getClinicDestination()).toBe("/criar-clinica?plan=precheck_basic");
    expect(newClinicDestination("//evil.test/criar-clinica")).toBeNull();
    expect(newClinicDestination("/criar-clinica?next=https://evil.test&reset_token=secret")).toBe("/criar-clinica");
    expect(newClinicDestination("/app/billing?tenant=old")).toBeNull();
  });
});
