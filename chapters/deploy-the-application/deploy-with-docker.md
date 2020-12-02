## 使用 Docker 进行部署

如果你不使用 Azure 这样的平台，像 Docker 这样的容器化技术能极大地简化把 web 程序部署到你自己服务器上的工作。不再需要浪费时间在一个服务器上配置你程序所需的依赖、复制文件、重启进程，你只需要创建一个 Docker 镜像，里面包含你程序运行所需的一切，然后在任何 Docker 宿主机上作为容器启动起来就行了。

Docker 也便于把你的应用扩展为多个服务器。一旦你创建了一个镜像，用它来创建 1 个容器和 100 个容器所需要的工作是一样的。

开始之前，需要在你的开发机上安装 Docker CLI。搜索 "get docker for (mac/windows/linux)" 并执行 Docker 官网的提示内容。要检验是否安装成功，可以执行：

```
docker version
```

### 添加 Dockerfile

首先需要的就是一个 Dockerfile，它就像个清单，告诉 Docker 你程序的构建和运行需要些什么。

在程序根目录，也就是最外层的 `AspNetCoreTodo` 文件夹里，创建一个名为 `Dockerfile`（没有扩展名）的文件。用你常用的编辑器打开它，输入下面这行：

```dockerfile
FROM microsoft/dotnet:2.0-sdk AS build
```

这指示 Docker 以 `microsoft/dotnet:2.0-sdk` 为基础创建你的镜像。这个镜像是微软发布的，其中包含了执行 `dotnet build` 编译程序所需的工具和依赖。以这个预编译镜像为基础，Docker 可以优化镜像生成过程并使它容量紧凑。

接下来，添加这一行：

```dockerfile
COPY AspNetCoreTodo/*.csproj ./app/AspNetCoreTodo/
```

这条 `COPY` 指令复制 `.csproj` 项目文件到镜像里的路径 `/app/AspNetCoreTodo/` 下。注意实际的代码（`.cs` 文件）并未复制到镜像里。你稍后即可弄清个中缘由。

```dockerfile
WORKDIR /app/AspNetCoreTodo
RUN dotnet restore
```

`WORKDIR` 是 Docker 里的 `cd`。Dockerfile 中之后的命令都会在这个 `/app/AspNetCoreTodo` 文件夹内执行，该文件夹是上一步的 `COPY` 命令创建的。

运行 `dotnet restore` 命令重建在 `.csproj` 中定义的那些程序所需的 NuGet 包。在添加其它代码 **之前** 于镜像中重建这些包，Docker 将有能力缓存这些重建的包。然后，当你修改代码（而没修改项目文件中定义的包）时，重建这个 Docker 镜像将会非常迅速。

现在，就到了复制其余代码并编译程序的时候了：

```dockerfile
COPY AspNetCoreTodo/. ./AspNetCoreTodo/
RUN dotnet publish -o out /p:PublishWithAspNetCoreTargetManifest="false"
```

`dotnet publish` 命令编译项目，而 `-o out` 标识会将结果输出到一个名为 `out` 的目录里。

这些编译好的文件，将会通过这最终的几条命令，运行起这个程序：

```dockerfile
FROM microsoft/dotnet:2.0-runtime AS runtime
ENV ASPNETCORE_URLS http://+:80
WORKDIR /app
COPY --from=build /app/AspNetCoreTodo/out ./
ENTRYPOINT ["dotnet", "AspNetCoreTodo.dll"]
```

`FROM` 命令再次被用到，以选择一个较小的镜像，其中仅含有运行程序所需的依赖。`ENV` 命令用于容器中的设置环境变量，环境变量 `ASPNETCORE_URLS` 指示 ASP.NET Core 应该把服务绑定到哪个网卡和端口上（本例中时 80 端口）。

`ENTRYPOINT` 命令给 Docker 指出了在被运行的时候去执行 `dotnet AspNetCoreTodo.dll`。这条命令告诉 `dotnet`，使用先前由 `dotnet publish` 编译出来的文件启动你的程序。（当你在开发时运行 `dotnet run`，它一步就完成了这些事情。）

完整的 Dockerfile 看起来是这样的：

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

### 创建一个镜像

确保 Dockerfile 已经保存好了，然后用 `docker build` 命令创建一个镜像：

```
docker build -t aspnetcoretodo .
```

不要漏掉结尾那个句点！它告诉 Docker 在当前目录下查找 Dockerfile。

一旦镜像创建完成，你可以运行 `docker images` 命令列出你本地电脑上的全部镜像。要通过容器尝试一下，请执行：

```
docker run --name aspnetcoretodo_sample --rm -it -p 8080:80 aspnetcoretodo
```

`-it` 标识告诉 Docker 以交互模式运行这个容器（输出到终端，而不是在后台运行）。当你想要停止这个容器的时候，按 `Control-C`。

还记得环境变量 `ASPNETCORE_URLS` 指示 ASP.NET Core 去监听 80 端口吗？这里的 `-p 8080:80` 选项指示 Docker 把 *你的* 电脑的 8080 端口映射到 *容器的* 80端口。打开你的浏览器，浏览地址 http://localhost:8080 去查看运行在容器中的程序。

### 设置 Nginx

在本章开头，我提到过，你应该使用一个 Nginx 之类的反向代理服务器，把请求代理到 Kestrel 上。这件事也可以用 Docker 来做。

整体架构会包括两个容器：一个 Nginx 容器监听 80 端口，把请求转发到另一个运行着 Kestrel 并监听 5000 端口的容器。

Nginx 容器自己也需要一个 Dockerfile。为避免跟你刚才创建那个 Dockerfile 冲突，在 Web 程序根目录新建一个目录：

```
mkdir nginx
```

创建一个新的 Dockerfile 并添加这些行：

**nginx/Dockerfile**

```dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

接下来，创建一个 `nginx.conf` 文件：

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

这个配置文件告诉 Nginx 把接到的请求转发到 `http://kestrel:80`。（你马上就会知道为什么要使用 `kestrel` 作为主机名。）

> 当你把程序部署到生产环境，你应该添加 `server_name` 指令，并验证及限定 host 头字段为一个已知的有效值（known good values）。更多信息请参见：  
> https://github.com/aspnet/Announcements/issues/295

### 设置 Docker Compose

还需要创建一个文件，回到 Web 程序的根目录，创建 `docker-compose.yml`：

**`docker-compose.yml`**

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

Docker Compose 是个帮助你创建并运行多容器程序的工具。这个配置文件定义了两个容器： 用 `./nginx/Dockerfile` 清单创建 `nginx`，用 `./Dockerfile` 创建 `kestrel`。这两个容器显式地链接在一起，所以它们可以互相通信。

你可以运行以下指令来启动这个多容器程序：

```
docker-compose up
```

打开一个浏览器并导航至 `http://localhost`（不是 8080！）。Nginx 在 80 （HTTP 的默认）端口上进行监听，并把请求转发到由  Kestrel 托管的 ASP.NET Core 程序。

### 搭建 Docker 服务器

详尽的设置指令超出了这本书的范畴，但是任何较新的 Linux 发行版（例如 Ubuntu）都可以搭建成一个 Docker 宿主。例如，你可以用亚马逊 EC2 创建一个虚拟机，在上面安装 Docker 服务，为此你可以搜索 “amazon ec2 set up docker” 以获取说明。

我更喜欢用 DigitalOcean，因为他们把入门的门槛降得非常低。DigitalOcean 既有现成的 Docker 虚拟机，也有关于搭建和运行 Docker 的深度教程（请搜索“digitalocean docker”）。

---

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

The `dotnet publish` command compiles the project, and the `-o out` flag puts the compiled files in a directory called `out`.

These compiled files will be used to run the application with the final few commands:

```dockerfile
FROM microsoft/dotnet:2.0-runtime AS runtime
ENV ASPNETCORE_URLS http://+:80
WORKDIR /app
COPY --from=build /app/AspNetCoreTodo/out ./
ENTRYPOINT ["dotnet", "AspNetCoreTodo.dll"]
```

The `FROM` command is used again to select a smaller image that only has the dependencies needed to run the application. The `ENV` command is used to set environment variables in the container, and the `ASPNETCORE_URLS` environment variable tells ASP.NET Core which network interface and port it should bind to (in this case, port 80).

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

The `-it` flag tells Docker to run the container in interactive mode (outputting to the terminal, as opposed to running in the background). When you want to stop the container, press Control-C.

Remember the `ASPNETCORE_URLS` variable that told ASP.NET Core to listen on port 80? The `-p 8080:80` option tells Docker to map port 8080 on *your* machine to the *container's* port 80. Open up your browser and navigate to http://localhost:8080 to see the application running in the container!

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

> When you make deploy your application to a production environment, you should add the `server_name` directive and validate and restrict the host header to known good values. For more information, see:

> https://github.com/aspnet/Announcements/issues/295

### Set up Docker Compose

There's one more file to create. Up in the root directory, create `docker-compose.yml`:

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

Try opening a browser and navigating to http://localhost (port 80, not 8080!). Nginx is listening on port 80 (the default HTTP port) and proxying requests to your ASP.NET Core application hosted by Kestrel.

### Set up a Docker server

Specific setup instructions are outside the scope of this book, but any modern flavor of Linux (like Ubuntu) can be used to set up a Docker host. For example, you could create a virtual machine with Amazon EC2, and install the Docker service. You can search for "amazon ec2 set up docker" (for example) for instructions.

I like using DigitalOcean because they've made it really easy to get started. DigitalOcean has both a pre-built Docker virtual machine, and in-depth tutorials for getting Docker up and running (search for "digitalocean docker").
