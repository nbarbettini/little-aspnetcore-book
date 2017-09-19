## Create a migration

Migrations keep track of changes to the database structure over time, and make it possible to undo (roll back) a set of changes, or create a second database with the same structure as the first. With migrations, you have a full history of modifications like adding or removing columns (and entire tables).

Since the context and the database are now out of sync, you'll create a migration to update the database and add the `Items` table you defined in the context.

```
dotnet ef migrations add AddItems
```

This creates a new migration called `AddItems` by examining any changes you've made to the context.

> If you get an error like:
> `No executable found matching command "dotnet-ef"`
> Make sure you're in the right directory. These commands must be run from the project root directory (where the `Program.cs` file is).

If you open up the `Data/Migrations` directory, you'll see a few files:

![Multiple migrations](migrations.png)

The first migration file (with a name like `00_CreateIdentitySchema.cs`) was created for you, and already applied to the database, by `dotnet new`. Your `AddItem` migration is prefixed with a timestamp when you create it.

> Tip: You can see a list of migrations with `dotnet ef migrations list.

If you open your migration file, you'll see two methods called `Up` and `Down`:

**`Data/Migrations/<date>_AddItems.cs`**

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    // (... some code)

    migrationBuilder.CreateTable(
        name: "Items",
        columns: table => new
        {
            Id = table.Column<Guid>(type: "BLOB", nullable: false),
            DueAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
            IsDone = table.Column<bool>(type: "INTEGER", nullable: false),
            Title = table.Column<string>(type: "TEXT", nullable: true)
        },
        constraints: table =>
        {
            table.PrimaryKey("PK_Items", x => x.Id);
        });

    // (some code...)
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    // (... some code)

    migrationBuilder.DropTable(
        name: "Items");

    // (some code...)
}
```

The `Up` method runs when you apply the migration to the database. Since you added a `DbSet<TodoItem>` to the database context, Entity Framework Core will create an `Items` table (with columns that match a `TodoItem`) when you apply the migration.

The `Down` method does the opposite: if you need to undo (roll back) the migration, the `Items` table will be dropped.

### Workaround for SQLite limitations

There are some limitations of SQLite that get in the way if you try to run the migration as-is. Until this problem is fixed, use this workaround:

* Comment out the `migrationBuilder.AddForeignKey` lines in the `Up` method.
* Comment out any `migrationBuilder.DropForeignKey` lines in the `Down` method.

If you use a full-fledged SQL database, like SQL Server or MySQL, this won't be an issue and you won't need to do this (admittedly hackish) workaround.

### Apply the migration

The final step after creating one (or more) migrations is to actually apply them to the database:

```
dotnet ef database update
```

This command will cause Entity Framework Core to create the `Items` table in the database.

> If you want to roll back the database, you can provide the name of the *previous* migration:
> `dotnet ef database update CreateIdentitySchema`
> This will run the `Down` methods of any migrations newer than the migration you specify.

> If you need to completely erase the database and start over, run `dotnet ef database drop` followed by `dotnet ef database update` to re-scaffold the database and bring it up to the current migration.

That's it! Both the database and the context are ready to go. Next, you'll use the context in your service layer.
