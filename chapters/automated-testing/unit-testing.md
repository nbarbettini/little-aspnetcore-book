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

Since the test project will use the classes defined in your main project, you'll need to add a reference to the `AspNetCoreTodo` project.

Use `cd` to navigate to the newly-created AspNetCoreTodo.UnitTests project directory, and type:

```
dotnet add reference ..\AspNetCoreTodo\AspNetCoreTodo.csproj
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
using AspNetCoreTodo.Data;
using AspNetCoreTodo.Models;
using AspNetCoreTodo.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
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
