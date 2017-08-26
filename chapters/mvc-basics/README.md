# MVC basics
In this chapter, you'll explore the MVC system in ASP.NET Core. **MVC** (Model-View-Controller) is a pattern for building web applications that's found in almost every web framework (Express, Spring, Django, and Laravel are popular examples), as well as frontend JavaScript frameworks like Angular. Mobile apps on iOS and Android use a variation of MVC as well.

As the name suggests, MVC has three components: models, views, and controllers. **Controllers** handle incoming requests from a client or web browser and make decisions about what code to run. **Views** are templates (usually HTML plus some templating language like Handlebars or Pug) that get data added to them and then are displayed to the user. **Models** hold the data that is added to views.

A common pattern for MVC code is: the controller receives a request, does some processing for the user, then fills a model with information about the response and combines the model with a view that's sent back to the user's browser.

If you've worked with MVC in other stacks, you'll feel right at home in ASP.NET Core MVC. If you're new to MVC, you'll learn everything you need to know in this chapter.

## What you'll build
The "Hello World" of MVC is a to-do list application. It's a great exercise since it's small and simple in scope, but it touches each part of MVC and covers many of the concepts you'd use in a larger application.

In this book, you'll build a to-do list that lets the user add items to their to-do list and check them off once complete. You'll build the backend using ASP.NET Core and the MVC pattern, plus HTML, CSS, and a little JavaScript in the views (also called the "frontend" of the application).

If you haven't already created a new ASP.NET Core project using `dotnet new mvc`, follow the steps in the previous chapter. You should be able to build and run the project and see the default welcome screen.
