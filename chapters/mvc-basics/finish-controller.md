## Finish the controller
The last step is to finish the controller code. The controller now has a list of to-do items from the service layer, and it needs to put those items into a `TodoViewModel` and bind that model to the view you created earlier:

##### `Controllers/TodoController.cs`

```csharp
public async Task<IActionResult> Index()
{
    var todoItems = await _todoItemService.GetIncompleteItemsAsync();

    var model = new TodoViewModel()
    {
        Items = todoItems
    };

    return View(model);
}
```

## Test it out
To start the application, press F5 (if you're using Visual Studio or Visual Studio Code), or just run `dotnet run` in the terminal. If the code compiles without errors, the server will spin up on port 5000 by default.

If your web browser didn't open automatically, open it and navigate to http://localhost:5000/todo. You'll see the view you created, with the data pulled from your fake database layer (for now):

!TODO: screenshot

Congratulations! You've built a working ASP.NET Core application. Next, you'll take it further with third-party packages and real database code.
