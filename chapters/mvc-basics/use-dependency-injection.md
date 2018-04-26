## 运用依赖注入

回到 `TodoController`，添加一些代码以使用 `ITodoItemService`:

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

既然 `ITodoItemService` 在命名空间 `Services` 里，你同样需要在文件顶部添加一个 `using` 语句：

```csharp
using AspNetCoreTodo.Services;
```

这个类的第一行声明了一个私有变量，保存 `ITodoItemService` 的引用。这个变量可以让你在后面的 `Index` 方法里使用该服务。

`public TodoController(ITodoItemService todoItemService)` 这一行为类定义了一个**构造函数(constructor)**。构造函数只在类初始化的时候运行一次，还声明了：要正确地初始化 `TodoController` 类，需要传给它一个 `ITodoItemService`。

> 接口如此有用的原因就在于，因为它们有助于解耦（分离）你程序里的逻辑。既然这个控制器依赖于 `ITodoItemService` 接口，而不是任何 *特定的* 服务类，它就不知道也不必关心实际使用的是哪个具体的类。它可以是 `FakeTodoItemService`，或者是个读写数据库的类，或者别的什么类。只要它符合该接口的要求，控制器就能工作。这使你可以轻而易举地，独立测试程序的各部分。（我会在 *自动化测试* 一章讲解测试相关的内容。）

现在，你终于可以在 action 方法里，通过 `ITodoItemService` 从服务层获取 待办事项 了：

```csharp
public IActionResult Index()
{
    var todoItems = await _todoItemService.GetIncompleteItemsAsync();

    // ...
}
```

还记得吗？ `GetIncompleteItemsAsync` 方法返回一个 `Task<IEnumerable<TodoItem>>`。“返回一个 `Task`”的意思是说，该方法不能立刻给出一个结果，但是你可以使用关键字 `await`，以确保你的代码暂停，直到结果就绪才继续执行。

当你编写代码访问数据库或者外部 API 服务的时候，`Task` 模式是很常见的，因为在数据库（或者网络）响应之前，它不可能给出实际的结果。如果你在 JavaScript 或者其它语言里使用过 promise 或者 回调函数，`Task` 与之如出一辙：承诺你，稍后肯定会给出一个结果。

> 在 .NET 里使用 `Task`，远比 JavaScript 中使用回调（有时候会以“回调地狱(callback hell)”收场）容易得多，这归功于神奇的关键字 `await`。 `await` 把代码暂停在 异步(async) 操作上，而后，在底层数据库或者网络请求结束时，从暂停的地方恢复执行。就是说，你的程序并没有卡住或者阻塞住，因为它可以处理其它的请求。如果现在想不通也别担心，跟着做下去就行！

目前的重点就是修改 `Index` 方法的签名，以返回一个 `Task<IActionResult>`，代替之前的 `IActionResult`，并标记为 `async`：

```csharp
public async Task<IActionResult> Index()
{
    var todoItems = await _todoItemService.GetIncompleteItemsAsync();

    // Put items into a model

    // Pass the view to a model and render
}
```

胜利在望！你已经让 `TodoController` 依赖于 `ITodoItemService` 接口，但你还没告诉 ASP.NET Core，你想把 `FakeTodoItemService` 作为幕后的实际服务。可能你觉得这是理所当然的，因为你的`ITodoItemService`仅有这一个实现，但你后面会为同一个接口提供多个实现，所以，有必要明确指定实现。

要声明（或者“关联”）具体的类到每个接口上，需要写在 `StartUp` 类的 `ConfigureServices` 方法里，在当前情况里，应该这么写：

**Startup.cs**

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // (... some code)

    services.AddMvc();
}
```

在`ConfigureServices`中的任意位置添一行代码，让 ASP.NET Core 使用 `FakeTodoItemService` 作为 `ITodoItemService` 接口的实现：

```csharp
services.AddScoped<ITodoItemService, FakeTodoItemService>();
```

`AddScoped` 把你的服务放进一个 可用服务集合（也被称为*服务容器(service container)*），生命周期为 **scoped**。就是说，每次需要`FakeTodoItemService`类的对象时，就创建一个新的出来。在(你接下来就要)跟数据库交互时，这很常见。你还可以把服务的生命周期声明为 **singleton**，意思是说，这个类只在程序启动的时候被创建一次。

好了，当一个请求进来，将会被发送到 `TodoController`，当控制器需要一个`ITodoItemService` 时，ASP.NET Core 会在 可用服务集合 里查找并自动给出 `FakeTodoItemService`。因为控制器依赖的服务是从服务容器里“注入(injected)”的，这个模式被称为 **依赖注入(dependency injection)**。

---

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

> Interfaces are awesome because they help decouple (separate) the logic of your application. Since the controller depends on the `ITodoItemService` interface, and not on any *specific* service class, it doesn't know or care which class it's actually given. It could be the `FakeTodoItemService`, a different one that talks to a live database, or something else! As long as it matches the interface, the controller doesn't care. This makes it really easy to test parts of your application separately. (I'll cover testing more in the *Automated testing* chapter.)

Now you can finally use the `ITodoItemService` (via the private variable you declared) in your action method to get to-do items from the service layer:

```csharp
public IActionResult Index()
{
    var todoItems = await _todoItemService.GetIncompleteItemsAsync();

    // ...
}
```

Remember that the `GetIncompleteItemsAsync` method returned a `Task<IEnumerable<TodoItem>>`? Returning a `Task` means that the method won't necessarily have a result right away, but you can use the `await` keyword to make sure your code waits until the result is ready before continuing on.

The `Task` pattern is common when your code calls out to a database or an API service, because it won't be able to return a real result until the database (or network) responds. If you've used promises or callbacks in JavaScript or other languages, `Task` is the same idea: the promise that there will be a result - sometime in the future.

> If you've had to deal with "callback hell" in older JavaScript code, you're in luck. Dealing with asynchronous code in .NET is much easier thanks to the magic of the `await` keyword! `await` lets your code pause on an async operation, and then pick up where it left off when the underlying database or network request finishes. In the meantime, your application isn't blocked, because it can process other requests as needed. This pattern is simple but takes a little getting used to, so don't worry if this doesn't make sense right away. Just keep following along!

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

The job of the `ConfigureServices` method is adding things to the **service container**, or the collection of services that ASP.NET Core knows about. The `services.AddMvc` line adds the services that the internal ASP.NET Core systems need (as an experiment, try commenting out this line). Any other services you want to use in your application must be added to the service container here in `ConfigureServices`.

Add the following line anywhere inside the `ConfigureServices` method:

```csharp
services.AddSingleton<ITodoItemService, FakeTodoItemService>();
```

This line tells ASP.NET Core to use the `FakeTodoItemService` whenever the `ITodoItemService` interface is requested in a constructor (or anywhere else).

`AddSingleton` adds your service to the service container as a **singleton**. This means that only one copy of the `FakeTodoItemService` is created, and it's reused whenever the service is requested. Later, when you write a different service class that talks to a database, you'll use a different approach (called **scoped**) instead. I'll explain why in the *Use a database* chapter.

That's it! When a request comes in and is routed to the `TodoController`, ASP.NET Core will look at the available services and automatically supply the `FakeTodoItemService` when the controller asks for an `ITodoItemService`. Because the services the controller depends on are "injected" from the service container, this pattern is called **dependency injection**.
