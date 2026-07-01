# 服务状态页通知配置

这个项目的通知代码集中在 `worker/src/notification.ts`。想换成自己的推送渠道，主要改这个文件。

## 开启或关闭通知

打开 `worker/src/notification.ts`，看最前面的函数：

```ts
export function shouldSendNotification() {
  return true
}
```

`return true` 是开启通知。

`return false` 是关闭通知。

## 修改推送接口

在 `worker/src/notification.ts` 里找到这段：

```ts
// 通知区域修改开始
const WEBHOOK_URL = 'https://api.chuckfang.com/%E7%AC%AC%E4%BA%94%E4%B8%AA%E5%AD%A3%E8%8A%82'
const WEBHOOK_TIMEOUT_MS = 10000
const WEBHOOK_HEADERS: Record<string, string> = {}

function buildWebhookBody(message: string) {
  return {
    msg: message,
  }
}
// 通知区域修改结束
```

把 `WEBHOOK_URL` 改成你的推送 API 地址。

如果你的接口需要请求头，就改 `WEBHOOK_HEADERS`。

如果你的接口需要不同的请求字段，就改 `buildWebhookBody()` 返回的对象。

## 修改通知文案

通知文案也在 `worker/src/notification.ts`，函数名是 `buildNotificationMessage()`。

它会处理三种情况：恢复、刚发现故障、故障持续中。只改里面返回的文字就行。

## GitHub Actions 需要配置的变量

仓库的 Actions Secrets 里需要配置：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

这两个变量用于部署到 Cloudflare。通知接口自己的凭证按你的 webhook 要求写在 `worker/src/notification.ts` 的通知区域里。
