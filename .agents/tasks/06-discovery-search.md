### [TASK-06]: Busca, Filtros e Descoberta de Comércios (`/explorar`)

**1. Objetivo:**
Construir a tela pública de exploração que permite ao cliente buscar comércios locais por nome, proximidade geográfica e categoria de serviço, incluindo placeholder visual do mapa[cite: 1, 2].

**2. Arquivos Envolvidos:**
- Criar: `src/app/explorar/page.tsx`
- Criar: `src/components/discovery/search-bar.tsx`
- Criar: `src/components/discovery/category-filter.tsx`
- Criar: `src/components/discovery/merchant-card.tsx`
- Criar: `src/components/discovery/map-placeholder.tsx`
- Criar: `src/actions/discovery.ts`

**3. Requisitos Funcionais & Regras:**
- **Controles de Busca:**
  - Campo de texto para filtro por nome do estabelecimento[cite: 2].
  - Filtro horizontal por categoria de serviço (ex: Barbearia, Estética, Lanches)[cite: 1, 2].
  - Botão de alternância: "Mais Próximos" (solicita GPS via navegador) e "Melhores Avaliados"[cite: 1, 2].
- **Exibição dos Resultados:**
  - Cards mobile-first contendo: Nome do comércio, Categoria, Distância aproximada em km e Endereço resumido[cite: 2].
  - Link em cada card direcionando para a página pública do estabelecimento: `/c/[slug]` ou `/c/[id]`.
- **Área do Mapa:**
  - Implementar componente de mapa leve ou placeholder visual desacoplado para integração posterior[cite: 2].
- **Tratamento de Fallback:**
  - Caso o cliente negue a permissão de GPS, a consulta deve retornar ordenação alfabética ou pelos mais bem avaliados por padrão[cite: 1].

**4. Critérios de Aceitação (DoD):**
- [ ] Parâmetros de busca sincronizados via URL Search Params (`?q=...&category=...&order=...`).
- [ ] Placeholder de mapa estilizado e responsivo[cite: 2].
- [ ] Query de busca no PostgreSQL otimizada por índices.
- [ ] `npx tsc --noEmit` validado sem erros.