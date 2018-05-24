## 创建服务类

回顾 *MVC基础* 章节, 你创建了一个 `FakeTodoItemService`，其中包含硬编码的 待办事项。现在你有了数据库上下文，就可以创建一个新的服务类，从而借助 Entity Framework Core 从数据库中获取真实内容。

删除文件 `FakeTodoItemService.cs`，并创建一个新文件:

**`Services/TodoItemService.cs`**

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

        public async Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync()
        {
            var items = await _context.Items
                .Where(x => x.IsDone == false)
                .ToArrayAsync();
            return items;
        }
    }
}
```

你应该注意到相同的依赖注入模式，如你在 MVC基础 章节所见到的那样，只是这次被注入的服务是 `ApplicationDbContext`。`ApplicationDbContext` 已经在`ConfigureServices` 方法里被添加到服务容器里，所以在这里可以直接使用。

让我们仔细探究 `GetIncompleteItemsAsync` 方法的代码。首先，它用数据库上下文中的 `Items` 的属性获取 `DbSet` 中所有的 待办事项:

```csharp
var items = await _context.Items
```

然后，`Where` 用于过滤出所有“未完成”的条目:

```csharp
.Where(x => x.IsDone == false)
```

`Where` 方法来自 C# 里的一个名为 `LINQ`(**l**anguage **in**tegrated **q**uery) 的特性，它受到函数式编程的启发，简化了在程序代码里数据库查询的写法。在底层，Entity Framework Core 把这个方法翻译成一个类似的语句 `SELECT * FROM Items WHERE IsDone = 0`，或在 NoSQL数据库 里的一个等效查询。

最后，`ToArrayAsync` 方法吩咐 Entity Framework Core 取出所有过滤后的数据，并作为一个数组返回。`ToArrayAsync` 是异步的(返回一个 `Task`)，所以必须执行一次 `await`（等待） 以获取其中的值。

如果想使这个方法变简短一点，你可以删除中间变量 `items`，直接返回查询结果（跟原来功能一样）：

```csharp
public async Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync()
{
    return await _context.Items
        .Where(x => x.IsDone == false)
        .ToArrayAsync();
}
```

### 修改服务容器

由于你删除了 `FakeTodoItemService` 类，就需要修改 `ConfigureServices` 方法里配置`ITodoItemService` 接口的那一行:

```csharp
services.AddScoped<ITodoItemService, TodoItemService>();
```

`AddScoped` 会以 **scoped** 的生命周期把你的服务添加到容器里。这意味着每次 web 请求中，一个 `TodoItemService` 类的新实例就会被创建出来。这对于那些跟数据库打交道的类来说，是必要的。

> 添加一个服务类去跟 Entity Framework Core（以及你的数据库）打交道，如果用单件（或其它）生命周期会引发麻烦，原因在于 Entity Framework Core 底层以请求为单位管数据库连接。要避免这些问题，请在跟 Entity Framework Core 打交道的服务上，始终采用 scoped 生命周期。

依赖于 `ITodoItemService` 的 `TodoController` 将幸福地对这个变化毫无察觉，但在底层，你将使用 Entity Framework Core 与真实的数据库进行交互！

### 试试看

启动程序并导航至 `http://localhost:5000/todo`。硬编码的那些条目不见了，你的程序对数据库发起了真正的查询。只是刚好还没有任何 待办事项 被保存。

下一章，你将在程序中添加更多的功能，从“创建新 待办事项 的能力”开始。

---

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
            return await _context.Items
                .Where(x => x.IsDone == false)
                .ToArrayAsync();
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
