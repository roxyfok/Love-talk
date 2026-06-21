# LOVE TALK v3.0 Fullstack Plan

## 目标
为 LOVE TALK 前端项目添加 Node.js + Express + PostgreSQL + Prisma 后端，并配置 Vercel 全栈部署。

## 架构
- **前端**: React 18 + Vite + TypeScript + Tailwind CSS (已有)
- **后端**: Node.js + Express + Prisma ORM + PostgreSQL
- **认证**: JWT (access token 15min + refresh token 7days httpOnly cookie)
- **部署**: Vercel (前端静态 + 后端 Serverless Functions via `api/` dir)
- **数据库**: 外部 PostgreSQL (Neon/Supabase/Railway，由用户配置 DATABASE_URL)

## 项目结构
```
love-talk/
├── api/index.ts              # Vercel Serverless entry (serverless-http adapter)
├── server/
│   ├── app.ts               # Express app definition
│   ├── routes/
│   │   ├── auth.ts          # /api/auth/* (register, login, me, refresh)
│   │   └── contacts.ts      # /api/contacts/* (CRUD)
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification middleware
│   │   └── error.ts         # Error handling middleware
│   └── lib/
│       └── prisma.ts        # Prisma client singleton
├── prisma/
│   └── schema.prisma        # Data models
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts       # Auth state + API calls
│   │   └── useChat.ts       # Modify: sync with backend
│   ├── services/
│   │   └── api.ts           # Axios/fetch API client with interceptors
│   ├── pages/
│   │   ├── Home.tsx         # Modify: add auth UI
│   │   └── Login.tsx        # New: login/register page
│   └── App.tsx              # Modify: add auth routing
├── package.json             # Update: add backend deps
├── vercel.json              # Update: fullstack routes
└── .env.example
```

## 后端 API 设计
| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| /api/auth/register | POST | 否 | 注册 |
| /api/auth/login | POST | 否 | 登录 |
| /api/auth/me | GET | 是 | 获取当前用户 |
| /api/auth/refresh | POST | 否(需refresh cookie) | 刷新 token |
| /api/auth/logout | POST | 否 | 清除 cookie |
| /api/contacts | GET | 是 | 获取所有联系人 |
| /api/contacts | POST | 是 | 创建联系人 |
| /api/contacts/:id | PUT | 是 | 更新联系人 |
| /api/contacts/:id | DELETE | 是 | 删除联系人 |

## 前端修改要点
1. 创建 `useAuth` hook：管理登录状态、token、自动刷新
2. 创建 `api.ts` 服务层：封装 fetch/axios，处理 401 自动刷新
3. 创建 `Login.tsx` 页面：登录/注册表单
4. 修改 `App.tsx`：添加 `/login` 路由和认证路由守卫
5. 修改 `useChat.ts`：当用户登录时，从后端加载/同步数据；未登录时保持 localStorage
6. 修改 `Home.tsx`：添加登录状态显示、登出按钮

## 部署配置
- Vercel: 前端 SPA + API Serverless Functions
- 域名: lovetalk.cyou (用户已购买)
- 环境变量: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

## 实施顺序
1. 创建后端基础 (Prisma schema, Express app, routes, middleware)
2. 更新 package.json 添加依赖
3. 修改前端添加认证和 API 集成
4. 更新 vercel.json 和部署配置
5. 创建 README 部署文档
