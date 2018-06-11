## Create a new service class

Back in the *MVC basics* chapter, you created a `FakeTodoItemService` that contained hard-coded to-do items. Now that you have a database context, you can create a new service class that will use Entity Framework Core to get the real items from the database.

Delete the `FakeTodoItemService.cs` file, and create a new file:

**Services/TodoItemService.cs**

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AspNetCoreTodo.Data;
using AspNetCoreTodo.Models;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreTodo.Services
{
    public class TodoItemService : ITodoItemService
    {
        private readonly ApplicationDbContext _context;

        public TodoItemService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TodoItem[]> GetIncompleteItemsAsync()
        {
            var items = await _context.Items
                .Where(x => x.IsDone == false)
                .ToArrayAsync();
            return items;
        }
    }
}
```

You'll notice the same dependency injection pattern here that you saw in the *MVC basics* chapter, except this time it's the `ApplicationDbContext` that's getting injected. The `ApplicationDbContext` is already being added to the service container in the `ConfigureServices` method, so it's available for injection here.

Let's take a closer look at the code of the `GetIncompleteItemsAsync` method. First, it uses the `Items` property of the context to access all the to-do items in the `DbSet`:

```csharp
var items = await _context.Items
```

Then, the `Where` method is used to filter only the items that are not complete:

```csharp
.Where(x => x.IsDone == false)
```

The `Where` method is a feature of C# called LINQ (**l**anguage **in**tegrated **q**uery), which takes inspiration from functional programming and makes it easy to express database queries in code. Under the hood, Entity Framework Core translates the `Where` method into a statement like `SELECT * FROM Items WHERE IsDone = 0`, or an equivalent query document in a NoSQL database.

Finally, the `ToArrayAsync` method tells Entity Framework Core to get all the entities that matched the filter and return them as an array. The `ToArrayAsync` method is asynchronous (it returns a `Task`), so it must be `await`ed to get its value.

To make the method a little shorter, you can remove the intermediate `items` variable and just return the result of the query directly (which does the same thing):

```csharp
public async Task<TodoItem[]> GetIncompleteItemsAsync()
{
    return await _context.Items
        .Where(x => x.IsDone == false)
        .ToArrayAsync();
}
```

### Update the service container

Because you deleted the `FakeTodoItemService` class, you'll need to update the line in `ConfigureServices` that is wiring up the `ITodoItemService` interface:

```csharp
services.AddScoped<ITodoItemService, TodoItemService>();
```

`AddScoped` adds your service to the service container using the **scoped** lifecycle. This means that a new instance of the `TodoItemService` class will be created during each web request. This is required for service classes that interact with a database.

> Adding a service class that interacts with Entity Framework Core (and your database) with the singleton lifecycle (or other lifecycles) can cause problems, because of how Entity Framework Core manages database connections per request under the hood. To avoid that, always use the scoped lifecycle for services that interact with Entity Framework Core.

The `TodoController` that depends on an injected `ITodoItemService` will be blissfully unaware of the change in services classes, but under the hood it'll be using Entity Framework Core and talking to a real database!

### Test it out

Start up the application and navigate to `http://localhost:5000/todo`. The fake items are gone, and your application is making real queries to the database. There doesn't happen to be any saved to-do items, so it's blank for now.

In the next chapter, you'll add more features to the application, starting with the ability to create new to-do items.
