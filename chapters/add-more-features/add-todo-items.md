## 添加 待办事项 条目

使用列表下面那个简易的表单，用户可以添加新的 待办事项 条目：

![Final form](final-form.png)

添加这个功能，需要几个步骤：

* 添加 JavaScript 代码，并使用这段代码向服务器发送数据
* 在控制器里添加一个新的 action 处理这个请求
* 在服务层添加代码，对数据库进行修改

### 添加 JavaScript 代码

视图 `Todo/Index.cshtml` 里已经包含了一个表单，其中有一个文本框、一个按钮用于添加新条目。用户点击 Add 按钮的时候，你将借助 jQuery 发送一个 POST 请求到服务器。

打开文件 `wwwroot/js/site.js` 并添加如下代码：

```javascript
$(document).ready(function() {

    // Wire up the Add button to send the new item to the server
    $('#add-item-button').on('click', addItem);

});
```

然后，在文件底部写上这个 `addItem` 函数：

```javascript
function addItem() {
    $('#add-item-error').hide();
    var newTitle = $('#add-item-title').val();

    $.post('/Todo/AddItem', { title: newTitle }, function() {
        window.location = '/Todo';
    })
    .fail(function(data) {
        if (data && data.responseJSON) {
            var firstError = data.responseJSON[Object.keys(data.responseJSON)[0]];
            $('#add-item-error').text(firstError);
            $('#add-item-error').show();
        }
    });
}
```

这个函数会发送一个 POST 请求到 `http://localhost:5000/Todo/AddItem`，里面带有用户输入的名称。传递给 `$.post` 方法(函数)的第三个参数是一个 常规处理方法(success handler)，它将在服务器响应 `200 OK` 的时候被执行。这个 常规处理方法 函数使用 `window.location` 刷新页面（把 location 设置为 `/Todo`，也就是当前这个页面所在的位置）。如果服务器响应 `400 Bad Request`，那么依附在 `$.post` 方法上的 `fail` 处理方法将试图提取一个错误信息，并在 id 为 `add-item-error` 的 `<div>` 中显示它。

### 添加 action

上面的 JavaScript 还不能奏效，因为还没有任何 action 对 `/Todo/AddItem` 这个路径上的请求进行处理。如果你现在尝试，ASP.NET Core 会返回一个 `404 Not Found` 错误。

你需要在 `TodoConteoller` 中添加一个名为 `AddItem` 的新 action：

```csharp
public async Task<IActionResult> AddItem(NewTodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var successful = await _todoItemService.AddItemAsync(newItem);
    if (!successful)
    {
        return BadRequest(new { error = "Could not add item" });
    }

    return Ok();
}
```

方法签名里定义了一个参数 `NewTodoItem`，是个尚不存在的新模型。你需要这样创建它：

**`Models/NewTodoItem.cs`**

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace AspNetCoreTodo.Models
{
    public class NewTodoItem
    {
        [Required]
        public string Title { get; set; }
    }
}
```

这个模型的定义（一个名为 `Title` 的属性）与你借助 jQuery 发送给 action 的数据相匹配：

```javascript
$.post('/Todo/AddItem', { title: newTitle }  // ...

// 带有一个属性的 JSON 对象：
// {
//   title: (用户输入的某些内容)
// }
```

通过一个被称作 **模型绑定(model binding)** 的流程，ASP.NET Core 把 POST 请求里面的参数，跟你创建的模型定义进行配对。如果参数名匹配(忽略诸如大小写这种因素)，请求数据将被置入到模型里。

把请求数据绑定到模型之后，ASP.NET Core 还会执行 **模型验证(model validation)**。 `Title` 字段的属性 `[Required]` 告知验证器“`Title`字段不应该被漏掉(空白)”。如果模型没能通过验证，验证器不会抛出一个异常，但是验证状态会被保存下来，以便你在控制器里查阅它。

> 补充阅读：本来有可能复用模型 `TodoItem`，而不是创建一个 `NewTodoItem`，但是 `TodoItem` 里包含一些永远都不会被用户提交的字段(ID 和 done)。而现在的处理方式则更干净利落：在添加新的 待办事项 条目时，定义一个新的模型来确切地表示相关属性。

回到 `TodoController` 里的 action `AddItem`：第一个代码块检查“模型是否符合验证处理的条件”。习惯上，这件事应该在方法的最开始进行处理：

```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

如果 `ModelState` 是无效的（因为所需的字段空缺了），action 会连带模型状态一起，返回一个 400 Bad Request，这随后会自动地被转换为一个错误消息，告知用户出了什么问题。

接下来，控制器调用到服务层，执行具体的数据库操作：

```csharp
var successful = await _todoItemService.AddItemAsync(newItem);
if (!successful)
{
    return BadRequest(new { error = "Could not add item." });
}
```

取决于该条目添加到数据库的结果成功与否，`AddItemAsync` 方法会返回 `true` 或者 `false`。如果该操作因为某些原因失败了，action 会连带一个包含 `error` 字段的对象，返回 `400 Bad Request`。

最后，如果所有操作顺利完成，action 返回 `200 OK`。

### 添加服务方法(函数)

如果你使用的代码编辑器了解 C# 的语法，你会在 `AddItemAsync` 下面看到红色的波浪线，因为该方法尚未定义。

作为最后一步，你需要在服务层里添加一个方法。首先，在 `ITodoItemService` 接口里添加它的定义：

```csharp
public interface ITodoItemService
{
    Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync();

    Task<bool> AddItemAsync(NewTodoItem newItem);
}
```

然后，在 `TodoItemService` 里面添加实现：

```csharp
public async Task<bool> AddItemAsync(NewTodoItem newItem)
{
    var entity = new TodoItem
    {
        Id = Guid.NewGuid(),
        IsDone = false,
        Title = newItem.Title,
        DueAt = DateTimeOffset.Now.AddDays(3)
    };

    _context.Items.Add(entity);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

这个方法创建一个新的 `TodoItem`（这个模型代表数据库中的实体），并从 `NewTodoItem` 里面复制了 `Title`。然后，把它添加到 context 里，又用 `SaveChangesAsync` 方法在数据库里使之被持久化。

> 补充阅读：上面仅仅是该功能的一种“可行的”方案。如果希望你为“添加一个新条目”显示独立的页面（比方说，一个很复杂的条目，包含很多字段），你可以创建一个新的视图，绑定一个模型，供用户输入字段值。通过一个名为 **tag helper** 的特性，ASP.NET Core能够自动为该模型的各字段渲染一个表单，你可以在 https://docs.asp.net 上 ASP.NET Core 的文档里找到相关的示例。

### 试试看

运行程序，使用页面上的表单添加几个条目到 待办事项 列表里。因为这些条目存储在数据库里，就算你关闭程序后再重新运行，这些条目都还保存在那里。

> 一个附加练习，请尝试使用 HTML 和 JavaScript 添加一个日期选择框，并让用户为 `DueAt` 属性选择一个(可选的)日期。然后，用这个日期替换那个默认的“3天后到期”。

---

## Add new to-do items

The user will add new to-do items with a simple form below the list:

![Final form](final-form.png)

Adding this feature requires a few steps:

* Adding JavaScript that will send the data to the server
* Creating a new action on the controller to handle this request
* Adding code to the service layer to update the database

### Add JavaScript code

The `Todo/Index.cshtml` view already includes an HTML form that has a textbox and a button for adding a new item. You'll use jQuery to send a POST request to the server when the Add button is clicked.

Open the `wwwroot/js/site.js` file and add this code:

```javascript
$(document).ready(function() {

    // Wire up the Add button to send the new item to the server
    $('#add-item-button').on('click', addItem);

});
```

Then, write the `addItem` function at the bottom of the file:

```javascript
function addItem() {
    $('#add-item-error').hide();
    var newTitle = $('#add-item-title').val();

    $.post('/Todo/AddItem', { title: newTitle }, function() {
        window.location = '/Todo';
    })
    .fail(function(data) {
        if (data && data.responseJSON) {
            var firstError = data.responseJSON[Object.keys(data.responseJSON)[0]];
            $('#add-item-error').text(firstError);
            $('#add-item-error').show();
        }
    });
}
```

This function will send a POST request to `http://localhost:5000/Todo/AddItem` with the name the user typed. The third parameter passed to the `$.post` method (the function) is a success handler that will run if the server responds with `200 OK`. The success handler function uses `window.location` to refresh the page (by setting the location to `/Todo`, the same page the browser is currently on). If the server responds with `400 Bad Request`, the `fail` handler attached to the `$.post` method will try to pull out an error message and display it in a the `<div>` with id `add-item-error`.

### Add an action

The above JavaScript code won't work yet, because there isn't any action that can handle the `/Todo/AddItem` route. If you try it now, ASP.NET Core will return a `404 Not Found` error.

You'll need to create a new action called `AddItem` on the `TodoController`:

```csharp
public async Task<IActionResult> AddItem(NewTodoItem newItem)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var successful = await _todoItemService.AddItemAsync(newItem);
    if (!successful)
    {
        return BadRequest(new { error = "Could not add item" });
    }

    return Ok();
}
```

The method signature defines a `NewTodoItem` parameter, which is a new model that doesn't exist yet. You'll need to create it:

**`Models/NewTodoItem.cs`**

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace AspNetCoreTodo.Models
{
    public class NewTodoItem
    {
        [Required]
        public string Title { get; set; }
    }
}
```

This model definition (one property called `Title`) matches the data you're sending to the action with jQuery:

```javascript
$.post('/Todo/AddItem', { title: newTitle }  // ...

// A JSON object with one property:
// {
//   title: (whatever the user typed)
// }
```

ASP.NET Core uses a process called **model binding** to match up the parameters submitted in the POST request to the model definition you created. If the parameter names match (ignoring things like case), the request data will be placed into the model.

After binding the request data to the model, ASP.NET Core also performs **model validation**. The `[Required]` attribute on the `Title` property informs the validator that the `Title` property should not be missing (blank). The validator won't throw an error if the model fails validation, but the validation status will be saved so you can check it in the controller.

> Sidebar: It would have been possible to reuse the `TodoItem` model instead of creating the `NewTodoItem` model, but `TodoItem` contains properties that will never be submitted by the user (ID and done). It's cleaner to declare a new model that represents the exact set of properties that are relevant when adding a new item.

Back to the `AddItem` action method on the `TodoController`: the first block checks whether the model passed the model validation process. It's customary to do this right at the beginning of the method:

```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

If the `ModelState` is invalid (because the required property is empty), the action will return 400 Bad Request along with the model state, which is automatically converted into an error message that tells the user what is wrong.

Next, the controller calls into the service layer to do the actual database operation:

```csharp
var successful = await _todoItemService.AddItemAsync(newItem);
if (!successful)
{
    return BadRequest(new { error = "Could not add item." });
}
```

The `AddItemAsync` method will return `true` or `false` depending on whether the item was successfully added to the database. If it fails for some reason, the action will return `400 Bad Request` along with an object that contains an `error` property.

Finally, if everything completed without errors, the action returns `200 OK`.

### Add a service method

If you're using a code editor that understands C#, you'll see red squiggely lines under `AddItemAsync` because the method doesn't exist yet.

As a last step, you need to add a method to the service layer. First, add it to the interface definition in `ITodoItemService`:

```csharp
public interface ITodoItemService
{
    Task<IEnumerable<TodoItem>> GetIncompleteItemsAsync();

    Task<bool> AddItemAsync(NewTodoItem newItem);
}
```

Then, the actual implementation in `TodoItemService`:

```csharp
public async Task<bool> AddItemAsync(NewTodoItem newItem)
{
    var entity = new TodoItem
    {
        Id = Guid.NewGuid(),
        IsDone = false,
        Title = newItem.Title,
        DueAt = DateTimeOffset.Now.AddDays(3)
    };

    _context.Items.Add(entity);

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1;
}
```

This method creates a new `TodoItem` (the model that represents the database entity) and copies the `Title` from the `NewTodoItem` model. Then, it adds it to the context and uses `SaveChangesAsync` to persist the entity in the database.

> Sidebar: The above is just one way to build this functionality. If you want to display a separate page for adding a new item (for a complicated entity that contains a lot of properties, for example), you could create a new view that's bound to the model you need the user to provide values for. ASP.NET Core can render a form automatically for the properties of the model using a feature called **tag helpers**. You can find examples in the ASP.NET Core documentation at https://docs.asp.net.

### Try it out

Run the application and add some items to your to-do list with the form. Since the items are being stored in the database, they'll still be there even after you stop and start the application again.

> As a further challenge, try adding a date picker using HTML and JavaScript, and let the user choose an (optional) date for the `DueAt` property. Then, use that date instead of always making new tasks that are due in 3 days.
