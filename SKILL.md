---
name: qianxu-formatter
description: 千序一键发布工具。排版 + 配图 + 发布，三合一。专为「千序 AI 笔记」设计，果核风格排版，无水印高质量配图。
trigger: 当用户要求"发布文章"、"排版发布"、"一键发布"、"千序风格"时触发
---

# 千序一键发布工具

专为「千序 AI 笔记」设计的微信公众号发布工具，整合**排版 + 配图 + 发布**于一体。

## 核心特点

✅ **果核风格排版** — 黄色荧光笔高亮、渐变标题、简洁代码块  
✅ **无水印配图** — 魔塔/Gemini 智能生图，高质量美观  
✅ **一键发布** — 直接发布到微信公众号草稿箱  
✅ **手机端优化** — 段落适中，阅读舒适

## 快速使用

### 一键发布

```bash
node scripts/publish.mjs article.md --title "文章标题"
```

### 仅排版预览

```bash
node scripts/publish.mjs article.md --dry-run
```

### 不生成封面

```bash
node scripts/publish.mjs article.md --no-cover
```

## 配置

### 1. 非敏感配置（config.json）

主题、样式等配置，可提交 Git：

```json
{
  "author": "千序",
  "defaultTheme": "orange",
  "themes": {
    "orange": {
      "name": "果核橙",
      "primaryColor": "#FF6600"
    }
  }
}
```

### 2. 敏感配置（.env）

API 密钥等敏感信息，**不要提交到 Git**：

```env
# 微信公众号配置
WECHAT_APP_ID=你的 appid
WECHAT_APP_SECRET=你的 appsecret

# 魔塔社区 API（图片生成）
MODELSCOPE_API_KEY=你的 apikey

# Gemini API（备选）
GEMINI_API_KEY=你的 apikey
```

## 工作流程

```
1. 读取 Markdown 文章
      ↓
2. 分析标题生成配图描述
      ↓
3. 调用魔塔生图（无水印高质量）
      ↓
4. 果核风格排版
      ↓
5. 上传封面到微信
      ↓
6. 创建草稿
      ↓
7. 返回 Media ID
```

## 排版样式

### 关键词高亮
普通文字中的 **关键词** → 黄色荧光笔效果

### 标题
- H1：居中大标题（22px）
- H2：蓝紫渐变背景 + 白字（18px）
- H3：左侧彩边（17px）

### 代码块
```javascript
const hello = "千序";
```
显示为：绿色语言标签 + 黑色代码区

### 引用块
> 浅灰背景 + 左侧蓝紫边

## 配图要求

- ✅ 无水印
- ✅ 高质量
- ✅ 美观
- ✅ 符合文章内容

**生图优先级**：魔塔（国内直连）→ Gemini（备选）

## 命令参数

| 参数 | 说明 |
|------|------|
| `--title <title>` | 文章标题 |
| `--author <author>` | 作者名（默认：千序） |
| `--theme <theme>` | 排版主题：guohe(果核) / moyu(墨玉绿) |
| `--no-cover` | 不生成封面 |
| `--dry-run` | 只排版不发布 |

## 示例

### 完整流程

```bash
# 准备文章
cat > article.md << 'EOF'
# GPT-5.4 发布了！

今天 OpenAI 发布了 GPT-5.4...

## 核心功能

- 支持 **100 万上下文**
- 有状态 AI

> 这是一个重大突破

\`\`\`python
print("Hello, GPT-5.4!")
\`\`\`
EOF

# 一键发布
node scripts/publish.mjs article.md --title "GPT-5.4 发布了！" --author "千序"
```

### 输出

```
🎨 主题：果核
📖 读取文章...
📝 标题：GPT-5.4 发布了！
🎨 生成封面图...
  📤 提交魔搭生图任务 [通义千问图像]...
  ⏳ 任务 ID: xxxxx
✅ 配图生成成功
✨ 排版中...
✅ 排版完成：output/article.html
📤 发布到微信...
  ✅ 获取 token 成功
  ✅ 封面上传成功
📷 发现 0 张内容图片

🎉 发布成功！
📄 草稿 Media ID: xxx
🔗 后台：https://mp.weixin.qq.com
```

## 文件结构

```
qianxu-formatter/
├── SKILL.md              # 本文件
├── README.md             # 详细文档
├── scripts/
│   ├── publish.mjs       # 一键发布（主脚本）
│   ├── formatter.mjs     # 果核橙排版器
│   ├── formatter-moyu.mjs # 墨玉绿排版器
│   └── modelscope-imagegen.mjs  # 魔塔图片生成
├── config.json           # 非敏感配置
├── .env                  # 敏感配置（不提交 Git）
├── .env.example          # 配置模板
└── .gitignore            # Git 忽略规则
```

## 注意事项

1. **首次使用**：复制 `.env.example` 为 `.env` 并填入真实密钥
2. **配图生成**：魔塔国内直连，Gemini 需代理
3. **发布后**：登录公众号后台预览确认
4. **封面要求**：1024x576，无水印
5. **敏感信息**：`.env` 文件不要提交到 Git

## 相关文档

- `README.md` - 详细使用说明
- `.env.example` - 配置模板

## License

MIT
