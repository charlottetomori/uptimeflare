# Service Status Page

A light, self-hosted service status page powered by Next.js and Cloudflare Workers.

## Features

- HTTP, HTTPS, and TCP monitoring through Cloudflare Workers
- 10-minute default scheduled checks to keep D1 free-tier writes low
- 30-day uptime overview with latency and incident details
- Optional webhook notifications
- Light-only responsive status page UI
- JSON status API and badge API

## Configuration

Edit `uptime.config.ts` to configure groups, notifications, and maintenance windows.

You can add and delete monitored websites from the management panel on the status page. The panel stores website entries in the `UPTIMEFLARE_CONFIG` KV binding, while D1 is reserved for compacted monitoring state.

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

The default Worker schedule is defined in `wrangler.toml` and `worker/wrangler.toml`:

```toml
[triggers]
crons = [ "*/10 * * * *" ]
```

GitHub Actions automatically creates and imports both Cloudflare resources during deployment:

- D1 database: `uptimeflare_d1`
- KV namespace: `uptimeflare_config`

## Development

```bash
# Start the local Next.js app
npm run dev

# Build the app
npm run build
```
