/**
 * 魔搭 ModelScope 图片生成模块 v2
 * 支持多模型选择：Qwen/Qwen-Image-2512（高质量）和 Tongyi-MAI/Z-Image-Turbo（快速）
 */

import https from 'https';
import fs from 'fs';

// 可用模型配置
export const AVAILABLE_MODELS = {
  'Qwen/Qwen-Image-2512': {
    name: '通义千问图像',
    type: 'quality',
    description: '高质量图像生成，细节丰富，适合封面、插画',
    bestFor: ['封面', '插画', '精细', '细节', '艺术', '高质量']
  },
  'Tongyi-MAI/Z-Image-Turbo': {
    name: '通义快速图像',
    type: 'fast',
    description: '快速图像生成，速度优先，适合批量配图',
    bestFor: ['批量', '快速', '简单', '示意图', '流程图', '图标']
  }
};

/**
 * 根据 prompt 内容自动选择最佳模型
 * @param {string} prompt - 图片描述
 * @returns {string} 模型名称
 */
export function selectBestModel(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // 检查是否需要高质量
  const qualityKeywords = ['封面', 'cover', '精细', '细节', '艺术', '高质量', '精美', '插画', '封面图'];
  const fastKeywords = ['示意图', '流程图', '图标', '简单', '批量', '快速'];
  
  const needQuality = qualityKeywords.some(k => lowerPrompt.includes(k));
  const needFast = fastKeywords.some(k => lowerPrompt.includes(k));
  
  if (needQuality && !needFast) {
    return 'Qwen/Qwen-Image-2512';
  } else if (needFast && !needQuality) {
    return 'Tongyi-MAI/Z-Image-Turbo';
  }
  
  // 默认使用高质量模型
  return 'Qwen/Qwen-Image-2512';
}

/**
 * 通过魔搭 API 生成图片
 * @param {string} prompt - 图片描述（支持中英文）
 * @param {string} outputPath - 输出文件路径
 * @param {string} apiKey - ModelScope API Token
 * @param {object} options
 * @param {string} options.model - 模型名（默认自动选择）
 * @param {string} options.size - 图片尺寸（默认 1024x576，16:9）
 * @param {number} options.timeout - 超时毫秒数（默认 300000，5分钟）
 * @param {number} options.pollInterval - 轮询间隔毫秒数（默认 3000）
 * @param {boolean} options.autoSelect - 是否自动选择模型（默认 true）
 * @returns {Promise<string>} 输出路径
 */
export async function generateImage(prompt, outputPath, apiKey, options = {}) {
  const autoSelect = options.autoSelect !== false;
  const model = options.model || (autoSelect ? selectBestModel(prompt) : 'Qwen/Qwen-Image-2512');
  const size = options.size || '1024x576';
  const timeout = options.timeout || 300000;
  const pollInterval = options.pollInterval || 3000;

  const modelInfo = AVAILABLE_MODELS[model];
  console.log(`  📤 提交魔搭生图任务 [${modelInfo?.name || model}]...`);
  const taskId = await submitTask(prompt, model, size, apiKey);
  console.log(`  ⏳ 任务ID: ${taskId}`);
  
  const imageUrl = await pollTask(taskId, apiKey, timeout, pollInterval);
  console.log('  📥 下载图片...');
  await downloadFile(imageUrl, outputPath);
  return outputPath;
}

function submitTask(prompt, model, size, apiKey) {
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
          reject(new Error(`魔搭提交任务失败: ${data.substring(0, 300)}`));
        } catch { reject(new Error(`魔搭响应解析失败: ${data.substring(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function queryTask(taskId, apiKey) {
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
        catch { reject(new Error(`魔搭任务查询解析失败: ${data.substring(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function pollTask(taskId, apiKey, timeout, interval) {
  const deadline = Date.now() + timeout;
  return new Promise((resolve, reject) => {
    const check = async () => {
      if (Date.now() > deadline) return reject(new Error(`魔搭生图超时 (${timeout/1000}秒)`));
      try {
        const result = await queryTask(taskId, apiKey);
        if (result.task_status === 'SUCCEED') {
          const images = result.output_images;
          if (images?.length) return resolve(images[0]);
          return reject(new Error('魔搭返回成功但没有图片数据'));
        }
        if (result.task_status === 'FAILED') {
          return reject(new Error(`魔搭生图任务失败: ${JSON.stringify(result.errors || result)}`));
        }
        // 继续等待
        process.stdout.write('.');
        setTimeout(check, interval);
      } catch (e) { reject(e); }
    };
    setTimeout(check, interval);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`下载图片失败，状态码: ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
      stream.on('error', reject);
    }).on('error', reject);
  });
}