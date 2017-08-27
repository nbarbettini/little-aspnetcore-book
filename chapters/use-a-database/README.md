# Use a database

Writing database code can be tricky. Unless you really know what you're doing, it's a bad idea to paste raw SQL query strings into your application code. An **object-relational mapper** (ORM) makes it easier to write code that interacts with a database by adding a layer of abstraction between your code and the database itself. Hibernate in Java and ActiveRecord in Ruby are two well-known ORMs.

There are a number of ORMs for .NET, including one built by Microsoft and included in ASP.NET Core by default: Entity Framework Core. Entity Framework Core makes it easy to connect to a number of different database types, and lets you use C# code to create database queries that are mapped back into C# models (POCOs).

> Remember how creating a service interface decoupled the controller code from the actual service class? Entity Framework Core is like a big interface over your database, and you can swap out different providers depending on the underlying database technology.

Entity Framework Core can connect to SQL database like SQL Server and MySQL, and also works with NoSQL (document) databases like Mongo. You'll use a SQLite database for this project, but you can plug in a different database provider if you'd like.

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
