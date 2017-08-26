## Create an ASP.NET Core project
If you're still in the directory you created for the Hello World sample, move up and create a new directory:

```
cd ..
mkdir AspNetCoreTodo
```

Next, create a new project from the `mvc` template with `dotnet new`, and run it with `dotnet run`:

```
dotnet new mvc
dotnet run

Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

Instead of printing to the console and quitting, this application starts a web server and listens for requests on port 5000.

Open your web browser and navigate to `http://localhost:5000`. You'll see the default ASP.NET Core splash page! When you're done, press Ctrl-C to stop the server.

### The parts of an ASP.NET Core project
The `dotnet new mvc` template generates a number of files and directories for you. Here's what you get out of the box:

The **Program.cs** and **Startup.cs** files set up the web server and ASP.NET Core pipeline. The `Startup` class is where you can add middleware that handles and modifies incoming requests, and serves things like static content or error pages. It's also where you add your own services to the dependency injection container (more on this later).

The **Models**, **Views**, and **Controllers** directories contain the components of the Model-View-Controller (MVC) architecture. You'll create all three in the next chapter.

The **wwwroot** directory contains static assets like CSS, JavaScript, and image files. By default, bower is used to manage CSS and JavaScript libraries, but you can use whatever package manager you prefer (npm and yarn are popular choices). Files in wwwroot will be served as static content, and can be bundled and minified automatically.

The **appsettings.json** file contains configuration settings ASP.NET Core will load on startup. You can use this to database connection strings or other things that you don't want to hard-code.

There's plenty more to explore, so let's dive in and start building an application.
