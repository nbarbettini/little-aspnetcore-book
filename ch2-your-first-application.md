# Your first application
Ready to build your first web app with ASP.NET Core? You'll need to gather a few things first:

**Your favorite code editor.** You can use Atom, Sublime, Notepad, or whatever editor you prefer writing code in. If you don't have a favorite, give Visual Studio Code a try. It's a free, cross-platform code editor that has rich support for writing C#, JavaScript, HTML, and more. Just search for "download visual studio code" and follow the instructions.

If you're on Windows, you can also use Visual Studio to build ASP.NET Core applications. You'll need Visual Studio 2017 version 15.3 or later. Visual Studio has great code completion and other features, although Visual Studio Code is close behind.

**The .NET Core SDK.** Regardless of the editor or platform you're using, you'll need to install the .NET Core SDK, which includes the runtime, base libraries, and command line tools you need for building ASP.NET Core apps. The SDK can be installed on Windows, Mac, or Linux.
## Get the SDK
Search for "download .net core" and follow the instructions on Microsoft's download page for your platform. After the SDK has finished installing, open up the Terminal (or PowerShell on Windows) and use the `dotnet` command line tool (or CLI) to make sure everything is working:

```bash
dotnet --version

2.0.0
```

You can get more information about your platform with the `--info` flag:

```bash
dotnet --info

.NET Command Line Tools (2.0.0)

Product Information:
 Version:            2.0.0
 Commit SHA-1 hash:  cdcd1928c9

Runtime Environment:
 OS Name:     Mac OS X
 OS Version:  10.12
 OS Platform: Darwin
 RID:         osx.10.12-x64
 Base Path:   /usr/local/share/dotnet/sdk/2.0.0/

Microsoft .NET Core Shared Framework Host

  Version  : 2.0.0
  Build    : e8b8861ac7faf042c87a5c2f9f2d04c98b69f28d
```

If you see output like the above, you're ready to go!
## Hello World in C#
Before you dive into ASP.NET Core, try creating and running a simple C# application. You can do this all from the command line. First, create a new folder for the project (you can put this anywhere, such as your Documents folder):

```bash
mkdir CsharpHelloWorld
cd CsharpHelloWorld
```

Next, use `dotnet` to create a new project:

```bash
dotnet new console
```

This creates a basic C# program that writes output to the console, comprised of two files: a project file (with a csproj extension) and a C# code file (with a cs extension). Open them both in an editor and you'll see this:

**CsharpHelloWorld.csproj**

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

</Project>
```

The project file is XML-based and defines some metadata about the project. Later, when you reference other packages, those will be listed here (similar to a `project.json` file for npm). You won't have to edit this file directly often.

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

`static void Main` is the entry point method of a C# program, and by convention it's placed in a class called `Program`. The `using` statement at the top imports the built-in System classes from .NET Standard and makes them available to the code in the class.

From inside the project directory, use `dotnet run` to run the program. You'll see the output written to the console after the code compiles:

```bash
dotnet run

Hello World!
```

That's all it takes to scaffold and run a .NET program! Next, you'll do the same thing for an ASP.NET Core application.
## Create an ASP.NET Core project
If you're still in the directory you created for the Hello World sample, move up and create a new directory:

```bash
cd ..
mkdir AspNetCoreTodo
```

Next, create a new project from the `mvc` template with `dotnet new`, and run it with `dotnet run`:

```bash
dotnet new mvc
dotnet run

Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

Instead of printing to the console and quitting, this application starts a web server and listens for requests on port 5000.

Open your web browser and navigate to `http://localhost:5000`. You'll see the default ASP.NET Core splash page! When you're done, press Ctrl-C to stop the server.

## The parts of an ASP.NET Core project
The `dotnet new mvc` template generates a number of files and directories for you. Here's what you get out of the box:

The **Program** and **Startup** classes. These two classes set up the web server and ASP.NET Core pipeline. The Startup class is where you can add middleware that handles and modifies incoming requests, and serves things like static content or error pages. It's also where you add your own services to the dependency injection container (more on this later).

The **Models**, **Views**, and **Controllers** directories contain the components of the Model-View-Controller (MVC) architecture. You'll create all three in the next chapter.

The **wwwroot** directory contains static assets like CSS, JavaScript, and image files. By default, bower is used to manage CSS and JavaScript libraries, but you can use whatever package manager you prefer (npm and yarn are popular choices). Files in wwwroot will be served as static content, and can be bundled and minified automatically.

The **appsettings.json** file contains configuration settings ASP.NET Core will load on startup. You can use this to database connection strings or other things that you don't want to hard-code.

There's plenty more to explore, so let's dive in start building an application.
