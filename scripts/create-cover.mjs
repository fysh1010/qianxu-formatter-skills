/**
 * 创建简单的纯文字封面图
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 创建一个简单的 SVG 封面，然后转为 base64 PNG
function createSimpleCover(title, outputPath) {
  // 简单的渐变背景 SVG
  const svg = `<svg width="900" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669"/>
      <stop offset="100%" style="stop-color:#10B981"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="450" y="220" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle">AI 周报</text>
  <text x="450" y="290" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="28" fill="rgba(255,255,255,0.9)" text-anchor="middle">GPT-5.4 vs Claude 4.6</text>
  <text x="450" y="340" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="28" fill="rgba(255,255,255,0.9)" text-anchor="middle">人形机器人杀入万元时代</text>
  <text x="450" y="420" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="18" fill="rgba(255,255,255,0.7)" text-anchor="middle">千序AI笔记</text>
</svg>`;
  
  // 保存 SVG
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svg, 'utf-8');
  
  console.log(`✅ SVG 封面已创建: ${svgPath}`);
  console.log('💡 请使用在线工具将 SVG 转为 PNG，或直接使用 SVG');
  
  return svgPath;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const title = args[0] || 'AI 周报';
  const outputPath = args[1] || './cover.svg';
  
  createSimpleCover(title, outputPath);
}

main();
