## Integration testing

Compared to unit tests, integration tests exercise the whole application stack (routing, controllers, services, database). Instead of isolating one class or component, integration tests ensure that all of the components of your application are working together properly.

Integration tests are slower and more involved than unit tests, so it's common for a project to have lots of unit tests but only a handful of integration tests.

In order to test the whole stack (including controller routing), integration tests typically make HTTP calls to your application just like a web browser would.

To write integration tests that make HTTP requests, you could manually start your application run tests that make requests to `http://localhost:5000` (and hope the app is still running). ASP.NET Core provides a nicer way to host your application for testing, however: using the `TestServer` class. `TestServer` can host your application for the duration of the test, and then stop it automatically when the test is complete.

### Create a test project

You could keep your unit tests and integration tests in the same project (feel free to do so), but for the sake of completeness, I'll show you how to create a separate project for your integration tests.

If you're currently in your project directory, `cd` up one level to the base `AspNetCoreTodo` directory. Use these commands to scaffold a new test project:

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

There are a few things that need to be configured on the test server before each test. Instead of cluttering the test with this setup code, you can factor out this setup to a separate class. Create a new class called `TestFixture`:

**`AspNetCoreTodo.IntegrationTests/TestFixture.cs`**

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

        public TestFixture()
        {
            var builder = new WebHostBuilder()
                .UseStartup<AspNetCoreTodo.Startup>()
                .ConfigureAppConfiguration((context, configBuilder) =>
                {
                    configBuilder.SetBasePath(Path.Combine(
                        Directory.GetCurrentDirectory(), "..\\..\\..\\..\\AspNetCoreTodo"));

                    configBuilder.AddJsonFile("appsettings.json");
                });
            _server = new TestServer(builder);

            Client = _server.CreateClient();
            Client.BaseAddress = new Uri("http://localhost:5000");
        }

        public HttpClient Client { get; }

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

**`AspNetCoreTodo.IntegrationTests/TodoRouteShould.cs`**

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
            var request = new HttpRequestMessage(HttpMethod.Get, "/todo");

            // Act: request the /todo route
            var response = await _client.SendAsync(request);

            // Assert: anonymous user is redirected to the login page
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal("http://localhost:5000/Account/Login?ReturnUrl=%2Ftodo",
                        response.Headers.Location.ToString());
        }
    }
}
```

This test makes an anonymous (not-logged-in) request to the `/todo` route and verifies that the browser is redirected to the login page.

This scenario is a good candidate for an integration test, because it involves multiple components of the application: the routing system, the controller, the fact that the controller is marked with `[Authorize]`, and so on. It's also a good test because it ensures you won't ever accidentally remove the `[Authorize]` attribute and make the to-do view accessible to everyone.

Run the test in the terminal with `dotnet test`. If everything's working right, you'll see a success message:

```
Starting test execution, please wait...
[xUnit.net 00:00:00.7237031]   Discovering: AspNetCoreTodo.IntegrationTests
[xUnit.net 00:00:00.8118035]   Discovered:  AspNetCoreTodo.IntegrationTests
[xUnit.net 00:00:00.8779059]   Starting:    AspNetCoreTodo.IntegrationTests
[xUnit.net 00:00:01.5828576]   Finished:    AspNetCoreTodo.IntegrationTests

Total tests: 1. Passed: 1. Failed: 0. Skipped: 0.
Test Run Successful.
Test execution time: 2.0588 Seconds
```


## Wrap up

Testing is a broad topic, and there's much more to learn. This chapter doesn't touch on UI testing or testing frontend (JavaScript) code, which probably deserve entire books of their own. You should, however, have the skills and base knowledge you need to practice and learn more about writing tests for your own applications.

As always, the ASP.NET Core documentation (https://docs.asp.net) and StackOverflow are good resources for learning more and finding answers when you get stuck.
