## Add new to-do items

The user will add new to-do items with a simple form below the list:

![Final form](final-form.png)

Adding this feature requires a few steps:

* Adding JavaScript that will send the data to the server
* Creating a new action on the controller to handle this request
* Adding code to the service layer to update the database

### Add JavaScript code

The `Todo/Index.cshtml` view already includes an HTML form that has a textbox and a button for adding a new item. You'll use jQuery to send a POST request to the server when the Add button is clicked.

Open the `wwwroot/js/site.js` file and add this code:

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
public async Task<IActionResult> AddItem(TodoItem newItem)
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

Notice how the new `AddItem` action accepts a `TodoItem` parameter? This is the same `TodoItem` model you created in _MVC basics_ to store information about a to-do item. When it's used here as an action parameter, ASP.NET Core will automatically perform a process called **model binding**. Model binding looks at the data in a form or AJAX POST request and tries to intelligently match the incoming fields with properties on the model.

In this case, the model definition (containing a property called `Title`) matches the data you're sending to the action with jQuery:

```javascript
$.post('/Todo/AddItem', { title: newTitle }  // ...

// A JSON object with one property:
// {
//   title: (whatever the user typed)
// }
```

During model binding, any model properties that can't be matched up with fields in the request are ignored. Since you're only POSTing a `title` field, you can expect that the other properties on `TodoItem` (the `IsDone` flag, the `DueAt` date) will be empty or contain default values.

> Instead of reusing the `TodoItem` model, another approach would be to create a separate model (like `NewTodoItem`) that's only used for this action and only has the specific properties you need for adding a new to-do item (Title). Model binding is still used, but you've separated the model that's used for saving a to-do item to the database from the model that's used for binding incoming request data. This is sometimes called a **binding model** or a **data transfer object** (DTO). This pattern is common in larger, more complex projects.

After binding the request data to the model, ASP.NET Core also performs **model validation**. Validation checks whether the data bound to the model from the incoming request makes sense or is valid. You can add attributes to the model to tell ASP.NET Core how it should be validated. For example, add the `[Required]` attribute to mark the `Title` property as a required field:

```csharp
[Required]
public string Title { get; set; }
```

You'll also have to add this `using` statement to the top of the file:

```csharp
using System.ComponentModel.DataAnnotations;
```

With the `[Required]` attribute on the `Title` property, ASP.NET Core's model validator will consider the title invalid if it is missing or blank. Take a look at the code of the `AddItem` action: the first block checks whether the `ModelState` (the model validation result) is valid. It's customary to do this right at the beginning of the action:

```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

If the `ModelState` is invalid for any reason, the action will return `400 Bad Request` along with the validation result info, which is automatically converted into an error message that tells the user what is wrong.

Next, the controller calls into the service layer to do the actual database operation of saving the new to-do item:

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

If you're using a code editor that understands C#, you'll see red squiggely lines under `AddItemAsync` because the method doesn't exist yet.

As a last step, you need to add a method to the service layer. First, add it to the interface definition in `ITodoItemService`:

```csharp
public interface ITodoItemService
{
    Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync();

    Task<bool> AddItemAsync(TodoItem newItem);
}
```

Then, the actual implementation in `TodoItemService`:

```csharp
public async Task<bool> AddItemAsync(TodoItem newItem)
{
    newItem.Id = Guid.NewGuid();
    newItem.IsDone = false;
    newItem.DueAt = DateTimeOffset.Now.AddDays(3);

    _context.Items.Add(newItem);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

The `newItem.Title` property has already been set by ASP.NET Core's model binder, so this method only needs to create an ID and set the default values for the other properties. Then, the new item is added to the database context. It isn't actually saved until you call `SaveChangesAsync()`. If the save operation was successful, `SaveChangesAsync()` will return 1.

> Sidebar: The above is just one way to build this functionality. If you want to display a separate page for adding a new item (for a complicated entity that contains a lot of properties, for example), you could create a new view that's bound to the model you need the user to provide values for. ASP.NET Core can render a form automatically for the properties of the model using a feature called **tag helpers**. You can find examples in the ASP.NET Core documentation at https://docs.asp.net.

### Try it out

Run the application and add some items to your to-do list with the form. Since the items are being stored in the database, they'll still be there even after you stop and start the application again.

> As a further challenge, try adding a date picker using HTML and JavaScript, and let the user choose an (optional) date for the `DueAt` property. Then, use that date instead of always making new tasks that are due in 3 days.
