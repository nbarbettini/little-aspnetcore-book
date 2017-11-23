## 使用复选框标记条目完成

向你的待办事项列表里添加条目这功能很棒，但最终你还是需要把这些事项处理掉。在 `Views/Todo/Index.cshtml` 视图里，为每个待办事项条目显示了一个复选框：

```html
<input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
```

条目的 ID（一个 guid）被保存在该元素的 `name` 属性里。在复选框被勾选的时候，你可以使用这个 ID 告知你的 ASP.NET Core 代码区更新数据库里对应的那个条目。

整个流程看起来是这样的：

* 用户勾选复选框，触发一个 JavaScript 函数
* JavaScript 向控制器上的某个 action 发起一个 API 调用
* 该 action 调用到服务层去更新数据库里的条目
* 一个响应回复给 JavaScript 函数，表明更新成功
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

这段代码使用 jQuery 发送一个 HTTP POST 请求到 `http://localhost:5000/Todo/MarkDone`。请求中包括一个参数，`id`，其中是条目的 ID （从 `name` 属性里获取的）。

如果打开你网络浏览器的网络工具，再勾选一个复选框，你会看到一个这样的请求：

```
POST http://localhost:5000/Todo/MarkDone
Content-Type: application/x-www-form-urlencoded

id=<some guid>
```

传给 `$.post` 的常规处理函数会为该条目所在表格的那行添加一个 class。当这个行被标记上 `done` class，页面上的一个 CSS 规则会改变这一行的外观。

### 在控制器里添加一个 action

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

让我们逐行分析这个 action 方法。首先，该方法接受一个名为 `id` 的 `Guid` 类型参数。 不同于使用一个模型（`NewTodoItem`）作为参数并执行模型绑定/验证的 action `AddItem`， `id` 参数非常简单。如果传入的请求中包括一个名为 `id` 的参数， ASP.NET Core 将尝试将其解析为一个 guid。

这里不存在有效性检查的 `ModelState`，但你依然可以进行检查，以确保该guid的有效性。如果出于某些原因，请求中的 `id` 缺失了，或无法解析为一个 guid，那它会具有一个值为 `Guid.Empty`。如果是这种情况，action 可以提早返回：

```csharp
if (id == Guid.Empty) return BadRequest();
```

`BadRequest()` 方法是个便捷方法，用于方便地返回 HTTP 状态吗码 `400 Bad Request`。

接下来，控制器需要调用到服务中去更新数据库。这将由`ITodoItemService`中一个名为 `MarkDoneAsync`的新方法处理，处理后取决于更新成功与否，会返回 true 或者 false：

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
<input type="checkbox" name="@item.Id" value="true" class="done-checkbox">
```

The item's ID (a guid) is saved in the `name` attribute of the element. You can use this ID to tell your ASP.NET Core code to update that entity in the database when the checkbox is checked.

This is what the whole flow will look like:

* The user checks the box, which triggers a JavaScript function
* JavaScript is used to make an API call to an action on the controller
* The action calls into the service layer to update the item in the database
* A response is sent back to the JavaScript function to indicate the update was successful
* The HTML on the page is updated

### Add JavaScript code

First, open `site.js` and add this code to the `$(document).ready` block:

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

Then, add the `markCompleted` function at the bottom of the file:

```javascript
function markCompleted(checkbox) {
    checkbox.disabled = true;

    $.post('/Todo/MarkDone', { id: checkbox.name }, function() {
        var row = checkbox.parentElement.parentElement;
        $(row).addClass('done');
    });
}
```

This code uses jQuery to send an HTTP POST request to `http://localhost:5000/Todo/MarkDone`. Included in the request will be one parameter, `id`, containing the item's ID (pulled from the `name` attribute).

If you open the Network Tools in your web browser and click on a checkbox, you'll see a request like:

```
POST http://localhost:5000/Todo/MarkDone
Content-Type: application/x-www-form-urlencoded

id=<some guid>
```

The success handler function passed to `$.post` uses jQuery to add a class to the table row that the checkbox sits in. With the row marked with the `done` class, a CSS rule in the page stylesheet will change the way the row looks.

### Add an action to the controller

As you've probably guessed, you need to add a `MarkDone` action on the `TodoController`:

```csharp
public async Task<IActionResult> MarkDone(Guid id)
{
    if (id == Guid.Empty) return BadRequest();

    var successful = await _todoItemService.MarkDoneAsync(id);

    if (!successful) return BadRequest();

    return Ok();
}
```

Let's step through each piece of this action method. First, the method accepts a `Guid` parameter called `id` in the method signature. Unlike the `AddItem` action, which used a model (the `NewTodoItem` model) and model binding/validation, the `id` parameter is very simple. If the incoming request includes a parameter called `id`, ASP.NET Core will try to parse it as a guid.

There's no `ModelState` to check for validity, but you can still check to make sure the guid was valid. If for some reason the `id` parameter in the request was missing couldn't be parsed as a guid, it will have a value of `Guid.Empty`. If that's the case, the action can return early:

```csharp
if (id == Guid.Empty) return BadRequest();
```

The `BadRequest()` method is a helper method that simply returns the HTTP status code `400 Bad Request`.

Next, the controller needs to call down into the service to update the database. This will be handled by a new method called `MarkDoneAsync` on the `ITodoItemService`, which will return true or false depending on if the update succeeded:

```csharp
var successful = await _todoItemService.MarkDoneAsync(id);
if (!successful) return BadRequest();
```

Finally, if everything looks good, the `Ok()` method is used to return status code `200 OK`. More complex APIs might return JSON or other data as well, but for now returning a status code is all you need.

### Add a service method

First, add `MarkDoneAsync` to the interface definition:

**`Services/ITodoItemService.cs`**

```csharp
Task<bool> MarkDoneAsync(Guid id);
```

Then, add the concrete implementation to the `TodoItemService`:

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

This method uses Entity Framework Core and `Where` to find an entity by ID in the database. The `SingleOrDefaultAsync` method will return either the item (if it exists) or `null` if the ID was bogus. If it didn't exist, the code can return early.

Once you're sure that `item` isn't null, it's a simple matter of setting the `IsDone` property:

```csharp
item.IsDone = true;
```

Changing the property only affects the local copy of the item until `SaveChangesAsync` is called to persist your changes back to the database. `SaveChangesAsync` returns an integer that reflects how many entities were updated during the save operation. In this case, it'll either be 1 (the item was updated) or 0 (something went wrong).

### Try it out

Run the application and try checking some items off the list. Refresh the page and they'll disappear completely, because of the `Where` filter in the `GetIncompleteItemsAsync` method.

Right now, the application contains a single, shared to-do list. It'd be even more useful if it kept track of individual to-do lists for each user. In the next chapter, you'll use ASP.NET Core Identity to add security and authentication features to the project.
