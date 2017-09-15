## Add new to-do items

The user will add new to-do items with a simple form below the list:

![Final form](final-form.png)

Adding this feature requires a few steps:

* Modifying the view to add the HTML form elements
* Adding JavaScript that will send the data to the server
* Creating a new action on the controller to handle this request
* Adding code to the service layer to update the database

### Add a form to the view

First, add some HTML to the bottom of `Views/Todo/Index.cshtml`:

```html
<div class="add-item-form">
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

Open the `wwwroot/site.js` file and add this code:

```javascript
$(document).ready(function() {

    // Wire up the Add button to send the new item to the server
    $('#add-item-button').on('click', addItem);

});
```

Then, write the `addItem` function at the bottom of the file:

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

This function will send a POST request to `http://localhost:5000/Todo/AddItem` with the name the user typed. The third parameter passed to the `$.post` method (the function) is a success handler that will run if the server responds with `200 OK`. The success handler function uses `window.location` to refresh the page (by setting the location to `/Todo`, the same page the browser is currently on). If the server responds with `400 Bad Request`, the `fail` handler attached to the `$.post` method will try to pull out an error message and display it in a the `<div>` with id `add-item-error`.

### Add an action

The above JavaScript code won't work yet, because there isn't any action that can handle the `/Todo/AddItem` route. If you try it now, ASP.NET Core will return a `404 Not Found` error.

You'll need to create a new action called `AddItem` on the `TodoController`:

```csharp
public async Task<IActionResult> AddItem(NewTodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var successful = await _todoItemService.AddItemAsync(newItem);
    if (!successful)
    {
        return BadRequest(new { error = "Could not add item" });
    }

    return Ok();
}
```

The method signature defines a `NewTodoItem` parameter, which is a new model that doesn't exist yet. You'll need to create it:

##### `Models/NewTodoItem.cs`

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

This model definition (one property called `Title`) matches the data you're sending to the action with jQuery:

```javascript
$.post('/Todo/AddItem', { title: newTitle }  // ...

// A JSON object with one property:
// {
//   title: (whatever the user typed)
// }
```

ASP.NET Core uses a process called **model binding** to match up the parameters submitted in the POST request to the model definition you created. If the parameter names match (ignoring things like case), the request data will be placed into the model.

After binding the request data to the model, ASP.NET Core also performs **model validation**. The `[Required]` attribute on the `Title` property informs the validator that the `Title` property should not be missing (blank). The validator won't throw an error if the model fails validation, but the validation status will be saved so you can check it in the controller.

> Sidebar: It would have been possible to reuse the `TodoItem` model instead of creating the `NewTodoItem` model, but `TodoItem` contains properties that will never be submitted by the user (ID and done). It's cleaner to declare a new model that represents the exact set of properties that are relevant when adding a new item.

Back to the `AddItem` action method on the `TodoController`: the first block checks whether the model passed the model validation process. It's customary to do this right at the beginning of the method:

```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

If the `ModelState` is invalid (because the required property is empty), the action will return 400 Bad Request along with the model state, which is automatically converted into an error message that tells the user what is wrong.

Next, the controller calls into the service layer to do the actual database operation:

```csharp
var successful = await _todoItemService.AddItemAsync(newItem);
if (!successful)
{
    return BadRequest(new { error = "Could not add item." });
}
```

The `AddItemAsync` method will return `true` or `false` depending on whether the item was successfully added to the database. If it fails for some reason, the action will return `400 Bad Request` along with an object that contains an `error` property.

Finally, if everything completed without errors, the action returns `200 OK`.

### Add a service method

If you're using a code editor that understands C#, you'll see red squiggely lines under `AddItemAsync` because the method doesn't exist yet. As a last step, you need to add the `AddItem` method to the service layer.

First, add it to the interface definition in `ITodoItemService`:

```csharp
public interface ITodoItemService
{
    Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync();

    Task<bool> AddItem(NewTodoItem newItem);
}
```

Then, the actual implementation in `TodoItemService`:

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

This method creates a new `TodoItem` (the model that represents the database entity) and copies the `Title` from the `NewTodoItem` model. Then, it adds it to the context and uses `SaveChangesAsync` to persist the entity in the database.

> Sidebar: The above is just one way to build this functionality. If you want to display a separate page for adding a new item (for a complicated entity that contains a lot of properties, for example), you could create a new view that's bound to the model you need the user to provide values for. ASP.NET Core can render a form automatically for the properties of the model using a feature called **tag helpers**. You can find examples in the ASP.NET Core documentation at https://docs.asp.net.

### Try it out

Run the application and add some items to your to-do list with the form. Since the items are being stored in the database, they still be there even after you stop and start the application again.

> As a further challenge, try adding a date picker using HTML and JavaScript, and let the user choose an (optional) date for the `DueAt` property. Then, use that date instead of always making new tasks that are due in 3 days.
