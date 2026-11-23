import { useEffect, useMemo, useState } from "react";
import ConfettiCelebration from "./components/ConfettiCelebration.jsx";
import AssistantAgent from "./components/AssistantAgent.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Login from "./components/Login.jsx";
import Main from "./components/Main.jsx";
import {
  endSession,
  getSessionEmail,
} from "./services/authService.js";
import {
  addGoal,
  deleteGoal,
  deleteTransaction,
  getMonthSummary,
  getSavingsLevel,
  getTotals,
  clearSavedStates,
  moveGoal,
  money,
  readSavedState,
  saveState,
  saveTransaction,
  transferGoal,
} from "./services/financeService.js";
import {
  readThemePreference,
  saveThemePreference,
} from "./services/themeService.js";
import {
  readProfilePreference,
  saveProfilePreference,
} from "./services/profileService.js";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accountEmail, setAccountEmail] = useState(null);
  const [initialState] = useState(() => {
    endSession();
    clearSavedStates();
    return readSavedState(null);
  });
  const [initialProfile] = useState(() =>
    readProfilePreference(getSessionEmail()),
  );
  const [transactions, setTransactions] = useState(initialState.data.transactions);
  const [goals, setGoals] = useState(initialState.data.goals);
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState(initialState.error || initialProfile.error);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(readThemePreference);
  const [profileAvatarId, setProfileAvatarId] = useState(initialProfile.avatarId);
  const [celebration, setCelebration] = useState(null);
  const [nubiActivity, setNubiActivity] = useState(null);

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
  const savingsLevel = useMemo(
    () => getSavingsLevel(totals.reserved),
    [totals.reserved],
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

  function notifyNubi(message) {
    setNubiActivity((current) => ({
      id: (current?.id ?? 0) + 1,
      text: message,
    }));
  }

  function handleLogin() {
    const email = getSessionEmail();
    const saved = readSavedState(email);
    const profile = readProfilePreference(email);
    setAccountEmail(email);
    setTransactions(saved.data.transactions);
    setGoals(saved.data.goals);
    setProfileAvatarId(profile.avatarId);
    setNotice(saved.error || profile.error);
    setAuthenticated(true);
  }

  function handleAvatarSelect(avatarId) {
    try {
      saveProfilePreference(avatarId, accountEmail);
      setProfileAvatarId(avatarId);
      showNotice("Avatar atualizado.");
    } catch (error) {
      console.error("Não foi possível salvar o avatar do perfil.", error);
      showNotice("Não foi possível salvar o avatar neste navegador.");
    }
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
    const description = values.description.trim();
    const amount = money.format(values.amount);
    notifyNubi(
      modal?.transaction
        ? `Atualizei "${description}" para ${amount}. Seu resumo já está em dia.`
        : values.type === "income"
          ? `Entrada de ${amount} anotada em "${description}". Seus números já foram atualizados.`
          : `Despesa de ${amount} anotada em "${description}". Agora ela também aparece no seu resumo.`,
    );
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
    notifyNubi(
      `A movimentação "${transaction.description}" foi excluída. Seu saldo disponível já foi recalculado.`,
    );
    showNotice("Movimentação excluída.");
  }

  function handleSaveGoal(values) {
    setGoals((current) => addGoal(current, values));
    setModal(null);
    notifyNubi(`Caixinha "${values.name}" criada. Você pode avançar nela no seu ritmo.`);
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
      } else {
        showNotice("Não encontrei essa Caixinha ou o valor informado não é válido.");
      }
      return false;
    }

    const updatedGoal = result.goals.find((goal) => goal.id === goalId);
    setGoals(result.goals);
    setModal(null);
    notifyNubi(
      movementType === "deposit"
        ? `${money.format(amount)} adicionados à Caixinha "${updatedGoal.name}". Um passo de cada vez!`
        : `Retirada de ${money.format(amount)} registrada na Caixinha "${updatedGoal.name}". Seu saldo livre foi atualizado.`,
    );

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
    notifyNubi(
      `A Caixinha "${goal.name}" foi removida. O valor guardado voltou para o saldo livre.`,
    );
    showNotice("Caixinha excluída.");
  }

  function executeAssistantAction(action) {
    if (action.type === "goal-movement") {
      return handleMoveGoal(
        action.goalId,
        action.movementType,
        action.amount,
      );
    }

    if (action.type === "record-transaction") {
      return handleSaveTransaction(action.values);
    }

    if (action.type === "goal-transfer") {
      const sourceGoal = goals.find((goal) => goal.id === action.sourceGoalId);
      const destinationGoal = goals.find((goal) => goal.id === action.destinationGoalId);
      const result = transferGoal(
        goals,
        action.sourceGoalId,
        action.destinationGoalId,
        action.amount,
      );
      if (!result.ok) {
        showNotice(
          result.reason === "insufficient-goal-balance"
            ? "O valor supera o saldo da Caixinha de origem."
            : "Não foi possível localizar as Caixinhas para fazer a transferência.",
        );
        return false;
      }

      setGoals(result.goals);
      setModal(null);
      notifyNubi(
        `${money.format(action.amount)} transferidos de "${sourceGoal.name}" para "${destinationGoal.name}".`,
      );
      showNotice("Transferência entre Caixinhas realizada.");
      return true;
    }

    showNotice("Não reconheci essa operação. Nenhum dado foi alterado.");
    return false;
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
    savingsLevel,
    available: totals.available,
    transactions: sortedTransactions.slice(0, 5),
    onAdd: () => setModal({ type: "transaction" }),
    onAddGoal: () => setModal({ type: "goal" }),
    onQuickSave: () => {
      if (goals.length) {
        setModal({
          type: "movement",
          goalId: goals[0].id,
          movementType: "deposit",
        });
      } else {
        setModal({ type: "goal" });
      }
    },
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
        savingsLevel={savingsLevel}
        profileAvatarId={profileAvatarId}
        onAvatarSelect={handleAvatarSelect}
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
      <AssistantAgent
        context={{ totals, monthSummary, goals, savingsLevel }}
        activity={nubiActivity}
        onNavigate={setPage}
        onExecuteAction={executeAssistantAction}
      />
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
