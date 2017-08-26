# Introduction
Thanks for picking up the Little ASP.NET Core Book! I wrote this short book to help developers and people interested in web programming learn about ASP.NET Core, a new framework for building web applications and APIs.

The Little ASP.NET Core Book is structured as a tutorial. You'll work on one application from start to finish. You don't need to know anything about ASP.NET Core to get started.

## Who this book is for
If you're new to programming, this book will introduce you to the patterns and concepts used to build modern web applications. You'll learn how everything fits together and how to build an app from scratch.

If you already code in a backend language like Node, Python, Ruby, Go, or Java, you'll notice a lot of familiar ideas like MVC, view templating, and dependency injection. The code examples will be in C#, but it won't look too different from what you already know.

If you're an ASP.NET MVC developer, you'll feel right at home! ASP.NET Core adds some new tools and reuses some things you already know. I'll point out some of the differences below.

No matter what your previous experience with web programming, this book will show you everything you need to create a web application in ASP.NET Core. You'll learn how to build functionality using backend and frontend code, how to interact with a database, and how to test and deploy the app to the web.
## What is ASP.NET Core?
ASP.NET Core is a web framework created by Microsoft for building modern web applications, APIs, and microservices. It uses standard patterns like MVC (Model-View-Controller), dependency injection, and a request pipeline comprised of middleware. It's open-source under the Apache 2.0 license, which means the code is freely available, and the community is encouraged to contribute bug fixes and new features.

ASP.NET Core runs on top of Microsoft's .NET runtime, similar to the Java Virtual Machine (JVM) or the Ruby interpreter. You can write ASP.NET Core applications in any .NET language (C#, Visual Basic, F#). C# is the most popular choice, and it's what I'll use in this book.

In the past, .NET code could only run on Windows, but no longer! Microsoft recently released a cross-platform version of the runtime called .NET Core (more on this naming later). You can build and run ASP.NET Core applications on Windows, Mac, and Linux.

## Why do we need another web framework?
There are a lot of great web frameworks to choose from already: Node/Express, Spring, Ruby on Rails, Django, Laravel, and many more. What benefits does ASP.NET Core bring to the table?

**Speed.** ASP.NET Core is fast. Because .NET code is compiled, it executes much faster than code in interpreted languages like JavaScript or Ruby. ASP.NET Core is also optimized for multithreading and asynchronous code. It's common to see a 5-10x speed improvement over code written in Node.js. (Although, as they say: there are lies, damn lies, statistics, and then benchmarks.)


**Ecosystem.** ASP.NET Core may be new, but .NET has been around for a long time. There are thousands of packages available on NuGet (the .NET package manager, think npm, Ruby gems, or Maven). If you need JSON deserialization, database connections, PDF generation, or almost anything else, there's already a package available for free.


**Security.** The team at Microsoft takes security seriously, and ASP.NET Core is built to be secure from the ground up. It handles things like sanitizing input data and preventing cross-site request forgery (XSRF) automatically, so you don't have to. You also get the benefit of static typing with the .NET compiler, which is like having a very paranoid linter turned on at all times. This makes it harder to do something you didn't intend with a variable or chunk of data.
## .NET Core and .NET Standard
Throughout this book, you'll be learning about ASP.NET Core (the web framework). I'll occasionally mention the .NET runtime (the supporting library that compiles and runs .NET code).

You'll also hear about .NET Core and .NET Standard. The naming gets confusing, so here's a simple explanation:

**.NET Standard** is a platform-agnostic interface that defines what features and APIs are available in .NET. (This is like the built-in or system classes available in Java, Node, Go, and any other language).

.NET Standard doesn't represent any actual code or functionality, just the API definition. There are different "versions" or levels of .NET Standard that reflect how many APIs are available (or how wide the API surface area is). For example, .NET Standard 2.0 has more APIs available than .NET Standard 1.5, which has more APIs than .NET Standard 1.0. An installation of .NET on a particular platform will support one or more versions of .NET Standard.

**.NET Core** is the .NET runtime that can be installed on Windows, Mac, or Linux. It implements each API in the .NET Standard interface with the appropriate platform-specific code. This is what you'll install to build and run ASP.NET Core applications.

And just for good measure, **.NET Framework** is a different implementation of .NET Standard that is Windows-only. This was the only .NET runtime until .NET Core came along and opened .NET up to Mac and Linux. ASP.NET Core can also run on Windows-only .NET Framework, but I won't touch on this too much. 

If you're confused by all this naming, don't worry! We'll get to some real code in just a bit.
A note to ASP.NET developers
If you haven't used a previous version of ASP.NET, feel free to skip ahead to the next chapter!

ASP.NET Core is a complete ground-up rewrite of ASP.NET, with a focus on modernizing the framework and finally decoupling it from System.Web and IIS (and Windows!). If you remember all the OWIN/Katana stuff from ASP.NET 4, you'll see some familiar ideas: the Katana project became ASP.NET 5 which was ultimately renamed to ASP.NET Core.

Because of the Katana legacy, the `Startup` class is front and center, and there's no more `Application_Start` or `Global.asax`. The entire pipeline is driven by middleware, and there's no longer a split between the MVC pipeline and the Web API pipeline (controllers can simply return views, status codes, or data).

Dependency injection comes in the box, so you don't need to install and configure a DI container like StructureMap or Ninject if you don't want to. Serializing and deserializing JSON comes in the box too, thanks to JSON.NET. The whole stack is built with async best practices, so you can and should use async/await when making calls to databases or network services. And the entire framework has been optimized for speed and runtime efficiency.

There are many more improvements to note, but enough talk. Let's dive in!
