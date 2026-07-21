"use client";
// InviteProfessionalModal — owner-only "Convidar profissional" form
// (nome/email/especialidade) -> POST /doctor/professionals/invites -> shows a
// copyable invite_link + "convite enviado por email" note (Feature C3).
// Reuses the shared portal Modal (app/(site)/_components/Modal.tsx) and its
// PortalShell.css — imported directly here since this route never otherwise
// pulls that stylesheet in.

import { useState } from "react";
import { Modal } from "../../../_components/Modal";
import { Field, TextInput } from "../../_shared/ui";
import {
  createProfessionalInvite,
  ManageApiError,
  type Session,
} from "@/lib/manage-api";
import "../../../_components/PortalShell.css";

type InviteProfessionalModalProps = {
  session: Session;
  open: boolean;
  onClose: () => void;
  // Caller refetches the roster so the new (pending) professional shows up.
  onInvited: () => void;
};

export function InviteProfessionalModal({ session, open, onClose, onInvited }: InviteProfessionalModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setSpecialty("");
    setError(null);
    setInviteLink(null);
    setCopied(false);
  }

  function handleClose() {
    if (submitting) return;
    const hadInvite = inviteLink !== null;
    reset();
    onClose();
    if (hadInvite) onInvited(); // refresh the roster once the owner is done reading the link
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await createProfessionalInvite(session, {
        name: name.trim(),
        email: email.trim(),
        specialty: specialty.trim() || null,
      });
      setInviteLink(result.invite_link);
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      setError(
        status === 409
          ? "Esse e-mail já está cadastrado na Brain."
          : "Não foi possível criar o convite agora. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the link is still selectable text.
    }
  }

  return (
    <Modal open={open} title="Convidar profissional" onClose={handleClose}>
      {inviteLink ? (
        <div>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft, #555)", marginBottom: 12 }}>
            Convite criado e enviado por e-mail. Você também pode copiar o link abaixo e enviar
            diretamente.
          </p>
          <div className="pfield">
            <label>Link do convite</label>
            <input readOnly value={inviteLink} onFocus={(e) => e.target.select()} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn btn--outline" onClick={copyLink}>
              {copied ? "Copiado!" : "Copiar link"}
            </button>
            <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={handleClose}>
              Concluir
            </button>
          </div>
        </div>
      ) : (
        <div>
          <Field label="Nome">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dra. Camila Nogueira"
              autoFocus
            />
          </Field>
          <div style={{ marginTop: 14 }}>
            <Field label="E-mail">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camila@clinica.com.br"
              />
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Especialidade (opcional)">
              <TextInput
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Clínica geral, Cardiologia…"
              />
            </Field>
          </div>

          {error && (
            <p role="alert" style={{ fontSize: 12.5, color: "var(--danger, #c0392b)", marginTop: 14 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn--ghost" onClick={handleClose} disabled={submitting}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              onClick={handleSubmit}
              disabled={submitting || !name.trim() || !email.trim()}
            >
              {submitting ? "Enviando…" : "Enviar convite"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
