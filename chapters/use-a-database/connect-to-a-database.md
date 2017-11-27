## 连接数据库

通过 Entity Framework Core 连接数据库，需要做一些准备工作。因为你通过 `dotnet new` 让项目使用了 MVC + Individual认证 项目模板，这些准备已经就绪了:

* **Entity Framework Core包** 这些都默认包括在了所有 ASP.NET Core 项目中。

* **数据库**(必须地呀) 经由 `dotnet new` 指令，在项目的根目录下生成了小型的 SQLite 数据库文件 `app.db`。 SQLite 是一个轻量级数据库引擎，可以运行在你的机器上而不必安装任何额外工具，所以在开发环境下使用起来既方便又快捷。

* **数据库上下文** 数据库上下文(database context)是一个 C# 类提供的数据库入口点。 你的代码就是通过它与数据库交互，进行读写的。`Data/ApplicationDbContext.cs` 文件里，就保存着一个很基本的数据库上下文。

* **连接字符串** 无论你连接本地文件数据库(SQLite)还是位于其它主机的数据库，都需要定义一个字符串，其中包含 数据库的名字 或 用来连接的数据库地址。 这一项已经在 `appsettings.json` 文件里为你设置好了: SQLite 数据库的 连接字符串 是 `DataSource=app.db`。

Entity Framework Core 借助 数据库上下文、连接字符串 与数据库建立连接。你需要在 `Startup` 类里的 `ConfigureServices` 方法中为 Entity Framework Core 指定所用的 数据库上下文、连接字符串和数据库类型。感谢项目模板：

```csharp
service.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));
```

这段代码把 `ApplicationDbContext` 添加到服务容器里，并通过配置(`appsettings.json`)中的 连接字符串 指定 Entity Framework Core 使用 SQLite 数据库。

如你所见，`dotnet new` 为你完成了很多工作! 数据库已经配置好待用了。但是还没有表用于保存 待办事项条目。为了能存储 `TodoItem` 实体，你需要修改数据库上下文，并对数据库进行变更。

---

## Connect to a database

There are a few things you need to use Entity Framework Core to connect to a database. Since you used `dotnet new` and the MVC + Individual Auth template to set your project, you've already got them:

* **The Entity Framework Core packages**. These are included by default in all ASP.NET Core projects.

* **A database** (naturally). The `app.db` file in the project root directory is a small SQLite database created for you by `dotnet new`. SQLite is a lightweight database engine that can run without requiring you to install any extra tools on your machine, so it's easy and quick to use in development.

* **A database context class**. The database context is a C# class that provides an entry point into the database. It's how your code will interact with the database to read and save items. A basic context class already exists in the `Data/ApplicationDbContext.cs` file.

* **A connection string**. Whether you are connecting to a local file database (like SQLite) or a database hosted elsewhere, you'll define a string that contains the name or address of the database to connect to. This is already set up for you in the `appsettings.json` file: the connection string for the SQLite database is `DataSource=app.db`.

Entity Framework Core uses the database context, together with the connection string, to establish a connection to the database. You need to tell Entity Framework Core which context, connection string, and database provider to use in the `ConfigureServices` method of the `Startup` class. Here's what's defined for you, thanks to the template:

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));
```

This code adds the `ApplicationDbContext` to the service container, and tells Entity Framework Core to use the SQLite database provider, with the connection string from configuration (`appsettings.json`).

As you can see, `dotnet new` creates a lot of stuff for you! The database is set up and ready to be used. However, it doesn't have any tables for storing to-do items. In order to store your `TodoItem` entities, you'll need to update the context and migrate the database.
