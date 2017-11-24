## 集成测试

与单元测试相比，集成测试检验整个程序栈（路由、控制器、服务、数据库）。集成测试并不会隔离出一个类或组件，而是确保你程序的所有组件能够良好协作。

集成测试较慢，并且比单元测试涵盖的范围大，所以，一般来说，一个项目会有大量的单元测试内容，而集成测试的内容则屈指可数。

为了测试整个程序栈（包括控制器路由），集成测试往往像网络浏览器那样向程序发起 HTTP 请求。

为了编写那种发起 HTTP 请求的集成测试，你可以手动开启程序运行测试，向 `http://localhost:5000` 发起请求（并祈祷程序还在运行）。ASP.NET Core 提供了一个更好的方式来托管程序进行测试，就是：使用 `TestServer` 类。`TestServer` 能够在测试期间托管你的程序，并在测试结束之后自动关闭它。

### 创建一个测试项目

单元测试和集成测试可以放置在同一个项目里（没什么害处），但为了完整起见，我要教你为集成测试创建一个独立的项目。

如果你此刻位于项目目录，`cd` 到上一层的 `AspNetCoreTodo` 目录，使用以下命令搭建一个新项目:

```
mkdir AspNetCoreTodo.IntegrationTests
cd AspNetCoreTodo.IntegrationTests
dotnet new xunit
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

既然这个测试项目也要用到你主项目中的类，你需要添加一个引用指向主项目：

```
dotnet add reference ../AspNetCoreTodo/AspNetCoreTodo.csproj
```

你还需要添加 NuGet 包 `Microsoft.AspNetCore.TestHost` ：

```
dotnet add package Microsoft.AspNetCore.TestHost
```

删除 `dotnet new` 默认创建出来的文件 `UnitTest1.cs`，这样你就为编写集成测试准备就绪了。

### 编写集成测试

在每次集成测试执行之前，需要进行一些配置。为免配置相关的代码把测试代码弄的乱七八糟，你可以把配置相关的内容提取到一个独立的类里。创建一个名为 `TestFixture` 的类：

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

                    // 为 Facebook 中间件添加假的配置信息（以避免启动时报错）
                    configBuilder.AddInMemoryCollection(new Dictionary<string, string>()
                    {
                        ["Facebook:AppId"] = "fake-app-id",
                        ["Facebook:AppSecret"] = "fake-app-secret"
                    });
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

这个类被用于配置好一个 `TestServer`，并使测试代码干净利索。

> 如果你在 *安全和身份* 那章配置了 Facebook 登录，就有必要（在上面的 `ConfigureAppConfiguration` 代码块里）为 Facebook app ID 和 密码添加一些假值。这是因为测试服务器无法获取 Secrets Manager 中的信息。在这个框架类里添加假值能避免测试服务器启动时报错。

现在你（真的）可以开始编写集成测试了。创建一个名为  `TodoRouteShould` 的类：

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
            // 布置
            var request = new HttpRequestMessage(HttpMethod.Get, "/todo");

            // 执行: 向 /todo 发起请求
            var response = await _client.SendAsync(request);

            // 断言: 未登录用户应该被重定向到登录页面
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal("http://localhost:5000/Account/Login?ReturnUrl=%2Ftodo",
                        response.Headers.Location.ToString());
        }
    }
}
```

这个测试发起一个匿名(未登录)的请求到路径 `/todo`，并验证浏览器被重定向到了登录页面。

这是个很适合集成测试的使用场景，因为它涵盖了程序的多个组件：路由系统、控制器、控制器被标记了 `[Authorize]` 等等。这是个良好的测试，因为它确保你不会意外地弄丢了 `[Authorize]` 属性，从而导致待办事项视图对所有人可见。

在终端窗口运行 `dotnet test`，如果一切工作顺利，你会看到这样的成功信息：

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

## 本章总结

测试是个宽泛的话题，还有很多东西需要学习。本章节没有涉及 UI 测试，也没有对前端(JavaScript) 代码进行测试——它本身可能就需要一整本书去讲述。不过，你应该已经掌握了一些基本的技能和知识，可用于实践并学习更多相关测试程序的编写。

像以往一样，ASP.NET Core 文档（https://docs.asp.net）和 StackOverflow 都是用于了解更多知识以及遇到问题时查找答案的好资源。

---

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

                    // Add fake configuration for Facebook middleware (to avoid startup errors)
                    configBuilder.AddInMemoryCollection(new Dictionary<string, string>()
                    {
                        ["Facebook:AppId"] = "fake-app-id",
                        ["Facebook:AppSecret"] = "fake-app-secret"
                    });
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

> If you configured Facebook login in the *Security and identity* chapter., it's necessary to add fake values for the Facebook app ID and secret (in the `ConfigureAppConfiguration` block above). This is because the test server doesn't have access to the values in the Secrets Manager. Adding some fake values in this fixture class will prevent an error when the test server starts up.

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
