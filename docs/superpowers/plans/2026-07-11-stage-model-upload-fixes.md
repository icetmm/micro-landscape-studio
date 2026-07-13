# 舞台模型与上传修复实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复地面露出、钢琴尺寸、GLB 上传识别以及默认模型越出容器的问题。

**Architecture:** 将容器地面和包围盒限制保留在纯几何模块，将文件分类保留在纯上传模块；React Three Fiber 客户端组件只负责测量实际模型并调用纯函数。现有工作区草稿先由回归测试审查，再进行最小修正。

**Tech Stack:** Next.js 16.2.10、React 19、TypeScript、React Three Fiber、Three.js、Zustand、Vitest。

## Global Constraints

- 钢琴视觉尺寸约为原截图三倍，不自动缩小。
- 模型越界时优先向容器中心移动；模型本身过大时居中并提示。
- GLB/GLTF 识别不区分扩展名大小写；图片继续作为平面素材。
- 保留工作区现有未提交改动，不做无关重构。

---

### Task 1: 纯几何边界与地面尺寸

**Files:**
- Modify: `lib/studio-geometry.ts`
- Test: `tests/geometry.test.ts`
- Modify: `components/studio/SceneItems.tsx`

**Interfaces:**
- Produces: `getContainerFloorGeometry(container)` 与 `clampBoundingBoxToContainer(container, minX, maxX, minZ, maxZ, currentX, currentZ)`。

- [ ] **Step 1: 写入/修正失败测试**

覆盖玻璃瓶地面安全半径、长方体四边修正、圆形容器径向修正和超大模型居中。

- [ ] **Step 2: 运行测试确认按预期失败**

Run: `npm test -- tests/geometry.test.ts`
Expected: 至少一个当前边界行为断言失败，而非测试配置错误。

- [ ] **Step 3: 最小修正几何函数与 SeasonalFloor 调用**

让地面尺寸来自纯函数；修正包围盒中心与当前位置不一致时的位移计算，避免把世界坐标误当模型原点。

- [ ] **Step 4: 运行聚焦测试**

Run: `npm test -- tests/geometry.test.ts`
Expected: PASS。

### Task 2: 上传文件分类与拖放数据

**Files:**
- Modify: `lib/studio-upload.ts`
- Test: `tests/upload.test.ts`
- Modify: `components/studio/StudioWorkspace.tsx`
- Modify: `components/studio/StudioAssetBrowser.tsx`
- Modify: `store/useStudioStore.ts`

**Interfaces:**
- Produces: `classifyUploadFile(file: File): LibraryAsset | null`。
- Consumes: `LibraryAsset.kind`, `modelUrl`, `previewUrl`, `sourceType`。

- [ ] **Step 1: 写入/修正失败测试**

覆盖 `.glb`、`.GLB`、`.gltf`、图片、伪造图片 MIME 与不支持文件，并验证 GLB 使用 `modelUrl`。

- [ ] **Step 2: 运行测试确认按预期失败**

Run: `npm test -- tests/upload.test.ts`
Expected: 当前未覆盖的扩展名或 MIME 行为失败。

- [ ] **Step 3: 最小修正分类和上传提示**

仅为支持类型创建 Blob URL；素材栏为三维上传资源提供不依赖图片 URL 的可拖动展示；商店复制完整资源字段。

- [ ] **Step 4: 运行聚焦测试**

Run: `npm test -- tests/upload.test.ts`
Expected: PASS。

### Task 3: 钢琴三倍尺寸与默认模型容器约束

**Files:**
- Modify: `lib/data/studio-presets.ts`
- Test: `tests/presets.test.ts`
- Modify: `components/studio/SceneItems.tsx`

**Interfaces:**
- Consumes: 默认预设 `ProjectItem` 数据与 Task 1 的边界函数。
- Produces: 单一路径有效缩放约 `1.08`，以及加载后模型包围盒回写位置。

- [ ] **Step 1: 写入/修正失败测试**

断言钢琴不存在重复 `scale3`，有效缩放约为旧值 `0.36` 的三倍，并检查每个默认物体具备可重置初始变换。

- [ ] **Step 2: 运行测试确认按预期失败**

Run: `npm test -- tests/presets.test.ts`
Expected: 当前预设中至少一个尺寸或初始变换断言失败。

- [ ] **Step 3: 最小修正预设和加载后约束时机**

保持钢琴三倍尺寸；模型内容加载并更新世界矩阵后测量边界；只在位置确需变化时写回商店，避免渲染循环。

- [ ] **Step 4: 运行聚焦测试**

Run: `npm test -- tests/presets.test.ts`
Expected: PASS。

### Task 4: 完整验证与视觉检查

**Files:**
- Verify only unless检查发现缺陷。

- [ ] **Step 1: 运行完整测试**

Run: `npm test`
Expected: 全部 PASS。

- [ ] **Step 2: 运行类型与 ESLint 检查**

Run: `npm run check`
Expected: exit 0，无错误。

- [ ] **Step 3: 运行生产构建**

Run: `npm run build`
Expected: exit 0。

- [ ] **Step 4: 浏览器验证**

检查玻璃瓶绿地无外露、秋季钢琴约三倍且位于长方体内、默认树木完整位于容器内，以及上传 GLB 后可拖入舞台。
