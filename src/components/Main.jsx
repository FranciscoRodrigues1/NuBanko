import Dashboard from "./Dashboard.jsx";
import GoalsPage from "./GoalsPage.jsx";
import TransactionModal from "./TransactionModal.jsx";
import TransactionsPage from "./TransactionsPage.jsx";
import GoalModal from "./GoalModal.jsx";
import MovementModal from "./MovementModal.jsx";
import "./Main.css";

export default function Main({
  page,
  notice,
  onDismissNotice,
  dashboard,
  transactionsPage,
  goalsPage,
  modal,
  onCloseModal,
  onSaveTransaction,
  onSaveGoal,
  onSaveMovement,
}) {
  return (
    <main className="page-content">
      {notice && (
        <aside className="notice" role="status">
          <span>{notice}</span>
          <button className="notice-close" type="button" aria-label="Fechar aviso" onClick={onDismissNotice}>×</button>
        </aside>
      )}
      {page === "home" && <Dashboard {...dashboard} />}
      {page === "transactions" && <TransactionsPage {...transactionsPage} />}
      {page === "goals" && <GoalsPage {...goalsPage} />}
      {modal?.type === "transaction" && (
        <TransactionModal
          transaction={modal.transaction}
          available={dashboard.totals.available}
          onClose={onCloseModal}
          onSave={onSaveTransaction}
        />
      )}
      {modal?.type === "goal" && <GoalModal onClose={onCloseModal} onSave={onSaveGoal} />}
      {modal?.type === "movement" && modal.goal && (
        <MovementModal
          goal={modal.goal}
          movementType={modal.movementType}
          available={dashboard.totals.available}
          onClose={onCloseModal}
          onSave={onSaveMovement}
        />
      )}
    </main>
  );
}
