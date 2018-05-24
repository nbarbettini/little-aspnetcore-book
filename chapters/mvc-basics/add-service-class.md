## 添加一个服务类

你已经创建了一个模型、一个视图、一个控制器。在你把模型和视图应用于控制器中之前，应该先写点代码，把用户的待办事项条目从数据库里取出来。

你可以在控制器里直接写操作数据库的代码，但是更好的习惯是：把所有访问数据库的代码都置于一个单独的，称为 **服务(service)** 的类里面。这样，能尽量地保持控制器简单，还便于以后测试和修改数据库相关的代码。

> 如果把程序按照逻辑，分出一个层处理数据库访问，另一个层处理视图呈现，这种结构有时候被称为分层的、3层的、或者n层的架构。

.NET 和 C# 中有个 **接口(interfaces)** 的概念，可以把对象的方法、属性的定义与事实上包含这些方法、属性源码的实现类区分开来。接口便于你的类之间解耦，也便于其测试，你将见诸于后续章节（*自动化测试* 那章）。

首先，创建一个代表服务的接口，该服务用来与数据库中的待办事项条目交互。习惯上，接口以字母“I”开头，在 Services 目录下新建一个文件：

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

注意一下，这个文件的命名空间是 `AspNetCoreTodo.Services`。命名空间是一种组织 .Net 代码文件的方式，一般与存放该文件的目录名保持一致（`Services`目录下的文件，命名空间是`AspNetCoreTodo.Services`，以此类推）。

因为这个文件（在命名空间`AspNetCoreTodo.Services`中）引用了 `TodoItem` 类（在命名空间 `AspNetCoreTodo.Models`中），它需要在文件顶部包含一条 `using` 语句，引入那个命名空间。如果不写这个 `using` 语句，你会看到这样的报错：

```txt
The type or namespace name 'TodoItem' could not be found (are you missing a using directive or an assembly reference?)
```

因为这是一个接口，所以不包含任何实现相关的代码，只有 `GetIncompleteItemsAsync` 方法的定义（或者叫 **方法签名(method signature)**）。该方法不需要任何参数，并且返回一个 `Task<IEnumerable<TodoItem>>`。

> 如果对这种语法看上去感到困惑，就这么理解：“一个 Task 里面装着一个 TodoItem 的列表”。

`Task` 类型类似于一个 future 或者 promise[^1]，这里使用它的原因是，这将是个 **异步的(asynchronous)** 方法。换句话说，这个方法可能不会即时返回待办事项的列表，因为它需要先查询数据库。（详情见后续章节。）

现在接口已经定义，你可开始创建具体的服务类了。在后续的 *使用数据库* 那章，我会深入讲解有关数据库的代码，但目前你可以造个假，直接返回硬编码的值：

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
            // 返回一个 TodoItems 的数组
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

`FakeTodoItemService` 实现了 `ITodoItemService` 接口，但总是返回这个包含两个 `TodoItem` 的数组。你可以用它去测试控制器和视图，然后在 *使用数据库* 那章添加真正的代码去访问数据库。

[^1]: 译者注：二者都是其它语言中，与异步编程相关的概念，它们是用于指代某个尚未就绪的值的对象。而这个值，往往是某个计算过程的结果。要了解详细，请参考 https://en.wikipedia.org/wiki/Futures_and_promises

---

## Add a service class
You've created a model, a view, and a controller. Before you use the model and view in the controller, you also need to write code that will get the user's to-do items from a database.

You could write this database code directly in the controller, but it's a better practice to keep your code separate. Why? In a big, real-world application, you'll have to juggle many concerns:

* **Rendering views** and handling incoming data: this is what your controller already does.
* **Performing business logic**, or code and logic that's related to the purpose and "business" of your application. In a to-do list application, business logic means decisions like setting a default due date on new tasks, or only displaying tasks that are incomplete. Other examples of business logic include calculating a total cost based on product prices and tax rates, or checking whether a player has enough points to level up in a game.
* **Saving and retrieving** items from a database.

Again, it's possible to do all of these things in a single, massive controller, but that quickly becomes too hard to manage and test. Instead, it's common to see applications split up into two, three, or more "layers" or tiers that each handle one (and only one) concern. This helps keep the controllers as simple as possible, and makes it easier to test and change the business logic and database code later.

Separating your application this way is sometimes called a **multi-tier** or **n-tier architecture**. In some cases, the tiers (layers) are isolated in completely separate projects, but other times it just refers to how the classes are organized and used. The important thing is thinking about how to split your application into manageable pieces, and avoid having controllers or bloated classes that try to do everything.

For this project, you'll use two application layers: a **presentation layer** made up of the controllers and views that interact with the user, and a **service layer** that contains business logic and database code. The presentation layer already exists, so the next step is to build a service that handles to-do business logic and saves to-do items to a database.

> Most larger projects use a 3-tier architecture: a presentation layer, a service logic layer, and a data repository layer. A **repository** is a class that's only focused on database code (no business logic). In this application, you'll combine these into a single service layer for simplicity, but feel free to experiment with different ways of architecting the code.

### Create an interface

The C# language includes the concept of **interfaces**, where the definition of an object's methods and properties is separate from the class that actually contains the code for those methods and properties. Interfaces make it easy to keep your classes decoupled and easy to test, as you'll see here (and later in the *Automated testing* chapter). You'll use an interface to represent the service that can interact with to-do items in the database.

By convention, interfaces are prefixed with "I". Create a new file in the Services directory:

**Services/ITodoItemService.cs**

```csharp
using System;
using System.Collections.Generic;
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

Note that the namespace of this file is `AspNetCoreTodo.Services`. Namespaces are a way to organize .NET code files, and it's customary for the namespace to follow the directory the file is stored in (`AspNetCoreTodo.Services` for files in the `Services` directory, and so on).

Because this file (in the `AspNetCoreTodo.Services` namespace) references the `TodoItem` class (in the `AspNetCoreTodo.Models` namespace), it needs to include a `using` statement at the top of the file to import that namespace. Without the `using` statement, you'll see an error like:

```
The type or namespace name 'TodoItem' could not be found (are you missing a using directive or an assembly reference?)
```

Since this is an interface, there isn't any actual code here, just the definition (or **method signature**) of the `GetIncompleteItemsAsync` method. This method requires no parameters and returns a `Task<TodoItem[]>`.

> If this syntax looks confusing, think: "a Task that contains an array of TodoItems".

The `Task` type is similar to a future or a promise, and it's used here because this method will be **asynchronous**. In other words, the method may not be able to return the list of to-do items right away because it needs to go talk to the database first. (More on this later.)

### Create the service class

Now that the interface is defined, you're ready to create the actual service class. I'll cover database code in depth in the *Use a database* chapter, so for now you'll just fake it and always return two hard-coded items:

**Services/FakeTodoItemService.cs**

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo.Services
{
    public class FakeTodoItemService : ITodoItemService
    {
        public Task<TodoItem[]> GetIncompleteItemsAsync()
        {
            var item1 = new TodoItem
            {
                Title = "Learn ASP.NET Core",
                DueAt = DateTimeOffset.Now.AddDays(1)
            };

            var item2 = new TodoItem
            {
                Title = "Build awesome apps",
                DueAt = DateTimeOffset.Now.AddDays(2)
            };

            return Task.FromResult(new[] { item1, item2 });
        }
    }
}
```

This `FakeTodoItemService` implements the `ITodoItemService` interface but always returns the same array of two `TodoItem`s. You'll use this to test the controller and view, and then add real database code in *Use a database*.
