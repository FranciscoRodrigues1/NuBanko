import { Fragment, useEffect, useRef, useState } from "react";
import { interpretAssistantMessage } from "../services/assistantService.js";
import { searchWeb } from "../services/webSearchService.js";
import Icon from "./Icon.jsx";
import PiggyAvatar from "./PiggyAvatar.jsx";
import "./AssistantAgent.css";

const suggestedQuestions = [
  "Quanto tenho livre?",
  "Como estão meus gastos?",
  "Quais são minhas metas?",
  "Como posso economizar?",
  "Como faço meu dinheiro render mais?",
  "Quais são minhas opções de investimento?"
  
];

export default function AssistantAgent({
  context,
  activity,
  onNavigate,
  onExecuteAction,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activityMessage, setActivityMessage] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 0,
      sender: "agent",
      text: "Oi! Sou a Nubi. Posso consultar seu dinheiro e, quando você pedir, preparar depósitos, retiradas, transferências entre Caixinhas ou lançamentos. Sempre peço sua confirmação antes de salvar.",
    },
  ]);
  const nextMessageId = useRef(1);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const speakingTimer = useRef(null);

  function animateSpeech() {
    setIsSpeaking(true);
    window.clearTimeout(speakingTimer.current);
    speakingTimer.current = window.setTimeout(() => setIsSpeaking(false), 2200);
  }

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else triggerRef.current?.focus();
  }, [isOpen]);

  useEffect(() => () => window.clearTimeout(speakingTimer.current), []);

  useEffect(() => {
    if (!activity) return undefined;

    setMessages((current) => [
      ...current,
      { id: nextMessageId.current++, sender: "agent", text: activity.text },
    ]);
    setActivityMessage(activity.text);
    animateSpeech();
    const bubbleTimer = window.setTimeout(() => setActivityMessage(null), 5000);
    return () => window.clearTimeout(bubbleTimer);
  }, [activity]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendQuestion(text) {
    const trimmedQuestion = text.trim();
    if (!trimmedQuestion) return;

    const result = interpretAssistantMessage(
      trimmedQuestion,
      context,
      pendingRequest,
    );
    setPendingAction(result.action);
    setPendingRequest(result.pendingRequest ?? null);
    setMessages((current) => [
      ...current,
      { id: nextMessageId.current++, sender: "user", text: trimmedQuestion },
    ]);
    setQuestion("");
    animateSpeech();

    if (!result.webSearchQuery) {
      setMessages((current) => [
        ...current,
        { id: nextMessageId.current++, sender: "agent", text: result.reply },
      ]);
      return;
    }

    setIsSearching(true);
    try {
      const { results } = await searchWeb(result.webSearchQuery);
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          sender: "agent",
          text: results.length
            ? `Encontrei ${results.length} fontes sobre "${result.webSearchQuery}". Confira os resumos e consulte os links:`
            : `Não encontrei resultados para "${result.webSearchQuery}". ${result.reply}`,
          sources: results,
        },
      ]);
      animateSpeech();
    } catch (error) {
      console.error("Não foi possível fazer a busca externa da Nubi.", error);
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          sender: "agent",
          text: `Não consegui pesquisar na internet agora. ${result.reply}`,
        },
      ]);
      animateSpeech();
    } finally {
      setIsSearching(false);
    }
  }

  function confirmAction() {
    if (!pendingAction) return;

    setMessages((current) => [
      ...current,
      { id: nextMessageId.current++, sender: "user", text: "Confirmar operação" },
    ]);
    const completed = onExecuteAction(pendingAction);
    setPendingAction(null);
    if (!completed) {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          sender: "agent",
          text: "Não consegui concluir essa operação. Nenhum valor foi alterado; confira o aviso e tente novamente.",
        },
      ]);
      animateSpeech();
    }
  }

  function cancelAction() {
    setPendingAction(null);
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId.current++,
        sender: "agent",
        text: "Operação cancelada. Nenhum valor foi alterado.",
      },
    ]);
    animateSpeech();
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(question);
  }

  return (
    <aside className="assistant-agent">
      {activityMessage && !isOpen && (
        <p className="assistant-activity-bubble" role="status">
          {activityMessage}
        </p>
      )}
      {isOpen && (
        <section
          className="assistant-panel"
          role="dialog"
          aria-labelledby="assistant-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
        >
          <header className="assistant-header">
            <span className="assistant-avatar">
              <PiggyAvatar talking={isSpeaking} />
            </span>
            <span className="assistant-heading">
              <strong id="assistant-title">Nubi</strong>
              <span><i /> Assistente guiada · confirma ações</span>
            </span>
            <button
              className="assistant-close"
              type="button"
              aria-label="Fechar janela do chat com Nubi"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="close" size={18} />
            </button>
          </header>

          <div className="assistant-messages" ref={messagesRef} aria-live="polite">
            {messages.map((message) => (
              <Fragment key={message.id}>
                <p className={`assistant-message ${message.sender}`}>
                  {message.text}
                </p>
                {message.sources?.length > 0 && (
                  <ul className="assistant-sources">
                    {message.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title}
                        </a>
                        {source.description && <span>{source.description}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Fragment>
            ))}
            {isSearching && (
              <p className="assistant-searching" role="status">
                Buscando informações na internet...
              </p>
            )}
            {messages.length === 1 && (
              <div className="assistant-suggestions" aria-label="Sugestões de perguntas">
                {suggestedQuestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendQuestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {pendingAction && (
              <section className="assistant-action-card" aria-label="Confirmação da operação">
                <strong>Confirmar esta operação?</strong>
                <p>{pendingAction.summary}</p>
                <small>A alteração só será salva depois da sua confirmação.</small>
                <div>
                  <button
                    className="assistant-action-confirm"
                    type="button"
                    onClick={confirmAction}
                  >
                    Confirmar
                  </button>
                  <button
                    className="assistant-action-cancel"
                    type="button"
                    onClick={cancelAction}
                  >
                    Cancelar
                  </button>
                </div>
              </section>
            )}
          </div>

          <form className="assistant-compose" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              aria-label="Escreva sua pergunta para a Nubi"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Pergunte ou peça uma ação..."
              autoComplete="off"
              disabled={isSearching}
            />
            <button type="submit" disabled={!question.trim() || isSearching}>
              {isSearching ? "Buscando..." : "Enviar"}
            </button>
          </form>
          <p className="assistant-disclaimer">
            Respostas guiadas. Ações só são salvas após confirmar; os dados ficam neste navegador.
            {" "}Buscas externas enviam apenas o termo à Wikipédia ou ao Brave Search.
            {" "}
            <button type="button" onClick={() => onNavigate("transactions")}>
              Ver movimentações
            </button>
          </p>
        </section>
      )}
      <button
        ref={triggerRef}
        className="assistant-launcher"
        type="button"
        aria-label={isOpen ? "Minimizar conversa com Nubi" : "Abrir conversa com Nubi"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <PiggyAvatar size="small" talking={isSpeaking} />
        <span>{isOpen ? "Fechar Nubi" : "Falar com Nubi"}</span>
      </button>
    </aside>
  );
}
