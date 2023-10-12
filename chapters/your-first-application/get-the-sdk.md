## 获取 SDK

搜索“下载 .net core”，在微软为你所在平台提供的下载页面，获取 .NET Core 的 SDK。完成 SDK 的安装后，开启一个终端窗口（或者 Windows 上的 PowerShell），并使用 `dotnet` 命令行工具（command line tool，也叫 **CLI**）确保一切正常工作：

```shell
dotnet --version

2.1.104
```

还可以通过 `--info` 选项，获取你所在平台更详细的信息：

```shell
dotnet --info

.NET Command Line Tools (2.1.104)

Product Information:
 Version:            2.1.104
 Commit SHA-1 hash:  48ec687460

Runtime Environment:
 OS Name:     Mac OS X
 OS Version:  10.13

(more details...)
```

如果你看到类似于上面的输出，就大步前进吧。

---

## Get the SDK
Search for "download .net core" and follow the instructions on Microsoft's download page to get the .NET Core SDK. After the SDK has finished installing, open up the Terminal (or PowerShell on Windows) and use the `dotnet` command line tool (also called a **CLI**) to make sure everything is working:

```
dotnet --version

2.1.104
```

You can get more information about your platform with the `--info` flag:

```
dotnet --info

.NET Command Line Tools (2.1.104)

Product Information:
 Version:            2.1.104
 Commit SHA-1 hash:  48ec687460

Runtime Environment:
 OS Name:     Mac OS X
 OS Version:  10.13

(more details...)
```

If you see output like the above, you're ready to go!
