using HouseholdExpenses.Api.Models;

namespace HouseholdExpenses.Api.Dtos;

public sealed record ErrorResponse(string Message);

public sealed record PersonResponse(int Id, string Name, int Age);

public sealed record TransactionResponse(
    int Id,
    string Description,
    decimal Value,
    TransactionType Type,
    int PersonId,
    string PersonName,
    DateTimeOffset CreatedAt);

public sealed record PersonTotalResponse(
    int PersonId,
    string PersonName,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal Balance);

public sealed record GeneralTotalResponse(decimal TotalIncome, decimal TotalExpense, decimal Balance);

public sealed record TotalsResponse(IReadOnlyCollection<PersonTotalResponse> People, GeneralTotalResponse General);

