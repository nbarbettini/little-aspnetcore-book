## Update the layout

The layout file at `Views/Shared/_Layout.cshtml` contains the "base" HTML for each view. This includes the navbar, which is rendered at the top of each page.

To add a new item to the navbar, find the HTML code for the existing navbar items:

**Views/Shared/_Layout.cshtml**

```html
<ul class="nav navbar-nav">
    <li><a asp-area="" asp-controller="Home" asp-action="Index">
        Home
    </a></li>
    <li><a asp-area="" asp-controller="Home" asp-action="About">
        About
    </a></li>
    <li><a asp-area="" asp-controller="Home" asp-action="Contact">
        Contact
    </a></li>
</ul>
```

Add your own item that points to the `Todo` controller instead of `Home`:

```html
<li>
    <a asp-controller="Todo" asp-action="Index">My to-dos</a>
</li>
```

The `asp-controller` and `asp-action` attributes on the `<a>` element are called **tag helpers**. Before the view is rendered, ASP.NET Core replaces these tag helpers with real HTML attributes. In this case, a URL to the `/Todo/Index` route is generated and added to the `<a>` element as an `href` attribute. This means you don't have to hard-code the route to the `TodoController`. Instead, ASP.NET Core generates it for you automatically.

> If you've used Razor in ASP.NET 4.x, you'll notice some syntax changes. Instead of using `@Html.ActionLink()` to generate a link to an action, tag helpers are now the recommended way to create links in your views. Tag helpers are useful for forms, too (you'll see why in a later chapter). You can learn about other tag helpers in the documentation at https://docs.asp.net.
