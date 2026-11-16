import { useState } from "react";
import { categories, localDate, money, roundMoney } from "../services/financeService.js";
import Icon from "./Icon.jsx";
import ModalShell from "./ModalShell.jsx";
import "./TransactionModal.css";

export default function TransactionModal({ transaction, available, onClose, onSave }) {
  const [type, setType] = useState(transaction?.type ?? "expense");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category ?? (transaction?.type === "income" ? categories.income[0] : categories.expense[0]));
  const [date, setDate] = useState(transaction?.date ?? localDate());
  const [error, setError] = useState("");

  function updateType(value) {
    setType(value);
    setCategory(categories[value][0]);
  }

  function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || !date) {
      setError("Preencha a descrição, um valor maior que zero e a data.");
      return;
    }
    const availableForExpense = available + (transaction?.type === "expense" ? transaction.amount : 0);
    if (type === "expense" && numericAmount > availableForExpense) {
      setError(`O valor não pode superar seu saldo disponível (${money.format(availableForExpense)}).`);
      return;
    }
    onSave({ description: description.trim(), amount: roundMoney(numericAmount), type, category, date });
  }

  return (
    <ModalShell title={transaction ? "Editar movimentação" : "Nova movimentação"} subtitle="Registre seu dinheiro com clareza." onClose={onClose}>
      <form className="modal-form transaction-form" onSubmit={submit}>
        <fieldset className="type-switch">
          <legend className="visually-hidden">Tipo de movimentação</legend>
          <button type="button" className={type === "expense" ? "type-option selected expense-option" : "type-option"} onClick={() => updateType("expense")} aria-pressed={type === "expense"}><Icon name="arrowUp" size={16} /> Saída</button>
          <button type="button" className={type === "income" ? "type-option selected income-option" : "type-option"} onClick={() => updateType("income")} aria-pressed={type === "income"}><Icon name="arrowDown" size={16} /> Entrada</button>
        </fieldset>
        <label className="form-field"><span>Descrição</span><input autoFocus value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: Conta de luz" maxLength={70} /></label>
        <fieldset className="form-grid">
          <legend className="visually-hidden">Valor e data</legend>
          <label className="form-field"><span>Valor</span><span className="currency-input"><span>R$</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></span></label>
          <label className="form-field"><span>Data</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        </fieldset>
        <label className="form-field"><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories[type].map((item) => <option key={item}>{item}</option>)}</select></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{transaction ? "Salvar alterações" : "Adicionar movimentação"}</button></footer>
      </form>
    </ModalShell>
  );
}
