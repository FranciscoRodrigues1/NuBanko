import { useEffect } from "react";
import Icon from "./Icon.jsx";
import "./ModalShell.css";

export default function ModalShell({ title, subtitle, onClose, children }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <aside className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-heading">
          <div><h2 id="modal-title">{title}</h2><p>{subtitle}</p></div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}><Icon name="close" size={18} /></button>
        </header>
        {children}
      </section>
    </aside>
  );
}
