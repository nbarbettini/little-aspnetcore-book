# MVC 基础

在这一章，你将探究 ASP.NET Core 中的 MVC 系统。 **MVC**（模型-视图-控制器，Model-View-Controller）是一个构建 web应用 的模式，其应用几乎遍及所有的 web框架（Ruby on Rails 和 Express 就是常见的范例）以及 Angular 这样的前端  JavaScript 框架。iOS 和 Android 上的移动应用也是 MVC 的一个变种。

正如其名字所示，MVC 有三个组件：模型、视图、和控制器。**控制器**处理从客户端浏览器传入的请求，并选定相应的代码进行处理。**视图**就是模板（一般是 HTML 外加某种 Handlebars、Pug、Razor 之类的模板语言），它接收传入的数据并展示给用户。**模型**则保管着数据，要么是准备发送给视图的，要么是用户输入的。

MVC 程序里常见的模式是：

* 控制器接收请求，到数据库查找所需资料
* 控制器使用查找到的信息创建模型，并使之与一个视图绑定
* 视图在用户的浏览器里渲染并呈现
* 用户点击一个按钮或者提交一个表单，从而发送一个新的请求给控制器，重复整个处理流程

如果你用其它开发语言写过 MVC，那你在 ASP.NET Core 里将如鱼得水。如果你是初次跟 MVC 打交道，这一章将教你基础知识，带你上道。

## 练习内容

MVC 练习里的 “Hello World”，就是创建一个待办事项清单应用程序。这是个很棒的练习，麻雀小，五脏俱全，它将涉及 MVC 的各个组件，而且涵盖了很多概念，它们可以直接应用于规模更大的应用程序。

通读本书，你将构建一个待办清单应用，允许用户添加待办项，并在事项完成之后勾掉它。具体来说，你将创建的是：

* 一个 web 应用程序服务器（有时也被称为“后端”），使用 ASP.NET Core、C#和MVC模式
* 一个用于存储用户待办事项条目的数据库，使用 SQLite 数据库引擎和一个被称为 Entity Framework Core 的系统创建
* 让用户通过她们的浏览器进行交互的网页和界面（也被称为“前端”），使用HTML、CSS、JavaScript创建
* 一个登录及安全检查表单，以便每个用户的待办事项列表都保持私密

听起来心动吗？那就整起来吧！你要是还没按上一章所讲，用 `dotnet new mvc` 创建一个新的 ASP.NET Core 项目。那你应该现在就创建并运行那个项目，直到看见默认的欢迎页面为止。

---

# MVC basics
In this chapter, you'll explore the MVC system in ASP.NET Core. **MVC** (Model-View-Controller) is a pattern for building web applications that's used in almost every web framework (Ruby on Rails and Express are popular examples), plus frontend JavaScript frameworks like Angular. Mobile apps on iOS and Android use a variation of MVC as well.

As the name suggests, MVC has three components: models, views, and controllers. **Controllers** handle incoming requests from a client or web browser and make decisions about what code to run. **Views** are templates (usually HTML plus a templating language like Handlebars, Pug, or Razor) that get data added to them and then are displayed to the user. **Models** hold the data that is added to views, or data that is entered by the user.

A common pattern for MVC code is:

* The controller receives a request and looks up some information in a database
* The controller creates a model with the information and attaches it to a view
* The view is rendered and displayed in the user's browser
* The user clicks a button or submits a form, which sends a new request to the controller, and the cycle repeats

If you've worked with MVC in other languages, you'll feel right at home in ASP.NET Core MVC. If you're new to MVC, this chapter will teach you the basics and will help get you started.

## What you'll build
The "Hello World" exercise of MVC is building a to-do list application. It's a great project since it's small and simple in scope, but it touches each part of MVC and covers many of the concepts you'd use in a larger application.

In this book, you'll build a to-do app that lets the user add items to their to-do list and check them off once complete. More specifically, you'll be creating:

* A web application server (sometimes called the "backend") using ASP.NET Core, C#, and the MVC pattern
* A database to store the user's to-do items using the SQLite database engine and a system called Entity Framework Core
* Web pages and an interface that the user will interact with via their browser, using HTML, CSS, and JavaScript (called the "frontend")
* A login form and security checks so each user's to-do list is kept private

Sound good? Let's built it! If you haven't already created a new ASP.NET Core project using `dotnet new mvc`, follow the steps in the previous chapter. You should be able to build and run the project and see the default welcome screen.
