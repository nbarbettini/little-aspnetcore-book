## 使用 Docker 进行部署

像 Docker 这样的容器化技术极大地简化了 web 程序的部署工作。不再需要浪费时间在一个服务器上配置你程序所需的依赖、复制文件、重启进程，你只需要创建一个 Docker 镜像，里面包含你程序运行所需的一切，然后在任何 Docker 宿主机上作为容器启动起来就行了。

Docker 也便于把你的应用扩展为多个服务器。一旦你创建了一个镜像，用它来创建 1 个容器和 100 个容器所需要的工作是一样的。

开始之前，需要在你的开发机上安装 Docker CLI。搜索 "get docker for (mac/windows/linux)" 并执行 Docker 官网的提示。要检验是否安装成功，可以执行：

```
docker --version
```

> 如果你在 *安全与身份* 章节配置过 Facebook 登录，你将需要使用 Docker secrets 来安全地把 Facebook 应用信息放置进容器里。Docker secrets 的使用方法超出了本书的范畴。如果你愿意，可以在 `ConfigureServices` 方法里注释掉 `AddFacebook` 那一行，以禁用 Facebook 登录功能。

### 添加 Dockerfile

首先需要的就是一个 Dockerfile，它就像个清单，告诉 Docker 你程序需要些什么。

在 Web 程序根目录里，`Program.cs` 旁边创建一个名为 `Dockerfile` （没有扩展名）的文件。用你常用的编辑器打开它，输入下面这行：

```dockerfile
FROM microsoft/dotnet:latest
```

这告知 Docker 开始创建你的镜像，以一个现存的微软发布的镜像为基础。这将确保容器包含运行 ASP.NET Core 应用所需的一切。

```dockerfile
COPY . /app
```

`COPY` 指令复制你本地目录（项目源码）到 Docker 镜像里的 `/app` 目录。

```dockerfile
WORKDIR /app
```

`WORKDIR` 是 Docker 里的 `cd`。Dockerfile 中之后的命令都会在这个 `/app` 文件夹内执行。

```dockerfile
RUN ["dotnet", "restore"]
RUN ["dotnet", "build"]
```

这些命令会执行 `dotnet restore`（下载程序所需的 NuGet 包）和 `dotnet build`（编译程序）。

```dockerfile
EXPOSE 5000/tcp
```

默认情况下，Docker 容器不会暴露任何网络端口到外部。你需要明确地让 Docker 知道程序会在端口 5000 上进行通讯（Kestrel 默认端口）。

```dockerfile
ENV ASPNETCORE_URLS http://*:5000
```

`ENV` 指令在容器里设置环境变量。`ASPNETCORE_URLS` 这个变量告诉 ASP.NET Core 应该绑定到哪个网卡的哪个端口上。

```dockerfile
ENTRYPOINT ["dotnet", "run"]
```

Dockerfile 的最后一行用 `dotnet run` 命令启动你的程序。Kestrel 会开始在 5000 端口上进行监听，就像你在本地电脑上运行 `dotnet run` 那样。

完整的 Dockerfile 看起来是这样的：

**`Dockerfile`**

```dockerfile
FROM microsoft/dotnet:latest
COPY . /app
WORKDIR /app
RUN ["dotnet", "restore"]
RUN ["dotnet", "build"]
EXPOSE 5000/tcp
ENV ASPNETCORE_URLS http://*:5000
ENTRYPOINT ["dotnet", "run"]
```

### 创建一个镜像

确保 Dockerfile 已经保存好了，然后用 `docker build` 命令创建一个镜像：

```
docker build -t aspnetcoretodo .
```

不要漏掉结尾那个句点！它告诉 Docker 在当前目录下查找 Dockerfile。

一旦镜像创建完成，你可以运行 `docker images` 命令列出你本地电脑上的全部镜像。要通过容器尝试一下，请执行：

```
docker run -it -p 5000:5000 aspnetcoretodo
```

`-it` 标识告诉 Docker 以交互模式运行这个容器。当你想要停止这个容器的时候，按 `Control-C`。

### 设置 Nginx

在本章开头，我提到过，你应该使用一个 Nginx 之类的反向代理服务器，把请求代理到 Kestrel 上。这件事也可以用 Docker 来做。

整体架构会包括两个容器：一个 Nginx 容器监听 80 端口，把请求转发到另一个运行着 Kestrel 并监听 5000 端口的容器。

Nginx 容器自己也需要一个 Dockerfile。为避免跟你刚才创建那个 Dockerfile 冲突，在 Web 程序根目录新建一个目录：

```
mkdir nginx
```

创建一个新的 Dockerfile 并添加这些行：

**`nginx/Dockerfile`**

```dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

接下来，创建一个 `nginx.conf` 文件：

**`nginx/nginx.conf`**

```
events { worker_connections 1024; }

http {

        server {
              listen 80;

              location / {
                proxy_pass http://kestrel:5000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'keep-alive';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
              }
        }
}
```

这个配置文件告诉 Nginx 把接到的请求转发到 `http://kestrel:5000`。（你马上就会知道为什么要使用 `kestrel:5000` ）

### 设置 Docker Compose

还需要再创建一个文件，回到 Web 程序的根目录，创建 `docker-compose.yml`：

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
        - "5000"
```

Docker Compose 是个帮助你创建并运行多容器程序的工具。这个配置文件定义了两个容器： 用 `./nginx/Dockerfile` 清单创建 `nginx`，用 `./Dockerfile` 创建 `kestrel`。这两个容器显式地链接在一起，所以它们可以互相通信。

你可以运行以下指令来启动这个多容器程序：

```
docker-compose up
```

打开一个浏览器并导航至 `http://localhost`（不是 5000！）。Nginx 在 80 （HTTP 的默认）端口上进行监听，并把请求转发到由  Kestrel 托管的 ASP.NET Core 程序。

### 搭建 Docker 服务器

详尽的设置指令超出了这本**小**书的范畴，但是任何新式的 Linux 发行版（例如 Ubuntu）都可以搭建成一个 Docker 宿主。例如，你可以用亚马逊 EC2 创建一个虚拟机，在上面安装 Docker 服务，为此你可以搜索 “amazon ec2 set up docker” 以获取说明。

我更偏好使用 DigitalOcean，因为他们把入门的门槛降得非常低。DigitalOcean 既有现成的 Docker 虚拟机，也有关于搭建和运行 Docker 的深度教程（搜索“digitalocean docker”）。

---

## Deploy with Docker

Containerization technologies like Docker can make it much easier to deploy web applications. Instead of spending time configuring a server with the dependencies it needs to run your app, copying files, and restarting processes, you can simply create a Docker image that contains everything your app needs to run, and spin it up as a container on any Docker host.

Docker can make scaling your app across multiple servers easier, too. Once you have an image, using it to create 1 container is the same process as creating 100 containers.

Before you start, you need the Docker CLI installed on your development machine. Search for "get docker for (mac/windows/linux)" and follow the instructions on the official Docker website. You can verify that it's installed correctly with

```
docker --version
```

> If you set up Facebook login in the *Security and identity* chapter, you'll need to use Docker secrets to securely set the Facebook app secret inside your container. Working with Docker secrets is outside the scope of this book. If you want, you can comment out the `AddFacebook` line in the `ConfigureServices` method to disable Facebook log in.

### Add a Dockerfile

The first thing you'll need is a Dockerfile, which is like a recipe that tells Docker what your application needs.

Create a file called `Dockerfile` (no extension) in the web application root, next to `Program.cs`. Open it in your favorite editor. Write the following line:

```dockerfile
FROM microsoft/dotnet:latest
```

This tells Docker to start your image from an existing image that Microsoft publishes. This will make sure the container has everything it needs to run an ASP.NET Core app.

```dockerfile
COPY . /app
```

The `COPY` command copies the contents of your local directory (the source code of your application) into a directory called `/app` in the Docker image.

```dockerfile
WORKDIR /app
```

`WORKDIR` is the Docker equivalent of `cd`. The remainder of the commands in the Dockerfile will run from inside the `/app` folder.

```dockerfile
RUN ["dotnet", "restore"]
RUN ["dotnet", "build"]
```

These commands will execute `dotnet restore` (which downloads the NuGet packages your application needs) and `dotnet build` (which compiles the application).

```dockerfile
EXPOSE 5000/tcp
```

By default, Docker containers don't expose any network ports to the outside world. You have to explicitly let Docker know that your app will be communicating on port 5000 (the default Kestrel port).

```dockerfile
ENV ASPNETCORE_URLS http://*:5000
```

The `ENV` command sets environment variables in the container. The `ASPNETCORE_URLS` variable tells ASP.NET Core which network interface and port it should bind to.

```dockerfile
ENTRYPOINT ["dotnet", "run"]
```

The last line of the Dockerfile starts up your application with the `dotnet run` command. Kestrel will start listening on port 5000, just like it does when you use `dotnet run` on your local machine.

The full Dockerfile looks like this:

**`Dockerfile`**

```dockerfile
FROM microsoft/dotnet:latest
COPY . /app
WORKDIR /app
RUN ["dotnet", "restore"]
RUN ["dotnet", "build"]
EXPOSE 5000/tcp
ENV ASPNETCORE_URLS http://*:5000
ENTRYPOINT ["dotnet", "run"]
```

### Create an image

Make sure the Dockerfile is saved, and then use `docker build` to create an image:

```
docker build -t aspnetcoretodo .
```

Don't miss the trailing period! That tells Docker to look for a Dockerfile in the current directory.

Once the image is created, you can run `docker images` to to list all the images available on your local machine. To test it out in a container, run

```
docker run -it -p 5000:5000 aspnetcoretodo
```

The `-it` flag tells Docker to run the container in interactive mode. When you want to stop the container, press `Control-C`.

### Set up Nginx

At the beginning of this chapter, I mentioned that you should use a reverse proxy like Nginx to proxy requests to Kestrel. You can use Docker for this, too.

The overall architecture will consist of two containers: an Nginx container listening on port 80, forwarding requests to a separate container running Kestrel and listening on port 5000.

The Nginx container needs its own Dockerfile. To keep it from colliding with the Dockerfile you just created, make a new directory in the web application root:

```
mkdir nginx
```

Create a new Dockerfile and add these lines:

**`nginx/Dockerfile`**

```dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

Next, create an `nginx.conf` file:

**`nginx/nginx.conf`**

```
events { worker_connections 1024; }

http {

        server {
              listen 80;

              location / {
                proxy_pass http://kestrel:5000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'keep-alive';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
              }
        }
}
```

This configuration file tells Nginx to proxy incoming requests to `http://kestrel:5000`. (You'll see why `kestrel:5000` works in a moment.)

### Set up Docker Compose

There's one more file to create. Up in the web application root directory, create `docker-compose.yml`:

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
        - "5000"
```

Docker Compose is a tool that helps you create and run multi-container applications. This configuration file defines two containers: `nginx` from the `./nginx/Dockerfile` recipe, and `kestrel` from the `./Dockerfile` recipe. The containers are explicitly linked together so they can communicate.

You can try spinning up the entire multi-container application by running:

```
docker-compose up
```

Try opening a browser and navigating to `http://localhost` (not 5000!). Nginx is listening on port 80 (the default HTTP port) and proxying requests to your ASP.NET Core application hosted by Kestrel.

### Set up a Docker server

Specific setup instructions are outside the scope of this Little book, but any modern Linux distro (like Ubuntu) can be set up as a Docker host. For example, you could create a virtual machine with Amazon EC2, and install the Docker service. You can search for "amazon ec2 set up docker" (for example) for instructions.

I prefer DigitalOcean because they've made it really easy to get started. DigitalOcean has both a pre-built Docker virtual machine, and in-depth tutorials for getting Docker up and running (search for "digitalocean docker").
