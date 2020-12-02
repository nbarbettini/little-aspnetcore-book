## 单元测试

单元测试是短小的测试，检查单个方法或类的行为。当你测试的代码依赖其它方法或类时，单元测试依赖于 **虚构(mocking)** 出来的其它类，以便在一个时时刻专注在一个点上。

例如，`TodoController` 有两个依赖： `ITodoItemService` 和 `UserManager`。`TodoItemService` 接下来又依赖于 `ApplicationDbContext`。（你可以画一条线表示 `TodoController` > `TodoItemService` > `ApplicationDbContext`，这种方式被称为 **依赖图**）。

当程序运转正常的时候， ASP.NET Core 的服务容器和依赖注入系统在 `TodoController` 或者 `TodoItemService` 被创建时，把这些对象逐一地注入到依赖图里。

另一方面，当你写单元测试的时候，你需要自己处理这个依赖图。典刑的做法是，提供这些依赖的 虚构 或者 测试专用 版本。这意味着你可以把正在测试的类或者方法的逻辑隔离出来。（这很重要！如果你在测试一个服务，显然不应该一失手 **顺带** 写到数据库里去。）

### 创建一个测试项目

为测试创建独立的项目是一个良好的实践，以便把它们和你的程序代码分离开。新的测试项目应该被置于你主项目的同级目录（而非在主项目目录内）。

如果你当前在你项目目录里，向上 `cd` 一层。（这个目录也叫做 `AspNetCoreTodo`）。然后使用以下命令搭建出一个新的测试项目：

```
dotnet new xunit -o AspNetCoreTodo.UnitTests
```

xUnit.NET 是一个常用的针对 .NET 代码的测试框架，可用于编写单元和集成测试。像其它组件一样，它也是一组NuGet 包，可被安装在任意项目中 。`dotnet new xunit` 已经包括了你所需的一切。

你的目录结构看起来应该是这样：

```
AspNetCoreTodo/
    AspNetCoreTodo/
        AspNetCoreTodo.csproj
        Controllers/
        (etc...)

    AspNetCoreTodo.UnitTests/
        AspNetCoreTodo.UnitTests.csproj
```

既然测试项目要使用你主项目中的类，你需要添加一个引用指向主项目：

```
dotnet add reference ../AspNetCoreTodo/AspNetCoreTodo.csproj
```

删除自动创建的文件 `UnitTest1.cs`。你已经为第一个测试的编写准备就绪了。

> 如果你用的是 Visual Studio Code，你可能需要关闭并重新打开 Visual Studio  Code 窗口，以便代码完成功能在新项目里生效。

### 写一个服务测试

看一下 `TodoItemService` 里面的 `AddItemAsync()` 方法：

```csharp
public async Task<bool> AddItemAsync(
    TodoItem newItem, ApplicationUser user)
{
    newItem.Id = Guid.NewGuid();
    newItem.IsDone = false;
    newItem.DueAt = DateTimeOffset.Now.AddDays(3);
    newItem.UserId = user.Id;

    _context.Items.Add(newItem);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

该方法在把新条目真正存入数据库之前，做了多个判断与假设（换句话说，在新条目上执行了业务逻辑）：

* `UserId` 属性应该被设置为用户的 ID
* 新条目应该总是未完成状态（`IsDone = false`）
* 新条目的标题应该复制自 `newItem.Title`
* 新条目应该总是从现在开始3天后过期

设想一下，如果你或者其他什么人重构了这个 `AddItemAsync()` 方法，并遗漏了某些以上的业务逻辑。你程序的行为，会在你意识不到的情况下变掉！你有办法避免这个情况，方法是编写一个测试，用以复核这些业务逻辑并未发生变化（就算是该方法的内部实现已经发生了变化）。

> 这种情形——你意识不到自己改变了业务逻辑，虽然现在看起来好像不会发生，但是在一个更大更复杂的项目中，这会因为各种决策和假设而变得难以追踪。在越大的项目中，确保业务逻辑稳定的自动化检查就越重要。

要编写一个单元测试来检验 `TodoItemService` 中的逻辑，在你的测试项目中创建一个新类：

**AspNetCoreTodo.UnitTests/TodoItemServiceShould.cs**

```csharp
using System;
using System.Threading.Tasks;
using AspNetCoreTodo.Data;
using AspNetCoreTodo.Models;
using AspNetCoreTodo.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AspNetCoreTodo.UnitTests
{
    public class TodoItemServiceShould
    {
        [Fact]
        public async Task AddNewItemAsIncompleteWithDueDate()
        {
            // ...
        }
    }
}
```

> 有很多不同的方法可以命名和组织测试，它们都有着各自的优缺点。我喜欢给测试类加上 `Should` 前缀，使方法名构成一个可读性良好的句子，不过你可以按自己的意愿选择命名风格。

`[Fact]` 属性是 xUnit.NET 包里带来的，它把这个方法标记为一个测试方法。

`TodoItemService` 需要一个 `ApplicationDbContext`，后者通常连接到你的开发或生产环境里的数据库。你不该把这些数据库用于测试。相反，你可以在测试代码里使用 Entity Framework Core 的内存数据库 provider。因为整个数据库都存在于内存里，每次测试重新开始的时候，他就会被清空。并且，因为这是个合乎规格的 Entity Framework Core 的 provider，`TodoItemService` 不会察觉有什么异样。

用一个 `DbContextOptionsBuilder` 来配置内存数据库的 provider，然后对 `AddItemAsync()` 发起一个调用：

```csharp
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseInMemoryDatabase(databaseName: "Test_AddNewItem").Options;

// Set up a context (connection to the "DB") for writing
using (var context = new ApplicationDbContext(options))
{
    var service = new TodoItemService(context);

    var fakeUser = new ApplicationUser
    {
        Id = "fake-000",
        UserName = "fake@example.com"
    };

    await service.AddItemAsync(new TodoItem
    {
        Title = "Testing?"
    }, fakeUser);
}
```

最后一行创建了一个新的名为 `Testing?` 的待办事项，并通知服务将其存储到（内存）数据库里。

为验证业务逻辑执行的正确性，请在原有的 `using` 代码块下编写新内容：

```csharp
// Use a separate context to read data back from the "DB"
using (var context = new ApplicationDbContext(options))
{
    var itemsInDatabase = await context
        .Items.CountAsync();
    Assert.Equal(1, itemsInDatabase);

    var item = await context.Items.FirstAsync();
    Assert.Equal("Testing?", item.Title);
    Assert.Equal(false, item.IsDone);

    // Item should be due 3 days from now (give or take a second)
    var difference = DateTimeOffset.Now.AddDays(3) - item.DueAt;
    Assert.True(difference < TimeSpan.FromSeconds(1));
}
```

第一个验证步骤是个明智的检查：内存数据库里保存的条目绝不会超过一条。假设这个检查通过了，测试会使用 `FirstAsync` 方法取出存储的条目，然后断言其中的属性被设置了预期的值。

> 不论是单元测试还是集成测试，都遵循 AAA（布置-执行-断言——Arrange-Act-Assert）模式：对象和数据首先被建立出来，然后执行一些动作，最后测试程序检查（断言）预期表现的存在。

断言一个日期时间值有点棘手，因为比较两个日期值的时候，就算是只有毫秒部分不同，两个值也是不等的。替代方案是，检查 `DueAt` 的值距离期望值小于一秒。

### 运行测试

在终端窗口，运行以下命令（请确保你位于 `AspNetCoreTodo.UnitTests` 目录）：

```
dotnet test
```

`test` 命令在当前的项目里查找测试方法（本例中，由 `[Fact]` 属性标记出来），然后运行它找到的所有测试，你会看到类似这样的输出：

```
Starting test execution, please wait...
 Discovering: AspNetCoreTodo.UnitTests
 Discovered:  AspNetCoreTodo.UnitTests
 Starting:    AspNetCoreTodo.UnitTests
 Finished:    AspNetCoreTodo.UnitTests

Total tests: 1. Passed: 1. Failed: 0. Skipped: 0.
Test Run Successful.
Test execution time: 1.9074 Seconds
```

你现在有了测试程序，覆盖了 `TodoItemService` 的测试范围。作为一个补充练习，请写出单元测试以确保：

* 如果传入一个不存在的 ID， `MarkDoneAsync()` 返回 false
* 当一个有效的条目被标记为完成状态， `MarkDoneAsync()` 返回 true
* `GetIncompleteItemsAsync()` 只返回某个特定用户的条目

---

## Unit testing

Unit tests are small, short tests that check the behavior of a single method or class. When the code you're testing relies on other methods or classes, unit tests rely on **mocking** those other classes so that the test only focuses on one thing at a time.

For example, the `TodoController` class has two dependencies: an `ITodoItemService` and the `UserManager`. The `TodoItemService`, in turn, depends on the `ApplicationDbContext`. (The idea that you can draw a line from `TodoController` > `TodoItemService` > `ApplicationDbContext` is called a **dependency graph**).

When the application runs normally, the ASP.NET Core service container and dependency injection system injects each of those objects into the dependency graph when the `TodoController` or the `TodoItemService` is created.

When you write a unit test, on the other hand, you have to handle the dependency graph yourself. It's typical to provide test-only or "mocked" versions of those dependencies. This means you can isolate just the logic in the class or method you are testing. (This is important! If you're testing a service, you don't want to **also** be accidentally writing to your database.)

### Create a test project

It's a best practice to create a separate project for your tests, so they are kept separate from your application code. The new test project should live in a directory that's next to (not inside) your main project's directory.

If you're currently in your project directory, `cd` up one level. (This root directory will also be called `AspNetCoreTodo`). Then use this command to scaffold a new test project:

```
dotnet new xunit -o AspNetCoreTodo.UnitTests
```

xUnit.NET is a popular test framework for .NET code that can be used to write both unit and integration tests. Like everything else, it's a set of NuGet packages that can be installed in any project. The `dotnet new xunit` template already includes everything you need.

Your directory structure should now look like this:

```
AspNetCoreTodo/
    AspNetCoreTodo/
        AspNetCoreTodo.csproj
        Controllers/
        (etc...)

    AspNetCoreTodo.UnitTests/
        AspNetCoreTodo.UnitTests.csproj
```

Since the test project will use the classes defined in your main project, you'll need to add a reference to the `AspNetCoreTodo` project:

```
dotnet add reference ../AspNetCoreTodo/AspNetCoreTodo.csproj
```

Delete the `UnitTest1.cs` file that's automatically created. You're ready to write your first test.

> If you're using Visual Studio Code, you may need to close and reopen the Visual Studio Code window to get code completion working in the new project.

### Write a service test

Take a look at the logic in the `AddItemAsync()` method of the `TodoItemService`:

```csharp
public async Task<bool> AddItemAsync(
    TodoItem newItem, ApplicationUser user)
{
    newItem.Id = Guid.NewGuid();
    newItem.IsDone = false;
    newItem.DueAt = DateTimeOffset.Now.AddDays(3);
    newItem.UserId = user.Id;

    _context.Items.Add(newItem);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

This method makes a number of decisions or assumptions about the new item (in other words, performs business logic on the new item) before it actually saves it to the database:

* The `UserId` property should be set to the user's ID
* New items should always be incomplete (`IsDone = false`)
* The title of the new item should be copied from `newItem.Title`
* New items should always be due 3 days from now

Imagine if you or someone else refactored the `AddItemAsync()` method and forgot about part of this business logic. The behavior of your application could change without you realizing it! You can prevent this by writing a test that double-checks that this business logic hasn't changed (even if the method's internal implementation changes).

> It might seem unlikely now that you could introduce a change in business logic without realizing it, but it becomes much harder to keep track of decisions and assumptions in a large, complex project. The larger your project is, the more important it is to have automated checks that make sure nothing has changed!

To write a unit test that will verify the logic in the `TodoItemService`, create a new class in your test project:

**AspNetCoreTodo.UnitTests/TodoItemServiceShould.cs**

```csharp
using System;
using System.Threading.Tasks;
using AspNetCoreTodo.Data;
using AspNetCoreTodo.Models;
using AspNetCoreTodo.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AspNetCoreTodo.UnitTests
{
    public class TodoItemServiceShould
    {
        [Fact]
        public async Task AddNewItemAsIncompleteWithDueDate()
        {
            // ...
        }
    }
}
```

> There are many different ways of naming and organizing tests, all with different pros and cons. I like postfixing my test classes with `Should` to create a readable sentence with the test method name, but feel free to use your own style!

The `[Fact]` attribute comes from the xUnit.NET package, and it marks this method as a test method.

The `TodoItemService` requires an `ApplicationDbContext`, which is normally connected to your database. You won't want to use that for tests. Instead, you can use Entity Framework Core's in-memory database provider in your test code. Since the entire database exists in memory, it's wiped out every time the test is restarted. And, since it's a proper Entity Framework Core provider, the `TodoItemService` won't know the difference!

Use a `DbContextOptionsBuilder` to configure the in-memory database provider, and then make a call to `AddItemAsync()`:

```csharp
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseInMemoryDatabase(databaseName: "Test_AddNewItem").Options;

// Set up a context (connection to the "DB") for writing
using (var context = new ApplicationDbContext(options))
{
    var service = new TodoItemService(context);

    var fakeUser = new ApplicationUser
    {
        Id = "fake-000",
        UserName = "fake@example.com"
    };

    await service.AddItemAsync(new TodoItem
    {
        Title = "Testing?"
    }, fakeUser);
}
```

The last line creates a new to-do item called `Testing?`, and tells the service to save it to the (in-memory) database.

To verify that the business logic ran correctly, write some more code below the existing `using` block:

```csharp
// Use a separate context to read data back from the "DB"
using (var context = new ApplicationDbContext(options))
{
    var itemsInDatabase = await context
        .Items.CountAsync();
    Assert.Equal(1, itemsInDatabase);
    
    var item = await context.Items.FirstAsync();
    Assert.Equal("Testing?", item.Title);
    Assert.Equal(false, item.IsDone);

    // Item should be due 3 days from now (give or take a second)
    var difference = DateTimeOffset.Now.AddDays(3) - item.DueAt;
    Assert.True(difference < TimeSpan.FromSeconds(1));
}
```

The first assertion is a sanity check: there should never be more than one item saved to the in-memory database. Assuming that's true, the test retrieves the saved item with `FirstAsync` and then asserts that the properties are set to the expected values.

> Both unit and integration tests typically follow the AAA (Arrange-Act-Assert) pattern: objects and data are set up first, then some action is performed, and finally the test checks (asserts) that the expected behavior occurred.

Asserting a datetime value is a little tricky, since comparing two dates for equality will fail if even the millisecond components are different. Instead, the test checks that the `DueAt` value is less than a second away from the expected value.

### Run the test

On the terminal, run this command (make sure you're still in the `AspNetCoreTodo.UnitTests` directory):

```
dotnet test
```

The `test` command scans the current project for tests (marked with `[Fact]` attributes in this case), and runs all the tests it finds. You'll see output similar to:

```
Starting test execution, please wait...
 Discovering: AspNetCoreTodo.UnitTests
 Discovered:  AspNetCoreTodo.UnitTests
 Starting:    AspNetCoreTodo.UnitTests
 Finished:    AspNetCoreTodo.UnitTests

Total tests: 1. Passed: 1. Failed: 0. Skipped: 0.
Test Run Successful.
Test execution time: 1.9074 Seconds
```

You now have one test providing test coverage of the `TodoItemService`. As an extra challenge, try writing unit tests that ensure:

* The `MarkDoneAsync()` method returns false if it's passed an ID that doesn't exist
* The `MarkDoneAsync()` method returns true when it makes a valid item as complete
* The `GetIncompleteItemsAsync()` method returns only the items owned by a particular user
