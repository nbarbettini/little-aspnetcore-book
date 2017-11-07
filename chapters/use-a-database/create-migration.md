## 创建一个迁移

迁移随时记录表结构的变化，有可能撤销(回滚)一组更改，或者创建与初始时相同表结构的数据库.随着迁移，你有一个完整的添加或删除字段、表的历史记录。

由于现在上下文和数据库不同步，你要创建一个迁移来更新数据库并且在你定义的上下文中添加`Items`。

```
dotnet ef migrations add AddItems
```

这将根据检查上下文的任何变化创建一个叫`AddItems`的新的迁移。

> 如果你得到一个错误:
> `No executable found matching command "dotnet-ef"`
> 请确认在正确的目录下执行。 这些命令必须在项目的根目录下执行(`Program.cs`所在目录)。

如果你打开`Data/Migrations` 目录，你将会看到:

![Multiple migrations](migrations.png)

第一个迁移文件(`00_CreateIdentitySchema.cs`) 是为你创建的，并且通过 `dotnet new`已经应用到数据库中。 当你创建 `AddItem` 迁移时是带时间戳的。

> 提示:你可以用 `dotnet ef migrations list`看到一个迁移列表。

如果你打开一个迁移文件，你将看见两个叫`Up` and `Down`的方法:

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

将迁移应用到数据库时将运行`Up`方法。自你添加`DbSet<TodoItem>`到数据库上下文中，当你应用迁移时Entity Framework Core 将会创建一个`Items` 表 (列匹配`TodoItem`)。

 `Down` 方法正好相反: 当你需要撤销(回滚)迁移时，`Items` 表将会被删除。

### SQLite局限性的解决办法

使用SQLite时，如果你用迁移的方法会有一些局限性。在使用这个方法以前一直存在:

* 在 `Up` 方法里注释　`migrationBuilder.AddForeignKey` 一行。
* 在　`Down`方法里注释 `migrationBuilder.DropForeignKey` 一行。

如果你使用完整的数据库，如 SQL Server 或者 MySQL，就不存在这个问题。

### 应用迁移

创建迁移最后一步就是要应用到数据库中:

```
dotnet ef database update
```

Entity Framework Core用这条命令在数据库中创建 `Items` 表。

> 如果你想回滚数据库，你可以提供 *以前* 迁移的名称:
> `dotnet ef database update CreateIdentitySchema`
> 这将运行任何比你指定的迁移更新的 `Down` 方法。

> 如果你需要完整的抹去数据库并重新开始，运行 `dotnet ef database drop` 然后运行 `dotnet ef database update` ，新建数据库框架并推到当前迁移。

就这样! 数据库和上下文都准备好了。 下一步，你将在服务层使用上下文。

## --------以下原文-----


## Create a migration

Migrations keep track of changes to the database structure over time. They make it possible to undo (roll back) a set of changes, or create a second database with the same structure as the first. With migrations, you have a full history of modifications like adding or removing columns (and entire tables).

In the previous chapter, you added an `Items` set to the context. Since the context now includes a set (or table) that doesn't exist in the database, you need to create a migration to update the database:

```
dotnet ef migrations add AddItems
```

This creates a new migration called `AddItems` by examining any changes you've made to the context.

> If you get an error like `No executable found matching command "dotnet-ef"`, make sure you're in the right directory. These commands must be run from the project root directory (where the `Program.cs` file is).

If you open up the `Data/Migrations` directory, you'll see a few files:

![Multiple migrations](migrations.png)

The first migration file (with a name like `00_CreateIdentitySchema.cs`) was created and applied for you way back when you ran `dotnet new`. Your new `AddItem` migration is prefixed with a timestamp when you create it.

> You can see a list of migrations with `dotnet ef migrations list`.

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
