## 在程序中使用身份

待办事项列表依然由所有用户共享，因为 待办事项条目 并未关联到特定的用户。现在，`[Authorize]` 属性确保了见到 待办事项视图 的人一定登录过，在查询数据库的时候，你就可以按照登录者的身份进行过滤了。

首先，在 `TodoController` 中注入一个 `UserManager<ApplicationUser>`：

**`Controllers/TodoController.cs`**

```csharp
[Authorize]
public class TodoController : Controller
{
    private readonly ITodoItemService _todoItemService;
    private readonly UserManager<ApplicationUser> _userManager;

    public TodoController(ITodoItemService todoItemService,
        UserManager<ApplicationUser> userManager)
    {
        _todoItemService = todoItemService;
        _userManager = userManager;
    }

    // ...
}
```

还要在文件顶部加一个新的 `using` 语句:

```csharp
using Microsoft.AspNetCore.Identity;
```

`UserManager` 包含在 ASP.NET Core Identity 里。你可以用它在 `Index` action 里查找当前用户：

```csharp
public async Task<IActionResult> Index()
{
    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Challenge();

    var todoItems = await _todoItemService.GetIncompleteItemsAsync(currentUser);

    var model = new TodoViewModel()
    {
        Items = todoItems
    };

    return View(model);
}
```

这个 action 方法的顶部添加了新代码，这行代码用 `UserManager` 从 `User` 属性中获取当前登录的用户——该属性在这个 action 里有效：

```csharp
var currentUser = await _userManager.GetUserAsync(User);
```

如果当前用户已经登录， `User` 属性就持有一个轻量级的对象，包括了用户的一些（并非全部）信息。`UserManager` 使用它，通过 `GetUserAsync` 在数据库里查找该用户的详细信息。

因为控制器使用了 `[Authorize]` 属性，`currentUser` 的值绝不应该是 null。无论如何，做个明智的检查都没错，以防万一嘛。如果用户信息没找到，你可以用 `Challenge()` 方法强制用户再次登录：

```csharp
if (currentUser == null) return Challenge();
```

既然你现在把一个 `ApplicationUser` 参数传给了 `GetIncompleteItemsAsync`，就该修改 `ITodoItemService` 接口了：

**`Services/ITodoItemService.cs`**

```csharp
public interface ITodoItemService
{
    Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync(ApplicationUser user);

    // ...
}
```

下一步是修改数据库查询，仅为当前用户呈现他(她)自己的那些条目。

### 修改数据库

你需要在 `TodoItem` 实体上添加一个新的属性，让每个条目都能够指向它的所有者：

```csharp
public string OwnerId { get; set; }
```

既然你修改了数据库上下文里的实体模型，就应该同步修改数据库。在终端窗口里用 `dotnet ef` 指令创建一个新的变更：

```
dotnet ef migrations add AddItemOwnerId
```

这个命令新建了一个名为 `AddItemOwner` 的变更，它将给 `Items` 表新添一个列，以反应你在 `TodoItem` 实体模型上所做的修改：

> 注意：如果你在使用 SQLite 数据库，还需要手动调整变更文件。详情请查看 *运用数据库* 那章的 *创建变更* 小节。

再通过 `dotnet ef` 指令应用到数据库：

```
dotnet ef database update
```

### 修改服务类

修改了数据库和数据库上下文，你就可以修改 `TodoItemService` 里的 `GetIncompleteItemsAsync` 方法和其中的 `Where` 查询子句了：

**`Services/TodoItemService.cs`**

```csharp
public async Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync(ApplicationUser user)
{
    return await _context.Items
        .Where(x => x.IsDone == false && x.OwnerId == user.Id)
        .ToArrayAsync();
}
```

如果你现在运行程序并注册或者登录，你将又一次见到一个空的 待办事项列表。糟糕的是，你尝试添加的任何条目也都会凭空消失，因为你还没修改 添加条目 的操作，并把用户信息存储到条目里：

### 修改 添加条目 和 完成事项 操作

在 `AddItem` 和 `MarkDone` 这两个 action 的方法里，你也需要使用 `UserManager` 获取当前用户的信息，就像在 `Index` 里那样。唯一的区别是，这两个方法会向前端代码返回 `401 Unauthorized`，而非把用户重定向到登录页面。

下面是 `TodoController` 控制器里对这两个方法的修改：

```csharp
public async Task<IActionResult> AddItem(NewTodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Unauthorized();

    var successful = await _todoItemService.AddItemAsync(newItem, currentUser);
    if (!successful)
    {
        return BadRequest(new { error = "Could not add item." });
    }

    return Ok();
}

public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty) return BadRequest();

    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Unauthorized();

    var successful = await _todoItemService.MarkDoneAsync(id, currentUser);
    if (!successful) return BadRequest();

    return Ok();
}
```

这两个服务方法现在也必须接受 `ApplicationUser` 参数了，修改 `ITodoItemService` 里定义的接口：

```csharp
Task<bool> AddItemAsync(NewTodoItem newItem, ApplicationUser user);

Task<bool> MarkDoneAsync(Guid id, ApplicationUser user);
```

最后，修改 `TodoItemService` 里面的实现方法。

在 `AddItemAsync` 方法里，构造一个 `new TodoItem` 的时候，设置 `Owner` 属性：

```csharp
public async Task<bool> AddItemAsync(NewTodoItem newItem, ApplicationUser user)
{
    var entity = new TodoItem
    {
        Id = Guid.NewGuid(),
        OwnerId = user.Id,
        IsDone = false,
        Title = newItem.Title,
        DueAt = DateTimeOffset.Now.AddDays(3)
    };

    // ...
}
```

`MarkDoneAsync` 方法里的 `Where` 查询子句也需要检查用户的 ID，以防止恶意的用户通过猜测 ID 的方法把其他用户的事项标记为完成状态。

```csharp
public async Task<bool> MarkDoneAsync(Guid id, ApplicationUser user)
{
    var item = await _context.Items
        .Where(x => x.Id == id && x.OwnerId == user.Id)
        .SingleOrDefaultAsync();

    // ...
}
```

搞定！请用两个不同的账号尝试一下。待办事项条目现在是每个账户的私密信息了。

---

## Using identity in the application

The to-do list items themselves are still shared between all users, because the stored to-do entities aren't tied to a particular user. Now that the `[Authorize]` attribute ensures that you must be logged in to see the to-do view, you can filter the database query based on who is logged in.

First, inject a `UserManager<ApplicationUser>` into the `TodoController`:

**Controllers/TodoController.cs**

```csharp
[Authorize]
public class TodoController : Controller
{
    private readonly ITodoItemService _todoItemService;
    private readonly UserManager<ApplicationUser> _userManager;

    public TodoController(ITodoItemService todoItemService,
        UserManager<ApplicationUser> userManager)
    {
        _todoItemService = todoItemService;
        _userManager = userManager;
    }

    // ...
}
```

You'll need to add a new `using` statement at the top:

```csharp
using Microsoft.AspNetCore.Identity;
```

The `UserManager` class is part of ASP.NET Core Identity. You can use it to get the current user in the `Index` action:

```csharp
public async Task<IActionResult> Index()
{
    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Challenge();

    var items = await _todoItemService
        .GetIncompleteItemsAsync(currentUser);

    var model = new TodoViewModel()
    {
        Items = items
    };

    return View(model);
}
```

The new code at the top of the action method uses the `UserManager` to look up the current user from the `User` property available in the action:

```csharp
var currentUser = await _userManager.GetUserAsync(User);
```

If there is a logged-in user, the `User` property contains a lightweight object with some (but not all) of the user's information. The `UserManager` uses this to look up the full user details in the database via the `GetUserAsync()` method.

The value of `currentUser` should never be null, because the `[Authorize]` attribute is present on the controller. However, it's a good idea to do a sanity check, just in case. You can use the `Challenge()` method to force the user to log in again if their information is missing:

```csharp
if (currentUser == null) return Challenge();
```

Since you're now passing an `ApplicationUser` parameter to `GetIncompleteItemsAsync()`, you'll need to update the `ITodoItemService` interface:

**Services/ITodoItemService.cs**

```csharp
public interface ITodoItemService
{
    Task<TodoItem[]> GetIncompleteItemsAsync(
        ApplicationUser user);
    
    // ...
}
```

Since you changed the `ITodoItemService` interface, you also need to update the signature of the `GetIncompleteItemsAsync()` method in the `TodoItemService`:

**Services/TodoItemService**

```csharp
public async Task<TodoItem[]> GetIncompleteItemsAsync(
    ApplicationUser user)
```

The next step is to update the database query and add a filter to show only the items created by the current user. Before you can do that, you need to add a new property to the database.

### Update the database

You'll need to add a new property to the `TodoItem` entity model so each item can "remember" the user that owns it:

**Models/TodoItem.cs**

```csharp
public string UserId { get; set; }
```

Since you updated the entity model used by the database context, you also need to migrate the database. Create a new migration using `dotnet ef` in the terminal:

```
dotnet ef migrations add AddItemUserId
```

This creates a new migration called `AddItemUserId` which will add a new column to the `Items` table, mirroring the change you made to the `TodoItem` model.

Use `dotnet ef` again to apply it to the database:

```
dotnet ef database update
```

### Update the service class

With the database and the database context updated, you can now update the `GetIncompleteItemsAsync()` method in the `TodoItemService` and add another clause to the `Where` statement:

**Services/TodoItemService.cs**

```csharp
public async Task<TodoItem[]> GetIncompleteItemsAsync(
    ApplicationUser user)
{
    return await _context.Items
        .Where(x => x.IsDone == false && x.UserId == user.Id)
        .ToArrayAsync();
}
```

If you run the application and register or log in, you'll see an empty to-do list once again. Unfortunately, any items you try to add disappear into the ether, because you haven't updated the `AddItem` action to be user-aware yet.

### Update the AddItem and MarkDone actions

You'll need to use the `UserManager` to get the current user in the `AddItem` and `MarkDone` action methods, just like you did in `Index`.

Here are both updated methods:

**Controllers/TodoController.cs**

```csharp
[ValidateAntiForgeryToken]
public async Task<IActionResult> AddItem(TodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return RedirectToAction("Index");
    }

    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Challenge();

    var successful = await _todoItemService
        .AddItemAsync(newItem, currentUser);

    if (!successful)
    {
        return BadRequest("Could not add item.");
    }

    return RedirectToAction("Index");
}

[ValidateAntiForgeryToken]
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty)
    {
        return RedirectToAction("Index");
    }

    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Challenge();

    var successful = await _todoItemService
        .MarkDoneAsync(id, currentUser);
    
    if (!successful)
    {
        return BadRequest("Could not mark item as done.");
    }

    return RedirectToAction("Index");
}
```

Both service methods must now accept an `ApplicationUser` parameter. Update the interface definition in `ITodoItemService`:

```csharp
Task<bool> AddItemAsync(TodoItem newItem, ApplicationUser user);

Task<bool> MarkDoneAsync(Guid id, ApplicationUser user);
```

And finally, update the service method implementations in the `TodoItemService`. In `AddItemAsync` method, set the `UserId` property when you construct a `new TodoItem`:

```csharp
public async Task<bool> AddItemAsync(
    TodoItem newItem, ApplicationUser user)
{
    newItem.Id = Guid.NewGuid();
    newItem.IsDone = false;
    newItem.DueAt = DateTimeOffset.Now.AddDays(3);
    newItem.UserId = user.Id;

    // ...
}
```

The `Where` clause in the `MarkDoneAsync` method also needs to check for the user's ID, so a rogue user can't complete someone else's items by guessing their IDs:

```csharp
public async Task<bool> MarkDoneAsync(
    Guid id, ApplicationUser user)
{
    var item = await _context.Items
        .Where(x => x.Id == id && x.UserId == user.Id)
        .SingleOrDefaultAsync();

    // ...
}
```

All done! Try using the application with two different user accounts. The to-do items stay private for each account.
