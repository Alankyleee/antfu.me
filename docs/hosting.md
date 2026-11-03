# 博客域名与托管

- GitHub 仓库：`Alankyleee/antfu.me`，生产分支：`main`。
- Netlify 项目：`comforting-moxie-1ce537`。
- 默认地址：`https://comforting-moxie-1ce537.netlify.app`。
- 主域名：`https://alankyle.com`。
- `www.alankyle.com` 由 Netlify 自动重定向到主域名。
- DNS 在 Cloudflare 管理。

Cloudflare DNS 记录：

| 名称 | 类型 | 目标 | 代理 |
| --- | --- | --- | --- |
| `@` | CNAME（根域扁平化） | `apex-loadbalancer.netlify.com` | 仅 DNS |
| `www` | CNAME | `comforting-moxie-1ce537.netlify.app` | 仅 DNS |
| `images` | R2 托管记录 | `alankyle-images` | Cloudflare 托管 |

Netlify 的 Domain management 页面管理主域名、重定向和自动 HTTPS 证书。
域名初次解析传播和证书签发完成后才能正常 HTTPS 访问。
R2 图床见 [配置说明](./r2.md)。
