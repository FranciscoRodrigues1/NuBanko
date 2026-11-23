import { useState } from "react";
import { authenticate, registerAccount, startDemoSession } from "../services/authService.js";
import Icon from "./Icon.jsx";
import "./Login.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const registering = mode === "register";

  async function submit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    const result = registering
      ? await registerAccount(email, password, confirmation)
      : await authenticate(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      const messages = {
        configuration: "O acesso demonstrativo não está configurado neste ambiente.",
        "invalid-credentials": "E-mail ou senha inválidos.",
        "invalid-email": "Informe um e-mail válido.",
        "weak-password": "A senha deve ter pelo menos 8 caracteres.",
        "password-mismatch": "As senhas não conferem.",
        "reserved-email": "Este e-mail está reservado para a conta demonstrativa.",
        "email-in-use": "Já existe uma conta demonstrativa com este e-mail.",
        "account-storage": "Não foi possível acessar as contas salvas neste navegador.",
        "registration-failed": "Não foi possível criar a conta neste navegador.",
        "password-validation": "Não foi possível validar a senha neste navegador.",
        "session-storage": "Não foi possível iniciar a sessão neste navegador.",
      };
      setError(messages[result.reason] ?? "Não foi possível concluir o acesso.");
      return;
    }
    onLogin();
    setIsSubmitting(false);
  }

  function enterDemo() {
    const result = startDemoSession();
    if (result.ok) {
      onLogin();
      return;
    }
    setError("Não foi possível iniciar o acesso demonstrativo neste navegador.");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmation("");
  }

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Sobre o NuBanko">
        <a className="brand login-brand" href="#inicio" aria-label="NuBanko">
          <span className="brand-mark">n</span>
          <span>nu<span className="brand-light">banko</span></span>
        </a>
        <div className="login-intro-copy">
          <p className="eyebrow">SEU DINHEIRO. SUAS ESCOLHAS.</p>
          <h1>Seu corre de hoje.<br /><span>Seus planos de amanhã.</span></h1>
          <p>Organize sua grana sem complicação e acompanhe cada passo até as coisas que você quer conquistar.</p>
        </div>
        <figure className="login-visual" aria-label="Ilustração de metas financeiras">
          <span className="login-orbit orbit-outer" />
          <span className="login-orbit orbit-inner" />
          <span className="login-visual-star star-one">✦</span>
          <span className="login-visual-star star-two">✧</span>
          <span className="login-visual-coin">n</span>
          <figcaption className="login-floating-card"><span>SEU PRÓXIMO PASSO</span><strong>Vai no seu ritmo <span>↗</span></strong></figcaption>
        </figure>
        <footer className="login-brand-footer"><span>✦</span> Pequenos passos, grandes planos.</footer>
      </section>
      <section className="login-form-side">
        <section className="login-card" aria-labelledby="login-title">
          <p className="eyebrow">{registering ? "SEU PRIMEIRO PASSO" : "BORA COMEÇAR?"}</p>
          <h2 id="login-title">{registering ? "Crie sua conta" : "Boas-vindas de volta"}<span>.</span></h2>
          <p className="login-copy">{registering ? "Comece a organizar seus planos com uma conta demonstrativa." : "Acesse seu espaço e continue de onde parou."}</p>
        <form className="login-form" onSubmit={submit}>
          <label className="form-field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
            />
          </label>
          <label className="form-field password-field">
            <span>Senha</span>
            <span className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={registering ? "new-password" : "current-password"}
                minLength={registering ? 8 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={registering ? "Mínimo de 8 caracteres" : "Sua senha"}
              />
              <button className="password-visibility" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>
                <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
              </button>
            </span>
          </label>
          {registering && (
            <label className="form-field password-field">
              <span>Confirmar senha</span>
              <span className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="Digite a senha novamente"
                />
                <button className="password-visibility" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
                </button>
              </span>
            </label>
          )}
          {error && <p className="form-error login-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Aguarde..." : registering ? "Criar conta" : "Entrar"} <Icon name="chevron" size={17} />
          </button>
        </form>
        <button className="button login-demo-button" type="button" onClick={enterDemo}>
          <Icon name="target" size={17} /> Entrar no modo demonstrativo
        </button>
        <p className="login-switch">
          {registering ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
          <button type="button" onClick={() => changeMode(registering ? "login" : "register")}>{registering ? "Entrar" : "Criar conta"}</button>
        </p>
        <aside className="login-demo-note">
          <Icon name="shield" size={17} />
          <p>Ambiente demonstrativo. Não use senhas reais nem dados bancários. As contas criadas ficam salvas apenas neste navegador.</p>
        </aside>
        </section>
        <footer className="login-footer">NuBanko · Organização financeira, do seu jeito.</footer>
      </section>
    </main>
  );
}
