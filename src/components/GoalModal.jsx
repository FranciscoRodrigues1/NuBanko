import { useState } from "react";
import { goalEmojis, localDate, roundMoney } from "../services/financeService.js";
import ModalShell from "./ModalShell.jsx";
import "./GoalModal.css";

export default function GoalModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState(localDate(90));
  const [emoji, setEmoji] = useState(goalEmojis[0]);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const numericTarget = Number(target);
    if (!name.trim() || !Number.isFinite(numericTarget) || numericTarget <= 0 || !deadline) {
      setError("Informe o nome, um valor maior que zero e o prazo.");
      return;
    }
    onSave({ name: name.trim(), emoji, target: roundMoney(numericTarget), deadline });
  }

  return (
    <ModalShell title="Criar Caixinha" subtitle="Dê um nome ao seu próximo objetivo." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label className="form-field"><span>Nome do objetivo</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Viagem de férias" maxLength={50} /></label>
        <label className="form-field"><span>Emoji da Caixinha</span><select value={emoji} onChange={(event) => setEmoji(event.target.value)}>{goalEmojis.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <fieldset className="form-grid">
          <legend className="visually-hidden">Valor e prazo da meta</legend>
          <label className="form-field"><span>Quanto quer guardar?</span><span className="currency-input"><span>R$</span><input type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="0,00" /></span></label>
          <label className="form-field"><span>Prazo</span><input type="date" min={localDate()} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">Criar Caixinha</button></footer>
      </form>
    </ModalShell>
  );
}
