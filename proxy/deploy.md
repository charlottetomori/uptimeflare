# Proxy 部署到 Vercel

此代理服务用于解决 UptimeFlare Worker 与 Cloudflare Pages/Workers 同账号部署时的回环限制问题，通过将监控请求转发至 Vercel 服务器发出，绕开 Cloudflare 的回环拦截。

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
| Name?                                    | 输入名称 `uptimeflare-proxy` 或者回车使用默认名 `proxy` |
| In which directory is your code located? | 回车（`./`）                                            |
| Customize settings?                      | `N`                                                     |
| Change additional project settings?      | `N`                                                     |

部署完成后终端会输出访问地址，例如：

```
https://uptimeflare-proxy.vercel.app
```

### 4. 更新 UptimeFlare 配置

在 `uptime.config.ts` 的监控项中加入 `checkProxy`（仅当目标服务在 Cloudflare 且你的 UptimeFlare 与之同账号部署时）：

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

提交代码后 UptimeFlare Worker 自动重新部署，下一个检测周期即生效。

## 后续更新

如需更新 proxy 代码，在 proxy 目录下执行：

```bash
vercel --prod
```

## 其他问题

### 1. Vercel 代理环境使用 HEAD 方法请求某些站点时，会被拦截（返回 503）或导致连接挂起（Timeout）。

这是由于 Cloudflare WAF 策略（对 Vercel 代理 IP 进行了频率限制或反爬拦截）或服务端框架（如 Next.js）处理机制差异所致。改用 `OPTIONS` 方法并允许返回 `405` 状态码，可以完美绕过这些限制和超时问题。

**OPTIONS** 方法作为预检请求，通常被 WAF 直接放行，且不会触发服务端的完整渲染，如果返回 405 则证明目标服务器正常存活。

```ts
{
  id: 'example',
  name: '示例服务',
  method: 'OPTIONS',  // 切换成 OPTIONS 方法绕过拦截和超时
  target: 'https://example.com/',
  expectedCodes: [200, 405], // 允许 405 状态码
  timeout: 10000,
  checkProxy: 'https://xxx-proxy.vercel.app',  // 填入你的 Vercel 地址
},
```
