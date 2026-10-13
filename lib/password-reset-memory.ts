// Staff password reset by e-mailed code (TASK-056) — the flow's memory.
//
// SECURITY: the e-mail handed over from /login, the e-mail being reset and the
// single-use reset token live ONLY in these module variables — never in the
// URL (it ends up in history, logs and Referer), sessionStorage, localStorage
// or a cookie. Client-side navigation (next/link, router.push) keeps them; a
// reload wipes them and the steps send the person back to /esqueci_senha.

let handoffEmail = "";
let resetEmail = "";
let resetToken: string | null = null;

export function rememberLoginEmail(email: string): void {
  handoffEmail = email.trim();
}

export function takeLoginEmail(): string {
  const email = handoffEmail;
  handoffEmail = "";
  return email;
}

export function setResetEmail(email: string): void {
  resetEmail = email.trim();
}

export function getResetEmail(): string {
  return resetEmail;
}

export function setResetToken(token: string): void {
  resetToken = token;
}

export function getResetToken(): string | null {
  return resetToken;
}

// Drops the token but keeps the e-mail being reset: called as every screen OUTSIDE the
// new-password step mounts, so leaving that step never leaves a usable token behind
// for the browser's Back button (TASK-056 review F2).
export function forgetResetToken(): void {
  resetToken = null;
}

export function clearResetFlow(): void {
  resetEmail = "";
  resetToken = null;
}

// People paste "123 456" or "123-456"; the server takes 6 ASCII digits.
export function normalizeResetCode(raw: string): string {
  return raw.replace(/[^0-9]/g, "").slice(0, 6);
}

// Same rule as brain-api's SetPasswordIn: 8-72 bytes, at least one letter and one digit.
export function newPasswordError(password: string, confirmation: string): string | null {
  if (password !== confirmation) return "As senhas não coincidem.";
  if (new TextEncoder().encode(password).length > 72) {
    return "A senha está muito longa. Use menos caracteres.";
  }
  if (password.length < 8 || !/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
    return "Use pelo menos 8 caracteres, com uma letra e um número.";
  }
  return null;
}
