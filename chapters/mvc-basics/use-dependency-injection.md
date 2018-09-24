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

The first line of the class declares a private variable to hold a reference to the `ITodoItemService`. This variable lets you use the service from the `Index` action method later (you'll see how in a minute).

The `public TodoController(ITodoItemService todoItemService)` line defines a **constructor** for the class. The constructor is a special method that is called when you want to create a new instance of a class (the `TodoController` class, in this case). By adding an `ITodoItemService` parameter to the constructor, you've declared that in order to create the `TodoController`, you'll need to provide an object that matches the `ITodoItemService` interface.

> Interfaces are awesome because they help decouple (separate) the logic of your application. Since the controller depends on the `ITodoItemService` interface, and not on any *specific* class, it doesn't know or care which class it's actually given. It could be the `FakeTodoItemService`, a different one that talks to a live database, or something else! As long as it matches the interface, the controller can use it. This makes it really easy to test parts of your application separately. I'll cover testing in detail in the *Automated testing* chapter.

Now you can finally use the `ITodoItemService` (via the private variable you declared) in your action method to get to-do items from the service layer:

```csharp
public IActionResult Index()
{
    var items = await _todoItemService.GetIncompleteItemsAsync();

    // ...
}
```

Remember that the `GetIncompleteItemsAsync` method returned a `Task<TodoItem[]>`? Returning a `Task` means that the method won't necessarily have a result right away, but you can use the `await` keyword to make sure your code waits until the result is ready before continuing on.

The `Task` pattern is common when your code calls out to a database or an API service, because it won't be able to return a real result until the database (or network) responds. If you've used promises or callbacks in JavaScript or other languages, `Task` is the same idea: the promise that there will be a result - sometime in the future.

> If you've had to deal with "callback hell" in older JavaScript code, you're in luck. Dealing with asynchronous code in .NET is much easier thanks to the magic of the `await` keyword! `await` lets your code pause on an async operation, and then pick up where it left off when the underlying database or network request finishes. In the meantime, your application isn't blocked, because it can process other requests as needed. This pattern is simple but takes a little getting used to, so don't worry if this doesn't make sense right away. Just keep following along!

The only catch is that you need to update the `Index` method signature to return a `Task<IActionResult>` instead of just `IActionResult`, and mark it as `async`:

```csharp
public async Task<IActionResult> Index()
{
    var items = await _todoItemService.GetIncompleteItemsAsync();

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

The job of the `ConfigureServices` method is adding things to the **service container**, or the collection of services that ASP.NET Core knows about. The `services.AddMvc` line adds the services that the internal ASP.NET Core systems need (as an experiment, try commenting out this line). Any other services you want to use in your application must be added to the service container here in `ConfigureServices`.

Add the following line anywhere inside the `ConfigureServices` method:

```csharp
services.AddSingleton<ITodoItemService, FakeTodoItemService>();
```

This line tells ASP.NET Core to use the `FakeTodoItemService` whenever the `ITodoItemService` interface is requested in a constructor (or anywhere else).

`AddSingleton` adds your service to the service container as a **singleton**. This means that only one copy of the `FakeTodoItemService` is created, and it's reused whenever the service is requested. Later, when you write a different service class that talks to a database, you'll use a different approach (called **scoped**) instead. I'll explain why in the *Use a database* chapter.

Once again, since both the `ITodoItemService` and `FakeTodoItemService` reside in the `Services` namespace, you'll also need to add a `using` statement at the top:

```csharp
using AspNetCoreTodo.Services;
```

That's it! When a request comes in and is routed to the `TodoController`, ASP.NET Core will look at the available services and automatically supply the `FakeTodoItemService` when the controller asks for an `ITodoItemService`. Because the services are "injected" from the service container, this pattern is called **dependency injection**.
