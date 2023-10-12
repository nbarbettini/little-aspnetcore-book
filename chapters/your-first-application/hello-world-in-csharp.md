## C# 版的 Hello World

深入钻研 ASP.NET Core 之前，先试着创建并运行一个简单的应用程序吧。

这个可以在命令行下执行。首先开启一个终端窗口（或者 Windows 上的 PowerShell）。一路 `cd` 到要放置你项目的路径下，比如你的“我的文档”目录：

```shell
cd Documents
```

使用 `dotnet` 命令创建一个新的项目：

```shell
dotnet new console -o CsharpHelloWorld
```

`dotnet new` 指令默认会用 C# 创建一个 .NET 项目。参数 `console` 选择了一个命令行应用(一种向屏幕输出文本的程序)的模板。`-o CsharpHelloWorld` 参数指示 `dotnet new` 为项目的所有文件创建一个名为 `CsharpHelloWorld` 的目录。进入到这个新目录里：

```shell
cd CsharpHelloWorld
```

`dotnet new console` 命令创建了一个基本的 C# 程序，它输出文本 `Hello World!` 到屏幕上。这个程序由两个文件构成：一个项目文件（使用 `.csproj` 扩展名）和一个 C# 源文件（带有 `.cs` 扩展名），打开前面那个文件的话，可以看到以下内容：

**CsharpHelloWorld.csproj**

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

</Project>
```

项目文件基于 XML，其中定义了一些关于项目的元数据。到后面，你引用其它包的时候，那些包将被记录在这里（类似于 npm 的 `package.json`），你不需要经常手动编辑这个文件。

**Program.cs**

```csharp
using System;

namespace CsharpHelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
        }
    }
}
```

`static void Main` 是 C# 程序的入口点方法，按照惯例，会被置于一个叫 `Program` 的类（一种代码结构或模块）里。最上面的 `using` 语句引入了 .NET 内置于 `System` 的那些类，以便在你的这个类里使用它们。

在项目的目录里，用 `dotnet run` 指令运行这个程序，在代码编译完成之后，你将看到输出在控制台里面的内容：

```shell
dotnet run

Hello World!
```

这就是构建一个 .NET 程序所需的全部！下一节，你将把同样的流程应用在一个 ASP.NET Core 程序上。

---

## Hello World in C# #
Before you dive into ASP.NET Core, try creating and running a simple C# application.

You can do this all from the command line. First, open up the Terminal (or PowerShell on Windows). Navigate to the location you want to store your projects, such as your Documents directory:

```
cd Documents
```

Use the `dotnet` command to create a new project:

```
dotnet new console -o CsharpHelloWorld
```

The `dotnet new` command creates a new .NET project in C# by default. The `console` parameter selects a template for a console application (a program that outputs text to the screen). The `-o CsharpHelloWorld` parameter tells `dotnet new` to create a new directory called `CsharpHelloWorld` for all the project files. Move into this new directory:

```
cd CsharpHelloWorld
```

`dotnet new console` creates a basic C# program that writes the text `Hello World!` to the screen. The program is comprised of two files: a project file (with a `.csproj` extension) and a C# code file (with a `.cs` extension). If you open the former in a text or code editor, you'll see this:

**CsharpHelloWorld.csproj**

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

</Project>
```

The project file is XML-based and defines some metadata about the project. Later, when you reference other packages, those will be listed here (similar to a `package.json` file for npm). You won't have to edit this file by hand very often.

**Program.cs**

```csharp
using System;

namespace CsharpHelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
        }
    }
}
```

`static void Main` is the entry point method of a C# program, and by convention it's placed in a class (a type of code structure or module) called `Program`. The `using` statement at the top imports the built-in `System` classes from .NET and makes them available to the code in your class.

From inside the project directory, use `dotnet run` to run the program. You'll see the output written to the console after the code compiles:

```
dotnet run

Hello World!
```

That's all it takes to scaffold and run a .NET program! Next, you'll do the same thing for an ASP.NET Core application.
