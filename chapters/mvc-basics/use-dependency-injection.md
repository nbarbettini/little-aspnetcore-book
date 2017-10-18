## Use dependency injection
Back in the `TodoController`, add some code to work with the `ITodoItemService`:

```csharp
public class TodoController : Controller
{
    private readonly ITodoItemService _todoItemService;

    public TodoController(ITodoItemService todoItemService)
    {
        _todoItemService = todoItemService;
    }

    public IActionResult Index()
    {
        // Get to-do items from database

        // Put items into a model

        // Pass the view to a model and render
    }
}
```

Since `ITodoItemService` is in the `Services` namespace, you'll also need to add a `using` statement at the top:

```csharp
using AspNetCoreTodo.Services;
```

The first line of the class declares a private variable to hold a reference to the `ITodoItemService`. This variable lets you use the service from the `Index` action method later.

The `public TodoController(ITodoItemService todoItemService)` line defines a **constructor** for the class. The constructor runs only once when the class is first initialized, and you've now declared that the `TodoController` class will need to be given an `ITodoItemService` to be initialized properly.

> Interfaces are awesome because they help decouple (separate) the logic of your application. Since the controller depends on the `ITodoItemService` interface, and not on any *specific* service class, it doesn't know or care which class it's actually given. It could be the `FakeTodoItemService`, one that talks to a live database, or something else! As long as it matches the interface, the controller doesn't care. This makes it really easy to test parts of your application separately. (I'll cover testing more in the *Automated testing* chapter.)

Now you can finally use the `ITodoItemService` in your action method to get to-do items from the service layer:

```csharp
public IActionResult Index()
{
    var todoItems = await _todoItemService.GetIncompleteItemsAsync();

    // ...
}
```

Remember that the `GetIncompleteItemsAsync` method returned a `Task<IEnumerable<TodoItem>>`? Returning a `Task` means that the method won't necessarily have a result right away, but you can use the `await` keyword to make sure your code waits until the result is ready before continuing on.

The `Task` pattern is common when your code calls out to a database or an API service, because it won't be able to return a real result until the database (or network) responds. If you've used promises or callbacks in JavaScript or other languages, `Task` is the same idea: the promise that there will be a result sometime later.

> Dealing with `Tasks` in .NET is much easier than JavaScript callbacks (and the "callback hell" that sometimes results), because of the magic of the `await` keyword. `await` lets your code pause on an async operation, and then pick up where it left off when the underlying database or network request finishes. In the meantime, your application isn't stuck or blocked, because it can process other requests as needed. Don't worry if this doesn't make sense right away, just keep following along!

The only catch is that you need to update the `Index` method signature to return a `Task<IActionResult>` instead of just `IActionResult`, and mark it as `async`:

```csharp
public async Task<IActionResult> Index()
{
    var todoItems = await _todoItemService.GetIncompleteItemsAsync();

    // Put items into a model

    // Pass the view to a model and render
}
```

You're almost there! You've made the `TodoController` depend on the `ITodoItemService` interface, but you haven't yet told ASP.NET Core that you want the `FakeTodoItemService` to be the actual service that's used under the hood. It might seem obvious right now since you only have one class that implements `ITodoItemService`, but later you'll have multiple classes that implement the same interface, so being explicit is necessary.

Declaring (or "wiring up") which concrete class to use for each interface is done in the `ConfigureServices` method of the `Startup` class. Right now, it looks something like this:

**Startup.cs**

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // (... some code)

    services.AddMvc();
}
```

Add a new line anywhere inside the `ConfigureServices` method that tells ASP.NET Core to use the `FakeTodoItemService` for the `ITodoItemService` interface:

```csharp
services.AddScoped<ITodoItemService, FakeTodoItemService>();
```

`AddScoped` adds your service to the collection of available services (sometimes called a *service container*) using the **scoped** lifecycle. This means that a new instance of the `FakeTodoItemService` class will be created for each request. This is common for service classes that interact with a database (as you will a little later). You can also declare services as **singletons**, which means the class will be created only once when the application starts up.

That's it! When a request comes in and is routed to the `TodoController`, ASP.NET Core will look at the available services and automatically supply the `FakeTodoItemService` when the controller asks for an `ITodoItemService`. Because the services the controller depends on are "injected" from the service container, this pattern is called **dependency injection**.
