## Deploy to Azure

Deploying your ASP.NET Core application to Azure only takes a few steps. You can do it through the Azure web portal, or on the command line using the Azure CLI. I'll cover the latter.

### What you'll need

* Git (use `git --version` to make sure it's installed)
* The Azure CLI (follow the install instructions at https://github.com/Azure/azure-cli)
* An Azure subscription (the free subscription is fine)
* A deployment configuration file in your project root

### Create a deployment configuration file

Since there are multiple projects in your directory structure (the web application, and two test projects), Azure won't know which one to show to the world. To fix this, create a file called `.deployment` at the very top of your directory structure:

##### `.deployment`

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

```
az login
```

and follow the prompts to log in on your machine. Then, create a new Resource Group for this application:

```
az group create -l westus -n AspNetCoreTodoGroup
```

Next, create an App Service plan in the group you just created:

```
az appservice plan create -g AspNetCoreTodoGroup -n AspNetCoreTodoPlan --sku F1
```

> Sidebar: `F1` is the free app plan. If you want to use a custom domain name with your app, use the D1 ($10/month) plan or higher.

Now create a Web App in the App Service plan:

```
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

```
git init
git add .
git commit -m "First commit!"
```

Next, create an Azure username and password for deployment:

```
az webapp deployment user set --user-name nate
```

Follow the instructions to create a password. Then use `config-local-git` to spit out a Git URL:

```
az webapp deployment source config-local-git -g AspNetCoreTodoGroup -n MyTodoApp --out tsv

https://nate@mytodoapp.scm.azurewebsites.net/MyTodoApp.git
```

Copy the URL to the clipboard, and use it to add a Git remote to your local repository:

```
git remote add azure <paste>
```

You only need to do these steps once. Now, whenever you want to push your application files to Azure, check them in with Git and run

```
git push azure master
```

You'll see a stream of log messages as the application is deployed to Azure. When it's complete, browse to http://yourappname.azurewebsites.net to check it out!
