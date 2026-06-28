# 📚 个人书签导航 - Chrome 插件

一个现代化的 Chrome 浏览器新标签页书签导航插件，专为个人设计，支持快速访问常用网站、搜索功能和分类管理。

## ✨ 功能特点

- **🔍 智能搜索**：支持实时搜索书签，集成多种搜索引擎（Google、百度、必应、DuckDuckGo）
- **📁 分类管理**：支持创建、编辑、删除分类，可拖拽调整顺序
- **🎨 毛玻璃UI**：现代化视觉设计，支持多种背景主题
- **📱 响应式设计**：完美适配桌面端和移动端
- **💾 数据持久化**：使用 Chrome Storage 本地存储
- **🎨 背景切换**：内置多种渐变背景 + 若尔盖大草原，支持上传自定义背景
- **📥 导入导出**：支持书签数据的 JSON 导入导出
- **🖱️ 滚轮切换**：鼠标悬停在分类或书签区域时，滚轮滑动可快速切换分类

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (Vanilla)
- **存储**: Chrome Storage API
- **规范**: Manifest V3

## 📦 安装

### 前置要求

- **Chrome 浏览器**：版本 88+（支持 Manifest V3）
- 无需安装任何依赖

### 安装步骤

1. 下载或克隆本仓库
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择 `chrome-extension` 文件夹
6. 打开新标签页即可看到书签导航页面

## 🎯 功能说明

### 添加书签

1. 点击右上角「+ 添加书签」按钮
2. 填写网站名称、URL、描述（可选）
3. 选择分类或创建新分类
4. 点击保存

### 搜索功能

1. 在搜索框中输入关键词
2. 支持搜索书签名称、URL、描述、分类
3. 可手动切换搜索引擎（书签搜索、Google、百度、必应、DuckDuckGo）

### 管理分类

1. 点击右上角「📁 编辑分类」按钮
2. 可添加、重命名、删除分类
3. 拖拽分类调整显示顺序

### 更换背景

1. 点击右下角 ⚙️ 按钮
2. 选择「🎨 更换背景」
3. 选择预设主题或上传自定义背景图片
4. 背景自动保存，下次打开自动应用

### 导入导出

1. 点击右下角 ⚙️ 按钮
2. **导出书签**：点击「📤 导出书签」下载 JSON 文件
3. **导入书签**：点击「📥 导入书签」选择 JSON 文件

### 拖拽排序

1. 按住书签卡片拖动到目标位置
2. 松开鼠标完成排序

## 📁 项目结构

```
navi-bookmarks-chrome/
├── chrome-extension/            # Chrome 插件目录
│   ├── manifest.json           # 插件配置文件
│   ├── newtab.html             # 新标签页入口
│   ├── newtab.js               # JavaScript 逻辑
│   ├── newtab.css              # 样式文件
│   ├── Zoigê.JPG               # 若尔盖大草原背景图
│   └── icons/                  # 插件图标
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── old/                        # 旧版 Web 项目文件
├── README.md
├── CHANGELOG.md
└── .gitignore
```

## 🔧 配置

### 默认分类

在 `newtab.js` 中修改 `defaultCategories` 数组：

```javascript
let defaultCategories = ['常用', '开发工具', '搜索引擎', '学习资源', '社区论坛', '其他'];
```

### 导入导出功能开关

在 `newtab.js` 中修改 `CONFIG` 对象：

```javascript
const CONFIG = {
    enableImportExport: true  // 设置为 false 可禁用导入导出功能
};
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Made with ❤️ for 运维人员**
