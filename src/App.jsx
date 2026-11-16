import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nubanko-demo-state";

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

    return { data, error: "" };
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
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(initialState.error);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ transactions, goals }),
      );
    } catch (error) {
      console.error("Não foi possível salvar os dados locais do NuBanko.", error);
      setNotice("Não foi possível salvar as alterações neste navegador.");
    }
  }, [transactions, goals]);

  const totals = useMemo(() => getTotals(transactions, goals), [transactions, goals]);
  const monthKey = localDate().slice(0, 7);
  const thisMonth = transactions.filter((item) => item.date.startsWith(monthKey));
  const monthIncome = thisMonth
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const monthExpenses = thisMonth
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

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
  const recentTransactions = sortedTransactions.slice(0, 5);
  const expenseByCategory = thisMonth
    .filter((item) => item.type === "expense")
    .reduce((result, item) => {
      result[item.category] = (result[item.category] ?? 0) + item.amount;
      return result;
    }, {});
  const chartItems = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  const maxCategoryExpense = Math.max(...chartItems.map((item) => item.amount), 1);
  const title = page === "home" ? "Visão geral" : page === "transactions" ? "Movimentações" : "Caixinhas";

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  }

  function saveTransaction(values) {
    const next = modal.transaction
      ? transactions.map((item) =>
          item.id === modal.transaction.id ? { ...values, id: item.id } : item,
        )
      : [...transactions, { ...values, id: makeId() }];
    if (getTotals(next, goals).available < 0) {
      showNotice("Essa alteração deixaria o saldo disponível negativo.");
      return false;
    }
    setTransactions(next);
    setModal(null);
    showNotice(modal.transaction ? "Movimentação atualizada." : "Movimentação adicionada.");
    return true;
  }

  function removeTransaction(transaction) {
    const next = transactions.filter((item) => item.id !== transaction.id);
    if (getTotals(next, goals).available < 0) {
      showNotice("Não é possível excluir: o saldo disponível ficaria negativo.");
      return;
    }
    setTransactions(next);
    showNotice("Movimentação excluída.");
  }

  function saveGoal(values) {
    setGoals((current) => [...current, { ...values, id: makeId(), saved: 0 }]);
    setModal(null);
    showNotice("Caixinha criada.");
  }

  function moveGoal(goalId, type, amount) {
    const goal = goals.find((item) => item.id === goalId);
    if (!goal || !Number.isFinite(amount) || amount <= 0) return false;
    if (type === "deposit" && amount > totals.available) {
      showNotice("O valor do depósito supera seu saldo disponível.");
      return false;
    }
    if (type === "withdraw" && amount > goal.saved) {
      showNotice("O valor da retirada supera o saldo desta Caixinha.");
      return false;
    }
    setGoals((current) =>
      current.map((item) =>
        item.id === goalId
          ? {
              ...item,
              saved: roundMoney(item.saved + (type === "deposit" ? amount : -amount)),
            }
          : item,
      ),
    );
    setModal(null);
    showNotice(type === "deposit" ? "Depósito realizado." : "Retirada realizada.");
    return true;
  }

  function removeGoal(goal) {
    if (!window.confirm(`Excluir a Caixinha "${goal.name}"? O valor guardado voltará ao saldo disponível.`)) {
      return;
    }
    setGoals((current) => current.filter((item) => item.id !== goal.id));
    showNotice("Caixinha excluída.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage("home"); }}>
          <span className="brand-mark">n</span>
          <span>nu<span className="brand-light">banko</span></span>
        </a>
        <div className="workspace-label">SEU ESPAÇO</div>
        <nav className="main-nav" aria-label="Navegação principal">
          <NavButton active={page === "home"} icon="home" onClick={() => setPage("home")}>Visão geral</NavButton>
          <NavButton active={page === "transactions"} icon="list" onClick={() => setPage("transactions")}>Movimentações</NavButton>
          <NavButton active={page === "goals"} icon="target" onClick={() => setPage("goals")}>Caixinhas</NavButton>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Icon name="trend" size={18} /></span>
            <strong>Pequenos passos, grandes planos.</strong>
            <p>Seu futuro financeiro começa com uma escolha de cada vez.</p>
          </div>
          <div className="profile">
            <div className="avatar">M</div>
            <div className="profile-copy"><strong>Minha conta</strong><span>Modo demonstração</span></div>
            <span className="profile-status" aria-label="Conta demonstrativa" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">n</span> nubanko</div>
          <div className="breadcrumbs"><span>Início</span><Icon name="chevron" size={15} /><strong>{title}</strong></div>
          <div className="topbar-right">
            <div className="demo-pill"><span /> Dados salvos neste navegador</div>
            <div className="avatar top-avatar" aria-hidden="true">M</div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
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
              transactions={recentTransactions}
              onAdd={() => setModal({ type: "transaction" })}
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
        </div>
        <footer className="app-footer">
          <span><Icon name="shield" size={14} /> Demonstração — não conectada a bancos ou serviços externos.</span>
          <span>NuBanko · Organização financeira, do seu jeito.</span>
        </footer>
      </main>

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
      <Icon name={icon} size={19} /><span>{children}</span>{active && <span className="nav-indicator" />}
    </button>
  );
}

function Dashboard({ totals, monthIncome, monthExpenses, chartItems, maxCategoryExpense, goals, transactions, onAdd, onNavigate }) {
  const now = new Date();
  const greetingDate = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">{greetingDate}</p>
          <h1>Seu dinheiro, <span>em equilíbrio.</span></h1>
          <p className="heading-copy">Um panorama simples para você cuidar dos seus planos.</p>
        </div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Nova movimentação</button>
      </section>

      <section className="overview-grid" aria-label="Resumo financeiro">
        <article className="balance-card">
          <div className="balance-card-top">
            <div><span className="card-kicker">SALDO DISPONÍVEL</span><span className="balance-label">Para usar agora</span></div>
            <span className="balance-icon"><Icon name="wallet" size={21} /></span>
          </div>
          <strong className="balance-value">{money.format(totals.available)}</strong>
          <div className="balance-card-bottom">
            <span>Saldo total <strong>{money.format(totals.balance)}</strong></span>
            <span>Guardado <strong>{money.format(totals.reserved)}</strong></span>
          </div>
          <span className="balance-orb orb-one" /><span className="balance-orb orb-two" />
        </article>
        <MetricCard label="Entradas no mês" value={money.format(monthIncome)} icon="arrowDown" kind="positive" caption="Dinheiro que chegou" />
        <MetricCard label="Saídas no mês" value={money.format(monthExpenses)} icon="arrowUp" kind="negative" caption="Dinheiro que saiu" />
      </section>

      <section className="dashboard-grid">
        <article className="panel spending-panel">
          <div className="panel-heading">
            <div><h2>Para onde vai seu dinheiro</h2><p>Despesas por categoria neste mês</p></div>
            <span className="panel-icon"><Icon name="trend" size={18} /></span>
          </div>
          {chartItems.length ? (
            <div className="category-chart">
              {chartItems.slice(0, 5).map((item, index) => (
                <div className="category-row" key={item.category}>
                  <div className="category-label"><span className={`category-dot dot-${index % 5}`} />{item.category}<strong>{money.format(item.amount)}</strong></div>
                  <div className="bar-track"><span className={`bar-fill bar-${index % 5}`} style={{ width: `${Math.max(5, (item.amount / maxCategoryExpense) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="Tudo tranquilo por aqui" text="Suas despesas deste mês aparecerão nesta área." />}
          <div className="panel-footnote"><span className="footnote-dot" /> Total de saídas <strong>{money.format(monthExpenses)}</strong></div>
        </article>

        <article className="panel goals-panel">
          <div className="panel-heading">
            <div><h2>Seus planos</h2><p>Continue perto do que importa</p></div>
            <button className="text-button" type="button" onClick={() => onNavigate("goals")}>Ver todas <Icon name="chevron" size={15} /></button>
          </div>
          {goals.length ? goals.slice(0, 2).map((goal, index) => (
            <GoalProgress key={goal.id} goal={goal} variant={index} />
          )) : <EmptyState title="Um plano começa com uma ideia" text="Crie uma Caixinha para acompanhar seu próximo objetivo." />}
          <button className="goal-add-link" type="button" onClick={() => onNavigate("goals")}><Icon name="plus" size={16} /> Organizar minhas Caixinhas</button>
        </article>
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
    </>
  );
}

function MetricCard({ label, value, icon, kind, caption }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span className={`metric-icon ${kind}`}><Icon name={icon} size={17} /></span><span className="metric-period">Este mês</span></div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-caption">{caption}</span>
    </article>
  );
}

function GoalProgress({ goal, variant = 0 }) {
  const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  return (
    <div className="goal-progress">
      <div className="goal-progress-top">
        <span className={`goal-symbol goal-symbol-${variant % 2}`}><Icon name="target" size={17} /></span>
        <div className="goal-title-wrap"><strong>{goal.name}</strong><span>Até {new Date(`${goal.deadline}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span></div>
        <span className="goal-percent">{progress}%</span>
      </div>
      <div className="goal-track"><span className={`goal-fill goal-fill-${variant % 2}`} style={{ width: `${progress}%` }} /></div>
      <div className="goal-values"><span>{money.format(goal.saved)} guardados</span><strong>{money.format(goal.target)}</strong></div>
    </div>
  );
}

function TransactionRow({ transaction, actions }) {
  const isIncome = transaction.type === "income";
  return (
    <div className="transaction-row">
      <span className={`transaction-kind ${isIncome ? "income" : "expense"}`}><Icon name={isIncome ? "arrowDown" : "arrowUp"} size={17} /></span>
      <div className="transaction-main"><strong>{transaction.description}</strong><span>{transaction.category}</span></div>
      <span className="transaction-date">{new Date(`${transaction.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
      <strong className={`transaction-amount ${isIncome ? "income-text" : ""}`}>{isIncome ? "+" : "−"} {money.format(transaction.amount)}</strong>
      {actions}
    </div>
  );
}

function TransactionsPage({ transactions, filter, query, onFilter, onQuery, onAdd, onEdit, onDelete }) {
  return (
    <>
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
          <label className="search-field"><span className="search-symbol">⌕</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar movimentação" aria-label="Buscar movimentação" /></label>
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
    </>
  );
}

function GoalsPage({ goals, available, onAdd, onMove, onDelete }) {
  const savedTotal = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const targetTotal = goals.reduce((sum, goal) => sum + goal.target, 0);

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">SEUS PRÓXIMOS PASSOS</p><h1>Caixinhas</h1><p className="heading-copy">Pequenos depósitos que aproximam você dos seus planos.</p></div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Nova Caixinha</button>
      </section>
      <section className="goals-summary">
        <div className="goals-summary-icon"><Icon name="target" size={22} /></div>
        <div><span>Você já guardou</span><strong>{money.format(savedTotal)}</strong></div>
        <div className="summary-divider" />
        <div><span>Objetivo total</span><strong>{money.format(targetTotal)}</strong></div>
        <div className="summary-spacer" />
        <div className="available-chip"><span>Disponível para guardar</span><strong>{money.format(available)}</strong></div>
      </section>
      {goals.length ? (
        <section className="goal-cards">
          {goals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
            return (
              <article className={`goal-card goal-card-${index % 2}`} key={goal.id}>
                <div className="goal-card-top"><span className={`goal-card-symbol goal-symbol-${index % 2}`}><Icon name="target" size={21} /></span><button className="icon-button danger-hover" type="button" aria-label={`Excluir ${goal.name}`} onClick={() => onDelete(goal)}><Icon name="trash" size={17} /></button></div>
                <h2>{goal.name}</h2>
                <p className="goal-deadline"><Icon name="calendar" size={15} /> Prazo: {new Date(`${goal.deadline}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>
                <div className="goal-card-amounts"><strong>{money.format(goal.saved)}</strong><span>de {money.format(goal.target)}</span></div>
                <div className="goal-track large"><span className={`goal-fill goal-fill-${index % 2}`} style={{ width: `${progress}%` }} /></div>
                <div className="goal-card-bottom"><span>{progress}% completo</span><span>{money.format(Math.max(0, goal.target - goal.saved))} restantes</span></div>
                <div className="goal-card-actions">
                  <button className="button button-soft" type="button" disabled={available <= 0} onClick={() => onMove(goal.id, "deposit")}><Icon name="arrowDown" size={16} /> Guardar</button>
                  <button className="button button-outline" type="button" disabled={goal.saved <= 0} onClick={() => onMove(goal.id, "withdraw")}><Icon name="arrowUp" size={16} /> Retirar</button>
                </div>
              </article>
            );
          })}
        </section>
      ) : <div className="panel"><EmptyState title="Ainda não há Caixinhas" text="Crie um objetivo e comece a guardar para algo que importa." /></div>}
      <div className="goals-note"><Icon name="shield" size={16} /><span>Depósitos e retiradas são controles demonstrativos: não movimentam dinheiro real.</span></div>
    </>
  );
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="wallet" size={22} /></span><strong>{title}</strong><p>{text}</p></div>;
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

  function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || !date) {
      setError("Preencha a descrição, um valor maior que zero e a data.");
      return;
    }
    const availableForExpense = available + (transaction?.type === "expense" ? transaction.amount : 0);
    if (type === "expense" && numericAmount > availableForExpense) {
      setError(`O valor não pode superar seu saldo disponível (${money.format(availableForExpense)}).`);
      return;
    }
    onSave({ description: description.trim(), amount: roundMoney(numericAmount), type, category, date });
  }

  return (
    <ModalShell title={transaction ? "Editar movimentação" : "Nova movimentação"} subtitle="Registre seu dinheiro com clareza." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="type-switch" role="group" aria-label="Tipo de movimentação">
          <button type="button" className={type === "expense" ? "type-option selected expense-option" : "type-option"} onClick={() => updateType("expense")}><Icon name="arrowUp" size={16} /> Saída</button>
          <button type="button" className={type === "income" ? "type-option selected income-option" : "type-option"} onClick={() => updateType("income")}><Icon name="arrowDown" size={16} /> Entrada</button>
        </div>
        <label className="form-field"><span>Descrição</span><input autoFocus value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: Conta de luz" maxLength={70} /></label>
        <div className="form-grid">
          <label className="form-field"><span>Valor</span><div className="currency-input"><span>R$</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></div></label>
          <label className="form-field"><span>Data</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        </div>
        <label className="form-field"><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories[type].map((item) => <option key={item}>{item}</option>)}</select></label>
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
        <label className="form-field"><span>Nome do objetivo</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Viagem de férias" maxLength={50} /></label>
        <div className="form-grid">
          <label className="form-field"><span>Quanto quer guardar?</span><div className="currency-input"><span>R$</span><input type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="0,00" /></div></label>
          <label className="form-field"><span>Prazo</span><input type="date" min={localDate()} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
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
        <div className="movement-info"><span>{isDeposit ? "Disponível para guardar" : "Guardado nesta Caixinha"}</span><strong>{money.format(isDeposit ? available : goal.saved)}</strong></div>
        <label className="form-field"><span>Valor</span><div className="currency-input"><span>R$</span><input autoFocus type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></div></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{isDeposit ? "Confirmar depósito" : "Confirmar retirada"}</button></div>
      </form>
    </ModalShell>
  );
}

export default App;
