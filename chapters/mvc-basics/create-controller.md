## 创建控制器

在项目的 Controllers 目录里，已经有几个控制器了，其中有渲染默认欢迎页的 `HomeController`，就是你访问 `http://localhost:5000` 看到的那个页面。暂时不用管这些控制器。

给待办清单功能创建一个新的控制器，取名叫 `TodoController` ，并添加如下代码：

**`Controllers/TodoController.cs`**

``` csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreTodo.Controllers
{
    public class TodoController : Controller
    {
        // Actions go here
    }
}
```

由控制器本身处理的路由叫**action**，由控制器类里的方法（函数）表示。比如，`HomeController` 包含三个 action 方法（`Index`，`About`，和 `Contact`），由 ASP.NET Core 分别映射到如下的 URL：

```text
localhost:5000/Home         -> Index()
localhost:5000/Home/About   -> About()
localhost:5000/Home/Contact -> Contact()
```

ASP.NET Core 中有几个惯例（常见的模式），比如这个 `FooController` 映射到 `/Foo` 的模式，还有 `Index` 的 action名 可以在 URL 里省略。如果你有需要，可以自定义这些行为，不过就目前的情况，让我们先遵循这些惯例吧。

在 `TodoController` 里，添加一个名为 `Index` 的 action，把那句 `// Actions go here` 注释替换为：

```csharp
public class TodoController : Controller
{
    public IActionResult Index()
    {
        // Get to-do items from database

        // Put items into a model

        // Pass the view to a model and render
    }
}
```

一个 action 方法可以返回视图、JSON数据或者 `200 OK`、`404 Not Found` 之类的状态码。返回类型 `IActionResult` 给了你足够的灵活性，以返回上面提到的任意一个。

使控制器尽可能保持轻量化，是一个良好的习惯。在现在的情形里，这个控制器应该仅仅完成这些事情：从数据库取出待办事项的记录，把这些事项包装在一个可用于视图的模型中，并把这个视图发送到用户的浏览器。

继续编码这个控制器之前，你需要创建一个模型和一个视图。

Action methods can return views, JSON data, or HTTP status codes like `200 OK` or `404 Not Found`. The `IActionResult` return type gives you the flexibility to return any of these from the action.

It's a best practice to keep controllers as lightweight as possible. In this case, the controller should only be responsible for getting the to-do items from the database, putting those items into a model the view can understand, and sending the view back to the user's browser.

Before you can write the rest of the controller code, you need to create a model and a view.

---

## Create a controller

There are already a few controllers in the project's Controllers folder, including the `HomeController` that renders the default welcome screen you see when you visit `http://localhost:5000`. You can ignore these controllers for now.

Create a new controller for the to-do list functionality, called `TodoController`, and add the following code:

**`Controllers/TodoController.cs`**

``` csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreTodo.Controllers
{
    public class TodoController : Controller
    {
        // Actions go here
    }
}
```

Routes that are handled by controllers are called **actions**, and are represented by methods in the controller class. For example, the `HomeController` includes three action methods (`Index`, `About`, and `Contact`) which are mapped by ASP.NET Core to these route URLs:

```
localhost:5000/Home         -> Index()
localhost:5000/Home/About   -> About()
localhost:5000/Home/Contact -> Contact()
```

There are a number of conventions (common patterns) used by ASP.NET Core, such as the pattern that `FooController` becomes `/Foo`, and the `Index` action name can be left out of the URL. You can customize this behavior if you'd like, but for now, we'll stick to the default conventions.

Add a new action called `Index` to the `TodoController`, replacing the  `// Actions go here` comment:

```csharp
public class TodoController : Controller
{
    public IActionResult Index()
    {
        // Get to-do items from database

        // Put items into a model

        // Pass the view to a model and render
    }
}
```

Action methods can return views, JSON data, or HTTP status codes like `200 OK` or `404 Not Found`. The `IActionResult` return type gives you the flexibility to return any of these from the action.

It's a best practice to keep controllers as lightweight as possible. In this case, the controller should only be responsible for getting the to-do items from the database, putting those items into a model the view can understand, and sending the view back to the user's browser.

Before you can write the rest of the controller code, you need to create a model and a view.
