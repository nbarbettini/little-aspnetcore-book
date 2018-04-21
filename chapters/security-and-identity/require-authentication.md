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
