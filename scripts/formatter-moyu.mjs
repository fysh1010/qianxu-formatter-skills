/**
 * 千序排版器 - 墨玉绿主题 v1.0
 * 深绿高级感，适合技术/产品类文章
 */

import hljs from 'highlight.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============ 墨玉绿主题色板 ============
const COLORS = {
  primary: '#059669',      // 墨玉绿主色
  primaryLight: '#10B981', // 浅绿渐变
  primaryBg: '#ECFDF5',    // 最浅绿背景
  primaryBorder: 'rgba(5, 150, 105, 0.15)',
  accent: '#FDE68A',       // 黄色高亮
  text: '#111827',         // 主文字
  textMuted: '#6B7280',    // 次文字
  textLight: '#9CA3AF',    // 最浅文字
  bg: '#FFFFFF',
  bgGray: '#F9FAFB',
  border: '#E5E7EB',
  code: '#282c34',
  delete: '#FECACA',       // 删除线红
  underline: '#A7F3D0',    // 下划线绿
};

// ============ CSS 样式 ============
const CSS = {
  container: `max-width:677px;margin:0 auto;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:${COLORS.text};line-height:1.75;letter-spacing:0.5px;`,
  
  // 文章标题卡片
  heroCard: `margin:0 0 32px;background:#fff;border:1.5px solid ${COLORS.primaryBorder};border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);`,
  heroHeader: `display:flex;align-items:center;gap:8px;margin-bottom:28px;`,
  heroDot: `width:6px;height:6px;background:${COLORS.primary};border-radius:50%;`,
  heroTag: `font-size:11px;font-weight:700;letter-spacing:3px;color:${COLORS.primary};`,
  heroDivider: `flex:1;height:1px;background:linear-gradient(to right, rgba(5,150,105,0.12), transparent);`,
  heroDate: `font-size:10px;color:${COLORS.textLight};font-weight:600;`,
  heroContent: `display:flex;align-items:center;gap:20px;`,
  heroText: `flex:1;min-width:0;`,
  heroSubtitle: `font-size:15px;color:${COLORS.textLight};margin:0 0 6px;text-decoration:line-through;letter-spacing:0.5px;`,
  heroTitleBlack: `font-size:24px;font-weight:900;color:${COLORS.text};margin:0;line-height:1.05;letter-spacing:-2px;`,
  heroTitleGreen: `font-size:24px;font-weight:900;color:${COLORS.primary};margin:0 0 16px;line-height:1.05;letter-spacing:-2px;`,
  heroLine: `width:48px;height:3px;background:linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight});border-radius:2px;margin-bottom:12px;`,
  heroDesc: `font-size:13px;color:${COLORS.textMuted};margin:0;line-height:1.7;letter-spacing:0.5px;`,
  heroImg: `flex-shrink:0;width:110px;height:110px;border-radius:16px;overflow:hidden;border:1px solid ${COLORS.primaryBorder};box-shadow:0 4px 12px rgba(0,0,0,0.06);`,
  heroFooter: `background:linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight});padding:12px 28px;display:flex;align-items:center;justify-content:space-between;`,
  heroFooterText: `font-size:12px;color:rgba(255,255,255,0.9);margin:0;font-weight:600;letter-spacing:0.5px;`,
  heroTags: `display:flex;gap:4px;`,
  heroTagItem: `background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:8px;color:#fff;font-weight:600;`,
  
  // Part 导航
  partNav: `margin:0 20px 32px;`,
  partNavHeader: `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;`,
  partNavTitle: `font-size:10px;color:${COLORS.textMuted};margin:0;text-transform:uppercase;letter-spacing:2px;font-weight:600;`,
  partNavHint: `font-size:10px;color:${COLORS.textMuted};margin:0;`,
  partNavScroll: `overflow-x:scroll;white-space:nowrap;padding-bottom:8px;`,
  partCardActive: `display:inline-block;white-space:normal;vertical-align:top;width:110px;background:linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight});border-radius:12px;padding:12px;margin-right:8px;`,
  partCardInactive: `display:inline-block;white-space:normal;vertical-align:top;width:110px;background:#fff;border:1px solid ${COLORS.border};border-radius:12px;padding:12px;margin-right:8px;box-shadow:0 2px 6px rgba(0,0,0,0.04);`,
  partCardLabel: `font-size:9px;font-weight:700;letter-spacing:1px;margin:0 0 5px;`,
  partCardTitle: `font-size:13px;font-weight:800;margin:0 0 3px;`,
  partCardDesc: `font-size:10px;margin:0;`,
  
  // 标题
  h1: `font-size:22px;font-weight:700;text-align:center;margin:28px 0 24px;color:${COLORS.text};`,
  h2: `margin-top:48px;margin-bottom:32px;padding:0 20px;`,
  h3: `margin:24px 0 12px;padding:0 20px;`,
  
  // Part 标题
  partHeader: `display:flex;align-items:center;gap:16px;margin-bottom:24px;`,
  partNumber: `text-align:center;flex-shrink:0;`,
  partNumBig: `margin:0;font-size:28px;font-weight:900;color:${COLORS.primary};line-height:1;letter-spacing:-2px;`,
  partNumSmall: `margin:0;font-size:8px;font-weight:700;color:${COLORS.textLight};letter-spacing:2px;`,
  partDivider: `width:1px;height:36px;background:${COLORS.border};flex-shrink:0;`,
  partTitleWrap: ``,
  partTitle: `margin:0 0 1px;font-size:17px;font-weight:900;color:${COLORS.text};letter-spacing:0.3px;`,
  partSubtitle: `margin:0;font-size:11px;font-weight:600;color:${COLORS.textLight};letter-spacing:1.5px;`,
  
  // 段落
  p: `margin-bottom:16px;font-size:14px;line-height:1.9;text-align:justify;padding:0 20px;`,
  
  // 高亮样式
  highlight: `background:linear-gradient(120deg, ${COLORS.accent} 0%, rgba(255,255,255,0) 100%);padding:0 4px;border-radius:2px;font-weight:600;color:${COLORS.text};`,
  highlightBold: `color:${COLORS.primary};font-weight:700;`,
  deleteText: `border-bottom:2px solid ${COLORS.delete};`,
  underlineText: `border-bottom:2px solid ${COLORS.underline};font-weight:600;`,
  codeText: `background:#F3F4F6;color:${COLORS.text};padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;`,
  
  // 引用块
  blockquote: `background:linear-gradient(to right, ${COLORS.primaryBg}, #F0FDF4);border-left:3px solid ${COLORS.primary};border-radius:4px;padding:12px 16px;margin:16px 20px;`,
  blockquoteText: `font-size:13px;color:${COLORS.text};margin:0;line-height:1.6;`,
  blockquoteTip: `background:#FFF;border:1px dashed #BBF7D0;border-radius:8px;padding:14px 16px;margin:24px 20px;text-align:center;`,
  
  // 图片
  img: `text-align:center;margin:16px 20px 24px;border-radius:12px;overflow:hidden;`,
  imgStyle: `display:block;width:100%;max-width:100%;border-radius:12px;`,
  imgCaption: `text-align:center;font-size:13px;color:${COLORS.textLight};margin:-8px 20px 16px;`,
  
  // 列表
  ul: `margin:0 20px 16px;padding-left:20px;font-size:14px;`,
  li: `margin:6px 0;line-height:1.75;font-size:14px;`,
  
  // 分隔线
  hr: `border:none;border-top:1px solid ${COLORS.border};margin:24px 20px;`,
  
  // 页脚
  footer: `text-align:center;color:${COLORS.textLight};font-size:13px;margin:40px 20px 24px;padding-top:20px;border-top:1px solid ${COLORS.border};`,
  
  // 互动区
  interaction: `background:radial-gradient(circle at center, ${COLORS.bgGray} 0%, #FFFFFF 100%);border:1px solid ${COLORS.border};border-radius:16px;padding:32px 20px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.03);margin:0 20px 24px;`,
  interactionText: `font-size:13px;font-weight:bold;color:${COLORS.text};margin-bottom:20px;line-height:1.6;`,
  interactionIcons: `display:flex;justify-content:center;gap:24px;margin-bottom:16px;`,
  interactionIcon: `text-align:center;cursor:pointer;color:${COLORS.textMuted};`,
  interactionIconBox: `width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#fff;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.05);border:1px solid ${COLORS.border};`,
  interactionIconLabel: `font-size:10px;font-weight:600;`,
};

// ============ 工具函数 ============
function esc(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 行内处理
function processInline(text) {
  if (!text) return '';
  let html = esc(text);
  
  // **加粗** → 绿色加粗
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong style="${CSS.highlightBold}">$1</strong>`);
  
  // *斜体* → 黄色高亮
  html = html.replace(/(?<!\*)\*([^*]+)\\*(?!\*)/g, `<span style="${CSS.highlight}">$1</span>`);
  
  // `代码` → 灰色代码
  html = html.replace(/`([^`]+)`/g, `<code style="${CSS.codeText}">$1</code>`);
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${COLORS.primary};text-decoration:none;">$1</a>`);
  
  return html;
}

// Part 数据提取
function extractParts(markdown) {
  const lines = markdown.split('\n');
  const parts = [];
  let currentPart = null;
  let contentLines = [];
  let inCode = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();
    
    // 代码块处理
    if (trim.startsWith('```')) {
      inCode = !inCode;
      contentLines.push(line);
      continue;
    }
    if (inCode) {
      contentLines.push(line);
      continue;
    }
    
    // H2 标题 = 新 Part
    const h2Match = trim.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (currentPart) {
        currentPart.content = contentLines.join('\n');
        parts.push(currentPart);
      }
      
      const title = h2Match[1];
      // 尝试提取副标题（如果有冒号或破折号）
      let mainTitle = title;
      let subtitle = '';
      
      const colonMatch = title.match(/^(.+?)\s*[：:]\s*(.+)$/);
      if (colonMatch) {
        mainTitle = colonMatch[1];
        subtitle = colonMatch[2];
      } else {
        const dashMatch = title.match(/^(.+?)\s*[-·—]\s*(.+)$/);
        if (dashMatch) {
          mainTitle = dashMatch[1];
          subtitle = dashMatch[2];
        }
      }
      
      currentPart = {
        num: parts.length + 1,
        title: mainTitle,
        subtitle: subtitle,
        content: ''
      };
      contentLines = [];
    } else if (currentPart) {
      contentLines.push(line);
    }
  }
  
  // 最后一个 Part
  if (currentPart) {
    currentPart.content = contentLines.join('\n');
    parts.push(currentPart);
  }
  
  return parts;
}

// ============ 渲染函数 ============

// 渲染 Hero 卡片
function renderHeroCard(title, author, coverUrl, tags = []) {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '.');
  const tagHtml = tags.map(tag => `<span style="${CSS.heroTagItem}">${esc(tag)}</span>`).join('');
  
  return `
<section style="${CSS.heroCard}">
  <section style="padding:32px 28px 28px;">
    <section style="${CSS.heroHeader}">
      <span style="${CSS.heroDot}"></span>
      <span style="${CSS.heroTag}">FEATURED</span>
      <span style="${CSS.heroDivider}"></span>
      <span style="${CSS.heroDate}">${dateStr}</span>
    </section>
    <section style="${CSS.heroContent}">
      <section style="${CSS.heroText}">
        <p style="${CSS.heroSubtitle}">千序AI笔记</p>
        <p style="${CSS.heroTitleBlack}">${esc(title.split(/[·—:：]/)[0] || title)}</p>
        <p style="${CSS.heroTitleGreen}">${esc(title.split(/[·—:：]/)[1] || 'AI 工具推荐')}</p>
        <section style="${CSS.heroLine}"><br></section>
        <p style="${CSS.heroDesc}">作者：${esc(author || '千序')}</p>
      </section>
      ${coverUrl ? `<section style="${CSS.heroImg}">
        <img src="${coverUrl}" style="width:100%;height:100%;object-fit:cover;" alt="封面">
      </section>` : ''}
    </section>
  </section>
  <section style="${CSS.heroFooter}">
    <p style="${CSS.heroFooterText}"> ${esc(author || '千序')}</p>
    <section style="${CSS.heroTags}">
      ${tagHtml || `<span style="${CSS.heroTagItem}">原创</span><span style="${CSS.heroTagItem}">干货</span>`}
    </section>
  </section>
</section>`;
}

// 渲染 Part 导航
function renderPartNav(parts) {
  if (parts.length === 0) return '';
  
  const cardsHtml = parts.map((part, idx) => {
    const isActive = idx === 0;
    const style = isActive ? CSS.partCardActive : CSS.partCardInactive;
    const labelStyle = isActive ? `color:rgba(255,255,255,0.7);` : `color:${COLORS.textLight};`;
    const titleStyle = isActive ? `color:#fff;` : `color:${COLORS.text};`;
    const descStyle = isActive ? `color:rgba(255,255,255,0.7);` : `color:${COLORS.textLight};`;
    
    return `
    <section style="${style}">
      <p style="${CSS.partCardLabel}${labelStyle}">PART ${String(part.num).padStart(2, '0')}</p>
      <p style="${CSS.partCardTitle}${titleStyle}">${esc(part.title)}</p>
      <p style="${CSS.partCardDesc}${descStyle}">${esc(part.subtitle || '')}</p>
    </section>`;
  }).join('');
  
  return `
<section style="${CSS.partNav}">
  <section style="${CSS.partNavHeader}">
    <p style="${CSS.partNavTitle}"> ${parts.length} Parts</p>
    <p style="${CSS.partNavHint}"> 滑动查看</p>
  </section>
  <section style="${CSS.partNavScroll}">
    ${cardsHtml}
  </section>
</section>`;
}

// 渲染 Part 标题
function renderPartHeader(num, title, subtitle) {
  const numStr = String(num).padStart(2, '0');
  return `
<section style="${CSS.h2}">
  <section style="${CSS.partHeader}">
    <section style="${CSS.partNumber}">
      <p style="${CSS.partNumBig}">${numStr}</p>
      <p style="${CSS.partNumSmall}">PART</p>
    </section>
    <span style="${CSS.partDivider}"></span>
    <section style="${CSS.partTitleWrap}">
      <p style="${CSS.partTitle}">${esc(title)}</p>
      ${subtitle ? `<p style="${CSS.partSubtitle}">${esc(subtitle)}</p>` : ''}
    </section>
  </section>
</section>`;
}

// 渲染 H1
function renderH1(text) {
  return `<h1 style="${CSS.h1}">${processInline(text)}</h1>`;
}

// 渲染 H3
function renderH3(text) {
  return `<section style="${CSS.h3}"><h3 style="font-size:16px;font-weight:700;color:${COLORS.text};margin:0;">${processInline(text)}</h3></section>`;
}

// 渲染段落
function renderP(text) {
  return `<p style="${CSS.p}">${processInline(text)}</p>`;
}

// 渲染引用
function renderQuote(lines) {
  const html = lines.map(line => processInline(line)).join('<br>');
  return `<blockquote style="${CSS.blockquote}"><p style="${CSS.blockquoteText}">${html}</p></blockquote>`;
}

// 渲染提示框
function renderTip(text) {
  return `<section style="${CSS.blockquoteTip}"><p style="font-size:14px;color:${COLORS.text};margin:0;line-height:1.6;"><strong style="color:${COLORS.primary};">${text}</strong></p></section>`;
}

// 代码块 - 带语法高亮
function renderCode(code, lang = '') {
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
    return `<p style="margin:0;padding:0;white-space:nowrap;overflow:visible;width:max-content;min-width:100%;line-height:1.6;"><span style="font-family:'SF Mono',Consolas,Monaco,'Courier New',monospace;font-size:14px;color:#abb2bf;">${line}</span><span style="display:inline-block;width:20px;"> </span></p>`;
  }).join('');
  
  const wrapStyle = 'margin:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.08);background:#282c34;overflow:hidden;';
  const headerStyle = 'padding:10px 14px;background:#282c34;line-height:0;font-size:0;';
  const dotStyle = 'display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;';
  const header = `<section style="${headerStyle}"><span style="${dotStyle}background:#ff5f57;"></span><span style="${dotStyle}background:#febc2e;"></span><span style="${dotStyle}background:#28c840;margin-right:0;"></span></section>`;
  const bodyStyle = "width:100%;box-sizing:border-box;padding:16px 20px;background:#282c34;font-family:'SF Mono',Consolas,Monaco,'Courier New',monospace;font-size:14px;line-height:1.6;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;color:#abb2bf;";
  const body = `<section style="${bodyStyle}">${codeLines}</section>`;
  const langLabel = lang || 'code';
  const labelHtml = `<span style="display:inline-block;background:${COLORS.primary};color:#fff;font-size:11px;padding:4px 10px;border-radius:4px;margin:12px 0 0 14px;font-weight:500;">${esc(langLabel)}</span>`;
  
  return `<section style="${wrapStyle}">${labelHtml}${header}${body}</section>`;
}

// 渲染图片
function renderImg(url, alt = '') {
  let html = `<section style="${CSS.img}"><img src="${url}" style="${CSS.imgStyle}" alt="${esc(alt)}">`;
  if (alt && alt.trim()) {
    html += `<p style="${CSS.imgCaption}">${esc(alt)}</p>`;
  }
  html += `</section>`;
  return html;
}

// 渲染列表
function renderList(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  const itemsHtml = items.map(item => `<li style="${CSS.li}">${processInline(item)}</li>`).join('');
  return `<${tag} style="${CSS.ul}">${itemsHtml}</${tag}>`;
}

// 渲染分隔线
function renderHr() {
  return `<hr style="${CSS.hr}">`;
}

// 渲染页脚
function renderFooter(author) {
  return `
<section style="${CSS.interaction}">
  <p style="${CSS.interactionText}">如果觉得有用，随手点个赞、在看、转发三连吧  </p>
  <section style="${CSS.interactionIcons}">
    <section style="${CSS.interactionIcon}">
      <section style="${CSS.interactionIconBox}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
      </section>
      <span style="${CSS.interactionIconLabel}">点赞</span>
    </section>
    <section style="${CSS.interactionIcon}">
      <section style="${CSS.interactionIconBox}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg>
      </section>
      <span style="${CSS.interactionIconLabel}">在看</span>
    </section>
    <section style="${CSS.interactionIcon}">
      <section style="${CSS.interactionIconBox};background:${COLORS.primaryBg};border:1px solid ${COLORS.underline};box-shadow:0 2px 4px rgba(5,150,105,0.15);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${COLORS.primary}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18v-4a8 8 0 0 1 8-8h8"></path><polyline points="16 2 20 6 16 10"></polyline></svg>
      </section>
      <span style="${CSS.interactionIconLabel}">转发</span>
    </section>
  </section>
  <p style="font-size:10px;color:${COLORS.textLight};letter-spacing:1px;margin:0;">THANKS FOR READING</p>
</section>
<p style="${CSS.footer}">— ${esc(author || '千序')} 原创 —</p>`;
}

// ============ Markdown 解析 ============
function parseMarkdown(md, options = {}) {
  const lines = md.split('\n');
  const result = [];
  
  let inCode = false, codeContent = [], codeLang = '';
  let listItems = [], listOrdered = false;
  let quoteLines = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      result.push(renderList(listItems, listOrdered));
      listItems = [];
      listOrdered = false;
    }
  };
  
  const flushQuote = () => {
    if (quoteLines.length > 0) {
      result.push(renderQuote(quoteLines));
      quoteLines = [];
    }
  };
  
  // 提取 Parts
  const parts = extractParts(md);
  let currentPartIdx = 0;
  
  for (const line of lines) {
    const trim = line.trim();
    
    if (trim.startsWith('```')) {
      flushList(); flushQuote();
      if (!inCode) { inCode = true; codeLang = trim.slice(3).trim(); codeContent = []; }
      else { result.push(renderCode(codeContent.join('\n'), codeLang)); inCode = false; codeContent = []; codeLang = ''; }
      continue;
    }
    if (inCode) { codeContent.push(line); continue; }
    if (!trim) { flushList(); flushQuote(); continue; }
    
    // H1 - 文章标题
    const h1Match = trim.match(/^#\s+(.+)$/);
    if (h1Match) {
      result.push(renderH1(h1Match[1]));
      continue;
    }
    
    // H2 - Part 标题
    const h2Match = trim.match(/^##\s+(.+)$/);
    if (h2Match) {
      flushList(); flushQuote();
      const title = h2Match[1];
      let mainTitle = title;
      let subtitle = '';
      
      const colonMatch = title.match(/^(.+?)\s*[：:]\s*(.+)$/);
      if (colonMatch) {
        mainTitle = colonMatch[1];
        subtitle = colonMatch[2];
      } else {
        const dashMatch = title.match(/^(.+?)\s*[-·—]\s*(.+)$/);
        if (dashMatch) {
          mainTitle = dashMatch[1];
          subtitle = dashMatch[2];
        }
      }
      
      currentPartIdx++;
      result.push(renderPartHeader(currentPartIdx, mainTitle, subtitle));
      continue;
    }
    
    // H3
    const h3Match = trim.match(/^###\s+(.+)$/);
    if (h3Match) { flushList(); flushQuote(); result.push(renderH3(h3Match[1])); continue; }
    
    // 引用
    if (trim.startsWith('>')) { flushList(); quoteLines.push(trim.slice(1).trim()); continue; }
    
    // 无序列表
    const ulMatch = trim.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) { flushQuote(); if (listOrdered && listItems.length) { result.push(renderList(listItems, listOrdered)); listItems = []; } listOrdered = false; listItems.push(ulMatch[1]); continue; }
    
    // 有序列表
    const olMatch = trim.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) { flushQuote(); if (!listOrdered && listItems.length) { result.push(renderList(listItems, listOrdered)); listItems = []; } listOrdered = true; listItems.push(olMatch[2]); continue; }
    
    // 分隔线
    if (trim === '---' || trim === '***') { flushList(); flushQuote(); result.push(renderHr()); continue; }
    
    // 图片
    const imgMatch = trim.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) { flushList(); flushQuote(); result.push(renderImg(imgMatch[2], imgMatch[1])); continue; }
    
    // 普通段落
    flushList(); flushQuote();
    result.push(renderP(trim));
  }
  
  flushList(); flushQuote();
  
  return result.join('\n');
}

// ============ 主函数 ============
export function formatMarkdown(markdown, options = {}) {
  // 提取 Parts
  const parts = extractParts(markdown);
  
  // 提取标题
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : (options.title || '千序AI笔记');
  
  // 生成 HTML
  let html = '';
  
  // Hero 卡片
  html += renderHeroCard(title, options.author, options.coverUrl, options.tags);
  
  // Part 导航
  if (parts.length > 1) {
    html += renderPartNav(parts);
  }
  
  // 正文
  html += parseMarkdown(markdown, options);
  
  // 页脚
  html += renderFooter(options.author);
  
  return `<section style="${CSS.container}">${html}</section>`;
}

// CLI
if (process.argv[1] && process.argv[1].includes('formatter-moyu.mjs')) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(`千序排版器 - 墨玉绿主题 v1.0\n用法: node formatter-moyu.mjs <input.md> <output.html> [--author 作者] [--title 标题]`);
    process.exit(0);
  }
  const inputFile = args[0], outputFile = args[1], options = {};
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--author' && args[i + 1]) options.author = args[++i];
    else if (args[i] === '--title' && args[i + 1]) options.title = args[++i];
  }
  const markdown = fs.readFileSync(inputFile, 'utf-8');
  const html = formatMarkdown(markdown, options);
  fs.writeFileSync(outputFile, html, 'utf-8');
  console.log(`✅ 墨玉绿排版完成：${outputFile}`);
}

export default { formatMarkdown, CSS, COLORS };
