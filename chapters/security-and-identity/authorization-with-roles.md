## Authorization with roles
Roles are a common approach to authorization in web application. For example, you might have an Administrator role that allows administrators to see and manage all the users registered for your app, while normal users can only see their own information.

> Sidebar: Authorization is asking the question: "Do I have permission to do this?" It's distinct from authentication, which deals with whether the user is known (registered) or anonymous (a visitor without an account).

When you wrote code to seed the database back in chapter 5, you created an administrator role and an admin account with that role. With that in place, you can create a new section of the site for administrators, and a policy that restricts it based on the current user's role.

### Add a Manage Users page

First, create a new controller:

**Controllers/ManageUsersController.cs**

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
    [Authorize(Roles = Constants.AdministratorRole)]
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
                .GetUsersInRoleAsync(Constants.AdministratorRole);

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

Setting the `Roles` property on the `[Authorize]` attribute will ensure that the user must be logged in **and** have the Administrator role in order to view the page.

Next, create a view model:

**Models/ManageUsersViewModel.cs**

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

**Views/ManageUsers/Index.cshtml**

```razor
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

Start up the application and try to access the `/ManageUsers` route as a normal user. You'll see this access denied page:

!TODO: screenshot

Then, log in with the administrator account. You'll see the list of users registered for the app.

> Sidebar: Try adding more administration features to this page. For example, you could add a button that gives an administrator the ability to disable a user account.

### Check for authorization in a view

The `[Authorize]` attribute makes it easy to perform an authorization check in a controller or action method, but what if you need to check authorization in a view? For example, it would be nice to display a Manage Users link in the navbar if the logged-in user is an Administrator.

You can inject the `UserManager` directly into a view to do these authorization checks. To keep your views clean and organized, create a new partial view that will add an item to the navbar in the layout:

**Views/Shared/_AdminActionsPartial.cshtml**

```razor
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

This partial first uses the `SignInManager` to quickly determine whether the user is logged in. If they aren't, the code can end early. If there is a logged-in user, the `UserManager` is used to look up their details and perform an authorization check with `IsInRoleAsync`. If all checks succeed, a navbar item is rendered.

To include this partial in the main layout, edit `Views/Shared_Layout.cshtml` and add it in the navbar section:

```razor
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

!TODO: screenshot
## Wrap up
ASP.NET Core Identity is a powerful security and identity system that helps you add authentication and authorization checks, and makes it easy to integrate with external identity providers. The `dotnet new` templates give you pre-built views and controllers that handle common scenarios like login and registration so you can get up and running quickly.

There's much more that ASP.NET Core Identity can do. You can learn more in the documentation and examples available at https://docs.asp.net.
