### [TASK-02]: UI Base, Layout Shell Mobile-First & Tela Inicial (Landing)

**1. Objetivo:**
Implementar o invólucro visual principal (Layout Shell) garantindo comportamento mobile-first no desktop, configurar os componentes de base do shadcn/ui e construir a tela inicial (`/`) de apresentação do LOTOU com pontos de entrada claros para clientes e comerciantes.

**2. Arquivos Envolvidos:**
- Criar: `src/components/layout/mobile-shell.tsx` (container com largura máxima e padding responsivo)
- Criar: `src/components/layout/header.tsx` (topo com logotipo LOTOU e ações rápidas)
- Criar: `src/components/layout/bottom-nav.tsx` (navegação inferior para mobile)
- Criar: `src/components/landing/hero-section.tsx`
- Criar: `src/components/landing/category-pills.tsx`
- Modificar: `src/app/layout.tsx` (fonte, tema e casulo principal)
- Modificar: `src/app/page.tsx` (composição da tela inicial)

**3. Requisitos Funcionais & Design:**

- **Comportamento Mobile-First:**
  - Em telas móveis: ocupar 100% da viewport.
  - Em desktop: centralizar a interface com largura máxima controlada (`max-w-md` ou `max-w-lg`) com fundo neutro sutil nas laterais, simulando a usabilidade de um app.
  
- **Componentes da Tela Inicial (`/`):**
  - **Header:** Logotipo LOTOU em destaque e botão de Login.
  - **Hero:** Frase de impacto sobre valor local (ex: *"Tudo o que você precisa no seu bairro, com horário marcado"*).
  - **Barra de Pesquisa Rápida (Mock):** Campo de busca visual que redireciona o usuário para `/explorar` com botão de filtro por proximidade.
  - **Grid de Categorias:** Atalhos com ícones (Barbearia, Estética, Lanches, Manutenção/Serviços).
  - **Bifurcação de Público (CTAs):**
    - Card/Botão principal: *"Buscar comércios próximos"* (Fluxo do Cliente).
    - Card secundário/destaque: *"Tem um comércio? Cadastre seu espaço e organize sua agenda"* (Fluxo do Comerciante).
  - **Bottom Navigation (Mobile):** Barra inferior fixa contendo ícones: Início, Explorar e Perfil/Login.

- **Padrões Técnicos:**
  - Utilizar ícones do pacote `lucide-react`.
  - Componentes devem ser semânticos, acessíveis e estilizados com Tailwind CSS.
  - Evitar hardcoding de cores; usar as classes de design tokens do Tailwind/shadcn (`bg-background`, `text-foreground`, `bg-primary`, etc.).

**4. Critérios de Aceitação (Definition of Done - DoD):**
- [ ] O layout não quebra em telas de 360px a 430px de largura.
- [ ] O layout em desktop permanece centralizado e esteticamente agradável.
- [ ] Os botões de navegação e busca realizam os redirecionamentos corretos (usando `next/link`).
- [ ] `npx tsc --noEmit` executado com zero erros de tipagem.
- [ ] `npm run lint` validado sem avisos críticos.