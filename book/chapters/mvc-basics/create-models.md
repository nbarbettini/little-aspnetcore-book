## 创建模型

我们需要创建两个独立的模型类：一个模型表示保存在数据库里的条目（有时候也称为一个 **记录(entity)**），另一个模型将与视图结合（MVC里的 **MV**）发送到用户的浏览器。因为他们都可以被称为模型，我将称后者为 **视图模型（view model）**。

首先，在 Models 目录下，创建一个名为 `TodoItem` 的类：

**`Models/TodoItem.cs`**

```csharp
using System;

namespace AspNetCoreTodo.Models
{
    public class TodoItem
    {
        public Guid Id { get; set; }

        public bool IsDone { get; set; }

        public string Title { get; set; }

        public DateTimeOffset? DueAt { get; set; }
    }
}
```

这个类定义了每个待办事项都要保存的内容：一个 ID、一个标题或者名称、该事项是否已经完成，以及截至日期是什么时候。每行定义了这个类的一个属性：

* **Id** 属性是一个 guid，或者说是 全局(**g**lobally) 唯一(**u**nique) 标识符(**id**entifier). Guid（或者GUID）是一个由字母和数字组成的长长的字符串，看起来是这样的 `43ec09f2-7f70-4f4b-9559-65011d5781bb`。因为 guid 是随机的，并极少会有重复值，所以常被用作唯一标识。你也可以用数字（整形 integer）作为数据库记录的标识，但你需要在数据库里配置，以便这个数字在添加新条目的时候始终增长。因为 Guid 是随机生产的，所以就你不必再担心这个 自增 的问题了。

* **IsDone** 属性是一个 布尔值（值为 true/false）。默认情况下，所有新建条目的该值为 `false`。你后面会编写代码，在用户在视图里点击条目的复选框时，修改这个属性为 `true`。

* **Title** 属性是一个字符串，用于保存待办事项的名称或者简述。

* **DueAt** 属性是一个 `DateTimeOffset`，C# 用于这种类型保存一个 日期/时间 的戳记和一个与 UTC 偏移量表示的时区。把时期、时间和时区一起保存，有助于在不同时区的系统上准确地显示时间。

看到 `DateTimeOffset` 类型后面那个问号 `?` 了吗？它表示 DueAt 属性 *可空(nullable)*，或者说是可选的。如果不加这个 `?`，每个待办事项都必须带有一个截止日期。Id 和 IsDone 属性没有标记为可空，所以是必须的，并可以确保始终有值（或者是一个缺省值）。

> C#里的字符串总是可空的，所以没必要给 Title 属性添加可空标记。C# 字符串可以没有值，也可以是空白字符串或者包含任意文本。

每个属性后面都跟着 `get; set;` ，这是个简写，表示该属性 可读/可写(read/write)（或者更确切地说，它有 getter 和 setter 方法各一个）。

现在，暂且不必关心底层数据库采用的是哪种实现。它可以是 SQL Server，MySQL，MongoDB，Redis，或者什么其它稀奇古怪的玩意儿。这个模型定义了数据库里的行或者记录在 C# 里看起来是什么样的，所以你无须在代码层面担心数据库层面的东西。这种模型的风格被称为“朴实可爱的 C# 对象(plain ol' C# object)” 或者 POCO。

### 视图模型

通常，你保存在数据库里的模型（实体），跟你在 MVC 里用的模型（视图模型）非常相似，但又不尽相同。在现在的情形下， `TodoItem` 模型代表单一的一个数据库里的条目，而视图则需要展示两个、十个，甚至是一百个待办事项（取决于用户拖延症的病情轻重）。

因此，视图模型应该是一个独立的类，里面包含着一个 `TodoItem` 的数组：

**`Models/TodoViewModel.cs`**

```csharp
using System.Collections.Generic;

namespace AspNetCoreTodo.Models
{
    public class TodoViewModel
    {
        public IEnumerable<TodoItem> Items { get; set; }
    }
}
```

`IEnumerable<>` 是 C# 里一个优雅的表达方式，它代表着 `Items` 属性可能容纳着零个、一个或者很多个 `TodoItem`。（用专业术语来说，它并不是一个数组，而是个类数组接口，可对其进行枚举或迭代操作的任何序列。）

> `IEnumerable<>` 接口在 `System.Collections.Generic` 命名空间内，所以需要在文件顶端添加一条 `using System.Collections.Generic` 语句。

好了，现在模型也有了，是时候创建一个接收 `TodoViewModel` 并以 HTML 向用户展示待办事项列表的视图了。

---

## Create models
There are two separate model classes that need to be created: a model that represents a to-do item stored in the database (sometimes called an **entity**), and the model that will be combined with a view (the **MV** in MVC) and sent back to the user's browser. Because both of them can be referred to as "models", I'll refer to the latter as a *view model*.

First, create a class called `TodoItem` in the Models directory:

**`Models/TodoItem.cs`**

```csharp
using System;

namespace AspNetCoreTodo.Models
{
    public class TodoItem
    {
        public Guid Id { get; set; }
        
        public bool IsDone { get; set; }

        public string Title { get; set; }

        public DateTimeOffset? DueAt { get; set; }
    }
}
```

This class defines what the database will need to store for each to-do item: an ID, a title or name, whether the item is complete, and what the due date is. Each line defines a property of the class:

* The **Id** property is a guid, or a **g**lobally **u**nique **id**entifier. Guids (or GUIDs) are long strings of letters and numbers, like `43ec09f2-7f70-4f4b-9559-65011d5781bb`. Because guids are random and are extremely unlikely to be accidentally duplicated, they are commonly used as unique IDs. You could also use a number (integer) as a database entity ID, but you'd need to configure your database to always increment the number when new rows are added to the database. Guids are generated randomly, so you don't have to worry about auto-incrementing.

* The **IsDone** property is a boolean (true/false value). By default, it will be `false` for all new items. Later you'll use write code to switch this property to `true` when the user clicks the item's checkbox in the view.

* The **Title** property is a string. This will hold the name or description of the to-do item.

* The **DueAt** property is a `DateTimeOffset`, which is a C# type that stores a date/time stamp along with a timezone offset from UTC. Storing the date, time, and timezone offset together makes it easy to render dates accurately on systems in different timezones.

Notice the `?` question mark after the `DateTimeOffset` type? That marks the DueAt property as *nullable*, or optional. If the `?` wasn't included, every to-do item would need to have a due date. The Id and IsDone properties aren't marked as nullable, so they are required and will always have a value (or a default value).

> Strings in C# are always nullable, so there's no need to mark the Title property as nullable. C# strings can be null, empty, or contain text.

Each property is followed by `get; set;`, which is a shorthand way of saying the property is read/write (or more technically, it has a getter and setter methods).

At this point, it doesn't matter what the underlying database technology is. It could be SQL Server, MySQL, MongoDB, Redis, or something more exotic. This model defines what the database row or entry will look like in C# so you don't have to worry about the low-level database stuff in your code. This style of model is sometimes called a "plain ol' C# object" or POCO.

### The view model

Often, the model (entity) you store in the database is similar but not *exactly* the same as the model you want to use in MVC (the view model). In this case, the `TodoItem` model represents a single item in the database, but the view might need to display two, ten, or a hundred to-do items (depending on how badly the user is procrastinating).

Because of this, the view model should be a separate class that holds an array of `TodoItem`s:

**`Models/TodoViewModel.cs`**

```csharp
using System.Collections.Generic;

namespace AspNetCoreTodo.Models
{
    public class TodoViewModel
    {
        public IEnumerable<TodoItem> Items { get; set; }
    }
}
```

`IEnumerable<>` is a fancy C# way of saying that the `Items` property contains zero, one, or many `TodoItem`s. (In technical terms, it's not quite an array, but rather an array-like interface for any sequence that can be enumerated or iterated over.)

> The `IEnumerable<>` interface exists in the `System.Collections.Generic` namespace, so you need a `using System.Collections.Generic` statement at the top of the file.

Now that you have some models, it's time to create a view that will take a `TodoViewModel` and render the right HTML to show the user their to-do list.
