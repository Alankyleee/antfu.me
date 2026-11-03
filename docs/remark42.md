# Remark42 评论

评论服务地址为 `https://comments.alankyle.com`，站点 ID 为 `alankyle`，使用 Remark42 `v1.18.0`。
初始登录方式为昵称匿名评论。Google、GitHub 和邮件登录尚未配置，管理员身份需在配置登录方式后指定。

## 博客接入

`netlify.toml` 设置公开的 `VITE_REMARK42_HOST` 和 `VITE_REMARK42_SITE_ID`。
`RemarkComments.vue` 使用官方 SPA API 创建评论组件，离开文章时销毁，切换文章时重新创建，并同步深浅主题。
仅在 `/posts/` 下的非草稿文章显示。文章 frontmatter 设置 `comments: false` 可单独关闭评论。

评论线程固定关联 `https://alankyle.com` 加文章路径，忽略查询参数、片段及 Netlify 预览域名。
本地开发要启用评论时，将 `.env.remark42.example` 中的公开配置复制进 `.env.local`。
不要把后端签名密钥或 OAuth Client Secret 放进 `VITE_` 变量、仓库或前端代码。

## 后端配置模板

`deploy/remark42/` 提供不含密钥的环境变量、systemd 和 Nginx 配置模板，实际部署时填写自己的域名和目录。
后端签名密钥必须独立生成并妥善保存，评论数据与备份应持久化。
首次签发证书使用 `nginx-http.conf`，正式 HTTPS 服务使用 `nginx.conf`。

## 登录方式

Google OAuth 需要访客浏览器及评论后端都能访问 Google 接口，启用前应从实际部署环境测试。

GitHub OAuth App 的回调地址为：

```text
https://comments.alankyle.com/auth/github/callback
```

将 Client ID 和 Client Secret 配到后端的 `AUTH_GITHUB_CID` / `AUTH_GITHUB_CSEC` 后，才能开放 GitHub 登录。
登录成功后，将站主的 Remark42 用户 ID 配到 `ADMIN_SHARED_ID`，才能使用评论管理功能。
邮箱登录需要可用的 SMTP 服务及 `AUTH_EMAIL_ENABLE` 等配置。

参考：[安装](https://remark42.com/docs/getting-started/installation/)、[SPA API](https://remark42.com/docs/configuration/frontend/spa/)、[认证配置](https://remark42.com/docs/configuration/authorization/)。
