<div align="right">
  <a title="English" href="README.md"><img src="https://img.shields.io/badge/-English-545759?style=for-the-badge" alt="English"></a>
  <a title="简体中文" href="README_zh-CN.md"><img src="https://img.shields.io/badge/-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-A31F34?style=for-the-badge" alt="简体中文"></a>
</div>

# ✔[UptimeFlare](https://github.com/weizwz/UptimeFlare)

A feature-rich, serverless, and free uptime monitoring and status page powered by Cloudflare Workers.

Forked from https://github.com/lyc8503/UptimeFlare with an interface beautification.

## ⭐Features

- Open source, easy to deploy (no local tools required, under 10 minutes), and completely free
- Monitoring features
  - Supports up to 50 checks at 1-minute precision
  - Support for choosing monitoring locations from [310+ cities](https://www.cloudflare.com/network/) worldwide
  - Support for HTTP/HTTPS/TCP port monitoring
  - Up to 90 days of uptime history and uptime percentage tracking
  - Customizable HTTP(s) request methods, headers, and body
  - Customizable HTTP(s) status code and keyword checks
  - Downtime notifications via [100+ notification channels](https://github.com/caronc/apprise/wiki)
  - Customizable Webhook
  - Multi-language support (Chinese/English)
- Status page
  - Interactive ping (response time) charts for all monitor types
  - Scheduled maintenance alerts and incident history page
  - Responsive UI that adapts to desktop/mobile screens, with light/dark system themes
  - Rich configuration options for the status page
  - Use your own domain with CNAME support
  - Optional password protection for private status pages
  - JSON API for fetching real-time status data

### 🆕Enhancements (Fork)

This fork adds the following enhancements:

- **Modern UI redesign** — refreshed interface using Tailwind CSS v4, glassmorphism effects, and premium visual design
- **Monitor card component** — independent monitor cards showing status, latency, and maintenance information clearly
- **In-page auto-refresh** — status data is polled every 180 seconds through `/api/status`, without full-page reload
- **Status API with CORS protection** — secure `/api/status` endpoint with origin-based access control to prevent cross-origin abuse
- **Incident detail modal** — click uptime bars to see detailed incident information, including duration and error description
- **Incident history drawer** — slide-out drawer for browsing historical incidents, filterable by month and monitor
- **Real-time event display** — shows actual monitoring events with ongoing/resolved states in the event drawer
- **Mobile-friendly design** — optimized responsive layout for mobile screens
- **Monitor grouping** — reorganized monitor groups with improved spacing and layout
- **Human-friendly duration display** — improved incident duration time unit presentation
- **Custom site icon** — support for custom favicon
- **Local development support** — added local development environment configuration

## 👀Demo

My own status page (online demo): https://status.weizwz.com/

Some screenshots:

![Desktop, Light theme](docs/status.weizwz.com.webp)

## ⚡Quickstart / 📄Documentation

Please refer to the [Wiki](https://github.com/lyc8503/UptimeFlare/wiki)
