## Using identity in the application

The to-do list items themselves are still shared between all users, because the stored to-do entities aren't tied to a particular user. Now that the `[Authorize]` attribute ensures that you must be logged in to see the to-do view, you can filter the database query based on who is logged in.

First, inject a `UserManager<IdentityUser>` into the `TodoController`:

**Controllers/TodoController.cs**

```csharp
[Authorize]
public class TodoController : Controller
{
    private readonly ITodoItemService _todoItemService;
    private readonly UserManager<IdentityUser> _userManager;

    public TodoController(ITodoItemService todoItemService,
        UserManager<IdentityUser> userManager)
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

Since you're now passing an `IdentityUser` parameter to `GetIncompleteItemsAsync()`, you'll need to update the `ITodoItemService` interface:

**Services/ITodoItemService.cs**

```csharp
public interface ITodoItemService
{
    Task<TodoItem[]> GetIncompleteItemsAsync(
        IdentityUser user);
    
    // ...
}
```

Since you changed the `ITodoItemService` interface, you also need to update the signature of the `GetIncompleteItemsAsync()` method in the `TodoItemService`:

**Services/TodoItemService**

```csharp
public async Task<TodoItem[]> GetIncompleteItemsAsync(
    IdentityUser user)
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
    IdentityUser user)
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

Both service methods must now accept an `IdentityUser` parameter. Update the interface definition in `ITodoItemService`:

```csharp
Task<bool> AddItemAsync(TodoItem newItem, IdentityUser user);

Task<bool> MarkDoneAsync(Guid id, IdentityUser user);
```

And finally, update the service method implementations in the `TodoItemService`. In `AddItemAsync` method, set the `UserId` property when you construct a `new TodoItem`:

```csharp
public async Task<bool> AddItemAsync(
    TodoItem newItem, IdentityUser user)
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
    Guid id, IdentityUser user)
{
    var item = await _context.Items
        .Where(x => x.Id == id && x.UserId == user.Id)
        .SingleOrDefaultAsync();

    // ...
}
```

All done! Try using the application with two different user accounts. The to-do items stay private for each account.
