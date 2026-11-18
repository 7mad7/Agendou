<div align="center">
  <img src="./public/logo.png" alt="Logo Agendou" width="160" />

  <h1>Agendou</h1>
  <p><strong>Tudo o que você precisa no seu bairro, com horário marcado.</strong></p>
</div>

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

- **[Next.js 16](https://nextjs.org/)** — App Router, Server Components, Server Actions e Partial Prerendering (PPR).
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estrita ponta a ponta (`strict mode`).
- **[PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)** — Modelagem relacional, índices de busca e transações isoladas.
- **[Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)** — Interface *mobile-first* responsiva com sistema de design consistente.
- **[Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)** — Validação de formulários e entradas no cliente e no servidor.

---

## Como Rodar Localmente (Setup Rápido)

O projeto conta com scripts automatizados em `scripts/` que instalam as dependências, sobem um banco PostgreSQL isolado para testes locais, aplicam o schema e populam dados iniciais:

```bash
# 1. Instala dependências, sobe o PostgreSQL local e popula os dados de teste
npm run setup:local

# 2. Inicia o servidor de desenvolvimento
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)** no navegador.

### Contas de Teste Prontas (Senha: `Teste1234`)
| Perfil | E-mail | Destino Padrão |
| :--- | :--- | :--- |
| **Cliente** | `cliente@teste.com` | `/explorar` |
| **Comércio (Barbearia)** | `barbearia@teste.com` | `/dashboard` |
| **Comércio (Estética)** | `estetica@teste.com` | `/dashboard` |
