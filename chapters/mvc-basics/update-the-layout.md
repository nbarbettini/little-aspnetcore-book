## 修改布局

位于 `Views/Shared/_Layout.cshtml` 的布局文件里面存放着所有视图的“基础”HTML。其中就包括导航栏，它被显示在每个页面的顶端。

为了向导航栏添加新条目，请先找到原有导航栏的 HTML 代码：

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

添加你的条目，不要指向 `Home` 控制器，而要改为指向 `Todo`:

```html
<li>
    <a asp-controller="Todo" asp-action="Index">My to-dos</a>
</li>
```

`<a>` 元素中的属性 `asp-controller` 和 `asp-action` 被称为 **tag helper**。在视图被渲染之前，ASP.NET Core 会把这些 tag helper 替换成真正的 HTML 属性。在本例中，会生成一个指向路由 `/Todo/Index` 的 URL 并作为 `href` 添加到 `<a>` 元素中。这意味着你不必硬编码这个指向 `TodoController` 的路由。而是 ASP.NET Core 自动为你生成。

> 如果你在 ASP.NET 4.x 中用过 Razor，应该会注意到一些语法的差异。生成一个指向 action 链接的时候，tag helper 是现在的建议的方式，而不是使用 `@Html.ActionLink()`。tag helper 对表单也很有用（你会在后续章节明白原委）。要学习其它的 tag helper，可以参考位于 https://docs.asp.net 的文档。

---

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
