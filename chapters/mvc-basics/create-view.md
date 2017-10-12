## 创建视图

ASP.NET Core 里的视图使用 Razor 模板语言编写，这种模板语言混杂了 HTML 和 C# 的代码。（如果你在 JavaScript 下用 Jade、Pug或者 Handlebars moustaches，在 Ruby on Rails 下用 ERB，在 Java 下用 Thymeleaf 写过页面，那你就已经了解其基本概念了.）

绝大多数视图代码就是 HTML，间或掺杂一点 C# 语句，用以从视图模型里抽取数据并转换为文本或者 HTML。这些 C# 语句以符号 `@` 作为前缀。

由 `TodoController` 中的 action `Index` 生成的视图，需要从视图模型（一个待办事项的数组）获取数据，并用一个适当的表格展示给用户。按规定，视图要置于 `Views` 目录下，在一个跟所在控制器同名的子目录下。视图文件的文件名就是 action 的名字加上一个 `.cshtml` 扩展名。

**`Views/Todo/Index.cshtml`**

```html
@model TodoViewModel;

@{
    ViewData["Title"] = "Manage your todo list";
}

<div class="panel panel-default todo-panel">
  <div class="panel-heading">@ViewData["Title"]</div>

  <table class="table table-hover">
      <thead>
          <tr>
              <td>&#x2714;</td>
              <td>Item</td>
              <td>Due</td>
          </tr>
      </thead>

      @foreach (var item in Model.Items)
      {
          <tr>
              <td>
                <input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
              </td>
              <td>@item.Title</td>
              <td>@item.DueAt</td>
          </tr>
      }
  </table>

  <div class="panel-footer add-item-form">
    <form>
        <div id="add-item-error" class="text-danger"></div>
        <label for="add-item-title">Add a new item:</label>
        <input id="add-item-title">
        <button type="button" id="add-item-button">Add</button>
    </form>
  </div>
</div>
```

在文件顶端，`@model` 指令告诉 Razor 该视图要绑定到哪个模型。模型通过 `Model` 属性进行访问。

如果在 `Model.Items` 里有一些待办事项条目，则 `foreach` 语句将遍历到每个代办事项，并渲染成一个表格的行（`<tr>` 元素），改行包含条目的名字和截止日期。还会展示一个带有 ID 的复选框，可以在后续操作中把该条目标记为已完成。

### 布局文件

你可能会纳闷，其余的 HTML：`<body>` 标签，或者页首和页脚 哪儿去了？ASP.NET Core 使用一个布局视图，用以定义容纳视图的基础结构的其余部分。布局视图被保存在 `Views/Shared/_Layout.cshtml`。

默认的 ASP.NET Core 模板在布局文件中包含了 Bootstrap 和 jQuery，便于你快捷地创建一个 web 应用程序。当然，只要你愿意，你可以使用自己的 CSS 和 JavaScript 库。

### 定制样式表

现在，先在 `site.css` 文件的底部添加以下这些 CSS 样式规则：

**`wwwroot/css/site.css`**

```css
div.todo-panel {
  margin-top: 15px;
}

table tr.done {
  text-decoration: line-through;
  color: #888;
}
```

你可以用类似的规则完全自定义页面的外观和体验。

ASP.NET Core 和 Razor 还有更多功能，比如部分视图和后端渲染的视图组件，但你现在只需要一个简单的布局和试图。想要了解更多的话，ASP.NET Core 的官方文档（位于 `https://docs.asp.net`）有几个示例可以参考。

---

## Create a view
Views in ASP.NET Core are built using the Razor templating language, which combines HTML and C# code. (If you've written pages using Jade/Pug or Handlebars moustaches in JavaScript, ERB in Ruby on Rails, or Thymeleaf in Java, you've already got the basic idea.)

Most view code is just HTML, with the occasional C# statement added in to pull data out of the view model and turn it into text or HTML. The C# statements are prefixed with the `@` symbol.

The view rendered by the `Index` action of the `TodoController` needs to take the data in the view model (an array of to-do items) and display it as a nice table for the user. By convention, views are placed in the `Views` directory, in a subdirectory corresponding to the controller name. The file name of the view is the name of the action with a `.cshtml` extension.

**`Views/Todo/Index.cshtml`**

```html
@model TodoViewModel;

@{
    ViewData["Title"] = "Manage your todo list";
}

<div class="panel panel-default todo-panel">
  <div class="panel-heading">@ViewData["Title"]</div>

  <table class="table table-hover">
      <thead>
          <tr>
              <td>&#x2714;</td>
              <td>Item</td>
              <td>Due</td>
          </tr>
      </thead>
      
      @foreach (var item in Model.Items)
      {
          <tr>
              <td>
                <input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
              </td>
              <td>@item.Title</td>
              <td>@item.DueAt</td>
          </tr>
      }
  </table>

  <div class="panel-footer add-item-form">
    <form>
        <div id="add-item-error" class="text-danger"></div>
        <label for="add-item-title">Add a new item:</label>
        <input id="add-item-title">
        <button type="button" id="add-item-button">Add</button>
    </form>
  </div>
</div>
```

At the very top of the file, the `@model` directive tells Razor which model to expect this view to be bound to. The model is accessed through the `Model` property.

Assuming there are any to-do items in `Model.Items`, the `foreach` statement will loop over each to-do item and render a table row (`<tr>` element) containing the item's name and due date. A checkbox is also rendered that contains the item's ID, which you'll use later to mark the item as completed.

### The layout file
You might be wondering where the rest of the HTML is: what about the `<body>` tag, or the header and footer of the page? ASP.NET Core uses a layout view that defines the base structure that the rest of the views are rendered inside of. It's stored in `Views/Shared/_Layout.cshtml`.

The default ASP.NET Core template includes Bootstrap and jQuery in this layout file, so you can quickly create a web application. Of course, you can use your own CSS and JavaScript libraries if you'd like.

### Customizing the stylesheet

For now, just add these CSS style rules to the bottom of the `site.css` file:

**`wwwroot/css/site.css`**

```css
div.todo-panel {
  margin-top: 15px;
}

table tr.done {
  text-decoration: line-through;
  color: #888;
}
```

You can use CSS rules like these to completely customize how your pages look and feel.

ASP.NET Core and Razor can do much more, such as partial views and server-rendered view components, but a simple layout and view is all you need for now. The official ASP.NET Core documentation (at `https://docs.asp.net`) contains a number of examples if you'd like to learn more.
