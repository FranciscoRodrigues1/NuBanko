
import React, { useMemo, useState } from "react";

// ========================================
// FORMATAÇÃO DE VALORES
// ========================================

const money = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// ========================================
// CONTAS DEMONSTRATIVAS
// ========================================

const AUTH_STORAGE_KEY = "nubanko-demo-accounts";

function readDemoAccounts() {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!saved) return [];

    const accounts = JSON.parse(saved);

    return Array.isArray(accounts) ? accounts : [];
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
    return [];
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const matches = hex.match(/.{1,2}/g) || [];

  return new Uint8Array(
    matches.map((byte) => parseInt(byte, 16))
  );
}

async function createPasswordRecord(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Recurso de segurança indisponível.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return {
    salt: bytesToHex(salt),
    hash: bytesToHex(new Uint8Array(bits)),
  };
}

async function verifyDemoPassword(password, record) {
  if (!record?.salt || !record?.hash) {
    return false;
  }

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(record.salt),
      iterations: 120000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return (
    bytesToHex(new Uint8Array(bits)) === record.hash
  );
}

// ========================================
// DADOS DE DEMONSTRAÇÃO
// ========================================

const initialTransactions = [
  {
    id: 1,
    type: "receita",
    description: "Salário",
    category: "Salário",
    date: "2026-11-09",
    amount: 2000,
  },
  {
    id: 2,
    type: "despesa",
    description: "Transporte",
    category: "Transporte",
    date: "2026-11-08",
    amount: 150,
  },
  {
    id: 3,
    type: "despesa",
    description: "Alimentação",
    category: "Alimentação",
    date: "2026-11-07",
    amount: 120,
  },
  {
    id: 4,
    type: "despesa",
    description: "Curso online",
    category: "Educação",
    date: "2026-11-05",
    amount: 80,
  },
  {
    id: 5,
    type: "receita",
    description: "Bolsa de estágio",
    category: "Bolsa de estágio",
    date: "2026-11-03",
    amount: 300,
  },
];

const initialGoals = [
  {
    id: 1,
    name: "Comprar notebook",
    saved: 1000,
    target: 2000,
    deadline: "2027-03-30",
    icon: "▣",
  },
  {
    id: 2,
    name: "Fazer uma viagem",
    saved: 300,
    target: 1500,
    deadline: "2027-07-15",
    icon: "✈",
  },
  {
    id: 3,
    name: "Reserva de emergência",
    saved: 600,
    target: 3000,
    deadline: "2027-12-30",
    icon: "◇",
  },
];

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Educação",
  "Lazer",
  "Saúde",
  "Salário",
  "Bolsa de estágio",
  "Renda extra",
  "Outros",
];

// ========================================
// ÍCONES
// ========================================

function Icon({ children }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}

function AuthIcon({ name, size = 19 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const shapes = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),

    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a15 15 0 0 1-3.2 3.7" />
        <path d="M6.2 6.3C3.5 8 2 12 2 12s3.5 6 10 6a10 10 0 0 0 3-.5" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
  };

  return <svg {...common}>{shapes[name]}</svg>;
}

// ========================================
// ESTILOS DO LOGIN E CADASTRO
// ========================================

const AUTH_STYLES = `
.auth-shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100svh;
  background: #fbfaff;
  font-family: "Segoe UI", Arial, sans-serif;
}

.auth-hero {
  position: relative;
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
  padding: clamp(30px, 5vw, 75px);
  color: #fff;
  background: linear-gradient(138deg, #451276, #6500d9 56%, #8a32fa);
  isolation: isolate;
}

.auth-hero::before,
.auth-hero::after {
  position: absolute;
  z-index: -1;
  content: "";
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 50%;
}

.auth-hero::before {
  top: -230px;
  right: -100px;
  width: 430px;
  height: 430px;
}

.auth-hero::after {
  top: -105px;
  right: -24px;
  width: 290px;
  height: 290px;
}

.auth-hero-glow {
  position: absolute;
  z-index: -1;
  border-radius: 36px;
  background: rgba(191,126,255,.15);
  transform: rotate(13deg);
}

.auth-glow-one {
  top: 25%;
  right: -28px;
  width: 155px;
  height: 155px;
}

.auth-glow-two {
  top: 34%;
  right: 92px;
  width: 95px;
  height: 95px;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-brand-mark,
.auth-card-brand-mark {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  font-weight: 850;
}

.auth-brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  color: #6c10dc;
  background: #fff;
  font-size: 29px;
}

.auth-brand-copy,
.auth-card-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.auth-brand-copy strong {
  font-size: 21px;
}

.auth-brand-copy small {
  color: rgba(255,255,255,.83);
  font-size: 10px;
}

.auth-hero-message {
  max-width: 480px;
  margin-top: clamp(54px, 8vh, 90px);
}

.auth-hero-message h1 {
  margin: 0 0 19px;
  color: #fff;
  font-size: clamp(32px, 3.5vw, 44px);
  font-weight: 780;
  line-height: 1.18;
  letter-spacing: -1.4px;
}

.auth-hero-message p {
  max-width: 390px;
  color: rgba(255,255,255,.91);
  font-size: 15px;
  line-height: 1.55;
}

.auth-promo-card {
  width: min(100%, 440px);
  margin-top: clamp(44px, 8vh, 76px);
  padding: 24px 26px;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 17px;
  background: rgba(255,255,255,.13);
  box-shadow: 0 12px 32px rgba(35,0,91,.08);
  backdrop-filter: blur(9px);
}

.auth-promo-card span {
  display: block;
  margin-bottom: 13px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .8px;
}

.auth-promo-card strong {
  display: block;
  font-size: 17px;
  line-height: 1.35;
}

.auth-promo-card p {
  margin: 9px 0 0;
  color: rgba(255,255,255,.88);
  font-size: 11px;
  line-height: 1.5;
}

.auth-hero-footer {
  margin-top: auto;
  padding-top: 28px;
  color: rgba(255,255,255,.61);
  font-size: 10px;
}

.auth-form-area {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px clamp(20px, 4vw, 65px);
  background: #fbfaff;
}

.auth-form-card {
  width: min(100%, 470px);
  padding: 30px 38px 25px;
  border: 1px solid #e9e1f3;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 12px 40px rgba(57,24,93,.04);
}

.auth-card-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  margin-bottom: 29px;
}

.auth-card-brand-mark {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(145deg, #4b00bd, #8d22ff);
  font-size: 26px;
}

.auth-card-brand strong {
  color: #28243d;
  font-size: 20px;
}

.auth-card-brand small {
  color: #88839a;
  font-size: 9px;
}

.auth-heading {
  margin-bottom: 25px;
  text-align: center;
}

.auth-heading h2 {
  margin: 0 0 7px;
  color: #25213c;
  font-size: 25px;
  font-weight: 750;
}

.auth-heading p {
  margin: 0;
  color: #827d94;
  font-size: 12px;
}

.auth-form {
  display: grid;
  gap: 13px;
}

.auth-field {
  display: grid;
  gap: 7px;
  color: #27233c;
  font-size: 10px;
  font-weight: 700;
}

.auth-input-wrap {
  display: flex;
  height: 45px;
  align-items: center;
  gap: 11px;
  padding: 0 12px;
  border: 1px solid #ded5e9;
  border-radius: 10px;
  color: #8a819c;
  background: #fff;
  transition: border-color .18s, box-shadow .18s;
}

.auth-input-wrap:focus-within {
  border-color: #9251ed;
  box-shadow: 0 0 0 3px rgba(139,76,232,.10);
}

.auth-input-wrap input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  color: #373148;
  background: transparent;
  font-size: 12px;
}

.auth-input-wrap input::placeholder {
  color: #a59caf;
}

.auth-visibility {
  display: grid;
  width: 28px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  color: #8d859c;
  background: transparent;
  cursor: pointer;
}

.auth-visibility:hover {
  color: #5c19c7;
}

.auth-forgot-row {
  display: flex;
  justify-content: flex-end;
  margin: 1px 0 5px;
}

.auth-text-link,
.auth-switch button {
  padding: 0;
  border: 0;
  color: #7100ea;
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.auth-text-link:hover,
.auth-switch button:hover {
  color: #4d00ad;
  text-decoration: underline;
}

.auth-error {
  margin: 4px 0;
  color: #c3455a;
  font-size: 10px;
  line-height: 1.45;
}

.auth-submit {
  display: flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  border: 0;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(100deg, #4d00b8, #7100ec 65%, #913bfa);
  box-shadow: 0 7px 17px rgba(107,0,218,.16);
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  transition: filter .18s, transform .18s;
}

.auth-submit:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.auth-submit:disabled {
  cursor: wait;
  opacity: .7;
}

.auth-switch {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-top: 22px;
  padding-top: 17px;
  border-top: 1px solid #eee8f4;
  color: #817b90;
  font-size: 10px;
}

.auth-terms {
  margin: 13px 0 0;
  color: #9d96aa;
  font-size: 9px;
  text-align: center;
}

.auth-demo-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 16px 0 0;
  color: #928b9f;
  font-size: 9px;
  text-align: center;
  line-height: 1.4;
}

.logout-button {
  margin-left: auto;
  padding: 6px 10px;
  border: 1px solid #e9e1f3;
  border-radius: 7px;
  color: #6d4ae8;
  background: #fff;
  font-size: 10px;
  cursor: pointer;
}

.logout-button:hover {
  color: #fff;
  background: #6d4ae8;
}

/* TABLETS */

@media (max-width: 900px) {
  .auth-hero {
    padding-right: 30px;
    padding-left: 30px;
  }

  .auth-form-area {
    padding-right: 20px;
    padding-left: 20px;
  }

  .auth-form-card {
    padding-right: 25px;
    padding-left: 25px;
  }
}

/* CELULARES */

@media (max-width: 760px) {
  .auth-shell {
    display: flex;
    min-height: 100vh;
    min-height: 100svh;
    flex-direction: column;
  }

  .auth-hero {
    min-height: 0;
    height: auto;
    padding: 25px 22px 24px;
  }

  .auth-brand-mark {
    width: 38px;
    height: 38px;
    font-size: 25px;
  }

  .auth-brand-copy strong {
    font-size: 18px;
  }

  .auth-hero-message {
    margin-top: 28px;
  }

  .auth-hero-message h1 {
    margin-bottom: 9px;
    font-size: clamp(27px, 7vw, 34px);
  }

  .auth-hero-message p {
    font-size: 12px;
  }

  .auth-promo-card,
  .auth-hero-footer {
    display: none;
  }

  .auth-form-area {
    flex: 1;
    justify-content: flex-start;
    padding: 23px 18px 30px;
  }

  .auth-form-card {
    width: 100%;
    max-width: 500px;
    padding: 24px 23px 22px;
    border-radius: 18px;
  }

  .auth-card-brand {
    margin-bottom: 20px;
  }

  .auth-heading {
    margin-bottom: 20px;
  }

  .auth-heading h2 {
    font-size: 23px;
  }
}

@media (max-width: 420px) {
  .auth-hero {
    padding: 22px 18px 21px;
  }

  .auth-hero-message {
    margin-top: 23px;
  }

  .auth-hero-message h1 {
    font-size: 27px;
  }

  .auth-hero-message p {
    font-size: 11px;
  }

  .auth-form-area {
    padding: 18px 12px 24px;
  }

  .auth-form-card {
    padding: 22px 17px 20px;
  }

  .auth-input-wrap {
    height: 43px;
  }

  .auth-submit {
    min-height: 44px;
  }
}
`;

// ========================================
// APLICAÇÃO PRINCIPAL
// ========================================

function App() {
  const [page, setPage] = useState("painel");

  const [transactions, setTransactions] = useState(initialTransactions);
  const [goals, setGoals] = useState(initialGoals);

  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState("todos");

  const [form, setForm] = useState({
    type: "receita",
    description: "",
    amount: "",
    category: "Salário",
    date: new Date().toISOString().slice(0, 10),
  });

  const [goalForm, setGoalForm] = useState({
    name: "",
    target: "",
    saved: "0",
    deadline: "",
  });

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [notice, setNotice] = useState("");

  // Estados de autenticação
  const [accounts, setAccounts] = useState(readDemoAccounts);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [userName, setUserName] = useState("");

  // ========================================
  // CÁLCULOS FINANCEIROS
  // ========================================

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const expenseCategories = useMemo(() => {
    const totalsByCategory = {};

    transactions
      .filter((t) => t.type === "despesa")
      .forEach((t) => {
        totalsByCategory[t.category] =
          (totalsByCategory[t.category] || 0) + t.amount;
      });

    return Object.entries(totalsByCategory).sort(
      (a, b) => b[1] - a[1]
    );
  }, [transactions]);

  const visibleTransactions = transactions
    .filter((t) => filter === "todos" || t.type === filter)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  // ========================================
  // AUTENTICAÇÃO DEMONSTRATIVA
  // ========================================

  async function handleAuthentication({
    mode,
    name,
    email,
    password,
  }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Validação da senha
    if (password.length < 6) {
      return {
        ok: false,
        message: "A senha deve ter pelo menos 6 caracteres.",
      };
    }

    // ------------------------------------
    // CADASTRO
    // ------------------------------------

    if (mode === "register") {
      if (!name.trim()) {
        return {
          ok: false,
          message: "Informe seu nome completo.",
        };
      }

      const emailAlreadyExists = accounts.some(
        (account) => account.email === normalizedEmail
      );

      if (emailAlreadyExists) {
        return {
          ok: false,
          message: "Este e-mail já possui cadastro. Entre com sua conta.",
        };
      }

      try {
        const passwordRecord = await createPasswordRecord(password);

        const newAccount = {
          id: Date.now(),
          name: name.trim(),
          email: normalizedEmail,
          passwordRecord,
        };

        const updatedAccounts = [...accounts, newAccount];

        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(updatedAccounts)
        );

        setAccounts(updatedAccounts);
        setUserName(newAccount.name);
        setPage("painel");
        setNotice("Cadastro realizado com sucesso!");
        setIsAuthenticated(true);

        return { ok: true };
      } catch (error) {
        console.error("Erro ao cadastrar conta:", error);

        return {
          ok: false,
          message: "Não foi possível salvar o cadastro neste navegador.",
        };
      }
    }

    // ------------------------------------
    // LOGIN
    // ------------------------------------

    const account = accounts.find(
      (item) => item.email === normalizedEmail
    );

    if (!account) {
      return {
        ok: false,
        message: "E-mail não cadastrado. Clique em Cadastre-se para criar sua conta.",
      };
    }

    try {
      const passwordIsValid = await verifyDemoPassword(
        password,
        account.passwordRecord
      );

      if (!passwordIsValid) {
        return {
          ok: false,
          message: "Senha incorreta. Confira seus dados e tente novamente.",
        };
      }

      setUserName(account.name);
      setPage("painel");
      setNotice("");
      setIsAuthenticated(true);

      return { ok: true };
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);

      return {
        ok: false,
        message: "Não foi possível verificar o acesso. Tente novamente.",
      };
    }
  }

  // ========================================
  // FUNÇÕES DE LANÇAMENTOS
  // ========================================

  function addTransaction(event) {
    event.preventDefault();

    const amount = Number(
      String(form.amount).replace(",", ".")
    );

    if (
      !form.description.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !form.date
    ) {
      setNotice(
        "Preencha a descrição, um valor maior que zero e a data."
      );
      return;
    }

    setTransactions((current) => [
      {
        ...form,
        id: Date.now(),
        description: form.description.trim(),
        amount,
      },
      ...current,
    ]);

    setForm((current) => ({
      ...current,
      description: "",
      amount: "",
    }));

    setNotice("Lançamento adicionado com sucesso.");
    setPage("painel");
  }

  function deleteTransaction(id) {
    setTransactions((current) =>
      current.filter((t) => t.id !== id)
    );

    setNotice("Lançamento excluído.");
  }

  // ========================================
  // FUNÇÕES DE CAIXINHAS
  // ========================================

  function addGoal(event) {
    event.preventDefault();

    const target = Number(
      String(goalForm.target).replace(",", ".")
    );

    const saved = Number(
      String(goalForm.saved).replace(",", ".")
    );

    if (
      !goalForm.name.trim() ||
      !Number.isFinite(target) ||
      target <= 0 ||
      !Number.isFinite(saved) ||
      saved < 0 ||
      !goalForm.deadline
    ) {
      setNotice(
        "Informe nome, valor desejado, valor guardado e prazo válidos."
      );
      return;
    }

    if (saved > target) {
      setNotice(
        "O valor guardado não pode ser maior que o valor desejado."
      );
      return;
    }

    setGoals((current) => [
      ...current,
      {
        ...goalForm,
        id: Date.now(),
        name: goalForm.name.trim(),
        target,
        saved,
        icon: "◎",
      },
    ]);

    setGoalForm({
      name: "",
      target: "",
      saved: "0",
      deadline: "",
    });

    setShowGoalForm(false);
    setNotice("Meta criada com sucesso.");
  }

  function deleteGoal(id) {
    setGoals((current) =>
      current.filter((g) => g.id !== id)
    );

    setNotice("Meta excluída.");
  }

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  const navItems = [
    { id: "painel", label: "Painel", icon: "⌂" },
    { id: "lancamentos", label: "Lançamentos", icon: "＋" },
    { id: "caixinhas", label: "Caixinhas", icon: "◇" },
  ];

  // ========================================
  // LOGIN E CADASTRO
  // ========================================

  if (!isAuthenticated) {
    return (
      <>
        <style>{AUTH_STYLES}</style>

        <AuthScreen
          mode={authMode}
          onModeChange={setAuthMode}
          onAuthenticate={handleAuthentication}
        />
      </>
    );
  }

  // ========================================
  // APLICAÇÃO APÓS O LOGIN
  // ========================================

  return (
    <>
      <style>{AUTH_STYLES}</style>

      <div className="app-shell">
        {/* MENU LATERAL */}

        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">N</span>
            <span>NuBanko</span>
          </div>

          <p className="brand-subtitle">
            Meu Primeiro Salário
          </p>

          <nav aria-label="Navegação principal">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${
                  page === item.id ? "active" : ""
                }`}
                onClick={() => {
                  setPage(item.id);
                  setNotice("");
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-tip">
            <span className="tip-icon">✦</span>
            <strong>Pequenos passos, grandes conquistas.</strong>
            <p>
              Organize hoje para realizar seus planos amanhã.
            </p>
          </div>

          {/* PERFIL E SAIR */}

          <div className="profile">
            <div className="avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{userName}</strong>
              <small>Minha conta</small>
            </div>

            <button
              className="logout-button"
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                setAuthMode("login");
                setPage("painel");
                setNotice("");
              }}
            >
              Voltar ao Login
            </button>
          </div>
        </aside>

        <main className="main-content">
          {/* CABEÇALHO */}

          <header className="topbar">
            <div>
              <span className="eyebrow">
                MEU PRIMEIRO SALÁRIO
              </span>

              <h1>
                {page === "painel"
                  ? `Olá, ${userName}! 👋`
                  : page === "lancamentos"
                  ? "Lançamentos"
                  : "Minhas Caixinhas"}
              </h1>

              <p>
                {page === "painel"
                  ? "Veja como estão suas finanças neste mês."
                  : page === "lancamentos"
                  ? "Registre suas receitas e despesas."
                  : "Defina metas e acompanhe suas conquistas."}
              </p>
            </div>

            <button
              className="icon-button"
              type="button"
              aria-label="Notificações"
            >
              <Icon>♧</Icon>
            </button>
          </header>

          {/* AVISOS */}

          {notice && (
            <div className="notice" role="status">
              {notice}

              <button
                onClick={() => setNotice("")}
                aria-label="Fechar aviso"
                type="button"
              >
                ×
              </button>
            </div>
          )}

          {/* =====================================
              PAINEL FINANCEIRO
          ===================================== */}

          {page === "painel" && (
            <>
              <section className="balance-card">
                <div className="balance-top">
                  <span>Saldo disponível</span>

                  <button
                    type="button"
                    onClick={() =>
                      setShowBalance((value) => !value)
                    }
                    aria-label="Mostrar ou ocultar saldo"
                  >
                    {showBalance ? "◉" : "◎"}
                  </button>
                </div>

                <strong className="balance-value">
                  {showBalance
                    ? money(totals.balance)
                    : "••••••"}
                </strong>

                <span className="balance-caption">
                  Seu resumo financeiro
                </span>
              </section>

              <section className="summary-grid">
                <article className="summary-card income">
                  <div className="summary-icon">↗</div>

                  <div>
                    <span>Receitas do mês</span>
                    <strong>{money(totals.income)}</strong>
                  </div>
                </article>

                <article className="summary-card expense">
                  <div className="summary-icon">↘</div>

                  <div>
                    <span>Despesas do mês</span>
                    <strong>{money(totals.expenses)}</strong>
                  </div>
                </article>
              </section>

              <section className="content-grid">
                {/* GASTOS POR CATEGORIA */}

                <article className="panel category-panel">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        VISÃO DOS GASTOS
                      </span>

                      <h2>Gastos por categoria</h2>
                    </div>
                  </div>

                  {expenseCategories.length === 0 ? (
                    <p className="empty">
                      Ainda não há despesas registradas.
                    </p>
                  ) : (
                    <div className="category-list">
                      {expenseCategories.map(
                        ([name, value], index) => {
                          const percent = totals.expenses
                            ? Math.round(
                                (value / totals.expenses) * 100
                              )
                            : 0;

                          return (
                            <div
                              className="category-row"
                              key={name}
                            >
                              <div className="category-label">
                                <span
                                  className={`dot dot-${index % 5}`}
                                />

                                <span>{name}</span>
                                <strong>{percent}%</strong>
                              </div>

                              <div className="progress-track">
                                <div
                                  className={`progress-fill fill-${index % 5}`}
                                  style={{
                                    width: `${percent}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </article>

                {/* ÚLTIMOS LANÇAMENTOS */}

                <article className="panel recent-panel">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        ATIVIDADE
                      </span>

                      <h2>Últimos lançamentos</h2>
                    </div>

                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setPage("lancamentos")}
                    >
                      Ver todos
                    </button>
                  </div>

                  <TransactionList
                    items={transactions
                      .slice()
                      .sort((a, b) =>
                        b.date.localeCompare(a.date)
                      )
                      .slice(0, 4)}
                    onDelete={deleteTransaction}
                    compact
                  />
                </article>
              </section>
            </>
          )}

          {/* =====================================
              LANÇAMENTOS
          ===================================== */}

          {page === "lancamentos" && (
            <section className="panel form-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    NOVA MOVIMENTAÇÃO
                  </span>

                  <h2>Adicionar lançamento</h2>

                  <p className="muted">
                    Informe os dados para atualizar seu painel financeiro.
                  </p>
                </div>
              </div>

              <form
                onSubmit={addTransaction}
                className="transaction-form"
              >
                <div className="type-switch">
                  <button
                    type="button"
                    className={
                      form.type === "receita"
                        ? "selected income-selected"
                        : ""
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        type: "receita",
                        category: "Salário",
                      })
                    }
                  >
                    ↗ Receita
                  </button>

                  <button
                    type="button"
                    className={
                      form.type === "despesa"
                        ? "selected expense-selected"
                        : ""
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        type: "despesa",
                        category: "Alimentação",
                      })
                    }
                  >
                    ↘ Despesa
                  </button>
                </div>

                <label>
                  Descrição

                  <input
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Ex.: Salário, alimentação, transporte..."
                    maxLength="70"
                    required
                  />
                </label>

                <div className="form-row">
                  <label>
                    Valor (R$)

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          amount: event.target.value,
                        })
                      }
                      placeholder="0,00"
                      required
                    />
                  </label>

                  <label>
                    Categoria

                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          category: event.target.value,
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Data

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        date: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <button
                  className="primary-button"
                  type="submit"
                >
                  ＋ Salvar lançamento
                </button>
              </form>
            </section>
          )}

          {/* =====================================
              CAIXINHAS
          ===================================== */}

          {page === "caixinhas" && (
            <section className="goals-section">
              <div className="goals-intro">
                <div>
                  <span className="eyebrow">
                    SEUS OBJETIVOS
                  </span>

                  <h2>Um objetivo de cada vez.</h2>

                  <p className="muted">
                    Acompanhe o quanto falta para realizar seus planos.
                  </p>
                </div>

                <button
                  className="primary-button create-goal"
                  type="button"
                  onClick={() =>
                    setShowGoalForm((value) => !value)
                  }
                >
                  ＋ Criar nova meta
                </button>
              </div>

              {showGoalForm && (
                <form
                  className="panel goal-form"
                  onSubmit={addGoal}
                >
                  <div className="section-heading">
                    <h2>Nova caixinha</h2>

                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setShowGoalForm(false)}
                    >
                      ×
                    </button>
                  </div>

                  <label>
                    Nome da meta

                    <input
                      value={goalForm.name}
                      onChange={(event) =>
                        setGoalForm({
                          ...goalForm,
                          name: event.target.value,
                        })
                      }
                      placeholder="Ex.: Comprar um notebook"
                      required
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      Valor desejado (R$)

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={goalForm.target}
                        onChange={(event) =>
                          setGoalForm({
                            ...goalForm,
                            target: event.target.value,
                          })
                        }
                        placeholder="2000,00"
                        required
                      />
                    </label>

                    <label>
                      Valor já guardado (R$)

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={goalForm.saved}
                        onChange={(event) =>
                          setGoalForm({
                            ...goalForm,
                            saved: event.target.value,
                          })
                        }
                        required
                      />
                    </label>
                  </div>

                  <label>
                    Prazo

                    <input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(event) =>
                        setGoalForm({
                          ...goalForm,
                          deadline: event.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="submit"
                  >
                    Salvar meta
                  </button>
                </form>
              )}

              <div className="goal-grid">
                {goals.map((goal) => {
                  const percent = Math.min(
                    100,
                    Math.round(
                      (goal.saved / goal.target) * 100
                    )
                  );

                  return (
                    <article
                      className="panel goal-card"
                      key={goal.id}
                    >
                      <div className="goal-card-top">
                        <div className="goal-icon">
                          {goal.icon}
                        </div>

                        <button
                          className="more-button"
                          type="button"
                          onClick={() => deleteGoal(goal.id)}
                          aria-label={`Excluir meta ${goal.name}`}
                        >
                          ×
                        </button>
                      </div>

                      <h3>{goal.name}</h3>

                      <div className="goal-values">
                        <strong>{money(goal.saved)}</strong>
                        <span>de {money(goal.target)}</span>
                      </div>

                      <div className="progress-track goal-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percent}%`,
                          }}
                        />
                      </div>

                      <div className="goal-footer">
                        <strong>{percent}% concluído</strong>

                        <span>
                          Prazo:{" "}
                          {new Date(
                            `${goal.deadline}T12:00:00`
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </article>
                  );
                })}

                {goals.length === 0 && (
                  <p className="empty">
                    Você ainda não criou metas. Que tal começar pela primeira?
                  </p>
                )}
              </div>
            </section>
          )}

          <footer className="footer-note">
            NuBanko · Protótipo demonstrativo · Valores fictícios
          </footer>
        </main>

        {/* NAVEGAÇÃO MOBILE */}

        <nav
          className="mobile-nav"
          aria-label="Navegação inferior"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                page === item.id ? "active" : ""
              }
              type="button"
              onClick={() => {
                setPage(item.id);
                setNotice("");
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ========================================
// COMPONENTE DE LISTA DE LANÇAMENTOS
// ========================================

function TransactionList({
  items,
  onDelete,
  compact = false,
}) {
  if (!items.length) {
    return (
      <p className="empty">
        Nenhum lançamento cadastrado.
      </p>
    );
  }

  return (
    <div className="transaction-list">
      {items.map((item) => (
        <div
          className="transaction-item"
          key={item.id}
        >
          <div
            className={`transaction-icon ${item.type}`}
          >
            {item.type === "receita" ? "↗" : "↘"}
          </div>

          <div className="transaction-info">
            <strong>{item.description}</strong>

            <span>
              {item.category} ·{" "}
              {new Date(
                `${item.date}T12:00:00`
              ).toLocaleDateString("pt-BR")}
            </span>
          </div>

          <strong
            className={`transaction-amount ${item.type}`}
          >
            {item.type === "receita" ? "+" : "−"}{" "}
            {money(item.amount)}
          </strong>

          {!compact && (
            <button
              className="delete-button"
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Excluir ${item.description}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ========================================
// TELA DE LOGIN E CADASTRO
// ========================================

function AuthScreen({
  mode,
  onModeChange,
  onAuthenticate,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  function switchMode(nextMode) {
    setError("");
    setPassword("");
    setConfirmPassword("");
    onModeChange(nextMode);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !password) {
      setError("Preencha seu e-mail e sua senha.");
      return;
    }

    if (!validEmail.test(cleanEmail)) {
      setError("Digite um endereço de e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError("Informe seu nome completo.");
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await onAuthenticate({
        mode,
        name,
        email: cleanEmail,
        password,
      });

      if (!result?.ok) {
        setError(
          result?.message || "Não foi possível realizar o acesso."
        );
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className={`auth-shell ${
        isRegister ? "auth-register" : "auth-login"
      }`}
    >
      {/* LADO ROXO */}

      <section className="auth-hero">
        <div className="auth-hero-glow auth-glow-one" />
        <div className="auth-hero-glow auth-glow-two" />

        <div className="auth-brand">
          <span className="auth-brand-mark">N</span>

          <span className="auth-brand-copy">
            <strong>NuBanko</strong>
            <small>Meu Primeiro Salário</small>
          </span>
        </div>

        <div className="auth-hero-message">
          <h1>
            {isRegister ? (
              <>
                Comece a cuidar
                <br />
                do seu dinheiro.
              </>
            ) : (
              <>
                Seu dinheiro,
                <br />
                cada vez mais seu.
              </>
            )}
          </h1>

          <p>
            {isRegister
              ? "Crie sua conta para registrar receitas, despesas e metas financeiras."
              : "Organize suas finanças e conquiste seus objetivos com mais tranquilidade."}
          </p>
        </div>

        <div className="auth-promo-card">
          <span>
            {isRegister
              ? "ORGANIZAÇÃO FINANCEIRA"
              : "MEU PRIMEIRO SALÁRIO, SEU JEITO"}
          </span>

          <strong>
            {isRegister
              ? "Um passo de cada vez."
              : "Pequenos passos. Grandes conquistas."}
          </strong>

          <p>
            {isRegister
              ? "Sua vida financeira começa com escolhas conscientes."
              : "Acompanhe o que entra, o que sai e o que você guarda."}
          </p>
        </div>

        <div className="auth-hero-footer">
          NuBanko · Organização financeira, do seu jeito.
        </div>
      </section>

      {/* LADO DO FORMULÁRIO */}

      <section className="auth-form-area">
        <div className="auth-form-card">
          <div className="auth-card-brand">
            <span className="auth-card-brand-mark">N</span>

            <span>
              <strong>NuBanko</strong>
              <small>Meu Primeiro Salário</small>
            </span>
          </div>

          <header className="auth-heading">
            <h2>
              {isRegister
                ? "Crie sua conta"
                : "Acesse sua conta"}
            </h2>

            <p>
              {isRegister
                ? "É rápido e gratuito."
                : "Entre para acompanhar sua vida financeira."}
            </p>
          </header>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {isRegister && (
              <label className="auth-field">
                <span>Nome completo</span>

                <div className="auth-input-wrap">
                  <AuthIcon name="user" />

                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Como podemos chamar você?"
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span>E-mail</span>

              <div className="auth-input-wrap">
                <AuthIcon name="mail" />

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="seuemail@exemplo.com"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Senha</span>

              <div className="auth-input-wrap">
                <AuthIcon name="lock" />

                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder={
                    isRegister
                      ? "Crie uma senha"
                      : "Digite sua senha"
                  }
                />

                <button
                  className="auth-visibility"
                  type="button"
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                >
                  <AuthIcon
                    name={
                      showPassword ? "eyeOff" : "eye"
                    }
                    size={18}
                  />
                </button>
              </div>
            </label>

            {isRegister && (
              <label className="auth-field">
                <span>Confirmar senha</span>

                <div className="auth-input-wrap">
                  <AuthIcon name="lock" />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Digite a senha novamente"
                  />

                  <button
                    className="auth-visibility"
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                  >
                    <AuthIcon
                      name={
                        showConfirmPassword
                          ? "eyeOff"
                          : "eye"
                      }
                      size={18}
                    />
                  </button>
                </div>
              </label>
            )}

            {!isRegister && (
              <div className="auth-forgot-row">
                <button
                  type="button"
                  className="auth-text-link"
                  onClick={() =>
                    setError(
                      "A recuperação de senha será disponibilizada futuramente."
                    )
                  }
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Aguarde..."
                : isRegister
                ? "Criar conta"
                : "Entrar"}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? (
              <>
                <span>Já possui uma conta?</span>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                <span>Ainda não tem uma conta?</span>

                <button
                  type="button"
                  onClick={() => switchMode("register")}
                >
                  Cadastre-se
                </button>
              </>
            )}
          </div>

          <p className="auth-terms">
            Ao entrar, você concorda com os termos de uso.
          </p>
        </div>

        <p className="auth-demo-note">
          <AuthIcon name="lock" size={13} />
          Protótipo demonstrativo: os dados de acesso são armazenados apenas neste navegador.
        </p>
      </section>
    </main>
  );
}

export default App;
