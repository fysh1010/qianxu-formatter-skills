# 千序排版器

微信公众号一键发布工具，支持**果核橙**和**墨玉绿**两种排版主题。

## 快速开始

### 1. 安装依赖

```bash
cd qianxu-formatter-skills
npm install
```

### 2. 配置密钥

复制 `.env.example` 为 `.env` 并填入真实密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 微信公众号配置
WECHAT_APP_ID=你的 appid
WECHAT_APP_SECRET=你的 appsecret

# 魔塔社区 API（图片生成）
MODELSCOPE_API_KEY=你的 apikey

# Gemini API（备选）
GEMINI_API_KEY=你的 apikey
```

### 3. 使用

```bash
# 发布文章（默认果核橙主题）
node scripts/publish.mjs article.md --title "文章标题" --author "作者名"

# 使用墨玉绿主题
node scripts/publish.mjs article.md --theme moyu --title "文章标题"

# 仅排版不发布（预览）
node scripts/publish.mjs article.md --dry-run

# 不生成封面
node scripts/publish.mjs article.md --no-cover
```

## 配置说明

### 非敏感配置（config.json）

- 主题样式
- 颜色配置
- 图片生成参数

### 敏感配置（.env）

- 微信公众号 AppID/AppSecret
- API 密钥（ModelScope、Gemini）

**注意：** `.env` 文件不要提交到 Git！

## 文章格式

```markdown
# 文章标题

> 作者：作者名
> 日期：2026-03-17

## 小标题

正文内容...

![图片描述](图片路径.png)

## 另一个小标题

更多内容...
```

## 目录结构

```
qianxu-formatter/
├── scripts/
│   ├── publish.mjs          # 一键发布主脚本
│   ├── formatter.mjs        # 果核橙排版器
│   ├── formatter-moyu.mjs   # 墨玉绿排版器
│   └── modelscope-imagegen.mjs  # 魔塔图片生成
├── config.json              # 非敏感配置
├── .env                     # 敏感配置（不提交 Git）
├── .env.example             # 配置模板
└── README.md
```

## License

MIT
