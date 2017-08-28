## Deploy with Docker

Containerization technologies like Docker can make it much easier to deploy web applications. Instead of spending time configuring a server with the dependencies it needs to run your app, copying files, and restarting processes, you can simply create a Docker image that contains everything your app needs to run, and spin it up as a container on any Docker host.

Docker can make scaling your app across multiple servers easier, too. Once you have an image, using it to create 1 container is the same process as creating 100 containers.

Before you start, you need the Docker CLI installed on your development machine. Search for "get docker for (mac/windows/linux)" and follow the instructions on the official Docker website. You can verify that it's installed correctly with

```
docker --version
```

> If you set up Facebook login in the chapter on security and identity, you'll need to use Docker secrets to securely set the Facebook app secret inside your container. Working with Docker secrets is outside the scope of this book. If you want, you can comment out the `AddFacebook` line in the `ConfigureServices` method to disable Facebook log in.

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

##### `Dockerfile`

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

The overall architecture will have two containers, with an Nginx container (1) listening on port 80, forwarding requests to Kestrel listening on port 5000 in your application container (2):

!TODO: diagram
0 - internet
1 - nginx
2 - kestrel

The Nginx container needs its own Dockerfile. To keep it from colliding with the Dockerfile you just created, make a new directory in the web application root:

```
mkdir nginx
```

Create a new Dockerfile and add these lines:

##### `nginx/Dockerfile`

```dockerfile
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
```

Next, create an `nginx.conf` file:

##### `nginx/nginx.conf`

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

##### `docker-compose.yml`

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
