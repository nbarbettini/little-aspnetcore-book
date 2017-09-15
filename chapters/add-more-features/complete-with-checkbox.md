## Complete items with a checkbox

Adding items to your to-do list is great, but eventually you'll need to get things done, too. In the `Views/Todo/Index.cshtml` view, a checkbox is rendered for each to-do item:

```html
<input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
```

The item's ID (a guid) is saved in the `name` attribute of the element. You can use this ID to tell your ASP.NET Core code to update that entity in the database when the checkbox is checked.

This is what the whole flow will look like:

* The user checks the box, which triggers a JavaScript function
* JavaScript is used to make an API call to an action on the controller
* The action calls into the service layer to update the item in the database
* A response is sent back to the JavaScript function to indicate the update was successful
* The HTML on the page is updated

### Add JavaScript code

TODO
First, open `site.js` and add this code to the `$(document).ready` block:

**wwwroot/js/site.js**

```javascript
$(document).ready(function() {

    // ...

    // Wire up all of the checkboxes to run markCompleted()
    $('.done-checkbox').on('click', function(e) {
        markCompleted(e.target);
    });

});
```

Then, add the `markCompleted` function at the bottom of the file:

```javascript
function markCompleted(checkbox) {
    checkbox.disabled = true;

    $.post('/Todo/MarkDone', { id: checkbox.name }, function() {
        var row = checkbox.parentElement.parentElement;
        $(row).addClass('done');
    });
}
```

This code uses jQuery to send an HTTP POST request to `http://localhost:5000/Todo/MarkDone`. Included in the request will be one paramter, `id`, containing the item's ID (pulled from the `name` attribute).

If you open the Network Tools in your web browser and click on a checkbox, you'll see a request like:

```
POST http://localhost:5000/Todo/MarkDone
Content-Type: application/x-www-form-urlencoded

id=<some guid>
```

The success handler function passed to `$.post` uses jQuery to add a class to the table row that the checkbox sits in. With the row marked with the `done` class, a CSS rule in the page stylesheet will change the way the row looks.

### Add an action to the controller

As you've probably guessed, you need to add a `MarkDone` action on the `TodoController`:

```csharp
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty) return BadRequest();

    var successful = await _todoItemService.MarkDoneAsync(id);

    if (!successful) return BadRequest();

    return Ok();
}
```

Let's step through each piece of this action method. First, the method accepts a `Guid` parameter called `id` in the method signature. Unlike the `AddItem` action, which used a model (the `NewTodoItem` model) and model binding/validation, the `id` parameter is very simple. If the incoming request includes a parameter called `id`, ASP.NET Core will try to parse it as a guid.

There's no `ModelState` to check for validity, but you can still check to make sure the guid was valid. If for some reason the `id` parameter in the request was missing couldn't be parsed as a guid, it will have a value of `Guid.Empty`. If that's the case, the action can return early:

```csharp
if (id == Guid.Empty) return BadRequest();
```

The `BadRequest()` method is a helper method that simply returns the HTTP status code `400 Bad Request`.

Next, the controller needs to call down into the service to update the database. This will be handled by a new method called `MarkDoneAsync` on the `ITodoItemService`, which will return true or false depending on if the update succeeded:

```csharp
var successful = await _todoItemService.MarkDoneAsync(id);
if (!successful) return BadRequest();
```

Finally, if everything looks good, the `Ok()` method is used to return status code `200 OK`. More complex APIs might return JSON or other data as well, but for now returning a status code is all you need.

### Add a service method

First, add `MarkDoneAsync` to the interface definition:

**`Services/ITodoItemService.cs`**

```csharp
Task<bool> MarkDoneAsync(Guid id);
```

Then, add the concrete implementation to the `TodoItemService`:

**`Services/TodoItemService.cs`**

```csharp
public async Task<bool> MarkDoneAsync(Guid id)
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

Changing the property only affects the local copy of the item until `SaveChangesAsync` is called to persist your changes back to the database. `SaveChangesAsync` returns an integer that reflects how many entities were updated during the save operation. In this case, it'll either be 1 (the item was updated) or 0 (something went wrong).

### Try it out

Run the application and try checking some items off the list. Refresh the page and they'll disappear completely, because of the `Where` filter in the `GetIncompleteItemsAsync` method.

Right now, the application contains a single, shared to-do list. It'd be even more useful if it kept track of individual to-do lists for each user. In the next chapter, you'll use ASP.NET Core Identity to add security and authentication features to the project.
