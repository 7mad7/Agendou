# LOTOU - Contexto de Domínio do Negócio

## Propósito do MVP
Plataforma web mobile-first para digitalização de serviços locais, conectando clientes a comércios de proximidade com agendamento de horários sem fricção[cite: 1, 2].

## Perfis de Acesso (RBAC)[cite: 2]
1. CLIENTE:
   - Dados: nome, e-mail, idade, gênero[cite: 2].
   - Funções: buscar comércios locais[cite: 1, 2], visualizar catálogo de serviços e reservar horários livres[cite: 1, 2].
2. COMÉRCIO:
   - Dados: nome do comércio, e-mail comercial, CNPJ, categoria de serviço e endereço/localização[cite: 2].
   - Funções: definir grade de disponibilidade/horários de funcionamento[cite: 2], cadastrar serviços prestados (nome, preço, duração em minutos)[cite: 1] e gerenciar agenda de atendimentos[cite: 1, 2].

## Entidades Principais
- User / Profile: Contas de acesso segregadas por papel (role: CLIENT | MERCHANT)[cite: 2].
- Service: Procedimentos oferecidos pelo comércio (ex: Corte de Barba, Manicure)[cite: 1].
- AvailabilityRule: Definição de horários de abertura e fechamento por dia da semana.
- Booking: Registro da reserva contendo cliente, comércio, serviço, data/hora de início e fim, e status (PENDING, CONFIRMED, CANCELED).