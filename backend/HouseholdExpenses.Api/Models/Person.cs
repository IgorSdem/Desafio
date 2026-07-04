namespace HouseholdExpenses.Api.Models;

public sealed class Person
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int Age { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

