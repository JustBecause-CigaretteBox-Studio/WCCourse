# AGENTS.md — 野鸡动画编程课

本文件供 AI 编程代理阅读。它概括了项目的结构、技术栈、构建方式、代码约定和部署流程。阅读前请确认：项目根目录是 `C:/Users/25504/Desktop/成人编程课最终版`。

---

## 1. 项目概述

**野鸡动画编程课**是一个面向完全新手的编程入门课程项目，同时提供两种使用方式：

1. **浏览器离线版**：项目根目录下的单文件 HTML 页面，双击即可在浏览器中打开，无需服务器、无需联网。
2. **Electron 桌面版**：位于 `Package/` 目录，基于 Electron 封装上述 HTML 页面，支持 Windows 便携包和 macOS 应用包。

课程支持 **C++ / Python 双语**切换、深色模式、学习进度本地保存、章节小测验、练习题目系统、以及一个内置 C++/Python IDE 的练习项目系统。

---

## 2. 目录结构

```
C:/Users/25504/Desktop/成人编程课最终版/
├── index.html                      # 课程主页（浏览器版）
├── 开始之前.html                  # 学前说明与工具下载指引
├── 编程入门教程.html              # 第 1 章
├── 编程入门教程第二章.html        # 第 2 章
├── 编程入门教程第三章.html        # 第 3 章
├── 编程入门教程第四章.html        # 第 4 章
├── 编程入门教程第五章.html        # 第 5 章
├── 题目系统.html                  # 精选 OJ 题目与渐进提示
├── 项目系统.html                  # 内置 IDE 的练习项目
├── 捐赠.html                      # 捐赠页面
├── 完成恭喜.html                  # 全部学完后跳转的庆祝页
├── skulpt.min.js                  # Python 运行时（浏览器内解释器）
├── skulpt-stdlib.js               # Skulpt 标准库
├── JSCPP.bundle.js                # C++ 运行时（浏览器内解释器）
├── file.png / file1.png / file.webp
│                                  # 根目录下的图片资源（当前未在 HTML 中显式引用）
├── Package/
│   ├── package.json               # Electron 项目配置与构建脚本
│   ├── main.js                    # Electron 主进程
│   ├── preload.js                 # Electron 预加载脚本，暴露 AppStore
│   ├── app/                       # Electron 加载的页面副本
│   │   ├── index.html
│   │   ├── 开始之前.html
│   │   ├── 编程入门教程*.html
│   │   ├── 题目系统.html
│   │   ├── 项目系统.html
│   │   ├── 捐赠.html
│   │   ├── 完成恭喜.html
│   │   ├── skulpt.min.js
│   │   ├── skulpt-stdlib.js
│   │   └── JSCPP.bundle.js
│   └── dist/                      # 构建产物
│       ├── 野鸡动画编程课.exe
│       ├── 野鸡动画编程课-macOS-arm64.zip
│       ├── 野鸡动画编程课-macOS-x64.zip
│       ├── 下载页.html
│       └── Mac使用说明.txt
└── .workbuddy/
    └── memory/                    # 与项目代码无关，是工作区历史记录
```

**关键约定**：`Package/app/` 中的 HTML 文件是浏览器版文件的**副本**，但增加了 Electron 存储兼容层（见下文）。如果你修改了根目录下的课程页面，通常需要同步到 `Package/app/` 才能在桌面版中生效。

---

## 3. 技术栈

- **前端**：纯原生 HTML + CSS + JavaScript，无框架、无构建工具。
- **样式**：全部使用内嵌 `<style>`，通过 CSS 变量（`:root`）和 `html.dark` 类实现浅色/深色主题。
- **代码运行**：
  - Python：使用 [Skulpt](https://skulpt.org/)（`skulpt.min.js` + `skulpt-stdlib.js`）在浏览器中解释执行。
  - C++：使用 [JSCPP](https://github.com/felixhao28/JSCPP)（`JSCPP.bundle.js`）在浏览器中解释执行。
- **桌面封装**：Electron 33 + electron-builder 24。
- **持久化**：
  - 浏览器版：`localStorage`（受 `file://` 协议限制，跨文件进度同步可能不工作）。
  - 桌面版：通过 Electron `preload` + IPC 将进度写入 `store.json`，位置在系统用户数据目录。

---

## 4. Electron 运行时架构

- **入口**：`Package/main.js` 创建 `BrowserWindow`，加载 `Package/app/index.html`。
- **预加载脚本**：`Package/preload.js` 暴露 `window.AppStore`（接口与 `localStorage` 相同：`.getItem` / `.setItem` / `.removeItem`）。
- **IPC 通道**：
  - `store:get-path`（同步）：主进程返回 `store.json` 的绝对路径。
  - `store:write`（异步）：页面写入时，主进程将整份数据落盘。
- **安全配置**（`Package/main.js`）：
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `sandbox: false`（必须关闭沙箱，`preload` 才能使用 `fs` 读写本地文件）
- **外部链接**：所有 `http://` / `https://` 链接统一交给系统浏览器打开（`shell.openExternal`）。
- **存储路径**：
  - Windows：`C:\Users\<用户名>\AppData\Roaming\yeji-coding-course\store.json`
  - macOS：`~/Library/Application Support/yeji-coding-course/store.json`

---

## 5. 代码组织方式

项目没有模块拆分，每个 HTML 文件都是**自包含**的：

1. `<style>`：全部 CSS（变量、布局、组件、深色模式）。
2. `<body>`：教学内容与结构。
3. `<script>`：交互逻辑（主题、语言、目录、测验、代码高亮、运行台、进度保存等）。

### 5.1 页面职责

| 文件 | 说明 |
|------|------|
| `index.html` | 课程主页，展示章节卡片、总体进度、题目/项目入口。 |
| `开始之前.html` | 学前 FAQ、环境安装指引。 |
| `编程入门教程*.html` | 五章教学内容，每章 5~7 小节。 |
| `题目系统.html` | 内置洛谷入门题，按难度分类，支持渐进式提示。 |
| `项目系统.html` | 两个练习项目（口算题生成器、程序流程题生成器），内置 IDE 可运行 C++/Python。 |
| `捐赠.html` | 捐赠二维码页面。 |
| `完成恭喜.html` | 全部章节完成后跳转的庆祝页。 |

### 5.2 公共交互组件

- **主题切换**：按钮 `#theme-btn`，保存键 `coding-101-theme`。
- **C++ / Python 切换**：按钮 `#lang-toggle` / `.lang-tab`，保存键 `coding-101-language` / `coding-101-project-lang`。
- **代码块**：`.code-block[data-file][data-lang]`，JS 会自动加上 mac 风格标题栏、行号和简单语法高亮。
- **小测验**：`.quiz[data-answer]`，点击选项后显示对错与解析。
- **打卡按钮**：`.done-btn[data-lesson]`，点击后把对应小节标记为已完成。
- **视角切换卡片**：`.perspective` + `.pers-tabs` + `.pers-pane`，用于“人类视角 / 电脑视角”切换。

---

## 6. 关键本地存储键

| 键 | 含义 |
|----|------|
| `coding-101-theme` | 主题：`dark` / `light` |
| `coding-101-language` | 章节页默认语言：`cpp` / `python` |
| `coding-101-preface-lang` | 开始之前页选中的语言 |
| `coding-101-progress` | 第 1 章学习进度（JSON） |
| `coding-101-ch2-progress` | 第 2 章学习进度（JSON） |
| `coding-101-ch3-progress` | 第 3 章学习进度（JSON） |
| `coding-101-ch4-progress` | 第 4 章学习进度（JSON） |
| `coding-101-ch5-progress` | 第 5 章学习进度（JSON） |
| `coding-101-congrats-shown` | 是否已展示完成恭喜页（只跳一次） |
| `coding-101-project-lang` | 项目系统当前语言 |
| `coding-101-current-project` | 项目系统当前选中的项目 |
| `coding-101-project-code` | 项目系统用户编辑过的代码（JSON） |
| `coding-101-project-code-version` | 项目 starterCode 版本号 |

**注意**：桌面版 `AppStore` 只保存**字符串值**，JSON 对象在存储前需 `JSON.stringify`。

---

## 7. 构建与运行

### 7.1 浏览器离线版

无需构建。直接双击根目录下的任意 HTML 文件即可。

如果你要在本地验证页面效果，可以起一个静态文件服务器（例如 Python）：

```bash
cd "C:/Users/25504/Desktop/成人编程课最终版"
python -m http.server 8080
```

然后在浏览器打开 `http://localhost:8080/index.html`。

### 7.2 Electron 桌面版

进入 `Package/` 目录：

```bash
cd Package
npm install
npm start              # 启动 Electron 调试
npm run dist           # 构建 Windows 便携版（输出到 Package/dist）
```

当前 `package.json` 的 `build` 配置只显式声明了 `win` / `portable` 目标，但 `Package/dist/` 中同时存在 macOS 压缩包，说明实际发布时也执行过 `electron-builder --mac` 之类的命令。如需构建 macOS 包，可运行：

```bash
npx electron-builder --mac zip
```

### 7.3 发布产物

- Windows：`Package/dist/野鸡动画编程课.exe`
- macOS ARM：`Package/dist/野鸡动画编程课-macOS-arm64.zip`
- macOS Intel：`Package/dist/野鸡动画编程课-macOS-x64.zip`
- 下载页：`Package/dist/下载页.html`

---

## 8. 测试策略

- **没有自动化测试框架**。所有功能靠人工在浏览器或 Electron 中验证。
- Electron 主进程支持一个**自检模式**：
  ```bash
  cd Package
  npx electron . --smoke
  ```
  该模式会隐藏窗口，页面加载后执行 `AppStore` 读写、检查 DOM 元素，并在控制台输出 `SMOKE *` 系列日志，最后自动退出。
- 修改课程页面后建议检查：
  1. 浅色 / 深色主题切换是否正常；
  2. C++ / Python 语言切换后对应内容是否正确显示；
  3. 打卡按钮是否写入进度并在 `index.html` 卡片上正确汇总；
  4. 项目系统是否能正常编译运行示例代码；
  5. Electron 桌面版中进度是否能跨页面同步（验证 `store.json` 是否更新）。

---

## 9. 代码风格与开发约定

1. **语言**：项目注释和文档主要使用中文。新增注释也请使用中文。
2. **单文件原则**：每个页面应尽量保持自包含，避免依赖外部 CSS/JS 文件。
3. **CSS 变量名**：沿用 `--bg`、`--bg-section`、`--bg-card`、`--bg-soft`、`--text`、`--text-soft`、`--text-faint`、`--border`、`--code-inline-bg` 等命名。
4. **深色模式**：通过给 `<html>` 添加/移除 `class="dark"` 实现，不要写两套独立样式文件。
5. **存储兼容层**：
   - 浏览器版直接使用 `localStorage`。
   - 桌面版页面顶部有一行脚本：
     ```html
     <script>var AppStore = window.AppStore || window.localStorage;</script>
     ```
     页面内所有读写都通过 `AppStore`。修改根目录 HTML 后，如果也要在桌面版生效，请在 `Package/app/` 对应文件顶部保留该行。
6. **字符串拼接**：现有代码使用 ES5 风格（`var`、`function`、无模板字符串）。新增代码请保持同一风格，以保证在不支持新语法的老旧环境中双击打开也能运行。
7. **代码块约定**：
   ```html
   <div class="code-block" data-file="hello.py" data-lang="python"><pre>...</pre></div>
   ```
   `data-lang` 只接受 `cpp` 或 `python`。
8. **不要修改 `JSCPP.bundle.js`、`skulpt.min.js`、`skulpt-stdlib.js`**：它们是已打包的第三方运行时，除非明确升级版本。

---

## 10. 安全注意事项

1. **Electron 沙箱已关闭**（`sandbox: false`），`preload.js` 可以读写本地文件系统。请确保 `preload.js` 暴露的 API 最小化，不要向页面暴露原始 `fs` 或 `ipcRenderer.invoke` 等能力。
2. **进度文件是明文 JSON**：`store.json` 位于用户数据目录，包含学习进度但不包含敏感信息。不要将密码、Token 等写入其中。
3. **没有内容安全策略（CSP）**：页面直接内嵌脚本和样式，新增外部资源（例如 CDN）时应评估风险。
4. **外部链接**：课程中所有外链（GitHub、VSCode、Python 官网等）都应在桌面版中通过 `shell.openExternal` 打开，避免在应用内加载不可信页面。
5. **代码执行**：`项目系统.html` 中的 C++/Python 代码只在客户端解释器中运行，不发送到服务器。但仍要提醒用户不要粘贴来历不明的代码。
6. **捐赠二维码**：`捐赠.html` 中直接嵌入了微信 / 支付宝收款二维码的 base64 图片，修改时注意保留对应资源。

---

## 11. 常见任务速查

| 任务 | 操作 |
|------|------|
| 修改课程主页 | 编辑 `index.html`，并同步到 `Package/app/index.html` |
| 修改某一章节 | 编辑 `编程入门教程第X章.html`，并同步到 `Package/app/` |
| 新增/调整题目 | 编辑 `题目系统.html` 中的题目数据数组，同步到 `Package/app/题目系统.html` |
| 新增/调整练习项目 | 编辑 `项目系统.html` 中的 `PROJECTS` 数组和 `starterCode`，同步到 `Package/app/项目系统.html` |
| 修改主题色 / 布局 | 优先修改 `:root` 变量，确保浅色 / 深色模式同步 |
| 构建 Windows 桌面版 | `cd Package && npm run dist` |
| 调试 Electron | `cd Package && npm start` |
| 运行 Electron 自检 | `cd Package && npx electron . --smoke` |
| 清空本地进度（浏览器版） | 清除浏览器对应 `file://` 域下的 localStorage |
| 清空本地进度（桌面版） | 删除用户数据目录下的 `store.json` |

---

**最后更新**：基于项目当前文件内容整理，未包含未提交或外部依赖的变更。