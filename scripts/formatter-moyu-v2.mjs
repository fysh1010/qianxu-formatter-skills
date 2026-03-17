/**
 * 千序排版器 - 墨玉绿改编版 v1.0
 * 带可点击目录导航，深蓝渐变标题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 读取markdown文件
function readMarkdown(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// 解析markdown为HTML
function parseMarkdown(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('# ')) {
      html += `<h1 style="font-size:22px;font-weight:700;text-align:center;margin:28px 0 24px;color:#111827;">${line.substring(2)}</h1>\n`;
    } else if (line.startsWith('## ')) {
      const title = line.substring(3);
      const num = title.match(/^(\d+)、/)?.[1] || '';
      const name = title.replace(/^\d+、/, '');
      html += `
<section style="padding:0 24px;margin-bottom:28px;">
  <section style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
    <section style="width:44px;height:44px;background:linear-gradient(135deg,#059669,#10B981);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(5,150,105,0.25);">
      <span style="color:#fff;font-size:18px;font-weight:900;">${num}</span>
    </section>
    <section style="flex:1;border-bottom:2px solid #E5E7EB;padding-bottom:8px;">
      <p style="margin:0;font-size:9px;color:#9CA3AF;letter-spacing:2px;font-weight:600;">PART</p>
      <p style="margin:0;font-size:17px;color:#111827;font-weight:800;">${name}</p>
    </section>
  </section>
</section>
`;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      html += `<p style="margin:0 24px 14px;font-size:14px;color:#4B5563;line-height:1.85;"><strong style="color:#059669;font-weight:700;">${line.replace(/\*\*/g, '')}</strong></p>\n`;
    } else if (line.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      if (!line.includes('---')) {
        tableRows.push(line);
      }
    } else if (inTable && !line.startsWith('|')) {
      // Build table HTML
      if (tableRows.length > 0) {
        const headers = tableRows[0].split('|').filter(c => c.trim());
        const data = tableRows.slice(2);
        html += `<table style="width:90%;margin:16px auto;border-collapse:collapse;font-size:13px;"><thead><tr>`;
        headers.forEach(h => {
          html += `<th style="background:#059669;color:#fff;padding:10px;border:1px solid #E5E7EB;">${h.trim()}</th>`;
        });
        html += `</tr></thead><tbody>`;
        data.forEach(row => {
          const cells = row.split('|').filter(c => c.trim());
          html += `<tr>`;
          cells.forEach((c, idx) => {
            const bg = idx % 2 === 0 ? '#fff' : '#F9FAFB';
            html += `<td style="background:${bg};padding:10px;border:1px solid #E5E7EB;text-align:center;">${c.trim()}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table>`;
      }
      inTable = false;
      tableRows = [];
      
      if (line) {
        html += `<p style="margin:0 24px 14px;font-size:14px;color:#4B5563;line-height:1.85;">${line}</p>\n`;
      }
    } else if (line.startsWith('---')) {
      html += `<hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 24px;">\n`;
    } else if (line.startsWith('* ')) {
      html += `<p style="margin:0 24px 14px;font-size:14px;color:#4B5563;line-height:1.85;padding-left:8px;">• ${line.substring(2)}</p>\n`;
    } else if (line) {
      html += `<p style="margin:0 24px 14px;font-size:14px;color:#4B5563;line-height:1.85;">${line}</p>\n`;
    }
  }
  return html;
}

// 主函数
function formatMarkdown(inputPath, outputPath) {
  const md = readMarkdown(inputPath);
  const content = parseMarkdown(md);
  
  // 构建完整HTML
  const fullHtml = `<section style="max-width:680px;margin:0 auto;background:#f8faf9;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#111827;line-height:1.75;">
  <!-- 顶部标题区 -->
  <section style="padding:36px 24px;background:linear-gradient(135deg,#059669 0%,#10B981 100%);">
    <section style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <span style="width:8px;height:8px;background:#fff;border-radius:50%;"></span>
      <span style="font-size:11px;color:rgba(255,255,255,0.8);letter-spacing:2px;font-weight:600;">FEATURED</span>
    </section>
    <h1 style="font-size:24px;font-weight:900;color:#fff;margin:0 0 16px;line-height:1.3;letter-spacing:-1px;">${md.match(/^#\s+(.+)$/m)?.[1] || '文章'}</h1>
    <section style="display:flex;align-items:center;justify-content:space-between;">
      <section style="display:flex;align-items:center;gap:10px;">
        <section style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:14px;font-weight:700;">序</span>
        </section>
        <span style="color:rgba(255,255,255,0.9);font-size:13px;font-weight:600;">飞鹰四海</span>
      </section>
      <section style="display:flex;gap:6px;">
        <span style="background:rgba(255,255,255,0.2);padding:3px 8px;border-radius:4px;font-size:10px;color:#fff;font-weight:600;">原创</span>
        <span style="background:rgba(255,255,255,0.2);padding:3px 8px;border-radius:4px;font-size:10px;color:#fff;font-weight:600;">干货</span>
      </section>
    </section>
  </section>

  <!-- 导航卡片 -->
  <section style="padding:20px 24px;background:#fff;margin:16px 20px;border-radius:16px;box-shadow:0 2px 12px rgba(5,150,105,0.08);">
    <p style="margin:0 0 16px;font-size:11px;color:#6B7280;letter-spacing:2px;font-weight:600;">📋 目录导航</p>
    <section style="display:flex;gap:10px;overflow-x:scroll;padding-bottom:8px;">
      <a href="#p1" style="text-decoration:none;display:inline-block;min-width:140px;background:linear-gradient(135deg,#059669,#10B981);border-radius:12px;padding:14px 12px;box-shadow:0 4px 12px rgba(5,150,105,0.2);">
        <p style="margin:0 0 4px;font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:1px;font-weight:600;">PART 01</p>
        <p style="margin:0;font-size:13px;color:#fff;font-weight:700;white-space:nowrap;">腾讯的那个决定</p>
      </a>
      <a href="#p2" style="text-decoration:none;display:inline-block;min-width:140px;background:#fff;border:1.5px solid #E5E7EB;border-radius:12px;padding:14px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;letter-spacing:1px;font-weight:600;">PART 02</p>
        <p style="margin:0;font-size:13px;color:#111827;font-weight:700;white-space:nowrap;">DeepSeek的难题</p>
      </a>
      <a href="#p3" style="text-decoration:none;display:inline-block;min-width:140px;background:#fff;border:1.5px solid #E5E7EB;border-radius:12px;padding:14px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;letter-spacing:1px;font-weight:600;">PART 03</p>
        <p style="margin:0;font-size:13px;color:#111827;font-weight:700;white-space:nowrap;">两条路同终点</p>
      </a>
      <a href="#p4" style="text-decoration:none;display:inline-block;min-width:140px;background:#fff;border:1.5px solid #E5E7EB;border-radius:12px;padding:14px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <p style="margin:0 0 4px;font-size:10px;color:#9CA3AF;letter-spacing:1px;font-weight:600;">PART 04</p>
        <p style="margin:0;font-size:13px;color:#111827;font-weight:700;white-space:nowrap;">四月之后</p>
      </a>
    </section>
  </section>

  ${content}

  <!-- 结尾 -->
  <section style="padding:28px 24px;margin:0 20px 24px;background:linear-gradient(135deg,#059669 0%,#10B981 100%);border-radius:16px;text-align:center;">
    <p style="margin:0;font-size:17px;color:#fff;font-weight:800;">中国AI的故事，正在从赛跑变成分道。</p>
    <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">而分道，往往比赛跑，更有意思。</p>
  </section>

  <section style="padding:20px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9CA3AF;">© 千序AI笔记 · 原创</p>
  </section>
</section>`;

  fs.writeFileSync(outputPath, fullHtml);
  console.log(`✅ 墨玉绿改编版排版完成：${outputPath}`);
}

// 执行
const args = process.argv.slice(2);
if (args.length >= 2) {
  formatMarkdown(args[0], args[1]);
} else {
  console.log('用法: node formatter-moyu-v2.mjs <input.md> <output.html>');
}