## Complete items with a checkbox
In the `Views/Todo/Index.cshtml` view, a checkbox is rendered for each to-do item:

```razor
<input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
```

The item's ID (a guid) is saved in the `name` attribute of the element. You'll use this ID to tell your ASP.NET Core code to update that entity in the database when the checkbox is checked. The whole flow will look like:

* The user checks the box, which triggers a JavaScript function
* JavaScript is used to make an API call to an action on the controller
* The action calls into the service layer to update the item in the database
* A response is sent back to the JavaScript function to indicate the update was successful
* The HTML on the page is updated

### Add JavaScript code

First, open `site.js` and add this code:

**wwwroot/js/site.js**

```javascript
$(document).ready(function() {

    // Wire up all of the checkboxes to run markCompleted()
    $('.done-checkbox').on('click', function(e) {
        markCompleted(e.target);
    });

});

function markCompleted(checkbox) {
    checkbox.disabled = true;

    $.post('/Todo/MarkDone', { id: checkbox.name }, function() {
        var row = checkbox.parentElement.parentElement;
        $(row).addClass('done');
    });
}
```

This code uses jQuery's `$.post()` method to send an HTTP POST request to the `/Todo/MarkDone` route on your server. ASP.NET Core will look for a `MarkDone` action on the `TodoController`. Included in the request will be one paramter, `id`, with the value of the `name` attribute of the checkbox (which stores the item's ID).

If you open the Network Tools in your web browser, you'll see a request like:

```
POST http://localhost:5000/Todo/MarkDone
Content-Type: application/x-www-form-urlencoded

id=<some guid>
```

The third parameter passed to `$.post()` is a success handler function that will run if the POST is successful (returns 200 OK). jQuery is used to add a class to the table row that the checkbox sits in, and the class is targeted with CSS to change the way the row looks.

### Add an action to the controller

The above JavaScript code won't work yet, because there isn't a `MarkDone` action on the `TodoController` and ASP.NET Core will return 404 Not Found for that route.

Add a new action below the `Index` action in `Controllers/TodoController.cs`:

```csharp
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty) return BadRequest();

    var successful = await _todoItemService.MarkDone(id);

    if (!successful) return BadRequest();

    return Ok();
}
```

Let's step through each piece of this action method. First, the method accepts a parameter called `id` of type `Guid` in the method signature. If ASP.NET Core sees a parameter called `id` in an incoming request, it will try to parse it as a guid and place it in the `id` parameter.

For action methods that accept parameters from the client, it's customary to first check to make sure the parameters are valid. If for some reason the `id` parameter in the request couldn't be parsed as a guid, it will have a value of `Guid.Empty`. If that's the case, the action can return early:

```csharp
if (id == Guid.Empty) return BadRequest();
```

The `BadRequest()` method is a helper method that simply returns the HTTP status code 400 Bad Request.

Next, the controller needs to call down into the service to update the database. This will be handled by a new method called `MarkDone` on the `ITodoItemService`, which will return true or false depending on if the update succeeded:

```csharp
var successful = await _todoItemService.MarkDone(id);
if (!successful) return BadRequest();
```

Finally, if everything looks good, the `Ok()` method is used to return status code 200 OK. More complex APIs might return JSON or other data as well, but for now returning a status code is all you need.

### Add a service method

If you're using an editor that understands C#, you'll see red squiggly lines on the `_todoServiceItem.MarkDone` line because that method doesn't exist yet. First, add it to the interface:

**Services/ITodoItemService.cs

```csharp
public interface ITodoItemService
{
    Task<TodoItem[]> GetIncompleteItemsAsync();

    Task<bool> MarkDone(Guid id);
}
```

Then, add a concrete implementation to `EfCoreTodoItemService`:

**Services/EfCoreTodoItemService.cs**

```csharp
public async Task<bool> MarkDone(Guid id)
{
    var item = await _context.Items
        .Where(x => x.Id == id)
        .SingleOrDefaultAsync();

    if (item == null) return false;

    item.IsDone = true;

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1; // One entity should have been updated
}
```

This method uses Entity Framework Core and `Where` to find an entity by ID in the database. The `SingleOrDefaultAsync` method will return either the item (if it exists) or `null` if the ID was bogus. If it didn't exist, the code can return early.

Once you're sure that `item` isn't null, it's a simple matter of setting the `IsDone` property:

```csharp
item.IsDone = true;
```

Changing the property only affects the local copy of the item until `SaveChangesAsync` is called. `SaveChangesAsync` returns an integer that reflects how many entities were updated during the save operation. In this case, it'll either be 1 (the item was updated) or 0 (something went wrong).

> Sidebar: When you try to run the application, the compiler will complain that the old `FakeTodoItemService` doesn't implement the new `MarkDone` method. Since the fake service isn't important right now, it's easy to fix this by "stubbing" the method:

```csharp
public Task<bool> MarkDone(Guid id)
{
    throw new NotImplementedException();
}
```

Run the application and try checking some items off the list. Refresh the page and they'll disappear completely, because of the `Where` filter in the `GetIncompleteItemsAsync` method.

You'll also need a way to add new to-do items, or you'll run out of things to mark as complete!
