# Security and identity

Security is a major concern of any modern web application or API. It's important to keep your user or customer data safe and out of the hands of attackers. This encompasses things like

* Sanitizing data input to prevent SQL injection attacks
* Preventing cross-domain (CSRF/XSRF) attacks in forms
* Using HTTPS (TLS) so data can't be intercepted as it travels over the Internet
* Giving users a way to securely sign in with a password or social login credentials
* Designing password reset or multi-factor authentication flows with security in mind

ASP.NET Core can help make all of this easier to implement. The first two (protection against SQL injection and cross-domain attacks) are already built-in, and you can add a few lines of code to enable HTTPS support. This chapter will mainly focus on the **identity** aspects of security: handling user accounts (registration, login), authenticating (logging in) your users securely, and making authorization decisions once they are authenticated.

> Authentication and authorization are distinct ideas that are often confused. **Authentication** deals with whether a user is logged in, while **authorization** deals with what they are allowed to do *after* they log in. You can think of authentication as asking the question, "Do I know who this user is?" While authorization asks, "Does this user have permission to do X?"

The MVC + Individual Authentication template you used to scaffold the project includes a number of classes built on top of ASP.NET Core Identity, an authentication and identity system that's part of ASP.NET Core. Out of the box, this adds the ability to log in with an email and password.

## What is ASP.NET Core Identity?

ASP.NET Core Identity is the identity system that ships with ASP.NET Core. Like everything else in the ASP.NET Core ecosystem, it's a set of NuGet packages that can be installed in any project (and are already included if you use the default template).

ASP.NET Core Identity takes care of storing user accounts, hashing and storing passwords, and managing roles for users. It supports email/password login, multi-factor authentication, social login with providers like Google and Facebook, as well as connecting to other services using protocols like OAuth 2.0 and OpenID Connect.

The Register and Login views that ship with the MVC + Individual Auth template already take advantage of ASP.NET Core Identity, and they already work! Try registering for an account and logging in.
