import Icon from "./Icon.jsx";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <span><Icon name="shield" size={14} /> Demonstração — não conectada a bancos ou serviços externos.</span>
      <span>NuBanko · Organização financeira, do seu jeito.</span>
    </footer>
  );
}
