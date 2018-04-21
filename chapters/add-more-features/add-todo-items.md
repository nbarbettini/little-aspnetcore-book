## Add new to-do items

The user will add new to-do items with a simple form below the list:

![Final form](final-form.png)

Adding this feature requires a few steps:

* Adding a form to the view
* Creating a new action on the controller to handle the form
* Adding code to the service layer to update the database

### Add a form

The `Views/Todo/Index.cshtml` view has a placeholder for the Add Item form:

```html
<div class="panel-footer add-item-form">
  <!-- TODO: Add item form -->
</div>
```

To keep things separate and organized, you'll create the form as a **partial view**. A partial view is a small piece of a larger view that lives in a separate file.

Create an `AddItemPartial.cshtml` view:

**Views/Todo/AddItemPartial.cshtml**

```html
@model TodoItem

<form asp-action="AddItem" method="POST">
    <label asp-for="Title">Add a new item:</label>
    <input asp-for="Title">
    <button type="submit">Add</button>
</form>
```

The `asp-action` attribute on the `<form>` element is called a **tag helper**. Before the view is rendered, ASP.NET Core replaces these tag helpers with real HTML attributes. In this case, the `asp-action` helper gets replaced with the real path to the `AddItem` route you'll create:

```html
<form action="/Todo/AddItem" method="POST">
```

Adding an `asp-` tag helper to the `<form>` element also adds a hidden field to the form containing a verification token. This verification token can be used to prevent cross-site request forgery (CSRF) attacks. You'll verify the token when you write the action.

That takes care of creating the partial view. Now, reference it from the main Todo view:

**Views/Todo/Index.cshtml**

```html
<div class="panel-footer add-item-form">
  @await Html.PartialAsync("AddItemPartial", new TodoItem())
</div>
```

### Add an action

When a user clicks Add on the form you just created, their browser will construct a POST request to `/Todo/AddItem` on your application. That won't work right now, because there isn't any action that can handle the `/Todo/AddItem` route. If you try it now, ASP.NET Core will return a `404 Not Found` error.

You'll need to create a new action called `AddItem` on the `TodoController`:

```csharp
[ValidateAntiForgeryToken]
public async Task<IActionResult> AddItem(TodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return RedirectToAction("Index");
    }

    var successful = await _todoItemService.AddItemAsync(newItem);
    if (!successful)
    {
        return BadRequest("Could not add item.");
    }

    return RedirectToAction("Index");
}
```

Notice how the new `AddItem` action accepts a `TodoItem` parameter? This is the same `TodoItem` model you created in the _MVC basics_ chapter to store information about a to-do item. When it's used here as an action parameter, ASP.NET Core will automatically perform a process called **model binding**.

Model binding looks at the data in a request and tries to intelligently match the incoming fields with properties on the model. In other words, when the user submits this form and their browser POSTs to this action, ASP.NET Core will grab the information from the form and place it in the `newItem` variable.

The `[ValidateAntiForgeryToken]` attribute before the action tells ASP.NET Core that it should look for (and verify) the hidden verification token that was added to the form by the `asp-action` tag helper. This is an important security measure to prevent cross-site request forgery (CSRF) attacks, where your users could be tricked into submitting data from a malicious site. The verification token ensures that your application is actually the one that rendered and submitted the form.

Take a look at the `AddItemPartial.cshtml` view once more. The `@model TodoItem` line at the top of the file tells ASP.NET Core that the view should expect to be paired with the `TodoItem` model. This makes it possible to use `asp-for="Title"` on the `<input>` tag to let ASP.NET Core know that this input element is for the `Title` property.

Because of the `@model` line, the partial view will expect to be passed a `TodoItem` object when it's rendered. Passing it a `new TodoItem` via `Html.PartialAsync` initializes the form with an empty item. (Try appending `{ Title = "hello" }` and see what happens!)

During model binding, any model properties that can't be matched up with fields in the request are ignored. Since the form only includes a `Title` input element, you can expect that the other properties on `TodoItem` (the `IsDone` flag, the `DueAt` date) will be empty or contain default values.

> Instead of reusing the `TodoItem` model, another approach would be to create a separate model (like `NewTodoItem`) that's only used for this action and only has the specific properties (Title) you need for adding a new to-do item. Model binding is still used, but this way you've separated the model that's used for storing a to-do item in the database from the model that's used for binding incoming request data. This is sometimes called a **binding model** or a **data transfer object** (DTO). This pattern is common in larger, more complex projects.

After binding the request data to the model, ASP.NET Core also performs **model validation**. Validation checks whether the data bound to the model from the incoming request makes sense or is valid. You can add attributes to the model to tell ASP.NET Core how it should be validated.

The `[Required]` attribute on the `Title` property tells ASP.NET Core's model validator to consider the title invalid if it is missing or blank. Take a look at the code of the `AddItem` action: the first block checks whether the `ModelState` (the model validation result) is valid. It's customary to do this validation check right at the beginning of the action:

```csharp
if (!ModelState.IsValid)
{
    return RedirectToAction("Index");
}
```

If the `ModelState` is invalid for any reason, the browser will be redirected to the `/Todo/Index` route, which refreshes the page.

Next, the controller calls into the service layer to do the actual database operation of saving the new to-do item:

```csharp
var successful = await _todoItemService.AddItemAsync(newItem);
if (!successful)
{
    return BadRequest(new { error = "Could not add item." });
}
```

The `AddItemAsync` method will return `true` or `false` depending on whether the item was successfully added to the database. If it fails for some reason, the action will return an HTTP `400 Bad Request` error along with an object that contains an error message.

Finally, if everything completed without errors, the action redirects the browser to the `/Todo/Index` route, which refreshes the page and displays the new, updated list of to-do items to the user.

### Add a service method

If you're using a code editor that understands C#, you'll see red squiggely lines under `AddItemAsync` because the method doesn't exist yet.

As a last step, you need to add a method to the service layer. First, add it to the interface definition in `ITodoItemService`:

```csharp
public interface ITodoItemService
{
    Task<TodoItem[]> GetIncompleteItemsAsync();

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

The `newItem.Title` property has already been set by ASP.NET Core's model binder, so this method only needs to assign an ID and set the default values for the other properties. Then, the new item is added to the database context. It isn't actually saved until you call `SaveChangesAsync()`. If the save operation was successful, `SaveChangesAsync()` will return 1.

### Try it out

Run the application and add some items to your to-do list with the form. Since the items are being stored in the database, they'll still be there even after you stop and start the application again.

> As an extra challenge, try adding a date picker using HTML and JavaScript, and let the user choose an (optional) date for the `DueAt` property. Then, use that date instead of always making new tasks that are due in 3 days.
