# Proxy 部署到 Vercel

此代理服务用于解决状态页 Worker 与 Cloudflare Pages/Workers 同账号部署时的回环限制问题，通过将监控请求转发至 Vercel 服务器发出，绕开 Cloudflare 的回环拦截。

## 前置条件

- 已安装 Node.js
- 已有 Vercel 账号（可在 [vercel.com](https://vercel.com) 免费注册）

## 部署步骤

### 1. 安装 Vercel CLI

```bash
pnpm i vercel@latest -g
```

### 2. 登录 Vercel

```bash
vercel login
```

执行后会自动跳转浏览器完成登录，登录成功后终端会提示确认。

### 3. 部署

进入 proxy 目录，执行部署命令：

```bash
cd proxy
vercel
```

按照交互提示操作：

| 提示                                     | 输入                                                    |
| ---------------------------------------- | ------------------------------------------------------- |
| Set up and deploy?                       | 回车确认                                                |
| Which team?                              | 选择你的个人账号                                        |
| Link to existing project?                | `N`                                                     |
| Name?                                    | 输入名称 `service-status-proxy` 或者回车使用默认名 `proxy` |
| In which directory is your code located? | 回车（`./`）                                            |
| Customize settings?                      | `N`                                                     |
| Change additional project settings?      | `N`                                                     |

部署完成后终端会输出访问地址，例如：

```
https://service-status-proxy.vercel.app
```

### 4. 更新状态页配置

在 `uptime.config.ts` 的监控项中加入 `checkProxy`（仅当目标服务在 Cloudflare 且你的状态页与之同账号部署时）：

```ts
{
  id: 'example',
  name: '示例服务',
  method: 'HEAD',
  target: 'https://example.com/',
  expectedCodes: [200],
  timeout: 10000,
  checkProxy: 'https://xxx-proxy.vercel.app',  // 填入你的 Vercel 地址
},
```

提交代码后 Worker 自动重新部署，下一个检测周期即生效。

## 后续更新

如需更新 proxy 代码，在 proxy 目录下执行：

```bash
vercel --prod
```

## 其他问题

### 1. Vercel 代理环境请求某些站点时报错（503）或超时（Timeout）。

由于 Cloudflare WAF 限制或服务端框架（如 Next.js）的处理差异，默认的 `HEAD` 方法可能会失败。请根据报错类型尝试以下两种方法：

- **若是 503 报错**：通常出现在 Next.js 等框架的根域名上。请将探测方法改用 `GET`，`expectedCodes` 保持 `[200]`。
- **若是 Timeout 超时**：请将探测方法改用 `OPTIONS`，并将 `expectedCodes` 改为 `[200, 405]`。`OPTIONS` 作为预检请求常被 WAF 放行，返回 405 即可证明服务存活。

```ts
{
  id: 'example',
  name: '示例服务',
  method: 'GET',  // 或 'OPTIONS'
  target: 'https://example.com/',
  expectedCodes: [200], // 若为 OPTIONS 请配置 [200, 405]
  timeout: 10000,
  checkProxy: 'https://xxx-proxy.vercel.app',  // 填入你的 Vercel 地址
},
```
