# LOVE TALK v3.0

一个私密的模拟聊天网页应用。你可以创建多个对话对象，每个对象拥有独立的昵称、状态和回复词库。发送消息后，系统会从当前对象的词库中智能随机抽取词条进行回复，模拟真实的日常对话体验。

v3.0 新增完整的后端系统：用户注册/登录、数据云端存储与同步。

![LOVE TALK Preview](https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop)

## 功能特点

- **多对话对象** - 创建多个对话对象，每个对象独立管理
- **智能回复** - 从词库中随机抽取 1~3 条词条自动回复，带同义表达随机选择
- **100条预设词条** - 涵盖早安问候、晚安睡前、关心体贴、撒娇可爱、表达爱意、日常分享、小情绪安慰、暧昧调情 8 大分类
- **自定义词库** - 逐条添加或批量导入专属词条（支持 `/` 分隔同义表达）
- **"帮我确认"系统** - 发送包含"帮我确认"的消息，选择类别后从对应词库随机回复
- **反应时间调节** - 15~60秒可选，模拟真实回复节奏
- **用户注册/登录** - 支持云端数据同步
- **数据云端存储** - 登录后数据自动同步到 PostgreSQL 数据库
- **本地模式** - 未登录时所有数据通过 localStorage 本地存储，不上传任何服务器

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- React Router

### 后端
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT 认证 (Access Token + Refresh Token)
- bcrypt 密码哈希

### 部署
- Vercel (前端 + 后端 API Serverless Functions)
- 外部 PostgreSQL 数据库 (Neon / Supabase / Railway)

## 项目结构

```
love-talk/
├── api/
│   └── index.ts              # Vercel Serverless Functions 入口
├── server/
│   ├── app.ts                # Express 应用定义
│   ├── routes/
│   │   ├── auth.ts           # 认证路由 (注册/登录/刷新/登出)
│   │   └── contacts.ts       # 联系人 CRUD 路由
│   ├── middleware/
│   │   ├── auth.ts           # JWT 验证中间件
│   │   └── error.ts          # 错误处理中间件
│   └── lib/
│       └── prisma.ts         # Prisma Client 单例
├── prisma/
│   └── schema.prisma         # 数据库模型定义
├── src/                      # 前端 React 代码
│   ├── pages/
│   │   ├── Home.tsx          # 主聊天页面
│   │   └── Login.tsx         # 登录/注册页面
│   ├── hooks/
│   │   ├── useAuth.ts        # 认证状态管理
│   │   └── useChat.ts        # 聊天逻辑 + 数据同步
│   └── services/
│       └── api.ts            # API 客户端 (fetch + 自动刷新)
├── package.json
├── vercel.json               # Vercel 部署配置
└── .env.example              # 环境变量示例
```

## 本地开发

### 1. 克隆仓库并安装依赖

```bash
git clone https://github.com/yourusername/love-talk.git
cd love-talk
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# PostgreSQL 数据库连接字符串
DATABASE_URL=postgresql://user:password@localhost:5432/lovetalk

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters-long

# 环境
NODE_ENV=development
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库迁移
npx prisma migrate dev --name init

# 可选：打开 Prisma Studio 查看数据库
npx prisma studio
```

### 4. 启动开发服务器

```bash
# 前端开发服务器
npm run dev
```

前端默认在 `http://localhost:3000` 启动。

后端 API 在开发模式下通过 Vercel CLI 或 `vercel dev` 运行，但也可以直接运行（需要确保 `api/index.ts` 被正确加载）。

## 部署到 Vercel

### 1. 准备数据库

在部署前，你需要准备一个 PostgreSQL 数据库。推荐免费方案：

- **[Neon](https://neon.tech)** - 免费 PostgreSQL 托管，与 Vercel 集成良好
- **[Supabase](https://supabase.com)** - 免费 PostgreSQL 数据库
- **[Railway](https://railway.app)** - 免费 PostgreSQL 数据库

创建数据库后，获取连接字符串（`postgresql://...`）。

### 2. 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit: LOVE TALK v3.0"
git remote add origin https://github.com/yourusername/love-talk.git
git push -u origin main
```

### 3. 在 Vercel 上部署

1. 登录 [Vercel](https://vercel.com)，点击 **New Project**
2. 导入你的 GitHub 仓库
3. 框架预设选择 **Vite**
4. 在 **Environment Variables** 中添加：
   - `DATABASE_URL` = 你的 PostgreSQL 连接字符串
   - `JWT_SECRET` = 一个随机长字符串（至少 32 位）
   - `JWT_REFRESH_SECRET` = 另一个随机长字符串（至少 32 位）
   - `NODE_ENV` = `production`
5. 点击 **Deploy**

Vercel 会自动运行 `npm run vercel-build`（包含 `prisma generate && prisma migrate deploy && vite build`），构建前端并部署后端 API。

### 4. 配置自定义域名 (lovetalk.cyou)

1. 在 Vercel 项目控制台，点击 **Settings** → **Domains**
2. 输入你的域名 `lovetalk.cyou`，点击 **Add**
3. 根据 Vercel 提示，在你的域名 DNS 提供商处添加 **A 记录**或 **CNAME 记录**：
   - **A 记录**：`@` → `76.76.21.21`（Vercel 的 IP，以控制台显示为准）
   - **CNAME 记录**：`www` → `cname.vercel-dns.com`
4. 等待 DNS 生效（通常几分钟到几小时）
5. 在 Vercel 控制台确认域名状态变为 **Valid**

### 5. 更新 CORS 配置（生产环境）

部署后，编辑 `server/app.ts` 中的 CORS `origin` 配置，确保包含你的实际域名：

```typescript
origin: [
  'https://lovetalk.cyou',
  'https://www.lovetalk.cyou',
  'https://your-project.vercel.app'
]
```

修改后推送到 GitHub，Vercel 会自动重新部署。

## API 接口

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/health` | GET | 否 | 健康检查 |
| `/api/auth/register` | POST | 否 | 用户注册 |
| `/api/auth/login` | POST | 否 | 用户登录 |
| `/api/auth/me` | GET | 是 | 获取当前用户 |
| `/api/auth/refresh` | POST | 否 | 刷新 Access Token |
| `/api/auth/logout` | POST | 否 | 登出 |
| `/api/contacts` | GET | 是 | 获取所有联系人 |
| `/api/contacts` | POST | 是 | 创建联系人 |
| `/api/contacts/:id` | PUT | 是 | 更新联系人 |
| `/api/contacts/:id` | DELETE | 是 | 删除联系人 |

## 安全说明

- 密码使用 bcrypt (cost=12) 哈希存储
- JWT Access Token 有效期 15 分钟
- JWT Refresh Token 有效期 7 天，存储在 httpOnly Cookie 中
- 前端支持 401 自动刷新并重试请求
- 未登录时数据仅存储在浏览器 localStorage，绝对隐私

## 本地模式 vs 云端模式

| 模式 | 数据存储 | 多设备同步 | 数据持久性 |
|------|----------|-----------|-----------|
| 本地模式（未登录） | localStorage | ❌ | 清除浏览器数据会丢失 |
| 云端模式（已登录） | PostgreSQL | ✅ | 永久保存 |

你可以随时切换：登录后本地数据不会自动上传，需要手动重新创建联系人；云端数据在登录后会自动加载。

## License

MIT
