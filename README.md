# Controle de Gastos Residenciais

Aplicacao para cadastro de pessoas, cadastro de transacoes e consulta de totais por pessoa e geral.

## Tecnologias

- Back-end: .NET 8, C#, ASP.NET Core Minimal API, Entity Framework Core e SQLite.
- Front-end: React, TypeScript e Vite.
- Persistencia: arquivo SQLite criado automaticamente em `backend/HouseholdExpenses.Api/household-expenses.db`.

## Como executar

### Back-end

```bash
cd backend/HouseholdExpenses.Api
dotnet restore
dotnet run
```

A API ficara disponivel em `http://localhost:5226`.

### Front-end

```bash
cd frontend
npm install
npm run dev
```

O front-end ficara disponivel em `http://localhost:5173`.

## Regras implementadas

- Pessoas podem ser criadas, listadas e excluidas.
- Ao excluir uma pessoa, todas as transacoes associadas a ela tambem sao removidas.
- Transacoes podem ser criadas e listadas.
- Toda transacao precisa referenciar uma pessoa existente.
- Pessoas menores de 18 anos so podem receber transacoes do tipo despesa.
- A consulta de totais mostra receitas, despesas e saldo por pessoa, alem do total geral.

## Endpoints principais

- `GET /api/people`
- `POST /api/people`
- `DELETE /api/people/{id}`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/totals`

