## 集成测试

与单元测试相比，集成测试在范围上大得多。它检验整个程序栈。集成测试并不会把一个类或组件隔离出来，而是确保你程序的所有组件协作良好，这些组件包括：路由、控制器、服务、数据库访问等等。

与单元测试相比，集成测试较慢，并且涵盖的范围较大，所以，一般来说，一个项目会有大量的单元测试内容，而集成测试的内容则屈指可数。

为了测试整个程序栈（包括控制器路由），集成测试往往像网络浏览器那样向程序发起 HTTP 请求。

要执行一个集成测试，你也可以启动程序，并手动向`http://localhost:5000`发起请求。不过，ASP.NET Core 提供了一个上佳的替代品：`TestServer` 类。这个类能够在测试期间托管你的程序，并在测试完成之后自动关闭它。

### 创建一个测试项目

如果你此刻位于项目目录，`cd` 到上一层的 `AspNetCoreTodo` 目录，使用以下命令搭建一个新项目:

```
dotnet new xunit -o AspNetCoreTodo.IntegrationTests
```

你现在的目录结构看起来应该是这样：

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

> 如果你愿意，可以把单元测试和集成测试放置在同一个项目里。对大型项目而言，通常会把它们分开，以便于它们各自独立运行。

既然这个测试项目要用到主项目中的类，你需要添加一个引用指向主项目：

```
dotnet add reference ../AspNetCoreTodo/AspNetCoreTodo.csproj
```

还需要添加 NuGet 包 `Microsoft.AspNetCore.TestHost`：

```
dotnet add package Microsoft.AspNetCore.TestHost
```

删除 `dotnet new` 默认创建的文件 `UnitTest1.cs`，这样你就为集成测试的编写准备就绪了。

### 编写集成测试

在每次集成测试执行之前，需要进行一些配置。为免配置相关的代码把测试代码弄的乱七八糟，你可以把配置相关的内容提取到一个独立的类里。创建一个名为 `TestFixture` 的类：

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

这个类配置好了一个 `TestServer`，并使测试代码干净利索。

现在你（真的）可以开始编写集成测试了。创建一个名为 `TodoRouteShould` 的类：

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
                "http://localhost:8888/Account" +
                "/Login?ReturnUrl=%2Ftodo",
                response.Headers.Location.ToString());
        }
    }
}
```

这个测试发起一个匿名(未登录)的请求到路径 `/todo`，并验证浏览器被重定向到了登录页面。

这是个很适合集成测试的使用场景，因为它涵盖了程序的多个组件：路由系统、控制器、控制器被标记了 `[Authorize]` 等等。这是个良好的测试点，因为它确保你不会意外地弄丢了 `[Authorize]` 属性，从而导致待办事项视图对所有人可见。

在终端窗口运行 `dotnet test`，如果一切工作顺利，你会看到这样的成功信息：

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

## 本章总结

测试是个宽泛的话题，还有很多东西需要学习。本章节没有涉及 UI 测试，也没有对前端(JavaScript)代码进行测试——它本身可能就需要一整本书去讲述。不过，你应该已经掌握了一些基本的技能和知识，可用于实践并学习更多相关测试程序的编写。

像以往一样，ASP.NET Core 文档（https://docs.asp.net）和 StackOverflow 都是用于了解更多知识以及遇到问题时查找答案的好资源。

---

## Integration testing

Compared to unit tests, integration tests are much larger in scope. exercise the whole application stack. Instead of isolating one class or method, integration tests ensure that all of the components of your application are working together properly: routing, controllers, services, database code, and so on.

Integration tests are slower and more involved than unit tests, so it's common for a project to have lots of small unit tests but only a handful of integration tests.

In order to test the whole stack (including controller routing), integration tests typically make HTTP calls to your application just like a web browser would.

To perform an integration test, you could start your application and manually make requests to http://localhost:5000. However, ASP.NET Core provides a better alternative: the `TestServer` class. This class can host your application for the duration of the test, and then stop it automatically when the test is complete.

### Create a test project

If you're currently in your project directory, `cd` up one level to the root `AspNetCoreTodo` directory. Use this command to scaffold a new test project:

```
dotnet new xunit -o AspNetCoreTodo.IntegrationTests
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

> If you prefer, you can keep your unit tests and integration tests in the same project. For large projects, it's common to split them up so it's easy to run them separately.

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
                "http://localhost:8888/Account" +
                "/Login?ReturnUrl=%2Ftodo",
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
