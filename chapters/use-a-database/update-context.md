## 修改数据库上下文

数据库上下文这边所需的工作不多：

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

在构造函数的下方，为 `ApplicationDbContext` 添加一个 `DbSet` 属性：

```csharp
public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : base(options)
{
}

public DbSet<TodoItem> Items { get; set; }

// ...
```

`DbSet` 代表数据库里的 表 或者 集合。创建一个名为 `Items` 的 `DbSet<TodoItem>` 属性，可以让 Entity Framework Core 知道，你需要在一个名为 `Items` 的表里保存 `TodoItem` 实体。

你修改了 数据库上下文 的类，却产生了一个小问题: 现在上下文和数据库不同步了，因为数据库里实际上并不存在 `Items` 这个表。(对数据库上下文代码的修改，并不会改变数据库本身。)

为了把“数据库上下文中的改动”反应到数据库里，你需要创建一个 **变更(migration)**。

> 如果你已经有一个现存的数据库，请在网络上搜索“scaffold-dbcontext existing database”相关的内容，并阅读微软的关于使用 `Scaffold-DbContext` 工具的文档，以此对你的数据库进行逆向工程，自动地为数据库结构生成相应的 `DbContext` 和模型类。

---

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

A `DbSet` represents a table or collection in the database. By creating a `DbSet<TodoItem>` property called `Items`, you're telling Entity Framework Core that you want to store `TodoItem` entities in a table called `Items`.

You've updated the context class, but now there's one small problem: the context and database are now out of sync, because there isn't actually an `Items` table in the database. (Just updating the code of the context class doesn't change the database itself.)

In order to update the database to reflect the change you just made to the context, you need to create a **migration**.

> If you already have an existing database, search the web for "scaffold-dbcontext existing database" and read Microsoft's documentation on using the `Scaffold-DbContext` tool to reverse-engineer your database structure into the proper `DbContext` and model classes automatically.
