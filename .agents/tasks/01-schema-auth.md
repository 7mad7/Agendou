### [TASK 01]: Modelagem do Banco (Prisma) e Estrutura de Perfis (Client vs Merchant)

**1. Objetivo:**
Configurar o schema inicial do Prisma no PostgreSQL contendo as tabelas fundamentais de usuários segregados por papéis (Cliente e Comércio) e os cadastros base de serviços[cite: 2].

**2. Arquivos Envolvidos:**
- Criar: `prisma/schema.prisma`
- Criar: `src/lib/prisma.ts` (cliente singleton do Prisma)
- Modificar: `.env.example`

**3. Requisitos Funcionais & Regras:**
- Tabela `User`: id, email (único), role (enum: CLIENT, MERCHANT), createdAt, updatedAt[cite: 2].
- Tabela `ClientProfile`: userId (1:1), name, age, gender[cite: 2].
- Tabela `MerchantProfile`: userId (1:1), tradeName, cnpj, category, address, latitude, longitude[cite: 2].
- Tabela `Service`: id, merchantId (FK), title, price (Decimal), durationMinutes (Int).
- Configurar índices adequados para buscas por categoria e latitude/longitude.

**4. Critérios de Aceitação (DoD):**
- [ ] O schema do Prisma é validado sem inconsistências de relacionamentos.
- [ ] Arquivo `src/lib/prisma.ts` exporta a instância tipada e segura contra múltiplas conexões em desenvolvimento.
- [ ] Subagente de Terminal executa `npx prisma validate` com sucesso.