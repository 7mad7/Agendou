<div align="center">
  <img src="./public/logo.png" alt="Logo Agendou" width="160" />

  <h1>Agendou</h1>
  <p><strong>Tudo o que você precisa no seu bairro, com horário marcado.</strong></p>
</div>

Projeto Integrador da disciplina de **Gerência de Configuração** (turma ENGS241M01-SED), desenvolvido a partir do Lotou, MVP anterior da equipe.

---

## Como Funciona

### Para o Cliente
- **Descoberta por Proximidade:** Busca comércios locais por nome, categoria ou distância em quilômetros via GPS.
- **Agendamento Sem Fricção:** Escolha o serviço, visualize apenas os horários realmente livres nos próximos 14 dias e confirme com um toque.
- **Confirmação Direta no WhatsApp:** Após reservar o horário, envie o comprovante pré-formatado diretamente para o WhatsApp do estabelecimento.

### Para o Comerciante
- **Gestão do Espaço e Catálogo:** Cadastro completo do estabelecimento (CNPJ, endereço, geolocalização) e catálogo de serviços com preços em Reais (`R$`) e duração em minutos.
- **Motor Inteligente de Disponibilidade:** Configuração da grade semanal (abertura, fechamento e intervalo de almoço/pausa) que gera os *slots* disponíveis automaticamente descontando horários já ocupados.
- **Proteção contra *Double-Booking*:** Reservas processadas com integridade transacional no banco de dados (`ACID`), impedindo que dois clientes reservem o mesmo horário simultaneamente.

---

## Principais Tecnologias

- **[Next.js 16](https://nextjs.org/)** — App Router, Server Components, Server Actions, Route Handlers (API REST) e Partial Prerendering (PPR).
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estrita ponta a ponta (`strict mode`).
- **[PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)** — Modelagem relacional, índices de busca e transações isoladas.
- **[Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)** — Interface *mobile-first* responsiva com sistema de design consistente.
- **[Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)** — Validação de formulários e entradas no cliente e no servidor.
- **[Vitest](https://vitest.dev/), [Newman](https://github.com/postmanlabs/newman) & [Playwright](https://playwright.dev/)** — Testes unitários, de integração, de API e ponta a ponta (celular emulado).
- **[GitHub Actions](https://docs.github.com/actions)** — Integração contínua: build e todos os testes a cada envio ao repositório.

---

## Como Rodar Localmente (Setup Rápido)

O projeto conta com scripts automatizados em `scripts/` que instalam as dependências, sobem um banco PostgreSQL isolado para testes locais, aplicam as migrações versionadas (`db/migrations`) e populam dados iniciais:

```bash

# 1. Instale o nvm.
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash

# 2. Baixa e instala o Node.js.
nvm install 26

# 3. Verifica a versão do Node.js.
node -v # Should print "v26.13.1".

# 4. Verifica a versão do npm.
npm -v # deve ter como saida a versão atual do npm.

# 5. Instala dependências, sobe o PostgreSQL local, aplica as migrações e popula os dados de teste
npm run setup:local

# 6. Inicia o servidor de desenvolvimento
npm run dev

```

Acesse **[http://localhost:3000](http://localhost:3000)** no navegador.

### Contas de Teste Prontas (Senha: `Teste1234`)
| Perfil | E-mail | Destino Padrão |
| :--- | :--- | :--- |
| **Cliente** | `cliente@teste.com` | `/explorar` |
| **Comércio (Barbearia)** | `barbearia@teste.com` | `/dashboard` |
| **Comércio (Estética)** | `estetica@teste.com` | `/dashboard` |

---

## Testes

```bash
npm run test:unit          # regras de agenda, validações e formatação
npm run test:integration   # motor de agenda + PostgreSQL
npm run build && npm run start   # em outro terminal, para os testes abaixo
npm run test:api           # coleção Postman com Newman
npm run test:e2e           # fluxo completo no navegador (Playwright)
```

Para recomeçar do zero o banco local (apaga os dados, aplica as migrações e roda o seed): `npm run db:test:reset`.

A CI roda tudo isso a cada envio ao repositório (aba **Actions**).

## API REST

A API fica em `src/app/api` e reaproveita as Server Actions. O contrato completo está em [`docs/api/openapi.yaml`](docs/api/openapi.yaml): 19 operações para cadastro, login, perfil e serviços do comércio, disponibilidade, busca e agendamento. A autenticação usa o cookie HTTP-only `agendou_session`.

---

## Equipe

| Integrante | Papel |
| :--- | :--- |
| Yuri Galvão Machado | Gerente de Projeto e de Configuração; Desenvolvedor |
| Mateus Cunha Rodrigues | Analista de Requisitos |
| Ryan Suyler Benlolo da Costa | Analista de Testes |
| Welliton Medeiros Frazão de Matos | Documentação e Apresentação |

---

## Documentação

| Documento | Arquivo | IC |
| :--- | :--- | :--- |
| Plano de Projeto | [PDF](docs/Planejamento/PlanoDeProjeto_Agendou.pdf) · [DOCX](docs/Planejamento/PlanoDeProjeto_Agendou.docx) | IC-DOC-01 |
| Documento de Requisitos | [PDF](docs/Requisitos/DocumentoRequisitos_Agendou.pdf) · [DOCX](docs/Requisitos/DocumentoRequisitos_Agendou.docx) | IC-DOC-03 |
| Especificação de Requisitos de Software (ERS) | [PDF](docs/Requisitos/ERS_Agendou.pdf) · [DOCX](docs/Requisitos/ERS_Agendou.docx) | IC-DOC-04 |
| Matriz de Rastreabilidade (RTM) | [PDF](docs/Requisitos/RTM_Agendou.pdf) · [DOCX](docs/Requisitos/RTM_Agendou.docx) | IC-DOC-06 |
| Inventário de Itens de Configuração | [PDF](docs/Ics/ICs_Agendou.pdf) · [DOCX](docs/Ics/ICs_Agendou.docx) | IC-DOC-05 |
| Status Accounting | [PDF](docs/StatusAccounting/StatusAccounting_Agendou.pdf) · [DOCX](docs/StatusAccounting/StatusAccounting_Agendou.docx) | IC-DOC-07 |
| Planilha de controle de ICs | [controleIC.csv](docs/Ics/controleIC.csv) | IC-DOC-02 |
| Formulários do Processo de Controle de Mudanças | [PCM_Agendou.xlsx](docs/PCM/PCM_Agendou.xlsx) | IC-DOC-08 |
| Diagramas (casos de uso, classes, banco, arquitetura, protótipos) | [docs/Requisitos/diagramas](docs/Requisitos/diagramas) | IC-DOC-09 |
| Contrato da API (OpenAPI 3.0) | [openapi.yaml](docs/api/openapi.yaml) | IC-API-01 |
| Coleção Postman dos testes de API | [postman_collection.json](docs/api/postman_collection.json) | IC-API-02 |

---

## Gerência de Configuração

- **Identificação:** 34 itens de configuração identificados no padrão `IC-<TIPO>-<NN>` (DOC, SRC, DB, API, TST, CI, CFG). Ver o inventário e a planilha de controle.
- **Controle de versões:** cada documento mantém o mesmo nome; a versão (x.y) fica na tabela Registro de Alterações e cada nova versão é um commit. O botão *History* de cada arquivo mostra a evolução.
- **Linhas de base (tags):** `BL-REQ-S1` (requisitos e planejamento), `BL-IMPL-S2` (sistema com API, testes e CI) e `BL-REL-S3` (release final auditada).
- **Controle de mudanças:** alterações em itens de uma linha de base passam pelo Processo de Controle de Mudanças (RFC → triagem → análise de impacto → CCB → planejamento → validação → encerramento), em um branch próprio integrado por pull request. A RFC-001 trata da API REST, das migrações, dos testes e da CI.
- **Relato de status:** o Status Accounting registra a situação de cada item, das linhas de base e das mudanças ao fim de cada etapa.
- **Commits:** mensagens com prefixo de tipo, por exemplo `docs:`, `feat:`, `fix:`, `test:`, `ci:` e `db:`.

---

## Estrutura do repositório

| Pasta | Conteúdo |
| :--- | :--- |
| `src/` | Código da aplicação: telas (`src/app`), Server Actions (`src/actions`), regras (`src/lib`) e API REST (`src/app/api`) |
| `db/` | Esquema do banco (`schema.prisma`), migrações (`db/migrations`) e dados de teste (`seed.mjs`) |
| `tests/` | Testes unitários (`unit`), de integração (`integration`) e ponta a ponta (`e2e`) |
| `docs/` | Documentos do projeto; `docs/api` tem o contrato da API e a coleção Postman |
| `.github/workflows/` | Pipeline de integração contínua (`ci.yml`) |
| `scripts/` | Preparação do ambiente local (`setup-local.sh`, `install-deps.sh`) e banco PostgreSQL de testes (`test-db.sh`) |
| `public/` | Logo e ícones |
| `.agents/` | Especificações das tarefas do MVP (TASK-01 a TASK-07) |
