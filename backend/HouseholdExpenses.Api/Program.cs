using HouseholdExpenses.Api.Data;
using HouseholdExpenses.Api.Dtos;
using HouseholdExpenses.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Mantem o contrato HTTP legivel para o front-end: "Expense" e "Income" em vez de 0 e 1.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Garante que o arquivo SQLite e as tabelas existam sem exigir um comando manual de migracao.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("Frontend");

app.MapGet("/api/people", async (AppDbContext db) =>
{
    var people = await db.People
        .AsNoTracking()
        .OrderBy(person => person.Name)
        .Select(person => new PersonResponse(person.Id, person.Name, person.Age))
        .ToListAsync();

    return Results.Ok(people);
});

app.MapPost("/api/people", async (CreatePersonRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest(new ErrorResponse("O nome da pessoa e obrigatorio."));
    }

    if (request.Age < 0)
    {
        return Results.BadRequest(new ErrorResponse("A idade nao pode ser negativa."));
    }

    var person = new Person
    {
        Name = request.Name.Trim(),
        Age = request.Age
    };

    db.People.Add(person);
    await db.SaveChangesAsync();

    return Results.Created($"/api/people/{person.Id}", new PersonResponse(person.Id, person.Name, person.Age));
});

app.MapDelete("/api/people/{id:int}", async (int id, AppDbContext db) =>
{
    var person = await db.People.FindAsync(id);

    if (person is null)
    {
        return Results.NotFound(new ErrorResponse("Pessoa nao encontrada."));
    }

    // As transacoes sao apagadas por cascade delete, configurado no AppDbContext.
    db.People.Remove(person);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapGet("/api/transactions", async (AppDbContext db) =>
{
    var transactions = await db.Transactions
        .AsNoTracking()
        .Include(transaction => transaction.Person)
        .OrderByDescending(transaction => transaction.CreatedAt)
        .Select(transaction => new TransactionResponse(
            transaction.Id,
            transaction.Description,
            transaction.Value,
            transaction.Type,
            transaction.PersonId,
            transaction.Person!.Name,
            transaction.CreatedAt))
        .ToListAsync();

    return Results.Ok(transactions);
});

app.MapPost("/api/transactions", async (CreateTransactionRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest(new ErrorResponse("A descricao da transacao e obrigatoria."));
    }

    if (request.Value <= 0)
    {
        return Results.BadRequest(new ErrorResponse("O valor da transacao deve ser maior que zero."));
    }

    if (!Enum.IsDefined(request.Type))
    {
        return Results.BadRequest(new ErrorResponse("O tipo da transacao deve ser receita ou despesa."));
    }

    var person = await db.People.FindAsync(request.PersonId);

    if (person is null)
    {
        return Results.BadRequest(new ErrorResponse("A pessoa informada nao existe."));
    }

    // Regra de negocio: menores de idade nao podem receber receitas.
    if (person.Age < 18 && request.Type == TransactionType.Income)
    {
        return Results.BadRequest(new ErrorResponse("Pessoas menores de idade podem ter apenas despesas cadastradas."));
    }

    var transaction = new Transaction
    {
        Description = request.Description.Trim(),
        Value = request.Value,
        Type = request.Type,
        PersonId = request.PersonId,
        CreatedAt = DateTimeOffset.UtcNow
    };

    db.Transactions.Add(transaction);
    await db.SaveChangesAsync();

    return Results.Created($"/api/transactions/{transaction.Id}", new TransactionResponse(
        transaction.Id,
        transaction.Description,
        transaction.Value,
        transaction.Type,
        person.Id,
        person.Name,
        transaction.CreatedAt));
});

app.MapGet("/api/totals", async (AppDbContext db) =>
{
    var people = await db.People
        .AsNoTracking()
        .Include(person => person.Transactions)
        .OrderBy(person => person.Name)
        .ToListAsync();

    // O saldo e calculado sempre a partir das transacoes persistidas, evitando duplicar estado no banco.
    var personTotals = people
        .Select(person =>
        {
            var income = person.Transactions
                .Where(transaction => transaction.Type == TransactionType.Income)
                .Sum(transaction => transaction.Value);

            var expense = person.Transactions
                .Where(transaction => transaction.Type == TransactionType.Expense)
                .Sum(transaction => transaction.Value);

            return new PersonTotalResponse(person.Id, person.Name, income, expense, income - expense);
        })
        .ToList();

    var totalIncome = personTotals.Sum(total => total.TotalIncome);
    var totalExpense = personTotals.Sum(total => total.TotalExpense);

    return Results.Ok(new TotalsResponse(
        personTotals,
        new GeneralTotalResponse(totalIncome, totalExpense, totalIncome - totalExpense)));
});

app.Run();
