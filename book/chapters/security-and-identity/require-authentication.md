## 提示认证

在用户访问你程序中某些特定内容时，你通常都会要求他们登录。比如说，把主页向所有人展示是合理的（不管你有没有登录），但只在登录之后才向你展示待办事项列表�
�ASP.NET Core 里，你可以使�`[Authorize]` 属性，要求用户在访问指定的 action 或整个控制器时，要事先登录过。要�`TodoController` 里的所�action 添加认证提示，在这个控制器的第一行上面添加这个属性：

```csharp
[Authorize]
public class TodoController : Controller
{
    // ...
}
```

在文件顶部添加这�`using` 语句�
```csharp
using Microsoft.AspNetCore.Authorization;
```

试着运行程序并在未登录的情况下访�`/todo`。你会被自动重定向到登录页面�
> 尽管属性的名字是授�Authorize)，我们在这里检查的其实是认�authorization)，而非检查授权，很抱歉会有这样的混淆�
---

## Require authentication

Often you'll want to require the user to log in before they can access certain parts of your application. For example, it makes sense to show the home page to everyone (whether you're logged in or not), but only show your to-do list after you've logged in.

You can use the `[Authorize]` attribute in ASP.NET Core to require a logged-in user for a particular action, or an entire controller. To require authentication for all actions of the `TodoController`, add the attribute above the first line of the controller:

**Controllers/TodoController.cs**

```csharp
[Authorize]
public class TodoController : Controller
{
    // ...
}
```

Add this `using` statement at the top of the file:

```csharp
using Microsoft.AspNetCore.Authorization;
```

Try running the application and accessing `/todo` without being logged in. You'll be redirected to the login page automatically.

> The `[Authorize]` attribute is actually doing an authentication check here, not an authorization check (despite the name of the attribute). Later, you'll use the attribute to check **both** authentication and authorization.
