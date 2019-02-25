## Update the context

There's not a whole lot going on in the database context yet:

**Data/ApplicationDbContext.cs**

```csharp
public class ApplicationDbContext 
             : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // ...
    }
}
```

Add a `DbSet` property to the `ApplicationDbContext`, right below the constructor:

```csharp
public ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : base(options)
{
}

public DbSet<TodoItem> Items { get; set; }

// ...
```

And set up the `@using` statement for the Models:

```csharp
using AspNetCoreTodo.Models;
```

A `DbSet` represents a table or collection in the database. By creating a `DbSet<TodoItem>` property called `Items`, you're telling Entity Framework Core that you want to store `TodoItem` entities in a table called `Items`.

You've updated the context class, but now there's one small problem: the context and database are now out of sync, because there isn't actually an `Items` table in the database. (Just updating the code of the context class doesn't change the database itself.)

In order to update the database to reflect the change you just made to the context, you need to create a **migration**.

> If you already have an existing database, search the web for "scaffold-dbcontext existing database" and read Microsoft's documentation on using the `Scaffold-DbContext` tool to reverse-engineer your database structure into the proper `DbContext` and model classes automatically.
