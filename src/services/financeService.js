export const STORAGE_KEY = "nubanko-demo-state";

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
  return {
    transactions: [
      { id: "salary", description: "Salário", amount: 3000, type: "income", category: "Salário", date: localDate(-14) },
      { id: "freelance", description: "Projeto freelance", amount: 450, type: "income", category: "Freelance", date: localDate(-7) },
      { id: "groceries", description: "Compras do mês", amount: 128, type: "expense", category: "Alimentação", date: localDate(-1) },
      { id: "transport", description: "Recarga de transporte", amount: 79.9, type: "expense", category: "Transporte", date: localDate(-3) },
      { id: "course", description: "Curso de inglês", amount: 220, type: "expense", category: "Estudos", date: localDate(-6) },
      { id: "music", description: "Streaming de música", amount: 58.9, type: "expense", category: "Assinaturas", date: localDate(-4) },
      { id: "coffee", description: "Café com amigos", amount: 75, type: "expense", category: "Lazer", date: localDate(0) },
    ],
    goals: [
      { id: "trip", name: "Viagem de férias", emoji: "✈️", target: 3000, saved: 750, deadline: localDate(150) },
      { id: "laptop", name: "Notebook novo", emoji: "💻", target: 4500, saved: 420, deadline: localDate(240) },
    ],
  };
}

export function readSavedState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: createDemoState(), error: "" };

    const data = JSON.parse(saved);
    if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.goals)) {
      throw new Error("Os dados salvos não têm o formato esperado.");
    }

    return { data, error: "" };
  } catch (error) {
    console.error("Não foi possível carregar os dados locais do NuBanko.", error);
    return {
      data: createDemoState(),
      error: "Não foi possível ler os dados salvos. Uma demonstração foi carregada.",
    };
  }
}

export function saveState(transactions, goals) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, goals }));
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

export function deleteGoal(goals, goalId) {
  return goals.filter((item) => item.id !== goalId);
}
