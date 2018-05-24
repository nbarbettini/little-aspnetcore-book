# 运用数据库

与数据库交互的代码写起来坑很多。除非你对其了如指掌，否则在程序代码里粘贴 SQL 查询字符串就是个糟糕的决定。一个 **对象-关系 映射(object-relational mapper)** （ORM）在你的代码和数据库之间添加一个抽象层，并以此简化了与数据库交互代码的编写。Java 中的 Hibernate 和 Ruby 中的 ActiveRecord 就是广为人知的 ORM。

.NET 上有多个 ORM，其中有一个由微软开发，并默认包含在 ASP.NET Core 中，这就是 Entity Framework Core。Entity Framework Core 支持多个不同类型的数据库，并允许你使用 C# 代码创建数据库查询语句，查询结果映射回 C# 模型（POCO）。

> 还记得创建服务接口以解耦控制器和服务的实现类吗？Entity Framework Core 就像一个数据库上的大型接口，你可以根据底层以来的数据库技术更换不同的 provider。

Entity Framework Core 可以连接到 SQL Server 和 MySQL 这种 SQl 数据库，也可以与 Mongo 这种 NoSQL（文档） 数据库协作。在本项目里，你将使用一个 SQLite 数据库，但你愿意的话，可以用一个不同的数据库。

---

# Use a database

Writing database code can be tricky. Unless you really know what you're doing, it's a bad idea to paste raw SQL query strings into your application code. An **object-relational mapper** (ORM) makes it easier to write code that interacts with a database by adding a layer of abstraction between your code and the database itself. Hibernate in Java and ActiveRecord in Ruby are two well-known ORMs.

There are a number of ORMs for .NET, including one built by Microsoft and included in ASP.NET Core by default: Entity Framework Core. Entity Framework Core makes it easy to connect to a number of different database types, and lets you use C# code to create database queries that are mapped back into C# models (POCOs).

> Remember how creating a service interface decoupled the controller code from the actual service class? Entity Framework Core is like a big interface over your database. Your C# code can stay database-agnostic, and you can swap out different providers depending on the underlying database technology.

Entity Framework Core can connect to relational databases like SQL Server, PostgreSQL, and MySQL, and also works with NoSQL (document) databases like Mongo. During development, you'll use SQLite in this project to make things easy to set up.
