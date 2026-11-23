const SESSION_KEY = "nubanko-demo-session";
const ACCOUNTS_KEY = "nubanko-demo-accounts";

function normalizeEmail(email) {
  return email.trim().toLocaleLowerCase("pt-BR");
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value) {
  return new Uint8Array(value.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)));
}

async function passwordDigest(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Este navegador não oferece suporte à validação segura da senha.");
  }
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const digest = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(new Uint8Array(digest));
}

async function createPasswordRecord(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Este navegador não oferece suporte à validação segura da senha.");
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return {
    passwordSalt: toHex(salt),
    passwordHash: await passwordDigest(password, salt),
  };
}

function readAccounts() {
  try {
    const saved = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!saved) return { accounts: [], error: "" };
    const accounts = JSON.parse(saved);
    if (!Array.isArray(accounts) || accounts.some((account) => !account.email || !account.passwordHash || !account.passwordSalt)) {
      throw new Error("O cadastro local não tem o formato esperado.");
    }
    return { accounts, error: "" };
  } catch (error) {
    console.error("Não foi possível carregar as contas demonstrativas.", error);
    return { accounts: [], error: "Não foi possível acessar as contas salvas neste navegador." };
  }
}

export async function authenticate(email, password) {
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;

  if (demoEmail && demoPassword &&
      normalizeEmail(email) === normalizeEmail(demoEmail) &&
      password === demoPassword) {
    return startSession(demoEmail);
  }

  const stored = readAccounts();
  if (stored.error) return { ok: false, reason: "account-storage" };

  try {
    const account = stored.accounts.find((item) => item.email === normalizeEmail(email));
    const digest = account
      ? await passwordDigest(password, fromHex(account.passwordSalt))
      : "";
    if (account && account.passwordHash === digest) return startSession(account.email);
  } catch (error) {
    console.error("Não foi possível validar a senha da conta demonstrativa.", error);
    return { ok: false, reason: "password-validation" };
  }

  return {
    ok: false,
    reason: demoEmail && demoPassword ? "invalid-credentials" : "configuration",
  };
}

export async function registerAccount(email, password, confirmation) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, reason: "invalid-email" };
  }
  if (password.length < 8) return { ok: false, reason: "weak-password" };
  if (password !== confirmation) return { ok: false, reason: "password-mismatch" };

  const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
  if (demoEmail && normalizedEmail === normalizeEmail(demoEmail)) {
    return { ok: false, reason: "reserved-email" };
  }

  const stored = readAccounts();
  if (stored.error) return { ok: false, reason: "account-storage" };
  if (stored.accounts.some((account) => account.email === normalizedEmail)) {
    return { ok: false, reason: "email-in-use" };
  }

  try {
    const passwordRecord = await createPasswordRecord(password);
    window.localStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify([...stored.accounts, { email: normalizedEmail, ...passwordRecord }]),
    );
  } catch (error) {
    console.error("Não foi possível criar a conta demonstrativa.", error);
    return { ok: false, reason: "registration-failed" };
  }

  return startSession(normalizedEmail);
}

export function hasSession() {
  return window.sessionStorage.getItem(SESSION_KEY) === "authenticated";
}

function startSession(email) {
  try {
    window.sessionStorage.setItem("nubanko-demo-email", normalizeEmail(email));
    window.sessionStorage.setItem(SESSION_KEY, "authenticated");
    return { ok: true };
  } catch (error) {
    console.error("Não foi possível iniciar a sessão demonstrativa.", error);
    return { ok: false, reason: "session-storage" };
  }
}

export function getSessionEmail() {
  return window.sessionStorage.getItem("nubanko-demo-email");
}

export function startDemoSession() {
  return startSession("demo@nubanko.local");
}

export function endSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem("nubanko-demo-email");
}
