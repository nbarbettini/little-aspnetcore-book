# Use a database

Writing database code can be tricky. Unless you really know what you're doing, it's a bad idea to paste raw SQL query strings into your application code. An **object-relational mapper** (ORM) makes it easier to write code that interacts with a database by adding a layer of abstraction between your code and the database itself. Hibernate in Java and ActiveRecord in Ruby are two well-known ORMs.

There are a number of ORMs for .NET, including one built by Microsoft and included in ASP.NET Core by default: Entity Framework Core. Entity Framework Core makes it easy to connect to a number of different database types, and lets you use C# code to create database queries that are mapped back into C# models (POCOs).

> Remember how creating a service interface decoupled the controller code from the actual service class? Entity Framework Core is like a big interface over your database. Your C# code can stay database-agnostic, and you can swap out different providers depending on the underlying database technology.

Entity Framework Core can connect to relational databases like SQL Server, PostgreSQL, and MySQL, and also works with NoSQL (document) databases like Mongo. During development, you'll use SQLite in this project to make things easy to set up.
