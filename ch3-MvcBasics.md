# MVC basics
In this chapter, you'll explore the MVC system in ASP.NET Core. MVC (Model-View-Controller) is a pattern for building web applications that's found in almost every web framework (Express, Spring, Django, and Laravel are popular examples), as well as frontend JavaScript frameworks like Angular. Mobile apps on iOS and Android use a variation of MVC as well.

As the name suggests, MVC has three components: models, views, and controllers. **Controllers** handle incoming requests from a client or web browser and make decisions about what code to run. **Views** are templates (usually HTML plus some templating language like Handlebars or Pug) that get data added to them and then are displayed to the user. **Models** hold the data that is added to views.

A common pattern for MVC code is: the controller receives a request, does some processing for the user, then fills a model with information about the response and combines the model with a view that's sent back to the user's browser.

If you've worked with MVC in other stacks, you'll feel right at home in ASP.NET Core MVC. If you're new to MVC, you'll learn everything you need to know in this chapter.
# What you'll build
The "Hello World" of MVC is a to-do list application. It's a great exercise since it's small and simple in scope, but it touches each part of MVC and covers many of the concepts you'd use in a larger application.

In this book, you'll build a to-do list that lets the user add items to their to-do list and check them off once complete. You'll build the backend using ASP.NET Core and the MVC pattern, plus HTML, CSS, and a little JavaScript in the views (also called the "frontend" of the application).

If you haven't already created a new ASP.NET Core project using `dotnet new mvc`, follow the steps in the previous chapter. You should be able to build and run the project and see the default welcome screen.
# Create a controller
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

Before you can write the controller code, you need to create a model and a view, and write some database code.
# Create models
There are two separate model classes that need to be created: a model that represents a to-do item stored in the database (sometimes called an *entity*), and the model that will be combined with a view (the MV in MVC) and sent back to the browser. Because we can refer to both of them as "models", I'll refer to the latter as a *view model*.

First, create a class called `TodoItem` in the Models directory:

**Models/TodoItem.cs**

```csharp
using System;

namespace AspNetCoreTodo.Models
{
    public class TodoItem
    {
        public Guid Id { get; set; }
        
        public bool IsDone { get; set; }

        public string Title { get; set; }

        public DateTimeOffset? DueAt { get; set; }
    }
}
```

This class defines what the database will need to store for each to-do item: an ID, a title or name, whether the item is complete, and what the due date is. Each line defines a property of the class, its type (boolean, string, guid), and getters and setters for the property (which makes it read/write).

At this point, it doesn't matter what the underlying database technology is. It could be SQL Server, MySQL, MongoDB, Redis, or something more exotic. This model defines what the database row or entry will look like in C# code so you don't have to worry about the low-level database stuff. It's sometimes called a "plain ol' C# object" or POCO (like a POJO in Java).

Often, the model (entity) you store in the database is similar but not *exactly* the same as the model you want to use in MVC (the view model). In this case, the `TodoItem` model represents a single item in the database, but the view the controller will render could have two, ten, or a hundred to-do items (depending on how badly the user is procrastinating).

Because of this, the view model must be a class that holds an array of `TodoItem`s:

**Models/TodoViewModel.cs**

```csharp
namespace AspNetCoreTodo.Models
{
    public class TodoViewModel
    {
        public TodoItem[] Items { get; set; }
    }
}
```

The brackets syntax in `TodoItem[]` declares that this property holds an array of `TodoItem` objects.

Now that you have some models, it's time to create a view that will take a `TodoViewModel` and render the right HTML to show the user their to-do list.
# Create a view
Views in ASP.NET Core are built using the Razor templating language, which combines HTML and C# code. (If you've written pages using Jade/Pug or Handlebars moustaches in JavaScript, ERB in Ruby on Rails, or Thymeleaf in Java, you've already got the basic idea.)

Most view code is just HTML, with the occasional C# statement added in to pull data out of the view model and turn it into text or HTML. The C# statements are prefixed with the `@` symbol.

The view rendered by the `Index` action of the `TodoController` needs to take the data in the view model (an array of to-do items) and display it as a nice table for the user. By convention, views are placed in the `Views` directory, in a subdirectory corresponding to the controller name. The file name of the view is the name of the action with a `cshtml` extension.

**Views/Todo/Index.cshtml**

```razor
@model TodoViewModel;

@{
    ViewData["Title"] = "Manage your todo list";
}

<h2>@ViewData["Title"]</h2>

<table class="table table-hover">
    <thead>
        <tr>
            <td>Done?</td>
            <td>Item</td>
            <td>Due</td>
        </tr>
    </thead>
    
    @foreach (var item in Model.Items)
    {
        <tr>
            <td class="done-cell"><input type="checkbox" name="@item.Id" value="true" class="done-checkbox"></td>
            <td>@item.Title</td>
            <td>@item.DueAt</td>
        </tr>
    }
</table>
```

At the very top of the file, the `@model` directive tells Razor which model to expect this view to be bound to. The model is accessed through the `Model` property.

Assuming there are any to-do items in `Model.Items`, the `foreach` statement will loop over each to-do item and render a table row (`<tr>` element) containing the item's name and due date. A checkbox is also rendered that contains the item's ID, which you'll use later to mark the item as completed.

## The layout file
You might be wondering where the rest of the HTML is: what about the `<body>` tag, or the header and footer of the page? ASP.NET Core uses a layout view that defines the base structure that the rest of the views are rendered inside of. It's stored in `Views/Shared/_Layout.cshtml`.

The default ASP.NET Core template includes Bootstrap and jQuery in this layout file, so you can quickly create a web application. Of course, you can use your own frontend CSS and JavaScript libraries as you like.

!TODO: update layout to look nice

ASP.NET Core and Razor can do much more, such as partial views and server-rendered view components, but a simple layout and view is all you need for now. The official ASP.NET Core documentation (at `docs.asp.net`) has a plethora of examples you can look at.
# Add a service class
You've created a model, a view, and a controller. Before you wire up the model and view to the controller, you also need to write code that will get the user's to-do items from a database.

You could write this database code directly in the controller, but it's a better practice to keep all the database code in a separate class called a **service**. This helps keep the controller as lightweight as possible, and makes it easier to test and change the database code later. (Separating your application logic into one layer that handles database access and another layer that handles presenting a view is sometimes called a layered, 3-tier, or n-tier architecture.)

.NET and C# include the concept of **interfaces**, where the definition of an object's methods and properties is separate from the class that implements those methods and properties. Interfaces make it easy to keep your classes decoupled and easy to test, as you'll see here (and later in the chapter on testing).

First, create an interface that will represent the service that can interact with to-do items in the database. By convention, interfaces are prefixed with "I". Create a `Services` directory and a new file:

**Services/ITodoItemService.cs**

```csharp
using System;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public interface ITodoItemService
    {
        Task<TodoItem[]> GetIncompleteItemsAsync();
    }
}
```

Note that the namespace of this file is `AspNetCoreTodo.Services`. Namespaces are a way to organize .NET code files, and it's customary for the namespace to follow the directory the file is stored in (`AspNetCoreTodo.Models` for files in the `Models` directory, and so on).

Because this file (in the `AspNetCoreTodo.Services` directory) references the `TodoItem` class (in the `AspNetCoreTodo.Models` directory), it needs to include the `using AspNetCoreTodo.Models` statement at the top of the file to import that namespace. Without the `using` statement, you'll see an error like

> The type or namespace name 'TodoItem' could not be found (are you missing a using directive or an assembly reference?

Since this is an interface, there isn't any actual code here, just the definition of the `GetIncompleteItemsAsync` method. This method returns a `Task<TodoItem[]>`, instead of just a `TodoItem[]`. The `Task` type is similar to a future or a promise, and it's used here because this method will be **asynchronous**. (More on this later.)

Now that the interface is defined, you're ready to create the actual service class. I'll cover database code in depth in chapter 5, so for now you'll just fake it and return hard-coded values:

**Services/FakeTodoItemService.cs**

```csharp
using System;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public class FakeTodoItemService : ITodoItemService
    {
        public Task<TodoItem[]> GetIncompleteItemsAsync()
        {
            var items = new[]
            {
                new TodoItem
                {
                    Title = "Learn ASP.NET Core",
                    DueAt = DateTimeOffset.Now.AddDays(1)
                },
                new TodoItem
                {
                    Title = "Build awesome apps",
                    DueAt = DateTimeOffset.Now.AddDays(2)
                }
            };

            return Task.FromResult(items);
        }
    }
}
```

The `FakeTodoItemService` implements the `ITodoItemService` interface but always returns the same two `TodoItem`s. You'll use this to test the controller and view, and then add real database code in chapter 5.
# Use dependency injection
Back in the `TodoController`, add code to work with the `ITodoItemService`:

```csharp
    public class TodoController : Controller
    {
        private readonly ITodoItemService _todoItemService;

        public TodoController(ITodoItemService todoItemService)
        {
            _todoItemService = todoItemService;
        }

        public IActionResult Index()
        {
            // Get to-do items from database

            // Put items into a model

            // Pass the view to a model and render
        }
    }
```

Since `ITodoItemService` is in the `Services` namespace, you'll also need to add a `using` statement at the top:

```csharp
using AspNetCoreTodo.Services;
```

The first line of the class declares a private variable to hold a reference to the `ITodoItemService`. This variable lets you use the service from the action method later.

The `public TodoController(ITodoItemService todoItemService)` line defines a constructor for the class. The constructor runs once when the class is first initialized, and you've now declared that the `TodoController` class will need an `ITodoItemService`. Because you are "injecting" the `ITodoItemService` via the controller's constructor, this is sometimes called **constructor injection**.

> Sidebar: Interfaces are awesome because they help decouple (separate) the logic of your application. Since the controller depends on the `ITodoItemService` interface, and not on any *specific* service class, it doesn't know or care which class it's actually given. It could be the `FakeTodoItemService`, one that talks to a live database, or something else! As long as it fits the interface, the controller doesn't care. This makes it really easy to test parts of your application separately. (I'll cover testing more in chapter 8.)

Now you can finally use the `ITodoItemService` in your action method to get to-do items from the service layer:

```csharp
var todoItems = await _todoItemService.GetIncompleteItemsAsync();
```

Remember that the `GetIncompleteItemsAsync` method returned a `Task<TodoItem[]>` (a `TodoItem` array wrapped inside a `Task`)? Returning a `Task` means that the method won't necessarily have a result right away, but you can use the `await` keyword to make sure your code waits until the result is ready before continuing on.

> Sidebar: The `Task` pattern is common when your code calls a database or an API service, because it won't be able to return a real result until the database (or network) responds. If you've used promises or callbacks in JavaScript or other languages, `Task` is the same idea: the promise that there will be a result sometime later.

> Dealing with `Tasks` in .NET is much easier than JavaScript callbacks (and the "callback hell" that sometimes results), because of the magic of the `await` keyword. `await` lets your code pause on an async operation, and then pick up where it left off when the underlying database or network request finishes. In the meantime, your application isn't stuck or blocked, because it can process other requests as needed.

The only catch is that you need to update the `Index` method signature to return a `Task<IActionResult>` instead of just `IActionResult`, and mark it as `async`:

```csharp
        public async Task<IActionResult> Index()
        {
            var todoItems = await _todoItemService.GetIncompleteItemsAsync();

            // Put items into a model

            // Pass the view to a model and render
        }
```

You're almost there! You've made the `TodoController` depend on the `ITodoItemService` interface, but you haven't yet told ASP.NET Core that you want the `FakeTodoItemService` to be the implementation that's used under the hood. It might seem obvious right now since you only have one class that implements `ITodoItemService`, but later you'll have multiple classes, so being explicit is necessary.

Declaring (or "wiring up") which concrete class to use for each service interface is done in the `ConfigureServices` method of the `Startup` class. Right now, it looks like this:

**Startup.cs**

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc();
}
```

Add a new line anywhere inside the method that tells ASP.NET Core to use the `FakeTodoItemService` for the `ITodoItemService` interface:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddScoped<ITodoItemService, FakeTodoItemService>();

    services.AddMvc();
}
```

You'll need to add a `using AspNetCoreTodo.Models` statement at the top, like you did in the controller file.

`AddScoped` adds your service to the collection of available services using the **scoped** lifecycle. This means that a new instance of the `FakeTodoItemService` class will be created for each request. This is common for service classes that interact with a database (as you will a little later). You can also declare services as **singletons**, which means the class will be created only once when the application starts up.

That's it! When a request comes in and is routed to the `TodoController`, ASP.NET Core will look at the available services and automatically inject the `FakeTodoItemService` when the controller asks for an `ITodoItemService`. Because the services the controller depends on are injected automatically, this pattern is called **dependency injection**.
# Finish controller code
The last step is to finish the controller code. The controller has a list of to-do items from the service layer, and it needs to put those items into a `TodoViewModel` and then bind that model to the view you created earlier:

**Controllers/TodoController.cs**

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
# Test it out
To start the application, press F5 (if you're using Visual Studio or Visual Studio Code), or just run `dotnet run` in the terminal. If the code compiles without errors, the server will spin up on port 5000 by default.

Open up your web browser (if it didn't open automatically) and navigate to http://localhost:5000/todo. You'll see the view you created, with the data pulled from your fake database layer (for now):

!TODO: screenshot

Congratulations! You've built a working ASP.NET Core application. If you're using Visual Studio or Visual Studio Code, click to the left of a line in the controller to set a breakpoint and step through the code line-by-line to see how it executes.

Next, you'll take it further with third-party packages and real database code.
