import { money } from "../services/financeService.js";
import "./GoalProgress.css";

export default function GoalProgress({ goal, variant = 0 }) {
  const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const deadline = new Date(`${goal.deadline}T12:00:00`);
  return (
    <article className="goal-progress">
      <header className="goal-progress-top">
        <span className={`goal-symbol goal-symbol-${variant % 2}`} aria-hidden="true">{goal.emoji ?? "🎯"}</span>
        <span className="goal-title-wrap">
          <strong>{goal.name}</strong>
          <time dateTime={goal.deadline}>Até {deadline.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</time>
        </span>
        <span className="goal-percent">{progress}%</span>
      </header>
      <progress className={`goal-track goal-progress-bar goal-fill-${variant % 2}`} value={progress} max="100" aria-label={`${progress}% da meta ${goal.name}`} />
      <footer className="goal-values"><span>{money.format(goal.saved)} guardados</span><strong>{money.format(goal.target)}</strong></footer>
    </article>
  );
}
