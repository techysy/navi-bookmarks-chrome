# 📚 个人书签导航

一个现代化的书签导航应用，专为个人设计，支持快速访问常用网站、搜索功能和分类管理。

## ✨ 功能特点

- **🔍 智能搜索**：支持实时搜索书签，集成多种搜索引擎（必应、百度、Google、DuckDuckGo）
- **📁 分类管理**：支持创建、编辑、删除分类，可拖拽调整顺序
- **🎨 毛玻璃UI**：现代化视觉设计，支持背景图片
- **📱 响应式设计**：完美适配桌面端和移动端
- **💾 数据持久化**：本地存储 + 服务器同步
- **🌐 局域网访问**：支持通过局域网IP访问
- **📌 常用分类**：默认显示"常用"分类，方便快速访问常用网站
- **🔧 交互式管理**：PowerShell脚本支持菜单交互，可选择前台/后台运行
- **📥 导入导出**：支持书签数据的导入导出，方便备份和迁移（可配置开关）
- **🖱️ 滚轮切换**：鼠标悬停在分类或书签区域时，滚轮滑动可快速切换分类（"全部"分类保持正常滚动）

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (Vanilla)
- **后端**: Node.js + HTTP 模块
- **数据存储**: JSON 文件 + LocalStorage

## 📦 安装

### 前置要求

- **Node.js**: 需要安装 Node.js（v14+ 推荐）
- **无需 npm 依赖**: 本项目使用 Node.js 内置模块，无需安装第三方依赖

```bash
# 克隆仓库
git clone <repository-url>
cd navi-bookmarks-nodejs    

# 检查 Node.js 版本
node --version
```

## 🚀 运行

### 方式一：PowerShell (推荐)

运行脚本后会显示交互式菜单：

```powershell
# 显示交互式菜单（默认）
.\start.ps1
```

菜单选项：
- `[S]` 启动服务器 (前台运行)
- `[B]` 启动服务器 (后台运行)
- `[T]` 停止服务器
- `[C]` 查看状态
- `[Q]` 退出

也可以直接使用参数：

```powershell
# 前台启动服务器
.\start.ps1 -Action start

# 后台启动服务器（不占用终端）
.\start.ps1 -Action start-bg

# 停止服务器
.\start.ps1 -Action stop

# 检查状态
.\start.ps1 -Action status

# 显示菜单
.\start.ps1 -Action menu
```

### 方式二：直接运行 Node.js

```bash
node server.js
```

## 🌍 访问地址

- **本地**: http://localhost:8080/index.html
- **局域网**: http://{您的IP}:8080/index.html (启动时自动显示)

## 🎯 浏览器新标签页集成

您可以使用浏览器插件将书签导航设置为新标签页，提升使用体验。

### 使用 Custom New Tab 插件（推荐）

**步骤：**

1. **安装插件**：
   - Chrome/Edge 用户：在应用商店搜索 **Custom New Tab** 并安装
   - Firefox 用户：在附加组件商店搜索类似插件

2. **配置插件**：
   - 打开插件设置页面
   - 在 "Custom URL" 或 "New Tab URL" 输入框中填入：
     ```
     http://localhost:8080/index.html
     ```
   - 保存设置

3. **体验效果**：
   - 打开新标签页时自动显示书签导航
   - 支持快速访问常用网站

### 注意事项

- 确保书签导航服务器已启动（运行 `.\start.ps1`）
- 如果需要在局域网内其他设备访问，使用局域网 IP 地址
- 插件配置的 URL 需要与服务器运行地址一致

## 📖 使用说明

### 添加书签
1. 点击「+ 添加书签」按钮
2. 填写网站名称、URL、描述（可选）
3. 选择分类或创建新分类
4. 点击保存

### 搜索功能
1. 在搜索框中输入关键词
2. 支持搜索书签名称、URL、描述、分类
3. 按回车键触发搜索，优先搜索书签
4. 如果书签中没有匹配结果，会自动使用第一个搜索引擎（Google）进行搜索
5. 可手动切换搜索引擎（书签搜索、Google、百度、必应、DuckDuckGo）

### 管理分类
1. 点击「📁 编辑分类」按钮
2. 可添加、重命名、删除分类
3. 拖拽分类调整显示顺序

### 导入导出
1. 点击右下角的导入导出按钮（📥图标）
2. **导出书签**：点击「📤 导出书签」下载 JSON 文件
3. **导入书签**：点击「📥 导入书签」选择 JSON 文件
4. 支持两种导入模式：追加到现有书签、替换所有书签
5. 导入时会自动创建新分类，并提示新增的分类名称

### 滚轮切换分类
1. 将鼠标悬停在分类按钮区域或书签卡片区域
2. 滚动滚轮即可快速切换分类
3. 向右/向下滚动：切换到下一个分类
4. 向左/向上滚动：切换到上一个分类
5. 当前分类为"全部"时，保持正常的页面滚动
6. "全部"分类需要手动点击才能切换

## 📁 项目结构

```
zhzx/
├── index.html                 # 主页面（包含所有前端逻辑）
├── server.js                  # Node.js 服务器
├── start.ps1                  # PowerShell 启动脚本
├── bookmarks.json             # 书签数据（运行时使用）
├── bookmarks.sample.json      # 示例书签数据（用于初始化）
├── categoryOrder.json         # 分类顺序配置（运行时使用）
├── categoryOrder.sample.json  # 示例分类配置（用于初始化）
├── .gitignore                 # Git 忽略文件配置
├── README.md                  # 项目说明文档
└── bg.JPG                     # 背景图片
```

### 初始化数据

首次使用时，将示例数据复制为运行时数据：

```bash
# Windows PowerShell
Copy-Item bookmarks.sample.json bookmarks.json
Copy-Item categoryOrder.sample.json categoryOrder.json

# 或手动复制文件并重命名
```

## 🔧 配置

### 修改端口

编辑 `server.js` 第 151 行：

```javascript
server.listen(8080, () => {
    console.log('Server running at http://localhost:8080/');
});
```

### 默认分类

编辑 `categoryOrder.json` 文件自定义默认分类顺序。

### 导入导出功能开关

编辑 `index.html` 第 1096-1098 行，设置是否启用导入导出功能：

```javascript
const CONFIG = {
    enableImportExport: true  // 设置为 false 可禁用导入导出功能
};
```

- `enableImportExport: true` - 启用导入导出功能（默认）
- `enableImportExport: false` - 禁用导入导出功能，右下角按钮将不会显示

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Made with ❤️ for 运维人员**