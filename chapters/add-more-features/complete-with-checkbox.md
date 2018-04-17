## Complete items with a checkbox

Adding items to your to-do list is great, but eventually you'll need to get things done, too. In the `Views/Todo/Index.cshtml` view, a checkbox is rendered for each to-do item:

```html
<input type="checkbox" class="done-checkbox">
```

Just like the last chapter, you'll add this behavior using forms and actions (and in this case, a tiny bit of JavaScript code).


### Add form elements to the view

First, update the view and wrap each checkbox with a `<form>` element:

```html
<td>
<form asp-action="MarkDone" method="POST">
    <input type="checkbox" class="done-checkbox">
    <input type="hidden" name="id" value="@item.Id">
</form>
</td>
```

The hidden input containing `item.Id` will help your action understand which checkbox was actually clicked.

If you run your application right now, the checkboxes still won't do anything, because there's no submit button to tell the browser to create a POST request from the form. It wouldn't be a great experience to make your user click an extra button. Ideally, clicking the checkbox should automatically submit the form. You can achieve that by adding some JavaScript.


### Add JavaScript code

Find the `site.js` file in the `wwwroot/js` folder and add this code: 

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

    var row = checkbox.closest('tr');
    $(row).addClass('done');

    var form = checkbox.closest('form');
    form.submit();
}
```

This code uses jQuery (a JavaScript helper library) to do two things:
* When any of the checkboxes are clicked, run the `markCompleted()` function
* When `markCompleted()` runs, change the UI and auto-submit the form

Now it's time to add a new action!


### Add an action to the controller

As you've probably guessed, you need to add an action called `MarkDone` on the `TodoController`:

```csharp
[ValidateAntiForgeryToken]
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty)
    {
        return RedirectToAction("Index");
    }

    var successful = await _todoItemService.MarkDoneAsync(id);
    if (!successful)
    {
        return BadRequest("Could not mark item as done.");
    }

    return RedirectToAction("Index");
}
```

Let's step through each piece of this action method. First, the method accepts a `Guid` parameter called `id` in the method signature. Unlike the `AddItem` action, which used a model and model binding/validation, the `id` parameter is very simple. If the incoming request includes a parameter called `id`, ASP.NET Core will try to parse it as a guid. This works because the hidden element you added to the checkbox forms is named `id`.

There's no `ModelState` to check for validity, but you can still check to make sure the guid was valid. If for some reason the `id` parameter in the request was missing couldn't be parsed as a guid, it will have a value of `Guid.Empty`. If that's the case, the action tells the browser to redirect to `/Todo/Index` (refresh the page).

Next, the controller needs to call the service layer to update the database. This will be handled by a new method called `MarkDoneAsync` on the `ITodoItemService`, which will return true or false depending on whether the update succeeded:

```csharp
var successful = await _todoItemService.MarkDoneAsync(id);
if (!successful)
{
    return BadRequest("Could not mark item as done.");
}
```

Finally, if everything looks good, the browser is redirected to the `/Todo/Index` action and the page is refreshed.

With the view and controller updated, all that's left is adding the missing service method.

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
