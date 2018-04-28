## Deploy with Docker

If you aren't using a platform like Azure, containerization technologies like Docker can make it easy to deploy web applications to your own servers. Instead of spending time configuring a server with the dependencies it needs to run your app, copying files, and restarting processes, you can simply create a Docker image that describes everything your app needs to run, and spin it up as a container on any Docker host.

Docker can make scaling your app across multiple servers easier, too. Once you have an image, using it to create 1 container is the same process as creating 100 containers.

Before you start, you need the Docker CLI installed on your development machine. Search for "get docker for (mac/windows/linux)" and follow the instructions on the official Docker website. You can verify that it's installed correctly with

```
docker version
```

### Add a Dockerfile

The first thing you'll need is a Dockerfile, which is like a recipe that tells Docker what your application needs to build and run.

Create a file called `Dockerfile` (no extension) in the root, top-level `AspNetCoreTodo` folder. Open it in your favorite editor. Write the following line:

```dockerfile
FROM microsoft/dotnet:2.0-sdk AS build
```

This tells Docker to use the `microsoft/dotnet:2.0-sdk` image as a starting point. This image is published by Microsoft and contains the tools and dependencies you need to execute `dotnet build` and compile your application. By using this pre-built image as a starting point, Docker can optimize the image produced for your app and keep it small.

Next, add this line:

```dockerfile
COPY AspNetCoreTodo/*.csproj ./app/AspNetCoreTodo/
```

The `COPY` command copies the `.csproj` project file into the image at the path `/app/AspNetCoreTodo/`. Note that none of the actual code (`.cs` files) have been copied into the image yet. You'll see why in a minute.

```dockerfile
WORKDIR /app/AspNetCoreTodo
RUN dotnet restore
```

`WORKDIR` is the Docker equivalent of `cd`. This means any commands executed next will run from inside the `/app/AspNetCoreTodo` directory that the `COPY` command created in the last step.

Running the `dotnet restore` command restores the NuGet packages that the application needs, defined in the `.csproj` file. By restoring packages inside the image **before** adding the rest of the code, Docker is able to cache the restored packages. Then, if you make code changes (but don't change the packages defined in the project file), rebuilding the Docker image will be super fast.

Now it's time to copy the rest of the code and compile the application:

```dockerfile
COPY AspNetCoreTodo/. ./AspNetCoreTodo/
RUN dotnet publish -o out /p:PublishWithAspNetCoreTargetManifest="false"
```

The `dotnet publish` command compiles the project, and the `-o out` flag puts the compiled files in a directory called `out`. These compiled files will be used to run the application with the final few commands:

```dockerfile
FROM microsoft/dotnet:2.0-runtime AS runtime
ENV ASPNETCORE_URLS http://+:80
WORKDIR /app
COPY --from=build /app/AspNetCoreTodo/out ./
ENTRYPOINT ["dotnet", "AspNetCoreTodo.dll"]
```

The `FROM` command is used again to select a smaller image that only has the dependencies needed to run the application. The `ENV` command is used to set environment variables in the container. The `ASPNETCORE_URLS` environment variable tells ASP.NET Core which network interface and port it should bind to (in this case, port 80).

The `ENTRYPOINT` command lets Docker know that the container should be started as an executable by running `dotnet AspNetCoreTodo.dll`. This tells `dotnet` to start up your application from the compiled file created by `dotnet publish` earlier. (When you do `dotnet run` during development, you're accomplishing the same thing in one step.)

The full Dockerfile looks like this:

**Dockerfile**

```dockerfile
FROM microsoft/dotnet:2.0-sdk AS build
COPY AspNetCoreTodo/*.csproj ./app/AspNetCoreTodo/
WORKDIR /app/AspNetCoreTodo
RUN dotnet restore

COPY AspNetCoreTodo/. ./
RUN dotnet publish -o out /p:PublishWithAspNetCoreTargetManifest="false"

FROM microsoft/dotnet:2.0-runtime AS runtime
ENV ASPNETCORE_URLS http://+:80
WORKDIR /app
COPY --from=build /app/AspNetCoreTodo/out ./
ENTRYPOINT ["dotnet", "AspNetCoreTodo.dll"]
```

### Create an image

Make sure the Dockerfile is saved, and then use `docker build` to create an image:

```
docker build -t aspnetcoretodo .
```

Don't miss the trailing period! That tells Docker to look for a Dockerfile in the current directory.

Once the image is created, you can run `docker images` to to list all the images available on your local machine. To test it out in a container, run

```
docker run --name aspnetcoretodo_sample --rm -it -p 8080:80 aspnetcoretodo
```

The `-it` flag tells Docker to run the container in interactive mode (outputting to the terminal, as opposed to running in the background). When you want to stop the container, press `Control-C`.

Remember the `ASPNETCORE_URLS` variable that told ASP.NET Core to listen on port 80? The `-p 8080:80` option tells Docker to map port 8080 on **your** machine to the **container's** port 80. Open up your browser and navigate to http://localhost:8080 to see the application running in the container!

### Set up Nginx

At the beginning of this chapter, I mentioned that you should use a reverse proxy like Nginx to proxy requests to Kestrel. You can use Docker for this, too.

The overall architecture will consist of two containers: an Nginx container listening on port 80, forwarding requests to the container you just built that hosts your application with Kestrel.

The Nginx container needs its own Dockerfile. To keep it from conflicting with the Dockerfile you just created, make a new directory in the web application root:

```
mkdir nginx
```

Create a new Dockerfile and add these lines:

**nginx/Dockerfile**

```dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

Next, create an `nginx.conf` file:

**nginx/nginx.conf**

```
events { worker_connections 1024; }

http {
    server {
        listen 80;
        location / {
          proxy_pass http://kestrel:80;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'keep-alive';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
        }
    }
}
```

This configuration file tells Nginx to proxy incoming requests to `http://kestrel:80`. (You'll see why `kestrel` works as a hostname in a moment.)

> When you make deploy your application to a production environment, you should add the `server_name` directive and validate and restrict the host header to known good values. For more information, see https://github.com/aspnet/Announcements/issues/295.

### Set up Docker Compose

There's one more file to create. Up in the web application root directory, create `docker-compose.yml`:

**docker-compose.yml**

```yaml
nginx:
    build: ./nginx
    links:
        - kestrel:kestrel
    ports:
        - "80:80"
kestrel:
    build: .
    ports:
        - "80"
```

Docker Compose is a tool that helps you create and run multi-container applications. This configuration file defines two containers: `nginx` from the `./nginx/Dockerfile` recipe, and `kestrel` from the `./Dockerfile` recipe. The containers are explicitly linked together so they can communicate.

You can try spinning up the entire multi-container application by running:

```
docker-compose up
```

Try opening a browser and navigating to `http://localhost` (not 8080!). Nginx is listening on port 80 (the default HTTP port) and proxying requests to your ASP.NET Core application hosted by Kestrel.

### Set up a Docker server

Specific setup instructions are outside the scope of this book, but any modern flavor of Linux (like Ubuntu) can be used to set up a Docker host. For example, you could create a virtual machine with Amazon EC2, and install the Docker service. You can search for "amazon ec2 set up docker" (for example) for instructions.

I like using DigitalOcean because they've made it really easy to get started. DigitalOcean has both a pre-built Docker virtual machine, and in-depth tutorials for getting Docker up and running (search for "digitalocean docker").
