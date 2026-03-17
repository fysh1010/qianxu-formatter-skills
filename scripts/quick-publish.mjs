/**
 * 快速发布到微信公众号草稿箱
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

// 获取 access_token
async function getAccessToken(appId, secret) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.access_token) resolve(result.access_token);
          else reject(new Error(result.errmsg || '获取 token 失败'));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// 上传封面图
async function uploadImage(token, imgPath) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Date.now();
    const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=image`;
    
    const buf = fs.readFileSync(imgPath);
    const filename = path.basename(imgPath);
    
    const payload = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="media"; filename="${filename}"\r\n`),
      Buffer.from(`Content-Type: image/png\r\n\r\n`),
      buf,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);
    
    const options = {
      hostname: 'api.weixin.qq.com',
      path: `/cgi-bin/material/add_material?access_token=${token}&type=image`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.media_id) resolve(result.media_id);
          else reject(new Error(result.errmsg || '上传失败'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// 创建草稿
async function createDraft(token, article) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ articles: [article] });
    const options = {
      hostname: 'api.weixin.qq.com',
      path: `/cgi-bin/draft/add?access_token=${token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.media_id) resolve(result.media_id);
          else reject(new Error(result.errmsg || '创建草稿失败'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('用法: node quick-publish.mjs <html文件> <标题> [封面图]');
    process.exit(0);
  }
  
  const htmlPath = args[0];
  const title = args[1];
  const coverPath = args[2];
  
  const cfg = loadConfig();
  
  console.log('📖 读取 HTML...');
  const content = fs.readFileSync(htmlPath, 'utf-8');
  
  console.log('🔑 获取 access_token...');
  const token = await getAccessToken(cfg.wechat.appId, cfg.wechat.appSecret);
  console.log('  ✅ Token 获取成功');
  
  let thumbMediaId = null;
  if (coverPath && fs.existsSync(coverPath)) {
    console.log('📸 上传封面图...');
    thumbMediaId = await uploadImage(token, coverPath);
    console.log('  ✅ 封面上传成功');
  } else {
    console.log('⚠️  未提供封面图，将使用默认封面');
  }
  
  console.log('📝 创建草稿...');
  const mediaId = await createDraft(token, {
    title,
    author: '千序',
    content,
    thumb_media_id: thumbMediaId,
    need_open_comment: 1,
    only_fans_can_comment: 0
  });
  
  console.log(`\n🎉 发布成功！`);
  console.log(`📄 Media ID: ${mediaId}`);
  console.log(`🔗 后台: https://mp.weixin.qq.com`);
}

main().catch(e => {
  console.error('❌ 错误:', e.message);
  process.exit(1);
});
