## 添加一个服务类

你已经创建了一个模型、一个视图、一个控制器。在你把模型和视图应用于控制器中之前，应该先写点代码，把用户的待办事项条目从数据库里拿出来。

你可以在控制器里直接写操作数据库的代码，但是更好的习惯是把所有访问数据库的代码都置于一个单独的，称为 **服务(service)** 的类里面。这可以尽可能的保持控制器简单，并在后续便于测试和修改数据库相关的代码。

> 如果你把的应用程序按照逻辑，分出一个层处理数据库访问，另一个层处理视图呈现，有时候被称为分层的、3层的、或者n层的架构。

.NET 和 C# 中有个 **接口(interfaces)** 的概念，可以把对象的方法、属性的定义与事实上实现了这些方法、属性源码的类区分开来。接口便于使你的类之间解耦，也便于其测试，你将见诸于后续章节（*自动化测试* 那章）。

You've created a model, a view, and a controller. Before you use the model and view in the controller, you also need to write code that will get the user's to-do items from a database.

You could write this database code directly in the controller, but it's a better practice to keep all the database code in a separate class called a **service**. This helps keep the controller as simple as possible, and makes it easier to test and change the database code later.

> Separating your application logic into one layer that handles database access and another layer that handles presenting a view is sometimes called a layered, 3-tier, or n-tier architecture.

.NET and C# include the concept of **interfaces**, where the definition of an object's methods and properties is separate from the class that actually contains the code for those methods and properties. Interfaces make it easy to keep your classes decoupled and easy to test, as you'll see here (and later in the *Automated testing* chapter).

First, create an interface that will represent the service that can interact with to-do items in the database. By convention, interfaces are prefixed with "I". Create a new file in the Services directory:

**`Services/ITodoItemService.cs`**

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public interface ITodoItemService
    {
        Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync();
    }
}
```

Note that the namespace of this file is `AspNetCoreTodo.Services`. Namespaces are a way to organize .NET code files, and it's customary for the namespace to follow the directory the file is stored in (`AspNetCoreTodo.Services` for files in the `Services` directory, and so on).

Because this file (in the `AspNetCoreTodo.Services` namespace) references the `TodoItem` class (in the `AspNetCoreTodo.Models` namespace), it needs to include a `using` statement at the top of the file to import that namespace. Without the `using` statement, you'll see an error like:

```
The type or namespace name 'TodoItem' could not be found (are you missing a using directive or an assembly reference?)
```

Since this is an interface, there isn't any actual code here, just the definition of the `GetIncompleteItemsAsync` method. This method returns a `Task<IEnumerable<TodoItem>>`, instead of just an `IEnumerable<TodoItem>`.

> If this syntax looks confusing, think, "a Task that contains a list that contains TodoItems".

The `Task` type is similar to a future or a promise, and it's used here because this method will be **asynchronous**. In other words, the method may not be able to return the list of to-do items right away because it needs to go talk to the database first. (More on this later.)

Now that the interface is defined, you're ready to create the actual service class. I'll cover database code in depth in the *Use a database* chapter, but for now you'll just fake it and return hard-coded values:

**`Services/FakeTodoItemService.cs`**

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public class FakeTodoItemService : ITodoItemService
    {
        public Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync()
        {
            // Return an array of TodoItems
            IEnumerable<TodoItem> items = new[]
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

This `FakeTodoItemService` implements the `ITodoItemService` interface but always returns the same array of two `TodoItem`s. You'll use this to test the controller and view, and then add real database code in *Use a database*.

---

## Add a service class
You've created a model, a view, and a controller. Before you use the model and view in the controller, you also need to write code that will get the user's to-do items from a database.

You could write this database code directly in the controller, but it's a better practice to keep all the database code in a separate class called a **service**. This helps keep the controller as simple as possible, and makes it easier to test and change the database code later.

> Separating your application logic into one layer that handles database access and another layer that handles presenting a view is sometimes called a layered, 3-tier, or n-tier architecture.

.NET and C# include the concept of **interfaces**, where the definition of an object's methods and properties is separate from the class that actually contains the code for those methods and properties. Interfaces make it easy to keep your classes decoupled and easy to test, as you'll see here (and later in the *Automated testing* chapter).

First, create an interface that will represent the service that can interact with to-do items in the database. By convention, interfaces are prefixed with "I". Create a new file in the Services directory:

**`Services/ITodoItemService.cs`**

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public interface ITodoItemService
    {
        Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync();
    }
}
```

Note that the namespace of this file is `AspNetCoreTodo.Services`. Namespaces are a way to organize .NET code files, and it's customary for the namespace to follow the directory the file is stored in (`AspNetCoreTodo.Services` for files in the `Services` directory, and so on).

Because this file (in the `AspNetCoreTodo.Services` namespace) references the `TodoItem` class (in the `AspNetCoreTodo.Models` namespace), it needs to include a `using` statement at the top of the file to import that namespace. Without the `using` statement, you'll see an error like:

```
The type or namespace name 'TodoItem' could not be found (are you missing a using directive or an assembly reference?)
```

Since this is an interface, there isn't any actual code here, just the definition of the `GetIncompleteItemsAsync` method. This method returns a `Task<IEnumerable<TodoItem>>`, instead of just an `IEnumerable<TodoItem>`.

> If this syntax looks confusing, think, "a Task that contains a list that contains TodoItems".

The `Task` type is similar to a future or a promise, and it's used here because this method will be **asynchronous**. In other words, the method may not be able to return the list of to-do items right away because it needs to go talk to the database first. (More on this later.)

Now that the interface is defined, you're ready to create the actual service class. I'll cover database code in depth in the *Use a database* chapter, but for now you'll just fake it and return hard-coded values:

**`Services/FakeTodoItemService.cs`**

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public class FakeTodoItemService : ITodoItemService
    {
        public Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync()
        {
            // Return an array of TodoItems
            IEnumerable<TodoItem> items = new[]
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

This `FakeTodoItemService` implements the `ITodoItemService` interface but always returns the same array of two `TodoItem`s. You'll use this to test the controller and view, and then add real database code in *Use a database*.
