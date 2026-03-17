/**
 * 千序排版器 v6.0
 * 多主题版本 - 支持果核橙 / 墨玉绿
 */

import hljs from 'highlight.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ 主题配置 ============
const THEMES = {
  // 果核橙主题（原版）
  orange: {
    name: '果核橙',
    primary: '#FF6600',
    primaryRgb: '255, 102, 0',
    gradient: 'linear-gradient(135deg, #FF6600, #FF8533)',
    lightBg: 'rgba(255, 102, 0, 0.08)',
    border: 'rgba(255, 102, 0, 0.15)',
    codeLabel: '#FF6600',
    highlight: '#FF6600',
    highlightBg: 'linear-gradient(120deg, #FFE4B3 0%, rgba(255,255,255,0) 100%)',
    markerYellow: '#FDE68A',
    markerGreen: '#A7F3D0',
    markerRed: '#FECACA',
  },
  
  // 墨玉绿主题
  green: {
    name: '墨玉绿',
    primary: '#059669',
    primaryRgb: '5, 150, 105',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
    lightBg: 'rgba(5, 150, 105, 0.08)',
    border: 'rgba(5, 150, 105, 0.15)',
    codeLabel: '#059669',
    highlight: '#059669',
    highlightBg: 'linear-gradient(120deg, #FDE68A 0%, rgba(255,255,255,0) 100%)',
    markerYellow: '#FDE68A',
    markerGreen: '#A7F3D0',
    markerRed: '#FECACA',
  }
};

// ============ CSS 样式生成器 ============
function generateCSS(theme) {
  const t = THEMES[theme] || THEMES.orange;
  return {
    container: `font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#333;background:#fff;line-height:1.75;max-width:100%;font-size:14px;`,
    h1: `font-size:22px;font-weight:700;text-align:center;margin:28px 0 24px;color:#333;`,
    h2: `font-size:16px;font-weight:700;color:#333;margin:28px 0 16px;`,
    h3: `font-size:16px;font-weight:700;color:#333;margin:24px 0 12px;`,
    p: `margin:0 0 16px;line-height:1.9;color:#333;font-size:14px;text-align:justify;`,
    meta: `font-size:13px;color:#666;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;`,
    tag: `display:inline-block;background:${t.lightBg};color:${t.primary};border-radius:4px;padding:3px 8px;margin-right:8px;font-size:12px;`,
    highlight: `color:${t.highlight};font-weight:700;`,
    blockquote: `margin:16px 0;padding:16px 20px;background:#f7f8fa;border-left:4px solid ${t.primary};border-radius:0 8px 8px 0;font-size:14px;color:#555;line-height:1.75;`,
    inlineCode: `background:#f3f4f6;color:#1f2937;padding:2px 6px;border-radius:4px;font-size:13px;font-family:Monaco,Consolas,monospace;`,
    img: `display:block;width:100%;max-width:100%;border-radius:12px;margin:16px 0;`,
    imgCaption: `text-align:center;font-size:13px;color:#999;margin:-8px 0 16px;`,
    ul: `margin:0 0 16px;padding-left:20px;font-size:14px;`,
    ol: `margin:0 0 16px;padding-left:20px;font-size:14px;`,
    li: `margin:6px 0;line-height:1.75;font-size:14px;`,
    hr: `border:none;border-top:1px solid #f0f0f0;margin:24px 0;`,
    footer: `text-align:center;color:#999;font-size:13px;margin-top:40px;padding-top:20px;border-top:1px solid #eee;`,
    table: `width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;`,
    th: `padding:12px 10px;text-align:left;font-weight:700;color:#333;background:#f7f8fa;border-bottom:2px solid #e5e7eb;`,
    td: `padding:10px;border-bottom:1px solid #f0f0f0;`,
    trEven: `background:#fafafa;`,
    
    // 主题特定样式
    primary: t.primary,
    primaryRgb: t.primaryRgb,
    gradient: t.gradient,
    lightBg: t.lightBg,
    border: t.border,
    codeLabel: t.codeLabel,
    markerYellow: t.markerYellow,
    markerGreen: t.markerGreen,
    markerRed: t.markerRed,
    highlightBg: t.highlightBg,
  };
}

// ============ 工具函数 ============
function esc(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// SVG 标题编号（主题色）
function renderSectionNumber(num, css) {
  const numStr = String(num).padStart(2, '0');
  return `<svg width="48" height="32" viewBox="0 0 48 32" style="display:block;margin:0 0 8px;">
  <rect width="48" height="32" rx="6" fill="${css.primary}"/>
  <text x="24" y="22" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="-apple-system,BlinkMacSystemFont,PingFang SC,sans-serif">${numStr}</text>
</svg>`;
}

// 墨玉绿主题的 Part 标题
function renderGreenPartTitle(num, title, subtitle) {
  return `<section style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
  <section style="text-align:center;flex-shrink:0;">
    <p style="margin:0;font-size:28px;font-weight:900;color:#059669;line-height:1;letter-spacing:-2px;">${String(num).padStart(2, '0')}</p>
    <p style="margin:0;font-size:8px;font-weight:700;color:#D1D5DB;letter-spacing:2px;">PART</p>
  </section>
  <span style="width:1px;height:36px;background:#E5E7EB;flex-shrink:0;"></span>
  <section>
    <p style="margin:0 0 1px;font-size:17px;font-weight:900;color:#111827;letter-spacing:0.3px;">${esc(title)}</p>
    <p style="margin:0;font-size:11px;font-weight:600;color:#9CA3AF;letter-spacing:1.5px;">${esc(subtitle || '')}</p>
  </section>
</section>`;
}

// 行内处理（支持荧光笔语法）
function processInline(text, css) {
  if (!text) return '';
  let html = esc(text);
  
  // **粗体高亮** -> 绿色加粗
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${css.primary};">$1</strong>`);
  
  // ==高亮== -> 黄色荧光笔
  html = html.replace(/==([^=]+)==/g, `<span style="background:${css.highlightBg};padding:0 4px;border-radius:2px;font-weight:600;color:#111827;">$1</span>`);
  
  // ~~删除线~~ -> 红色删除线
  html = html.replace(/~~([^~]+)~~/g, `<span style="border-bottom:2px solid ${css.markerRed};">$1</span>`);
  
  // __下划线__ -> 绿色下划线
  html = html.replace(/__([^_]+)__/g, `<span style="border-bottom:2px solid ${css.markerGreen};font-weight:600;">$1</span>`);
  
  // `代码` -> 行内代码
  html = html.replace(/`([^`]+)`/g, `<code style="background:#f3f4f6;color:#1f2937;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;">$1</code>`);
  
  // [链接](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${css.primary};text-decoration:none;">$1</a>`);
  
  return html;
}

// ============ 渲染函数 ============
function renderH(level, text, css, theme) {
  if (level === 2) {
    // 检查是否有副标题格式：## 标题 | 副标题
    const parts = text.split('|').map(s => s.trim());
    const title = parts[0];
    const subtitle = parts[1] || '';
    
    if (theme === 'green') {
      // 墨玉绿主题的 Part 标题
      return renderGreenPartTitle(++renderH.sectionCounter, title, subtitle);
    } else {
      // 果核橙主题的 SVG 编号
      renderH.sectionCounter++;
      const numSvg = renderSectionNumber(renderH.sectionCounter, css);
      const titleHtml = processInline(title, css);
      return `<div style="margin:28px 0 20px;">${numSvg}<h2 style="${css.h2}">${titleHtml}</h2></div>`;
    }
  }
  const styles = { h1: css.h1, h3: css.h3 };
  const style = styles[`h${level}`] || css.p;
  const content = processInline(text, css);
  return `<h${level} style="${style}">${content}</h${level}>`;
}
renderH.sectionCounter = 0;

function renderP(text, css) {
  return `<p style="${css.p}">${processInline(text, css)}</p>`;
}

function renderMeta(author, date, css) {
  const parts = [`<span style="${css.tag}">原创</span>`];
  if (author) parts.push(esc(author));
  if (date) parts.push(esc(date));
  return `<p style="${css.meta}">${parts.join('  ')}</p>`;
}

function renderQuote(lines, css) {
  const html = lines.map(line => processInline(line, css)).join('<br>');
  return `<blockquote style="${css.blockquote}">${html}</blockquote>`;
}

// 代码块 - 带语法高亮
function renderCode(code, lang, css) {
  const lines = (code || '').split('\n');
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  
  const codeText = lines.join('\n');
  
  let highlighted;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(codeText, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(codeText).value;
    }
  } catch (e) {
    highlighted = esc(codeText).replace(/ /g, '&nbsp;');
  }
  
  // 替换 hljs 类名为内联样式
  highlighted = highlighted
    .replace(/<span class="hljs-keyword">/g, '<span style="color:#c678dd;">')
    .replace(/<span class="hljs-string">/g, '<span style="color:#98c379;">')
    .replace(/<span class="hljs-comment">/g, '<span style="color:#5c6370;font-style:italic;">')
    .replace(/<span class="hljs-number">/g, '<span style="color:#d19a66;">')
    .replace(/<span class="hljs-title"/g, '<span style="color:#61afef;"')
    .replace(/<span class="hljs-function_">/g, '<span style="color:#61afef;">')
    .replace(/<span class="hljs-attr">/g, '<span style="color:#d19a66;">')
    .replace(/<span class="hljs-built_in">/g, '<span style="color:#e5c07b;">')
    .replace(/<span class="hljs-params">/g, '<span style="color:#e5c07b;">')
    .replace(/<span class="hljs-literal">/g, '<span style="color:#d19a66;">')
    .replace(/<span class="hljs-type">/g, '<span style="color:#e5c07b;">')
    .replace(/<span class="hljs-class">/g, '<span style="color:#e5c07b;">')
    .replace(/<span class="hljs-attribute">/g, '<span style="color:#d19a66;">')
    .replace(/<span class="hljs-variable">/g, '<span style="color:#e06c75;">')
    .replace(/<span class="hljs-variable language_">/g, '<span style="color:#e06c75;">')
    .replace(/<span class="hljs-subst">/g, '<span style="color:#abb2bf;">')
    .replace(/<span class="hljs-punctuation">/g, '<span style="color:#abb2bf;">')
    .replace(/<span class="hljs-meta">/g, '<span style="color:#abb2bf;">')
    .replace(/<span class="hljs-regexp">/g, '<span style="color:#98c379;">')
    .replace(/<span class="hljs-name">/g, '<span style="color:#e06c75;">')
    .replace(/<span class="hljs-selector-tag">/g, '<span style="color:#e06c75;">')
    .replace(/<span class="hljs-selector-id">/g, '<span style="color:#61afef;">')
    .replace(/<span class="hljs-selector-class">/g, '<span style="color:#d19a66;">')
    .replace(/<\/span>/g, '</span>');
  
  const codeLines = highlighted.split('\n').map(line => {
    return `<p style="margin:0;padding:0;white-space:nowrap;overflow:visible;width:max-content;min-width:100%;line-height:1.6;"><span style="font-family:'SF Mono',Consolas,Monaco,'Courier New',monospace;font-size:14px;color:#abb2bf;">${line}</span><span style="display:inline-block;width:20px;">&nbsp;</span></p>`;
  }).join('');
  
  const wrapStyle = 'margin:20px 0;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);background:#282c34;overflow:hidden;';
  const headerStyle = 'padding:10px 14px;background:#282c34;line-height:0;font-size:0;';
  const dotStyle = 'display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;';
  const header = `<section style="${headerStyle}"><span style="${dotStyle}background:#ff5f57;"></span><span style="${dotStyle}background:#febc2e;"></span><span style="${dotStyle}background:#28c840;margin-right:0;"></span></section>`;
  
  const bodyStyle = "width:100%;box-sizing:border-box;padding:16px 20px;background:#282c34;font-family:'SF Mono',Consolas,Monaco,'Courier New',monospace;font-size:14px;line-height:1.6;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;color:#abb2bf;";
  const body = `<section style="${bodyStyle}">${codeLines}</section>`;
  
  const langLabel = lang || 'code';
  const labelHtml = `<span style="display:inline-block;background:${css.codeLabel};color:#fff;font-size:11px;padding:4px 10px;border-radius:4px;margin:12px 0 0 14px;font-weight:500;">${esc(langLabel)}</span>`;
  
  return `<section style="${wrapStyle}">${labelHtml}${header}${body}</section>`;
}

function renderImg(url, alt, css) {
  let html = `<img src="${url}" style="${css.img}" alt="${esc(alt)}">`;
  if (alt && alt.trim()) {
    html += `<p style="${css.imgCaption}">${esc(alt)}</p>`;
  }
  return html;
}

function renderList(items, ordered, css) {
  const tag = ordered ? 'ol' : 'ul';
  const style = ordered ? css.ol : css.ul;
  const itemsHtml = items.map(item => `<li style="${css.li}">${processInline(item, css)}</li>`).join('');
  return `<${tag} style="${style}">${itemsHtml}</${tag}>`;
}

function renderHr(css) {
  return `<hr style="${css.hr}">`;
}

function renderTable(rows, css) {
  if (!rows || rows.length === 0) return '';
  const [headerRow, ...bodyRows] = rows;
  const theadHtml = `<thead><tr>${headerRow.map(cell => `<th style="${css.th}">${processInline(cell, css)}</th>`).join('')}</tr></thead>`;
  const tbodyHtml = `<tbody>${bodyRows.map((row, idx) => {
    const evenStyle = idx % 2 === 1 ? css.trEven : '';
    return `<tr style="${evenStyle}">${row.map(cell => `<td style="${css.td}">${processInline(cell, css)}</td>`).join('')}</tr>`;
  }).join('')}</tbody>`;
  return `<table style="${css.table}">${theadHtml}${tbodyHtml}</table>`;
}

function renderFooter(author, css) {
  return `<p style="${css.footer}">— 本文由 ${esc(author)} 原创 —</p>`;
}

// 墨玉绿主题的头部卡片
function renderGreenHeader(title, subtitle, desc, imgUrl, tags) {
  const tagsHtml = tags ? tags.map(t => `<span style="background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:8px;color:#fff;font-weight:600;">${esc(t)}</span>`).join('') : '';
  
  return `<section style="margin:0 0 32px;background:#fff;border:1.5px solid rgba(5,150,105,0.15);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:100%;">
  <section style="padding:32px 28px 28px;">
    <section style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
      <span style="width:6px;height:6px;background:#059669;border-radius:50%;"></span>
      <span style="font-size:11px;font-weight:700;letter-spacing:3px;color:#059669;">BREAKING</span>
      <span style="flex:1;height:1px;background:linear-gradient(to right,rgba(5,150,105,0.12),transparent);"></span>
      <span style="font-size:10px;color:#D1D5DB;font-weight:600;">${new Date().toISOString().slice(0,7).replace('-','.')}</span>
    </section>
    <section style="display:flex;align-items:center;gap:20px;">
      <section style="flex:1;min-width:0;">
        <p style="font-size:15px;color:#D1D5DB;margin:0 0 6px;text-decoration:line-through;letter-spacing:0.5px;">各种折腾装龙虾</p>
        <p style="font-size:24px;font-weight:900;color:#111827;margin:0;line-height:1.05;letter-spacing:-2px;">${esc(title)}</p>
        <p style="font-size:24px;font-weight:900;color:#059669;margin:0 0 16px;line-height:1.05;letter-spacing:-2px;">${esc(subtitle)}</p>
        <section style="width:48px;height:3px;background:linear-gradient(to right,#059669,#34D399);border-radius:2px;margin-bottom:12px;"></section>
        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.7;letter-spacing:0.5px;">${esc(desc || '')}</p>
      </section>
      ${imgUrl ? `<section style="flex-shrink:0;width:110px;height:110px;border-radius:16px;overflow:hidden;border:1px solid rgba(5,150,105,0.1);box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;">
      </section>` : ''}
    </section>
  </section>
  <section style="background:linear-gradient(135deg,#059669,#10B981);padding:12px 28px;display:flex;align-items:center;justify-content:space-between;">
    <p style="font-size:12px;color:rgba(255,255,255,0.9);margin:0;font-weight:600;letter-spacing:0.5px;">千序AI笔记</p>
    <section style="display:flex;gap:4px;">${tagsHtml}</section>
  </section>
</section>`;
}

// 墨玉绿主题的 Part 导航
function renderGreenPartNav(parts) {
  const partsHtml = parts.map((p, i) => {
    const isFirst = i === 0;
    const bg = isFirst ? 'background:linear-gradient(135deg,#059669,#10B981);' : 'background:#fff;border:1px solid #E5E7EB;box-shadow:0 2px 6px rgba(0,0,0,0.04);';
    const labelColor = isFirst ? 'color:rgba(255,255,255,0.7);' : 'color:#9CA3AF;';
    const titleColor = isFirst ? 'color:#fff;' : 'color:#111827;';
    const descColor = isFirst ? 'color:rgba(255,255,255,0.7);' : 'color:#9CA3AF;';
    
    return `<section style="display:inline-block;white-space:normal;vertical-align:top;width:110px;${bg}border-radius:12px;padding:12px;margin-right:8px;">
      <p style="font-size:9px;font-weight:700;${labelColor}letter-spacing:1px;margin:0 0 5px;">${p.label || `PART ${String(i+1).padStart(2,'0')}`}</p>
      <p style="font-size:13px;font-weight:800;${titleColor}margin:0 0 3px;">${esc(p.title)}</p>
      <p style="font-size:10px;${descColor}margin:0;">${esc(p.desc || '')}</p>
    </section>`;
  }).join('');
  
  return `<section style="margin:0 20px 32px;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
    <p style="font-size:10px;color:#9CA3AF;margin:0;text-transform:uppercase;letter-spacing:2px;font-weight:600;">📦 ${parts.length} Parts</p>
    <p style="font-size:10px;color:#9CA3AF;margin:0;">👉 滑动</p>
  </section>
  <section style="overflow-x:scroll;white-space:nowrap;padding-bottom:8px;">${partsHtml}</section>
</section>`;
}

// 提示框
function renderTipBox(text, css, type = 'info') {
  const bgColor = type === 'success' ? 'linear-gradient(to right,#ECFDF5,#F0FDF4)' : '#FFF';
  const borderColor = type === 'success' ? '#BBF7D0' : `dashed ${css.border.replace('rgba', 'rgba').replace('0.15', '0.3')}`;
  const textColor = type === 'success' ? css.primary : '#374151';
  
  return `<section style="background:${bgColor};border:1px ${borderColor};border-radius:8px;padding:14px 16px;margin-bottom:24px;text-align:center;">
  <p style="font-size:14px;color:${textColor};margin:0;line-height:1.6;">${processInline(text, css)}</p>
</section>`;
}

// 视频框
function renderVideoBox(vid, cover, title, css) {
  return `<section style="background:#fff;border-radius:16px;padding:12px;margin-bottom:16px;border:2px solid ${css.primary};box-shadow:0 4px 12px rgba(${css.primaryRgb},0.1);">
  <section style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <span style="width:8px;height:8px;background:${css.primary};border-radius:50%;"></span>
    <span style="font-size:11px;color:${css.primary};font-weight:700;letter-spacing:1px;">VIDEO</span>
    <span style="flex:1;height:1px;background:linear-gradient(to right,rgba(${css.primaryRgb},0.2),transparent);"></span>
    <span style="font-size:11px;color:#9CA3AF;">${esc(title || '演示视频')}</span>
  </section>
  <section style="border-radius:10px;overflow:hidden;">
    <span data-vidtype="2" data-mpvid="${vid}" data-src="https://mp.weixin.qq.com/mp/readtemplate?t=pages/video_player_tmpl&amp;auto=0&amp;vid=${vid}" 
      style="width:100%!important;height:470px!important;overflow:hidden;" class="video_iframe rich_pages" 
      id="js_mp_video_container_0" vid="${vid}" scrolling="no"></span>
  </section>
</section>`;
}

// ============ Markdown 解析 ============
function parseMarkdown(md, options = {}) {
  const theme = options.theme || 'orange';
  const css = generateCSS(theme);
  
  renderH.sectionCounter = 0;
  const lines = md.split('\n');
  const result = [];
  
  let inCode = false, codeContent = [], codeLang = '';
  let listItems = [], listOrdered = false;
  let tableRows = [], inTable = false;
  let quoteLines = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      result.push(renderList(listItems, listOrdered, css));
      listItems = [];
      listOrdered = false;
    }
  };
  const flushTable = () => {
    if (tableRows.length > 0) {
      result.push(renderTable(tableRows, css));
      tableRows = [];
      inTable = false;
    }
  };
  const flushQuote = () => {
    if (quoteLines.length > 0) {
      result.push(renderQuote(quoteLines, css));
      quoteLines = [];
    }
  };
  const parseTableRow = (line) => {
    if (!line.includes('|')) return null;
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    return cells.length > 0 ? cells : null;
  };
  const isTableSeparator = (line) => /^\|?[\s-:|]+\|?$/.test(line.trim());
  
  if (options.author || options.date) {
    result.push(renderMeta(options.author, options.date, css));
  }
  
  for (const line of lines) {
    const trim = line.trim();
    
    if (trim.startsWith('```')) {
      flushList(); flushTable(); flushQuote();
      if (!inCode) { inCode = true; codeLang = trim.slice(3).trim(); codeContent = []; }
      else { result.push(renderCode(codeContent.join('\n'), codeLang, css)); inCode = false; codeContent = []; codeLang = ''; }
      continue;
    }
    if (inCode) { codeContent.push(line); continue; }
    if (!trim) { flushList(); flushTable(); flushQuote(); continue; }
    
    const hMatch = trim.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) { flushList(); flushTable(); flushQuote(); result.push(renderH(hMatch[1].length, hMatch[2], css, theme)); continue; }
    
    if (trim.startsWith('>')) { flushList(); flushTable(); quoteLines.push(trim.slice(1).trim()); continue; }
    
    const ulMatch = trim.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) { flushTable(); flushQuote(); if (listOrdered && listItems.length) { result.push(renderList(listItems, listOrdered, css)); listItems = []; } listOrdered = false; listItems.push(ulMatch[1]); continue; }
    
    const olMatch = trim.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) { flushTable(); flushQuote(); if (!listOrdered && listItems.length) { result.push(renderList(listItems, listOrdered, css)); listItems = []; } listOrdered = true; listItems.push(olMatch[2]); continue; }
    
    if (trim === '---' || trim === '***') { flushList(); flushTable(); flushQuote(); result.push(renderHr(css)); continue; }
    
    const imgMatch = trim.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) { flushList(); flushTable(); flushQuote(); result.push(renderImg(imgMatch[2], imgMatch[1], css)); continue; }
    
    const tableCells = parseTableRow(trim);
    if (tableCells && !isTableSeparator(trim)) { flushList(); flushQuote(); if (!inTable) inTable = true; tableRows.push(tableCells); continue; }
    if (isTableSeparator(trim)) { continue; }
    if (inTable && !trim.startsWith('|')) { flushTable(); }
    
    flushList(); flushTable(); flushQuote();
    result.push(renderP(trim, css));
  }
  
  flushList(); flushTable(); flushQuote();
  if (options.author) result.push(renderFooter(options.author, css));
  return result.join('\n');
}

// ============ 主函数 ============
export function formatMarkdown(markdown, options = {}) {
  const theme = options.theme || 'orange';
  const css = generateCSS(theme);
  const html = parseMarkdown(markdown, options);
  return `<section style="${css.container}">${html}</section>`;
}

// 导出主题特定函数
export function formatWithGreenTheme(markdown, options = {}) {
  return formatMarkdown(markdown, { ...options, theme: 'green' });
}

export function formatWithOrangeTheme(markdown, options = {}) {
  return formatMarkdown(markdown, { ...options, theme: 'orange' });
}

// 导出头部卡片和导航
export { renderGreenHeader, renderGreenPartNav, renderTipBox, renderVideoBox, THEMES, generateCSS };

// CLI
if (process.argv[1] && process.argv[1].includes('formatter.mjs')) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(`千序排版器 v6.0 - 多主题版本
用法: node formatter.mjs <input.md> <output.html> [options]

选项:
  --author <作者>    设置作者名
  --date <日期>      设置日期
  --theme <主题>     选择主题: orange(果核橙) / green(墨玉绿)

示例:
  node formatter.mjs input.md output.html --theme green --author "千序"`);
    process.exit(0);
  }
  
  const inputFile = args[0], outputFile = args[1], options = {};
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--author' && args[i + 1]) options.author = args[++i];
    else if (args[i] === '--date' && args[i + 1]) options.date = args[++i];
    else if (args[i] === '--theme' && args[i + 1]) options.theme = args[++i];
  }
  
  const markdown = fs.readFileSync(inputFile, 'utf-8');
  const html = formatMarkdown(markdown, options);
  fs.writeFileSync(outputFile, html, 'utf-8');
  console.log(`✅ 排版完成：${outputFile} (主题: ${THEMES[options.theme || 'orange'].name})`);
}

export default { formatMarkdown, formatWithGreenTheme, formatWithOrangeTheme, renderGreenHeader, renderGreenPartNav, renderTipBox, renderVideoBox, THEMES };
