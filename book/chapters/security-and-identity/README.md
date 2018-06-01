# 安全和身份

安全性是任何现代 Web 应用或 API 都要重点关注的。确保用户或顾客的数据安全并免遭黑客染指，是非常重要的。这个话题所涉甚广，包括了：

* 过滤输入数据，避免 SQL注入
* 防止利用表单(form)进行的跨域(CSRF)攻击
* 使用 HTTPS(TLS)，避免在 Internet 上传输的数据被窃取
* 确保用户 输入密码 或者 通过社交媒体授权 登录时的安全性
* 设计 密码重置 或 多重身份认证流程 时，考虑到安全性的因素

ASP.NET Core 有助于实现这些功能。前两个（防止SQL注入和跨域攻击）功能已经内置了，要开启 HTTPS，只需寥寥数行代码即可。本章主要关注安全性的 **身份验证(identity)** 方面：管理用户的账号（注册、登录），安全地验证用户（登录），并在验证后做出授权决策。

> 验证 和 授权 二者常被混淆。**验证** 关心的是用户登录与否，而 **授权** 关心“用户在登录 *后* 能否做某些事”。你可以认为 验证 是在问：“我知道这个用户是谁吗？”，而 授权 问的是：“这个用户有权限做某件事吗？”

你搭建项目的时候，应用了 MVC + Individual验证 项目模板，该模板中带有几个类，构建在 ASP.NET Core Identity（一个验证和身份系统，属于 ASP.NET Core 的一部分）之上。安装后，默认添加了通过 email 和密码进行登录的功能。

## ASP.NET Core Identity 是什么？

ASP.NET Core Identity 是 ASP.NET Core 带来的身份系统，就像 ASP.NET Core 生态圈中的其它部分，它也是一组 NuGet 包，可以被安装在任何项目中（并且包括在默认的模板中了）。

ASP.NET Core Identity 处理用户账号的存储、散列并保存密码、还负责管理用户的角色。它支持 邮箱地址/密码 登录、多重身份验证、集成以 Google 和 Facebook 之类的身份提供者的 社交账号登录、以及借助 OAuth 2.0 和 OpenID Connect 等协议连接到其它的服务。

 MVC + Individual验证 项目模板中的 Register 和 Login 视图 已经从 ASP.NET Core Identity 中受益，而且已经正常工作了，请试着注册一个账号并用它登录。

---

# Security and identity

Security is a major concern of any modern web application or API. It's important to keep your user or customer data safe and out of the hands of attackers. This is a very broad topic, involving things like:

* Sanitizing data input to prevent SQL injection attacks
* Preventing cross-domain (CSRF) attacks in forms
* Using HTTPS (connection encryption) so data can't be intercepted as it travels over the Internet
* Giving users a way to securely sign in with a password or other credentials
* Designing password reset, account recovery, and multi-factor authentication flows

ASP.NET Core can help make all of this easier to implement. The first two (protection against SQL injection and cross-domain attacks) are already built-in, and you can add a few lines of code to enable HTTPS support. This chapter will mainly focus on the **identity** aspects of security: handling user accounts, authenticating (logging in) your users securely, and making authorization decisions once they are authenticated.

> Authentication and authorization are distinct ideas that are often confused. **Authentication** deals with whether a user is logged in, while **authorization** deals with what they are allowed to do *after* they log in. You can think of authentication as asking the question, "Do I know who this user is?" While authorization asks, "Does this user have permission to do *X*?"

The MVC + Individual Authentication template you used to scaffold the project includes a number of classes built on top of ASP.NET Core Identity, an authentication and identity system that's part of ASP.NET Core. Out of the box, this adds the ability to log in with an email and password.

## What is ASP.NET Core Identity?

ASP.NET Core Identity is the identity system that ships with ASP.NET Core. Like everything else in the ASP.NET Core ecosystem, it's a set of NuGet packages that can be installed in any project (and are already included if you use the default template).

ASP.NET Core Identity takes care of storing user accounts, hashing and storing passwords, and managing roles for users. It supports email/password login, multi-factor authentication, social login with providers like Google and Facebook, as well as connecting to other services using protocols like OAuth 2.0 and OpenID Connect.

The Register and Login views that ship with the MVC + Individual Authentication template already take advantage of ASP.NET Core Identity, and they already work! Try registering for an account and logging in.
