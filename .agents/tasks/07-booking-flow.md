### [TASK-07]: Fluxo de Agendamento do Cliente (Reserva Atômica e Confirmação)

**1. Objetivo:**
Implementar a página pública de detalhes do comércio e o fluxo de agendamento de horários pelo cliente com bloqueio de horários ocupados e proteção contra reservas simultâneas[cite: 1, 2].

**2. Arquivos Envolvidos:**
- Criar: `src/app/c/[slug]/page.tsx`
- Criar: `src/components/booking/service-picker.tsx`
- Criar: `src/components/booking/calendar-strip.tsx`
- Criar: `src/components/booking/slot-grid.tsx`
- Criar: `src/components/booking/booking-confirmation-modal.tsx`
- Criar: `src/actions/booking.ts`

**3. Requisitos Funcionais & Regras:**
- **Página do Comércio (`/c/[slug]`):**
  - Exibição dos dados do estabelecimento (nome, endereço, categoria) e catálogo de serviços com preços[cite: 1, 2].
  - O cliente clica no serviço desejado para abrir o fluxo de agendamento[cite: 1].
- **Seleção de Data e Horário:**
  - Seletor horizontal de datas (próximos 14 dias).
  - Ao selecionar a data, carregar os slots livres disponíveis e ocultar os horários ocupados[cite: 2].
- **Reserva Atômica (Prevenção de Double-Booking):**
  - A confirmação deve rodar em uma Server Action transacional com `prisma.$transaction`.
  - O sistema deve checar antes de inserir se o horário ainda está desimpedido. Caso outro usuário tenha acabado de reservar o slot, abortar e retornar mensagem de erro amigável.
- **Pós-Agendamento:**
  - Ao confirmar com sucesso, exibir modal de sucesso com botão direto para WhatsApp do estabelecimento com texto pré-formatado (ex: *"Olá, confirmei meu agendamento de [Serviço] para o dia [Data] às [Hora] pelo Agendou"*).

**4. Critérios de Aceitação (DoD):**
- [ ] Impossível criar dois agendamentos simultâneos para o mesmo comércio e horário (integridade ACID).
- [ ] Interface fluida e otimizada para toque em telas móveis.
- [ ] Bloqueio para clientes não autenticados (solicita login com redirecionamento de volta para o agendamento).
- [ ] `npx tsc --noEmit` e `npm run lint` finalizados com zero erros.