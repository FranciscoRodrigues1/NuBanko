import { useEffect, useMemo, useState } from "react";
import ConfettiCelebration from "./components/ConfettiCelebration.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Login from "./components/Login.jsx";
import Main from "./components/Main.jsx";
import {
  addGoal,
  deleteGoal,
  deleteTransaction,
  getMonthSummary,
  getSavingsLevel,
  getTotals,
  moveGoal,
  readSavedState,
  saveState,
  saveTransaction,
} from "./services/financeService.js";
import { endSession, getSessionEmail, hasSession } from "./services/authService.js";
import { readThemePreference, saveThemePreference } from "./services/themeService.js";
import "./App.css";

export default function App() {
  const [initialState] = useState(() => readSavedState(getSessionEmail()));
  const [transactions, setTransactions] = useState(initialState.data.transactions);
  const [goals, setGoals] = useState(initialState.data.goals);
  const [authenticated, setAuthenticated] = useState(hasSession);
  const [theme, setTheme] = useState(readThemePreference);
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(initialState.error);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    if (!authenticated) return;
    try {
      saveState(transactions, goals, getSessionEmail());
    } catch (error) {
      console.error("Não foi possível salvar os dados locais do NuBanko.", error);
      setNotice("Não foi possível salvar as alterações neste navegador.");
    }
  }, [transactions, goals, authenticated]);

  useEffect(() => {
    try {
      saveThemePreference(theme);
    } catch (error) {
      console.error("Não foi possível salvar a preferência de tema do NuBanko.", error);
      setNotice("Não foi possível salvar sua preferência de tema.");
    }
  }, [theme]);

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
    setModal(null);
    showNotice(modal.movementType === "deposit" ? "Depósito realizado." : "Retirada realizada.");
    return true;
  }

  function handleDeleteGoal(goal) {
    if (!window.confirm(`Excluir a Caixinha "${goal.name}"? O valor guardado voltará ao saldo disponível.`)) {
      return;
    }
    setGoals((current) => deleteGoal(current, goal.id));
    showNotice("Caixinha excluída.");
  }

  function logout() {
    endSession();
    setAuthenticated(false);
    setPage("home");
    setModal(null);
  }

  function login() {
    const saved = readSavedState(getSessionEmail());
    setTransactions(saved.data.transactions);
    setGoals(saved.data.goals);
    setNotice(saved.error);
    setAuthenticated(true);
  }

  if (!authenticated) {
    return <Login onLogin={login} />;
  }

  const dashboard = {
    totals,
    monthIncome: monthSummary.income,
    monthExpenses: monthSummary.expenses,
    chartItems: monthSummary.chartItems,
    maxCategoryExpense: monthSummary.maxCategoryExpense,
    goals,
    transactions: sortedTransactions.slice(0, 5),
    onAdd: () => setModal({ type: "transaction" }),
    onNavigate: setPage,
  };
  const transactionsPage = {
    transactions: visibleTransactions,
    filter,
    query,
    onFilter: setFilter,
    onQuery: setQuery,
    onAdd: () => setModal({ type: "transaction" }),
    onEdit: (transaction) => setModal({ type: "transaction", transaction }),
    onDelete: handleDeleteTransaction,
  };
  const goalsPage = {
    goals,
    available: totals.available,
    onAdd: () => setModal({ type: "goal" }),
    onMove: (goalId, movementType) => setModal({ type: "movement", goalId, movementType }),
    onDelete: handleDeleteGoal,
  };
  const activeModal = modal?.type === "movement"
    ? { ...modal, goal: goals.find((item) => item.id === modal.goalId) }
    : modal;

  return (
    <div className="app-shell" data-theme={theme}>
      <Header
        page={page}
        onNavigate={setPage}
        onLogout={logout}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        savingsLevel={getSavingsLevel(totals.reserved)}
      />
      <section className="main-content" aria-label="Área principal do NuBanko">
        <Main
          page={page}
          notice={notice}
          onDismissNotice={() => setNotice("")}
          dashboard={dashboard}
          transactionsPage={transactionsPage}
          goalsPage={goalsPage}
          modal={activeModal}
          onCloseModal={() => setModal(null)}
          onSaveTransaction={handleSaveTransaction}
          onSaveGoal={handleSaveGoal}
          onSaveMovement={handleMoveGoal}
        />
        <Footer />
      </section>
      {celebration && (
        <ConfettiCelebration
          key={celebration.id}
          goalName={celebration.goalName}
          onComplete={() => setCelebration(null)}
        />
      )}
    </div>
  );
}
