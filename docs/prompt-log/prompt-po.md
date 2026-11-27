# PROMPT LOG — GUILHERME (PRODUCT OWNER)

**Projeto:** NuBanko — Controle Financeiro Pessoal  
**Equipe:** CodeCraft  
**Responsável:** Guilherme  
**Função:** Product Owner (PO)

---

# 1. ELABORAÇÃO DO PRD

## PROMPT 01 — ESTRUTURAÇÃO DOS REQUISITOS DO PRODUTO

**Objetivo:** Transformar o briefing do projeto em um documento estruturado de requisitos para orientar o desenvolvimento da aplicação NuBanko.

**Ferramenta utilizada:** ChatGPT.

**Etapa do projeto:** Planejamento e definição do produto.

### 1.1. Contexto

O projeto NuBanko surgiu a partir de um briefing que estabeleceu a proposta de desenvolver uma aplicação web fictícia de organização financeira pessoal, direcionada a jovens de 18 a 24 anos.

A atividade consistiu em analisar o briefing e transformar as informações iniciais em requisitos, funcionalidades e regras de negócio que orientassem a equipe durante o desenvolvimento.

### 1.2. Prompt utilizado

**Observação:** O texto abaixo é uma reconstrução baseada no histórico do desenvolvimento do projeto. Não corresponde necessariamente à transcrição literal do prompt original.

> Atue como especialista em Product Management e Engenharia de Requisitos, auxiliando na elaboração do PRD (Product Requirements Document) do projeto NuBanko.
>
> Com base no briefing fornecido, desenvolva um documento de requisitos completo, organizado e detalhado, respeitando a proposta original do produto e o público-alvo definido.
>
> O documento deverá contemplar:
>
> - Visão geral e objetivos do produto;
> - Problema que a aplicação pretende solucionar;
> - Público-alvo e necessidades dos usuários;
> - Persona;
> - Escopo e funcionalidades do produto;
> - Requisitos funcionais e não funcionais;
> - Regras de negócio;
> - Histórias de usuário;
> - Critérios de aceitação;
> - Estrutura das telas e funcionalidades;
> - Escopo do MVP (Produto Mínimo Viável);
> - Arquitetura e tecnologias previstas para o desenvolvimento.
>
> Detalhe as funcionalidades de controle de receitas e despesas, categorização de movimentações financeiras, acompanhamento de saldo, metas financeiras (Caixinhas) e visualização de informações por meio de um Dashboard.
>
> Organize o documento de maneira clara e objetiva, utilizando linguagem adequada para orientar tanto a equipe de desenvolvimento quanto os demais integrantes do projeto.
>
> Não acrescente funcionalidades que descaracterizem o briefing original. Quando identificar lacunas ou informações que precisem de definição, sinalize-as em vez de assumir decisões sem fundamentação.

### 1.3. Resultado obtido

Elaboração do documento `PRD.md`, contendo a especificação do produto, seus requisitos funcionais e não funcionais, regras de negócio, histórias de usuário e critérios de aceitação do MVP.

### 1.4. Aplicação no projeto

O PRD passou a servir como documento de referência para orientar o planejamento, alinhar as expectativas da equipe e direcionar o desenvolvimento da aplicação NuBanko.

### 1.5. Versionamento e publicação

Após a elaboração do documento, foi realizada sua inclusão no repositório GitHub do projeto, por meio da branch `requisitos-po`.

**Commit registrado:**

`888ca1e — docs: adiciona PRD do projeto NuBanko`

### 1.6. Observações

O ChatGPT foi utilizado como ferramenta de apoio à análise e estruturação dos requisitos. O documento foi incorporado ao repositório para servir como referência durante o desenvolvimento do produto.

---

# 2. CONTRIBUIÇÃO PARA A MELHORIA VISUAL DO PROJETO

## ETAPA INICIAL — SINCRONIZAÇÃO DO PROJETO

**Ferramenta utilizada:** Git / GitHub.

**Objetivo:** Atualizar a versão local do projeto antes de iniciar as contribuições visuais.

### 2.1. Contexto

Antes de iniciar as melhorias visuais, foi realizada a sincronização do projeto local com o repositório remoto do GitHub, utilizando o comando `git pull`.

O objetivo foi obter as alterações mais recentes disponíveis no repositório, incluindo o desenvolvimento realizado anteriormente com o AI Builder, para trabalhar sobre uma versão atualizada da aplicação.

**Comando utilizado:**

`git pull`

### 2.2. Resultado obtido

Projeto local atualizado no Visual Studio Code, permitindo analisar a implementação existente e iniciar uma proposta alternativa de melhoria visual.

### 2.3. Observações

Essa etapa corresponde ao processo de versionamento e sincronização do projeto, não sendo uma utilização de inteligência artificial.

---

## PROMPT 02 — PROPOSTA ALTERNATIVA DE DESIGN E UX/UI

**Objetivo:** Desenvolver uma proposta alternativa de identidade visual e melhorias na experiência do usuário (UX/UI) para a aplicação NuBanko.

**Ferramentas utilizadas:** ChatGPT e GitHub Copilot (VS Code).

**Etapa do projeto:** Design e aprimoramento da interface.

### 2.4. Contexto

Após a elaboração do PRD e a atualização do projeto local, foi iniciada uma contribuição voltada à melhoria da apresentação visual da aplicação.

A proposta buscou tornar o NuBanko mais moderno, jovial, intuitivo e visualmente agradável, considerando especialmente seu público-alvo de 18 a 24 anos.

A intenção foi explorar alternativas de design e organização das telas, preservando as funcionalidades e os requisitos estabelecidos no PRD.

### 2.5. Prompt utilizado

**Observação:** O texto abaixo é uma reconstrução da orientação geral utilizada durante essa atividade. Não representa uma transcrição literal de um único prompt enviado ao GitHub Copilot.

> Analise o projeto NuBanko e desenvolva uma proposta alternativa de identidade visual e experiência do usuário (UX/UI).
>
> O público-alvo do produto são jovens de 18 a 24 anos. Portanto, proponha uma interface moderna, jovial, intuitiva e visualmente agradável.
>
> Explore sua criatividade na construção da identidade visual e na organização das telas, buscando melhorar a experiência de navegação e a apresentação das informações financeiras.
>
> Considere todas as telas e funcionalidades existentes, incluindo login, cadastro, Dashboard, receitas, despesas e Caixinhas.
>
> Desenvolva uma proposta visual consistente entre as telas, utilizando uma linguagem visual harmoniosa, componentes bem organizados, boa hierarquia de informações e adaptação para diferentes tamanhos de tela.
>
> Preserve os requisitos funcionais e as regras de negócio definidos no PRD. Não remova funcionalidades existentes nem altere a arquitetura do projeto sem necessidade.
>
> Antes de realizar alterações, analise a estrutura existente e considere a compatibilidade com os componentes e estilos já implementados.
>
> Implemente as melhorias de forma organizada, mantendo a legibilidade, a reutilização dos componentes e a facilidade de manutenção do código.

### 2.6. Resultado obtido

Desenvolvimento de uma proposta visual alternativa para o NuBanko, incluindo melhorias na identidade visual, na organização dos elementos da interface e na experiência de navegação.

### 2.7. Aplicação no projeto

As alterações foram implementadas no Visual Studio Code com auxílio do GitHub Copilot, utilizando uma branch independente:

`feature/novo-visual-nubanko`

A separação em uma branch própria permitiu preservar a implementação principal da equipe e apresentar as melhorias como uma proposta alternativa para avaliação.

### 2.8. Versionamento e publicação

As alterações realizadas foram versionadas e enviadas ao repositório remoto do GitHub.

**Commit registrado:**

`477cd15 — merge develop e atualiza proposta visual do NuBanko`

**Pull Request:** PR #5.

### 2.9. Observações

A proposta visual foi desenvolvida como uma contribuição complementar ao projeto, sem substituir automaticamente o trabalho dos demais integrantes.

O ChatGPT foi utilizado como apoio na elaboração das orientações, enquanto o GitHub Copilot auxiliou na implementação das alterações no código-fonte.

---

# 3. CONSIDERAÇÕES GERAIS

As atividades registradas demonstram a participação de Guilherme no projeto NuBanko, inicialmente na definição e documentação dos requisitos do produto, por meio da elaboração do PRD, e posteriormente na contribuição para o aprimoramento visual e da experiência do usuário.

As ferramentas de inteligência artificial foram utilizadas como apoio ao planejamento, à estruturação das ideias e ao desenvolvimento da proposta visual.

As decisões de produto e a validação das contribuições permaneceram vinculadas ao contexto e às necessidades do projeto.