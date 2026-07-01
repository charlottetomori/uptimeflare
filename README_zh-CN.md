# 服务状态页通知配置

通知代码统一放在 `worker/src/notification.ts`。以后要改推送内容、推送地址、请求字段，直接改这个文件就行。

## 开启或关闭通知

打开 `worker/src/notification.ts`，找到最前面的函数：

```ts
export function shouldSendNotification() {
  return true
}
```

`return true` 表示开启通知。

`return false` 表示关闭通知。

## 修改通知内容

通知文案在 `buildNotificationMessage()` 函数里。这个函数会分别处理恢复、首次故障、持续故障三种情况。

要改通知文字，只改这个函数返回的字符串。

## 修改第五个季节推送 API

推送请求也在 `worker/src/notification.ts` 里，常用配置集中在这几行：

```ts
const FIFTH_SEASON_PUSH_URL = 'https://api.chuckfang.com/%E7%AC%AC%E4%BA%94%E4%B8%AA%E5%AD%A3%E8%8A%82'
const PUSH_TIMEOUT_MS = 10000
```

`FIFTH_SEASON_PUSH_URL` 使用的是当前仓库原来就在用的第五个季节推送 API 地址。

请求参数在 `buildPushPayload()` 里：

```ts
return {
  id: getEnvValue(env, 'ID'),
  apitoken: getEnvValue(env, 'APITOKEN'),
  msg: message,
}
```

如果你的 API 字段名有变化，只改这里的字段名。

## 仓库需要配置的环境变量

在 GitHub 仓库的 Actions Secrets 里配置这两个变量：

- `ID`：第五个季节推送 API 的 ID
- `APITOKEN`：第五个季节推送 API 的 apitoken

部署时 GitHub Actions 会把这两个变量写入 Cloudflare Worker。Worker 发送通知时会读取 `ID` 和 `APITOKEN`。
