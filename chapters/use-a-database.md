# Database access with Entity Framework Core
Writing database code can be tricky. Most of the time, you want to avoid pasting raw SQL queries into your application code (unless you really know what you're doing). The concept of an **object-relational mapper** (ORM) grew out of the need to create an abstraction or interface between your code and the actual guts of the database. Hibernate in Java and ActiveRecord in Ruby are two well-known ORMs.

There are a number of ORMs for .NET, including one built by Microsoft and included in ASP.NET Core by default: Entity Framework Core. Entity Framework Core makes it easy to connect to a number of different database types, and lets you use fluent C# code to create database queries that are mapped back into C# models (POCOs).

Remember how creating a service interface decoupled the controller code from the actual service class? Entity Framework Core is like a big interface over your database, and you can swap out different providers depending on the underlying database technology. In this chapter you'll use an in-memory database provider for easy testing, and later you'll switch this out for a real database provider when you deploy the application.
## Create a database context
Because the Entity Framework Packages are included in by default in ASP.NET Core projects, you already have everything you need to get started.

First, you'll need to define a **database context** class that lets your code access the database. You can create this file in the root of the project:

**TodoContext.cs**

```csharp
using AspNetCoreTodo.Models;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreTodo
{
    public class TodoContext : DbContext
    {
        public TodoContext(DbContextOptions<TodoContext> options)
            : base(options)
        {
        }

        public DbSet<TodoItem> Items { get; set; }
    }
}
```

This class declares a single `DbSet` (representing a table or collection) of entities that will be represented by the `TodoItem` model.
## Use the in-memory database provider
The database context just declares the entities that are accessible by Entity Framework Core. It doesn't know or care what the actual underlying database is. Instead, it relies on a **provider** that handles the low-level connection to the database.

Entity Framework Core comes with an in-memory database provider you can use while building your application. The in-memory provider is lightweight and acts like a simple database, making it easy to write and test database code without having to set up a database engine on your local machine. The in-memory data is erased when the application shuts down, which makes it easier to write tests that rely on the same consistent starting point.

You connect the context to the in-memory provider, or any other provider, in the `ConfigureServices` method of the `Startup` class. Add this line anywhere in the method:

```csharp
services.AddDbContext<TodoContext>(opt => opt.UseInMemoryDatabase("in-memory-db"));
```

You'll also need to add a `using` statement to the top of the file:

```csharp
using Microsoft.EntityFrameworkCore;
```

When you're ready to move to production, you can swap out the `AddDbContext` line for one that uses a provider for SQL Server, MongoDB, or whatever database you prefer.

## Add test data
Since the in-memory database starts from a blank slate every time the application is run, it's necessary to seed it with test data. You can do this in the `Configure` method, which is the very last method of the `Startup` class that's run before the application is live.

To get access to the `TodoContext`, add it as an argument in the method signature:

```csharp
public void Configure(
    IApplicationBuilder app,
    IHostingEnvironment env,
    TodoContext context)
{
    // ...
```

It's a good idea to only add test data if the app is running in Development mode, which ASP.NET Core keeps track of via an environment variable. Add a line inside the `if (env.IsDevelopment())` branch:

```csharp
public void Configure(
    IApplicationBuilder app,
    IHostingEnvironment env,
    TodoContext context)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();

        AddTestData(context); // Seed the in-memory database
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
    }

    app.UseStaticFiles();

    app.UseMvc(routes =>
    {
        routes.MapRoute(
            name: "default",
            template: "{controller=Home}/{action=Index}/{id?}");
    });
}
```

Next, write the method that will add some test data using the context:

```csharp
private static void AddTestData(TodoContext context)
{
    context.Items.AddRange(
        new Models.TodoItem
        {
            Id = Guid.Parse("f9aad911-d053-4d55-ac26-de06255e9b06"),
            Title = "Learn ASP.NET Core",
            DueAt = DateTimeOffset.Now.AddDays(1)
        },
        new Models.TodoItem
        {
            Id = Guid.Parse("cefd42cb-a513-4fba-83ce-6cda5f3535a4"),
            Title = "Build awesome apps",
            DueAt = DateTimeOffset.Now.AddDays(2)
        },
        new Models.TodoItem
        {
            Id = Guid.Parse("48c95ebd-ca08-4583-831f-64e50723a04a"),
            Title = "Profit",
            DueAt = DateTimeOffset.Now.AddDays(3)
        }
    );

    context.SaveChanges();
}
```

The in-memory database will now contain these three items whenever the application starts.
## Create a new service class
Back in chapter 3, you created a `FakeTodoItemService` that contained hard-coded to-do items. Now that you have a database context, you can create a service class that will use Entity Framework Core to get the items from the database. Create a new service class:

**Services/EfCoreTodoItemService.cs**

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreTodo.Services
{
    public class EfCoreTodoItemService : ITodoItemService
    {
        private readonly TodoContext _context;

        public EfCoreTodoItemService(TodoContext context)
        {
            _context = context;
        }

        public Task<TodoItem[]> GetIncompleteItemsAsync()
        {
            var items = _context.Items
                .Where(x => x.IsDone == false)
                .ToArrayAsync();

            return items;
        }
    }
}
```

> Sidebar: You'll notice the same constructor injection pattern here that you saw in chapter 3, except this time it's the `TodoContext` that gets injected into this class. Wiring up the context with a provider in the `ConfigureServices` method also adds it to the service container, so it can be injected into your service code.

Let's take a closer look at the code of the `GetIncompleteItemsAsync` method. First, it uses the `Items` property of the context to access all the to-do items in the database table or collection:

```csharp
var items = _context.Items
```

Then, the `Where` method is used to filter only the items that are not complete:

```csharp
.Where(x => x.IsDone == false)
```

The `Where` method is a feature of C# called LINQ (language integrated query), which takes cues from functional programming and makes it easy to express database queries in code. Under the hood, Entity Framework Core translates the method into a statement like `SELECT * FROM Items WHERE IsDone = 0`, or an equivalent query document in a NoSQL database.

Finally, the `ToArrayAsync` method tells Entity Framework Core to get all the entities that matched the filter and return them as an array. Because the `DbSet` in the context is declared with a type of `TodoItem`, the entities will each be represented by an instance of the `TodoItem` class.

You could remove the line breaks and do the whole on one line, but it's customary to add some breaks to make the line easier to read.

To make the method a little shorter, you can remove the intermediate `items` variable and just return the result of the query directly (which does the same thing):

```csharp
public Task<TodoItem[]> GetIncompleteItemsAsync()
{
    return _context.Items
        .Where(x => x.IsDone == false)
        .ToArrayAsync();
}
```

> Sidebar: You might have noticed that the `GetIncompleteItemsAsync` method returns a `Task`, but the code doesn't use `await`. Because the result of `ToArrayAsync` also produces a `Task<TodoItem[]>`, it's a little bit faster to return that directly instead of `await`ing it and returning the `TodoItem` array afterwards. It's the async/await equivalent of the above refactoring that removed the intermediate variable. Don't worry if this seems confusing! It becomes intuitive after practice with the async/await pattern.
## Update the service container
There's one more thing you need to do: update the line in `ConfigureServices` that is wiring up the `ITodoItemService` interface:

```csharp
services.AddScoped<ITodoItemService, EfCoreTodoItemService>();
```

The controller that depends on `ITodoItemService` will be blissfully unaware of the change, but under the hood you'll be using Entity Framework Core and the in-memory database.
## Test it out
Start up the application and watch the console output. Before the `Now listening on:` message, you should see a line that looks like:

```
info: Microsoft.EntityFrameworkCore.Update[300100]
      Saved 3 entities to in-memory store.
```

This means the in-memory database has been seeded with your test data.

> Sidebar: If you don't see that message, check for a line that says `Hosting environment: Production`. If you see this, ASP.NET Core doesn't realize you are in a development environment. On startup, ASP.NET Core checks the value of the environment variable `ASPNETCORE_ENVIRONMENT` for the value `Development` or `Production`. If the environment variable doesn't exist, Production is assumed.

> If the variable is not set on your machine, you can add `export ASPNETCORE_ENVIRONMENT = "Development"` to your `.bashrc` file on Mac or Linux, or use `setx ASPNETCORE_ENVIRONMENT Development` in PowerShell on Windows.

Navigate to `localhost:5000/todo` and see the three to-do items pulled from the database:

!TODO: screenshot

You're now making queries against a database instead of returning fake data. Right now the database only exists in memory while the application is running, but when you swap out the in-memory provider for a real database provider, your code will immediately work against a real database.

In the next chapter, you'll add more features to the application by writing both backend (C#) and frontend (HTML and JavaScript) code.
