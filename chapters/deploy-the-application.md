# Deploy the application
You've come a long way, but you're not quite done yet. Once you've created a great app, you need to share it with the world!

Because ASP.NET Core applications can run on Windows, Mac, or Linux, there are a number of different ways you can deploy your application. In this chapter, I'll show you the most common (and easiest) ways to go live.
## Deployment options
ASP.NET Core applications are typically deployed to one of these environments:

**Any Docker host**. Any machine capable of hosting Docker containers can be used to host an ASP.NET Core application. Creating a Docker image is a very quick way to get your application deployed, especially if you're familiar with Docker. (If you're not, don't worry! I'll cover the steps later.)

**Azure**. Microsoft Azure has native support for ASP.NET Core applications. If you have an Azure subscription, you just need to create a Web App and upload your project files. I'll cover how to do this with the Azure CLI in the next section.

**Linux (with Nginx)**. If you don't want to go the Docker route, you can still host your application on any Linux server (this includes Amazon EC2 and DigitalOcean). It's typical to pair ASP.NET Core with the Nginx reverse proxy. (More about Nginx below.)

**Windows**. You can use the IIS web server on Windows to host ASP.NET Core applications. It's usually easier (and cheaper) to just deploy to Azure, but if you prefer managing Windows servers yourself, it'll work just fine.
## Kestrel and reverse proxies
If you don't care about the guts of hosting ASP.NET Core applications and just want the step-by-step instructions, feel free to skip to one of the next two sections!

ASP.NET Core includes a fast, lightweight development web server called Kestrel. It's the server you've been using every time you run the app locally and browse to `http://localhost:5000`. When you deploy your application to a production environment, it'll still use Kestrel behind the scenes. However, it's recommended to put a reverse proxy in front of Kestrel, because it doesn't yet have load balancing and other features that bigger web servers have.

On Linux (and in Docker containers), you can use Nginx or the Apache web server to receive incoming requests from the internet, and then route them to your application hosted with Kestrel. If you're on Windows, IIS does the same job and reverse-proxies incoming requests to Kestrel.

If you're using Azure to host your application, this is all taken care of for you automatically. I'll cover setting up Nginx as a reverse proxy in the Docker section.
## Deploy to Azure
Deploying your ASP.NET Core application to Azure only takes a few steps. You can do it through the Azure web portal, or on the command line using the Azure CLI. I'll cover the latter.

### What you'll need

* Git (use `git --version` to make sure it's installed)
* The Azure CLI (follow the install instructions at https://github.com/Azure/azure-cli)
* An Azure subscription (the free subscription is fine)
* A deployment configuration file in your project root

### Create a deployment configuration file

Since there are multiple projects in your directory structure (the web application, and two test projects), Azure won't know which one to show to the world. To fix this, create a file called `.deployment` at the very top of your directory structure:

**.deployment**

```ini
[config]
project = AspNetCoreTodo/AspNetCoreTodo.csproj
```

Make sure you save the file as `.deployment` with no other parts to the name. (On Windows, you may need to put quotes around the filename, like `".deployment"`, to prevent a `.txt` extension from being added.)

If you `ls` or `dir` in your top-level directory, you should see these items:

```
.deployment
AspNetCoreTodo
AspNetCoreTodo.IntegrationTests
AspNetCoreTodo.UnitTests
```

### Set up the Azure resources


If you just installed the Azure CLI for the first time, run

```bash
az login
```

and follow the prompts to log in on your machine. Then, create a new Resource Group for this application:

```bash
# You can specify any region you want: westus, eastus, etc
az group create -l westus -n AspNetCoreTodoGroup
```

Next, create an App Service plan in the group you just created:

```bash
az appservice plan create -g AspNetCoreTodoGroup -n AspNetCoreTodoPlan --sku F1
```

> Sidebar: `F1` is the free app plan. If you want to use a custom domain name with your app, use the D1 ($10/month) plan or higher.

Now create a Web App in the App Service plan:

```bash
az webapp create -g AspNetCoreTodoGroup -p AspNetCoreTodoPlan -n MyTodoApp
```

The name of the app (`MyTodoApp` above) must be globally unique in Azure. Once the app is created, it will have a default URL in the format: http://mytodoapp.azurewebsites.net

### Update the application settings

> Sidebar: This is only necessary if you configured Facebook login in chapter 7.

Your application won't start up properly if it's missing the `Facebook:AppId` and `Facebook:AppSecret` configuration values. You'll need to add these using the Azure web portal:

1. Log in to your Azure account via https://portal.azure.com
1. Open your Web App (called `MyTodoApp` above)
1. Click on the **Application settings** tab
1. Under the **App settings** section, add `Facebook:AppId` and `Facebook:AppSecret` with their respective values
1. Click **Save** at the top

### Deploy your project files to Azure

You can use Git to push your application files up to the Azure Web App. If your local directory isn't already tracked as a Git repo, run these commands to set it up:

```bash
git init
git add .
git commit -m "First commit!"
```

Next, create an Azure username and password for deployment:

```bash
az webapp deployment user set --user-name nate
# Follow the instructions to create a password
```

Then use `config-local-git` to spit out a Git URL:

```bash
az webapp deployment source config-local-git -g AspNetCoreTodoGroup -n MyTodoApp --out tsv

https://nate@mytodoapp.scm.azurewebsites.net/MyTodoApp.git
# Copy this value
```

Copy the URL to the clipboard, and use it to add a Git remote to your local repository:

```bash
git remote add azure <paste>
```

You only need to do these steps once. Now, whenever you want to push your application files to Azure, check them in with Git and run

```bash
# Assuming you want to push local branch 'master'
git push azure master
```

You'll see a stream of log messages as the application is deployed to Azure. When it's complete, browse to http://yourappname.azurewebsites.net to check it out!
## Deploy with Docker
Containerization technologies like Docker can make it much easier to deploy web applications. Instead of spending time configuring a server with the dependencies it needs to run your application, copying files, and restarting processes, you can simply create a Docker image that contains everything your app needs to run, and spin it up as a container on any Docker host.

Docker can make scaling your app across multiple servers easier, too. Once you have an image, using it to create 1 container is the same process as creating 100 containers.

Before you start, you need the Docker CLI installed on your development machine. Search for "get docker for (mac/windows)" and follow the instructions on docker.com. You can verify that it's installed correctly with

``bash
docker --version
```

!TODO: how to handle secrets? docker secrets?

### Add a Dockerfile

The first thing you'll need is a Dockerfile, which is like a recipe that tells Docker what your application needs.

Create a file called `Dockerfile` (no extension) in the web application root, the same folder as `Program.cs`. Open it in your favorite editor. Write the following line:

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

**Dockerfile**

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

```bash
docker build -t aspnetcoretodo .
```

Don't miss the trailing period! That tells Docker to look for a Dockerfile in the current directory.

Once the image is created, you can run `docker images` to to list all the images available on your local machine. To test it out in a container, run

```bash
docker run -it -p 5000:5000 aspnetcoretodo
# -it runs in interactive mode; press Ctrl-C to stop
```

### Set up Nginx

At the beginning of this chapter, I mentioned that you should use a reverse proxy like Nginx or Apache to proxy requests to Kestrel. I'll show you how to use Nginx because it's easy to set up with Docker.

The overall architecture will be an Nginx container (1) listening on port 80, forwarding requests to Kestrel listening on port 5000 in your application container (2):

!TODO: diagram
0 - internet
1 - nginx
2 - kestrel

The Nginx container needs its own Dockerfile, so to keep it from colliding with the Dockerfile you just created, make a new directory in the web application root:

```bash
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

There's one more file to create. Back up in the web application root directory, create `docker-compose.yml`:

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
        - "5000"
```

Docker Compose is a tool that helps you create and run multi-container applications. This configuration file defines two containers: `nginx` from the `./nginx/Dockerfile` recipe, and `kestrel`, from the `./Dockerfile` recipe. The containers are explicitly linked together so they can communicate.

You can try spinning up the entire multi-container application by running:

```bash
docker-compose up
```

Try opening a browser and navigating to `http://localhost` (not 5000!). Nginx is listening on port 80 (the default HTTP port) and proxying requests to your ASP.NET Core application hosted by Kestrel.

### Set up a Docker server

Specific setup instructions are outside the scope of this Little book, but any modern Linux distro (like Ubuntu) can be set up as a Docker host. For example, you could create a virtual machine with Amazon EC2, and install the Docker service. You can search for "amazon ec2 set up docker" (for example) for instructions.

I prefer DigitalOcean because it's a whole lot easier to set up. DigitalOcean has both a pre-built Docker virtual machine, and in-depth tutorials for getting Docker up and running (search for "digitalocean docker").

### Deploy with Docker Compose

Once you have a server running Docker (verified with `docker --version`), you can publish your Docker Compose service(?) to it and host it for the world.

!TODO: instructions
