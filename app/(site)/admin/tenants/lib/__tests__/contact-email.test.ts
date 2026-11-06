import { describe, expect, it } from "vitest";

import { ManageApiError } from "@/lib/manage-api";

import {
  contactEmailChanged,
  describeContactEmailError,
  describeContactEmailLoadError,
  describeContactEmailSaved,
  describeCurrentContactEmail,
  isSecretariaRecordMissing,
  parseContactEmailInput,
} from "../contact-email";

describe("parseContactEmailInput", () => {
  it("trims and lowercases a valid address", () => {
    expect(parseContactEmailInput("  Clinica@Exemplo.COM.br ")).toEqual({
      ok: true,
      value: "clinica@exemplo.com.br",
    });
  });

  it("reads an empty or blank field as 'clear the e-mail'", () => {
    expect(parseContactEmailInput("")).toEqual({ ok: true, value: null });
    expect(parseContactEmailInput("   ")).toEqual({ ok: true, value: null });
  });

  it("refuses text that is not an e-mail address, with a plain message", () => {
    for (const raw of [
      "sem-arroba",
      "a@b",
      "a@@b.com",
      "a b@c.com",
      "@c.com",
      "a@.com",
      "a@c..com",
      "a@c.com.",
      "dois@a.com, tres@b.com",
    ]) {
      expect(parseContactEmailInput(raw)).toEqual({
        ok: false,
        error: "Digite um e-mail válido, como contato@clinica.com.br.",
      });
    }
  });

  it("refuses an address longer than 254 characters", () => {
    const long = `${"a".repeat(250)}@x.com`;
    expect(parseContactEmailInput(long)).toMatchObject({ ok: false });
  });
});

describe("contactEmailChanged", () => {
  it("is false while the field still means the saved value", () => {
    expect(contactEmailChanged("a@b.com", "a@b.com")).toBe(false);
    expect(contactEmailChanged("  A@B.com ", "a@b.com")).toBe(false);
    expect(contactEmailChanged("", null)).toBe(false);
    expect(contactEmailChanged("   ", null)).toBe(false);
  });

  it("is true when the field would change what is stored", () => {
    expect(contactEmailChanged("c@d.com", "a@b.com")).toBe(true);
    expect(contactEmailChanged("a@b.com", null)).toBe(true);
    expect(contactEmailChanged("", "a@b.com")).toBe(true);
  });

  it("treats an unparseable draft as changed so the error can show on submit", () => {
    expect(contactEmailChanged("nope", "a@b.com")).toBe(true);
    expect(contactEmailChanged("nope", null)).toBe(true);
  });
});

describe("describeCurrentContactEmail", () => {
  it("shows the saved address", () => {
    expect(describeCurrentContactEmail("a@b.com")).toBe("a@b.com");
  });

  it("explains what an empty value means for the clinic", () => {
    expect(describeCurrentContactEmail(null)).toBe(
      "Nenhum e-mail cadastrado — a clínica não recebe avisos por e-mail",
    );
  });
});

describe("describeContactEmailSaved", () => {
  it("uses the same verb as the Save button", () => {
    expect(describeContactEmailSaved("a@b.com")).toBe("E-mail salvo");
  });

  it("says plainly when the e-mail was removed", () => {
    expect(describeContactEmailSaved(null)).toBe("E-mail removido");
  });
});

describe("isSecretariaRecordMissing", () => {
  it("matches only the 404 whose detail is secretaria_tenant_not_found", () => {
    expect(isSecretariaRecordMissing(new ManageApiError(404, "secretaria_tenant_not_found"))).toBe(
      true,
    );
    expect(isSecretariaRecordMissing(new ManageApiError(404, "Tenant not found"))).toBe(false);
    expect(isSecretariaRecordMissing(new ManageApiError(502, "secretaria_tenant_not_found"))).toBe(
      false,
    );
    expect(isSecretariaRecordMissing(new Error("x"))).toBe(false);
  });
});

describe("describeContactEmailError", () => {
  it("maps 422 invalid_contact_email to an explicit message", () => {
    expect(describeContactEmailError(new ManageApiError(422, "invalid_contact_email"))).toBe(
      "O servidor não aceitou esse e-mail. Confira o endereço e tente de novo.",
    );
  });

  it("maps 502 secretaria_unavailable to a retry hint", () => {
    expect(describeContactEmailError(new ManageApiError(502, "secretaria_unavailable"))).toBe(
      "Não foi possível falar com a secretarIA agora. Tente de novo em instantes.",
    );
  });

  it("separates the two 404s", () => {
    expect(describeContactEmailError(new ManageApiError(404, "secretaria_tenant_not_found"))).toBe(
      "Esta clínica ainda não existe na secretarIA, então não há e-mail para cadastrar.",
    );
    expect(describeContactEmailError(new ManageApiError(404, "Tenant not found"))).toBe(
      "Clínica não encontrada.",
    );
  });

  it("maps 403 and falls back for anything else", () => {
    expect(describeContactEmailError(new ManageApiError(403, "x"))).toBe(
      "Você não tem permissão para esta ação.",
    );
    expect(describeContactEmailError(new ManageApiError(500, "boom"))).toBe(
      "Não foi possível salvar. Tente novamente.",
    );
    expect(describeContactEmailError(new TypeError("network"))).toBe(
      "Não foi possível salvar. Tente novamente.",
    );
  });
});

describe("describeContactEmailLoadError", () => {
  it("keeps the specific reasons but says 'carregar', not 'salvar'", () => {
    expect(describeContactEmailLoadError(new ManageApiError(502, "secretaria_unavailable"))).toBe(
      "Não foi possível falar com a secretarIA agora. Tente de novo em instantes.",
    );
    expect(describeContactEmailLoadError(new ManageApiError(404, "Tenant not found"))).toBe(
      "Clínica não encontrada.",
    );
    expect(describeContactEmailLoadError(new ManageApiError(500, "boom"))).toBe(
      "Não foi possível carregar o e-mail. Tente novamente.",
    );
  });
});
