# More MVC
Now that you've connected to a database using Entity Framework Core, you're ready to add some more features to the application. First, you'll make it possible to mark a to-do item as complete by checking its checkbox.
## Completing items with a checkbox
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
## Add a new to-do item
Adding the ability to add to-do items will follow a similar pattern: you'll need to add some frontend (JavaScript) code, then backend code in the controller and service.

### Add a form to the view

First, add some HTML to the bottom of `Views/Todo/Index.cshtml`:

```razor
<div class="add-item">
    <form>
        <div id="add-item-error" class="text-danger"></div>
        <label for="add-item-title">Add a new item:</label>
        <input id="add-item-title">
        <button type="button" id="add-item-button">Add</button>
    </form>
</div>
```

You'll use jQuery to send a POST request to the server when the Add button is clicked.

### Add JavaScript code

In the `$(document).ready` block in `wwwroot/js/site.js`, add this line to wire up the Add button to the `addItem` function:

```javascript
// Wire up the Add button to send the new item to the server
$('#add-item-button').on('click', addItem);
```

Then, add the `addItem` function at the bottom of the file:

```javascript
function addItem() {
    $('#add-item-error').hide();
    var newTitle = $('#add-item-title').val();

    $.post('/Todo/AddItem', { title: newTitle }, function() {
        window.location = '/Todo';
    })
    .fail(function(data) {
        if (data && data.responseJSON) {
            var firstError = data.responseJSON[Object.keys(data.responseJSON)[0]];
            $('#add-item-error').text(firstError);
            $('#add-item-error').show();
        }
    });
}
```

This function will send a POST request to `/Todo/AddItem`, and refresh the page if the server responds with success (200 OK). If the server responds with 400 Bad Request, the fail handler will try to pull out the first error message (from an array of error messages) and display it in a `<div>`.

### Add an action

As you've probably guessed, you need to create an `AddItem` action on the `TodoController`:

```csharp
public async Task<IActionResult> AddItem(NewTodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var successful = await _todoItemService.AddItem(newItem);
    if (!successful)
    {
        return BadRequest(new { error = "Could not add item" });
    }

    return Ok();
}
```

> Sidebar: Like the `MarkDone` method, this action method doesn't render a view. Instead, it returns an HTTP status code that the frontend JavaScript code can look for.

The method signature declares a parameter called `newItem` of type `NewTodoItem`, which is a new model you'll need to create:

**Models/NewTodoItem.cs**

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace AspNetCoreTodo.Models
{
    public class NewTodoItem
    {
        [Required]
        public string Title { get; set; }
    }
}
```

The `[Required]` attribute on the `Title` property will be used by ASP.NET Core to determine whether the user's submission is valid or not.

> Sidebar: It would have been possible to reuse the `TodoItem` model, but it contains properties that will never be submitted by the user (ID, done). It's cleaner to declare a new model that represents the exact set of properties that are relevant when adding a new item.

Back to the `AddItem` action method on the `TodoController`: the first block checks whether the model is valid, based on the `[Required]` attribute:

```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

If the `ModelState` is invalid, the action will return 400 Bad Request along with the model state, which is automatically serialized into a set of error messages that tell the user what is wrong with the submission.

Next, the controller calls into the service layer to do the actual database operation:

```csharp
var successful = await _todoItemService.AddItem(newItem);
if (!successful)
{
    return BadRequest(new { error = "Could not add item." });
}
```

Similar to the checkbox feature you added before, the service method returns true or false depending on whether the operation succeeded. If it fails for some reason, the action will return 400 Bad Request and an object with an `error` property and a generic error message.

Finally, if everything completed without errors, the action returns 200 OK.

### Add a service method

As a last step, you'll need to add the `AddItem` method to the service layer. First, in `ITodoItemService`:

```csharp
Task<bool> AddItem(NewTodoItem newItem);
```

Then, the actual implementation in `EfCoreTodoItemService`:

```csharp
public async Task<bool> AddItem(NewTodoItem newItem)
{
    var entity = new TodoItem
    {
        Id = Guid.NewGuid(),
        IsDone = false,
        Title = newItem.Title,
        DueAt = DateTimeOffset.Now.AddDays(3)
    };

    _context.Items.Add(entity);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

This method creates a new `TodoItem` (the model that represents the database entity) and copies some of the properties of the `NewTodoItem` model. Then, it adds it to the context and uses `SaveChangesAsync` to persist the entity in the database.

> Sidebar: The above is just one way to build this functionality. If you want to display a separate page for adding a new item (for a complicated entity that contains a lot of properties, for example), you could create a separate view that's bound to the model you need the user to provide values for (the `NewTodoItem` model in this case). ASP.NET Core can render a form automatically for the properties of the model using a feature called **tag helpers**. You can find examples in the ASP.NET Core documentation at https://docs.asp.net.

As a further challenge, try adding a date picker using HTML and JavaScript, and let the user choose an (optional) date for the `DueAt` property. Then, use that date instead of always making new tasks that are due in 3 days.
