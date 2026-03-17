/**
 * 生成封面图 - 使用魔搭 API
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

async function submitTask(prompt, model, size, apiKey) {
  const payload = JSON.stringify({ model, prompt, n: 1, size });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api-inference.modelscope.cn',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-ModelScope-Async-Mode': 'true',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.task_id) return resolve(result.task_id);
          reject(new Error(`提交任务失败: ${data.substring(0, 300)}`));
        } catch { reject(new Error(`响应解析失败: ${data.substring(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function queryTask(taskId, apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api-inference.modelscope.cn',
      path: `/v1/tasks/${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-ModelScope-Task-Type': 'image_generation',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`任务查询解析失败`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function pollTask(taskId, apiKey, timeout, interval) {
  const deadline = Date.now() + timeout;
  return new Promise((resolve, reject) => {
    const check = async () => {
      if (Date.now() > deadline) return reject(new Error(`超时`));
      try {
        const result = await queryTask(taskId, apiKey);
        if (result.task_status === 'SUCCEED') {
          if (result.output_images?.length) return resolve(result.output_images[0]);
          return reject(new Error('没有图片数据'));
        }
        if (result.task_status === 'FAILED') {
          return reject(new Error(`任务失败`));
        }
        process.stdout.write('.');
        setTimeout(check, interval);
      } catch (e) { reject(e); }
    };
    setTimeout(check, interval);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`下载失败: ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('用法: node gen-cover.mjs <prompt> <output>');
    process.exit(0);
  }
  
  const prompt = args[0];
  const outputPath = args[1];
  const cfg = loadConfig();
  
  console.log('📤 提交生图任务...');
  const taskId = await submitTask(prompt, 'Qwen/Qwen-Image-2512', '1024x576', cfg.modelscope.apiKey);
  console.log(`⏳ 任务ID: ${taskId}`);
  
  console.log('⏳ 等待生成');
  const imageUrl = await pollTask(taskId, cfg.modelscope.apiKey, 120000, 3000);
  console.log('\n📥 下载图片...');
  
  await downloadFile(imageUrl, outputPath);
  console.log(`✅ 封面图保存: ${outputPath}`);
}

main().catch(e => {
  console.error('❌ 错误:', e.message);
  process.exit(1);
});
