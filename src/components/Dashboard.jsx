import { categoryEmojis, money } from "../services/financeService.js";
import EmptyState from "./EmptyState.jsx";
import Icon from "./Icon.jsx";
import MetricCard from "./MetricCard.jsx";
import TransactionRow from "./TransactionRow.jsx";
import "./Dashboard.css";

const achievements = [
  { emoji: "🌱", title: "Primeiro passo", description: "Fez seu primeiro depósito", unlocked: true },
  { emoji: "⚡", title: "No seu ritmo", description: "Guardou em 3 dias", unlocked: true },
  { emoji: "🏆", title: "Meta desbloqueada", description: "Concluiu uma Caixinha", unlocked: false },
];

export default function Dashboard({
  totals,
  monthIncome,
  monthExpenses,
  chartItems,
  maxCategoryExpense,
  goals,
  transactions,
  onAdd,
  onAddGoal,
  onQuickSave,
  onNavigate,
}) {
  const now = new Date();
  const greetingDate = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const featuredGoal = goals[0];
  const progress = featuredGoal
    ? Math.min(100, Math.round((featuredGoal.saved / featuredGoal.target) * 100))
    : 0;
  const remaining = featuredGoal
    ? Math.max(0, featuredGoal.target - featuredGoal.saved)
    : 0;
  const weeklyTarget = 200;
  const weeklySaved = Math.min(weeklyTarget, Math.max(0, totals.reserved * 0.12));
  const weeklyProgress = Math.round((weeklySaved / weeklyTarget) * 100);
  const history = [42, 47, 46, 58, 62, 68, 74].map((height, index) => ({
    height,
    label: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][index],
  }));

  return (
    <>
      <section className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">{greetingDate}</p>
          <h1>E aí, bora <span>realizar seus sonhos?</span></h1>
          <p className="heading-copy">Seu eu do futuro vai agradecer. Cada real conta!</p>
        </div>
        <button className="button button-primary" type="button" onClick={onAdd}>
          <Icon name="plus" size={18} /> Nova movimentação
        </button>
      </section>

      <section className="overview-grid" aria-label="Resumo financeiro">
        <article className="balance-card youth-balance">
          <header className="balance-card-top">
            <span><span className="card-kicker">VOCÊ JÁ ECONOMIZOU</span><span className="balance-label">Seu progresso até aqui</span></span>
            <span className="balance-icon"><Icon name="wallet" size={21} /></span>
          </header>
          <strong className="balance-value">{money.format(totals.reserved)}</strong>
          <dl className="balance-card-bottom">
            <div><dt>Livre agora</dt><dd>{money.format(totals.available)}</dd></div>
            <div><dt>Saldo geral</dt><dd>{money.format(totals.balance)}</dd></div>
          </dl>
          <span className="balance-orb orb-one" /><span className="balance-orb orb-two" />
        </article>
        <MetricCard label="Entradas no mês" value={money.format(monthIncome)} icon="arrowDown" kind="positive" caption="Dinheiro que chegou" />
        <MetricCard label="Saídas no mês" value={money.format(monthExpenses)} icon="arrowUp" kind="negative" caption="Dinheiro que saiu" />
      </section>

      <section className="dream-grid" aria-label="Meta principal e desafio da semana">
        <article className="featured-dream">
          <div className="dream-sticker" aria-hidden="true">{featuredGoal?.emoji ?? "✨"}</div>
          <p className="dream-kicker">SONHO EM FOCO <span>META PRINCIPAL</span></p>
          <h2>{featuredGoal?.name ?? "Qual sonho vamos tirar do papel?"}</h2>
          {featuredGoal ? (
            <>
              <p className="dream-subtitle">Você está mais perto do seu objetivo!</p>
              <div className="dream-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="dream-values"><strong>{money.format(featuredGoal.saved)}</strong><span>{progress}%</span></div>
              <p className="dream-remaining">Faltam {money.format(remaining)} de {money.format(featuredGoal.target)}</p>
              <button className="dream-save-button" type="button" disabled={totals.available <= 0} onClick={onQuickSave}>
                <Icon name="plus" size={18} /> Guardar dinheiro
              </button>
            </>
          ) : (
            <>
              <p className="dream-subtitle">Vale show, celular, viagem, curso ou independência. Você escolhe.</p>
              <button className="dream-save-button" type="button" onClick={onAddGoal}>
                <Icon name="plus" size={18} /> Criar meu primeiro objetivo
              </button>
            </>
          )}
        </article>

        <article className="weekly-dream">
          <p className="dream-kicker">DESAFIO DA SEMANA <span className="challenge-bolt">⚡</span></p>
          <h2>{weeklyProgress >= 100 ? "Desafio concluído!" : "Pequenos depósitos, grandes sonhos."}</h2>
          <p>{weeklyProgress >= 100 ? "Você fez do seu jeito. Curta essa conquista!" : "Junte R$ 200 até domingo. Qualquer valor ajuda."}</p>
          <div className="challenge-value"><strong>{money.format(weeklySaved)}</strong><span>de {money.format(weeklyTarget)}</span></div>
          <div className="challenge-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={weeklyProgress}>
            <span style={{ width: `${weeklyProgress}%` }} />
          </div>
          <div className="challenge-footer"><span>{weeklyProgress}% do desafio</span><span>Sem pressa, no seu ritmo.</span></div>
        </article>
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
                  <div className="bar-track"><span className={`bar-fill bar-${index % 5}`} style={{ width: `${Math.max(5, (item.amount / maxCategoryExpense) * 100)}%` }} /></div>
                </li>
              ))}
            </ol>
          ) : <EmptyState title="Tudo tranquilo por aqui" text="Suas despesas deste mês aparecerão nesta área." />}
          <footer className="panel-footnote"><span className="footnote-dot" /> Total de saídas <strong>{money.format(monthExpenses)}</strong></footer>
        </article>

        <article className="panel goals-panel">
          <header className="panel-heading">
            <div><h2>Mais sonhos no radar</h2><p>Seus próximos planos também contam</p></div>
            <button className="text-button" type="button" onClick={() => onNavigate("goals")}>Ver todos <Icon name="chevron" size={15} /></button>
          </header>
          {goals.length ? goals.slice(1, 3).map((goal, index) => {
            const goalProgress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
            return (
              <div className="dream-mini" key={goal.id}>
                <span className="dream-mini-icon" aria-hidden="true">{goal.emoji ?? "✨"}</span>
                <div><strong>{goal.name}</strong><span>{goalProgress}% completo</span></div>
                <div className="dream-mini-bar"><span style={{ width: `${goalProgress}%` }} /></div>
              </div>
            );
          }) : <p className="next-goal-note">Celular, show, viagem… qual vai ser seu primeiro plano?</p>}
          <button className="goal-add-link" type="button" onClick={onAddGoal}><Icon name="plus" size={16} /> Criar outro sonho</button>
        </article>
      </section>

      <section className="journey-grid">
        <article className="panel evolution-panel">
          <header className="panel-heading"><div><h2>Sua evolução</h2><p>Olha só o caminho que você já fez</p></div><span className="chart-period">7 DIAS</span></header>
          <strong className="evolution-total">{money.format(totals.reserved)}</strong>
          <div className="evolution-chart" aria-label="Evolução da economia nos últimos sete dias">
            {history.map((point) => (
              <div className="evolution-column" key={point.label}><span style={{ height: `${point.height}%` }} /><small>{point.label}</small></div>
            ))}
          </div>
          <p className="evolution-feedback">Cada real conta. Seu hábito está ficando mais forte!</p>
        </article>

        <article className="panel achievement-panel">
          <header className="panel-heading"><div><h2>Conquistas</h2><p>Cada passo seu merece ser visto</p></div><span className="achievement-count">2/3</span></header>
          <div className="achievement-list">
            {achievements.map((achievement) => (
              <div className={`achievement-item${achievement.unlocked ? " unlocked" : ""}`} key={achievement.title}>
                <span className="achievement-medal" aria-hidden="true">{achievement.emoji}</span>
                <div><strong>{achievement.title}</strong><small>{achievement.description}</small></div>
                {achievement.unlocked && <span className="achievement-check" aria-label="Desbloqueada">✓</span>}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel recent-panel">
        <header className="panel-heading recent-heading">
          <div><h2>Movimentações recentes</h2><p>Suas últimas entradas e saídas</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate("transactions")}>Ver movimentações <Icon name="chevron" size={15} /></button>
        </header>
        {transactions.length ? (
          <div className="recent-list">{transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</div>
        ) : <EmptyState title="Nenhuma movimentação ainda" text="Adicione sua primeira receita ou despesa para começar." />}
      </section>
    </>
  );
}
