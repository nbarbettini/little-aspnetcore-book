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
