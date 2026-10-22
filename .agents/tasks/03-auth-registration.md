### [TASK-03]: Autenticação e Cadastro Bifurcado (Cliente vs Comércio)

**1. Objetivo:**
Implementar o fluxo completo de autenticação e registro de contas com bifurcação de formulários para Clientes e Comerciantes, persistência de sessão e proteção de rotas com base na função do usuário.

**2. Arquivos Envolvidos:**
- Criar: `src/app/(auth)/login/page.tsx`
- Criar: `src/app/(auth)/register/page.tsx`
- Criar: `src/app/(auth)/forgot-password/page.tsx`
- Criar: `src/components/auth/client-register-form.tsx`
- Criar: `src/components/auth/merchant-register-form.tsx`
- Criar: `src/actions/auth.ts`
- Criar: `src/middleware.ts`

**3. Requisitos Funcionais & Regras:**
- **Entrada e Recuperação de Conta:**
  - Login seguro via e-mail e senha[cite: 2].
  - Rota de recuperação de conta com envio de link por e-mail[cite: 2].
- **Bifurcação de Cadastro:**
  - Seletor de tipo de perfil na tela de registro: "Sou Cliente" ou "Sou Comércio"[cite: 2].
  - Formulário do Cliente deve coletar: Nome, Idade, Gênero, E-mail e Senha[cite: 2].
  - Formulário do Comércio deve coletar: Nome do Comércio, E-mail, CNPJ, Categoria de Serviço, Endereço e Senha[cite: 2].
- **Validação e Persistência:**
  - Schemas Zod dedicados com validação de CNPJ, formato de e-mail e força de senha.
  - Criação transacional: inserir credencial de autenticação e registrar a linha correspondente em `ClientProfile` ou `MerchantProfile`.
- **Controle de Acesso e Redirecionamento (Middleware):**
  - Usuário logado como `MERCHANT` tentando acessar `/explorar` deve poder navegar, mas seu fluxo padrão pós-login é `/dashboard`.
  - Usuário `CLIENT` não pode acessar rotas `/dashboard/*`.
  - Persistência contínua de sessão via cookies seguros.

**4. Critérios de Aceitação (DoD):**
- [ ] Formulários com validação visual inline via React Hook Form + Zod.
- [ ] O fluxo de registro cria o usuário e perfil relacionado no PostgreSQL via transação.
- [ ] Middleware protege rotas `/dashboard/*` contra acessos de usuários não comerciantes ou anônimos.
- [ ] `npx tsc --noEmit` executa sem erros de tipagem.