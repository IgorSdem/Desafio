using HouseholdExpenses.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseholdExpenses.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Person> People => Set<Person>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Person>(entity =>
        {
            entity.ToTable("People");
            entity.HasKey(person => person.Id);
            entity.Property(person => person.Name).HasMaxLength(120).IsRequired();
            entity.Property(person => person.Age).IsRequired();

            // Ao remover uma pessoa, o banco remove automaticamente todas as transacoes dela.
            entity.HasMany(person => person.Transactions)
                .WithOne(transaction => transaction.Person)
                .HasForeignKey(transaction => transaction.PersonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasKey(transaction => transaction.Id);
            entity.Property(transaction => transaction.Description).HasMaxLength(200).IsRequired();
            entity.Property(transaction => transaction.Value).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(transaction => transaction.Type).HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(transaction => transaction.CreatedAt).IsRequired();
        });
    }
}

