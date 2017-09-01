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
