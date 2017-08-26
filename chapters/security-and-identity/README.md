# Security and identity
Security is a major concern of any modern web application or API. 

ASP.NET Core helps you build security into your app from the beginning. The MVC + Individual Authentication template you used to scaffold the project includes a number of classes built on top of ASP.NET Core Identity, an authentication and identity system that's part of ASP.NET Core.

## What is ASP.NET Core Identity?
ASP.NET Core Identity is the identity system that ships with ASP.NET Core. Like everything else in the ASP.NET Core ecosystem, it's a set of NuGet packages that can be installed in any project (and are already included if you use the default template, or reference the `Microsoft.AspNetCore.All` metapackage).

ASP.NET Core Identity takes care of storing user accounts, hashing and storing passwords, and managing roles for users. It supports email/password login, multi-factor authentication, social login with providers like Google and Facebook, as well as connecting to other services using protocols like OAuth 2.0 and OpenID Connect.

The Register and Login views that ship with the MVC + Individual Auth template already take advantage of ASP.NET Core Identity, and they already work! Try registering for an account and logging in.
