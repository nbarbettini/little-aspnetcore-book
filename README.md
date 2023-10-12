# 简明 ASP.NET Core 手册

*Nate Barbettini 著*

*windsting 、 yuyi 译*

Copyright &copy; 2018. All rights reserved.

以 创作共用署名4.0国际许可证 发布。您可以自由地：共享 — 在任何媒介以任何形式复制、发行本作品，演绎 — 修改、转换或以本作品为基础进行创作，在任何用途下，甚至商业目的。您必须给出适当的署名，提供指向本许可协议的链接。

详情请访问：https://creativecommons.org/licenses/by/4.0/deed.zh

- If you like this project, please consider 

  <a href="https://www.buymeacoffee.com/windstings"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=windstings&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>

## 前言

感谢你选择这本 简明 ASP.NET Core 手册！我写这本小书的目的，是帮助 web 编程开发者以及爱好者了解 ASP.NET Core 2.0，一个用于创建 Web应用 和 API 的框架。

这本 简明 ASP.NET Core 手册 的内容组织成了一篇教程。你将从头开始，完整地构建一个应用程序，同时了解以下内容：

* MVC (Model-View-Controller) 模式的基本内容
* 前端代码（HTML、CSS、JavaScript）怎样与后端代码交互
* 什么是依赖注入以及它的实用之处
* 如何进行数据库的读写操作
* 如何添加 登录、注册功能，以及如何提升安全性
* 如何部署该应用程序到网络上

别担心，就算对 ASP.NET Core （及以上列表的内容）一无所知，也不妨碍你学下去。

## 开始之前

你将要构建的这个应用，其完整源码位于 GitHub：

https://www.github.com/nbarbettini/little-aspnetcore-todo

如果需要与你自己的代码做对比，可任意下载。

这本书本身也会由于修订和内容的增加而频繁更新。如果你阅读的是 PDF、电子书，或者打印版，请查阅官网([littleasp.net/book](http://www.littleasp.net/book)，中文版为 [windsting.github.io/little-aspnetcore-book/book/](https://windsting.github.io/little-aspnetcore-book/book/))的版本更新。有关版本信息和更新内容，请查阅本书的最后一页。

### 选择你的语言阅读

感谢那些多语言的投稿者，简明 ASP.NET Core 手册 已经被翻译成其它语言：

* [**The Little ASP.NET Core Book**](https://www.recaffeinate.co/book/) (English -- original version)

* [**ASP.NET Core El Kitabı**](https://sahinyanlik.gitbooks.io/kisa-asp-net-core-kitabi/) (Turkish)

## 本书的目标读者

如果你刚开始编程，本书将在“构建最新web应用”方面，使你了解其中的模式和概念。你将以从无到有、循序渐进的方式，学习构建一个 web 应用的方法（以及合理组织各模块的方法）。对于你在编程方面所需的内容，本书不能事无巨细的涵盖，但它可以作为一个起点，引导你了解更高级的内容。

如果你已经在使用诸如 Node、Python、Ruby、Go 或者 Java 之类的后端语言写程序，你会注意到很多熟悉的概念，比如 MVC、视图模板和依赖注入。你将使用 C# 进行编程，但跟你熟知的内容相去不远。

如果你是一个 ASP.NET MVC 开发者，将如鱼得水。 ASP.NET Core 增添了一些新工具，并复用（及简化）了你用过的那些东西。我将在后续章节指出部分差异。

不论你此前在 web 编程方面经验如何，本书都会倾囊相授，足够你借助 ASP.NET Core 创建一个简单但实用的 web 应用。你将学习如何通过前后端代码实现设计目标，如何与数据库交互，如何部署应用到真实环境。

## 什么是 ASP.NET Core？

ASP.NET Core 是一个由微软创建的，用于构建 web 应用、API、微服务 的 web 框架。它使用常见的模式，诸如 MVC（Model-View-Controller）、依赖注入，和一个由中间件构成的请求处理管线。它基于 Apache 2.0 许可证开放源码，就是说，源代码可以自由获取，并且欢迎社区成员以 缺陷修复 和 新功能提交 的方式进行贡献。

ASP.NET Core 运行在微软的 .NET 运行时库上，类似于 Java 的 虚拟机（JVM）或者 Ruby 的解释器。有几种语言（C#，Visual Basic，F#）可以用来编写 ASP.NET Core 程序。C# 是最常见的选择，我在本书中也会采用它。你可以在 Windows、Mac，和 Linux 上构建并运行 ASP.NET Core 应用。

## 又一个 web 框架，需求何在？

现存的 web 框架选项已经很多了：Node/Express、Spring、Ruby on Rails、Django、Laravel 等等，数不胜数。ASP.NET Core 又有什么可取之处呢？

* **速度** ASP.NET Core 很快。因为 .NET Core 是编译运行的，执行速度远高于解释执行的语言，比如 JavaScript 或者 Ruby。ASP.NET Core 也为多线程和异步任务作了专门的优化。与使用 Node.js 写的代码相比，执行速度高出 5-10 倍是很正常的。

* **生态** ASP.NET Core 可能初出茅庐，但 .NET 却已久经考验。在 NuGet（.NET 的包管理系统，类似 npm、Ruby gems，或者 Maven）上有成千上万的软件包。有现成的包可用来完成 JSON 反序列化、数据库连接、PDF生成，或者几乎你能想到的任何需求。

* **安全性** 微软的开发团队很注重安全性，ASP.NET Core 从构建伊始就注重安全。它已经自动处理了净化输入数据和跨域伪造请求(CSRF)，你就不需要操心这些了。你同时还享有 .NET 编译器的静态类型检测的优势，它像个时刻警惕着，还有些强迫症的审校者。这样，在使用一个变量或者某些数据时，那些无意识的错误就插翅难逃了。

## .NET Core 和 .NET 标准

贯穿本书，你将学习有关 ASP.NET Core （web 框架）的知识。我会偶尔提及 .NET 运行时，这个用于运行 .NET 代码的支持库。如果你看着这段已经像天书那么晦涩，直接跳到下一章吧。

你可能还会听说 .NET Core 和 .NET标准，这些命名有些混乱，所以在此做一简短的释疑：

**.NET 标准** 是一个平台无关的接口，它定义了特性和 API。值得指出的是，.NET 标准并不等同于任何实际的代码或者功能，仅仅是 API 的定义。.NET 标准现存多个不同的“版本”或者说级别，反映出提供 API 的数量（或者说 API 所覆盖的广度）。比如 .NET标准2.0 的 API 数量，比 .NET标准1.5 多，后者的 API 又比 .NET标准1.0 多。

**.NET Core** 是可在 Windows、Mac或者Linux上安装的 .NET 运行时库。它在各个操作系统上，使用对应的平台相关代码，实现了定义于 .NET 标准中的 API。这是你将要安装到机器上，用来构建和运行 ASP.NET Core 应用程序的部分。

作为对比，这里要指出， **.NET Framework** 是另一个 .NET标准 的实现，它只能运行在 Windows 上。在 .NET Core 出现并把 .NET 推向 Mac 和 Linux 之前，它是唯一的 .NET 运行时库。 ASP.NET Core 也可以跑在 Windows 专用的 .NET Framework 上，但我不会过多涉及这个主题。

如果你已经被这些命名搞糊涂了，别发愁！咱们马上就要写代码进行实践了。

## ASP.NET 4 开发者注意

如果你从没用过 ASP.NET 以前的版本，直接看下一章去吧！

ASP.NET Core 是对 ASP.NET 彻底的重写，重点关注于：让该框架应用新的开发方法，并最终使其与 System.Web、IIS、和 Windows 解耦。你要是还记得 ASP.NET 4 的 OWIN/Katana 那些内容，你就已经学会一半了： Katana 项目成了 ASP.NET 5，而后者的名字最终被改成了 ASP.NET Core。

作为 Katana 的传承， `Startup` 类成了起始和中心，`Application_Start` 和 `Global.asax` 则不复存在了。整个处理管线由中间件驱动，MVC 和 Web API 不再有区别：控制器可以方便的返回视图、状态码，或者数据。依赖注入功能已经内置了，所以，如果你不想费劲的话，完全可以不用再安装并配置一个服务容器了，比如 StructureMap 或者 Ninject。整个框架已经针对速度和运行时效率进行了优化。

好了，前言就到这儿。开始学习 ASP.NET Core 吧。

---

# The Little ASP.NET Core Book

*by Nate Barbettini*

Copyright &copy; 2018. All rights reserved.

ISBN: 978-1-387-75615-5

Released under the Creative Commons Attribution 4.0 license. You are free to share, copy, and redistribute this book in any format, or remix and transform it for any purpose (even commercially). You must give appropriate credit and provide a link to the license.

For more information, visit https://creativecommons.org/licenses/by/4.0/

## Introduction
Thanks for picking up The Little ASP.NET Core Book! I wrote this short book to help developers and people interested in web programming learn about ASP.NET Core 2.0, a framework for building web applications and APIs.

The Little ASP.NET Core Book is structured as a tutorial. You'll build an application from start to finish and learn:

* The basics of the MVC (Model-View-Controller) pattern
* How front-end code (HTML, CSS, JavaScript) works together with back-end code
* What dependency injection is and why it's useful
* How to read and write data to a database
* How to add log-in, registration, and security
* How to deploy the application to the web

Don't worry, you don't need to know anything about ASP.NET Core (or any of the above) to get started.

## Before you begin

The code for the finished version of the application you'll build is available on GitHub:

https://www.github.com/nbarbettini/little-aspnetcore-todo

Feel free to download it if you want to see the finished product, or compare as you write your own code.

The book itself is updated frequently with bug fixes and new content. If you're reading a PDF, e-book, or print version, check the official website ([littleasp.net/book](http://www.littleasp.net/book)) to see if there's an updated version available. The very last page of the book contains version information and a changelog.

### Reading in your own language

Thanks to some fantastic multilingual contributors, the Little ASP.NET Core Book has been translated into other languages:

* [**ASP.NET Core El Kitabı**](https://sahinyanlik.gitbooks.io/kisa-asp-net-core-kitabi/) (Turkish)
 	 
* [**简明 ASP.NET Core 手册**](https://windsting.github.io/little-aspnetcore-book/book/) (Chinese)


## Who this book is for
If you're new to programming, this book will introduce you to the patterns and concepts used to build modern web applications. You'll learn how to build a web app (and how the big pieces fit together) by building something from scratch! While this little book won't be able to cover absolutely everything you need to know about programming, it'll give you a starting point so you can learn more advanced topics.

If you already code in a backend language like Node, Python, Ruby, Go, or Java, you'll notice a lot of familiar ideas like MVC, view templates, and dependency injection. The code will be in C#, but it won't look too different from what you already know.

If you're an ASP.NET MVC developer, you'll feel right at home! ASP.NET Core adds some new tools and reuses (and simplifies) the things you already know. I'll point out some of the differences below.

No matter what your previous experience with web programming, this book will teach you everything you need to create a simple and useful web application in ASP.NET Core. You'll learn how to build functionality using backend and frontend code, how to interact with a database, and how to deploy the app to the world.

## What is ASP.NET Core?
ASP.NET Core is a web framework created by Microsoft for building web applications, APIs, and microservices. It uses common patterns like MVC (Model-View-Controller), dependency injection, and a request pipeline comprised of middleware. It's open-source under the Apache 2.0 license, which means the source code is freely available, and the community is encouraged to contribute bug fixes and new features.

ASP.NET Core runs on top of Microsoft's .NET runtime, similar to the Java Virtual Machine (JVM) or the Ruby interpreter. You can write ASP.NET Core applications in a number of languages (C#, Visual Basic, F#). C# is the most popular choice, and it's what I'll use in this book. You can build and run ASP.NET Core applications on Windows, Mac, and Linux.

## Why do we need another web framework?
There are a lot of great web frameworks to choose from already: Node/Express, Spring, Ruby on Rails, Django, Laravel, and many more. What advantages does ASP.NET Core have?

* **Speed.** ASP.NET Core is fast. Because .NET code is compiled, it executes much faster than code in interpreted languages like JavaScript or Ruby. ASP.NET Core is also optimized for multithreading and asynchronous tasks. It's common to see a 5-10x speed improvement over code written in Node.js.

* **Ecosystem.** ASP.NET Core may be new, but .NET has been around for a long time. There are thousands of packages available on NuGet (the .NET package manager; think npm, Ruby gems, or Maven). There are already packages available for JSON deserialization, database connectors, PDF generation, or almost anything else you can think of.

* **Security.** The team at Microsoft takes security seriously, and ASP.NET Core is built to be secure from the ground up. It handles things like sanitizing input data and preventing cross-site request forgery (CSRF) attacks, so you don't have to. You also get the benefit of static typing with the .NET compiler, which is like having a very paranoid linter turned on at all times. This makes it harder to do something you didn't intend with a variable or chunk of data.

## .NET Core and .NET Standard
Throughout this book, you'll be learning about ASP.NET Core (the web framework). I'll occasionally mention the .NET runtime, the supporting library that runs .NET code. If this already sounds like Greek to you, just skip to the next chapter!

You may also hear about .NET Core and .NET Standard. The naming gets confusing, so here's a simple explanation:

**.NET Standard** is a platform-agnostic interface that defines features and APIs. It's important to note that .NET Standard doesn't represent any actual code or functionality, just the API definition. There are different "versions" or levels of .NET Standard that reflect how many APIs are available (or how wide the API surface area is). For example, .NET Standard 2.0 has more APIs available than .NET Standard 1.5, which has more APIs than .NET Standard 1.0.

**.NET Core** is the .NET runtime that can be installed on Windows, Mac, or Linux. It implements the APIs defined in the .NET Standard interface with the appropriate platform-specific code on each operating system. This is what you'll install on your own machine to build and run ASP.NET Core applications.

And just for good measure, **.NET Framework** is a different implementation of .NET Standard that is Windows-only. This was the only .NET runtime until .NET Core came along and brought .NET to Mac and Linux. ASP.NET Core can also run on Windows-only .NET Framework, but I won't touch on this too much.

If you're confused by all this naming, no worries! We'll get to some real code in a bit.

## A note to ASP.NET 4 developers
If you haven't used a previous version of ASP.NET, skip ahead to the next chapter.

ASP.NET Core is a complete ground-up rewrite of ASP.NET, with a focus on modernizing the framework and finally decoupling it from System.Web, IIS, and Windows. If you remember all the OWIN/Katana stuff from ASP.NET 4, you're already halfway there: the Katana project became ASP.NET 5 which was ultimately renamed to ASP.NET Core.

Because of the Katana legacy, the `Startup` class is front and center, and there's no more `Application_Start` or `Global.asax`. The entire pipeline is driven by middleware, and there's no longer a split between MVC and Web API: controllers can simply return views, status codes, or data. Dependency injection comes baked in, so you don't need to install and configure a container like StructureMap or Ninject if you don't want to. And the entire framework has been optimized for speed and runtime efficiency.

Alright, enough introduction. Let's dive in to ASP.NET Core!
