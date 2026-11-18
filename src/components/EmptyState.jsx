import Icon from "./Icon.jsx";
import "./EmptyState.css";

export default function EmptyState({ title, text }) {
  return (
    <section className="empty-state" aria-live="polite">
      <span className="empty-icon"><Icon name="wallet" size={22} /></span>
      <strong>{title}</strong>
      <p>{text}</p>
    </section>
  );
}
