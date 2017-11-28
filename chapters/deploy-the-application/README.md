# 部署程序

万事俱备，只欠东风。当一个良好的程序构建完成，就应该与全世界分享它了。

因为 ASP.NET Core 程序能够运行在 Windows、Mac 以及 Linux 上，你拥有多种部署程序的方式。这一章里，我将教给你最常用(也是最简单)的上线方式。

## 部署方式

ASP.NET Core 通常会部署到下列环境之一：

* **任意 Dockers 主机** 任何有能力托管 Docker 容器的机器都能用来托管 ASP.NET Core 程序。创建 Docker 镜像是个非常快捷的部署程序的方式，尤其是在你熟悉 Docker 的情况下。（如果你还不熟悉，别担心！我会在后面逐步介绍。）

* **Azure** 微软的 Azure 对 ASP.NET Core 程序提供原生的支持。如果你有一个 Azure 订阅，你只要创建一个 Web App 并上传你的项目文件即可。下一节，我会介绍通过 Azure CLI 完成这种操作。

* **Linux (连同 Nginx)** 如果你不想用 Docker 那个方式，依然可以在任意 Linux 服务器（这包括亚马逊的 EC2 和 DigitalOcean 虚拟机）上托管程序。通常把 ASP.NET Core 跟 Nginx 反向代理配对工作。（下面有更详细的 Nginx 相关内容。）

* **Winddows** 你可以在 Windows 上使用 IIS 网络服务器托管 ASP.NET Core 程序。一般来说，部署到 Azure 更容易（也更便宜），不过你要是愿意自己管理 Windows 服务器，这也是个可行的方案。

## Kestrel 和 反向代理

> 如果你不在意 ASp.NET Core 程序托管工作的细节，而只希望参考分步的指导，可以跳转到后续两小节的任一个继续阅读。

ASP.NET Core 里包含一个名为 Kestrel 的快速轻量级的 web 开发服务器。你每次在本地启动程序并浏览 `http://localhost:5000` 的时候，用的就是这个服务器。当你把程序部署到生产环境的时候，它仍会在幕后使用 Kestrel。但强烈建议你在 Kestrel 之前添加一个反向代理，因为 Kestrel 并不具有负载均衡和其它更大 Web 服务器所具有的其它特性。

在 Linux（和 Docker 容器）里，你可以用 Nginx 或者 Apache web 服务器接收从互联网上传入的请求，并派发到你用 Kestrel 托管的程序。如果你用的是 Windows，IIS 也能处理这个工作。

如果你把程序托管在 Azure，这些就都是自动为你处理的。在 Docker 那一节，我会讲述如何配置 Nginx 进行反向代理。

---

# Deploy the application
You've come a long way, but you're not quite done yet. Once you've created a great application, you need to share it with the world!

Because ASP.NET Core applications can run on Windows, Mac, or Linux, there are a number of different ways you can deploy your application. In this chapter, I'll show you the most common (and easiest) ways to go live.

## Deployment options

ASP.NET Core applications are typically deployed to one of these environments:

* **Any Docker host**. Any machine capable of hosting Docker containers can be used to host an ASP.NET Core application. Creating a Docker image is a very quick way to get your application deployed, especially if you're familiar with Docker. (If you're not, don't worry! I'll cover the steps later.)

* **Azure**. Microsoft Azure has native support for ASP.NET Core applications. If you have an Azure subscription, you just need to create a Web App and upload your project files. I'll cover how to do this with the Azure CLI in the next section.

* **Linux (with Nginx)**. If you don't want to go the Docker route, you can still host your application on any Linux server (this includes Amazon EC2 and DigitalOcean virtual machines). It's typical to pair ASP.NET Core with the Nginx reverse proxy. (More about Nginx below.)

* **Windows**. You can use the IIS web server on Windows to host ASP.NET Core applications. It's usually easier (and cheaper) to just deploy to Azure, but if you prefer managing Windows servers yourself, it'll work just fine.

## Kestrel and reverse proxies

> If you don't care about the guts of hosting ASP.NET Core applications and just want the step-by-step instructions, feel free to skip to one of the next two sections!

ASP.NET Core includes a fast, lightweight development web server called Kestrel. It's the server you've been using every time you ran the app locally and browsed to `http://localhost:5000`. When you deploy your application to a production environment, it'll still use Kestrel behind the scenes. However, it's recommended that you put a reverse proxy in front of Kestrel, because Kestrel doesn't yet have load balancing and other features that bigger web servers have.

On Linux (and in Docker containers), you can use Nginx or the Apache web server to receive incoming requests from the internet and route them to your application hosted with Kestrel. If you're on Windows, IIS does the same thing.

If you're using Azure to host your application, this is all taken care of for you automatically. I'll cover setting up Nginx as a reverse proxy in the Docker section.
