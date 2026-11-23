import Icon from "./Icon.jsx";
import AvatarPicker from "./AvatarPicker.jsx";
import { profileAvatars } from "../services/profileService.js";
import "./Header.css";

const navigation = [
  { page: "home", icon: "home", label: "Visão geral" },
  { page: "transactions", icon: "list", label: "Movimentações" },
  { page: "goals", icon: "target", label: "Caixinhas" },
];

const pageTitles = {
  home: "Visão geral",
  transactions: "Movimentações",
  goals: "Caixinhas",
};

export default function Header({ page, onNavigate, onLogout, theme, onToggleTheme, savingsLevel, profileAvatarId, onAvatarSelect }) {
  const profileAvatar =
    profileAvatars.find((avatar) => avatar.id === profileAvatarId) ?? profileAvatars[0];
  return (
    <>
      <aside className="sidebar">
        <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); onNavigate("home"); }}>
          <span className="brand-mark">n</span>
          <span>nu<span className="brand-light">banko</span></span>
        </a>
        <p className="workspace-label">SEU ESPAÇO</p>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map(({ page: destination, icon, label }) => (
            <button
              key={destination}
              className={`nav-item${page === destination ? " active" : ""}`}
              type="button"
              onClick={() => onNavigate(destination)}
              aria-current={page === destination ? "page" : undefined}
            >
              <Icon name={icon} size={19} />
              <span>{label}</span>
              {page === destination && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <aside className="level-card" aria-label={`Nível ${savingsLevel.level}, ${savingsLevel.title}`}>
          <span className="level-card-top"><span>SEU NÍVEL</span><strong>Nv. {savingsLevel.level}</strong></span>
          <strong className="level-title">{savingsLevel.title}</strong>
          <span className="level-track" role="progressbar" aria-label="Progresso para o próximo nível" aria-valuenow={savingsLevel.progress} aria-valuemin="0" aria-valuemax="100">
            <span style={{ width: `${savingsLevel.progress}%` }} />
          </span>
          <span className="level-caption">{savingsLevel.next ? "Progresso simbólico, sem prazo." : "Todos os níveis alcançados!"}</span>
        </aside>
        <section className="sidebar-bottom">
          <aside className="sidebar-tip">
            <span className="tip-icon"><Icon name="trend" size={18} /></span>
            <strong>Pequenos passos, grandes planos.</strong>
            <p>Seu futuro financeiro começa com uma escolha de cada vez.</p>
          </aside>
          <section className="profile" aria-label="Conta demonstrativa">
            <span className={`avatar avatar-tone-${profileAvatar.color}`} aria-hidden="true">{profileAvatar.emoji}</span>
            <span className="profile-copy"><strong>Minha conta</strong><span>Modo demonstração</span></span>
            <span className="profile-status" aria-label="Sessão ativa" />
          </section>
        </section>
      </aside>

      <header className="topbar">
        <span className="mobile-brand"><span className="brand-mark">n</span> nubanko</span>
        <nav className="breadcrumbs" aria-label="Localização">
          <span>Início</span><Icon name="chevron" size={15} /><strong>{pageTitles[page]}</strong>
        </nav>
        <section className="topbar-right">
          <span className="demo-pill"><span /> Dados salvos neste navegador</span>
          <AvatarPicker avatarId={profileAvatarId} onSelect={onAvatarSelect} />
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ativar Modo Claro Vibrante" : "Ativar Modo Dark Neon"}
            title={theme === "dark" ? "Modo Claro Vibrante" : "Modo Dark Neon"}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            <span>{theme === "dark" ? "Modo Claro" : "Modo Dark"}</span>
          </button>
          <button className="logout-button" type="button" onClick={onLogout}>
            <Icon name="logout" size={16} /><span>Sair</span>
          </button>
        </section>
      </header>
    </>
  );
}
