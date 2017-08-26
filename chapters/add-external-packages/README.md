# Add external packages
One of the big advantages of a mature stack like .NET is that the ecosystem of third-party packages and plugins is huge. Just like other package systems (npm, Maven, RubyGems), you can download and install .NET packages that help with almost any task or problem you can imagine.

NuGet is both the package manager and the official package repository (at https://www.nuget.org). You can search for NuGet packages on the web, and install them from your local machine through the terminal (or the GUI, if you're using Visual Studio).

## Install the Humanizer package
At the end of chapter 3, the to-do application ran and displayed this view:

!TODO: screenshot

The due date column is rendering a date in a format that's good for machines (ISO 8601), but clunky for humans. You could write code that converts a date to a friendly string like "one day from now", but why spend time writing that when someone else already has?

The Humanizer package on NuGet (https://www.nuget.org/packages/Humanizer) solves this problem by providing methods that can "humanize" or rewrite almost anything: dates, times, durations, numbers, and so on. It's a fantastic open-source project that's published under the permissive MIT license.

To add it to your project, run this command in the terminal:

```bash
dotnet add package Humanizer.Core
```

If you peek at the `AspNetCoreTodo.csproj` project file, you'll see a new `PackageReference` line that references `Humanizer.Core`.
## Use in the view
To use a package in your code, you usually need to add a `using` statement that imports the package at the top of the file.

Since Humanizer will be used to rewrite dates as they are rendered in the view, you can use it directly in the view itself. Update the view code to use Humanizer:

**Views/Todo/Index.cshtml**

```razor
@model TodoViewModel;
@using Humanizer;

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
            <td class="done-cell"><input type="checkbox" name="@item.Id" value="true" class="done-checkbox"></td>
            <td>@item.Title</td>
            <td>@item.DueAt.Humanize()</td>
        </tr>
    }
</table>
```

All that needs to be changed is adding the `@using` statement at the top, and calling `DueAt.Humanize()` as the date is written to each table cell.

Now the dates are much friendlier:

!TODO: screenshot

There are packages available on NuGet for everything from parsing XML to machine learning to posting to Twitter. ASP.NET Core itself, under the hood, is nothing more than a collection of NuGet packages that are added to your project.

> Sidebar: The project file created by `dotnet new mvc` includes a single reference to the `Microsoft.AspNetCore.All` package, which is a convenient **metapackage** that references all of the other ASP.NET Core packages you need for a typical project. That way, you don't need to have hundreds of package references in your project file.

In the next chapter, you'll use another set of NuGet packages (Entity Framework Core) to write code that interacts with a database.
