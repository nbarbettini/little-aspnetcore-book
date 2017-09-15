## Using identity in the application

The to-do list items themselves are still shared between all users, because the to-do entities aren't tied to a particular user. Now that the `[Authorize]` attribute ensures that you must be logged in to see the to-do view, you can filter the database query based on who is logged in.

First, inject a `UserManager<ApplicationUser>` into the `TodoController`:

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

You'll need to add a new `using` statement at the top:

```csharp
using Microsoft.AspNetCore.Identity;
```

The `UserManager` class is part of ASP.NET Core Identity. You can use it to look up the current user in the `Index` action:

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

The new code at the top of the action method uses the `UserManager` to get the current user from the `User` property available in the action:

```csharp
var currentUser = await _userManager.GetUserAsync(User);
```

If there is a logged-in user, the `User` property contains a lightweight object with some (but not all) of the user's information. The `UserManager` uses this to look up the full user details in the database via the `GetUserAsync`.

The value of `currentUser` should never be null, because the `[Authorize]` attribute is present on the controller. However, it's a good idea to do a sanity check, just in case. You can use the `Challenge()` method to force the user to log in again if their information is missing:

```csharp
if (currentUser == null) return Challenge();
```

Since you're now passing an `ApplicationUser` parameter to `GetIncompleteItemsAsync`, you'll need to update the `ITodoItemService` interface:

**`Services/ITodoItemService.cs`**

```csharp
public interface ITodoItemService
{
    Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync(ApplicationUser user);
    
    // ...
}
```

The next step is to update the database query and show only items owned by the current user.

### Update the database

You'll need to add a new property to the `TodoItem` entity model so each item can reference the user that owns it:

```csharp
public string OwnerId { get; set; }
```

Since you updated the entity model used by the database context, you also need to migrate the database. Create a new migration using `dotnet ef` in the terminal:

```
dotnet ef migrations add AddItemOwnerId
```

This creates a new migration called `AddItemOwner` which will add a new column to the `Items` table, mirroring the change you made to the `TodoItem` entity model.

TODO: SQLite workaround

Use `dotnet ef` again to apply it to the database:

```
dotnet ef database update
```

### Update the service class

With the database and the database context updated, you can now update the `GetIncompleteItemsAsync` method in the `TodoItemService` and add another clause to the `Where` statement:

**`Services/TodoItemService.cs`**

```csharp
public async Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync(ApplicationUser user)
{
    return await _context.Items
        .Where(x => x.IsDone == false && x.OwnerId == user.Id)
        .ToArrayAsync();
}
```

If you run the application and register or log in, you'll see an empty to-do list once again. Unfortunately, any items you try to add disappear into the ether, because you haven't updated the Add Item operation to save the current user to new items.

### Update the Add Item and Mark Done operations

You'll need to use the `UserManager` to get the current user in the `AddItem` and `MarkDone` action methods, just like you did in `Index`. The only difference is that these methods will return a `401 Unauthorized` response to the frontend code, instead of challenging and redirecting the user to the login page.

Here are both updated methods in the `TodoController`:

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

Both service methods must now accept an `ApplicationUser` parameter. Update the interface definition in `ITodoItemService`:

```csharp
Task<bool> AddItemAsync(NewTodoItem newItem, ApplicationUser user);

Task<bool> MarkDoneAsync(Guid id, ApplicationUser user);
```

And finally, update the service method implementations in the `TodoItemService`.

For the `AddItemAsync` method, set the `Owner` property when you construct a `new TodoItem`:

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

The `Where` clause in the `MarkDoneAsync` method also needs to check for the user's ID, so a rogue user can't complete someone else's items by guessing their IDs:

```csharp
public async Task<bool> MarkDoneAsync(Guid id, ApplicationUser user)
{
    var item = await _context.Items
        .Where(x => x.Id == id && x.OwnerId == user.Id)
        .SingleOrDefaultAsync();

    // ...
}
```

All done! Try using the application with two different user accounts. The to-do items stay private for each account.
