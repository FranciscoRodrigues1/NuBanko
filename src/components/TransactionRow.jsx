import { categoryEmojis, money } from "../services/financeService.js";
import Icon from "./Icon.jsx";
import "./TransactionRow.css";

export default function TransactionRow({ transaction, actions }) {
  const isIncome = transaction.type === "income";
  const date = new Date(`${transaction.date}T12:00:00`);
  return (
    <article className="transaction-row">
      <span className={`transaction-kind ${isIncome ? "income" : "expense"}`}>
        <Icon name={isIncome ? "arrowDown" : "arrowUp"} size={17} />
      </span>
      <span className="transaction-main">
        <strong>{transaction.description}</strong>
        <span><span aria-hidden="true">{categoryEmojis[transaction.category] ?? "✨"} </span>{transaction.category}</span>
      </span>
      <time className="transaction-date" dateTime={transaction.date}>
        {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
      </time>
      <strong className={`transaction-amount ${isIncome ? "income-text" : ""}`}>
        {isIncome ? "+" : "−"} {money.format(transaction.amount)}
      </strong>
      {actions}
    </article>
  );
}
