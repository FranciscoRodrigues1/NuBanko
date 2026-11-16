import { useState } from "react";
import { money, roundMoney } from "../services/financeService.js";
import ModalShell from "./ModalShell.jsx";
import "./MovementModal.css";

export default function MovementModal({ goal, movementType, available, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const isDeposit = movementType === "deposit";

  function submit(event) {
    event.preventDefault();
    const numericAmount = roundMoney(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (isDeposit && numericAmount > available) {
      setError(`Você tem ${money.format(available)} disponíveis para guardar.`);
      return;
    }
    if (!isDeposit && numericAmount > goal.saved) {
      setError(`Esta Caixinha tem ${money.format(goal.saved)} guardados.`);
      return;
    }
    onSave(numericAmount);
  }

  return (
    <ModalShell title={isDeposit ? "Guardar na Caixinha" : "Retirar da Caixinha"} subtitle={goal.name} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <aside className="movement-info"><span>{isDeposit ? "Disponível para guardar" : "Guardado nesta Caixinha"}</span><strong>{money.format(isDeposit ? available : goal.saved)}</strong></aside>
        <label className="form-field"><span>Valor</span><span className="currency-input"><span>R$</span><input autoFocus type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></span></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{isDeposit ? "Confirmar depósito" : "Confirmar retirada"}</button></footer>
      </form>
    </ModalShell>
  );
}
