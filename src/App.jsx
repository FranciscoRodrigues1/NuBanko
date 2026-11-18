import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nubanko-demo-state";
const WEEKLY_CHALLENGE_TARGET = 200;

const categories = {
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

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDemoState() {
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
      { id: "trip", name: "Viagem de férias", target: 3000, saved: 750, deadline: localDate(150) },
      { id: "laptop", name: "Notebook novo", target: 4500, saved: 420, deadline: localDate(240) },
    ],
    goalMovements: [
      { id: "trip-save-1", goalId: "trip", type: "deposit", amount: 250, date: localDate(-28) },
      { id: "trip-save-2", goalId: "trip", type: "deposit", amount: 200, date: localDate(-21) },
      { id: "trip-save-3", goalId: "trip", type: "deposit", amount: 100, date: localDate(-13) },
      { id: "trip-save-4", goalId: "trip", type: "deposit", amount: 100, date: localDate(-7) },
      { id: "trip-save-5", goalId: "trip", type: "deposit", amount: 50, date: localDate(-2) },
      { id: "trip-save-6", goalId: "trip", type: "deposit", amount: 25, date: localDate(-1) },
      { id: "trip-save-7", goalId: "trip", type: "deposit", amount: 25, date: localDate(0) },
      { id: "laptop-save-1", goalId: "laptop", type: "deposit", amount: 100, date: localDate(-30) },
      { id: "laptop-save-2", goalId: "laptop", type: "deposit", amount: 100, date: localDate(-20) },
      { id: "laptop-save-3", goalId: "laptop", type: "deposit", amount: 100, date: localDate(-10) },
      { id: "laptop-save-4", goalId: "laptop", type: "deposit", amount: 70, date: localDate(-7) },
      { id: "laptop-save-5", goalId: "laptop", type: "deposit", amount: 25, date: localDate(-1) },
      { id: "laptop-save-6", goalId: "laptop", type: "deposit", amount: 25, date: localDate(0) },
    ],
  };
}

function readSavedState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: createDemoState(), error: "" };

    const data = JSON.parse(saved);
    if (
      !data ||
      !Array.isArray(data.transactions) ||
      !Array.isArray(data.goals)
    ) {
      throw new Error("Os dados salvos não têm o formato esperado.");
    }

    return {
      data: {
        ...data,
        goalMovements: Array.isArray(data.goalMovements) ? data.goalMovements : [],
      },
      error: "",
    };
  } catch (error) {
    console.error("Não foi possível carregar os dados locais do NuBanko.", error);
    return {
      data: createDemoState(),
      error: "Não foi possível ler os dados salvos. Uma demonstração foi carregada.",
    };
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getWeekStart() {
  const daysSinceMonday = (new Date().getDay() + 6) % 7;
  return localDate(-daysSinceMonday);
}

function getMovementNet(movement) {
  return movement.type === "deposit" ? movement.amount : -movement.amount;
}

function getSavingsHistory(movements, reserved, days = 7) {
  const firstDay = localDate(-(days - 1));
  const recentNet = movements
    .filter((movement) => movement.date >= firstDay && movement.date <= localDate())
    .reduce((sum, movement) => sum + getMovementNet(movement), 0);
  let total = roundMoney(
    reserved - recentNet,
  );

  return Array.from({ length: days }, (_, index) => {
    const date = localDate(index - (days - 1));
    const dailyNet = movements
      .filter((movement) => movement.date === date)
      .reduce((sum, movement) => sum + getMovementNet(movement), 0);
    total = roundMoney(total + dailyNet);
    const dateValue = new Date(`${date}T12:00:00`);
    return {
      date,
      label: dateValue.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      value: Math.max(0, total),
    };
  });
}

function getGoalEmoji(name) {
  const normalizedName = name.toLocaleLowerCase("pt-BR");
  if (/viagem|férias|ferias/.test(normalizedName)) return "✈️";
  if (/celular|telefone|phone/.test(normalizedName)) return "📱";
  if (/show|música|musica|festival/.test(normalizedName)) return "🎟️";
  if (/roupa|tênis|tenis|look/.test(normalizedName)) return "👟";
  if (/faculdade|curso|estudo/.test(normalizedName)) return "🎓";
  if (/carro|moto|veículo|veiculo/.test(normalizedName)) return "🚙";
  if (/casa|moradia|independência|independencia/.test(normalizedName)) return "🏡";
  if (/notebook|computador|pc/.test(normalizedName)) return "💻";
  return "✨";
}

function getTotals(transactions, goals) {
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

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function Icon({ name, size = 20 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const drawings = {
    home: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    arrowDown: <><path d="M12 5v14M19 12l-7 7-7-7" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 14h2" /><path d="M7 5V3h11" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
  };

  return <svg {...shared}>{drawings[name]}</svg>;
}

function App() {
  const [initialState] = useState(readSavedState);
  const [transactions, setTransactions] = useState(initialState.data.transactions);
  const [goals, setGoals] = useState(initialState.data.goals);
  const [goalMovements, setGoalMovements] = useState(initialState.data.goalMovements);
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(initialState.error);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    if (!authenticated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ transactions, goals, goalMovements }),
      );
    } catch (error) {
      console.error("Não foi possível salvar os dados locais do NuBanko.", error);
      setNotice("Não foi possível salvar as alterações neste navegador.");
    }
  }, [transactions, goals, goalMovements]);

  const totals = useMemo(() => getTotals(transactions, goals), [transactions, goals]);
  const monthKey = localDate().slice(0, 7);
  const thisMonth = transactions.filter((item) => item.date.startsWith(monthKey));
  const monthIncome = thisMonth
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const monthExpenses = thisMonth
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const weekStart = getWeekStart();
  const today = localDate();
  const weeklySaved = Math.max(
    0,
    roundMoney(
      goalMovements
        .filter((movement) => movement.date >= weekStart && movement.date <= today)
        .reduce((sum, movement) => sum + getMovementNet(movement), 0),
    ),
  );
  const weeklyProgress = Math.min(100, Math.round((weeklySaved / WEEKLY_CHALLENGE_TARGET) * 100));
  const savingsHistory = useMemo(
    () => getSavingsHistory(goalMovements, totals.reserved),
    [goalMovements, totals.reserved],
  );
  const depositDaysThisWeek = new Set(
    goalMovements
      .filter((movement) => movement.type === "deposit" && movement.date >= weekStart && movement.date <= today)
      .map((movement) => movement.date),
  ).size;
  const achievements = [
    {
      id: "first-save",
      emoji: "🌱",
      title: "Primeiro passo",
      description: "Fez seu primeiro depósito",
      unlocked: totals.reserved > 0 || goalMovements.some((movement) => movement.type === "deposit"),
    },
    {
      id: "steady-saver",
      emoji: "⚡",
      title: "No seu ritmo",
      description: "Guardou em 3 dias nesta semana",
      unlocked: depositDaysThisWeek >= 3,
    },
    {
      id: "goal-reached",
      emoji: "🏆",
      title: "Meta desbloqueada",
      description: "Concluiu uma Caixinha",
      unlocked: goals.some((goal) => goal.saved >= goal.target) ||
        goalMovements.some((movement) => movement.goalCompleted),
    },
  ];

  const totals = useMemo(() => getTotals(transactions, goals), [transactions, goals]);
  const monthSummary = useMemo(() => getMonthSummary(transactions), [transactions]);
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );
  const visibleTransactions = sortedTransactions.filter((item) => {
    const matchesType = filter === "all" || item.type === filter;
    const matchesQuery = `${item.description} ${item.category}`
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR"));
    return matchesType && matchesQuery;
  });

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  }

  function handleSaveTransaction(values) {
    const result = saveTransaction(transactions, goals, values, modal.transaction);
    if (!result.ok) {
      showNotice("Essa alteração deixaria o saldo disponível negativo.");
      return false;
    }
    setTransactions(result.transactions);
    setModal(null);
    showNotice(modal.transaction ? "Movimentação atualizada." : "Movimentação adicionada.");
    return true;
  }

  function handleDeleteTransaction(transaction) {
    const result = deleteTransaction(transactions, goals, transaction.id);
    if (!result.ok) {
      showNotice("Não é possível excluir: o saldo disponível ficaria negativo.");
      return;
    }
    setTransactions(result.transactions);
    showNotice("Movimentação excluída.");
  }

  function handleSaveGoal(values) {
    setGoals((current) => addGoal(current, values));
    setModal(null);
    showNotice("Caixinha criada.");
  }

  function handleMoveGoal(amount) {
    const previousGoal = goals.find((item) => item.id === modal.goalId);
    const result = moveGoal(goals, totals.available, modal.goalId, modal.movementType, amount);
    if (!result.ok) {
      if (result.reason === "insufficient-available") showNotice("O valor do depósito supera seu saldo disponível.");
      if (result.reason === "insufficient-goal-balance") showNotice("O valor da retirada supera o saldo desta Caixinha.");
      return false;
    }
    setGoals(result.goals);
    const updatedGoal = result.goals.find((item) => item.id === modal.goalId);
    if (previousGoal && previousGoal.saved < previousGoal.target && updatedGoal.saved >= updatedGoal.target) {
      setCelebration({ id: Date.now(), goalName: updatedGoal.name });
    }
    const updatedSavings = roundMoney(goal.saved + (type === "deposit" ? amount : -amount));
    setGoalMovements((current) => [
      ...current,
      {
        id: makeId(),
        goalId,
        type,
        amount,
        date: localDate(),
        goalCompleted: type === "deposit" && goal.saved < goal.target && updatedSavings >= goal.target,
      },
    ]);
    setGoals((current) =>
      current.map((item) =>
        item.id === goalId
          ? {
              ...item,
              saved: updatedSavings,
            }
          : item,
      ),
    );
    setModal(null);
    if (type === "deposit" && goal.saved < goal.target && updatedSavings >= goal.target) {
      showNotice(`Meta desbloqueada! Você conquistou "${goal.name}".`);
    } else if (type === "deposit" && weeklySaved < WEEKLY_CHALLENGE_TARGET && weeklySaved + amount >= WEEKLY_CHALLENGE_TARGET) {
      showNotice("Desafio concluído! Cada passo seu fez diferença.");
    } else if (type === "deposit") {
      showNotice(`Boa! ${money.format(amount)} a mais no seu sonho.`);
    } else {
      showNotice("Retirada realizada. Seu saldo disponível foi atualizado.");
    }
    return true;
  }

  function handleDeleteGoal(goal) {
    if (!window.confirm(`Excluir a Caixinha "${goal.name}"? O valor guardado voltará ao saldo disponível.`)) {
      return;
    }
    setGoals((current) => current.filter((item) => item.id !== goal.id));
    if (goal.saved > 0) {
      setGoalMovements((current) => [
        ...current,
        {
          id: makeId(),
          goalId: goal.id,
          type: "withdraw",
          amount: goal.saved,
          date: localDate(),
          goalCompleted: goal.saved >= goal.target,
        },
      ]);
    }
    showNotice("Caixinha excluída.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-header">
          <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage("home"); }}>
            <div className="brand-mark inline-content">n</div>
            <small className="inline-content">nu<small className="brand-light inline-content">banko</small></small>
          </a>
        </header>
        <p className="workspace-label">SEU ESPAÇO</p>
        <nav className="main-nav" aria-label="Navegação principal">
          <NavButton active={page === "home"} icon="home" onClick={() => setPage("home")}>Visão geral</NavButton>
          <NavButton active={page === "transactions"} icon="list" onClick={() => setPage("transactions")}>Movimentações</NavButton>
          <NavButton active={page === "goals"} icon="target" onClick={() => setPage("goals")}>Caixinhas</NavButton>
        </nav>
        <section className="sidebar-bottom" aria-label="Informações da conta">
          <section className="sidebar-tip" aria-label="Dica financeira">
            <div className="tip-icon inline-content"><Icon name="trend" size={18} /></div>
            <strong>Dica de bolso</strong>
            <p>Uma quantia que cabe no seu mês pode virar um hábito poderoso.</p>
          </section>
          <section className="profile" aria-label="Perfil da conta">
            <div className="avatar">M</div>
            <div className="profile-copy"><strong>Minha conta</strong><small className="inline-content">Modo demonstração</small></div>
            <div className="profile-status inline-content" aria-label="Conta demonstrativa" />
          </section>
        </section>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark inline-content">n</div> nubanko</div>
          <div className="breadcrumbs"><small className="inline-content">Início</small><Icon name="chevron" size={15} /><strong>{title}</strong></div>
          <div className="topbar-right">
            <div className="demo-pill"><div className="inline-content" /> Dados salvos neste navegador</div>
            <div className="avatar top-avatar" aria-hidden="true">M</div>
          </div>
        </header>

        <main className="page-content">
          {notice && (
            <div className="notice" role="status">
              <small className="inline-content">{notice}</small>
              <button type="button" aria-label="Fechar aviso" onClick={() => setNotice("")}><Icon name="close" size={16} /></button>
            </div>
          )}

          {page === "home" && (
            <Dashboard
              totals={totals}
              monthIncome={monthIncome}
              monthExpenses={monthExpenses}
              chartItems={chartItems}
              maxCategoryExpense={maxCategoryExpense}
              goals={goals}
              savingsHistory={savingsHistory}
              weeklySaved={weeklySaved}
              weeklyProgress={weeklyProgress}
              achievements={achievements}
              available={totals.available}
              transactions={recentTransactions}
              onAdd={() => setModal({ type: "transaction" })}
              onAddGoal={() => setModal({ type: "goal" })}
              onQuickSave={() => {
                if (goals.length) {
                  setModal({ type: "movement", goalId: goals[0].id, movementType: "deposit" });
                } else {
                  setModal({ type: "goal" });
                }
              }}
              onNavigate={setPage}
            />
          )}

          {page === "transactions" && (
            <TransactionsPage
              transactions={visibleTransactions}
              filter={filter}
              query={query}
              onFilter={setFilter}
              onQuery={setQuery}
              onAdd={() => setModal({ type: "transaction" })}
              onEdit={(transaction) => setModal({ type: "transaction", transaction })}
              onDelete={removeTransaction}
            />
          )}

          {page === "goals" && (
            <GoalsPage
              goals={goals}
              available={totals.available}
              onAdd={() => setModal({ type: "goal" })}
              onMove={(goalId, movementType) => setModal({ type: "movement", goalId, movementType })}
              onDelete={removeGoal}
            />
          )}
        </main>
        <footer className="app-footer">
          <small className="inline-content"><Icon name="shield" size={14} /> Demonstração — não conectada a bancos ou serviços externos.</small>
          <small className="inline-content">NuBanko · Organização financeira, do seu jeito.</small>
        </footer>
      </div>

      {modal?.type === "transaction" && (
        <TransactionModal
          transaction={modal.transaction}
          available={totals.available}
          onClose={() => setModal(null)}
          onSave={saveTransaction}
        />
      )}
      {modal?.type === "goal" && (
        <GoalModal onClose={() => setModal(null)} onSave={saveGoal} />
      )}
      {modal?.type === "movement" && (
        <MovementModal
          goal={goals.find((item) => item.id === modal.goalId)}
          movementType={modal.movementType}
          available={totals.available}
          onClose={() => setModal(null)}
          onSave={(amount) => moveGoal(modal.goalId, modal.movementType, amount)}
        />
      )}
    </div>
  );
}

function NavButton({ active, icon, onClick, children }) {
  return (
    <button className={`nav-item${active ? " active" : ""}`} type="button" onClick={onClick} aria-current={active ? "page" : undefined}>
      <Icon name={icon} size={19} /><small className="inline-content">{children}</small>{active && <div className="nav-indicator inline-content" />}
    </button>
  );
}

function Dashboard({
  totals,
  monthIncome,
  monthExpenses,
  chartItems,
  maxCategoryExpense,
  goals,
  savingsHistory,
  weeklySaved,
  weeklyProgress,
  achievements,
  available,
  transactions,
  onAdd,
  onAddGoal,
  onQuickSave,
  onNavigate,
}) {
  const now = new Date();
  const greetingDate = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const featuredGoal = goals[0];
  const otherGoals = goals.slice(1, 3);

  return (
    <section className="page-section dashboard-page" aria-label="Visão geral">
      <section className="page-heading">
        <div>
          <p className="eyebrow">{greetingDate}</p>
          <h1>E aí, bora <em className="inline-content">realizar seus sonhos?</em></h1>
          <p className="heading-copy">Seu eu do futuro vai agradecer. Cada real conta!</p>
        </div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Novo registro</button>
      </section>

      <section className="overview-grid" aria-label="Resumo financeiro">
        <article className="balance-card">
          <div className="balance-card-top">
            <div><small className="card-kicker inline-content">VOCÊ JÁ ECONOMIZOU</small><small className="balance-label inline-content">Seu progresso até aqui</small></div>
            <div className="balance-icon inline-content"><Icon name="wallet" size={21} /></div>
          </div>
          <strong className="balance-value">{money.format(totals.reserved)}</strong>
          <div className="balance-card-bottom">
            <small className="inline-content">Livre agora <strong>{money.format(totals.available)}</strong></small>
            <small className="inline-content">Saldo geral <strong>{money.format(totals.balance)}</strong></small>
          </div>
          <div className="balance-orb orb-one inline-content" /><div className="balance-orb orb-two inline-content" />
        </article>
        <MetricCard label="Entradas no mês" value={money.format(monthIncome)} icon="arrowDown" kind="positive" caption="Dinheiro que chegou" />
        <MetricCard label="Saídas no mês" value={money.format(monthExpenses)} icon="arrowUp" kind="negative" caption="Dinheiro que saiu" />
      </section>

      <section className="focus-grid" aria-label="Meta principal e desafio da semana">
        <FeaturedGoal goal={featuredGoal} available={available} onAddGoal={onAddGoal} onQuickSave={onQuickSave} />
        <WeeklyChallenge saved={weeklySaved} progress={weeklyProgress} />
      </section>

      <section className="dashboard-grid">
        <article className="panel spending-panel">
          <div className="panel-heading">
            <div><h2>Para onde vai seu dinheiro</h2><p>Despesas por categoria neste mês</p></div>
            <div className="panel-icon inline-content"><Icon name="trend" size={18} /></div>
          </div>
          {chartItems.length ? (
            <div className="category-chart">
              {chartItems.slice(0, 5).map((item, index) => (
                <div className="category-row" key={item.category}>
                  <div className="category-label"><div className={`category-dot dot-${index % 5} inline-content`} />{item.category}<strong>{money.format(item.amount)}</strong></div>
                  <div className="bar-track">
                    <progress
                      className={`bar-fill bar-${index % 5}`}
                      max={maxCategoryExpense}
                      value={item.amount}
                      aria-label={`${item.category}: ${money.format(item.amount)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="Tudo tranquilo por aqui" text="Suas despesas deste mês aparecerão nesta área." />}
          <div className="panel-footnote"><div className="footnote-dot inline-content" /> Total de saídas <strong>{money.format(monthExpenses)}</strong></div>
        </article>

        <article className="panel goals-panel">
          <div className="panel-heading">
            <div><h2>Mais sonhos no radar</h2><p>Seus próximos planos também contam</p></div>
            <button className="text-button" type="button" onClick={() => onNavigate("goals")}>Ver todos <Icon name="chevron" size={15} /></button>
          </div>
          {otherGoals.length ? otherGoals.map((goal, index) => (
            <GoalProgress key={goal.id} goal={goal} variant={index} />
          )) : <p className="next-goal-note">{featuredGoal ? "Um sonho por vez já é um ótimo começo." : "Celular, show, viagem… qual vai ser seu primeiro plano?"}</p>}
          <button className="goal-add-link" type="button" onClick={onAddGoal}><Icon name="plus" size={16} /> Criar outro sonho</button>
        </article>
      </section>

      <section className="journey-grid" aria-label="Sua evolução e conquistas">
        <SavingsEvolution history={savingsHistory} />
        <AchievementShelf achievements={achievements} />
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading recent-heading">
          <div><h2>Movimentações recentes</h2><p>Suas últimas entradas e saídas</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate("transactions")}>Ver movimentações <Icon name="chevron" size={15} /></button>
        </div>
        {transactions.length ? (
          <div className="recent-list">
            {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
          </div>
        ) : <EmptyState title="Nenhuma movimentação ainda" text="Adicione sua primeira receita ou despesa para começar." />}
      </section>
    </section>
  );
}

function FeaturedGoal({ goal, available, onAddGoal, onQuickSave }) {
  if (!goal) {
    return (
      <article className="featured-goal featured-goal-empty">
        <div className="goal-sticker" aria-hidden="true">✨</div>
        <p className="focus-label">SEU PRÓXIMO CAPÍTULO</p>
        <h2>Qual sonho vamos tirar do papel?</h2>
        <p>Vale show, celular, viagem, curso ou sua independência. Você escolhe o que faz sentido.</p>
        <button className="button button-save" type="button" onClick={onAddGoal}>
          <Icon name="plus" size={17} /> Criar meu primeiro objetivo
        </button>
      </article>
    );
  }

  const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const remaining = Math.max(0, goal.target - goal.saved);

  return (
    <article className="featured-goal">
      <div className="goal-sticker" aria-hidden="true">{getGoalEmoji(goal.name)}</div>
      <p className="focus-label">SONHO EM FOCO <small className="focus-chip">META PRINCIPAL</small></p>
      <h2>{goal.name}</h2>
      <p className="focus-subtitle">Você está mais perto do seu objetivo!</p>
      <div className="focus-progress">
        <progress className="goal-fill focus-fill" max={100} value={progress} aria-label={`Progresso de ${goal.name}: ${progress}%`}>
          {progress}%
        </progress>
      </div>
      <div className="focus-values">
        <strong>{money.format(goal.saved)} <small>guardados</small></strong>
        <small className="focus-percent">{progress}%</small>
      </div>
      <div className="focus-bottom">
        <small>Faltam {money.format(remaining)} de {money.format(goal.target)}</small>
        {progress >= 100 && <small className="focus-complete">Meta desbloqueada!</small>}
      </div>
      <button className="button button-save" type="button" disabled={available <= 0} onClick={onQuickSave}>
        <Icon name="plus" size={18} /> Guardar dinheiro
      </button>
      {available <= 0 && <p className="save-hint">Quando tiver saldo livre, você pode continuar por aqui.</p>}
    </article>
  );
}

function WeeklyChallenge({ saved, progress }) {
  const challengeComplete = progress >= 100;
  return (
    <article className="weekly-challenge">
      <div className="challenge-orbit challenge-orbit-one" />
      <div className="challenge-orbit challenge-orbit-two" />
      <div className="challenge-top">
        <p className="challenge-label">DESAFIO DA SEMANA</p>
        <div className="challenge-sticker" aria-hidden="true">⚡</div>
      </div>
      <h2>{challengeComplete ? "Desafio concluído!" : "Pequenos depósitos, grandes sonhos."}</h2>
      <p>{challengeComplete ? "Você fez do seu jeito. Curta essa conquista!" : "Se couber no seu plano, junte R$ 200 até domingo. Qualquer valor ajuda."}</p>
      <div className="challenge-progress-copy">
        <strong>{money.format(saved)}</strong>
        <small>de {money.format(WEEKLY_CHALLENGE_TARGET)}</small>
      </div>
      <div className="challenge-track">
        <progress className="challenge-fill" max={100} value={progress} aria-label={`Desafio semanal: ${progress}% concluído`}>
          {progress}%
        </progress>
      </div>
      <div className="challenge-footer">
        <small>{progress}% do desafio</small>
        <small>{challengeComplete ? "Mandou bem!" : "Sem pressa, no seu ritmo."}</small>
      </div>
    </article>
  );
}

function SavingsEvolution({ history }) {
  const values = history.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const coordinates = history.map((point, index) => ({
    ...point,
    x: 12 + index * (276 / Math.max(history.length - 1, 1)),
    y: 104 - ((point.value - min) / range) * 76,
  }));
  const linePoints = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${coordinates[0].x},112 ${linePoints} ${coordinates[coordinates.length - 1].x},112`;
  const change = roundMoney(history[history.length - 1].value - history[0].value);

  return (
    <article className="panel savings-panel">
      <div className="panel-heading">
        <div><h2>Sua evolução</h2><p>Olha só o caminho que você já fez</p></div>
        <div className="chart-period">7 DIAS</div>
      </div>
      <div className="savings-total">
        <strong>{money.format(history[history.length - 1].value)}</strong>
        <small>guardados no total</small>
      </div>
      <svg className="savings-chart" viewBox="0 0 300 124" role="img" aria-label="Gráfico de evolução do total guardado nos últimos sete dias">
        <line className="chart-grid-line" x1="12" y1="28" x2="288" y2="28" />
        <line className="chart-grid-line" x1="12" y1="66" x2="288" y2="66" />
        <line className="chart-grid-line" x1="12" y1="104" x2="288" y2="104" />
        <polygon className="chart-area" points={areaPoints} />
        <polyline className="chart-line" points={linePoints} />
        {coordinates.map((point) => (
          <circle className="chart-point" key={point.date} cx={point.x} cy={point.y} r="3" />
        ))}
      </svg>
      <div className="chart-day-labels" aria-hidden="true">
        {history.map((point) => <small key={point.date}>{point.label}</small>)}
      </div>
      <p className="savings-feedback">
        {change > 0
          ? `+${money.format(change)} na última semana. Cada real conta!`
          : "Seu plano continua aqui. Retome quando fizer sentido."}
      </p>
    </article>
  );
}

function AchievementShelf({ achievements }) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  return (
    <article className="panel achievement-panel" aria-label="Conquistas e medalhas">
      <div className="panel-heading">
        <div><h2>Conquistas desbloqueadas</h2><p>Cada passo seu merece ser visto</p></div>
        <div className="achievement-count">{unlocked}/{achievements.length}</div>
      </div>
      <div className="achievement-list">
        {achievements.map((achievement) => (
          <div className={`achievement-item${achievement.unlocked ? " unlocked" : ""}`} key={achievement.id}>
            <div className="achievement-medal" aria-hidden="true">{achievement.emoji}</div>
            <div className="achievement-copy">
              <strong>{achievement.title}</strong>
              <small>{achievement.description}</small>
            </div>
            {achievement.unlocked && <small className="achievement-check" aria-label="Desbloqueada">✓</small>}
          </div>
        ))}
      </div>
      <p className="achievement-footnote">Sem competição: seu único ritmo é o seu.</p>
    </article>
  );
}

function MetricCard({ label, value, icon, kind, caption }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><div className={`metric-icon ${kind} inline-content`}><Icon name={icon} size={17} /></div><small className="metric-period inline-content">Este mês</small></div>
      <small className="metric-label inline-content">{label}</small>
      <strong className="metric-value">{value}</strong>
      <small className="metric-caption inline-content">{caption}</small>
    </article>
  );
}

function GoalProgress({ goal, variant = 0 }) {
  const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  return (
    <div className="goal-progress">
      <div className="goal-progress-top">
        <div className={`goal-symbol goal-symbol-${variant % 2} inline-content`} aria-hidden="true">{getGoalEmoji(goal.name)}</div>
        <div className="goal-title-wrap"><strong>{goal.name}</strong><small className="inline-content">Até {new Date(`${goal.deadline}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small></div>
        <small className="goal-percent inline-content">{progress}%</small>
      </div>
      <div className="goal-track">
        <progress className={`goal-fill goal-fill-${variant % 2}`} max={100} value={progress} aria-label={`Progresso de ${goal.name}: ${progress}%`}>
          {progress}%
        </progress>
      </div>
      <div className="goal-values"><small className="inline-content">{money.format(goal.saved)} guardados</small><strong>{money.format(goal.target)}</strong></div>
    </div>
  );
}

function TransactionRow({ transaction, actions }) {
  const isIncome = transaction.type === "income";
  return (
    <div className="transaction-row">
      <div className={`transaction-kind ${isIncome ? "income" : "expense"} inline-content`}><Icon name={isIncome ? "arrowDown" : "arrowUp"} size={17} /></div>
      <div className="transaction-main"><strong>{transaction.description}</strong><small className="inline-content">{transaction.category}</small></div>
      <small className="transaction-date inline-content">{new Date(`${transaction.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</small>
      <strong className={`transaction-amount ${isIncome ? "income-text" : ""}`}>{isIncome ? "+" : "−"} {money.format(transaction.amount)}</strong>
      {actions}
    </div>
  );
}

function TransactionsPage({ transactions, filter, query, onFilter, onQuery, onAdd, onEdit, onDelete }) {
  return (
    <section className="page-section transactions-page" aria-label="Movimentações">
      <section className="page-heading">
        <div><p className="eyebrow">SEU HISTÓRICO</p><h1>Movimentações</h1><p className="heading-copy">Acompanhe e organize cada entrada e saída.</p></div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Nova movimentação</button>
      </section>
      <section className="panel transactions-panel">
        <div className="transaction-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filtrar movimentações">
            {[["all", "Todas"], ["income", "Entradas"], ["expense", "Saídas"]].map(([value, label]) => (
              <button key={value} className={filter === value ? "filter-tab selected" : "filter-tab"} type="button" onClick={() => onFilter(value)}>{label}</button>
            ))}
          </div>
          <label className="search-field"><small className="search-symbol inline-content">⌕</small><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar movimentação" aria-label="Buscar movimentação" /></label>
        </div>
        {transactions.length ? (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                actions={
                  <div className="row-actions">
                    <button className="icon-button" type="button" aria-label={`Editar ${transaction.description}`} onClick={() => onEdit(transaction)}><Icon name="edit" size={16} /></button>
                    <button className="icon-button danger-hover" type="button" aria-label={`Excluir ${transaction.description}`} onClick={() => window.confirm(`Excluir "${transaction.description}"?`) && onDelete(transaction)}><Icon name="trash" size={16} /></button>
                  </div>
                }
              />
            ))}
          </div>
        ) : <EmptyState title="Nenhum resultado encontrado" text="Tente mudar os filtros ou adicione uma movimentação." />}
      </section>
    </section>
  );
}

function GoalsPage({ goals, available, onAdd, onMove, onDelete }) {
  const savedTotal = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const targetTotal = goals.reduce((sum, goal) => sum + goal.target, 0);

  return (
    <section className="page-section goals-page" aria-label="Caixinhas">
      <section className="page-heading">
        <div><p className="eyebrow">SEUS PRÓXIMOS PASSOS</p><h1>Caixinhas</h1><p className="heading-copy">Pequenos depósitos que aproximam você dos seus planos.</p></div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Nova Caixinha</button>
      </section>
      <section className="goals-summary">
        <div className="goals-summary-icon"><Icon name="target" size={22} /></div>
        <div><small className="inline-content">Você já guardou</small><strong>{money.format(savedTotal)}</strong></div>
        <div className="summary-divider" />
        <div><small className="inline-content">Objetivo total</small><strong>{money.format(targetTotal)}</strong></div>
        <div className="summary-spacer" />
        <div className="available-chip"><small className="inline-content">Disponível para guardar</small><strong>{money.format(available)}</strong></div>
      </section>
      {goals.length ? (
        <section className="goal-cards">
          {goals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
            return (
              <article className={`goal-card goal-card-${index % 2}`} key={goal.id}>
                <div className="goal-card-top"><div className={`goal-card-symbol goal-symbol-${index % 2} inline-content`} aria-hidden="true">{getGoalEmoji(goal.name)}</div><button className="icon-button danger-hover" type="button" aria-label={`Excluir ${goal.name}`} onClick={() => onDelete(goal)}><Icon name="trash" size={17} /></button></div>
                <h2>{goal.name}</h2>
                <p className="goal-deadline"><Icon name="calendar" size={15} /> Prazo: {new Date(`${goal.deadline}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>
                <div className="goal-card-amounts"><strong>{money.format(goal.saved)}</strong><small className="inline-content">de {money.format(goal.target)}</small></div>
                <div className="goal-track large">
                  <progress className={`goal-fill goal-fill-${index % 2}`} max={100} value={progress} aria-label={`Progresso de ${goal.name}: ${progress}%`}>
                    {progress}%
                  </progress>
                </div>
                <div className="goal-card-bottom"><small className="inline-content">{progress}% completo</small><small className="inline-content">{money.format(Math.max(0, goal.target - goal.saved))} restantes</small></div>
                <div className="goal-card-actions">
                  <button className="button button-soft" type="button" disabled={available <= 0} onClick={() => onMove(goal.id, "deposit")}><Icon name="arrowDown" size={16} /> Guardar</button>
                  <button className="button button-outline" type="button" disabled={goal.saved <= 0} onClick={() => onMove(goal.id, "withdraw")}><Icon name="arrowUp" size={16} /> Retirar</button>
                </div>
              </article>
            );
          })}
        </section>
      ) : <section className="panel" aria-label="Objetivos"><EmptyState title="Ainda não há Caixinhas" text="Crie um objetivo e comece a guardar para algo que importa." /></section>}
      <div className="goals-note"><Icon name="shield" size={16} /><small className="inline-content">Depósitos e retiradas são controles demonstrativos: não movimentam dinheiro real.</small></div>
    </section>
  );
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><div className="empty-icon inline-content"><Icon name="wallet" size={22} /></div><strong>{title}</strong><p>{text}</p></div>;
}

function ModalShell({ title, subtitle, onClose, children }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><h2 id="modal-title">{title}</h2><p>{subtitle}</p></div><button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}><Icon name="close" size={18} /></button></div>
        {children}
      </section>
    </div>
  );
}

function TransactionModal({ transaction, available, onClose, onSave }) {
  const [type, setType] = useState(transaction?.type ?? "expense");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category ?? (transaction?.type === "income" ? categories.income[0] : categories.expense[0]));
  const [date, setDate] = useState(transaction?.date ?? localDate());
  const [error, setError] = useState("");

  function updateType(value) {
    setType(value);
    setCategory(categories[value][0]);
  }

  function login() {
    const saved = readSavedState(getSessionEmail());
    setTransactions(saved.data.transactions);
    setGoals(saved.data.goals);
    setNotice(saved.error);
    setAuthenticated(true);
  }

  return (
    <ModalShell title={transaction ? "Editar movimentação" : "Nova movimentação"} subtitle="Registre seu dinheiro com clareza." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="type-switch" role="group" aria-label="Tipo de movimentação">
          <button type="button" className={type === "expense" ? "type-option selected expense-option" : "type-option"} onClick={() => updateType("expense")}><Icon name="arrowUp" size={16} /> Saída</button>
          <button type="button" className={type === "income" ? "type-option selected income-option" : "type-option"} onClick={() => updateType("income")}><Icon name="arrowDown" size={16} /> Entrada</button>
        </div>
        <label className="form-field"><small className="inline-content">Descrição</small><input autoFocus value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: Conta de luz" maxLength={70} /></label>
        <div className="form-grid">
          <label className="form-field"><small className="inline-content">Valor</small><div className="currency-input"><small className="inline-content">R$</small><input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></div></label>
          <label className="form-field"><small className="inline-content">Data</small><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        </div>
        <label className="form-field"><small className="inline-content">Categoria</small><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories[type].map((item) => <option key={item}>{item}</option>)}</select></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{transaction ? "Salvar alterações" : "Adicionar movimentação"}</button></div>
      </form>
    </ModalShell>
  );
}

function GoalModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState(localDate(90));
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const numericTarget = Number(target);
    if (!name.trim() || !Number.isFinite(numericTarget) || numericTarget <= 0 || !deadline) {
      setError("Informe o nome, um valor maior que zero e o prazo.");
      return;
    }
    onSave({ name: name.trim(), target: roundMoney(numericTarget), deadline });
  }

  return (
    <ModalShell title="Criar Caixinha" subtitle="Dê um nome ao seu próximo objetivo." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label className="form-field"><small className="inline-content">Nome do objetivo</small><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: celular novo, show, viagem" maxLength={50} /></label>
        <div className="form-grid">
          <label className="form-field"><small className="inline-content">Quanto quer guardar?</small><div className="currency-input"><small className="inline-content">R$</small><input type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="0,00" /></div></label>
          <label className="form-field"><small className="inline-content">Prazo</small><input type="date" min={localDate()} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">Criar Caixinha</button></div>
      </form>
    </ModalShell>
  );
}

function MovementModal({ goal, movementType, available, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const isDeposit = movementType === "deposit";

  function submit(event) {
    event.preventDefault();
    const numericAmount = roundMoney(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (isDeposit && numericAmount > available) {
      setError(`Você tem ${money.format(available)} disponíveis para guardar.`);
      return;
    }
    if (!isDeposit && numericAmount > goal.saved) {
      setError(`Esta Caixinha tem ${money.format(goal.saved)} guardados.`);
      return;
    }
    onSave(numericAmount);
  }

  return (
    <ModalShell title={isDeposit ? "Guardar na Caixinha" : "Retirar da Caixinha"} subtitle={goal?.name ?? ""} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="movement-info"><small className="inline-content">{isDeposit ? "Disponível para guardar" : "Guardado nesta Caixinha"}</small><strong>{money.format(isDeposit ? available : goal.saved)}</strong></div>
        <label className="form-field"><small className="inline-content">Valor</small><div className="currency-input"><small className="inline-content">R$</small><input autoFocus type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></div></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{isDeposit ? "Confirmar depósito" : "Confirmar retirada"}</button></div>
      </form>
    </ModalShell>
  );
}
