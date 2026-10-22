### [TASK-05]: Motor de Disponibilidade e Configuração da Agenda do Comércio

**1. Objetivo:**
Desenvolver a interface e lógica de banco para que o comerciante configure seus dias e horários de funcionamento, permitindo ao sistema computar os slots disponíveis e ocupados para os clientes[cite: 1, 2].

**2. Arquivos Envolvidos:**
- Modificar: `prisma/schema.prisma` (tabela `MerchantAvailability` e regras de intervalo)
- Criar: `src/app/dashboard/agenda/configuracao/page.tsx`
- Criar: `src/components/dashboard/availability-form.tsx`
- Criar: `src/actions/availability.ts`
- Criar: `src/lib/availability-engine.ts` (gerador matemático de slots livres)

**3. Requisitos Funcionais & Regras:**
- **Configuração de Grade Semanal:**
  - Comerciante define os dias de atendimento (Segunda a Domingo)[cite: 2].
  - Para cada dia ativo: Horário de Abertura, Horário de Fechamento e Intervalo de Pausa (ex: Almoço 12:00 - 13:00).
- **Motor de Geração de Horários:**
  - Função utilitária pura que recebe: `(data, merchantId, duracaoDoServico)`.
  - A função deve consultar a grade de atendimento do dia, subtrair os horários já reservados (`Bookings`) com status confirmado e retornar uma lista de slots livres (ex: `["09:00", "09:45", "10:30"]`)[cite: 2].
  - Não permitir geração de horários que colidam com horários passados em relação ao momento atual (`now()`).

**4. Critérios de Aceitação (DoD):**
- [ ] Interface intuitiva com switches liga/desliga para cada dia da semana e campos de hora (`HH:mm`).
- [ ] Validação para garantir que o horário de término seja posterior ao horário de início.
- [ ] O utilitário `availability-engine.ts` gera slots matematicamente corretos descontando os intervalos ocupados[cite: 2].
- [ ] `npx tsc --noEmit` executado com zero falhas.