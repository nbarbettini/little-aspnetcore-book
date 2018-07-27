# Add external packages
One of the big advantages of using a mature ecosystem like .NET is that the number of third-party packages and plugins is huge. Just like other package systems, you can download and install .NET packages that help with almost any task or problem you can imagine.

NuGet is both the package manager tool and the official package repository (at https://www.nuget.org). You can search for NuGet packages on the web, and install them from your local machine through the terminal (or the GUI, if you're using Visual Studio).

## Install the Humanizer package
At the end of the last chapter, the to-do application displayed to-do items like this:

![Dates in ISO 8601 format](iso8601.png)

The due date column is displaying dates in a format that's good for machines (called ISO 8601), but clunky for humans. Wouldn't it be nicer if it simply read "X days from now"?

You could write code yourself that converted an ISO 8601 date into a human-friendly string, but fortunately, there's a faster way.

The Humanizer package on NuGet solves this problem by providing methods that can "humanize" or rewrite almost anything: dates, times, durations, numbers, and so on. It's a fantastic and useful open-source project that's published under the permissive MIT license.

To add it to your project, run this command in the terminal:

```
dotnet add AspNetCoreTodo package Humanizer
```

If you peek at the `AspNetCoreTodo.csproj` project file, you'll see a new `PackageReference` line that references `Humanizer`.

## Use Humanizer in the view

To use a package in your code, you usually need to add a `using` statement that imports the package at the top of the file.

Since Humanizer will be used to rewrite dates rendered in the view, you can use it directly in the view itself. First, add a `@using` statement at the top of the view:

**Views/Todo/Index.cshtml**

```html
@model TodoViewModel
@using Humanizer

// ...
```

Then, update the line that writes the `DueAt` property to use Humanizer's `Humanize` method:

```html
<td>@item.DueAt.Humanize()</td>
```

Now the dates are much more readable:

![Human-readable dates](friendly-dates.png)

There are packages available on NuGet for everything from parsing XML to machine learning to posting to Twitter. ASP.NET Core itself, under the hood, is nothing more than a collection of NuGet packages that are added to your project.

> The project file created by `dotnet new mvc` includes a single reference to the `Microsoft.AspNetCore.All` package, which is a convenient "metapackage" that references all of the other ASP.NET Core packages you need for a typical project. That way, you don't need to have hundreds of package references in your project file.

In the next chapter, you'll use another set of NuGet packages (a system called Entity Framework Core) to write code that interacts with a database.
