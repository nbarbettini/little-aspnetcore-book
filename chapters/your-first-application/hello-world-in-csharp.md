## Hello World in C# #
Before you dive into ASP.NET Core, try creating and running a simple C# application. You can do this all from the command line. First, create a new folder for the project (you can put this anywhere, such as your home or Documents folder):

```
mkdir CsharpHelloWorld
cd CsharpHelloWorld
```

Next, use `dotnet` to create a new project:

```
dotnet new console
```

This creates a basic C# program that writes some text to the screen. The program is comprised of two files: a project file (with a `.csproj` extension) and a C# code file (with a `.cs` extension). Open them both in an editor and you'll see this:

##### `CsharpHelloWorld.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

</Project>
```

The project file is XML-based and defines some metadata about the project. Later, when you reference other packages, those will be listed here (similar to a `project.json` file for npm). You won't have to edit this file by hand often.

##### `Program.cs`

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

`static void Main` is the entry point method of a C# program, and by convention it's placed in a class called `Program`. The `using` statement at the top imports the built-in System classes from .NET Standard and makes them available to the code in the class.

From inside the project directory, use `dotnet run` to run the program. You'll see the output written to the console after the code compiles:

```
dotnet run

Hello World!
```

That's all it takes to scaffold and run a .NET program! Next, you'll do the same thing for an ASP.NET Core application.
