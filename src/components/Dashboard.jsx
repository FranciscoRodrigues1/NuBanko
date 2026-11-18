import { categoryEmojis, money } from "../services/financeService.js";
import EmptyState from "./EmptyState.jsx";
import GoalProgress from "./GoalProgress.jsx";
import Icon from "./Icon.jsx";
import MetricCard from "./MetricCard.jsx";
import TransactionRow from "./TransactionRow.jsx";
import "./Dashboard.css";

export default function Dashboard({
  totals,
  monthIncome,
  monthExpenses,
  chartItems,
  maxCategoryExpense,
  goals,
  transactions,
  onAdd,
  onNavigate,
}) {
  const now = new Date();
  const greetingDate = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">{greetingDate}</p>
          <h1>Seu dinheiro, <span>em equilíbrio.</span></h1>
          <p className="heading-copy">Um panorama simples para você cuidar dos seus planos.</p>
        </div>
        <button className="button button-primary" type="button" onClick={onAdd}>
          <Icon name="plus" size={18} /> Nova movimentação
        </button>
      </section>

      <section className="overview-grid" aria-label="Resumo financeiro">
        <article className="balance-card">
          <header className="balance-card-top">
            <span><span className="card-kicker">SALDO DISPONÍVEL</span><span className="balance-label">Para usar agora</span></span>
            <span className="balance-icon"><Icon name="wallet" size={21} /></span>
          </header>
          <strong className="balance-value">{money.format(totals.available)}</strong>
          <dl className="balance-card-bottom">
            <div><dt>Saldo total</dt><dd>{money.format(totals.balance)}</dd></div>
            <div><dt>Guardado</dt><dd>{money.format(totals.reserved)}</dd></div>
          </dl>
          <span className="balance-orb orb-one" /><span className="balance-orb orb-two" />
        </article>
        <MetricCard label="Entradas no mês" value={money.format(monthIncome)} icon="arrowDown" kind="positive" caption="Dinheiro que chegou" />
        <MetricCard label="Saídas no mês" value={money.format(monthExpenses)} icon="arrowUp" kind="negative" caption="Dinheiro que saiu" />
      </section>

      <section className="dashboard-grid">
        <article className="panel spending-panel">
          <header className="panel-heading">
            <div><h2>Para onde vai seu dinheiro</h2><p>Despesas por categoria neste mês</p></div>
            <span className="panel-icon"><Icon name="trend" size={18} /></span>
          </header>
          {chartItems.length ? (
            <ol className="category-chart">
              {chartItems.slice(0, 5).map((item, index) => (
                <li className="category-row" key={item.category}>
                  <div className="category-label"><span className={`category-dot dot-${index % 5}`} />{categoryEmojis[item.category] ?? "✨"} {item.category}<strong>{money.format(item.amount)}</strong></div>
                  <div className="bar-track" aria-label={`${item.category}: ${money.format(item.amount)}`}>
                    <span className={`bar-fill bar-${index % 5}`} style={{ width: `${Math.max(5, (item.amount / maxCategoryExpense) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          ) : <EmptyState title="Tudo tranquilo por aqui" text="Suas despesas deste mês aparecerão nesta área." />}
          <footer className="panel-footnote"><span className="footnote-dot" /> Total de saídas <strong>{money.format(monthExpenses)}</strong></footer>
        </article>

        <article className="panel goals-panel">
          <header className="panel-heading">
            <div><h2>Seus planos</h2><p>Continue perto do que importa</p></div>
            <button className="text-button" type="button" onClick={() => onNavigate("goals")}>Ver todas <Icon name="chevron" size={15} /></button>
          </header>
          {goals.length ? goals.slice(0, 2).map((goal, index) => (
            <GoalProgress key={goal.id} goal={goal} variant={index} />
          )) : <EmptyState title="Um plano começa com uma ideia" text="Crie uma Caixinha para acompanhar seu próximo objetivo." />}
          <button className="goal-add-link" type="button" onClick={() => onNavigate("goals")}><Icon name="plus" size={16} /> Organizar minhas Caixinhas</button>
        </article>
      </section>

      <section className="panel recent-panel">
        <header className="panel-heading recent-heading">
          <div><h2>Movimentações recentes</h2><p>Suas últimas entradas e saídas</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate("transactions")}>Ver movimentações <Icon name="chevron" size={15} /></button>
        </header>
        {transactions.length ? (
          <section className="recent-list" aria-label="Últimas movimentações">
            {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
          </section>
        ) : <EmptyState title="Nenhuma movimentação ainda" text="Adicione sua primeira receita ou despesa para começar." />}
      </section>
    </>
  );
}
