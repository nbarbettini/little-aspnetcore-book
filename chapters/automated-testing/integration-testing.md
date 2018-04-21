## Integration testing

Compared to unit tests, integration tests are much larger in scope. exercise the whole application stack. Instead of isolating one class or method, integration tests ensure that all of the components of your application are working together properly: routing, controllers, services, database code, and so on.

Integration tests are slower and more involved than unit tests, so it's common for a project to have lots of small unit tests but only a handful of integration tests.

In order to test the whole stack (including controller routing), integration tests typically make HTTP calls to your application just like a web browser would.

To write integration tests that make HTTP requests, you could manually start your application and tests at the same time, and write your tests to make requests to `http://localhost:5000`. ASP.NET Core provides a nicer way to host your application for testing, however: the `TestServer` class. `TestServer` can host your application for the duration of the test, and then stop it automatically when the test is complete.

### Create a test project

If you're currently in your project directory, `cd` up one level to the root `AspNetCoreTodo` directory. Use these commands to scaffold a new test project:

```
mkdir AspNetCoreTodo.IntegrationTests
cd AspNetCoreTodo.IntegrationTests
dotnet new xunit
```

Your directory structure should now look like this:

```
AspNetCoreTodo/
    AspNetCoreTodo/
        AspNetCoreTodo.csproj
        Controllers/
        (etc...)

    AspNetCoreTodo.UnitTests/
        AspNetCoreTodo.UnitTests.csproj

    AspNetCoreTodo.IntegrationTests/
        AspNetCoreTodo.IntegrationTests.csproj
```

> If you prefer, you canh keep your unit tests and integration tests in the same project. For large projects, it's common to split them up so it's easy to run them separately.

Since the test project will use the classes defined in your main project, you'll need to add a reference to the main project:

```
dotnet add reference ../AspNetCoreTodo/AspNetCoreTodo.csproj
```

You'll also need to add the `Microsoft.AspNetCore.TestHost` NuGet package:

```
dotnet add package Microsoft.AspNetCore.TestHost
```

Delete the `UnitTest1.cs` file that's created by `dotnet new`. You're ready to write an integration test.

### Write an integration test

There are a few things that need to be configured on the test server before each test. Instead of cluttering the test with this setup code, you can keep this setup in a separate class. Create a new class called `TestFixture`:

**AspNetCoreTodo.IntegrationTests/TestFixture.cs**

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;

namespace AspNetCoreTodo.IntegrationTests
{
    public class TestFixture : IDisposable  
    {
        private readonly TestServer _server;

        public HttpClient Client { get; }

        public TestFixture()
        {
            var builder = new WebHostBuilder()
                .UseStartup<AspNetCoreTodo.Startup>()
                .ConfigureAppConfiguration((context, config) =>
                {
                    config.SetBasePath(Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "..\\..\\..\\..\\AspNetCoreTodo"));
                    
                    config.AddJsonFile("appsettings.json");
                });

            _server = new TestServer(builder);

            Client = _server.CreateClient();
            Client.BaseAddress = new Uri("http://localhost:8888");
        }

        public void Dispose()
        {
            Client.Dispose();
            _server.Dispose();
        }
    }
}
```

This class takes care of setting up a `TestServer`, and will help keep the tests themselves clean and tidy.

Now you're (really) ready to write an integration test. Create a new class called `TodoRouteShould`:

**AspNetCoreTodo.IntegrationTests/TodoRouteShould.cs**

```csharp
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace AspNetCoreTodo.IntegrationTests
{
    public class TodoRouteShould : IClassFixture<TestFixture>
    {
        private readonly HttpClient _client;

        public TodoRouteShould(TestFixture fixture)
        {
            _client = fixture.Client;
        }

        [Fact]
        public async Task ChallengeAnonymousUser()
        {
            // Arrange
            var request = new HttpRequestMessage(
                HttpMethod.Get, "/todo");

            // Act: request the /todo route
            var response = await _client.SendAsync(request);

            // Assert: the user is sent to the login page
            Assert.Equal(
                HttpStatusCode.Redirect,
                response.StatusCode);
            Assert.Equal(
                "http://localhost:8888/Account/Login?ReturnUrl=%2Ftodo",
                response.Headers.Location.ToString());
        }
    }
}
```

This test makes an anonymous (not-logged-in) request to the `/todo` route and verifies that the browser is redirected to the login page.

This scenario is a good candidate for an integration test, because it involves multiple components of the application: the routing system, the controller, the fact that the controller is marked with `[Authorize]`, and so on. It's also a good test because it ensures you won't ever accidentally remove the `[Authorize]` attribute and make the to-do view accessible to everyone.

## Run the test

Run the test in the terminal with `dotnet test`. If everything's working right, you'll see a success message:

```
Starting test execution, please wait...
 Discovering: AspNetCoreTodo.IntegrationTests
 Discovered:  AspNetCoreTodo.IntegrationTests
 Starting:    AspNetCoreTodo.IntegrationTests
 Finished:    AspNetCoreTodo.IntegrationTests

Total tests: 1. Passed: 1. Failed: 0. Skipped: 0.
Test Run Successful.
Test execution time: 2.0588 Seconds
```


## Wrap up

Testing is a broad topic, and there's much more to learn. This chapter doesn't touch on UI testing or testing frontend (JavaScript) code, which probably deserve entire books of their own. You should, however, have the skills and base knowledge you need to learn more about testing and to practice writing tests for your own applications.

The ASP.NET Core documentation (https://docs.asp.net) and Stack Overflow are great resources for learning more and finding answers when you get stuck.
