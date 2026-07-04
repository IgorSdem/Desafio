namespace HouseholdExpenses.Api.Models;

public sealed class Transaction
{
    public int Id { get; set; }
    public required string Description { get; set; }
    public decimal Value { get; set; }
    public TransactionType Type { get; set; }
    public int PersonId { get; set; }
    public Person? Person { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

