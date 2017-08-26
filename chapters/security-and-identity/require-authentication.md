## Require authentication
Often you'll want to require the user to log in before they can access certain parts of your application (but not others). For example, it makes sense to show the home page to everyone, but only show your to-do list after you've logged in.

You can use the `[Authorize]` attribute in ASP.NET Core to require a logged-in user for a particular action, or an entire controller. To require authentication for all actions of the `TodoController`, add the attribute above the first line of the controller:

```csharp
[Authorize]
public class TodoController : Controller
{
  // …
}
```

Add this `using` statement at the top of the file:

```csharp
using Microsoft.AspNetCore.Authorization;
```

> Sidebar: Strictly speaking, **authentication** deals with whether you are logged in at all, while **authorization** deals with whether you have permission to access a specific area. Despite the name of the attribute, we are really doing an authentication check here.

Try running the application and accessing `/todo` without being logged in. You'll be redirected to the login page automatically.
## Using identity in the application
The items in the to-do list are still visible to all users, because the to-do entities themselves aren't tied to a particular user. Now that the `[Authorize]` attribute ensures that you must be logged in to see the to-do view, you can filter the database query based on who is logged in.

### Only show the current user's to-do items

First, inject a `UserManager<ApplicationUser>` into the `TodoController`:

**Controllers/TodoController.cs**

```csharp
[Authorize]
public class TodoController : Controller
{
    private readonly ITodoItemService _todoItemService;
    private readonly UserManager<ApplicationUser> _userManager;

    public TodoController(
        ITodoItemService todoItemService,
        UserManager<ApplicationUser> userManager)
    {
        _todoItemService = todoItemService;
        _userManager = userManager;
    }

    // …
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

The new code at the top of the action method uses the `UserManager` to get the current user from the special `User` property available in the action:

```csharp
var currentUser = await _userManager.GetUserAsync(User);
```

> Sidebar: If there is a logged-in user, the `User` property contains a lightweight object with some of the user's information. The `UserManager` uses this to look up the full user details in the database.

The value of `currentUser` should never be null, because the `[Authorize]` attribute is present on the controller. However, it's a good idea to do a sanity check, just in case. You can use the `Challenge()` method to force the user to log in again if their information is missing:

```csharp
if (currentUser == null) return Challenge();
```

Since you're now passing an `ApplicationUser` parameter to `GetIncompleteItemsAsync`, you'll need to update the `ITodoItemService` interface:

```csharp
Task<TodoItem[]> GetIncompleteItemsAsync(ApplicationUser user);
```

The next step is to update the database query and show only items owned by the current user. First, you'll need to add a new property to the `TodoItem` entity model so each item can know who owns it:

```csharp
public ApplicationUser Owner { get; set; }
```

Now you can update the `GetIncompleteItemsAsync` method in `EfCoreTodoItemService` and add another clause to the `Where` statement:

```csharp
public Task<TodoItem[]> GetIncompleteItemsAsync(ApplicationUser user)
{
    return _context.Items
        .Where(x => x.IsDone == false && x.Owner.Id == user.Id)
        .ToArrayAsync();
}
```

If you run the application and register or log in, you'll see an empty to-do list. Unfortunately, you can't add items to it, because the `Owner` property of new items isn't being set.

### Update the Add and Mark Done flows

You'll need to use the `UserManager` to get the current user in the `AddItem` and `MarkDone` action methods, just like you did in `Index`. The only difference is that these methods will return a `401 Unauthorized` response to the frontend code, instead of challenging and redirecting the user to the login page.

Here are both updated methods in `TodoController`:

```csharp
public async Task<IActionResult> AddItem(NewTodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser == null) return Unauthorized();

    var successful = await _todoItemService.AddItem(newItem, currentUser);
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

    var successful = await _todoItemService.MarkDone(id, currentUser);
    if (!successful) return BadRequest();

    return Ok();
}
```

Both service methods must now accept an `ApplicationUser` parameter. Update the interface definition in `ITodoItemService`:

```csharp
Task<bool> AddItem(NewTodoItem newItem, ApplicationUser user);

Task<bool> MarkDone(Guid id, ApplicationUser user);
```

And finally, update the service method implementations in `EfCoreTodoItemService`. For the Add Item flow, set the `Owner` property when you construct a `new TodoItem`:

```csharp
public async Task<bool> AddItem(NewTodoItem newItem, ApplicationUser user)
{
    var entity = new TodoItem
    {
        Id = Guid.NewGuid(),
        Owner = user,
        IsDone = false,
        Title = newItem.Title,
        DueAt = DateTimeOffset.Now.AddDays(3)
    };

    // ...
}
```

The `Where` clause in the `MarkDone` method needs the same update as the `GetIncompleteItemsAsync` method:

```csharp
public async Task<bool> MarkDone(Guid id, ApplicationUser user)
{
    var item = await _context.Items
        .Where(x => x.Id == id && x.Owner.Id == user.Id)
        .SingleOrDefaultAsync();

    // ...
```

All done! Try using the application with two different user accounts. The to-do items stay private for each account.
