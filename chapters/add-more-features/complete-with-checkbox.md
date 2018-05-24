## 使用复选框标记条目完成

向 待办事项 列表里添加条目，这功能很棒，但无论如何，这些事项都得被处理掉。在 `Views/Todo/Index.cshtml` 视图里，为每个待办事项条目显示了一个复选框：

```html
<input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
```

条目的 ID（一个 guid）被保存在该元素的 `name` 属性里。当复选框被勾选的时候，你可以使用这个 ID 告知你的 ASP.NET Core 代码区更新数据库里对应的那个条目。

整个流程看起来是这样的：

* 用户勾选复选框，触发一个 JavaScript 函数
* JavaScript 向控制器上的某个 action 发起一个 API 调用
* 该 action 调用到服务层去修改数据库里的条目
* 一个响应回复给 JavaScript 函数，表明成功执行了修改
* 页面上的 HTML 被更新

### 添加 JavaScript 代码

首先，打开 `site.js` 并在 `$(document).ready` 代码块里添加如下内容：

**wwwroot/js/site.js**

```javascript
$(document).ready(function() {

    // ...

    // Wire up all of the checkboxes to run markCompleted()
    $('.done-checkbox').on('click', function(e) {
        markCompleted(e.target);
    });

});
```

然后，在该文件底部添加 `markCompleted` 函数：

```javascript
function markCompleted(checkbox) {
    checkbox.disabled = true;

    $.post('/Todo/MarkDone', { id: checkbox.name }, function() {
        var row = checkbox.parentElement.parentElement;
        $(row).addClass('done');
    });
}
```

这段代码使用 jQuery 发送一个 HTTP POST 请求到 `http://localhost:5000/Todo/MarkDone`。请求中包括一个参数，`id`，持有该条目的 ID （获取自 `name` 属性）。

如果打开你 网络浏览器 的 网络工具，再勾选一个复选框，你会看到一个这样的请求：

```
POST http://localhost:5000/Todo/MarkDone
Content-Type: application/x-www-form-urlencoded

id=<some guid>
```

传给 `$.post` 的常规处理函数会为该条目所在表格的那行添加一个 class。当这个行被标记上 `done` class，页面上的一个 CSS 规则会改变这一行的外观。

### 在控制器里添加 action

正如你可能已经猜到的那样，你需要在 `TodoController` 里添加一个 action `MarkDone`：

```csharp
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty) return BadRequest();

    var successful = await _todoItemService.MarkDoneAsync(id);

    if (!successful) return BadRequest();

    return Ok();
}
```

让我们逐行分析这个 action 方法。首先，该方法接受一个名为 `id` 的 `Guid` 类型参数。`id` 参数非常简单，这跟 `AddItem` 不同，那个 action 用了一个模型（`NewTodoItem`）作为参数，还进行了 模型绑定/验证 的处理。如果传入的请求中包括一个名为 `id` 的参数， ASP.NET Core 将尝试将其解析为一个 guid。

这里不存在有效性检查的 `ModelState`，但你依然可以进行检查，以确保该guid的有效性。如果出于某些原因，请求中的 `id` 缺失了，或无法解析为一个 guid，那它会具有一个值为 `Guid.Empty`。如果是这种情况，action 可以提早返回：

```csharp
if (id == Guid.Empty) return BadRequest();
```

`BadRequest()` 方法是个便捷方法，简化了返回 HTTP 状态码 `400 Bad Request` 的处理。

接下来，控制器需要调用到服务中去修改数据库。这将由 `ITodoItemService` 中一个名为 `MarkDoneAsync` 的新方法处理，处理后，根据于修改结果成功与否，会返回 true 或者 false：

```csharp
var successful = await _todoItemService.MarkDoneAsync(id);
if (!successful) return BadRequest();
```

最终，如果一切顺利，`Ok()` 方法会被用来返回状态码`200 OK`。复杂一些的 API 也可能会返回 JSON 或者其他数据格式，但你目前的情况，返回一个状态码就够用了。

### 添加服务方法

首先，在接口定义中添加 `MarkDoneAsync`：

**`Services/ITodoItemService.cs`**

```csharp
Task<bool> MarkDoneAsync(Guid id);
```

然后，在 `TodoItemService` 中添加具体的实现：

**`Services/TodoItemService.cs`**

```csharp
public async Task<bool> MarkDoneAsync(Guid id)
{
    var item = await _context.Items
        .Where(x => x.Id == id)
        .SingleOrDefaultAsync();

    if (item == null) return false;

    item.IsDone = true;

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1; // One entity should have been updated
}
```

该方法使用 Entity Framework Core 和 `Where` 在数据库中按 `ID` 查找一个条目。`SingleOrDefaultAsync` 方法要么返回该条目(若存在)，要么返回 `null`——如果 ID 是假的。如果它不存在，代码将提前返回。

一旦你确定 `item` 不是 null，设置 `IsDone` 属性就是小事一桩了：

```csharp
item.IsDone = true;
```

修改该属性仅仅影响该条目的本地拷贝，`SaveChangesAsync` 被调用之后才会把修改的内容持久化到数据库里。`SaveChangesAsync` 返回一个整数，表示在这次保存操作中被更新的条目的数量。在当前的情况下，它要么是1(条目更新了)，要么是0(有错误发生)。

### 试试看

运行程序并勾选列表中的某些条目完成掉。刷新页面，它们将自动消失掉，这归功于 `GetIncompleteItemsAsync` 方法中的 `Where` 过滤器。

现在，程序里包含一个单一、共享的待办事项列表。如果它为每个用户保存独立的列表，将会更有用。下一章，你将使用 ASP.NET Core Identity，为项目添加安全及认证等特性。

---

## Complete items with a checkbox

Adding items to your to-do list is great, but eventually you'll need to get things done, too. In the `Views/Todo/Index.cshtml` view, a checkbox is rendered for each to-do item:

```html
<input type="checkbox" class="done-checkbox">
```

Clicking the checkbox doesn't do anything (yet). Just like the last chapter, you'll add this behavior using forms and actions. In this case, you'll also need a tiny bit of JavaScript code.


### Add form elements to the view

First, update the view and wrap each checkbox with a `<form>` element. Then, add a hidden element containing the item's ID:

**Views/Todo/Index.cshtml**

```html
<td>
    <form asp-action="MarkDone" method="POST">
        <input type="checkbox" class="done-checkbox">
        <input type="hidden" name="id" value="@item.Id">
    </form>
</td>
```

When the `foreach` loop runs in the view and prints a row for each to-do item, a copy of this form will exist in each row. The hidden input containing the to-do item's ID makes it possible for your controller code to tell which box was checked. (Without it, you'd be able to tell that *some* box was checked, but not which one.)

If you run your application right now, the checkboxes still won't do anything, because there's no submit button to tell the browser to create a POST request with the form's data. You could add a submit button under each checkbox, but that would be a silly user experience. Ideally, clicking the checkbox should automatically submit the form. You can achieve that by adding some JavaScript.


### Add JavaScript code

Find the `site.js` file in the `wwwroot/js` directory and add this code: 

**wwwroot/js/site.js**

```javascript
$(document).ready(function() {

    // Wire up all of the checkboxes to run markCompleted()
    $('.done-checkbox').on('click', function(e) {
        markCompleted(e.target);
    });
});

function markCompleted(checkbox) {
    checkbox.disabled = true;

    var row = checkbox.closest('tr');
    $(row).addClass('done');

    var form = checkbox.closest('form');
    form.submit();
}
```

This code first uses jQuery (a JavaScript helper library) to attach some code to the `click` even of all the checkboxes on the page with the CSS class `done-checkbox`. When a checkbox is clicked, the `markCompleted()` function is run.

The `markCompleted()` function does a few things:
* Adds the `disabled` attribute to the checkbox so it can't be clicked again
* Adds the `done` CSS class to the parent row that contains the checkbox, which changes the way the row looks based on the CSS rules in `style.css`
* Submits the form

That takes care of the view and frontend code. Now it's time to add a new action!


### Add an action to the controller

As you've probably guessed, you need to add an action called `MarkDone` in the `TodoController`:

```csharp
[ValidateAntiForgeryToken]
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty)
    {
        return RedirectToAction("Index");
    }

    var successful = await _todoItemService.MarkDoneAsync(id);
    if (!successful)
    {
        return BadRequest("Could not mark item as done.");
    }

    return RedirectToAction("Index");
}
```

Let's step through each line of this action method. First, the method accepts a `Guid` parameter called `id` in the method signature. Unlike the `AddItem` action, which used a model and model binding/validation, the `id` parameter is very simple. If the incoming request data includes a field called `id`, ASP.NET Core will try to parse it as a guid. This works because the hidden element you added to the checkbox form is named `id`.

Since you aren't using model binding, there's no `ModelState` to check for validity. Instead, you can check the guid value directly to make sure it's valid. If for some reason the `id` parameter in the request was missing or couldn't be parsed as a guid, `id` will have a value of `Guid.Empty`. If that's the case, the action tells the browser to redirect to `/Todo/Index` and refresh the page.

Next, the controller needs to call the service layer to update the database. This will be handled by a new method called `MarkDoneAsync` on the `ITodoItemService` interface, which will return true or false depending on whether the update succeeded:

```csharp
var successful = await _todoItemService.MarkDoneAsync(id);
if (!successful)
{
    return BadRequest("Could not mark item as done.");
}
```

Finally, if everything looks good, the browser is redirected to the `/Todo/Index` action and the page is refreshed.

With the view and controller updated, all that's left is adding the missing service method.

### Add a service method

First, add `MarkDoneAsync` to the interface definition:

**Services/ITodoItemService.cs**

```csharp
Task<bool> MarkDoneAsync(Guid id);
```

Then, add the concrete implementation to the `TodoItemService`:

**Services/TodoItemService.cs**

```csharp
public async Task<bool> MarkDoneAsync(Guid id)
{
    var item = await _context.Items
        .Where(x => x.Id == id)
        .SingleOrDefaultAsync();

    if (item == null) return false;

    item.IsDone = true;

    var saveResult = await _context.SaveChangesAsync();
    return saveResult == 1; // One entity should have been updated
}
```

This method uses Entity Framework Core and `Where()` to find an item by ID in the database. The `SingleOrDefaultAsync()` method will either return the item or `null` if it couldn't be found.

Once you're sure that `item` isn't null, it's a simple matter of setting the `IsDone` property:

```csharp
item.IsDone = true;
```

Changing the property only affects the local copy of the item until `SaveChangesAsync()` is called to persist the change back to the database. `SaveChangesAsync()` returns a number that indicates how many entities were updated during the save operation. In this case, it'll either be 1 (the item was updated) or 0 (something went wrong).

### Try it out

Run the application and try checking some items off the list. Refresh the page and they'll disappear completely, because of the `Where()` filter in the `GetIncompleteItemsAsync()` method.

Right now, the application contains a single, shared to-do list. It'd be even more useful if it kept track of individual to-do lists for each user. In the next chapter, you'll add login and security features to the project.
