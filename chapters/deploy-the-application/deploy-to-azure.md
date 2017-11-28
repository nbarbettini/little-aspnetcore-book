## 部署到 Azure

把你的 ASP.NET Core 程序部署到 Azure 只需要简单几步。你可以通过 Azure 的网上门户实施，也可以在 Azure CLI 命令行工具里实施。我会介绍后者。

### 准备材料

* Git（使用 `git --version` 命令确认它已经安装了）
* Azure CLI（按照 https://github.com/Azure/azure-cli 的指示进行安装）
* 一个 Azure 订阅（免费的订阅就可以了）
* 项目的根目录里要有一个部署配置文件

### 创建部署配置文件

因为你的目录结构里存在多个项目（Web项目和两个测试项目），Azure 并不知道该把哪个发布出去。为解决这个问题，在你的目录结构顶层创建一个名为 `.deployment` 的文件：

**`.deployment`**

```ini
[config]
project = AspNetCoreTodo/AspNetCoreTodo.csproj
```

确保你把这个文件保存为 `.deployment`，而不带有什么其它的零碎儿。（在 Windows 上，你可能需要把文件名用引号括起来，比如 `".deployment"`，以此避免被添加一个 `.txt` 扩展名。）

如果你在顶层目录里执行 `ls` 或者 `dir` 命令，应该看到如下的内容：

```
.deployment
AspNetCoreTodo
AspNetCoreTodo.IntegrationTests
AspNetCoreTodo.UnitTests
```

### 设置 Azure 资源

如果你的 Azure CLI 才初次安装完成，运行：

```
az login
```

并按照提示在你的电脑上登录，然后，为这个程序创建一个新的 资源组(Resource Group)：

```
az group create -l westus -n AspNetCoreTodoGroup
```

这个命令在美国西部(West US)地区创建了一个资源组。如果你距离美国西部很远，请使用 `az account list-locations` 命令获取一个地点列表，并找出距离你比较近的一个。

接下来，在你刚刚创建的组里，创建一个 App Service 方案：

```
az appservice plan create -g AspNetCoreTodoGroup -n AspNetCoreTodoPlan --sku F1
```

> 提示：`F1` 是免费的 app 方案。如果想在你的应用上使用自己指定的域名，请使用 D1($10/月)或更高级的方案。

现在，在这个 App Service 方案里创建一个 Web 应用：

```
az webapp create -g AspNetCoreTodoGroup -p AspNetCoreTodoPlan -n MyTodoApp
```

这个应用的名称（上面的 `MyTodoApp`）在 Azure 上必须是全局唯一的。一旦这个应用创建好了，会具有一个以下格式的默认 URL：http://mytodoapp.azurewebsites.net

### 更改程序设置

> 提示：只有当你在 *安全与身份* 章节配置过 Facebook 登录，才需要这么做。

如果配置里 `Facebook:AppId` 和 `Facebook:AppSecret` 的值缺失，你的程序就无法正常启动。你需要使用 Azure 应用门户添加以下内容：

1. 在 https://portal.azure.com 用你的 Azure 账户登录
1. 打开你的 Web 应用（上面那个叫 `MyTodoApp` 的）
1. 点击 **Application settings** 页签
1. 在 **App settings** 部分，添加 `Facebook:AppId` 和 `Facebook:AppSecret` 以及它们对应的值
1. 在顶部点击 **Save**

### 把项目文件部署到 Azure

你可以用 Git 把程序文件推送到 Azure 网络应用。如果你本地目录尚未作为一个 Git 仓库管理，执行下列命令进行设置：

```
git init
git add .
git commit -m "First commit!"
```

接下来，为部署工作创建一个 Azure 用户名和密码，

```
az webapp deployment user set --user-name nate
```

按提示创建密码。然后用 `config-local-git` 得到一个 Git URL：

```
az webapp deployment source config-local-git -g AspNetCoreTodoGroup -n MyTodoApp --out tsv

https://nate@mytodoapp.scm.azurewebsites.net/MyTodoApp.git
```

复制这个 URL 到剪切板，并把它在本地仓库里添加为一个 Git remote：

```
git remote add azure <粘贴>
```

你只需要执行这些步骤一次。现在开始，任何时候，你需要推送程序文件到 Azure ，只需要在 Git 里提交它们，然后运行：

```
git push azure master
```

程序部署到 Azure 的时候，你会看到一系列的日志信息。输出结束之后，浏览 http://yourappname.azurewebsites.net 以检验结果。

---

## Deploy to Azure

Deploying your ASP.NET Core application to Azure only takes a few steps. You can do it through the Azure web portal, or on the command line using the Azure CLI. I'll cover the latter.

### What you'll need

* Git (use `git --version` to make sure it's installed)
* The Azure CLI (follow the install instructions at https://github.com/Azure/azure-cli)
* An Azure subscription (the free subscription is fine)
* A deployment configuration file in your project root

### Create a deployment configuration file

Since there are multiple projects in your directory structure (the web application, and two test projects), Azure won't know which one to show to the world. To fix this, create a file called `.deployment` at the very top of your directory structure:

**`.deployment`**

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

This creates a Resource Group in the West US region. If you're located far away from the western US, use `az account list-locations` to get a list of locations and find one closer to you.

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

> Sidebar: This is only necessary if you configured Facebook login in the *Security and identity* chapter.

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
