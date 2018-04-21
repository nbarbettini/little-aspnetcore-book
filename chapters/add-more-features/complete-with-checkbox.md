## Complete items with a checkbox

Adding items to your to-do list is great, but eventually you'll need to get things done, too. In the `Views/Todo/Index.cshtml` view, a checkbox is rendered for each to-do item:

```html
<input type="checkbox" class="done-checkbox">
```

Clicking the checkbox doesn't do anything (yet). Just like the last chapter, you'll add this behavior using forms and actions. In this case, you'll also need a tiny bit of JavaScript code.


### Add form elements to the view

First, update the view and wrap each checkbox with a `<form>` element. Then, add a hidden element containing the item's ID:

**Views/Todo/Index.cshtml**

```html
<td>
    <form asp-action="MarkDone" method="POST">
        <input type="checkbox" class="done-checkbox">
        <input type="hidden" name="id" value="@item.Id">
    </form>
</td>
```

When the `foreach` loop runs in the view and prints a row for each to-do item, a copy of this form will exist in each row. The hidden input containing the to-do item's ID makes it possible for your controller code to tell which box was checked. (Without it, you'd be able to tell that *some* box was checked, but not which one.)

If you run your application right now, the checkboxes still won't do anything, because there's no submit button to tell the browser to create a POST request with the form's data. You could add a submit button under each checkbox, but that would be a silly user experience. Ideally, clicking the checkbox should automatically submit the form. You can achieve that by adding some JavaScript.


### Add JavaScript code

Find the `site.js` file in the `wwwroot/js` directory and add this code: 

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

This code first uses jQuery (a JavaScript helper library) to attach some code to the `click` even of all the checkboxes on the page with the CSS class `done-checkbox`. When a checkbox is clicked, the `markCompleted()` function is run.

The `markCompleted()` function does a few things:
* Adds the `disabled` attribute to the checkbox so it can't be clicked again
* Adds the `done` CSS class to the parent row that contains the checkbox, which changes the way the row looks based on the CSS rules in `style.css`
* Submits the form

That takes care of the view and frontend code. Now it's time to add a new action!


### Add an action to the controller

As you've probably guessed, you need to add an action called `MarkDone` in the `TodoController`:

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

Let's step through each line of this action method. First, the method accepts a `Guid` parameter called `id` in the method signature. Unlike the `AddItem` action, which used a model and model binding/validation, the `id` parameter is very simple. If the incoming request data includes a field called `id`, ASP.NET Core will try to parse it as a guid. This works because the hidden element you added to the checkbox form is named `id`.

Since you aren't using model binding, there's no `ModelState` to check for validity. Instead, you can check the guid value directly to make sure it's valid. If for some reason the `id` parameter in the request was missing or couldn't be parsed as a guid, `id` will have a value of `Guid.Empty`. If that's the case, the action tells the browser to redirect to `/Todo/Index` and refresh the page.

Next, the controller needs to call the service layer to update the database. This will be handled by a new method called `MarkDoneAsync` on the `ITodoItemService` interface, which will return true or false depending on whether the update succeeded:

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

**Services/ITodoItemService.cs**

```csharp
Task<bool> MarkDoneAsync(Guid id);
```

Then, add the concrete implementation to the `TodoItemService`:

**Services/TodoItemService.cs**

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

This method uses Entity Framework Core and `Where()` to find an item by ID in the database. The `SingleOrDefaultAsync()` method will either return the item or `null` if it couldn't be found.

Once you're sure that `item` isn't null, it's a simple matter of setting the `IsDone` property:

```csharp
item.IsDone = true;
```

Changing the property only affects the local copy of the item until `SaveChangesAsync()` is called to persist the change back to the database. `SaveChangesAsync()` returns a number that indicates how many entities were updated during the save operation. In this case, it'll either be 1 (the item was updated) or 0 (something went wrong).

### Try it out

Run the application and try checking some items off the list. Refresh the page and they'll disappear completely, because of the `Where()` filter in the `GetIncompleteItemsAsync()` method.

Right now, the application contains a single, shared to-do list. It'd be even more useful if it kept track of individual to-do lists for each user. In the next chapter, you'll add login and security features to the project.
