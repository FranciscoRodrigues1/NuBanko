import { useEffect, useMemo, useState } from "react";
import ConfettiCelebration from "./components/ConfettiCelebration.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Login from "./components/Login.jsx";
import Main from "./components/Main.jsx";
import {
  endSession,
  getSessionEmail,
  hasSession,
} from "./services/authService.js";
import {
  addGoal,
  deleteGoal,
  deleteTransaction,
  getMonthSummary,
  getSavingsLevel,
  getTotals,
  moveGoal,
  readSavedState,
  roundMoney,
  saveState,
  saveTransaction,
} from "./services/financeService.js";
import {
  readThemePreference,
  saveThemePreference,
} from "./services/themeService.js";

export default function App() {
  const [authenticated, setAuthenticated] = useState(hasSession);
  const [accountEmail, setAccountEmail] = useState(getSessionEmail);
  const [initialState] = useState(() => readSavedState(getSessionEmail()));
  const [transactions, setTransactions] = useState(initialState.data.transactions);
  const [goals, setGoals] = useState(initialState.data.goals);
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(initialState.error);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(readThemePreference);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    if (!authenticated) return;
    try {
      saveState(transactions, goals, accountEmail);
    } catch (error) {
      console.error("Não foi possível salvar os dados locais do NuBanko.", error);
      setNotice("Não foi possível salvar as alterações neste navegador.");
    }
  }, [authenticated, accountEmail, transactions, goals]);

  useEffect(() => {
    saveThemePreference(theme);
  }, [theme]);

  const totals = useMemo(
    () => getTotals(transactions, goals),
    [transactions, goals],
  );
  const monthSummary = useMemo(
    () => getMonthSummary(transactions),
    [transactions],
  );
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );
  const visibleTransactions = useMemo(
    () =>
      sortedTransactions.filter((transaction) => {
        const matchesType =
          filter === "all" || transaction.type === filter;
        const matchesQuery = `${transaction.description} ${transaction.category}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR"));
        return matchesType && matchesQuery;
      }),
    [sortedTransactions, filter, query],
  );

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  }

  function handleLogin() {
    const email = getSessionEmail();
    const saved = readSavedState(email);
    setAccountEmail(email);
    setTransactions(saved.data.transactions);
    setGoals(saved.data.goals);
    setNotice(saved.error);
    setAuthenticated(true);
  }

  function handleLogout() {
    endSession();
    setAuthenticated(false);
    setAccountEmail(null);
    setPage("home");
  }

  function handleSaveTransaction(values) {
    const result = saveTransaction(
      transactions,
      goals,
      values,
      modal?.transaction,
    );
    if (!result.ok) {
      showNotice("Essa alteração deixaria o saldo disponível negativo.");
      return false;
    }
    setTransactions(result.transactions);
    setModal(null);
    showNotice(
      modal?.transaction
        ? "Movimentação atualizada."
        : "Movimentação adicionada.",
    );
    return true;
  }

  function handleDeleteTransaction(transaction) {
    const result = deleteTransaction(
      transactions,
      goals,
      transaction.id,
    );
    if (!result.ok) {
      showNotice(
        "Não é possível excluir: o saldo disponível ficaria negativo.",
      );
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

  function handleMoveGoal(goalId, movementType, amount) {
    const previousGoal = goals.find((goal) => goal.id === goalId);
    const result = moveGoal(
      goals,
      totals.available,
      goalId,
      movementType,
      amount,
    );
    if (!result.ok) {
      if (result.reason === "insufficient-available") {
        showNotice("O valor do depósito supera seu saldo disponível.");
      } else if (result.reason === "insufficient-goal-balance") {
        showNotice("O valor da retirada supera o saldo desta Caixinha.");
      }
      return false;
    }

    const updatedGoal = result.goals.find((goal) => goal.id === goalId);
    setGoals(result.goals);
    setModal(null);

    if (
      movementType === "deposit" &&
      previousGoal.saved < previousGoal.target &&
      updatedGoal.saved >= updatedGoal.target
    ) {
      setCelebration({ id: Date.now(), goalName: updatedGoal.name });
      showNotice(`Meta desbloqueada! Você conquistou "${updatedGoal.name}".`);
    } else if (movementType === "deposit") {
      showNotice(`Boa! ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)} a mais no seu sonho.`);
    } else {
      showNotice("Retirada realizada. Seu saldo disponível foi atualizado.");
    }
    return true;
  }

  function handleDeleteGoal(goal) {
    if (
      !window.confirm(
        `Excluir a Caixinha "${goal.name}"? O valor guardado voltará ao saldo disponível.`,
      )
    ) {
      return;
    }
    setGoals((current) => deleteGoal(current, goal.id));
    showNotice("Caixinha excluída.");
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
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

  const modalGoal = modal?.goalId
    ? goals.find((goal) => goal.id === modal.goalId)
    : null;

  return (
    <div
      className="app-shell"
      data-theme={theme}
    >
      <Header
        page={page}
        onNavigate={setPage}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        savingsLevel={getSavingsLevel(totals.reserved)}
      />
      <div className="main-content">
        <Main
          page={page}
          notice={notice}
          onDismissNotice={() => setNotice("")}
          dashboard={dashboard}
          transactionsPage={{
            transactions: visibleTransactions,
            filter,
            query,
            onFilter: setFilter,
            onQuery: setQuery,
            onAdd: () => setModal({ type: "transaction" }),
            onEdit: (transaction) =>
              setModal({ type: "transaction", transaction }),
            onDelete: handleDeleteTransaction,
          }}
          goalsPage={{
            goals,
            available: totals.available,
            onAdd: () => setModal({ type: "goal" }),
            onMove: (goalId, movementType) =>
              setModal({ type: "movement", goalId, movementType }),
            onDelete: handleDeleteGoal,
          }}
          modal={
            modalGoal
              ? { ...modal, goal: modalGoal }
              : modal
          }
          onCloseModal={() => setModal(null)}
          onSaveTransaction={handleSaveTransaction}
          onSaveGoal={handleSaveGoal}
          onSaveMovement={(amount) =>
            handleMoveGoal(modal.goalId, modal.movementType, amount)
          }
        />
        <Footer />
      </div>
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
