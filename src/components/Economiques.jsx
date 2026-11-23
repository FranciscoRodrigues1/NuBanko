
import { useState } from "react";
import "./Economiques.css";

const terms = [
  {
    term: "Juros",
    category: "Investimentos",
    emoji: "💰",
    color: "purple",
    simple: "O preço do dinheiro ou a recompensa por deixar seu dinheiro render.",
    example:
      "Se você empresta R$ 100 e recebe R$ 110 de volta, os R$ 10 extras são juros.",
    tip: "Juros podem trabalhar a seu favor nos investimentos ou contra você nas dívidas.",
  },
  {
    term: "Selic",
    category: "Investimentos",
    emoji: "🏦",
    color: "blue",
    simple: "É a taxa básica de juros da economia brasileira.",
    example:
      "Quando a Selic sobe ou cai, isso pode influenciar empréstimos, financiamentos e investimentos.",
    tip: "A Selic é uma das taxas mais importantes para acompanhar na economia.",
  },
  {
    term: "Inflação",
    category: "Dinheiro",
    emoji: "🛒",
    color: "orange",
    simple: "É quando os preços das coisas aumentam e seu dinheiro compra menos.",
    example:
      "Se antes R$ 50 compravam várias coisas e agora compram menos, você sente o efeito da inflação.",
    tip: "O dinheiro parado pode perder poder de compra com o tempo.",
  },
  {
    term: " CDI",
    category: "Investimentos",
    emoji: "📈",
    color: "green",
    simple: "Uma taxa usada como referência para vários investimentos de renda fixa.",
    example:
      "Um investimento que rende 100% do CDI acompanha essa referência de rendimento.",
    tip: "Compare rendimento, prazo, impostos e riscos antes de investir.",
  },
  {
    term: "Orçamento",
    category: "Planejamento",
    emoji: "📝",
    color: "pink",
    simple: "É o planejamento de quanto dinheiro entra e quanto dinheiro sai.",
    example:
      "Você recebe R$ 500 no mês e decide quanto vai gastar, guardar e reservar para seus objetivos.",
    tip: "Um orçamento ajuda você a decidir para onde seu dinheiro vai, em vez de se perguntar onde ele foi parar.",
  },
  {
    term: "Reserva de emergência",
    category: "Planejamento",
    emoji: "🛟",
    color: "cyan",
    simple: "É um dinheiro guardado para imprevistos e situações urgentes.",
    example:
      "Se seu celular quebra ou surge uma despesa inesperada, sua reserva pode ajudar sem precisar fazer uma dívida.",
    tip: "A reserva deve priorizar segurança e facilidade de acesso.",
  },
  {
    term: "Renda passiva",
    category: "Investimentos",
    emoji: "🌱",
    color: "green",
    simple: "É o dinheiro que você recebe sem depender diretamente de trabalhar cada hora por ele.",
    example:
      "Alguns investimentos podem gerar rendimentos periódicos, embora não sejam garantidos.",
    tip: "Renda passiva não significa dinheiro fácil nem ausência de riscos.",
  },
  {
    term: "Liquidez",
    category: "Investimentos",
    emoji: "💧",
    color: "blue",
    simple: "É a facilidade e rapidez com que você consegue transformar um investimento em dinheiro disponível.",
    example:
      "Um investimento com liquidez diária pode permitir resgates em dias úteis, conforme as regras do produto.",
    tip: "Sempre confira quando o dinheiro estará disponível para você.",
  },
  {
    term: "Renda fixa",
    category: "Investimentos",
    emoji: "🧱",
    color: "orange",
    simple: "É uma modalidade de investimento em que as regras de remuneração são definidas no momento da aplicação.",
    example:
      "Existem investimentos prefixados, pós-fixados e híbridos. O rendimento e os riscos variam.",
    tip: "Renda fixa não quer dizer que todo investimento é livre de riscos ou que rende sempre igual.",
  },
  {
    term: "Renda variável",
    category: "Investimentos",
    emoji: "🎢",
    color: "purple",
    simple: "É uma modalidade em que os resultados podem variar e não são previsíveis.",
    example:
      "O preço de ações pode subir ou cair, fazendo seu investimento valer mais ou menos.",
    tip: "Entenda os riscos e evite investir dinheiro que precisará em breve.",
  },
  {
    term: "Patrimônio",
    category: "Dinheiro",
    emoji: "🏡",
    color: "pink",
    simple: "É o conjunto de bens, direitos e valores que uma pessoa possui, considerando também suas obrigações.",
    example:
      "Pode incluir dinheiro, investimentos, carro e imóvel, descontando dívidas para calcular o patrimônio líquido.",
    tip: "Construir patrimônio é um processo que pode levar tempo. Pequenos passos contam.",
  },
  {
    term: "Consumo consciente",
    category: "Planejamento",
    emoji: "🧠",
    color: "cyan",
    simple: "É pensar antes de comprar e fazer escolhas de acordo com suas necessidades e objetivos.",
    example:
      "Antes de comprar algo por impulso, você compara preços e pensa se aquilo realmente vale a pena.",
    tip: "Nem toda promoção é economia. Comprar algo que você não precisa também custa dinheiro.",
  },
];

const categories = ["Todos", "Dinheiro", "Investimentos", "Planejamento"];

export default function Economiques() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const filteredTerms = terms.filter((item) => {
    const matchesSearch = `${item.term} ${item.simple} ${item.example}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "Todos" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="economiques-page">
      <div className="economiques-hero">
        <span className="economiques-tag">CENTRAL DO CONHECIMENTO 🧠</span>

        <h1>
          Descomplica o <span>Economiquês!</span>
        </h1>

        <p>
          O mundo financeiro fala difícil? Aqui você aprende a falar a língua
          do dinheiro sem precisar de tradutor.
        </p>

        <div className="economiques-stats">
          <div>
            <strong>{terms.length}</strong>
            <span>termos para explorar</span>
          </div>
          <div>
            <strong>3</strong>
            <span>categorias</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>sem complicação</span>
          </div>
        </div>
      </div>

      <div className="economiques-content">
        <div className="economiques-search">
          <span>🔎</span>
          <input
            type="text"
            placeholder="Qual palavra você quer descomplicar?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="economiques-categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="economiques-grid">
          {filteredTerms.map((item) => (
            <article
              className={`economiques-card ${item.color}`}
              key={item.term}
            >
              <div className="economiques-card-top">
                <span className="economiques-emoji">{item.emoji}</span>
                <span className="economiques-category">{item.category}</span>
              </div>

              <h2>{item.term.trim()}</h2>

              <p className="economiques-simple">{item.simple}</p>

              <div className="economiques-example">
                <strong>💡 Na prática</strong>
                <p>{item.example}</p>
              </div>

              <div className="economiques-tip">
                <strong>🚀 Dica Nubi</strong>
                <p>{item.tip}</p>
              </div>
            </article>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="economiques-empty">
            <span>🤔</span>
            <h3>Ops! Palavra não encontrada.</h3>
            <p>Tente buscar outro termo financeiro.</p>
          </div>
        )}

        <div className="economiques-footer-card">
          <span>✨</span>
          <div>
            <h3>Conhecimento é seu melhor investimento!</h3>
            <p>
              Cada palavra que você aprende é mais um passo para tomar decisões
              financeiras melhores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
