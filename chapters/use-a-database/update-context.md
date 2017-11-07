## 更新上下文

这还不是数据库上下文全部的工作:

**`Data/ApplicationDbContext.cs`**

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // Customize the ASP.NET Identity model and override the defaults if needed.
        // For example，you can rename the ASP.NET Identity table names and more.
        // Add your customizations after calling base.OnModelCreating(builder);
    }
}
```

给 `ApplicationDbContext` 添加一个 `DbSet` 属性，在构造函数下:

```csharp
public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : base(options)
{
}

public DbSet<TodoItem> Items { get; set; }

// ...
```

`DbSet`代表数据库表或者集合。创建一个 `DbSet<TodoItem>` 属性叫 `Items`，告诉Entity Framework Core 你需要存储 `TodoItem` 表实体并叫`Items`。

这就是上下文更新所有需要的内容，但是有个小问题: 现在上下文和数据库不同步，因为数据库实际上并不存在 `Items` 表。 (仅更新上下文中的代码并不会改变数据库本身。)

为了把在上下文中的改动映射到数据库，你需要创建一个 **migration**。


## --------以下原文-----


## Update the context

There's not a whole lot going on in the database context yet:

**`Data/ApplicationDbContext.cs`**

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // Customize the ASP.NET Identity model and override the defaults if needed.
        // For example，you can rename the ASP.NET Identity table names and more.
        // Add your customizations after calling base.OnModelCreating(builder);
    }
}
```

Add a `DbSet` property to the `ApplicationDbContext`，right below the constructor:

```csharp
public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : base(options)
{
}

public DbSet<TodoItem> Items { get; set; }

// ...
```

A `DbSet` represents a table or collection in the database. By creating a `DbSet<TodoItem>` property called `Items`，you're telling Entity Framework Core that you want to store `TodoItem` entities in a table called `Items`.

That's all you need to update on the context，but there's one small problem: the context and database are now out of sync，because there isn't actually an `Items` table in the database. (Just updating the code of the context class doesn't change the database itself.)

In order to update the database to reflect the change you just made to the context，you need to create a **migration**.
