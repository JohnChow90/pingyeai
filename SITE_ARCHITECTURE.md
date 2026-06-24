# 平野AI工具站 (pingyeai.cn) — 全过程建设记录

> 最后更新：2026-05-30
> 作者：John Chow

---

## 一、项目概览

### 网站定位
AI工具目录站 + 工具评测博客，对标 OpenAlternative 模式。

### 技术栈
- **托管**：Vercel（GitHub 自动部署）
- **域名**：pingyeai.cn（阿里云）
- **前端**：纯静态 HTML + CSS + JavaScript（无框架）
- **CDN**：Cloudflare（代理加速）
- **统计**：百度统计 + Google Analytics + Cloudflare Web Analytics

### 当前规模
- **53 个 HTML 页面**
- **16 个模型详情页**（程序化 SEO）
- **6 个厂商聚合页**
- **20 篇博客文章**
- **2 个在线工具**

---

## 二、搭建过程

### 2.1 初始搭建（2026-04）

#### 第一步：Vercel 部署
```bash
# 创建项目目录
mkdir pingyeai && cd pingyeai
git init

# 创建 index.html
# 对应提交：5cc69d9

# 部署到 Vercel
vercel --prod

# 关联 GitHub
git remote add origin https://github.com/JohnChow90/pingyeai.git
git push -u origin main
```

#### 第二步：域名绑定
1. 域名 `pingyeai.cn` 在阿里云购买
2. Vercel 项目设置 → Domains → 输入 `pingyeai.cn`
3. 阿里云 DNS 解析 → 添加 CNAME：
   - 记录类型：`CNAME`
   - 主机记录：`www`
   - 记录值：`cname.vercel-dns.com`
4. 添加 CNAME：
   - 记录类型：`CNAME`
   - 主机记录：`@` → `pingyeai.vercel.app`（有时候需要 `@`用 A 记录指向 Vercel IP）

#### 第三步：Cloudflare 代理（可选）
1. 在 Cloudflare 添加 `pingyeai.cn`
2. 域名 NS 改为 Cloudflare 的 NS 服务器
3. 开启橙色云朵（代理模式）
4. 会遇到 Cloudflare RUM 的 CORS 报错（无害假错误，忽略）

#### 第四步：vercel.json 配置
```json
{
    "cleanUrls": true,
    "trailingSlash": false
}
```
- `cleanUrls: true` → 自动去掉 `.html` 后缀
- `trailingSlash: false` → URL 末尾不加 `/`
- 对应提交：`ae54cdf`

### 2.2 统计系统搭建

#### 百度统计
```
注册 → https://tongji.baidu.com
获取代码 → 复制 hm.js?xxxxxxxx 的脚本
放到所有页面的 <head> 中
```

部署代码：
```html
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

- 初始使用占位 ID → `e62770d` 替换为真实百度统计 ID
- 当前 49 个页面已嵌入
- 对应提交：`6012730`、`e62770d`

#### Google Analytics (GA4)
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```
- 当前为占位 ID，未绑定真实 GA 媒体资源

#### Cloudflare Web Analytics
```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_CLOUDFLARE_TOKEN"}'></script>
```
- 当前为占位 Token

---

## 三、核心功能模块

### 3.1 首页 — AI模型价格对比器

**文件**：`index.html`

**数据来源**：
- **OpenAI** → `openai.com/api/pricing`
- **DeepSeek** → `api-docs.deepseek.com`
- **其他模型** → 基于现行公开定价

**数据结构**：
```javascript
const apiModels = [
  { id:'gpt55', name:'GPT-5.5', prov:'openai', input:5.00, output:30.00, ... },
  { id:'dsv4f', name:'DeepSeek V4 Flash', prov:'deepseek', input:0.14, output:0.28, ... },
  // 共 16 个模型
];
```

**功能**：
- 搜索过滤
- 厂商筛选
- API/订阅两张表
- 价格柱状图

**推广位**：
- DeepSeek（返佣链接）
- 阿里云（返佣链接，userCode=6fsnflck）
- 小米 MiMo（推荐码 9YRE8S，双方各得 ¥10）

### 3.2 博客系统

**文件**：`blog/index.html` + 20 篇博文

**分类标签**：TRAE SOLO / WorkBuddy / OpenClaw / AI工具 / 云服务 / AI编程

**发布流程**：
1. 新建 `blog/{slug}.html`
2. 在 `blog/index.html` 的博文列表加入新条目
3. 在 `data/models.json` 的 `BLOG_ARTICLES` 数组注册
4. 运行 `node build.js` 更新 JSON-LD + 导航栏

**全部博文**（按时间倒序）：

| 日期 | 标题 | 分类 |
|------|------|------|
| 2026-05-29 | TRAE SOLO调用飞书CLI做PPT，还是算了吧 | TRAE SOLO |
| 2026-05-28 | AI开发者云服务器选购指南 2026 | 云服务 |
| 2026-05-25 | AI工具一大堆，怎么选？ | AI工具 |
| 2026-05-21 | TRAE SOLO的docx、pptx技能执行不了 | TRAE SOLO |
| 2026-05-19 | OpenClaw里程碑式更新，macOS原生App | OpenClaw |
| 2026-05-18 | 都说Claude比TS强，我试了一下——然后没换 | AI工具 |
| 2026-05-15 | 试了十几个AI工具，真正留在电脑里的只有这3个 | AI工具 |
| 2026-05-13 | TRAE SOLO 真香 | TRAE SOLO |
| 2026-05-12 | 没想到你是这样的WorkBuddy | WorkBuddy |
| 2026-05-11 | TRAE SOLO，说好的免费呢？ | TRAE SOLO |
| 2026-05-10 | 10分钟搞定TRAE SOLO接入ima知识库 | TRAE SOLO |
| 2026-05-09 | TRAE SOLO到底值不值得用 | TRAE SOLO |
| 2026-05-07 | 别再问我绿TRAE和TRAE SOLO选哪个了 | TRAE SOLO |
| 2026-05-06 | 用TRAE SOLO一个多月，我踩了6个坑 | TRAE SOLO |
| 2026-05-05 | Windows版 TRAE SOLO 客户端上线 | TRAE SOLO |
| 2026-05-01 | 手机端 Trae Solo 上线 | TRAE SOLO |
| 2026-04-29 | 零基础自学AI编程3个月 | AI编程 |
| 2026-04-24 | 上来就Craft？WorkBuddy积分就是这么烧没的 | WorkBuddy |

### 3.3 在线工具

#### 内容多平台分发助手
**文件**：`tools/content-distributor.html`
**URL**：`https://www.pingyeai.cn/tools/content-distributor`

功能：一篇公众号文章 → AI 自动拆成 5 种版本（公众号/小红书/知乎/播客/朋友圈）
后端：调 DeepSeek API（需用户自备 Key）

#### API用量监控
**文件**：`tools/api-monitor.html`
**URL**：`https://www.pingyeai.cn/tools/api-monitor`

功能：实时查看 API 用量/余额
注意：需要先配置 API Key

---

## 四、关键修复记录

### 4.1 分发工具 — `</script>` 标签缺失

**问题**：`tools/content-distributor.html` 底部的主脚本 `<script>` 没有对应的 `</script>` 关闭标签，浏览器把后续所有 HTML 当 JavaScript 解析，整个页面失效。

**症状**：
- API Key 保存后刷新消失
- 所有按钮点击无反应
- Console 无 `[分发工具]` 日志

**修复**：补上 `</script>`（对应提交：`5670279`）

**教训**：HTML 中 `<script>` 标签必须成对出现，这是基本但容易被忽略的问题。

### 4.2 分发工具 — API Key 保存不持久

**问题**：localStorage 操作缺少 try-catch，浏览器隐私模式下会抛异常导致脚本中断。

**修复**：
- 所有 localStorage 操作加 try-catch
- 添加 `checkApiKey()` 前置检查
- 失败时弹 alert 提醒
- 添加 `[分发工具]` 控制台调试日志

### 4.3 内容分发工具 Cloudflare CORS 报错

**问题**：Cloudflare RUM 脚本报 CORS 错误。

**结论**：**无害假错误**。Cloudflare 的 `beacon.min.js` 使用 `navigator.sendBeacon()` 发送数据，浏览器报错但数据已发出，不影响网站功能。无需处理。

---

## 五、网站升级 — 程序化 SEO

### 5.1 构建脚本 (build.js)

**位置**：`build.js`
**目的**：从结构化数据批量生成页面，实现对标 OpenAlternative 的程序化 SEO

**功能**：
1. 生成模型详情页（`/models/{slug}.html`）
2. 生成模型目录页（`/models/index.html`）
3. 生成厂商聚合页（`/models/{provider}.html`）
4. 添加 JSON-LD 结构化数据到所有页面
5. 更新导航栏
6. 生成 sitemap.xml
7. 生成 RSS feed (feed.xml)

**运行方式**：
```bash
node build.js
```

**输出**：23 个新页面 + sitemap + RSS

### 5.2 数据文件

**位置**：`data/models.json`

```json
[
  { "id": "gpt55", "name": "GPT-5.5", "provider": "openai", "inputPrice": 5.00, ... },
  // 共 16 个模型
]
```

**维护方式**：加新模型只需修改此文件，运行 `node build.js` 即可同步所有页面。

### 5.3 模型详情页结构

每个模型页包含：
- **Hero**：模型名称 + 价格亮点
- **价格卡片**：输入/输出/缓存/上下文 四列
- **对比表格**：同厂商其他模型对比
- **同类模型对比**：Cross-provider comparison
- **相关博客文章**：根据关键词匹配
- **C2A 按钮**：直达官方

### 5.4 JSON-LD 结构化数据

**覆盖范围**：所有 53 个页面

**Schema 类型**：

| 页面类型 | Schema | 数量 |
|---------|--------|------|
| 首页 | WebSite + BreadcrumbList | 2 |
| 模型详情页 | Product + WebApplication | 2/页 |
| 博客文章 | Article + BreadcrumbList | 2/篇 |
| 博客首页 | Blog | 1 |
| 工具页 | WebApplication | 1/页 |
| 编程工具对比 | WebSite | 1 |

**示例（模型页 Product schema）**：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DeepSeek V4 Flash API",
  "description": "...",
  "brand": { "@type": "Brand", "name": "DeepSeek" },
  "offers": {
    "@type": "Offer",
    "price": "0.14",
    "priceCurrency": "USD",
    "priceUnit": "per 1 million tokens"
  }
}
</script>
```

### 5.5 Sitemap + RSS

**sitemap.xml**：
- 50 条 URL
- 按页面重要性标记优先级（首页 1.0 → 隐私页 0.1）
- 提交地址：Google Search Console
- 提交 URL：`https://www.pingyeai.cn/sitemap.xml`

**feed.xml (RSS)**：
- 20 篇博客文章
- `zh-CN` 语言
- 所有页面 `<head>` 已加 RSS 链接
- 博客底部已有 📡 RSS 按钮

---

## 六、推广变现体系

### 6.1 推广链接

| 产品 | 链接类型 | 备注 |
|------|---------|------|
| DeepSeek | 返佣 | `https://chat.deepseek.com`（标注 sponsored） |
| 阿里云 | 返佣 | userCode=6fsnflck |
| 小米 MiMo | 邀请码 | 推荐码 9YRE8S，双方各得 ¥10 |

### 6.2 法律合规

- `/affiliate-disclaimer/` — 推广关系声明页
- `/privacy/` — 隐私政策页
- 所有推广链接标注 `rel="sponsored"` 或 `aff-note`

---

## 七、部署流程

### 日常更新
```bash
# 1. 修改文件
vim index.html  # 或其他文件

# 2. 运行构建脚本（新增模型时）
node build.js

# 3. 提交并推送（自动触发 Vercel 部署）
git add -A
git commit -m "描述改了啥"
git push
```

### 首次部署
```bash
# Vercel CLI 安装
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 关联 GitHub（自动部署）
vercel git connect
```

---

## 八、对标 OpenAlternative 模式

文章参考：https://mp.weixin.qq.com/s/Pp6REvY0-mBS6adfWD9oMQ

| OpenAlternative 模式 | pingyeai.cn 实现 |
|---------------------|-----------------|
| 程序化 SEO（Airtable 批量生成页面） | build.js + data/models.json → 23个SEO页面 |
| 「X 的开源替代品」长尾关键词 | 「AI模型价格」「DeepSeek定价」「Claude API价格」 |
| 有精准流量→广告价值 | 底部推广链接（DeepSeek/阿里云/小米） |
| 复制模式到第二个产品 | 内容分发助手 → 可复用为模板 |
| sitemap + RSS 提交流量 | ✅ 已实现 |

---

## 九、Todo / 待优化

### SEO
- [ ] 提交 sitemap.xml 到 Google Search Console
- [ ] 提交 sitemap.xml 到百度搜索资源平台
- [ ] 配置百度站长平台（https://ziyuan.baidu.com）
- [ ] Google Analytics 替换为真实 ID
- [ ] Cloudflare Token 替换为真实 Token

### 内容
- [ ] 博客文章关联模型页（已在 build.js 中实现相关文章逻辑）
- [ ] 更多博客文章 — 模型测评系列
- [ ] 每个模型页的详细评测内容

### 技术
- [ ] GitHub Actions 自动运行 build.js（在推送时）
- [ ] RSS 按钮的样式优化
- [ ] 首页加载性能优化

---

## 十、关键词备忘

### SEO 目标关键词
- AI模型价格对比
- DeepSeek V4 Flash 定价
- GPT-5.5 API价格
- Claude 4 价格
- API定价对比
- TRAE SOLO 教程
- AI编程工具推荐
- AI模型价格表 2026

### 站内搜索词
- 首页搜索框可直接搜模型名
- 博客可按分类筛选

---

## 附录A：API监控工具（Electron App）修复

项目位置：`/Users/zhousongqiang/.openclaw/workspace/api-monitor/`

### 文件结构
```
api-monitor/
├── main.js                         # Electron 主进程
├── preload.js                      # IPC 桥接
├── renderer/
│   ├── index.html                  # 界面
│   ├── app.js                      # 前端逻辑
│   └── styles.css                  # 样式
└── package.json
```

### 问题1：数据不刷新
**根因**：`get-demo-snapshot` 返回硬编码 Demo 数据，每次刷新数字不变。

**修复**：
1. `main.js` → 添加 `fetch-live-data` IPC handler，调真实 API：
   - DeepSeek：`GET /user/balance`（余额 ¥49.77 ✅）
   - DeepSeek：`GET /billing/usage`（该接口不存在）
   - OpenAI：`GET /v1/dashboard/billing/usage`（网络不可达）
   - Xiaomi：无公开 billing API
2. `app.js` → `refreshAll()` 改为调 `fetchLiveData()`
3. 添加 `mergeSnapshot()` 函数：实时余额 + Demo 用量数据兜底

### 问题2：关键信息
- 启动命令：`cd ~/.openclaw/workspace/api-monitor && npm start`
- 配置文件：`~/Library/Application Support/api-monitor/data/config.json`
- 已配置 Key：DeepSeek（真实余额 ¥49.77）、Xiaomi、OpenAI

## 附录B：内容分发工具修复

### 问题1：`</script>` 标签缺失
**症状**：整个页面 JS 不执行，API Key 不保存，按钮无反应。

**修复**：补上 `</script>` 关闭标签。根因是编辑过程中意外删除了结束标签。

### 问题2：Cloudflare RUM CORS 报错
**症状**：Console 显示 `Access to XMLHttpRequest at 'cloudflareinsights.com/cdn-cgi/rum' has been blocked by CORS policy`

**结论**：无害假错误。Cloudflare RUM 脚本不受 CORS 影响，数据已正常发出。

## 附录C：全部 Git 提交历史（完整）

```
5cc69d9 init: AI模型价格对比器 v1
c27dda8 更新AI定价数据 + 域名改为pingyeai.cn
9a1a672 添加导航栏 + GA/百度统计 + 编程工具关联入口
ae54cdf Add vercel.json configuration for clean URLs
844987d Create compare-ai-coding-tools.html
...
e7b9842 chore: remove temp patch_build.js
```

完整 git log 查看：`git log --oneline --reverse`
