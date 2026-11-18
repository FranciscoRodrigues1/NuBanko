import Icon from "./Icon.jsx";
import "./MetricCard.css";

export default function MetricCard({ label, value, icon, kind, caption }) {
  return (
    <article className="metric-card">
      <header className="metric-top">
        <span className={`metric-icon ${kind}`}><Icon name={icon} size={17} /></span>
        <span className="metric-period">Este mês</span>
      </header>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-caption">{caption}</span>
    </article>
  );
}
