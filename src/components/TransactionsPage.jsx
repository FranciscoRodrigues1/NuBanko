import EmptyState from "./EmptyState.jsx";
import Icon from "./Icon.jsx";
import TransactionRow from "./TransactionRow.jsx";
import "./TransactionsPage.css";

const filters = [["all", "Todas"], ["income", "Entradas"], ["expense", "Saídas"]];

export default function TransactionsPage({
  transactions,
  filter,
  query,
  onFilter,
  onQuery,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">SEU HISTÓRICO</p><h1>Movimentações</h1><p className="heading-copy">Acompanhe e organize cada entrada e saída.</p></div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Nova movimentação</button>
      </section>
      <section className="panel transactions-panel" aria-label="Histórico de movimentações">
        <header className="transaction-toolbar">
          <nav className="filter-tabs" aria-label="Filtrar movimentações">
            {filters.map(([value, label]) => (
              <button key={value} className={filter === value ? "filter-tab selected" : "filter-tab"} type="button" onClick={() => onFilter(value)} aria-pressed={filter === value}>{label}</button>
            ))}
          </nav>
          <label className="search-field"><span className="search-symbol" aria-hidden="true">⌕</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar movimentação" aria-label="Buscar movimentação" /></label>
        </header>
        {transactions.length ? (
          <section className="transaction-list" aria-label="Resultados">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                actions={
                  <nav className="row-actions" aria-label={`Ações para ${transaction.description}`}>
                    <button className="icon-button" type="button" aria-label={`Editar ${transaction.description}`} onClick={() => onEdit(transaction)}><Icon name="edit" size={16} /></button>
                    <button className="icon-button danger-hover" type="button" aria-label={`Excluir ${transaction.description}`} onClick={() => window.confirm(`Excluir "${transaction.description}"?`) && onDelete(transaction)}><Icon name="trash" size={16} /></button>
                  </nav>
                }
              />
            ))}
          </section>
        ) : <EmptyState title="Nenhum resultado encontrado" text="Tente mudar os filtros ou adicione uma movimentação." />}
      </section>
    </>
  );
}
