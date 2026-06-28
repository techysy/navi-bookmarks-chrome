# 旧版 Web 项目（v1.0.0）

这是改造为 Chrome 插件之前的原始 Web 项目版本。

## 文件说明

| 文件 | 说明 |
|------|------|
| `server.js` | Node.js HTTP 服务器（端口 8080） |
| `start.ps1` | PowerShell 交互式启动/管理脚本 |
| `index.html` | 主页面（单文件 SPA，包含 HTML/CSS/JS） |
| `bookmarks.sample.json` | 示例书签数据（14条） |
| `categoryOrder.sample.json` | 示例分类顺序配置 |

## 运行方式

```powershell
# 交互式启动
.\start.ps1

# 直接启动
node server.js
```

## 访问地址

- 本地：http://localhost:8080/index.html
- 局域网：http://{IP}:8080/index.html

## 依赖

- Node.js v14+
- 无第三方依赖（使用内置 http、fs、path 模块）

---

> **注意**：此版本已不再维护，新版本请使用 `chrome-extension/` 目录下的 Chrome 插件。
