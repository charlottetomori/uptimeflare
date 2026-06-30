# 服务状态页

一个基于 Next.js 和 Cloudflare Workers 的浅色服务状态页。

## 功能

- 通过 Cloudflare Workers 监测 HTTP、HTTPS 和 TCP 服务
- 默认每 10 分钟自动检查一次，降低 D1 免费版写入压力
- 展示近 30 天可用率、响应延迟和故障详情
- 支持可选 Webhook 通知
- 固定浅色响应式界面
- 提供 JSON 状态接口和 badge 接口

## 配置

编辑 `uptime.config.ts` 配置分组、通知和维护窗口。

可以直接在状态页的管理面板添加和删除监测网站。管理面板会把网站条目保存到 `UPTIMEFLARE_CONFIG` KV 绑定，D1 只保存压缩后的监测状态。

```json
[
  {
    "id": "website",
    "name": "Website",
    "method": "GET",
    "target": "https://example.com",
    "statusPageLink": "https://example.com",
    "expectedCodes": [200],
    "timeout": 10000
  }
]
```

默认 Worker 定时任务位于 `wrangler.toml` 和 `worker/wrangler.toml`：

```toml
[triggers]
crons = [ "*/10 * * * *" ]
```

GitHub Actions 部署时会自动创建并导入以下 Cloudflare 资源：

- D1 数据库：`uptimeflare_d1`
- KV 命名空间：`uptimeflare_config`

## 本地开发

```bash
# 启动本地 Next.js 应用
npm run dev

# 构建应用
npm run build
```
