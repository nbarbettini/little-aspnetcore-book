## 连接数据库

用Entity Framework Core连接数据库需要做几件事.既然你用`dotnet new`和MVC + Individual Auth template 设置你的项目,你已经得到了:

* **Entity Framework Core包**.这些都是ASP.NET Core所有项目都默认包括的.

* **数据库** (naturally).通过`dotnet new`会在项目的根目录下创建小型SQLite数据库`app.db`. SQLite是一个轻量级数据库引擎,可以没有任何额外的工具运行在你的机器上,所以在开发中用起来很容易而且很快.

* **数据库上下文**. 数据库上下文(database context)是一个C#类提供的数据库入口点. 用来读取数据库.`Data/ApplicationDbContext.cs`文件用已经存在基础的上下文.

* **连接字符串**. 无论你连接本地文件数据库(像SQLite)或者其它主机数据库,你需要定义包含数据名字或地址的连接字符串. 这个已经设置在 `appsettings.json` 文件里: 连接SQLite的字符串是 `DataSource=app.db`.

Entity Framework Core 用数据库上下文, 连同连接字符串, 建立数据连接. 你需要在`Startup`类的`ConfigureServices`方法中告诉Entity Framework Core哪个上下文,连接字符串和数据库商. 定义模板:

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));
```

这些代码放在`ApplicationDbContext`添加到服务容器里,并告诉Entity Framework Core从文件(`appsettings.json`)获取配置，使用SQLite数据库提供商.

你可以看到,`dotnet new`创建了很多东西给你! 数据库已经配置完成并准备使用. 然而,还没有任何用于存储待办项的表. 为了存储你的`待办项`实体对象,你需要更新上下文并迁移数据库.
