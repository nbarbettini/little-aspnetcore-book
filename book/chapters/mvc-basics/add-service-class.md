## 添加一个服务类

你已经创建了一个模型、一个视图、一个控制器。在你把模型和视图应用于控制器中之前，需要先写点代码，用它把用户的待办事项条目从数据库里取出来。

你可以在直接在控制器里编写这段数据库相关的代码，但是作为更良好的实践，应该保持你的代码独立。为什么呢？在一个巨大的，现实世界的程序里，你不得不应付一些事情：

* **渲染视图** 并处理接收的数据：你的控制器已经处理好了。
* **执行业务逻辑**，或者说跟你程序的目标和“业务”相关联的代码与逻辑。在一个待办事项列表程序里，业务逻辑意味着“为新任务设置一个默认的截止时间”，或者“仅显示未完成的任务”这些决策。业务逻辑的其它例子，包括“基于产品价格和税率计算总价”，或者“在游戏里检查一个玩家是否有足够的经验值升级”。
* **存入和取出**数据库中的数据。

还是那句话，把所有这些东西写进一个单独的巨大的控制器是可行的，但这很快就会变得难以管理和测试。相反，常见的程序都把这些分割成两个、三个或更多的“层”或级，每个层级处理（且仅处理）一件事情。这有助于保持控制器尽量简单，并简化测试工作，以及后续的业务逻辑和数据库代码的修改。

把程序以这种方式分割，有时被称为 **多级** 或者 **n级架构**。在某些情况下，这些层级被隔离在完全分离的项目中，也有时候这仅仅意味着各个类之间组织和调用的方式。重点在于考量如何把你的程序分割成多个可管理的部分，以避免控制器或者某些臃肿的类试图去处理所有事情。

对当前这个项目而言，你将把程序分为两个层：一个由控制器和视图构成的 **表示层**，用来处理用户的交互，和一个包含了业务逻辑和数据库代码的 **服务层**。表示层已经有了，所以，接下来就应该构建一个服务，用来处理 待办事项 的业务逻辑，并把待办事项条目保存到数据库里去。

> 多数较大的项目使用一种 3级 架构：一个表示层，一个逻辑服务层，一个数据仓储层。**仓储(repository)** 是一个仅关注数据库操作（不处理业务逻辑）的类。咱们眼下的程序里，为简化操作，我们将把这些混进一个服务层里，不过你尽可尝试采用不同的方式去架构你的代码。

### 创建一个接口

C# 编程语言里有一个概念叫 **接口（interface）**，在接口中，一个对象中方法和属性的定义与实际包含这些方法和属性的类分离开来。接口有助于解耦你的那些类，也有助于测试，如你接下来（以及在后续的 *自动化测试* 章节中）所见。你将用一个接口来表示一个服务，该服务负责就待办事项条目事宜与数据库交互。

习惯上，接口以大写字母“I”开头，在 Services 目录下新建一个文件：

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

注意一下，这个文件的命名空间是 `AspNetCoreTodo.Services`。命名空间是一种组织 .NET 代码文件的方式，一般与存放该文件的目录名保持一致（`Services`目录下的文件，命名空间是`AspNetCoreTodo.Services`，以此类推）。

因为这个文件（在命名空间`AspNetCoreTodo.Services`中）引用了 `TodoItem` 类（在命名空间 `AspNetCoreTodo.Models`中），它需要在文件顶部包含一条 `using` 语句，引入那个命名空间。如果不写这个 `using` 语句，你会看到这样的报错：

```txt
The type or namespace name 'TodoItem' could not be found (are you missing a using directive or an assembly reference?)
```

因为这是一个接口，所以不包含任何实现相关的代码，只有 `GetIncompleteItemsAsync` 方法的定义（或者叫 **方法签名(method signature)**）。该方法不需要任何参数，并且返回一个 `Task<TodoItem[]>`。

> 如果这种语法让你看上去感到困惑，就这么理解：“一个 Task 里面装着一个 TodoItem 的数组”。

`Task` 类型类似于一个 future 或者 promise[^1]，这里使用它的原因是，这将是个 **异步的(asynchronous)** 方法。换句话说，这个方法可能不会即时返回待办事项的列表，因为它需要先查询数据库。（详情见后续章节。）

### 创建服务类

现在接口已经定义好，你可开始创建具体的服务类了。在后续的 *使用数据库* 那章，我会深入讲解有关数据库的代码，但目前你可以造个假，直接返回硬编码的值：

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
