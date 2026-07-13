# Micro Landscape · 3D 微观景象创作平台

一款面向大众创作者的沉浸式 Web 3D 微景观创作工具。用户可以在玻不同容器中搭建四季微缩景观，拖入预置素材或上传 GLB 模型 / 图片，调整构图，最终导出作品。

## 核心特性

- **四季默认景观**：春之苏醒、夏日绿洲、秋色物语、冬日静谧，每套模板自带背景联动与配色方案。
- **多容器体系**：玻璃瓶 / 长方体 / 球体 / 半开放台座，自动适配内部裁切范围与相机构图。
- **3D 编辑器**：基于 React Three Fiber 的视口，支持旋转、缩放、点击选中、拖拽变换、容器边界约束。
- **素材库**：内置植物、石块、建筑、动物、地表等分类的预置 3D 模型（GLB）。
- **素材上传**：支持上传 `.glb` / `.gltf` 模型与 `png` / `jpg` / `webp` 等图片，自动分类为可拖入元素。
- **主题**：浅色 / 深色模式切换。
- **项目管理**：默认模板只读、可复制为副本；自建项目支持重命名、删除、继续编辑。
- **撤销重做**：基于 Zustand 的 30 步历史栈。
- **本地持久化**：通过 `zustand/persist` 将自定义项目存入 localStorage（上传的 Blob URL 不持久化，避免刷新失效）。
- **分享与导出**：支持 PNG 高清导出（依赖 `preserveDrawingBuffer`）。
- **Draco 本地解码**：压缩 GLB 通过 `/draco/` 本地路径解码，规避国内 CDN 访问问题。

## 技术栈

| 分类    | 技术                                                                           |
| ----- | ---------------------------------------------------------------------------- |
| 框架    | Next.js 16（App Router）+ React 19 + TypeScript                                |
| 3D 引擎 | three + @react-three/fiber + @react-three/drei + @react-three/postprocessing |
| 状态管理  | Zustand（含 persist 中间件）                                                       |
| 样式    | Tailwind CSS v4 + CSS Variables                                              |
| 动效    | Framer Motion                                                                |
| 表单校验  | React Hook Form + Zod                                                        |
| 图标    | lucide-react                                                                 |
| 测试    | Vitest                                                                       |
| 代码规范  | ESLint + TypeScript 严格模式                                                     |

## 快速开始

### 环境要求

- Node.js 18+（推荐 20+）
- npm / pnpm / yarn 任一

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 <http://localhost:3000> 即可进入首页。

### 可用脚本

| 命令              | 说明                       |
| --------------- | ------------------------ |
| `npm run dev`   | 启动开发服务器                  |
| `npm run build` | 生产构建                     |
| `npm run start` | 启动生产服务器                  |
| `npm run lint`  | 运行 ESLint                |
| `npm run check` | TypeScript 类型检查 + ESLint |
| `npm run test`  | 运行 Vitest 单元测试           |

## 项目结构

```
micro-landscape-studio/
├── app/                          # Next.js App Router 路由
│   ├── page.tsx                  # 沉浸式首页
│   ├── auth/page.tsx             # 登录注册页
│   ├── projects/page.tsx         # 我的项目页
│   ├── studio/[projectId]/page.tsx  # 创作工作台
│   ├── share/[token]/page.tsx    # 只读分享页
│   ├── api/
│   │   ├── templates/route.ts    # 默认模板接口
│   │   └── shares/route.ts       # 分享链接接口
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── landing/                  # 首页沉浸式入口
│   ├── studio/                   # 工作台核心组件
│   │   ├── StudioWorkspace.tsx   # 工作台容器
│   │   ├── SceneCanvas.tsx       # 3D 视口
│   │   ├── SceneItems.tsx        # 场景元素渲染与变换
│   │   ├── ContainerShell.tsx    # 容器外壳
│   │   ├── StudioSidebar.tsx     # 左侧场景/项目面板
│   │   ├── StudioAssetBrowser.tsx # 素材库面板
│   │   ├── StudioControls.tsx    # 工具栏与灯光控制
│   │   └── NewProjectModal.tsx   # 新建项目弹窗
│   ├── projects/                 # 项目列表
│   ├── share/                    # 分享预览
│   └── auth/                     # 认证展示
├── lib/
│   ├── types.ts                  # 全局类型定义
│   ├── studio-geometry.ts        # 容器几何 / 边界约束
│   ├── studio-upload.ts          # 上传文件分类
│   ├── data/studio-presets.ts    # 四季模板、容器、素材库预设
│   └── utils/share.ts            # 分享编解码工具
├── store/useStudioStore.ts       # Zustand 全局状态
├── public/
│   ├── assets/models/            # 预置 GLB 模型
│   └── draco/                    # 本地 Draco 解码器
└── tests/                        # Vitest 单元测试
```

## 路由说明

| 路由                    | 用途                       |
| --------------------- | ------------------------ |
| `/`                   | 沉浸式首页，展示入场动画、四季景观入口与容器预览 |
| `/auth`               | 登录、注册、账号恢复               |
| `/studio/[projectId]` | 创作工作台，3D 编辑主界面           |
| `/projects`           | 我的项目页，管理云端与本地项目          |
| `/share/[token]`      | 只读分享页，公开展示作品             |

## 核心概念

### 容器（Container）

| 类型    | key        | 用途             |
| ----- | ---------- | -------------- |
| 玻璃瓶   | `jar`      | 经典陈列型，折射与展示感最强 |
| 长方体   | `cuboid`   | 适合横向构图和建筑陈列    |
| 球体    | `sphere`   | 中心聚焦，适合雪景封装    |
| 半开放台座 | `pedestal` | 自由排布的大型创作      |

### 季节（Season）

`spring` / `summer` / `autumn` / `winter`，每个季节有独立的背景配色、主色调与默认模板。

### 项目来源（Source）

- `system`：系统默认模板，只读，不可删除
- `template-copy`：从模板复制而来的副本，可编辑
- `custom`：用户自建项目，可编辑可删除

## 工程约定

- **Draco 解码器**：必须从本地路径 `/draco/` 加载，避免使用 Google CDN 在国内访问超时。
- **3D 模型变换**：使用 TransformControls 拖拽的 group 元素不要显式设置 `position` / `rotation` / `scale` props，否则松手后会被 R3F 的布局效应重置。
- **Canvas 截图**：3D 预览 Canvas 需设置 `gl={{ preserveDrawingBuffer: true }}` 才能调用 `toDataURL()` 导出 PNG。
- **持久化排除**：上传素材产生的 Blob URL 不进入持久化范围，刷新后自动清除，避免引用失效。

## 测试

```bash
npm run test
```

测试覆盖几何约束、预设数据、状态管理与上传分类四个模块。

## 部署

推荐部署到 [Vercel](https://vercel.com/)：

```bash
npm run build
npm run start
```

生产环境需保证 `/public/draco/` 与 `/public/assets/models/` 路径可访问。
