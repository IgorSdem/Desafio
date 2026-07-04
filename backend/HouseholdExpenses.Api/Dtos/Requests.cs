using HouseholdExpenses.Api.Models;

namespace HouseholdExpenses.Api.Dtos;

public sealed record CreatePersonRequest(string Name, int Age);

public sealed record CreateTransactionRequest(
    string Description,
    decimal Value,
    TransactionType Type,
    int PersonId);

