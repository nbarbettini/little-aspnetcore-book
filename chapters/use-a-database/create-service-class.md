## 创建一个新的服务类

回顾 *MVC 基础* 章节, 你创建了一个 `FakeTodoItemService` 包含硬编码的代办事项。现在你有一个数据库上下文，你可以创建一个新的服务类，它将用Entity Framework Core 从数据库中获取实际项目。

删除文件`FakeTodoItemService.cs`，并创建一个新文件:

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

你会发现同样的依赖注入部分在MVC基础章节也有, 除了这一次 `ApplicationDbContext` 被注入到服务。`ApplicationDbContext` 在`ConfigureServices`方法里已经被添加到服务容器里, 所以在这里可以直接用。

让我们仔细看 `GetIncompleteItemsAsync` 方法的代码。首先, 用上下文中 `Items` 的属性获取 `DbSet` 中所有的待办项:
```csharp
var items = await _context.Items
```
然后, `Where` 用于过滤不完整的项:
```csharp
.Where(x => x.IsDone == false)
```
`Where`方法是C#里的一个特性，叫Linq，一种带提示的编程功能并使的在代码里查询数据库变的简单。在这引擎下，Entity Framework Core 把这个方法翻译成 `SELECT * FROM Items WHERE IsDone = 0`，或NoSQL数据库中等效的查询文本。

最后，`ToArrayAsync` 方法告诉 Entity Framework Core 取出所有过滤后的数据并返回一个数组。 `ToArrayAsync` 是异步的 (像 `Task`)，所以必须使用`await`等结束后获取值。

为了使这个方法简洁，你可以删除中间 `items` 变量，直接返回查询结果 (同样的结果):

```csharp
public async Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync()
{
    return await _context.Items
        .Where(x => x.IsDone == false)
        .ToArrayAsync();
}//这部分有点多余了 0.0
```

### 更新服务容器

由于你删除了 `FakeTodoItemService` 类，你需要更新 `ConfigureServices`行，这是配置`ITodoItemService` 接口:
```csharp
services.AddScoped<ITodoItemService, TodoItemService>();
```
`TodoController`依赖于`ITodoItemService`将会变化，但在头上你需要使用Entity Framework Core 并告诉它真实的数据库！

### 测试

启动程序并导航至 `http://localhost:5000/todo`。假的项目不见了，你的程序正查询真正的数据库。只是碰巧没有任何保存的待办事项。

下一章，你将在程序中添加更多的功能，从创建新的待办事项的能力开始。


## --------以下原文-----


## Create a new service class

Back in the *MVC basics* chapter, you created a `FakeTodoItemService` that contained hard-coded to-do items. Now that you have a database context, you can create a new service class that will use Entity Framework Core to get the real items from the database.

Delete the `FakeTodoItemService.cs` file, and create a new file:

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

You'll notice the same dependency injection pattern here that you saw in the MVC basics chapter, except this time it's the `ApplicationDbContext` that gets injected into the service. The `ApplicationDbContext` is already being added to the service container in the `ConfigureServices` method, so it's available for injection here.

Let's take a closer look at the code of the `GetIncompleteItemsAsync` method. First, it uses the `Items` property of the context to access all the to-do items in the `DbSet`:

```csharp
var items = await _context.Items
```

Then, the `Where` method is used to filter only the items that are not complete:

```csharp
.Where(x => x.IsDone == false)
```

The `Where` method is a feature of C# called LINQ (language integrated query), which takes cues from functional programming and makes it easy to express database queries in code. Under the hood, Entity Framework Core translates the method into a statement like `SELECT * FROM Items WHERE IsDone = 0`, or an equivalent query document in a NoSQL database.

Finally, the `ToArrayAsync` method tells Entity Framework Core to get all the entities that matched the filter and return them as an array. The `ToArrayAsync` method is asynchronous (it returns a `Task`), so it must be `await`ed to get its value.

To make the method a little shorter, you can remove the intermediate `items` variable and just return the result of the query directly (which does the same thing):

```csharp
public async Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync()
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

The `TodoController` that depends on `ITodoItemService` will be blissfully unaware of the change, but under the hood you'll be using Entity Framework Core and talking to a real database!

### Test it out

Start up the application and navigate to `http://localhost:5000/todo`. The fake items are gone, and your application is making real queries to the database. There just doesn't happen to be any saved to-do items!

In the next chapter, you'll add more features to the application, starting with the ability to create new to-do items.
