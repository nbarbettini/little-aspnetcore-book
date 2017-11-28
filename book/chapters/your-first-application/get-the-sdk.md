## 获取 SDK

搜索“下载 .net core”，在微软为你所用平台提供的下载页，按指令操作。SDK装好之后，开启一个终端窗口（或者 Windows 上的 PowerShell），并使用 `dotnet` 命令行工具（command line tool，也叫 **CLI**）验证一切工作正常：

```shell
dotnet --version

2.0.0
```

还可以用 `--info` 开关获取有关你所在平台的更多信息：

```shell
dotnet --info

.NET Command Line Tools (2.0.0)

Product Information:
 Version:            2.0.0
 Commit SHA-1 hash:  cdcd1928c9

Runtime Environment:
 OS Name:     Mac OS X
 OS Version:  10.12

(more details...)
```

如果你看到类似于上面的输出，那就大踏步的前进吧。

---

## Get the SDK
Search for "download .net core" and follow the instructions on Microsoft's download page for your platform. After the SDK has finished installing, open up the Terminal (or PowerShell on Windows) and use the `dotnet` command line tool (also called a **CLI**) to make sure everything is working:

```
dotnet --version

2.0.0
```

You can get more information about your platform with the `--info` flag:

```
dotnet --info

.NET Command Line Tools (2.0.0)

Product Information:
 Version:            2.0.0
 Commit SHA-1 hash:  cdcd1928c9

Runtime Environment:
 OS Name:     Mac OS X
 OS Version:  10.12

(more details...)
```

If you see output like the above, you're ready to go!
