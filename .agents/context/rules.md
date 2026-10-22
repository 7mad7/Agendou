# LOTOU - Diretrizes de Engenharia e Padrões de Código

## 1. Stack Tecnológica
- Framework: Next.js 16+ (App Router), TypeScript em modo strict.
- Banco de Dados: PostgreSQL gerenciado (Supabase/Neon) via Prisma ORM.
- Estilização & UI: Tailwind CSS, shadcn/ui e Lucide React.
- Validação: Zod para validação de dados de entrada em Server Actions e formulários.

## 2. Padrões de Arquitetura e Código
- Layout Mobile-First: Toda a interface pública deve ser projetada prioritariamente para telas móveis (viewport padrão 390px-430px).
- Server Actions & Backend: Todas as interações com o banco devem residir em Server Actions tipadas em `src/actions/` ou rotas de API dedicadas. Não faça chamadas diretas ao banco dentro de Client Components.
- Concorrência de Horários: Agendamentos devem respeitar integridade transacional no banco (`prisma.$transaction`) ou constraints únicas para evitar reservas simultâneas do mesmo slot.
- Tipagem: Proibido o uso de `any`. Use tipos inferidos do Prisma ou schemas do Zod.

## 3. Protocolo de Execução do Agente
1. Antes de modificar qualquer código, apresente um "Implementation Plan" conciso detalhando os arquivos a serem criados/modificados.
2. Execute alterações em passos incrementais e atômicos.
3. Não instale novas dependências sem listá-las previamente no plano de ação.

## 4. Comandos de Verificação Mandatórios
Ao término de cada tarefa, o Subagente de Terminal DEVE executar e garantir zero erros em:
- `npx prisma validate` (caso altere esquemas de banco)
- `npx tsc --noEmit` (checagem de tipagem estrita)
- `npm run lint`