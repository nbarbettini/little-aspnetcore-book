## Unit testing
Unit tests are small, quick tests that check the behavior of a single method or chunk of logic. Instead of testing a whole group of classes, or the entire system (as integration tests do), unit tests rely on **mocking** or replacing the objects the class-under-test depends on.

For example, the `TodoController` depends on two objects: an `ITodoItemService` and the `UserManager`. The `EfCoreTodoItemService`, in turn, depends on the `ApplicationDbContext`. (The idea that you can draw a line from `TodoController` -> `EfCoreTodoItemService` -> `ApplicationDbContext` is called a *dependency graph*).

When the application runs normally, the ASP.NET Core dependency injection system injects the right instances of each of those objects into the dependency graph when the `TodoController` or the `EfCoreTodoItemService` is created. When you write a unit test, on the other hand, you'll manually inject mock or test-only versions of those dependencies. This means you can isolate just the logic in the class you are testing. (If you're testing a service, you don't want to also be accidentally writing to your database!)

### Create a test project

It's a common practice to create a separate project for your tests, to keep things clean and organized. The new test project should live in a directory that's next to (not inside) your main project's directory.

If you're currently in your project directory, `cd` up one level. (This directory should also be called `AspNetCoreTodo`). Then use these commands to scaffold a new test project:

```bash
mkdir AspNetCoreTodo.UnitTests
cd AspNetCoreTodo.UnitTests
dotnet new xunit
```

> Sidebar: Xunit is a popular test framework for .NET code that can be used to write both unit and integration tests.

Your directory structure should now look like this:

```
AspNetCoreTodo/
    AspNetCoreTodo/
        AspNetCoreTodo.csproj
        Controllers/
        (etc)

    AspNetCoreTodo.UnitTests/
        AspNetCoreTodo.UnitTests.csproj
```

Since the test project will use the classes defined in your main project, you'll need to add a reference to the main project:

```bash
dotnet add reference ../AspNetCoreTodo/AspNetCoreTodo.csproj
```

Delete the `UnitTest1.cs` file that's automatically created. You're ready to write your first test.

### Write a service test

Take a look at the logic in the `AddItem` method of the `EfCoreTodoItemService`:

```csharp
public async Task<bool> AddItem(NewTodoItem newItem, ApplicationUser user)
{
    var entity = new TodoItem
    {
        Id = Guid.NewGuid(),
        Owner = user,
        IsDone = false,
        Title = newItem.Title,
        DueAt = DateTimeOffset.Now.AddDays(3)
    };

    _context.Items.Add(entity);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

This method makes a number of decisions about the new item before it actually saves it to the database:

* New items should always be incomplete (`IsDone = false)
* The title of the new item should be copied from `newItem.Title`
* New items should always be due 3 days from now

> Sidebar: These types of decisions made by your code is called *business logic*, because it's logic that relates to the purpose or "business" of your application. Other examples of business logic include things like calculating a total cost based on product prices and tax rates, or checking whether a player has enough points to level up in a game.

These decisions make sense, and it makes sense to have a test that ensures that this logic doesn't change down the road. (Imagine if you or someone else refactored the `AddItem` method and forgot about one of these decisions. It might be unlikely when your services are simple, but it becomes important to have automated checks as your application becomes more complicated.)

To write a unit test that will verify the logic in the `EfCoreTodoItemService`, create a new class in your test project:

**EfCoreTodoItemServiceShould.cs**

```csharp
using System.Threading.Tasks;
using AspNetCoreTodo.Data;
using AspNetCoreTodo.Models;
using AspNetCoreTodo.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AspNetCoreTodo.UnitTests
{
    public class EfCoreTodoItemServiceShould
    {
        [Fact]
        public async Task AddNewItem()
        {
            // …
        }
    }
}
```

> Sidebar: There are many different ways of naming and organizing tests, all with different pros and cons. I like postfixing my test classes with `Should` to create a readable sentence with the test method name, but feel free to use your own style!

The `EfCoreTodoItemService` requires an `ApplicationDbContext`, which is normally connected to your development or live database. You won't want to use that for tests. Instead, Entity Framework Core provides an in-memory database provider you can use in your test code. Since the entire database exists in memory, it's wiped out every time the test is restarted. And, since it's a proper Entity Framework Core provider, your service code won't know the difference.

Use a `DbContextOptionsBuilder` to configure the in-memory database provider, and then make a call to `AddItem`:

```csharp
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseInMemoryDatabase(databaseName: "Test_AddNewItem")
    .Options;

// Set up a context (connection to the DB) for writing
using (var context = new ApplicationDbContext(options))
{
    var service = new EfCoreTodoItemService(context);
    await service.AddItem(new NewTodoItem { Title = "Testing?" }, null);
}
```

The last line creates a new to-do item called `Testing?`, and the service will save it to the in-memory database. To verify that the business logic ran correctly, retrieve the item:

```csharp
// Use a separate context to read the data back from the DB
using (var context = new ApplicationDbContext(options))
{
    Assert.Equal(1, await context.Items.CountAsync());
    
    var item = await context.Items.FirstAsync();
    Assert.Equal("Testing?", item.Title);
    Assert.Equal(false, item.IsDone);
    Assert.True(DateTimeOffset.Now.AddDays(3) - item.DueAt < TimeSpan.FromSeconds(1));
}
```

The first verification step is a sanity check: there should never be more than one item saved to the in-memory database. Assuming that's true, the test retrieves the saved item with `FirstAsync` and then asserts that the properties are set to the expected values.

Asserting a datetime value is a little tricky, since comparing two dates for equality will fail if even the millisecond components are different. Instead, the test checks that the `DueAt` value is less than a second away from the expected value.

> Sidebar: Both unit and integration tests typically follow the AAA (Arrange-Act-Assert) pattern: objects and data are set up first, then some action is performed, and finally the test checks (asserts) that the expected behavior occurred.

As an extra-credit challenge, try writing unit tests that ensure:

* `MarkDone` returns false if it's passed an ID that doesn't exist
* `MarkDone` returns true when it makes a valid item as complete
* `GetIncompleteItemsAsync` returns only the items owned by a particular user
