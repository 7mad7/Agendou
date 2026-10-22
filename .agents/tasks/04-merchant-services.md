### [TASK-04]: Painel do Comércio: Gestão de Perfil e Catálogo de Serviços

**1. Objetivo:**
Construir o painel de administração do comerciante para gerenciamento de dados do estabelecimento e estruturação do catálogo de serviços prestados[cite: 1, 2].

**2. Arquivos Envolvidos:**
- Criar: `src/app/dashboard/layout.tsx` (shell do painel administrativo)
- Criar: `src/app/dashboard/perfil/page.tsx`
- Criar: `src/app/dashboard/servicos/page.tsx`
- Criar: `src/components/dashboard/service-dialog.tsx` (modal de criação/edição)
- Criar: `src/components/dashboard/service-list.tsx`
- Criar: `src/actions/merchant.ts`
- Criar: `src/actions/services.ts`

**3. Requisitos Funcionais & Regras:**
- **Perfil do Estabelecimento:**
  - Edição de nome fantasia, telefone comercial, categoria e descrição do espaço[cite: 1, 2].
  - Captura de coordenadas geográficas a partir do endereço inserido ou geolocalização do navegador[cite: 2].
- **Catálogo de Serviços:**
  - Listagem em cards ou tabela mobile-first dos serviços cadastrados[cite: 1].
  - Criação, edição e exclusão de itens: Título do serviço, Descrição, Preço em Reais (R$) e Duração do atendimento em minutos (ex: 30, 45, 60 min)[cite: 1].
  - Soft-delete ou validação impeditiva de exclusão caso o serviço possua agendamentos futuros pendentes.

**4. Critérios de Aceitação (DoD):**
- [ ] CRUD de serviços operacional via Server Actions com revalidação de tags (`revalidatePath`).
- [ ] Formatação monetária em BRL (R$) e temporal (minutos) exibida corretamente.
- [ ] Bloqueio de acesso para usuários que não possuem perfil de comércio registrado.
- [ ] `npx tsc --noEmit` sem erros de compilação.