## Create an ASP.NET Core project
If you're still in the directory you created for the Hello World sample, move back up to your Documents or home directory:

```
cd ..
```

Next, create a new project with `dotnet new`, this time with some extra options:

```
dotnet new mvc --auth Individual -o AspNetCoreTodo
cd AspNetCoreTodo
```

This creates a new project from the `mvc` template, and adds some additional authentication and security bits to the project. (I'll cover security in the *Security and identity* chapter.)

The `-o AspNetCoreTodo` flag tells `dotnet new` to create a new directory called `AspNetCoreTodo` for all the output files. You'll see quite a few files show up in this project directory. Once you `cd` into the new directory, all you have to do is run the project:

```
dotnet run

Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

Instead of printing to the console and exiting, this program starts a web server and waits for requests on port 5000.

Open your web browser and navigate to `http://localhost:5000`. You'll see the default ASP.NET Core splash page, which means your project is working! When you're done, press Ctrl-C in the terminal window to stop the server.

### The parts of an ASP.NET Core project
The `dotnet new mvc` template generates a number of files and directories for you. Here are the most important things you get out of the box:

* The **Program.cs** and **Startup.cs** files set up the web server and ASP.NET Core pipeline. The `Startup` class is where you can add middleware that handles and modifies incoming requests, and serves things like static content or error pages. It's also where you add your own services to the dependency injection container (more on this later).

* The **Models**, **Views**, and **Controllers** directories contain the components of the Model-View-Controller (MVC) architecture. You'll explore all three in the next chapter.

* The **wwwroot** directory contains static assets like CSS, JavaScript, and image files. By default, the bower tool is used to manage CSS and JavaScript packages, but you can use whatever package manager you prefer (npm and yarn are popular choices). Files in `wwwroot` will be served as static content, and can be bundled and minified automatically.

* The **appsettings.json** file contains configuration settings ASP.NET Core will load on startup. You can use this to store database connection strings or other things that you don't want to hard-code.

### Tips for Visual Studio Code

If you're using Visual Studio Code (or Visual Studio) for the first time, here are a couple of helpful tips to get you started:

* **F5 to run (and debug breakpoints)**: With your project open, press F5 to run the project in debug mode. This is the same as `dotnet run` on the command line, but you have the benefit of setting breakpoints in your code by clicking on the left margin:

![Breakpoint in Visual Studio Code](breakpoint.png)

* **Lightbulb to fix problems**: If your code contains red squiggles (compiler errors), put your cursor on the code that's red and look for the lightbulb icon on the left margin. The lightbulb menu will suggest common fixes, like adding a missing `using` statement to your code:

![Lightbulb suggestions](lightbulb.png)

* **Compile quickly**: Use the shortcut `Command-Shift-B` or `Control-Shift-B` to run the Build task, which does the same thing as `dotnet build`.

### A note about Git

If you use Git or GitHub to manage your source code, now is a good time to do `git init` and initialize a Git repository in the project directory. Make sure you add a `.gitignore` file that ignores the `bin` and `obj` directories. The Visual Studio template on GitHub's gitignore template repo (https://github.com/github/gitignore) works great.

There's plenty more to explore, so let's dive in and start building an application!
