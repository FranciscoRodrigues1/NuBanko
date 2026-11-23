export const STORAGE_KEY = "nubanko-demo-state";

function getStorageKey(accountEmail) {
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
  const normalizedEmail = accountEmail?.trim().toLocaleLowerCase("pt-BR");
  if (!normalizedEmail || (demoEmail && normalizedEmail === demoEmail.trim().toLocaleLowerCase("pt-BR"))) {
    return STORAGE_KEY;
  }
  return `${STORAGE_KEY}-${encodeURIComponent(normalizedEmail)}`;
}

export const categories = {
  income: ["Salário", "Freelance", "Presente", "Outros"],
  expense: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Estudos",
    "Assinaturas",
    "Lazer",
    "Saúde",
    "Outros",
  ],
};

export const categoryEmojis = {
  Salário: "💼",
  Freelance: "🧑‍💻",
  Presente: "🎁",
  Alimentação: "🍔",
  Transporte: "🚌",
  Moradia: "🏠",
  Estudos: "📚",
  Assinaturas: "📱",
  Lazer: "🎮",
  Saúde: "💚",
  Outros: "✨",
};

export const goalEmojis = ["✈️", "💻", "🚀", "🍔", "🎮", "🏠", "🎓", "🎯"];

export const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDemoState() {
  return { transactions: [], goals: [] };
}

export function clearSavedStates() {
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(STORAGE_KEY)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Não foi possível limpar os dados financeiros locais.", error);
  }
}

export function readSavedState(accountEmail = null) {
  const isRegisteredAccount = Boolean(
    accountEmail &&
    (!import.meta.env.VITE_DEMO_EMAIL ||
      accountEmail.trim().toLocaleLowerCase("pt-BR") !== import.meta.env.VITE_DEMO_EMAIL.trim().toLocaleLowerCase("pt-BR")),
  );
  const emptyAccountState = { transactions: [], goals: [] };
  const fallbackData = isRegisteredAccount ? emptyAccountState : createDemoState();
  try {
    const saved = window.localStorage.getItem(getStorageKey(accountEmail));
    if (!saved) return { data: fallbackData, error: "" };

    const data = JSON.parse(saved);
    if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.goals)) {
      throw new Error("Os dados salvos não têm o formato esperado.");
    }

    return { data, error: "" };
  } catch (error) {
    console.error("Não foi possível carregar os dados locais do NuBanko.", error);
    return {
      data: fallbackData,
      error: "Não foi possível ler os dados salvos. Uma demonstração foi carregada.",
    };
  }
}

export function saveState(transactions, goals, accountEmail = null) {
  window.localStorage.setItem(getStorageKey(accountEmail), JSON.stringify({ transactions, goals }));
}

export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getTotals(transactions, goals) {
  const balance = roundMoney(
    transactions.reduce(
      (total, transaction) =>
        total + (transaction.type === "income" ? transaction.amount : -transaction.amount),
      0,
    ),
  );
  const reserved = roundMoney(goals.reduce((total, goal) => total + goal.saved, 0));
  return { balance, reserved, available: roundMoney(balance - reserved) };
}

export function getSavingsLevel(saved) {
  const levels = [
    { level: 1, title: "Poupador", threshold: 0, next: 500 },
    { level: 2, title: "Guardião", threshold: 500, next: 2000 },
    { level: 3, title: "Estrategista", threshold: 2000, next: 5000 },
    { level: 4, title: "Mestre das metas", threshold: 5000, next: null },
  ];
  const current = [...levels].reverse().find((item) => saved >= item.threshold);
  return {
    ...current,
    progress: current.next
      ? Math.min(100, Math.round(((saved - current.threshold) / (current.next - current.threshold)) * 100))
      : 100,
  };
}

export function getMonthSummary(transactions, date = new Date()) {
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = transactions.filter((item) => item.date.startsWith(monthKey));
  const income = thisMonth
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = thisMonth
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseByCategory = thisMonth
    .filter((item) => item.type === "expense")
    .reduce((result, item) => {
      result[item.category] = (result[item.category] ?? 0) + item.amount;
      return result;
    }, {});
  const chartItems = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    income,
    expenses,
    chartItems,
    maxCategoryExpense: Math.max(...chartItems.map((item) => item.amount), 1),
  };
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function saveTransaction(transactions, goals, values, transaction = null) {
  const next = transaction
    ? transactions.map((item) =>
        item.id === transaction.id ? { ...values, id: item.id } : item,
      )
    : [...transactions, { ...values, id: makeId() }];

  if (getTotals(next, goals).available < 0) {
    return { ok: false, reason: "negative-available" };
  }

  return { ok: true, transactions: next };
}

export function deleteTransaction(transactions, goals, transactionId) {
  const next = transactions.filter((item) => item.id !== transactionId);
  if (getTotals(next, goals).available < 0) {
    return { ok: false, reason: "negative-available" };
  }
  return { ok: true, transactions: next };
}

export function addGoal(goals, values) {
  return [...goals, { ...values, id: makeId(), saved: 0 }];
}

export function moveGoal(goals, available, goalId, type, amount) {
  const goal = goals.find((item) => item.id === goalId);
  if (!goal || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "invalid-movement" };
  }
  if (type === "deposit" && amount > available) {
    return { ok: false, reason: "insufficient-available" };
  }
  if (type === "withdraw" && amount > goal.saved) {
    return { ok: false, reason: "insufficient-goal-balance" };
  }

  return {
    ok: true,
    goals: goals.map((item) =>
      item.id === goalId
        ? { ...item, saved: roundMoney(item.saved + (type === "deposit" ? amount : -amount)) }
        : item,
    ),
  };
}

export function transferGoal(goals, sourceGoalId, destinationGoalId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "invalid-transfer" };
  }
  const numericAmount = roundMoney(amount);
  const sourceGoal = goals.find((item) => item.id === sourceGoalId);
  const destinationGoal = goals.find((item) => item.id === destinationGoalId);

  if (
    !sourceGoal ||
    !destinationGoal ||
    sourceGoalId === destinationGoalId ||
    numericAmount <= 0
  ) {
    return { ok: false, reason: "invalid-transfer" };
  }
  if (numericAmount > sourceGoal.saved) {
    return { ok: false, reason: "insufficient-goal-balance" };
  }

  return {
    ok: true,
    goals: goals.map((goal) => {
      if (goal.id === sourceGoalId) {
        return { ...goal, saved: roundMoney(goal.saved - numericAmount) };
      }
      if (goal.id === destinationGoalId) {
        return { ...goal, saved: roundMoney(goal.saved + numericAmount) };
      }
      return goal;
    }),
  };
}

export function deleteGoal(goals, goalId) {
  return goals.filter((item) => item.id !== goalId);
}
