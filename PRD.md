# PRD — NuBanko

**Projeto:** NuBanko  
**Equipe:** CodeCraft  
**Versão:** 1.1  
**Responsável pelo documento:** Guilherme Lima — Product Owner (PO)  
**Status:** Em desenvolvimento

---

## 1. Visão geral do produto

O NuBanko é uma aplicação web fictícia de organização financeira pessoal, desenvolvida para jovens de 18 a 24 anos que estão começando a administrar seu primeiro salário ou bolsa de estágio.

A aplicação permitirá registrar receitas e despesas, acompanhar o saldo disponível, visualizar os gastos por categoria e criar metas financeiras por meio de Caixinhas.

A proposta é oferecer uma experiência simples, intuitiva e visualmente agradável, ajudando o usuário a desenvolver hábitos de organização financeira sem depender de planilhas.

## 2. Problema que queremos resolver

Muitos jovens começam a receber seu próprio dinheiro, mas encontram dificuldades para controlar quanto recebem, quanto gastam e quanto conseguem economizar.

Embora alguns utilizem planilhas para organizar suas finanças, frequentemente abandonam esse controle por considerá-lo trabalhoso ou pouco prático.

O NuBanko busca resolver esse problema oferecendo uma ferramenta centralizada e fácil de utilizar.

## 3. Público-alvo

Jovens de 18 a 24 anos que:

- Estão recebendo seu primeiro salário ou bolsa de estágio.
- Estão começando a administrar o próprio dinheiro.
- Precisam controlar receitas e despesas.
- Desejam economizar para alcançar objetivos pessoais.
- Procuram uma solução simples, sem a complexidade de aplicativos financeiros tradicionais.

## 4. Persona

**Nome:** Lari  
**Perfil:** Jovem aprendiz que começou a receber seu primeiro salário.

**Comportamento:** Lari tenta organizar seus gastos em planilhas, mas costuma abandonar o controle depois da segunda semana.

**Necessidades:**

- Saber quanto dinheiro possui.
- Acompanhar seus gastos.
- Entender para onde seu dinheiro está indo.
- Criar metas de economia.
- Controlar suas finanças de maneira simples.

**Como o NuBanko ajuda:**

O NuBanko ajudará Lari a controlar suas receitas e despesas, acompanhar para onde seu dinheiro está indo e criar metas de economia de forma simples e organizada, sem depender de planilhas.

## 5. Objetivo do produto

Desenvolver uma aplicação web que facilite o controle financeiro pessoal, permitindo que jovens registrem suas movimentações financeiras, acompanhem seu saldo e organizem metas de economia.

## 6. Requisitos funcionais

### RF01 — Login demonstrativo

O sistema deverá disponibilizar uma tela de login com campos de usuário/e-mail e senha para permitir o acesso à aplicação.

Para a demonstração do projeto, será utilizada uma única conta fictícia, com credenciais previamente definidas pela equipe.

Após a validação do acesso, o usuário deverá ser direcionado ao Dashboard e poderá encerrar a sessão por meio da opção de logout.

Não faz parte do MVP implementar cadastro público ou gerenciamento de múltiplos usuários.

As credenciais não deverão ser armazenadas na planilha do Google Sheets. A forma de validação e proteção do acesso deverá ser definida pelo Tech Lead, considerando as limitações de segurança da arquitetura demonstrativa.

### RF02 — Dashboard financeiro

O sistema deverá apresentar um painel com informações financeiras do usuário:

- Saldo total.
- Saldo disponível.
- Total de receitas do mês.
- Total de despesas do mês.
- Gráfico de despesas por categoria.
- Lista das movimentações recentes.

### RF03 — Cadastro de receitas

O sistema deverá permitir registrar receitas contendo:

- Identificador.
- Descrição.
- Valor.
- Data.
- Categoria.

### RF04 — Cadastro de despesas

O sistema deverá permitir registrar despesas contendo:

- Identificador.
- Descrição.
- Valor.
- Data.
- Categoria.

### RF05 — Gerenciamento de lançamentos

O usuário deverá conseguir visualizar, editar e excluir receitas e despesas cadastradas.

Após qualquer inclusão, edição ou exclusão, os indicadores financeiros do Dashboard deverão ser atualizados de acordo com os registros existentes.

### RF06 — Caixinhas (metas financeiras)

O sistema deverá permitir criar metas financeiras com:

- Nome da meta.
- Valor desejado.
- Prazo.
- Valor acumulado.

### RF07 — Movimentação das Caixinhas

O sistema deverá permitir realizar depósitos e retiradas nas Caixinhas.

A aplicação deverá apresentar o progresso de cada meta em relação ao valor desejado.

## 7. Regras de negócio

**RN01:** Receitas aumentam o saldo total.

**RN02:** Despesas diminuem o saldo total.

**RN03:** O saldo total corresponde à soma das receitas menos a soma das despesas.

**RN04:** O saldo reservado nas Caixinhas corresponde à soma dos depósitos realizados menos a soma das retiradas. O saldo disponível corresponde ao saldo total menos o valor reservado nas Caixinhas.

**RN05:** Depósitos nas Caixinhas não devem ser contabilizados como despesas de consumo.

**RN06:** Retiradas das Caixinhas devolvem o valor retirado ao saldo disponível.

**RN07:** Não será permitido depositar nas Caixinhas um valor superior ao saldo disponível.

**RN08:** Não será permitido retirar um valor superior ao saldo acumulado na Caixinha.

**RN09:** O sistema não deverá permitir saldo disponível negativo.

**RN10:** Os indicadores do Dashboard deverão ser calculados com base nos registros financeiros e nas movimentações das Caixinhas. Inclusões, alterações e exclusões deverão refletir automaticamente nos valores apresentados.

## 8. Requisitos não funcionais

**RNF01 — Usabilidade:** A interface deverá ser simples, intuitiva e adequada ao público-alvo.

**RNF02 — Responsividade:** A aplicação deverá funcionar em computadores, tablets e smartphones.

**RNF03 — Desempenho:** As telas e operações deverão apresentar respostas adequadas, evitando carregamentos desnecessários.

**RNF04 — Organização:** O código deverá ser estruturado em componentes reutilizáveis, facilitando a manutenção.

**RNF05 — Persistência:** Os dados registrados deverão ser armazenados no Google Planilhas por meio da integração com Make.

**RNF06 — Privacidade:** A aplicação deverá evitar a exposição desnecessária de informações financeiras e credenciais.

**RNF07 — Consistência:** Os valores apresentados no Dashboard deverão refletir os registros efetivamente armazenados.

## 9. Arquitetura e tecnologias previstas

A arquitetura proposta para o projeto utilizará as seguintes tecnologias:

- **React:** desenvolvimento da interface e funcionalidades da aplicação.
- **Make:** integração entre a aplicação e o armazenamento de dados.
- **Google Planilhas:** armazenamento dos registros financeiros.
- **GitHub:** versionamento e colaboração no código-fonte.
- **Visual Studio Code:** ambiente de desenvolvimento.
- **Vercel:** hospedagem da aplicação.

O fluxo previsto de comunicação será:

**React → Make → Google Planilhas**

Essa arquitetura representa a proposta inicial do produto e deverá ser validada pelo Tech Lead, que poderá definir os ajustes técnicos necessários, desde que sejam preservados os requisitos e as regras de negócio estabelecidos neste documento.

A implementação do login e da comunicação com o Make deverá considerar as limitações de segurança de uma aplicação demonstrativa, sem apresentar mecanismos simulados como se fossem autenticação ou proteção de dados de produção.

## 10. Estrutura prevista dos dados

O armazenamento deverá contemplar, inicialmente, as seguintes estruturas:

### Aba: Lançamentos

- ID
- Tipo (receita ou despesa)
- Descrição
- Valor
- Categoria
- Data

### Aba: Caixinhas

- ID
- Nome da meta
- Valor desejado
- Prazo

### Aba: Movimentações das Caixinhas

- ID
- ID da Caixinha
- Tipo (depósito ou retirada)
- Valor
- Data

A estrutura definitiva deverá ser validada pelo Tech Lead antes da implementação.

## 11. Histórias de usuário

**HU01 — Acesso**

Como usuário, quero acessar o sistema por meio de login para visualizar minhas informações financeiras.

**HU02 — Consultar saldo**

Como usuário, quero visualizar meu saldo total e disponível para saber quanto dinheiro posso utilizar.

**HU03 — Registrar receita**

Como usuário, quero registrar minhas receitas para acompanhar o dinheiro que recebo.

**HU04 — Registrar despesa**

Como usuário, quero registrar minhas despesas para controlar meus gastos.

**HU05 — Acompanhar despesas**

Como usuário, quero visualizar meus gastos por categoria para entender como estou utilizando meu dinheiro.

**HU06 — Criar metas**

Como usuário, quero criar Caixinhas com valores e prazos para organizar meus objetivos financeiros.

**HU07 — Guardar dinheiro**

Como usuário, quero depositar e retirar valores das Caixinhas para acompanhar minha evolução financeira.

## 12. Critérios de aceitação do MVP

O MVP será considerado funcional quando:

- O usuário conseguir acessar a aplicação pelo login demonstrativo.
- O Dashboard apresentar os indicadores financeiros.
- For possível cadastrar, editar, visualizar e excluir receitas e despesas.
- Os valores do Dashboard forem atualizados corretamente após inclusão, edição ou exclusão de lançamentos.
- O sistema não permitir o cadastro de receitas ou despesas com valores iguais ou inferiores a zero.
- For possível criar e visualizar Caixinhas.
- For possível realizar depósitos e retiradas respeitando as regras de negócio.
- O sistema impedir depósitos superiores ao saldo disponível.
- O sistema impedir retiradas superiores ao valor acumulado na Caixinha.
- O saldo disponível não ficar negativo após uma movimentação.
- O valor acumulado e o progresso de cada Caixinha forem atualizados corretamente após depósitos e retiradas.
- Os depósitos e retiradas não forem contabilizados como despesas de consumo.
- Os dados forem persistidos no Google Planilhas por meio do Make.
- A aplicação apresentar funcionamento adequado em computadores e dispositivos móveis.

## 13. Escopo do MVP

O desenvolvimento inicial priorizará:

1. Login demonstrativo.
2. Dashboard financeiro.
3. Cadastro e gerenciamento de receitas e despesas.
4. Criação e gerenciamento de Caixinhas.
5. Depósitos e retiradas.
6. Integração com Google Planilhas por meio do Make.
7. Interface responsiva.

## 14. Funcionalidades fora do escopo inicial

Não serão prioridades do MVP:

- Integração com bancos reais.
- Consulta automática de extratos bancários.
- Transferências financeiras reais.
- Pagamentos de boletos.
- Cartões de crédito.
- Cadastro público de múltiplos usuários.
- Inteligência Artificial para classificação automática de despesas.

A utilização de Inteligência Artificial poderá ser considerada futuramente, após a conclusão das funcionalidades essenciais.

## 15. Considerações finais

O NuBanko tem como propósito tornar a organização financeira mais acessível aos jovens que estão iniciando sua vida financeira.

O desenvolvimento deverá priorizar simplicidade, facilidade de uso, consistência dos dados e cumprimento das regras de negócio estabelecidas neste documento.

Este PRD servirá como referência para as decisões de produto, design, desenvolvimento, integração técnica e testes da equipe CodeCraft.

Alterações relevantes no escopo deverão ser alinhadas entre o Product Owner e os demais integrantes da equipe.