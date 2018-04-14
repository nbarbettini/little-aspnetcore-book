## PostgreSQL
PostgreSQL is a popular, open-source database.

Compared to SQLite, using it will allow your ASP.NET Core app to scale better and give you access to various PostgreSQL features like the [PostGIS extension](https://postgis.net/).

Thanks to the layer of abstraction you get from using Entity Framework Core, modifying your application to use a different database is less complex than you would think. Because the user interface wouldn't change, you wouldn't change any code in the `Views`, `Controllers`, or `Services` directories. Despite the database changing, you can also use your existing model classes, so no code needs to change in the `Models` directory either.

As you follow the next steps, you'll see that the only code that must change is the code used to hook up the Entity Framework Core provider. You will use the [Npgsql Entity Framework Core provider](http://www.npgsql.org/efcore/index.html).

### Add provider NuGet package

The provider comes as a NuGet package called `Npgsql.EntityFrameworkCore.PostgreSQL`. To add the package, run the following command:

```
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

After adding the package, you'll notice that the project's `.csproj` file has been updated to reflect the new list of packages:

```xml
<ItemGroup>
  <PackageReference Include="Humanizer" Version="2.2.0" /> <!-- Added earlier -->
  <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.3" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="2.0.1" PrivateAssets="All" />
  <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="2.0.1" PrivateAssets="All" />
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="2.0.1" /> <!-- Added now -->
</ItemGroup>
```

### Modify configuration

Your project's `Startup.cs` file's `ConfigureServices` method currently contains the following code, which hooks up the SQLite provider:

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));
```

Change it to the following code, which will instead hook up the PostgreSQL provider:

```csharp
services.AddEntityFrameworkNpgsql().AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));
```  

The connection string `DefaultConnection` will also have to be updated to reflect connecting to a different database. Right now, your project's `appsettings.json` file contains the following connection string for SQLite:

```
"ConnectionStrings": {
  "DefaultConnection": "DataSource=app.db"
}
```

Change it to the following code to provide a connection string for PostgreSQL:

```
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=5432;User Id=username;Password=secret;Database=todos;"
}
```

The connection string is composed of four parameters:

- You use `localhost` for the `Server` parameter because you'll be running PostgreSQL on your development machine in this tutorial.
- You use `5432` for the `Port` parameter because this is the default port for PostgreSQL, which you won't be changing in this tutorial.
- You use `username` and `secret` for `User Id` and `Password` respectively, because these are simple example values this tutorial uses. In a real world deployment, you would use more secure credentials and tools like the [Secret Manager](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-2.1&tabs=visual-studio) to store them.

### Starting a PostgreSQL database

Setting up PostgreSQL on your development machine is outside of the scope of this book. You can install and start PostgreSQL any way you like, however, a convenient modern way of doing this is using [Docker](https://www.docker.com/). If you've used virtual machines before, Docker "containers" are a similar concept. Think virtualization but without a hypervisor. The containers get direct access to the kernel of the host machine.

With [Docker installed](https://docs.docker.com/install/) on your machine, you can create and run a container from the [`Postgres`](https://hub.docker.com/_/postgres/) image. You will use the same parameters from the connection string defined above to create the container, using the following command:

```
docker run -d -e POSTGRES_USER=username -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=todos -p 5432:5432 --name postgres-todos postgres:latest
```

After creating and starting the container (which is what the `docker run` command does), the container is running in the background and exposing port `5432` so that the running ASP.NET Core application and tools like [pgAdmin](https://www.pgadmin.org/) can connect to it at `localhost`.

### Updating the database

Now that PostgreSQL is running in the background, you can update the database with the same command you used earlier in the tutorial when working with SQLite:

```
dotnet ef database update
```

The reason you must run the migrations again is because this time the connection string defined for the app points to a different database. This new database does not yet have the needed tables created. Running the migrations again at this point in the tutorial prepares the running PostgreSQL database the same way it prepared the SQLite database earlier.

Now that the migrations have been applied, you can use a program like pgAdmin to connect to the database and see the tables that were created:

![pgAdmin showing the tables](pgadmin_aspnetcore_tables_created.png)

Start your app with `dotnet run` and visit `localhost:5000` in your browser. You'll notice that you can create and manipulate `Todo` items just like before, except this time the data is being saved in the PostgreSQL database. Notice how everything works as before, including:

* Model validation
* Identity authentication and authorization
* etc

without having to change any code except load a different Entity Framework Core provider in `Startup.cs`.