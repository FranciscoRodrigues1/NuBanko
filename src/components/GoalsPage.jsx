import { money } from "../services/financeService.js";
import EmptyState from "./EmptyState.jsx";
import Icon from "./Icon.jsx";
import "./GoalsPage.css";

export default function GoalsPage({ goals, available, onAdd, onMove, onDelete }) {
  const savedTotal = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const targetTotal = goals.reduce((sum, goal) => sum + goal.target, 0);

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">SEUS PRÓXIMOS PASSOS</p><h1>Caixinhas</h1><p className="heading-copy">Pequenos depósitos que aproximam você dos seus planos.</p></div>
        <button className="button button-primary" type="button" onClick={onAdd}><Icon name="plus" size={18} /> Nova Caixinha</button>
      </section>
      <dl className="goals-summary">
        <span className="goals-summary-icon" aria-hidden="true"><Icon name="target" size={22} /></span>
        <div><dt>Você já guardou</dt><dd>{money.format(savedTotal)}</dd></div>
        <span className="summary-divider" aria-hidden="true" />
        <div><dt>Objetivo total</dt><dd>{money.format(targetTotal)}</dd></div>
        <span className="summary-spacer" aria-hidden="true" />
        <div className="available-chip"><dt>Disponível para guardar</dt><dd>{money.format(available)}</dd></div>
      </dl>
      {goals.length ? (
        <section className="goal-cards" aria-label="Suas Caixinhas">
          {goals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
            const deadline = new Date(`${goal.deadline}T12:00:00`);
            return (
              <article className={`goal-card goal-card-${index % 2}`} key={goal.id}>
                <header className="goal-card-top">
                  <span className={`goal-card-symbol goal-symbol-${index % 2}`} aria-hidden="true">{goal.emoji ?? "🎯"}</span>
                  <button className="icon-button danger-hover" type="button" aria-label={`Excluir ${goal.name}`} onClick={() => onDelete(goal)}><Icon name="trash" size={17} /></button>
                </header>
                <h2>{goal.name}</h2>
                <p className="goal-deadline"><Icon name="calendar" size={15} /> Prazo: <time dateTime={goal.deadline}>{deadline.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</time></p>
                <p className="goal-card-amounts"><strong>{money.format(goal.saved)}</strong><span>de {money.format(goal.target)}</span></p>
                <div className="goal-track large" role="progressbar" aria-label={`Progresso de ${goal.name}`} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><span className={`goal-fill goal-fill-${index % 2}`} style={{ width: `${progress}%` }} /></div>
                <footer className="goal-card-bottom"><span>{progress}% completo</span><span>{money.format(Math.max(0, goal.target - goal.saved))} restantes</span></footer>
                <nav className="goal-card-actions" aria-label={`Movimentar valores da Caixinha ${goal.name}`}>
                  <button className="button button-soft" type="button" disabled={available <= 0} onClick={() => onMove(goal.id, "deposit")}><Icon name="arrowDown" size={16} /> Guardar</button>
                  <button className="button button-outline" type="button" disabled={goal.saved <= 0} onClick={() => onMove(goal.id, "withdraw")}><Icon name="arrowUp" size={16} /> Retirar</button>
                </nav>
              </article>
            );
          })}
        </section>
      ) : <section className="panel"><EmptyState title="Ainda não há Caixinhas" text="Crie um objetivo e comece a guardar para algo que importa." /></section>}
      <aside className="goals-note"><Icon name="shield" size={16} /><span>Depósitos e retiradas são controles demonstrativos: não movimentam dinheiro real.</span></aside>
    </>
  );
}
