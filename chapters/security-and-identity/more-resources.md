## More resources

ASP.NET Core Identity helps you add security and identity features like login and registration to your application. The `dotnet new` templates give you pre-built views and controllers that handle these common scenarios so you can get up and running quickly.

There's much more that ASP.NET Core Identity can do, such as password reset and social login. The documentation available at http://docs.asp.net is a fantastic resource for learning how to add these features.

### Alternatives to ASP.NET Core Identity

ASP.NET Core Identity isn't the only way to add identity functionality. Another approach is to use a cloud-hosted identity service like Azure Active Directory B2C or Okta to handle identity for your application. You can think of these options as part of a progression:

* **Do-it-yourself security**: Not recommended, unless you are a security expert!
* **ASP.NET Core Identity**: You get a lot of code for free with the templates, which makes it pretty easy to get started. You'll still need to write some code for more advanced scenarios, and maintain a database to store user information.
* **Cloud-hosted identity services**. The service handles both simple and advanced scenarios (multi-factor authentication, account recovery, federation), and significantly reduces the amount of code you need to write and maintain in your application. Plus, sensitive user data isn't stored in your own database.

For this project, ASP.NET Core Identity is a great fit. For more complex projects, I'd recommend doing some research and experimenting with both options to understand which is best for your use case.
