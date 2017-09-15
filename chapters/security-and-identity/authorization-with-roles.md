## Authorization with roles

Roles are a common approach to handling authorization and permissions in a web application. For example, you might have an Administrator role that allows admins to see and manage all the users registered for your app, while normal users can only see their own information.

### Add a Manage Users page

First, create a new controller:

##### `Controllers/ManageUsersController.cs`

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

##### `Models/ManageUsersViewModel.cs`

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

##### `Views/ManageUsers/Index.cshtml`

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

##### `Startup.cs`

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

##### `Constants.cs`

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

##### `Startup.cs`

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

##### `Views/Shared/_AdminActionsPartial.cshtml`

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

##### `Views/Shared/_Layout.cshtml`

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
