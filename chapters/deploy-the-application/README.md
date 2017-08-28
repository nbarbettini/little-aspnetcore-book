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
