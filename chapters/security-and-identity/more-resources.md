## 附加资源

ASP.NET Core Identity 帮助你添加诸如 登录、注册 这些安全及身份鉴别的特性到程序里。`dotnet new` 指定的模板带给你预先构建好的视图和控制器，用以处理这些常见情景，以便你快速上手和运行。

ASP.NET Core Identity 还有很多其它功能，例如密码重置以及社交账户登录。位于 http://docs.asp.net 的文档非常适合用来学习这些特性。

### ASP.NET Core Identity 的替代品

ASP.NET Core Identity 并非添加身份鉴别的唯一方式。另外一种选择是使用诸如 Azure Active Directory 以及 Okta 这种云端的服务为你的程序处理身份验证。你可以把这些选项看作发展的各个环节：

* **自己处理安全性**：不推荐，除非你是一个安全性方面的专家！
* **ASP.NET Core Identity**：你免费获得随模板而来的大量代码，易于上手。对于进阶的情形，你依然需要写一部分代码，并维护一个数据库以存储用户信息。
* **基于云的身份鉴别服务**：这种服务既处理简单情况也处理复杂情况（多步验证、账号找回，），并且能极大地缩减你需要编写的代码量，和维护程序的工作量。另外，用户数据的敏感部分并不会保存在你的数据库里。

在本项目里，ASP.NET Core Identity 非常适合。对于更复杂的项目，我建议对各选项都作一些研究和尝试，以便找到你所需的最佳方案。

---

## More resources

ASP.NET Core Identity helps you add security and identity features like login and registration to your application. The `dotnet new` templates give you pre-built views and controllers that handle these common scenarios so you can get up and running quickly.

There's much more that ASP.NET Core Identity can do, such as password reset and social login. The documentation available at http://docs.asp.net is a fantastic resource for learning how to add these features.

### Alternatives to ASP.NET Core Identity

ASP.NET Core Identity isn't the only way to add identity functionality. Another approach is to use a cloud-hosted identity service like Azure Active Directory B2C or Okta to handle identity for your application. You can think of these options as part of a progression:

* **Do-it-yourself security**: Not recommended, unless you are a security expert!
* **ASP.NET Core Identity**: You get a lot of code for free with the templates, which makes it pretty easy to get started. You'll still need to write some code for more advanced scenarios, and maintain a database to store user information.
* **Cloud-hosted identity services**. The service handles both simple and advanced scenarios (multi-factor authentication, account recovery, federation), and significantly reduces the amount of code you need to write and maintain in your application. Plus, sensitive user data isn't stored in your own database.

For this project, ASP.NET Core Identity is a great fit. For more complex projects, I'd recommend doing some research and experimenting with both options to understand which is best for your use case.
