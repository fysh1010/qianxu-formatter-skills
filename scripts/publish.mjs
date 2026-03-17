/**
 * 千序一键发布工具 v6
 * 整合：排版 + 配图 + 发布 + 内容图片上传
 * 支持多主题：果核 (默认) / 墨玉绿
 * 
 * 配置说明：
 * - config.json: 主题、样式等非敏感配置
 * - .env: API 密钥等敏感配置（不要提交到 Git）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateImage } from './modelscope-imagegen.mjs';
import { formatMarkdown as formatGuohe } from './formatter.mjs';
import { formatMarkdown as formatMoyu } from './formatter-moyu.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const ENV_PATH = path.join(__dirname, '..', '.env');

// ============ 加载环境变量 ============
function loadEnv() {
  const env = {};
  try {
    const content = fs.readFileSync(ENV_PATH, 'utf-8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } catch (e) {
    console.error('⚠️  .env 文件不存在，请复制 .env.example 并配置密钥');
  }
  return env;
}

// ============ 加载配置 ============
function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    const env = loadEnv();
    
    // 合并敏感配置
    config.wechat = {
      appId: env.WECHAT_APP_ID || config.wechat?.appId,
      appSecret: env.WECHAT_APP_SECRET || config.wechat?.appSecret
    };
    
    config.gemini = {
      apiKey: env.GEMINI_API_KEY || config.gemini?.apiKey,
      imageModel: env.GEMINI_IMAGE_MODEL || config.gemini?.imageModel
    };
    
    config.modelscope = {
      apiKey: env.MODELSCOPE_API_KEY || config.modelscope?.apiKey,
      imageModel: env.MODELSCOPE_IMAGE_MODEL || config.modelscope?.imageModel
    };
    
    return config;
  } catch (e) {
    console.error('❌ 配置文件加载失败:', e.message);
    process.exit(1);
  }
}

// ============ 配图生成 ============
async function generateCover(prompt, outputPath, apiKey) {
  try {
    await generateImage(prompt, outputPath, apiKey, { timeout: 300000 });
    console.log('✅ 配图生成成功');
    return outputPath;
  } catch (error) {
    console.error('❌ 配图失败:', error.message);
    return null;
  }
}

// ============ 微信发布 ============
async function getAccessToken(appId, secret) {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.access_token) return data.access_token;
  throw new Error(data.errmsg || '获取 token 失败');
}

async function uploadImgForThumb(token, imgPath) {
  const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=image`;
  const buf = fs.readFileSync(imgPath);
  const blob = new Blob([buf], { type: 'image/png' });
  const fd = new FormData();
  fd.append('media', blob, path.basename(imgPath));
  const res = await fetch(url, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.media_id) return data.media_id;
  throw new Error(data.errmsg || '封面上传失败');
}

async function uploadImgForContent(token, imgPath) {
  const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=image`;
  const buf = fs.readFileSync(imgPath);
  const blob = new Blob([buf], { type: 'image/png' });
  const fd = new FormData();
  fd.append('media', blob, path.basename(imgPath));
  const res = await fetch(url, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.url) return data.url;
  throw new Error(data.errmsg || '内容图片上传失败');
}

async function createDraft(token, article) {
  const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: [article] })
  });
  const data = await res.json();
  if (data.media_id) return data.media_id;
  throw new Error(data.errmsg || '创建草稿失败');
}

// ============ 处理内容图片 ============
async function processContentImages(html, token, outDir, articleDir) {
  const imgRegex = /<img\s+src="([^"]+\.(png|jpg|jpeg))"[^>]*>/g;
  const images = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (!src.startsWith('http') && !src.startsWith('data:')) {
      images.push(src);
    }
  }
  
  console.log(`📷 发现 ${images.length} 张内容图片`);
  
  if (images.length === 0) {
    return html;
  }
  
  for (const imgPath of images) {
    let fullPath = path.join(outDir, imgPath);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(articleDir, imgPath);
    }
    
    if (fs.existsSync(fullPath)) {
      try {
        console.log(`  📤 上传：${imgPath}`);
        const wechatUrl = await uploadImgForContent(token, fullPath);
        const escapedPath = imgPath.replace(/\//g, '/').replace(/\\/g, '\\\\');
        html = html.replace(new RegExp(`src="${escapedPath}"`, 'g'), `src="${wechatUrl}"`);
        console.log(`  ✅ 完成：${path.basename(imgPath)}`);
      } catch (e) {
        console.log(`  ❌ 失败：${imgPath} - ${e.message}`);
      }
    } else {
      console.log(`  ⚠️  文件不存在：${imgPath}`);
    }
  }
  
  return html;
}

// ============ 主函数 ============
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log(`
千序一键发布工具 v6

用法：
  node publish.mjs <article.md> [选项]

选项：
  --title <标题>      文章标题
  --author <作者>     作者名（默认：千序）
  --theme <主题>      排版主题：guohe(果核) / moyu(墨玉绿)，默认 guohe
  --no-cover          不生成封面图
  --dry-run           仅排版，不发布

示例：
  node publish.mjs article.md --title "GPT-5.4 发布" --author "千序"
  node publish.mjs article.md --theme moyu --title "AutoClaw 教程"
`);
    process.exit(0);
  }
  
  const cfg = loadConfig();
  const opt = { author: '千序', theme: 'guohe' };
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--title' && args[i+1]) opt.title = args[++i];
    else if (args[i] === '--author' && args[i+1]) opt.author = args[++i];
    else if (args[i] === '--date' && args[i+1]) opt.date = args[++i];
    else if (args[i] === '--theme' && args[i+1]) opt.theme = args[++i];
    else if (args[i] === '--no-cover') opt.noCover = true;
    else if (args[i] === '--dry-run') opt.dryRun = true;
  }
  
  if (!['guohe', 'moyu'].includes(opt.theme)) {
    console.log(`⚠️  未知主题 "${opt.theme}"，使用默认主题 "guohe"`);
    opt.theme = 'guohe';
  }
  console.log(`🎨 主题：${opt.theme === 'moyu' ? '墨玉绿' : '果核'}`);
  
  console.log('📖 读取文章...');
  const md = fs.readFileSync(args[0], 'utf-8');
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = opt.title || (titleMatch ? titleMatch[1] : '未命名');
  console.log(`📝 标题：${title}`);
  
  const articleDir = path.dirname(args[0]);
  const outDir = path.join(articleDir, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  let coverPath = null;
  if (!opt.noCover && cfg.modelscope?.apiKey) {
    console.log('🎨 生成封面图...');
    try {
      const prompt = `微信公众号封面图，主题：${title}。风格：现代简约科技感，无文字无水印，蓝紫色调`;
      coverPath = path.join(outDir, 'cover.png');
      await generateCover(prompt, coverPath, cfg.modelscope.apiKey);
    } catch (e) {
      console.error('❌ 配图失败:', e.message);
      coverPath = null;
    }
  }
  
  console.log('✨ 排版中...');
  const formatter = opt.theme === 'moyu' ? formatMoyu : formatGuohe;
  const html = formatter(md, {
    author: opt.author,
    date: opt.date || new Date().toISOString().slice(0, 10)
  });
  
  const htmlPath = path.join(outDir, 'article.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`✅ 排版完成：${htmlPath}`);
  
  if (!opt.dryRun && cfg.wechat) {
    console.log('📤 发布到微信...');
    try {
      const token = await getAccessToken(cfg.wechat.appId, cfg.wechat.appSecret);
      console.log('  ✅ 获取 token 成功');
      
      let thumbId = null;
      if (coverPath) {
        thumbId = await uploadImgForThumb(token, coverPath);
        console.log('  ✅ 封面上传成功');
      }
      
      let finalHtml = html;
      if (cfg.wechat) {
        finalHtml = await processContentImages(html, token, outDir, articleDir);
      }
      
      const mediaId = await createDraft(token, {
        title,
        author: opt.author,
        content: finalHtml,
        thumb_media_id: thumbId,
        need_open_comment: 1,
        only_fans_can_comment: 0
      });
      
      console.log(`\n🎉 发布成功！Media ID: ${mediaId}`);
      console.log('🔗 后台：https://mp.weixin.qq.com');
    } catch (e) {
      console.error('❌ 发布失败:', e.message);
    }
  } else if (opt.dryRun) {
    console.log('🏃 Dry-run 模式');
  }
}

main().catch(e => { console.error('❌ 错误:', e.message); process.exit(1); });
