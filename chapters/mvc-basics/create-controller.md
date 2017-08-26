## Create a controller
There's already one controller in the project, `HomeController`, which renders the welcome screen. You can ignore that for now. Create a new controller for the to-do list functionality, called `TodoController`. By convention, controllers are placed in the `Controllers` directory.

**Controllers/TodoController.cs**

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

Routes that are handled by controllers are called **actions**, and are represented by methods in the controller class. For example, the Home controller includes three action methods (`Index()`, `About()`, and `Contact()`) which are mapped by ASP.NET Core to these URLs by the application:

```
localhost:5000/Home  -> Index()
localhost:5000/Home/About  -> About()
localhost:5000/Home/Contact  -> Contact()
```

There are a number of conventions used by ASP.NET Core MVC, such as the pattern that `FooController` becomes `/Foo`, and the `Index` action can be left out of the URL. You can customize the behavior of this routing if you'd like, but for now, we'll stick to the default conventions.

Action methods return some type of **action result**. This can be an HTTP status code like 200 or 404, a rendered view, or some JSON data. The method signature of the action method can explicitly declare the type of result the action returns, or you can mark it as returning `IActionResult` (an interface that represents *any* action result) for maximum flexibility.

Add a new action called `Index` to the `TodoController`:

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

It's a best practice to keep controllers as lightweight as possible. In this case, the controller should only be responsible for getting the to-do items from the database, and sending the view back to the user's browser (along with a model containing the items pulled from the database).

Before you can write the rest of the controller code, you need to create a model and a view.
