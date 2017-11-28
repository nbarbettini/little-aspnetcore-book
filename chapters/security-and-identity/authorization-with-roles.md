## 按角色进行授权

在网络应用里，使用角色处理 授权 和 许可 是个常见的方法。例如，你可能有一个 Administrator 角色，允许管理员们查看并管理应用里所有注册用户，而普通用户只能查看他们自己的信息。

### 添加用户管理页面

首先，创建一个新控制器：

**`Controllers/ManageUsersController.cs`**

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using AspNetCoreTodo.Models;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreTodo.Controllers
{
    [Authorize(Roles = "Administrator")]
    public class ManageUsersController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ManageUsersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var admins = await _userManager
                .GetUsersInRoleAsync("Administrator");

            var everyone = await _userManager.Users
                .ToArrayAsync();

            var model = new ManageUsersViewModel
            {
                Administrators = admins,
                Everyone = everyone
            };

            return View(model);
        }
    }
}
```

在 `[Authorize]` 属性里加入 `Roles` 字段，可以确保用户必须已经登录**并且**被分配了 `Administrator` 角色才能查看这个页面。

接下来，创建一个视图模型：

**`Models/ManageUsersViewModel.cs`**

```csharp
using System.Collections.Generic;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo
{
    public class ManageUsersViewModel
    {
        public IEnumerable<ApplicationUser> Administrators { get; set; }

        public IEnumerable<ApplicationUser> Everyone { get; set; }
    }
}
```

最后，为 action Index 创建一个视图：

**`Views/ManageUsers/Index.cshtml`**

```html
@model ManageUsersViewModel

@{
    ViewData["Title"] = "Manage users";
}

<h2>@ViewData["Title"]</h2>

<h3>Administrators</h3>

<table class="table">
    <thead>
        <tr>
            <td>Id</td>
            <td>Email</td>
        </tr>
    </thead>

    @foreach (var user in Model.Administrators)
    {
        <tr>
            <td>@user.Id</td>
            <td>@user.Email</td>
        </tr>
    }
</table>

<h3>Everyone</h3>

<table class="table">
    <thead>
        <tr>
            <td>Id</td>
            <td>Email</td>
        </tr>
    </thead>

    @foreach (var user in Model.Everyone)
    {
        <tr>
            <td>@user.Id</td>
            <td>@user.Email</td>
        </tr>
    }
</table>
```

启动程序，并试图以普通用户身份登录，去访问一下 `/ManageUsers` 路径。你会见到这样的 禁入 页面：

![Access denied error](access-denied.png)

这是因为注册用户不会自动获得 `Administrator` 这个角色。

### 创建一个测试用的管理员账号

出于显而易见的原因，注册页面不会有一个“我要注册为管理员”的复选框，因为这会导致任何注册用户都能轻易地成为管理员。相反，你可以在 `Startup` 类里添加一些代码，在程序初次启动的时候，创建一个测试管理账号。

在 `Configure` 方法的 `if (env.IsDevelopment())` 分支里添加这些内容：

**`Startup.cs`**

```csharp
if (env.IsDevelopment())
{
    // (... some code)

    // Make sure there's a test admin account
    EnsureRolesAsync(roleManager).Wait();
    EnsureTestAdminAsync(userManager).Wait();
}
```

`EnsureRolesAsync` 和 `EnsureTestAdminAsync` 方法会需要 `RoleManager` 和 `UserManager` 两个服务的访问能力。你可以在 `Configure` 注入它们，就像在控制器里注入任何其它服务那样：

```csharp
public void Configure(IApplicationBuilder app,
    IHostingEnvironment env,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager)
{
    // ...
}
```

在 `Configure` 方法的下面添加两个新方法，这是 `EnsureRolesAsync` 方法：

```csharp
private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
{
    var alreadyExists = await roleManager.RoleExistsAsync(Constants.AdministratorRole);

    if (alreadyExists) return;

    await roleManager.CreateAsync(new IdentityRole(Constants.AdministratorRole));
}
```

这个方法查看数据库里是否有一个 `Administrator` 角色。如果没有，它就创建一个。为免反复地输入字符串 `"Administrator"`，创建一个名为 `Constants` 的小类以保存它的值：

**`Constants.cs`**

```csharp
namespace AspNetCoreTodo
{
    public static class Constants
    {
        public const string AdministratorRole = "Administrator";
    }
}
```

> 如果你愿意，也可以修改之前创建的 `ManageUsersController` 使用这个常量值。

接下来是 `EnsureTestAdminAsync` 方法：

**`Startup.cs`**

```csharp
private static async Task EnsureTestAdminAsync(UserManager<ApplicationUser> userManager)
{
    var testAdmin = await userManager.Users
        .Where(x => x.UserName == "admin@todo.local")
        .SingleOrDefaultAsync();

    if (testAdmin != null) return;

    testAdmin = new ApplicationUser { UserName = "admin@todo.local", Email = "admin@todo.local" };
    await userManager.CreateAsync(testAdmin, "NotSecure123!!");
    await userManager.AddToRoleAsync(testAdmin, Constants.AdministratorRole);
}
```

如果数据库里没有一个用户名为 `admin@todo.local` 的用户，这个方法将创建它并给它一个临时的密码。在你初次登录之后，就应该出于安全考虑改掉这个密码。

> 因为是异步执行并返回一个 `Task`，`Configure` 方法中就必须使用 `Wait` 方法以确保等待它们执行完成，再执行后续的代码。你一般是用 `await` 做这件事，但是因为技术原因，你无法在 `Configure` 方法上使用 `await`。这是个罕见的例外 —— 所有其它地方你都应该用 `await`！

当你再次启动程序，`admin@todo.local` 这个账号会被创建并被赋予 `Administrator` 角色。请尝试用这个账号登录，并浏览位于 `http://localhost:5000/ManageUsers` 的页面，你将看到一个本程序所有注册用户的列表。

> 作为练习，请在这个页面添加更多管理功能特性。例如，添加一个按钮，给管理员提供“删除一个用户”的功能。

### 在视图里查看认证状态

`[Authorize]` 属性让控制器里执行认证操作变得很方便，但是如果你需要在视图里进行认证操作呢？比如，在导航条上为登入的管理员用户显示一个“管理用户”的链接。

你可以把 `UserManager` 直接注入到视图里来进行这些操作。为保持你视图整洁有序，创建一个新的局部视图(partial view)，用来在布局中的导航条添加一个项目：

**`Views/Shared/_AdminActionsPartial.cshtml`**

```html
@using Microsoft.AspNetCore.Identity
@using AspNetCoreTodo.Models

@inject SignInManager<ApplicationUser> SignInManager
@inject UserManager<ApplicationUser> UserManager

@if (SignInManager.IsSignedIn(User))
{
    var currentUser = await UserManager.GetUserAsync(User);

    var isAdmin = currentUser != null
        && await UserManager.IsInRoleAsync(currentUser, Constants.AdministratorRole);

    if (isAdmin) {
        <ul class="nav navbar-nav navbar-right">
            <li><a asp-controller="ManageUsers" asp-action="Index">Manage Users</a></li>
        </ul>
    }
}
```

**局部视图** 是一个视图的小片段，可以嵌入到另一个视图里。通常把局部视图的名字以 `_` 下划线开始，但这不是必须的。

这个局部视图首先使用 `SignInManager` 判断用户是否已经登录，如果没有，其余的代码就都被跳过。如果这 **是** 个已登录用户，`UserManager` 就被用于查找用户详细信息，并用 `IsInRoleAsync` 进行认证检查。如果所有检查都通过了，一个导航项就会被渲染出来。

要在主布局中包含这个局部视图，编辑 `_Layout.cshtml` 并在导航条部分添加：

**`Views/Shared/_Layout.cshtml`**

```html
<div class="navbar-collapse collapse">
    <ul class="nav navbar-nav">
        <li><a asp-area="" asp-controller="Home" asp-action="Index">Home</a></li>
        <li><a asp-area="" asp-controller="Home" asp-action="About">About</a></li>
        <li><a asp-area="" asp-controller="Home" asp-action="Contact">Contact</a></li>
    </ul>
    @await Html.PartialAsync("_LoginPartial")
    @await Html.PartialAsync("_AdminActionsPartial")
</div>
```

如果你用管理员账号登录，将在右上角见到一个新的导航项：

![Manage Users link](manage-users.png)

## 总结

ASP.NET Core Identity 是个强大的安全和身份系统，能为你添加认证和授权检查，并简化第三方身份提供商的接入。`dotnet new` 的模板提供了预设的视图和控制器，用于处理常见的诸如登录和注册这些情形，让你能更迅速地构建和运行程序。

ASP.NET Core Identity 还有很多功能，你可以在 https://docs.asp.net 了解更多文档和示例。

---

## Authorization with roles

Roles are a common approach to handling authorization and permissions in a web application. For example, you might have an Administrator role that allows admins to see and manage all the users registered for your app, while normal users can only see their own information.

### Add a Manage Users page

First, create a new controller:

**`Controllers/ManageUsersController.cs`**

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using AspNetCoreTodo.Models;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreTodo.Controllers
{
    [Authorize(Roles = "Administrator")]
    public class ManageUsersController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        
        public ManageUsersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var admins = await _userManager
                .GetUsersInRoleAsync("Administrator");

            var everyone = await _userManager.Users
                .ToArrayAsync();

            var model = new ManageUsersViewModel
            {
                Administrators = admins,
                Everyone = everyone
            };

            return View(model);
        }
    }
}
```

Setting the `Roles` property on the `[Authorize]` attribute will ensure that the user must be logged in **and** assigned the `Administrator` role in order to view the page.

Next, create a view model:

**`Models/ManageUsersViewModel.cs`**

```csharp
using System.Collections.Generic;
using AspNetCoreTodo.Models;

namespace AspNetCoreTodo
{
    public class ManageUsersViewModel
    {
        public IEnumerable<ApplicationUser> Administrators { get; set; }

        public IEnumerable<ApplicationUser> Everyone { get; set; }
    }
}
```

Finally, create a view for the Index action:

**`Views/ManageUsers/Index.cshtml`**

```html
@model ManageUsersViewModel

@{
    ViewData["Title"] = "Manage users";
}

<h2>@ViewData["Title"]</h2>

<h3>Administrators</h3>

<table class="table">
    <thead>
        <tr>
            <td>Id</td>
            <td>Email</td>
        </tr>
    </thead>
    
    @foreach (var user in Model.Administrators)
    {
        <tr>
            <td>@user.Id</td>
            <td>@user.Email</td>
        </tr>
    }
</table>

<h3>Everyone</h3>

<table class="table">
    <thead>
        <tr>
            <td>Id</td>
            <td>Email</td>
        </tr>
    </thead>
    
    @foreach (var user in Model.Everyone)
    {
        <tr>
            <td>@user.Id</td>
            <td>@user.Email</td>
        </tr>
    }
</table>
```

Start up the application and try to access the `/ManageUsers` route while logged in as a normal user. You'll see this access denied page:

![Access denied error](access-denied.png)

That's because users aren't assigned the `Administrator` role automatically.


### Create a test administrator account

For obvious security reasons, there isn't a checkbox on the registration page that makes it easy for anyone to create an administrator account. Instead, you can write some code in the `Startup` class that will create a test admin account the first time the application starts up.

Add this code to the `if (env.IsDevelopment())` branch of the `Configure` method:

**`Startup.cs`**

```csharp
if (env.IsDevelopment())
{
    // (... some code)

    // Make sure there's a test admin account
    EnsureRolesAsync(roleManager).Wait();
    EnsureTestAdminAsync(userManager).Wait();
}
```

The `EnsureRolesAsync` and `EnsureTestAdminAsync` methods will need access to the `RoleManager` and `UserManager` services. You can inject them into the `Configure` method, just like you inject any service into your controllers:

```csharp
public void Configure(IApplicationBuilder app,
    IHostingEnvironment env,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager)
{
    // ...
}
```

Add the two new methods below the `Configure` method. First, the `EnsureRolesAsync` method:

```csharp
private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
{
    var alreadyExists = await roleManager.RoleExistsAsync(Constants.AdministratorRole);
    
    if (alreadyExists) return;

    await roleManager.CreateAsync(new IdentityRole(Constants.AdministratorRole));
}
```

This method checks to see if an `Administrator` role exists in the database. If not, it creates one. Instead of repeatedly typing the string `"Administrator"`, create a small class called `Constants` to hold the value:

**`Constants.cs`**

```csharp
namespace AspNetCoreTodo
{
    public static class Constants
    {
        public const string AdministratorRole = "Administrator";
    }
}
```

> Feel free to update the `ManageUsersController` you created before to use this constant value as well.

Next, write the `EnsureTestAdminAsync` method:

**`Startup.cs`**

```csharp
private static async Task EnsureTestAdminAsync(UserManager<ApplicationUser> userManager)
{
    var testAdmin = await userManager.Users
        .Where(x => x.UserName == "admin@todo.local")
        .SingleOrDefaultAsync();

    if (testAdmin != null) return;

    testAdmin = new ApplicationUser { UserName = "admin@todo.local", Email = "admin@todo.local" };
    await userManager.CreateAsync(testAdmin, "NotSecure123!!");
    await userManager.AddToRoleAsync(testAdmin, Constants.AdministratorRole);
}
```

If there isn't already a user with the username `admin@todo.local` in the database, this method will create one and assign a temporary password. After you log in for the first time, you should change the account's password to something secure.

> Because these two methods are asynchronous and return a `Task`, the `Wait` method must be used in `Configure` to make sure they finish before `Configure` moves on. You'd normally use `await` for this, but for technical reasons you can't use `await` in `Configure`. This is a rare exception - you should use `await` everywhere else!

When you start the application next, the `admin@todo.local` account will be created and assigned the `Administrator` role. Try logging in with this account, and navigating to `http://localhost:5000/ManageUsers`. You'll see a list of all users registered for the application.

> As an extra challenge, try adding more administration features to this page. For example, you could add a button that gives an administrator the ability to delete a user account.

### Check for authorization in a view

The `[Authorize]` attribute makes it easy to perform an authorization check in a controller or action method, but what if you need to check authorization in a view? For example, it would be nice to display a "Manage users" link in the navigation bar if the logged-in user is an administrator.

You can inject the `UserManager` directly into a view to do these types of authorization checks. To keep your views clean and organized, create a new partial view that will add an item to the navbar in the layout:

**`Views/Shared/_AdminActionsPartial.cshtml`**

```html
@using Microsoft.AspNetCore.Identity
@using AspNetCoreTodo.Models

@inject SignInManager<ApplicationUser> SignInManager
@inject UserManager<ApplicationUser> UserManager

@if (SignInManager.IsSignedIn(User))
{
    var currentUser = await UserManager.GetUserAsync(User);

    var isAdmin = currentUser != null
        && await UserManager.IsInRoleAsync(currentUser, Constants.AdministratorRole);

    if (isAdmin) {
        <ul class="nav navbar-nav navbar-right">
            <li><a asp-controller="ManageUsers" asp-action="Index">Manage Users</a></li>
        </ul>
    }
}
```

A **partial view** is a small piece of a view that gets embedded into another view. It's common to name partial views starting with an `_` underscore, but it's not necessary.

This partial view first uses the `SignInManager` to quickly determine whether the user is logged in. If they aren't, the rest of the view code can be skipped. If there *is* a logged-in user, the `UserManager` is used to look up their details and perform an authorization check with `IsInRoleAsync`. If all checks succeed, a navbar item is rendered.

To include this partial in the main layout, edit `_Layout.cshtml` and add it in the navbar section:

**`Views/Shared/_Layout.cshtml`**

```html
<div class="navbar-collapse collapse">
    <ul class="nav navbar-nav">
        <li><a asp-area="" asp-controller="Home" asp-action="Index">Home</a></li>
        <li><a asp-area="" asp-controller="Home" asp-action="About">About</a></li>
        <li><a asp-area="" asp-controller="Home" asp-action="Contact">Contact</a></li>
    </ul>
    @await Html.PartialAsync("_LoginPartial")
    @await Html.PartialAsync("_AdminActionsPartial")
</div>
```

When you log in with an administrator account, you'll now see a new item on the top right:

![Manage Users link](manage-users.png)

## Wrap up

ASP.NET Core Identity is a powerful security and identity system that helps you add authentication and authorization checks, and makes it easy to integrate with external identity providers. The `dotnet new` templates give you pre-built views and controllers that handle common scenarios like login and registration so you can get up and running quickly.

There's much more that ASP.NET Core Identity can do. You can learn more in the documentation and examples available at https://docs.asp.net.
