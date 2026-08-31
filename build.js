#!/usr/bin/env node
/**
 * build.js — 平野AI工具站 构建脚本
 * 生成模型详情页、目录页、厂商聚合页
 * 更新 JSON-LD 结构化数据
 * 更新导航栏
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ====== 模型数据 ======
const MODELS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'models.json'), 'utf-8'));

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', color: '#0f3460' },
  { id: 'anthropic', label: 'Anthropic', color: '#d4a574' },
  { id: 'google', label: 'Google', color: '#4285f4' },
  { id: 'deepseek', label: 'DeepSeek', color: '#4caf50' },
  { id: 'xiaomi', label: '小米', color: '#ff6f00' },
  { id: 'others', label: '其他', color: '#9c27b0' },
];

const TAG_LABELS = {
  flagship: { cn: '旗舰', cls: 'tag-flagship' },
  popular: { cn: '热门', cls: 'tag-popular' },
  best: { cn: '推荐', cls: 'tag-best' },
  cheap: { cn: '超值', cls: 'tag-cheap' },
  recent: { cn: '最新', cls: 'tag-recent' },
};

const PROVIDER_COLORS = Object.fromEntries(PROVIDERS.map(p => [p.id, p.color]));

// ====== Blog articles metadata (for related articles) ======
const BLOG_ARTICLES = [
  { slug: 'trae-work-credit-6-tips', title: 'TRAE Work积分制上线，6招帮你省30%积分和token', cat: 'trae', keywords: ['trae', 'work', '积分', '积分制', '省积分', '省token', '模型', 'skill', '多agent', '上下文'] },
  { slug: 'trae-work-plugin-market', title: 'TRAE Work 插件市场上线', cat: 'trae', keywords: ['trae', 'work', 'plugin', 'market', 'plugins'] },
  { slug: 'trae-work-credit-system', title: 'TRAE Work积分体系上线，你慌不慌？3个省积分方法实测', cat: 'trae', keywords: ['trae', 'work', '积分', 'credit', '省钱', '模型', 'skill', '免费'] },
  { slug: 'workbuddy-videogen-kling', title: '避雷！WorkBuddy套壳可灵生视频模型冒充原生工具，却在偷偷烧掉你的积分', cat: 'wb', keywords: ['workbuddy', 'kling', 'videogen', '套壳', '积分', '避雷', '可灵'] },
  { slug: 'trae-work-zero-code-mini-program', title: '零代码上线小程序？TRAE Work、WorkBuddy通用6个环节路线图', cat: 'trae', keywords: ['trae', 'work', 'mini', 'program', 'zero', 'code', 'wechat'] },

  { slug: 'trae-work-feishu-cli', title: 'TRAE WORK+飞书CLI，6个技能让办公效率再上一层楼', cat: 'trae', keywords: ['trae','work','feishu','cli','lark','automation'] },

  { slug: 'trae-feishu-ppt', title: 'TRAE SOLO调用飞书CLI做PPT，还是算了吧', cat: 'trae', keywords: ['trae','solo','feishu','ppt','cli','mac','windows'] },
  { slug: 'ai-cloud-server-guide', title: 'AI开发者云服务器选购指南 2026', cat: 'cloud', keywords: ['cloud','server','gpu','aliyun','tencent','deploy','hosting'] },
  { slug: 'ai-tool-selection-guide', title: 'TRAE SOLO、WorkBuddy、DeepSeek……AI工具一大堆，怎么选？', cat: 'ai', keywords: ['ai','tool','selection','guide','deepseek','claude','gpt','compare'] },
  { slug: 'trae-docx-pptx', title: '「求助贴」TRAE SOLO的docx、pptx技能执行不了', cat: 'trae', keywords: ['trae','solo','docx','pptx','issue'] },
  { slug: 'openclaw-macos', title: 'OpenClaw里程碑式更新，macOS原生App让你的小龙虾能听会说', cat: 'oc', keywords: ['openclaw','macos','native','app','voice','talk','local','ai'] },
  { slug: 'claude-vs-ts', title: '都说Claude比TS强，我试了一下——然后没换', cat: 'ai', keywords: ['claude','trae','solo','compare','deepseek','gpt'] },
  { slug: 'ai-tools-3-only', title: '试了十几个AI工具，真正留在电脑里的只有这3个', cat: 'ai', keywords: ['ai','tools','trae','solo','openclaw','deepseek','recommend'] },
  { slug: 'trae-solo-zhenxiang', title: 'TRAE SOLO 真香', cat: 'trae', keywords: ['trae','solo','review','experience'] },
  { slug: 'workbuddy-real', title: '没想到你是这样的WorkBuddy', cat: 'wb', keywords: ['workbuddy','review','trae','solo','compare'] },
  { slug: 'trae-solo-free-limit', title: 'TRAE SOLO，说好的免费呢？', cat: 'trae', keywords: ['trae','solo','free','limit','quota'] },
  { slug: 'trae-solo-ima-knowledge', title: '10分钟搞定TRAE SOLO接入ima知识库', cat: 'trae', keywords: ['trae','solo','ima','knowledge','tutorial'] },
  { slug: 'trae-solo-worth-it', title: 'TRAE SOLO到底值不值得用', cat: 'trae', keywords: ['trae','solo','review','worth'] },
  { slug: 'trae-vs-trae-solo', title: '别再问我绿TRAE和TRAE SOLO选哪个了', cat: 'trae', keywords: ['trae','solo','compare','vscode'] },
  { slug: 'trae-solo-6-keng', title: '用TRAE SOLO一个多月，我踩了6个坑', cat: 'trae', keywords: ['trae','solo','pitfalls','tips'] },
  { slug: 'trae-solo-windows', title: 'Windows版 TRAE SOLO 客户端上线', cat: 'trae', keywords: ['trae','solo','windows','client'] },
  { slug: 'trae-solo-mobile', title: '手机端 Trae Solo 上线', cat: 'trae', keywords: ['trae','solo','mobile','app'] },
  { slug: 'self-learn-ai-3m', title: '零基础自学AI编程3个月：我的进化路线和踩坑全集', cat: 'code', keywords: ['learn','ai','coding','self-study','trae','solo','deepseek'] },
  { slug: 'workbuddy-craft-plan-ask', title: '上来就Craft？WorkBuddy积分就是这么烧没的', cat: 'wb', keywords: ['workbuddy','craft','plan','ask','tutorial'] },
  { slug: 'delete-5-keep-2', title: '删了5个AI编程软件，换成这2个', cat: 'ai', keywords: ['ai','tools','delete','recommend','trae','solo','openclaw'] },
  { slug: 'workbuddy-vs-trae-solo', title: 'WorkBuddy和Trae SOLO到底怎么选？', cat: 'wb', keywords: ['workbuddy','trae','solo','compare'] },
  { slug: 'doubao-work-vs-doubao', title: '「豆包工作」和「豆包」到底什么关系', cat: 'ai', keywords: ['豆包工作','豆包','doubao','对比','飞书','agent','字节'] },
];

// ====== Utility ======
const MODEL_PROVIDER_LABEL = (prov) => PROVIDERS.find(p => p.id === prov)?.label || prov;
const MODEL_INITIAL = (name) => name.split(' ')[0][0];
const TAG_HTML = (tags) => (tags || []).map(t => {
  const info = TAG_LABELS[t];
  return info ? `<span class="tag ${info.cls}">${info.cn}</span>` : '';
}).join('');

function priceStr(v) {
  if (v === null || v === undefined) return '—';
  return '$' + (v < 1 ? v.toFixed(v < 0.01 ? 4 : v < 0.1 ? 3 : 2) : v.toFixed(2));
}

function cacheStr(v) {
  if (v === null || v === undefined) return '—';
  return '$' + (v < 1 ? v.toFixed(v < 0.01 ? 4 : 2) : v.toFixed(2));
}

function findRelatedArticles(model) {
  const kw = [model.name.toLowerCase(), model.provider, model.note.toLowerCase()];
  return BLOG_ARTICLES
    .map(a => {
      let score = 0;
      for (const k of kw) {
        if (a.title.toLowerCase().includes(k)) score += 3;
        if (a.keywords.some(ak => ak.includes(k) || k.includes(ak))) score += 2;
      }
      // Provider-specific boosts
      if (model.provider === 'deepseek' && a.keywords.includes('deepseek')) score += 3;
      if (model.provider === 'openai' && a.keywords.includes('gpt')) score += 2;
      if (model.provider === 'google' && a.keywords.includes('gemini')) score += 3;
      if (model.provider === 'anthropic' && a.keywords.includes('claude')) score += 3;
      if (model.provider === 'xiaomi' && a.keywords.includes('xiaomi')) score += 2;
      // AI tools category matches
      if (a.cat === 'ai') score += 1;
      return { ...a, score };
    })
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

// ====== Templates ======

const COMMON_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:-apple-system,'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif;background:#f7f8fa;color:#1a1a2e;line-height:1.6;min-height:100vh}
.container{max-width:1200px;margin:0 auto;padding:0 20px}
.container-narrow{max-width:900px;margin:0 auto;padding:0 20px}
.navbar{background:#1a1a2e;border-bottom:1px solid rgba(255,255,255,0.06);position:sticky;top:0;z-index:100}
.navbar .container{display:flex;align-items:center;justify-content:space-between;height:52px}
.navbar .logo{display:flex;align-items:center;gap:8px;color:#fff;text-decoration:none;font-weight:700;font-size:1rem}
.navbar .logo .logo-img{width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0}
.navbar .logo span{color:#e94560}
.navbar .nav-links{display:flex;gap:4px}
.navbar .nav-links a{color:rgba(255,255,255,0.65);text-decoration:none;font-size:0.85rem;padding:8px 14px;border-radius:8px;transition:all 0.2s;white-space:nowrap}
.navbar .nav-links a:hover{color:#fff;background:rgba(255,255,255,0.08)}
.navbar .nav-links a.active{color:#fff;background:rgba(255,255,255,0.12)}
.navbar .hamburger{display:none;background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;padding:4px}
.hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:#fff;padding:50px 0 40px;text-align:center;position:relative;overflow:hidden}
.hero h1{font-size:clamp(1.3rem,3.5vw,2rem);font-weight:700;margin-bottom:10px;letter-spacing:-0.02em}
.hero h1 span{background:linear-gradient(90deg,#e94560,#ff6b6b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:clamp(0.85rem,2vw,1rem);color:rgba(255,255,255,0.7);max-width:600px;margin:0 auto}
.hero .badge{display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.hero .badge span{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:4px 14px;font-size:0.78rem;color:rgba(255,255,255,0.7)}
.footer{text-align:center;padding:30px 0;font-size:0.78rem;color:#999;border-top:1px solid #eee;margin-top:20px;line-height:1.8}
.footer a{color:#666;text-decoration:none}
.footer a:hover{color:#1a1a2e}
.tag{display:inline-block;font-size:0.68rem;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:4px;white-space:nowrap}
.tag-recent{background:#e3f2fd;color:#1565c0}
.tag-popular{background:#fff3e0;color:#e65100}
.tag-best{background:#e8f5e9;color:#2e7d32}
.tag-flagship{background:#f3e5f5;color:#7b1fa2}
.tag-cheap{background:#e8f5e9;color:#2e7d32}
.price-green{color:#2e7d32;font-weight:600}
.price-red{color:#c62828;font-weight:600}
@media(max-width:768px){
  .container{padding:0 14px}.container-narrow{padding:0 14px}
  .navbar .nav-links{display:none;position:absolute;top:52px;left:0;right:0;background:#1a1a2e;flex-direction:column;padding:8px;border-top:1px solid rgba(255,255,255,0.06)}
  .navbar .nav-links.open{display:flex}
  .navbar .hamburger{display:block}
  .hero{padding:35px 0 28px}
}
@media(max-width:480px){
  .hero{padding:28px 0 22px}
}
`;

function makeNavHTML(activePath) {
  const links = [
    { href: '/', label: '🏠 首页' },
    { href: '/models/', label: '📂 模型目录' },
    { href: '/compare-ai-coding-tools', label: '🛠 编程工具对比' },
    { href: '/blog/', label: '📝 博客' },
  ];
  return `<nav class="navbar">
  <div class="container">
    <a href="/" class="logo"><img src="/logo.jpg" alt="平野AI" class="logo-img" width="28" height="28"> <span>平野AI</span></a>
    <button class="hamburger" id="hamburgerBtn" aria-label="菜单">☰</button>
    <div class="nav-links" id="navLinks">
      ${links.map(l => `<a href="${l.href}"${l.href === activePath ? ' class="active"' : ''}>${l.label}</a>`).join('\n      ')}
    </div>
  </div>
</nav>`;
}

function makeFooterHTML() {
  return `<footer class="footer">
  <div><a href="https://pingyeai.cn">pingyeai.cn</a> — 平野AI工具站</div>
  <div>数据来源：OpenAI / DeepSeek 官方定价页面 · 其他模型定价仅供参考</div>
  <div><a href="/">首页</a> · <a href="/models/">模型目录</a> · <a href="/compare-ai-coding-tools">编程工具对比</a> · <a href="/blog/">博客</a></div>
</footer>`;
}

function makeNavScript() {
  return `<script>
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  if(a.getAttribute('href') === window.location.pathname) a.classList.add('active');
});
</script>`;
}

function makeAnalyticsSnippet() {
  return `<!-- 百度统计 -->
<script>var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?8787f6e4c29bc3acc5812750c378a195";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();</script>`;
}

function makePageHead(title, desc, canonical, jsonldBlocks) {
  const jsonld = (jsonldBlocks || []).map(j => `<script type="application/ld+json">\n${JSON.stringify(j, null, 2)}\n</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://pingyeai.cn${canonical}">
<meta property="og:title" content="${title.replace(/ \| .*$/, '')}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://pingyeai.cn${canonical}">
<meta name="twitter:card" content="summary_large_image">
${jsonld}
${makeAnalyticsSnippet()}
<style>${COMMON_CSS}
`;
}

// ====== Page Generators ======

/** Generate a model detail page */
function generateModelPage(m) {
  const relatedArticles = findRelatedArticles(m);
  const sameProvModels = MODELS.filter(x => x.provider === m.provider && x.id !== m.id);
  const otherModels = MODELS.filter(x => x.id !== m.id);
  // top 5 closest by price
  const priceSimilar = [...otherModels].sort((a, b) => Math.abs(a.inputPrice - m.inputPrice) - Math.abs(b.inputPrice - m.inputPrice)).slice(0, 5);

  const jsonldProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${m.name} API`,
    "description": m.description,
    "brand": { "@type": "Organization", "name": m.providerLabel },
    "offers": {
      "@type": "Offer",
      "price": m.inputPrice,
      "priceCurrency": "USD",
      "priceValidUntil": "2026-12-31",
      "description": `输入价格 $${m.inputPrice}/1M tokens，输出价格 $${m.outputPrice}/1M tokens`
    }
  };
  const jsonldApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${m.name}`,
    "operatingSystem": "API",
    "applicationCategory": "AIApplication",
    "description": m.description,
    "offers": {
      "@type": "Offer",
      "price": m.inputPrice,
      "priceCurrency": "USD"
    }
  };

  const title = `${m.name} API定价 2026 | 平野AI工具站`;
  const desc = `${m.name} API定价：输入$${m.inputPrice}/1M tokens，输出$${m.outputPrice}/1M tokens，${m.context}上下文。${m.description}`;
  const initial = MODEL_INITIAL(m.name);
  const pColor = PROVIDER_COLORS[m.provider] || '#666';

  const pageCSS = `
.card{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.05);margin:20px auto;overflow:hidden;border:1px solid #eee;max-width:900px}
.card-header{background:${pColor};color:#fff;padding:20px 28px;display:flex;align-items:center;gap:16px}
.card-header .model-icon{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;flex-shrink:0}
.card-header .model-info h2{font-size:1.3rem;font-weight:700}
.card-header .model-info .provider-tag{font-size:0.78rem;opacity:0.85}
.card-body{padding:24px 28px}
.price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:20px}
.price-item{text-align:center;padding:16px;border-radius:12px;background:#f7f8fa}
.price-item .label{font-size:0.78rem;color:#888;margin-bottom:4px}
.price-item .value{font-size:1.5rem;font-weight:700;color:#1a1a2e}
.price-item .sub{font-size:0.72rem;color:#aaa;margin-top:2px}
.section-title{font-size:1rem;font-weight:600;margin:24px 0 12px;color:#1a1a2e;padding-bottom:6px;border-bottom:2px solid #f0f0f5}
.comp-table{width:100%;border-collapse:collapse;font-size:0.85rem;margin-bottom:16px}
.comp-table thead{background:#f7f8fa}
.comp-table th,.comp-table td{padding:10px 12px;text-align:left;border-bottom:1px solid #f0f0f5}
.comp-table th{font-weight:600;font-size:0.75rem;color:#666}
.comp-table tbody tr:hover{background:#f8f9ff}
.prov-logo{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;font-size:0.65rem;font-weight:700;color:#fff;margin-right:5px;flex-shrink:0}
.related-blog{background:#fff;border-radius:14px;padding:24px;margin:20px auto;border:1px solid #eee;max-width:900px}
.related-blog h3{font-size:1rem;font-weight:600;margin-bottom:14px}
.related-blog .list{display:flex;flex-wrap:wrap;gap:10px}
.related-blog .list a{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:10px;background:#f7f8fa;text-decoration:none;color:#1a1a2e;font-size:0.82rem;font-weight:500;transition:all 0.2s;border:1px solid #eee}
.related-blog .list a:hover{background:#e8f5e9;border-color:#a5d6a7;transform:translateY(-1px)}
.model-links{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
.model-links a{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;background:#f7f8fa;text-decoration:none;color:#1a1a2e;font-size:0.82rem;font-weight:500;transition:all 0.2s;border:1px solid #eee}
.model-links a:hover{background:#e8f5e9;border-color:#a5d6a7}
.back-link{display:inline-flex;align-items:center;gap:4px;padding:8px 16px;border-radius:8px;background:#f0f0f5;text-decoration:none;color:#555;font-size:0.82rem;margin-bottom:16px;transition:all 0.2s}
.back-link:hover{background:#e0e0e8;color:#1a1a2e}
@media(max-width:768px){
  .card-header{padding:16px 18px;flex-direction:column;text-align:center}
  .card-body{padding:16px 14px}
  .price-grid{grid-template-columns:1fr 1fr}
  .comp-table{font-size:0.78rem;min-width:500px}
  .comp-table th,.comp-table td{padding:6px 8px}
  .related-blog{padding:16px}
}
`;

  const relatedArticlesHTML = relatedArticles.length > 0 ? `
<div class="related-blog">
  <h3>📖 相关博客推荐</h3>
  <div class="list">
    ${relatedArticles.map(a => `<a href="/blog/${a.slug}.html">${a.title}</a>`).join('\n    ')}
  </div>
</div>` : '';

  const sameProvHTML = sameProvModels.length > 0 ? `
<div style="max-width:900px;margin:20px auto 10px;background:#fff;border-radius:14px;padding:20px 24px;border:1px solid #eee">
  <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:10px;color:#1a1a2e">🏢 同厂商其他模型</h3>
  <div class="model-links">
    ${sameProvModels.map(x => `<a href="/models/${x.id}.html"><span class="prov-logo" style="background:${PROVIDER_COLORS[x.provider]||'#666'}">${MODEL_INITIAL(x.name)}</span> ${x.name} — 输入$${x.inputPrice.toFixed(2)}</a>`).join('\n    ')}
  </div>
</div>` : '';

  const priceSimilarHTML = `
<div style="max-width:900px;margin:20px auto;background:#fff;border-radius:14px;padding:24px;border:1px solid #eee;overflow-x:auto">
  <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:12px;color:#1a1a2e">📊 相近价格模型对比</h3>
  <table class="comp-table">
    <thead><tr>
      <th>模型</th>
      <th>厂商</th>
      <th>输入 ($/1M tok)</th>
      <th>输出 ($/1M tok)</th>
      <th>上下文</th>
    </tr></thead>
    <tbody>
      ${[m, ...priceSimilar].map(x => `
        <tr${x.id === m.id ? ' style="background:#e8f5e9;font-weight:600"' : ''}>
          <td><span class="prov-logo" style="background:${PROVIDER_COLORS[x.provider]||'#666'}">${MODEL_INITIAL(x.name)}</span>${x.id === m.id ? '<strong>' + x.name + '</strong>' : '<a href="/models/' + x.id + '.html" style="color:#1a1a2e;text-decoration:none">' + x.name + '</a>'}${TAG_HTML(x.tags)}</td>
          <td style="color:#888;font-size:0.82rem">${PROVIDER_COLORS[x.provider] ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+PROVIDER_COLORS[x.provider]+';margin-right:4px"></span>' : ''}${x.providerLabel}</td>
          <td class="price-green">${priceStr(x.inputPrice)}</td>
          <td class="price-red">${priceStr(x.outputPrice)}</td>
          <td style="font-size:0.82rem;color:#666">${x.ctx}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>`;

  const html = `${makePageHead(title, desc, `/models/${m.id}.html`, [jsonldProduct, jsonldApp])}
${pageCSS}
</head>
<body>
${makeNavHTML('/models/' + m.id + '.html')}

<header class="hero">
  <div class="container">
    <a href="/models/" class="back-link" style="display:inline-flex;align-items:center;gap:4px;padding:8px 16px;border-radius:8px;background:rgba(255,255,255,0.1);text-decoration:none;color:rgba(255,255,255,0.7);font-size:0.82rem;margin-bottom:12px">← 返回模型目录</a>
    <h1>🤖 <span>${m.name}</span> API定价 2026</h1>
    <p>${m.description}</p>
    <div class="badge">
      <span>🏢 ${m.providerLabel}</span>
      <span>💬 ${m.ctx} 上下文</span>
      <span>🏷️ ${(m.tags||[]).map(t => TAG_LABELS[t]?.cn || t).join(' · ')}</span>
    </div>
  </div>
</header>

<main class="container">
  <div class="card">
    <div class="card-header">
      <div class="model-icon">${initial}</div>
      <div class="model-info">
        <h2>${m.name} ${TAG_HTML(m.tags)}</h2>
        <div class="provider-tag">由 ${m.providerLabel} 提供 · ${m.ctx} 上下文</div>
      </div>
    </div>
    <div class="card-body">
      <div class="price-grid">
        <div class="price-item">
          <div class="label">💰 输入价格</div>
          <div class="value" style="color:#2e7d32">${priceStr(m.inputPrice)}</div>
          <div class="sub">每 1M tokens</div>
        </div>
        <div class="price-item">
          <div class="label">💸 输出价格</div>
          <div class="value" style="color:#c62828">${priceStr(m.outputPrice)}</div>
          <div class="sub">每 1M tokens</div>
        </div>
        <div class="price-item">
          <div class="label">💾 缓存输入</div>
          <div class="value" style="color:#1565c0">${cacheStr(m.cachePrice)}</div>
          <div class="sub">每 1M tokens</div>
        </div>
        <div class="price-item">
          <div class="label">📐 上下文窗口</div>
          <div class="value">${m.ctx}</div>
          <div class="sub">最大输入长度</div>
        </div>
      </div>
      <p style="font-size:0.9rem;color:#666;line-height:1.7">${m.description}</p>
      ${m.note ? `<p style="font-size:0.82rem;color:#888;margin-top:10px;background:#fff8e1;border-radius:8px;padding:10px 14px;border:1px solid #ffe082">💡 ${m.note}</p>` : ''}
    </div>
  </div>

  ${sameProvHTML}

  ${priceSimilarHTML}

  ${relatedArticlesHTML}

  <div class="card" style="padding:20px 28px;text-align:center">
    <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:10px">🔍 查看所有 AI 模型价格</h3>
    <a href="/models/" class="back-link" style="color:#0f3460;background:#e8f0fe;padding:10px 24px;border-radius:8px;display:inline-block;text-decoration:none;font-weight:500">📂 浏览完整模型目录</a>
  </div>
</main>

${makeFooterHTML()}

${makeNavScript()}
</body>
</html>`;

  return html;
}

/** Generate models/index.html — catalog page */
function generateCatalogPage() {
  const grouped = {};
  for (const m of MODELS) {
    if (!grouped[m.provider]) grouped[m.provider] = [];
    grouped[m.provider].push(m);
  }

  const title = 'AI模型API定价目录 2026 | 平野AI工具站';
  const desc = '浏览全部16款主流AI模型的API定价信息，包括GPT-5.5、Claude 4、Gemini 2.5、DeepSeek V4等，按厂商分类快速对比。';

  const catalogCSS = `
.prov-section{margin:28px 0}
.prov-section h2{font-size:1.1rem;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:10px}
.prov-section h2 .color-dot{display:inline-block;width:12px;height:12px;border-radius:50%;flex-shrink:0}
.model-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.model-card{background:#fff;border-radius:14px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);border:1px solid #eee;transition:all 0.2s;text-decoration:none;color:inherit;display:block}
.model-card:hover{box-shadow:0 6px 20px rgba(0,0,0,0.08);transform:translateY(-2px);border-color:#d0d0dd}
.model-card .mc-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.model-card .mc-header .mc-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:#fff;flex-shrink:0}
.model-card .mc-header .mc-name{font-size:0.95rem;font-weight:600}
.model-card .mc-prices{display:flex;gap:12px;font-size:0.78rem;color:#666;margin-bottom:6px}
.model-card .mc-prices .in{color:#2e7d32;font-weight:600}
.model-card .mc-prices .out{color:#c62828;font-weight:600}
.model-card .mc-note{font-size:0.78rem;color:#888;line-height:1.4}
.prov-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;justify-content:center}
.prov-filter a{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;background:#fff;border:1px solid #ddd;text-decoration:none;color:#555;font-size:0.82rem;transition:all 0.2s;font-weight:500}
.prov-filter a:hover{border-color:#1a1a2e;color:#1a1a2e;background:#f8f9ff}
.prov-filter a.active{background:#1a1a2e;color:#fff;border-color:#1a1a2e}
.model-card .mc-tags{margin-top:6px}
@media(max-width:768px){
  .model-grid{grid-template-columns:1fr}
}
`;

  const provFilterHTML = `<div class="prov-filter">
  <a href="/models/" class="active">🏠 全部</a>
  ${PROVIDERS.map(p => `<a href="/models/${p.id}.html"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:2px"></span> ${p.label}</a>`).join('\n  ')}
</div>`;

  const provSections = PROVIDERS.filter(p => grouped[p.id] && grouped[p.id].length > 0).map(p => {
    const models = grouped[p.id];
    return `<section class="prov-section">
  <h2><span class="color-dot" style="background:${p.color}"></span> ${p.label}</h2>
  <div class="model-grid">
    ${models.map(m => {
      const initial = MODEL_INITIAL(m.name);
      return `<a href="/models/${m.id}.html" class="model-card">
      <div class="mc-header">
        <div class="mc-icon" style="background:${p.color}">${initial}</div>
        <div class="mc-name">${m.name}</div>
      </div>
      <div class="mc-prices">
        <span class="in">输入 $${m.inputPrice.toFixed(2)}</span>
        <span class="out">输出 $${m.outputPrice.toFixed(2)}</span>
        <span>${m.ctx}</span>
      </div>
      <div class="mc-tags">${TAG_HTML(m.tags)}</div>
      <div class="mc-note">${m.note || ''}</div>
    </a>`;
    }).join('\n    ')}
  </div>
</section>`;
  }).join('\n');

  const html = `${makePageHead(title, desc, '/models/', [
    { "@context": "https://schema.org", "@type": "CollectionPage", "name": title, "description": desc, "url": "https://pingyeai.cn/models/" }
  ])}
${catalogCSS}
</head>
<body>
${makeNavHTML('/models/')}

<header class="hero">
  <div class="container">
    <h1>📂 <span>AI模型</span>定价目录</h1>
    <p>${desc}</p>
    <div class="badge">
      <span>🤖 ${MODELS.length}款模型</span>
      <span>🏢 ${Object.keys(grouped).length}家厂商</span>
      <span>💰 API定价对比</span>
    </div>
  </div>
</header>

<main class="container">
  ${provFilterHTML}
  ${provSections}
</main>

${makeFooterHTML()}

${makeNavScript()}
</body>
</html>`;

  return html;
}

/** Generate a provider page like /models/openai.html */
function generateProviderPage(provider) {
  const models = MODELS.filter(m => m.provider === provider.id);
  if (models.length === 0) return null;

  const title = `${provider.label} AI模型API定价 2026 | 平野AI工具站`;
  const desc = `${provider.label}全部AI模型API定价一览：${models.map(m => m.name).join('、')}。输入价格、输出价格、上下文窗口一目了然。`;

  const provCSS = `
.model-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin:20px 0}
.model-card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);border:1px solid #eee;transition:all 0.2s;text-decoration:none;color:inherit;display:block}
.model-card:hover{box-shadow:0 6px 20px rgba(0,0,0,0.08);transform:translateY(-2px);border-color:#d0d0dd}
.model-card .mc-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.model-card .mc-header .mc-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;font-weight:700;color:#fff;flex-shrink:0}
.model-card .mc-header .mc-name{font-size:1rem;font-weight:600}
.price-table{width:100%;border-collapse:collapse;font-size:0.88rem;margin:20px 0;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.price-table thead{background:#f7f8fa}
.price-table th,.price-table td{padding:12px;text-align:left;border-bottom:1px solid #f0f0f5}
.price-table th{font-weight:600;font-size:0.78rem;color:#666}
.price-table tbody tr:hover{background:#f8f9ff}
.back-link{display:inline-flex;align-items:center;gap:4px;padding:8px 16px;border-radius:8px;background:#f0f0f5;text-decoration:none;color:#555;font-size:0.82rem;margin-bottom:16px;transition:all 0.2s}
.back-link:hover{background:#e0e0e8;color:#1a1a2e}
.prov-card{background:#fff;border-radius:14px;padding:24px;margin:20px 0;border:1px solid #eee}
@media(max-width:768px){
  .model-grid{grid-template-columns:1fr}
  .price-table{font-size:0.8rem}
  .price-table th,.price-table td{padding:8px}
}
`;

  const tableRows = models.map(m => `
  <tr>
    <td><a href="/models/${m.id}.html" style="color:#1a1a2e;text-decoration:none;font-weight:600">${m.name}</a>${TAG_HTML(m.tags)}</td>
    <td class="price-green">$${m.inputPrice.toFixed(2)}</td>
    <td class="price-red">$${m.outputPrice.toFixed(2)}</td>
    <td>${cacheStr(m.cachePrice)}</td>
    <td>${m.ctx}</td>
    <td style="font-size:0.82rem;color:#666">${m.note || ''}</td>
  </tr>`).join('');

  const html = `${makePageHead(title, desc, `/models/${provider.id}.html`, [
    { "@context": "https://schema.org", "@type": "CollectionPage", "name": title, "description": desc, "url": `https://pingyeai.cn/models/${provider.id}.html` }
  ])}
${provCSS}
</head>
<body>
${makeNavHTML('/models/' + provider.id + '.html')}

<header class="hero">
  <div class="container">
    <a href="/models/" class="back-link" style="display:inline-flex;align-items:center;gap:4px;padding:8px 16px;border-radius:8px;background:rgba(255,255,255,0.1);text-decoration:none;color:rgba(255,255,255,0.7);font-size:0.82rem;margin-bottom:12px">← 返回全部模型目录</a>
    <h1>🏢 <span>${provider.label}</span> AI模型定价 2026</h1>
    <p>${desc}</p>
    <div class="badge">
      <span>🤖 ${models.length}款模型</span>
      <span>💰 API定价</span>
    </div>
  </div>
</header>

<main class="container">
  <div class="prov-card">
    <h3 style="font-size:1rem;font-weight:600;margin-bottom:14px">📊 ${provider.label} 模型定价总表</h3>
    <div style="overflow-x:auto">
      <table class="price-table">
        <thead><tr>
          <th>模型</th>
          <th>输入 ($/1M tok)</th>
          <th>输出 ($/1M tok)</th>
          <th>缓存输入</th>
          <th>上下文</th>
          <th>特点</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </div>

  <div class="model-grid">
    ${models.map(m => {
      const initial = MODEL_INITIAL(m.name);
      return `<a href="/models/${m.id}.html" class="model-card">
      <div class="mc-header">
        <div class="mc-icon" style="background:${provider.color}">${initial}</div>
        <div class="mc-name">${m.name}</div>
      </div>
      <div style="font-size:0.82rem;color:#666;margin-bottom:6px">${m.description}</div>
      <div style="font-size:0.82rem">
        <span class="price-green">输入 $${m.inputPrice.toFixed(2)}</span>
        <span style="margin:0 6px">·</span>
        <span class="price-red">输出 $${m.outputPrice.toFixed(2)}</span>
        <span style="margin:0 6px">·</span>
        <span>${m.ctx}</span>
      </div>
      <div style="margin-top:8px">${TAG_HTML(m.tags)}</div>
    </a>`;
    }).join('\n    ')}
  </div>

  <div style="text-align:center;margin:28px 0">
    <a href="/models/" class="back-link" style="color:#0f3460;background:#e8f0fe;padding:10px 24px;display:inline-block">📂 浏览全部模型</a>
  </div>
</main>

${makeFooterHTML()}

${makeNavScript()}
</body>
</html>`;

  return html;
}

// ====== File Helpers ======

function readFile(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch (e) { return null; }
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf-8');
}

/** Insert content before </head> in HTML */
function insertBeforeHeadEnd(html, content) {
  return html.replace('</head>', content + '\n</head>');
}

/** Replace or add JSON-LD before </head> */
function addJsonLd(html, jsonld) {
  const block = `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`;
  return insertBeforeHeadEnd(html, block);
}

function hasJsonLd(html) {
  return html.includes('application/ld+json');
}

/** Update navbar nav-links to include all links */
function updateNavbar(html, activePath) {
  const standardLinks = [
    { href: '/', label: '🏠 首页' },
    { href: '/models/', label: '📂 模型目录' },
    { href: '/compare-ai-coding-tools', label: '🛠 编程工具对比' },
    { href: '/blog/', label: '📝 博客' },
  ];

  // Find the nav-links div and replace its contents
  const navLinksRegex = /<div class="nav-links"[^>]*id="navLinks"[^>]*>[\s\S]*?<\/div>/;
  const replacement = `<div class="nav-links" id="navLinks">\n      ${standardLinks.map(l => `<a href="${l.href}"${l.href === activePath ? ' class="active"' : ''}>${l.label}</a>`).join('\n      ')}\n    </div>`;

  if (navLinksRegex.test(html)) {
    html = html.replace(navLinksRegex, replacement);
  } else {
    // Try alternative nav-links pattern without id
    const altRegex = /<div class="nav-links">[\s\S]*?<\/div>/;
    if (altRegex.test(html)) {
      html = html.replace(altRegex, `<div class="nav-links" id="navLinks">\n      ${standardLinks.map(l => `<a href="${l.href}"${l.href === activePath ? ' class="active"' : ''}>${l.label}</a>`).join('\n      ')}\n    </div>`);
    }
  }

  // Ensure id="navLinks" on hamburger target
  if (!html.includes('id="navLinks"') && html.includes('class="nav-links"')) {
    html = html.replace('class="nav-links"', 'class="nav-links" id="navLinks"');
  }

  return html;
}

/** Ensure hamburger button exists */
function ensureHamburger(html) {
  if (!html.includes('hamburgerBtn')) {
    // Find the navbar container and add hamburger before nav-links
    html = html.replace(
      /(<div class="nav-links"[^>]*>)/,
      '<button class="hamburger" id="hamburgerBtn" aria-label="菜单">☰</button>\n    $1'
    );
  }
  return html;
}

/** Ensure nav-links have the right structure */
function fixNavStructure(html) {
  if (!html.includes('hamburgerBtn') && html.includes('class="nav-links"')) {
    html = html.replace(
      /(<div class="nav-links")/,
      '<button class="hamburger" id="hamburgerBtn" aria-label="菜单">☰</button>\n    $1'
    );
  }
  return html;
}

// ====== Main Build ======

function build() {
  const modelsDir = path.join(ROOT, 'models');
  const dataDir = path.join(ROOT, 'data');
  fs.mkdirSync(modelsDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  const log = [];

  // Ensure /js/nav.js exists (minimal nav helper)
  const jsDir = path.join(ROOT, 'js');
  fs.mkdirSync(jsDir, { recursive: true });
  writeFile(path.join(jsDir, 'nav.js'), `// Navigation helper — handled inline in each page\n`);

  // 1. Generate model detail pages
  for (const m of MODELS) {
    const html = generateModelPage(m);
    writeFile(path.join(modelsDir, `${m.id}.html`), html);
    log.push(`✅ 生成 /models/${m.id}.html`);
  }

  // 2. Generate catalog page
  const catalogHTML = generateCatalogPage();
  writeFile(path.join(modelsDir, 'index.html'), catalogHTML);
  log.push('✅ 生成 /models/index.html');

  // 3. Generate provider pages
  for (const p of PROVIDERS) {
    const html = generateProviderPage(p);
    if (html) {
      writeFile(path.join(modelsDir, `${p.id}.html`), html);
      log.push(`✅ 生成 /models/${p.id}.html`);
    }
  }

  // ====== Update existing pages ======

  // 4. Update index.html
  let indexHTML = readFile(path.join(ROOT, 'index.html'));
  if (indexHTML) {
    // Add JSON-LD: WebSite + BreadcrumbList (if not present)
    if (!hasJsonLd(indexHTML)) {
      const websiteLd = { "@context": "https://schema.org", "@type": "WebSite", "name": "平野AI工具站", "url": "https://pingyeai.cn", "description": "AI模型价格对比、工具评测、使用教程" };
      const breadLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://pingyeai.cn/" } ] };
      indexHTML = addJsonLd(indexHTML, websiteLd);
      indexHTML = addJsonLd(indexHTML, breadLd);
      log.push('✅ JSON-LD 已更新到 index.html');
    } else {
      log.push('ℹ️ index.html 已有 JSON-LD，跳过');
    }

    // Update navbar
    indexHTML = updateNavbar(indexHTML, '/');

    // Add model directory section in related-tools area
    const modelLinksHTML = MODELS.map(m => `<a href="/models/${m.id}.html">${m.name}</a>`).join('\n      ');
    const modelsSection = `
<div class="related-tools" style="margin-top:16px">
  <h3>📂 模型目录</h3>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
    ${PROVIDERS.map(p => `<a href="/models/${p.id}.html" style="display:inline-flex;align-items:center;gap:4px;padding:6px 14px;border-radius:20px;background:#fff;border:1px solid #ddd;text-decoration:none;color:#555;font-size:0.78rem;transition:all 0.2s" onmouseover="this.style.borderColor='#1a1a2e';this.style.color='#1a1a2e'" onmouseout="this.style.borderColor='#ddd';this.style.color='#555'"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${p.color};margin-right:2px"></span> ${p.label}</a>`).join('\n      ')}
  </div>
  <div class="list" style="display:flex;flex-wrap:wrap;gap:8px">
    ${modelLinksHTML}
  </div>
</div>`;

    // Insert model directory section (only if not already present)
    if (!indexHTML.includes('models目录区域')) {
      const markedSection = modelsSection.replace(
        '<div class="related-tools"',
        '<div class="related-tools" data-keep="models目录区域"'
      );
      // Try </main> first, fallback to footer-links-after
      if (indexHTML.includes('</main>')) {
        indexHTML = indexHTML.replace('</main>', markedSection + '\n</main>');
        log.push('✅ 首页已增加模型目录区域 (after </main>)');
      } else if (indexHTML.includes('<div class="footer-links-after"')) {
        indexHTML = indexHTML.replace('<div class="footer-links-after"', markedSection + '\n\n<div class="footer-links-after"');
        log.push('✅ 首页已增加模型目录区域 (before footer-links)');
      } else {
        log.push('⚠️ 未找到插入位置，请在 index.html 中手动添加模型目录');
      }
    } else {
      log.push('ℹ️ 首页已有模型目录区域，跳过');
    }

    writeFile(path.join(ROOT, 'index.html'), indexHTML);
    log.push('✅ index.html 已更新');
  }

  // 5. Update blog/index.html
  let blogIndexHTML = readFile(path.join(ROOT, 'blog', 'index.html'));
  if (blogIndexHTML) {
    if (!hasJsonLd(blogIndexHTML)) {
      const blogLd = { "@context": "https://schema.org", "@type": "Blog", "name": "平野AI工具站 - 博客", "description": "AI工具使用心得、踩坑记录、实战教程", "url": "https://pingyeai.cn/blog/" };
      blogIndexHTML = addJsonLd(blogIndexHTML, blogLd);
      log.push('✅ JSON-LD 已更新到 blog/index.html');
    }
    blogIndexHTML = updateNavbar(blogIndexHTML, '/blog/');
    blogIndexHTML = ensureHamburger(blogIndexHTML);
    writeFile(path.join(ROOT, 'blog', 'index.html'), blogIndexHTML);
    log.push('✅ blog/index.html 导航栏已更新');
  }

  // 6. Update blog articles
  const blogDir = path.join(ROOT, 'blog');
  const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  for (const f of blogFiles) {
    let articleHTML = readFile(path.join(blogDir, f));
    if (!articleHTML) continue;
    const slug = f.replace('.html', '');
    const articleMeta = BLOG_ARTICLES.find(a => a.slug === slug);

    if (!hasJsonLd(articleHTML)) {
      const articleLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleMeta?.title || slug,
        "url": `https://pingyeai.cn/blog/${f}`,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://pingyeai.cn/blog/${f}` },
        "author": { "@type": "Person", "name": "John Chow" },
        "publisher": { "@type": "Organization", "name": "平野AI工具站" }
      };
      const breadLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://pingyeai.cn/" },
          { "@type": "ListItem", "position": 2, "name": "博客", "item": "https://pingyeai.cn/blog/" },
          { "@type": "ListItem", "position": 3, "name": articleMeta?.title || slug, "item": `https://pingyeai.cn/blog/${f}` }
        ]
      };
      articleHTML = addJsonLd(articleHTML, articleLd);
      articleHTML = addJsonLd(articleHTML, breadLd);
      log.push(`✅ JSON-LD 已更新到 blog/${f}`);
    }

    // Update navbar
    articleHTML = updateNavbar(articleHTML, '/blog/');
    articleHTML = fixNavStructure(articleHTML);
    writeFile(path.join(blogDir, f), articleHTML);
    log.push(`✅ 导航栏已更新: blog/${f}`);
  }


  // 8. Update tools/api-monitor.html (add JSON-LD only, no nav update needed for this SPA)
  let apiMonitorHTML = readFile(path.join(ROOT, 'tools', 'api-monitor.html'));
  if (apiMonitorHTML) {
    if (!hasJsonLd(apiMonitorHTML)) {
      const appLd = { "@context": "https://schema.org", "@type": "WebApplication", "name": "API用量监控", "url": "https://pingyeai.cn/tools/api-monitor", "description": "实时监控DeepSeek、小米MiMo等API的用量、余额和消费统计", "applicationCategory": "DeveloperApplication", "operatingSystem": "Web" };
      apiMonitorHTML = addJsonLd(apiMonitorHTML, appLd);
      log.push('✅ JSON-LD 已更新到 tools/api-monitor.html');
    }
    writeFile(path.join(ROOT, 'tools', 'api-monitor.html'), apiMonitorHTML);
  }

  // 9. Update compare-ai-coding-tools.html
  let compareHTML = readFile(path.join(ROOT, 'compare-ai-coding-tools.html'));
  if (compareHTML) {
    if (!hasJsonLd(compareHTML)) {
      const websiteLd = { "@context": "https://schema.org", "@type": "WebSite", "name": "AI编程工具横向对比 2026", "url": "https://pingyeai.cn/compare-ai-coding-tools", "description": "全面对比Claude Code、OpenAI Codex、Trae SOLO三大AI编程工具的功能、价格、适用场景" };
      compareHTML = addJsonLd(compareHTML, websiteLd);
      log.push('✅ JSON-LD 已更新到 compare-ai-coding-tools.html');
    }
    compareHTML = updateNavbar(compareHTML, '/compare-ai-coding-tools');
    compareHTML = ensureHamburger(compareHTML);
    writeFile(path.join(ROOT, 'compare-ai-coding-tools.html'), compareHTML);
    log.push('✅ compare-ai-coding-tools.html 导航栏已更新');
  }

  // 10. Update trae-vs-trae-solo.html and other top-level pages
  const topPages = ['trae-vs-trae-solo.html', 'trae-solo-ima-knowledge.html', 'trae-solo-free-limit.html'];
  for (const f of topPages) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) continue;
    let html = readFile(fp);
    if (html) {
      html = updateNavbar(html, '/blog/');
      html = fixNavStructure(html);
      writeFile(fp, html);
      log.push(`✅ 导航栏已更新: ${f}`);
    }
  }

  // 11. Update privacy and affiliate pages
  for (const f of ['privacy/index.html', 'affiliate-disclaimer/index.html']) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) continue;
    let html = readFile(fp);
    if (html) {
      html = updateNavbar(html, '/');
      html = fixNavStructure(html);
      writeFile(fp, html);
      log.push(`✅ 导航栏已更新: ${f}`);
    }
  }

  // 12. Generate sitemap.xml
  const now2 = new Date().toISOString().split('T')[0];
  const sitePages = [
    { url: 'https://pingyeai.cn/', priority: '1.0', changefreq: 'weekly' },
    { url: 'https://pingyeai.cn/models/', priority: '0.9', changefreq: 'weekly' },
    { url: 'https://pingyeai.cn/compare-ai-coding-tools', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://pingyeai.cn/blog/', priority: '0.9', changefreq: 'weekly' },
    { url: 'https://pingyeai.cn/tools/api-monitor', priority: '0.6', changefreq: 'monthly' },
    { url: 'https://pingyeai.cn/privacy/', priority: '0.1', changefreq: 'yearly' },
    { url: 'https://pingyeai.cn/affiliate-disclaimer/', priority: '0.1', changefreq: 'yearly' },
  ];
  for (const m of MODELS) sitePages.push({ url: 'https://pingyeai.cn/models/' + m.id, priority: '0.7', changefreq: 'monthly' });
  for (const p of PROVIDERS) sitePages.push({ url: 'https://pingyeai.cn/models/' + p.id, priority: '0.6', changefreq: 'monthly' });
  for (const a of BLOG_ARTICLES) sitePages.push({ url: 'https://pingyeai.cn/blog/' + a.slug, priority: '0.5', changefreq: 'never' });
  
  const urlLines = sitePages.map(p => '  <url>\n    <loc>' + p.url + '</loc>\n    <lastmod>' + now2 + '</lastmod>\n    <changefreq>' + p.changefreq + '</changefreq>\n    <priority>' + p.priority + '</priority>\n  </url>').join('\n');
  const sitemap = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n' + urlLines + '\n</urlset>';
  writeFile(path.join(ROOT, 'sitemap.xml'), sitemap);
  log.push('\u2705 sitemap.xml \u5df2\u751f\u6210 (' + sitePages.length + ' \u6761URL)');

  // 13. Generate RSS feed
  const rssItems = BLOG_ARTICLES.map(a => '  <item>\n    <title><![CDATA[' + a.title + ']]></title>\n    <link>https://pingyeai.cn/blog/' + a.slug + '</link>\n    <guid>https://pingyeai.cn/blog/' + a.slug + '</guid>\n  </item>').join('\n');
  const rss = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\">\n  <channel>\n    <title>\u5e73\u91ceAI\u5de5\u5177\u7ad9 - \u535a\u5ba2</title>\n    <link>https://pingyeai.cn/blog/</link>\n    <description>AI\u5de5\u5177\u4f7f\u7528\u5fc3\u5f97\u3001\u8e29\u5751\u8bb0\u5f55\u3001\u5b9e\u6218\u6559\u7a0b</description>\n    <language>zh-CN</language>\n' + rssItems + '\n  </channel>\n</rss>';
  writeFile(path.join(ROOT, 'feed.xml'), rss);
  log.push('\u2705 feed.xml (RSS) \u5df2\u751f\u6210 (' + BLOG_ARTICLES.length + ' \u7bc7\u6587\u7ae0)');

  // Done
  console.log('\n' + log.join('\n'));
  console.log('\n🎉 构建完成！所有页面已生成/更新。');
}

build();
