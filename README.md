# NuBanko — Educação Financeira Jovem

**Equipe:** CodeCraft  
**Categoria:** Educação Financeira | Desenvolvimento Web  
**Status:** Projeto desenvolvido — aguardando avaliação

## 1. Sobre o projeto

O **NuBanko** é uma aplicação web de educação financeira desenvolvida com o objetivo de incentivar jovens a desenvolverem hábitos saudáveis de organização financeira, tornando o controle do dinheiro mais simples, acessível e intuitivo.

A plataforma permite registrar receitas e despesas, acompanhar o saldo disponível, organizar objetivos financeiros por meio de Caixinhas e visualizar indicadores que ajudam o usuário a compreender melhor seus hábitos de consumo e economia.

O projeto busca oferecer uma experiência visual agradável e intuitiva, aproximando o controle financeiro da realidade do público jovem.

## 2. Objetivo

Facilitar o gerenciamento das finanças pessoais, estimulando o planejamento, a organização dos gastos e a criação do hábito de economizar.

O NuBanko foi concebido para jovens que estão começando a administrar seu próprio dinheiro, como estudantes, aprendizes e pessoas em início de carreira.

## 3. Funcionalidades

A aplicação possui as seguintes funcionalidades:

### Acesso e contas
- Cadastro de contas demonstrativas.
- Login e saída da conta.
- Separação dos dados financeiros por conta cadastrada no navegador.

### Dashboard
- Visualização do saldo geral.
- Acompanhamento do valor reservado.
- Visualização do saldo disponível.
- Resumo mensal de receitas e despesas.
- Indicadores financeiros.
- Despesas organizadas por categoria.
- Acompanhamento de metas e conquistas.

### Movimentações financeiras
- Cadastro de receitas.
- Cadastro de despesas.
- Edição e exclusão de lançamentos.
- Classificação por categorias.
- Pesquisa e filtros de movimentações.

### Caixinhas e metas
- Criação de objetivos financeiros.
- Definição de valores e prazos.
- Acompanhamento do progresso.
- Realização de depósitos e retiradas.
- Visualização dos valores acumulados.

### Personalização e experiência
- Tema claro e escuro.
- Interface responsiva.
- Avisos e confirmações de ações.
- Indicadores visuais de progresso.
- Elementos de gamificação.
- Busca opcional na internet para perguntas sobre termos gerais no assistente Nubi.

## 4. Tecnologias utilizadas

As tecnologias efetivamente utilizadas no desenvolvimento são:

| Tecnologia | Aplicação |
|---|---|
| React 19 | Construção da interface e componentes |
| Vite 6 | Ambiente de desenvolvimento e build |
| JavaScript | Lógica da aplicação |
| JSX | Estrutura dos componentes React |
| CSS3 | Estilização e responsividade |
| NPM | Gerenciamento de dependências |
| Web Crypto API | Derivação de hashes de senhas |
| Node.js e Brave Search API | Busca externa de termos por uma função de servidor |

## 5. Arquitetura e armazenamento

O NuBanko foi implementado como uma aplicação **SPA (Single Page Application)**, com funcionamento no frontend.

Os dados são armazenados localmente no navegador, utilizando:

- **LocalStorage:** armazenamento das contas demonstrativas, movimentações financeiras, Caixinhas, metas e preferências de tema.
- **SessionStorage:** armazenamento de informações relacionadas à sessão ativa.

A persistência local permite que os dados financeiros continuem disponíveis após fechar e abrir o navegador, desde que sejam utilizados o mesmo navegador e perfil e que seus dados não sejam apagados.

**Importante:** as contas e os dados financeiros continuam locais; não há banco de dados nem sincronização em nuvem. A busca externa é opcional e usa apenas o termo perguntado, sem enviar os dados financeiros da conta. A função de busca deve ser hospedada como endpoint de servidor (por exemplo, Vercel Functions); o restante da aplicação continua sendo uma SPA.

## 6. Requisitos para execução

Para executar o projeto localmente, é necessário ter instalado:

- Node.js compatível com o Vite 6 (Node.js 18, 20 ou 22+).
- NPM.
- Git.
- Visual Studio Code ou outro editor de código.

## 7. Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/FranciscoRodrigues1/NuBanko.git
```

### 2. Entrar na pasta do projeto

```bash
cd NuBanko
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar as variáveis de ambiente

Se for necessário utilizar a conta demonstrativa configurada pelo projeto, crie um arquivo `.env` na raiz, seguindo o modelo `.env.example`:

```env
VITE_DEMO_EMAIL=seu-email-demonstrativo
VITE_DEMO_PASSWORD=sua-senha-demonstrativa
BRAVE_SEARCH_API_KEY=sua-chave-da-brave-search
```

As variáveis `VITE_DEMO_*` são opcionais para contas cadastradas localmente. Para habilitar a busca externa, configure uma chave da Brave Search API em `BRAVE_SEARCH_API_KEY`. Essa variável não deve ter o prefixo `VITE_`, pois a chave precisa permanecer no servidor. Sem ela, o chatbot mantém as respostas locais e informa quando não pode pesquisar.

No desenvolvimento, `npm run dev` disponibiliza o endpoint por meio do middleware do Vite. Em produção, configure `BRAVE_SEARCH_API_KEY` no provedor de hospedagem e publique a função `api/search.js` como endpoint serverless. Hospedagens somente estáticas precisam de um endpoint equivalente.

### 5. Iniciar a aplicação

```bash
npm run dev
```

O Vite disponibilizará um endereço local no terminal, geralmente:

```text
http://localhost:5173
```

Abra esse endereço no navegador para utilizar a aplicação.

### 6. Gerar a versão de produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

Para visualizar a versão de produção localmente:

```bash
npm run preview
```

## 8. Segurança e limitações

O NuBanko possui finalidade demonstrativa e educacional.

Algumas limitações importantes:

- O cadastro e a autenticação são realizados localmente, sem validação por servidor.
- Os dados ficam vinculados ao navegador e ao dispositivo utilizados.
- Não existe sincronização entre diferentes dispositivos.
- Os dados armazenados no navegador podem ser alterados ou removidos pelo próprio usuário.
- Não existe recuperação de senha por e-mail.
- A aplicação não possui mecanismos de backup em nuvem.
- A conta demonstrativa não deve utilizar credenciais reais.

**Recomendação:** não utilizar dados bancários, informações financeiras reais ou senhas pessoais na aplicação.

## 9. Equipe CodeCraft

| Integrante | Responsabilidade |
|---|---|
| Francisco | Tech Lead |
| Guilherme | Product Owner (PO) |
| Fernanda | AI Builder |
| Elton | UX/UI Designer |
| Gabriel | QA e Privacidade |

## 10. Considerações finais

O NuBanko representa uma iniciativa de aplicação prática dos conhecimentos de desenvolvimento de soluções digitais, experiência do usuário, organização de requisitos e utilização de inteligência artificial no processo de desenvolvimento.

O projeto foi construído com foco na simplicidade, usabilidade e incentivo à educação financeira, buscando transformar o controle do dinheiro em uma experiência mais acessível e motivadora para o público jovem.

---

**Repositório:** [GitHub — NuBanko](https://github.com/FranciscoRodrigues1/NuBanko)

**Publicação:** a aplicação ainda não possui endereço público de acesso. O repositório será disponibilizado para análise e avaliação da instrutora.