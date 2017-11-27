## 完成控制器

最后一步，让我们来完成控制器的编码。控制器现在已经从 服务层 获取到一个 待办事项 的列表，它应该把这些条目放进一个 `TodoViewModel`，并把该 模型 与你先前创建的 视图 绑定：

**`Controllers/TodoController.cs`**

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

如果你还没在文件顶部添加 `using` 语句，现在加上：

```csharp
using AspNetCoreTodo.Services;
using AspNetCoreTodo.Models;
```

如果你用的是 Visual Studio 或者 Visual Studio Code，当你鼠标指针指向一个红色波浪线时，编辑器会提示你添加这些 `using` 语句。

## 测试一下

按 F5 启动程序（如果你用的是 Visual Studio 或者 Visual Studio Code），或者在终端窗口里运行 `dotnet run`。如果代码通过编译而没有报错，服务器将在默认的 5000 端口上运行。

如果你的网络浏览器没自动弹出来，打开它，浏览 http://localhost:5000/todo 。你会看到自己创建的视图，展示着（暂时）从伪数据库层提取的数据。

祝贺你！你刚刚构建了一个可运作的 ASP.NET Core 程序。下一步，使用第三方的程序包和真正的数据库代码，你将走得更远。

---

## Finish the controller
The last step is to finish the controller code. The controller now has a list of to-do items from the service layer, and it needs to put those items into a `TodoViewModel` and bind that model to the view you created earlier:

**`Controllers/TodoController.cs`**

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

If you haven't already, make sure these `using` statements are at the top of the file:

```csharp
using AspNetCoreTodo.Services;
using AspNetCoreTodo.Models;
```

If you're using Visual Studio or Visual Studio Code, the editor will suggest these `using` statements when you put your cursor on a red squiggly line.

## Test it out
To start the application, press F5 (if you're using Visual Studio or Visual Studio Code), or just run `dotnet run` in the terminal. If the code compiles without errors, the server will spin up on port 5000 by default.

If your web browser didn't open automatically, open it and navigate to http://localhost:5000/todo. You'll see the view you created, with the data pulled from your fake database layer (for now).

Congratulations! You've built a working ASP.NET Core application. Next, you'll take it further with third-party packages and real database code.
