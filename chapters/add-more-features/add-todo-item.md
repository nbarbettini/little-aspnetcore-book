## Add new to-do items
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
