const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'build.js');
let js = fs.readFileSync(filePath, 'utf8');

// Find the exact last lines
const lines = js.split('\n');
const lastLines = lines.slice(-6).join('\n');
console.log('Last 6 lines:');
console.log(JSON.stringify(lastLines));

// Build marker from actual file content
const doneLine = lines.findIndex(l => l.trim() === '// Done');
const buildCallLine = lines.findIndex(l => l.trim() === 'build();');

console.log('// Done at line:', doneLine + 1);
console.log('build() at line:', buildCallLine + 1);

const marker = lines.slice(doneLine, buildCallLine + 1).join('\n');

const newCode = `  // 12. Generate sitemap.xml
  const now2 = new Date().toISOString().split('T')[0];
  const sitePages = [
    { url: 'https://pingyeai.cn/', priority: '1.0', changefreq: 'weekly' },
    { url: 'https://pingyeai.cn/models/', priority: '0.9', changefreq: 'weekly' },
    { url: 'https://pingyeai.cn/compare-ai-coding-tools', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://pingyeai.cn/blog/', priority: '0.9', changefreq: 'weekly' },
    { url: 'https://pingyeai.cn/tools/content-distributor', priority: '0.7', changefreq: 'monthly' },
    { url: 'https://pingyeai.cn/tools/api-monitor', priority: '0.6', changefreq: 'monthly' },
    { url: 'https://pingyeai.cn/privacy/', priority: '0.1', changefreq: 'yearly' },
    { url: 'https://pingyeai.cn/affiliate-disclaimer/', priority: '0.1', changefreq: 'yearly' },
  ];
  for (const m of MODELS) {
    sitePages.push({ url: 'https://pingyeai.cn/models/' + m.id, priority: '0.7', changefreq: 'monthly' });
  }
  for (const p of PROVIDERS) {
    sitePages.push({ url: 'https://pingyeai.cn/models/' + p.id, priority: '0.6', changefreq: 'monthly' });
  }
  for (const a of BLOG_ARTICLES) {
    sitePages.push({ url: 'https://pingyeai.cn/blog/' + a.slug, priority: '0.5', changefreq: 'never' });
  }
  const urls = sitePages.map(p => '  <url>\\n    <loc>' + p.url + '</loc>\\n    <lastmod>' + now2 + '</lastmod>\\n    <changefreq>' + p.changefreq + '</changefreq>\\n    <priority>' + p.priority + '</priority>\\n  </url>').join('\\n');
  const sitemap = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\\n' + urls + '\\n</urlset>';
  writeFile(path.join(ROOT, 'sitemap.xml'), sitemap);
  log.push('\u2705 sitemap.xml \u5df2\u751f\u6210 (' + sitePages.length + ' \u6761URL)');

  // 13. Generate RSS feed
  const rssItems = BLOG_ARTICLES.map(a => '  <item>\\n    <title><![CDATA[' + a.title + ']]></title>\\n    <link>https://pingyeai.cn/blog/' + a.slug + '</link>\\n    <guid>https://pingyeai.cn/blog/' + a.slug + '</guid>\\n  </item>').join('\\n');
  const rss = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<rss version=\"2.0\">\\n  <channel>\\n    <title>\u5e73\u91ceAI\u5de5\u5177\u7ad9 - \u535a\u5ba2</title>\\n    <link>https://pingyeai.cn/blog/</link>\\n    <description>AI\u5de5\u5177\u4f7f\u7528\u5fc3\u5f97\u3001\u8e29\u5751\u8bb0\u5f55\u3001\u5b9e\u6218\u6559\u7a0b</description>\\n    <language>zh-CN</language>\\n' + rssItems + '\\n  </channel>\\n</rss>`;
  writeFile(path.join(ROOT, 'feed.xml'), rss);
  log.push('\u2705 feed.xml (RSS) \u5df2\u751f\u6210 (' + BLOG_ARTICLES.length + ' \u7bc7\u6587\u7ae0)');

  // Add related models section to blog articles
  for (const f of blogFiles) {
    const slug = f.replace('.html', '');
    const articleMeta = BLOG_ARTICLES.find(a => a.slug === slug);
    if (!articleMeta) continue;
    let html = readFile(path.join(blogDir, f));
    if (!html) continue;
    if (html.includes('<!-- build: related-models -->')) continue;
    // Find related models by keyword match
    const relatedModels = MODELS.filter(m => {
      const kw = [...articleMeta.keywords];
      return kw.some(k => m.name.toLowerCase().includes(k) || m.note.toLowerCase().includes(k));
    }).slice(0, 4);
    if (relatedModels.length === 0) continue;
    const relatedHtml = '\\n<!-- build: related-models -->\\n<div class=\"related-tools\" style=\"margin-top:24px\">\\n  <h3>\u76f8\u5173AI\u6a21\u578b</h3>\\n  <div class=\"list\">' +
      relatedModels.map(m => '<a href=\"/models/' + m.id + '\">' + m.name + ' \u2014 ' + m.note + '</a>').join('') +
    '</div>\\n</div>\\n<!-- /build: related-models -->';
    // Insert before footer
    const footerIdx = html.lastIndexOf('</div>\\n</main>');
    if (footerIdx > 0) {
      html = html.slice(0, footerIdx) + relatedHtml + html.slice(footerIdx);
      writeFile(path.join(blogDir, f), html);
      log.push('\u2705 ' + f + ' \u5df2\u6dfb\u52a0\u76f8\u5173\u6a21\u578b\u94fe\u63a5');
    }
  }
`;

const replacement = newCode + '\n' + marker;

if (js.includes(marker)) {
  js = js.replace(marker, replacement);
  fs.writeFileSync(filePath, js);
  console.log('✅ build.js updated successfully');
} else {
  console.log('❌ Marker mismatch. Checking character-by-character...');
  const idx = js.indexOf('// Done');
  const actual = js.substring(idx, idx + marker.length);
  for (let i = 0; i < Math.min(marker.length, actual.length); i++) {
    if (marker.charCodeAt(i) !== actual.charCodeAt(i)) {
      console.log('Diff at pos', i, ':', marker.charCodeAt(i), 'vs', actual.charCodeAt(i));
      console.log('Marker:', JSON.stringify(marker.substring(i-5, i+10)));
      console.log('Actual:', JSON.stringify(actual.substring(i-5, i+10)));
      break;
    }
  }
}
