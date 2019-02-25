## Finish the controller
The last step is to finish the controller code. The controller now has a list of to-do items from the service layer, and it needs to put those items into a `TodoViewModel` and bind that model to the view you created earlier:

**Controllers/TodoController.cs**

```csharp
public async Task<IActionResult> Index()
{
    var items = await _todoItemService.GetIncompleteItemsAsync();

    var model = new TodoViewModel
    {
        Items = items
    };

    return View(model);
}
```

If you haven't already, make sure these `using` statements are at the top of the file:

```csharp
using AspNetCoreTodo.Services;
using AspNetCoreTodo.Models;
```

If you're using Visual Studio or Visual Studio Code, the editor will suggest these `using` statements when you put your cursor on a red squiggly line.

## Test it out
To start the application, press F5 (if you're using Visual Studio or Visual Studio Code), or just type `dotnet run` in the terminal. If the code compiles without errors, the server will start up on port 5000 by default.

If your web browser didn't open automatically, open it and navigate to http://localhost:5000/todo. You'll see the view you created, with the data pulled from your fake database (for now).

Although it's possible to go directly to `http://localhost:5000/todo`, it would be nicer to add an item called **My to-dos** to the navbar. To do this, you can edit the shared layout file.
