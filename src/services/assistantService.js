
import { categories, localDate, money, roundMoney } from "./financeService.js";

const UNRECOGNIZED_REPLY =
  "Posso ajudar com saldo livre, entradas e gastos do mês, Caixinhas ou ideias para economizar. Pergunte sobre um desses temas — uso apenas os dados salvos neste navegador.";

function normalizeQuestion(question) {
  return question
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ==========================================
// RADAR FINANCEIRO — RECONHECIMENTO
// ==========================================

function isInvestmentQuestion(question) {
  const normalized = normalizeQuestion(question);

  const investmentTerms = [
    "investimento",
    "investimentos",
    "investir",
    "investindo",
    "investidor",
    "cdb",
    "rdb",
    "tesouro direto",
    "tesouro selic",
    "selic",
    "cdi",
    "ipca",
    "rendimento",
    "rendimentos",
    "render",
    "rentabilidade",
    "rentavel",
    "juros compostos",
    "juros",
    "liquidez",
    "acoes",
    "fundos imobiliarios",
    "fiis",
    "bolsa",
    "poupanca",
    "aplicar dinheiro",
    "aplicacao financeira",
    "aplicacoes financeiras",
    "fazer meu dinheiro render",
    "onde investir",
    "como investir",
    "opcoes de investimento",
    "renda passiva",
  ];

  return investmentTerms.some((term) => normalized.includes(term));
}

// ==========================================
// RADAR FINANCEIRO — RESPOSTAS EDUCATIVAS
// ==========================================

function getInvestmentReply(question) {
  const normalized = normalizeQuestion(question);

  // Exemplo ou simulação com dinheiro
  if (
    /\b(exemplo|mostre|mostrar|simular|simulacao|simule|quanto renderia|faca uma simulacao)\b/.test(
      normalized,
    )
  ) {
    const amount = parseAmount(question);
    const value = amount?.amount ?? 100;

    return {
      reply:
        `🧮 VAMOS SIMULAR COM ${money.format(value)}!\n\n` +
        `Imagine que você investiu ${money.format(value)} em uma aplicação hipotética com rendimento de 10% ao ano.\n\n` +
        `📈 Após 1 ano, em uma conta simplificada:\n` +
        `• Valor inicial: ${money.format(value)}\n` +
        `• Rendimento hipotético: ${money.format(value * 0.10)}\n` +
        `• Total bruto: ${money.format(value * 1.10)}\n\n` +
        `⚠️ Atenção: os 10% são apenas um exemplo didático, não uma taxa real ou promessa de rendimento. Não foram descontados impostos ou taxas.\n\n` +
        `Na prática, cada investimento tem regras, taxas e riscos diferentes.\n\n` +
        `Quer agora ver um exemplo de CDB, Tesouro Selic ou poupança?`,
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Explicação de CDB
  if (/\bcdb\b/.test(normalized)) {
    return {
      reply:
        "🔵 O QUE É CDB?\n\n" +
        "CDB significa Certificado de Depósito Bancário. É um investimento em que você empresta dinheiro a um banco e recebe juros por isso.\n\n" +
        "Como funciona:\n" +
        "• Pode render um percentual do CDI.\n" +
        "• Pode ter liquidez diária ou vencimento definido.\n" +
        "• Tem incidência de Imposto de Renda sobre os rendimentos, conforme o prazo.\n" +
        "• Pode ter cobertura do FGC, dentro dos limites e condições aplicáveis.\n\n" +
        "Antes de investir, confira a instituição, a taxa, a liquidez e o vencimento.\n\n" +
        "Quer conhecer outra opção ou ver um exemplo com R$ 100?",
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Explicação do Tesouro Selic
  if (/\b(tesouro|selic)\b/.test(normalized)) {
    return {
      reply:
        "🟣 O QUE É TESOURO SELIC?\n\n" +
        "É um título público federal. Ao investir, você empresta dinheiro ao governo e recebe uma remuneração relacionada à taxa Selic.\n\n" +
        "Pontos importantes:\n" +
        "• É uma alternativa bastante estudada para objetivos de curto prazo.\n" +
        "• Possui regras específicas de resgate.\n" +
        "• Há cobrança de Imposto de Renda sobre os rendimentos.\n" +
        "• Pode haver taxa de custódia, conforme as regras vigentes.\n\n" +
        "O preço de venda antecipada pode variar. Por isso, é importante entender as condições antes de investir.\n\n" +
        "Quer conhecer outra opção ou ver um exemplo com R$ 100?",
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Explicação da poupança
  if (/\bpoupanca\b/.test(normalized)) {
    return {
      reply:
        "🟢 COMO FUNCIONA A POUPANÇA?\n\n" +
        "A poupança é uma forma tradicional de guardar dinheiro em uma instituição financeira.\n\n" +
        "Características:\n" +
        "• É simples de utilizar.\n" +
        "• Para pessoa física, os rendimentos são isentos de Imposto de Renda.\n" +
        "• O rendimento é calculado conforme regras definidas para a poupança.\n" +
        "• O rendimento é creditado na data de aniversário do depósito.\n\n" +
        "Sua simplicidade é uma vantagem, mas vale comparar seu rendimento com outras alternativas.\n\n" +
        "Quer conhecer outra opção ou ver um exemplo com R$ 100?",
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Explicação de LCI e LCA
  if (/\b(lci|lca)\b/.test(normalized)) {
    return {
      reply:
        "🟡 O QUE SÃO LCI E LCA?\n\n" +
        "LCI significa Letra de Crédito Imobiliário. LCA significa Letra de Crédito do Agronegócio.\n\n" +
        "São investimentos emitidos por instituições financeiras para financiar atividades desses setores.\n\n" +
        "Características:\n" +
        "• Podem oferecer remuneração prefixada, pós-fixada ou híbrida.\n" +
        "• Para pessoa física, são isentos de Imposto de Renda nas condições atuais.\n" +
        "• Podem ter prazo de carência e vencimento.\n" +
        "• Podem contar com cobertura do FGC, dentro dos limites e condições aplicáveis.\n\n" +
        "Confira sempre o prazo e a possibilidade de resgate antes de investir.\n\n" +
        "Quer conhecer outra opção ou ver um exemplo com R$ 100?",
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Comparação entre investimentos
  if (
    /\b(comparar|comparacao|diferenca|qual e melhor|qual melhor)\b/.test(
      normalized,
    )
  ) {
    return {
      reply:
        "⚖️ VAMOS COMPARAR!\n\n" +
        "🟢 POUPANÇA: simples e acessível, mas pode render menos.\n\n" +
        "🔵 CDB: pode oferecer rendimento ligado ao CDI. Verifique a taxa, o prazo e a liquidez.\n\n" +
        "🟣 TESOURO SELIC: título público que acompanha a Selic, com regras próprias de resgate e tributação.\n\n" +
        "🟡 LCI E LCA: títulos ligados ao setor imobiliário e ao agronegócio, com características próprias de prazo e liquidez.\n\n" +
        "A melhor alternativa depende do seu objetivo e de quando você precisará do dinheiro.\n\n" +
        "Quer ver um exemplo com R$ 100?",
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Conhecer as opções
  if (
    /\b(conhecer cada opcao|conhecer as opcoes|cada opcao|me explique cada|quero conhecer)\b/.test(
      normalized,
    )
  ) {
    return {
      reply:
        "📚 VAMOS CONHECER AS PRINCIPAIS OPÇÕES DE INVESTIMENTO!\n\n" +
        "🟢 POUPANÇA\n" +
        "É uma forma simples de guardar dinheiro. Tem facilidade de acesso, mas seu rendimento costuma ser menor que o de outras alternativas.\n\n" +
        "🔵 CDB — Certificado de Depósito Bancário\n" +
        "É um investimento oferecido por bancos. Alguns CDBs rendem um percentual do CDI. Existem opções com liquidez diária e outras com prazo de vencimento. Pode contar com proteção do FGC, respeitados os limites e as regras vigentes.\n\n" +
        "🟣 TESOURO SELIC\n" +
        "É um título público federal cuja rentabilidade acompanha a taxa Selic. É uma alternativa frequentemente estudada para objetivos de curto prazo e reserva de emergência, considerando as regras de resgate e os riscos envolvidos.\n\n" +
        "🟡 LCI E LCA\n" +
        "São títulos emitidos por instituições financeiras, ligados aos setores imobiliário e do agronegócio. Para pessoa física, possuem isenção de Imposto de Renda nas condições atuais, mas podem ter prazo de carência.\n\n" +
        "📌 Antes de escolher, compare rentabilidade, liquidez, prazo, impostos e riscos. Nenhuma opção é ideal para todos os objetivos.\n\n" +
        "Quer que eu compare essas opções ou mostre um exemplo com R$ 100?",
      action: null,
      pendingRequest: { kind: "investment-guide" },
    };
  }

  // Pergunta geral sobre como começar
  return {
    reply:
      "🚀 EXISTEM VÁRIAS FORMAS DE FAZER SEU DINHEIRO RENDER!\n\n" +
      "Você pode começar conhecendo estas opções:\n\n" +
      "🟢 Poupança — simples para guardar dinheiro.\n" +
      "🔵 CDB — investimento bancário que pode render um percentual do CDI.\n" +
      "🟣 Tesouro Selic — título público ligado à taxa Selic.\n" +
      "🟡 LCI e LCA — investimentos ligados aos setores imobiliário e do agronegócio.\n\n" +
      "✨ Quer conhecer cada opção de um jeito simples ou comparar as diferenças?",
    action: null,
    pendingRequest: { kind: "investment-guide" },
  };
}


// ==========================================
// BUSCA EXTERNA
// ==========================================

function getWebSearchQuery(question) {
  const normalized = normalizeQuestion(question);

  const prefixes = [
    "qual o significado de",
    "qual significado de",
    "o que significa",
    "como funciona",
    "o que sao",
    "o que e",
    "defina",
    "explique",
  ];

  const prefix = prefixes.find((item) =>
    normalized.startsWith(`${item} `),
  );

  if (!prefix) return null;

  const term = question
    .trim()
    .slice(prefix.length)
    .replace(/[?!.\s]+$/g, "")
    .trim();

  const normalizedTerm = normalizeQuestion(term);

  if (
    term.length < 2 ||
    term.length > 100 ||
    /\d/.test(term) ||
    /\b(eu|meu|minha|meus|minhas|nosso|nossa|saldo|caixinha|conta|cpf|senha)\b/.test(
      normalizedTerm,
    )
  ) {
    return null;
  }

  return term;
}

// ==========================================
// VALORES
// ==========================================

function parseAmount(question) {
  const match = question.match(
    /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[,.]\d{1,2})?)/i,
  );

  if (!match) return null;

  const rawNumber = match[1];
  const groupedThousands = /^\d{1,3}(?:\.\d{3})+$/.test(rawNumber);

  const normalizedNumber = rawNumber.includes(",")
    ? rawNumber.replace(/\./g, "").replace(",", ".")
    : groupedThousands
      ? rawNumber.replace(/\./g, "")
      : rawNumber;

  const amount = Number(normalizedNumber);

  return Number.isFinite(amount) && amount > 0
    ? { amount: roundMoney(amount), raw: match[0] }
    : null;
}

// ==========================================
// CAIXINHAS
// ==========================================

function findMentionedGoals(question, goals) {
  const normalized = normalizeQuestion(question);
  const genericNameWords = new Set([
    "novo",
    "nova",
    "meta",
    "sonho",
    "caixinha",
  ]);

  return goals
    .map((goal) => {
      const name = normalizeQuestion(goal.name);

      const nameWords = name
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 3 && !genericNameWords.has(word),
        );

      const positions = [
        normalized.indexOf(name),
        ...nameWords.map((word) => normalized.indexOf(word)),
      ].filter((position) => position >= 0);

      return positions.length
        ? { goal, position: Math.min(...positions) }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.position - b.position)
    .map(({ goal }) => goal);
}

function askForGoal(goals, movementType, amount) {
  if (!goals.length) {
    return {
      reply:
        "Você ainda não tem uma Caixinha para essa operação. Crie uma primeiro e depois me diga o valor.",
      action: null,
    };
  }

  const names = goals
    .map((goal) => `"${goal.name}"`)
    .join(", ");

  const operation =
    movementType === "withdraw" ? "retirar" : "guardar";

  const followUp = amount
    ? `Em qual Caixinha devo ${operation} ${money.format(amount)}?`
    : `Qual valor e em qual Caixinha você quer ${operation}?`;

  return {
    reply: `${followUp} Você pode escolher: ${names}.`,
    action: null,
    pendingRequest: {
      kind: "goal-movement",
      movementType,
      amount,
    },
  };
}

function prepareGoalMovement(movementType, amount, goal, context) {
  const { totals } = context;

  if (!amount) {
    return {
      reply: `Qual valor você quer ${movementType === "withdraw" ? "retirar" : "guardar"} na Caixinha "${goal.name}"?`,
      action: null,
      pendingRequest: {
        kind: "goal-movement",
        movementType,
        goalId: goal.id,
      },
    };
  }

  if (movementType === "deposit" && amount > totals.available) {
    return {
      reply: `Seu saldo livre é ${money.format(totals.available)}. Não posso preparar um depósito maior que esse valor.`,
      action: null,
    };
  }

  if (movementType === "withdraw" && amount > goal.saved) {
    return {
      reply: `A Caixinha "${goal.name}" tem ${money.format(goal.saved)} guardados. Não posso preparar uma retirada maior.`,
      action: null,
    };
  }

  const summary =
    movementType === "deposit"
      ? `guardar ${money.format(amount)} na Caixinha "${goal.name}"`
      : `retirar ${money.format(amount)} da Caixinha "${goal.name}"`;

  return actionProposal(
    {
      type: "goal-movement",
      goalId: goal.id,
      movementType,
      amount,
    },
    summary,
  );
}

function continueGoalMovement(question, context, pendingRequest) {
  const { goals } = context;
  const mentionedGoals = findMentionedGoals(question, goals);

  const goal = pendingRequest.goalId
    ? goals.find((item) => item.id === pendingRequest.goalId)
    : mentionedGoals.length === 1
      ? mentionedGoals[0]
      : null;

  const amount =
    pendingRequest.amount ?? parseAmount(question)?.amount;

  if (!goal) {
    return askForGoal(
      goals,
      pendingRequest.movementType,
      amount,
    );
  }

  if (!amount && mentionedGoals.length > 1) {
    return askForGoal(
      goals,
      pendingRequest.movementType,
      null,
    );
  }

  return prepareGoalMovement(
    pendingRequest.movementType,
    amount,
    goal,
    context,
  );
}

// ==========================================
// AÇÕES FINANCEIRAS
// ==========================================

function actionProposal(action, summary) {
  return {
    action: { ...action, summary },
    reply: `Posso ${summary}. Revise a operação abaixo e confirme para salvar. Nada muda antes da sua confirmação.`,
  };
}

function describeTransaction(question, amount, type) {
  const normalized = normalizeQuestion(question);

  const category =
    categories[type].find((item) =>
      normalized.includes(normalizeQuestion(item)),
    ) ?? categories[type][categories[type].length - 1];

  const withoutAmount = amount
    ? question.replace(amount.raw, " ")
    : question;

  const stopWords = new Set([
    "quero", "pode", "poderia", "por", "favor", "registrar",
    "registre", "lancar", "lance", "anotar", "anote", "adicionar",
    "adicione", "criar", "crie", "uma", "um", "novo", "nova",
    "movimentacao", "transacao", "despesa", "gasto", "saida",
    "entrada", "receita", "de", "do", "da", "no", "na", "com",
    "em", "para", "valor", "dinheiro", "r",
  ]);

  const description = withoutAmount
    .split(/\s+/)
    .map((word) =>
      word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""),
    )
    .filter((word) => {
      const normalizedWord = normalizeQuestion(word);
      return normalizedWord && !stopWords.has(normalizedWord);
    })
    .join(" ")
    .trim();

  return {
    description: description
      ? `${description[0].toLocaleUpperCase("pt-BR")}${description.slice(1)}`
      : category,
    category,
  };
}

// ==========================================
// INTERPRETAÇÃO PRINCIPAL DA NUBI
// ==========================================

export function interpretAssistantMessage(
  question,
  context,
  pendingRequest = null,
) {
  const normalized = normalizeQuestion(question);
  const { totals, goals } = context;

  const amount = parseAmount(question);
  const mentionedGoals = findMentionedGoals(question, goals);

  const asksForAdvice =
    /\b(como posso|como devo|qual a melhor forma|devo|dica)\b/.test(
      normalized,
    );

  const transferIntent =
    /\b(transferir|transfira|transferencia|mover|mova)\b/.test(
      normalized,
    );

  const withdrawIntent =
    /\b(retirar|retire|sacar|saque|resgatar|resgate|tirar)\b/.test(
      normalized,
    );

  const depositIntent =
    /\b(guardar|guarde|depositar|deposite|deposito|aplicar)\b/.test(
      normalized,
    ) ||
    (/\b(colocar|coloque|adicionar|adicione)\b/.test(normalized) &&
      (mentionedGoals.length > 0 ||
        /\bcaixinha\b/.test(normalized)));

  const transactionIntent =
    /\b(registrar|registre|lancar|lance|anotar|anote|adicionar|adicione|criar|crie)\b/.test(
      normalized,
    ) &&
    /\b(despesa|gasto|saida|entrada|receita|salario|recebi|compra)\b/.test(
      normalized,
    );

  const requestedActions = [
    transferIntent,
    withdrawIntent,
    depositIntent,
    transactionIntent,
  ].filter(Boolean).length;

  // Cancelamento de operação de Caixinha
  if (
    pendingRequest?.kind === "goal-movement" &&
    /\b(cancelar|cancele|desistir)\b/.test(normalized)
  ) {
    return {
      reply: "Pedido cancelado. Nenhuma alteração foi feita.",
      action: null,
    };
  }

  // Continuação de operação de Caixinha
  if (
    pendingRequest?.kind === "goal-movement" &&
    requestedActions === 0 &&
    (amount || mentionedGoals.length > 0)
  ) {
    return continueGoalMovement(
      question,
      context,
      pendingRequest,
    );
  }

  // Continuação da conversa sobre investimentos
  if (pendingRequest?.kind === "investment-guide") {
    return getInvestmentReply(question);
  }

  // Primeira pergunta sobre investimentos
  if (isInvestmentQuestion(question)) {
    return getInvestmentReply(question);
  }

  if (asksForAdvice) {
    const reply = getGuidedReply(question, context);

    return {
      reply,
      action: null,
      webSearchQuery:
        reply === UNRECOGNIZED_REPLY
          ? getWebSearchQuery(question)
          : null,
    };
  }

  if (requestedActions > 1) {
    return {
      reply:
        "Posso preparar uma operação por vez. Diga qual você quer fazer primeiro; nenhuma alteração foi feita.",
      action: null,
    };
  }

  // Transferência entre Caixinhas
  if (transferIntent) {
    if (mentionedGoals.length !== 2) {
      return {
        reply:
          goals.length < 2
            ? "Para transferir entre Caixinhas, você precisa ter pelo menos duas. Não alterei nenhum valor."
            : "Diga o valor e os nomes das duas Caixinhas, por exemplo: “transferir R$ 20 da Viagem para o Notebook”.",
        action: null,
      };
    }

    if (!amount) {
      return {
        reply:
          "Qual valor você quer transferir? Diga também a Caixinha de origem e a de destino. Nada foi alterado.",
        action: null,
      };
    }

    const [sourceGoal, destinationGoal] = mentionedGoals;

    if (sourceGoal.id === destinationGoal.id) {
      return {
        reply:
          "A origem e o destino precisam ser Caixinhas diferentes. Não fiz nenhuma alteração.",
        action: null,
      };
    }

    if (amount.amount > sourceGoal.saved) {
      return {
        reply: `A Caixinha "${sourceGoal.name}" tem ${money.format(sourceGoal.saved)} guardados. Não dá para transferir esse valor.`,
        action: null,
      };
    }

    const summary = `transferir ${money.format(amount.amount)} da Caixinha "${sourceGoal.name}" para "${destinationGoal.name}"`;

    return actionProposal(
      {
        type: "goal-transfer",
        sourceGoalId: sourceGoal.id,
        destinationGoalId: destinationGoal.id,
        amount: amount.amount,
      },
      summary,
    );
  }

  // Depósito ou retirada
  if (withdrawIntent || depositIntent) {
    const movementType = withdrawIntent ? "withdraw" : "deposit";

    const goal =
      mentionedGoals.length === 1
        ? mentionedGoals[0]
        : mentionedGoals.length === 0 && goals.length === 1
          ? goals[0]
          : null;

    if (!goal) {
      return askForGoal(
        goals,
        movementType,
        amount?.amount ?? null,
      );
    }

    return prepareGoalMovement(
      movementType,
      amount?.amount ?? null,
      goal,
      context,
    );
  }

  // Registro de entrada ou despesa
  if (transactionIntent) {
    const isExpense =
      /\b(despesa|gasto|saida|compra)\b/.test(normalized);

    const isIncome =
      /\b(entrada|receita|salario|recebi)\b/.test(normalized);

    if (isExpense === isIncome) {
      return {
        reply:
          "Você quer registrar uma entrada ou uma despesa? Diga também o valor e uma descrição. Nada foi salvo.",
        action: null,
      };
    }

    if (!amount) {
      return {
        reply:
          "Qual valor devo registrar? Inclua também uma descrição, por exemplo: “registrar despesa de R$ 25 no mercado”.",
        action: null,
      };
    }

    const type = isIncome ? "income" : "expense";
    const details = describeTransaction(question, amount, type);

    if (type === "expense" && amount.amount > totals.available) {
      return {
        reply: `Seu saldo livre é ${money.format(totals.available)}. Essa despesa excede o saldo e não foi preparada.`,
        action: null,
      };
    }

    const values = {
      ...details,
      amount: amount.amount,
      type,
      date: localDate(),
    };

    const summary = `registrar ${isIncome ? "uma entrada" : "uma despesa"} de ${money.format(amount.amount)} como "${values.description}" na categoria ${values.category}`;

    return actionProposal(
      { type: "record-transaction", values },
      summary,
    );
  }

  const reply = getGuidedReply(question, context);

  return {
    reply,
    action: null,
    webSearchQuery:
      reply === UNRECOGNIZED_REPLY
        ? getWebSearchQuery(question)
        : null,
  };
}

// ==========================================
// RESPOSTAS SOBRE A VIDA FINANCEIRA
// ==========================================

export function getGuidedReply(question, context) {
  const normalized = normalizeQuestion(question);
  const { totals, monthSummary, goals, savingsLevel } = context;

  if (/\b(oi|ola|bom dia|boa tarde|boa noite|e ai)\b/.test(normalized)) {
    return "Oi! Posso consultar seu saldo livre, resumir os gastos do mês, acompanhar suas metas ou trazer uma ideia para economizar. O que você quer ver?";
  }

  if (/\b(gasto|gastos|despesa|despesas|saida|saidas|gastei|categoria)\b/.test(normalized)) {
    const biggestCategory = monthSummary.chartItems[0];

    if (!monthSummary.expenses) {
      return "Ainda não há despesas registradas neste mês. Quando houver movimentações, posso ajudar a resumir por categoria.";
    }

    return biggestCategory
      ? `Neste mês, suas saídas somam ${money.format(monthSummary.expenses)}. A categoria com maior valor é ${biggestCategory.category}, com ${money.format(biggestCategory.amount)}. Quer conferir todas as movimentações?`
      : `Neste mês, suas saídas somam ${money.format(monthSummary.expenses)}.`;
  }

  if (/\b(receita|receitas|entrada|entradas|recebi|ganhei)\b/.test(normalized)) {
    return `Você registrou ${money.format(monthSummary.income)} em entradas neste mês. Esse resumo considera as movimentações salvas no NuBanko.`;
  }

  if (/\b(meta|metas|caixinha|caixinhas|sonho|sonhos)\b/.test(normalized)) {
    if (!goals.length) {
      return "Você ainda não criou uma Caixinha. Se quiser, abra a área de Caixinhas para começar um plano no seu ritmo.";
    }

    const goalSummary = goals
      .map((goal) => {
        const progress = Math.min(
          100,
          Math.round((goal.saved / goal.target) * 100),
        );

        return `${goal.name}: ${money.format(goal.saved)} de ${money.format(goal.target)} (${progress}%)`;
      })
      .join("; ");

    return `Suas Caixinhas: ${goalSummary}. Cada objetivo pode avançar no seu tempo.`;
  }

  if (/\b(guardar|economizar|economia|poupar|dica|dicas|reduzir)\b/.test(normalized)) {
    const biggestCategory = monthSummary.chartItems[0];

    if (totals.available <= 0) {
      return "Seu saldo livre está zerado ou negativo agora. Não precisa forçar uma economia: acompanhe as movimentações e retome seus planos quando couber.";
    }

    if (biggestCategory) {
      return `Uma ideia simples: observe os gastos de ${biggestCategory.category}, que é sua maior categoria neste mês. Se fizer sentido, escolha um pequeno limite para os próximos dias — sem comprometer contas importantes.`;
    }

    return "Uma ideia simples é definir um valor confortável para guardar depois de considerar suas contas essenciais. Você decide o ritmo e pode mudar o plano quando quiser.";
  }

  if (/\b(nivel|evolucao|progresso)\b/.test(normalized)) {
    return `Seu nível atual é ${savingsLevel.title} (nível ${savingsLevel.level}). É um indicador simbólico baseado no valor reservado, sem prazo ou comparação com outras pessoas.`;
  }

  if (/\b(saldo|disponivel|livre|quanto tenho)\b/.test(normalized)) {
    return `Você tem ${money.format(totals.available)} de saldo livre e ${money.format(totals.reserved)} reservado nas Caixinhas. Seu saldo geral é ${money.format(totals.balance)}.`;
  }

  return UNRECOGNIZED_REPLY;
}
