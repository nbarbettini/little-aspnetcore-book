## Create a view
Views in ASP.NET Core are built using the Razor templating language, which combines HTML and C# code. (If you've written pages using Jade/Pug or Handlebars moustaches in JavaScript, ERB in Ruby on Rails, or Thymeleaf in Java, you've already got the basic idea.)

Most view code is just HTML, with the occasional C# statement added in to pull data out of the view model and turn it into text or HTML. The C# statements are prefixed with the `@` symbol.

The view rendered by the `Index` action of the `TodoController` needs to take the data in the view model (an array of to-do items) and display it as a nice table for the user. By convention, views are placed in the `Views` directory, in a subdirectory corresponding to the controller name. The file name of the view is the name of the action with a `.cshtml` extension.

##### `Views/Todo/Index.cshtml`

```html
@model TodoViewModel;

@{
  ViewData["Title"] = "Manage your todo list";
}

<h2>@ViewData["Title"]</h2>

<table class="table table-hover">
  <thead>
    <tr>
      <td>Done?</td>
      <td>Item</td>
      <td>Due</td>
    </tr>
  </thead>
  
  @foreach (var item in Model.Items)
  {
    <tr>
      <td class="done-cell">
        <input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
      </td>
      <td>@item.Title</td>
      <td>@item.DueAt</td>
    </tr>
  }
</table>
```

At the very top of the file, the `@model` directive tells Razor which model to expect this view to be bound to. The model is accessed through the `Model` property.

Assuming there are any to-do items in `Model.Items`, the `foreach` statement will loop over each to-do item and render a table row (`<tr>` element) containing the item's name and due date. A checkbox is also rendered that contains the item's ID, which you'll use later to mark the item as completed.

### The layout file
You might be wondering where the rest of the HTML is: what about the `<body>` tag, or the header and footer of the page? ASP.NET Core uses a layout view that defines the base structure that the rest of the views are rendered inside of. It's stored in `Views/Shared/_Layout.cshtml`.

The default ASP.NET Core template includes Bootstrap and jQuery in this layout file, so you can quickly create a web application. Of course, you can use your own CSS and JavaScript libraries if you'd like.

### Customizing the stylesheet

!TODO: update layout to look nice

ASP.NET Core and Razor can do much more, such as partial views and server-rendered view components, but a simple layout and view is all you need for now. The official ASP.NET Core documentation (at `https://docs.asp.net`) has a plethora of examples you can use to learn more.
