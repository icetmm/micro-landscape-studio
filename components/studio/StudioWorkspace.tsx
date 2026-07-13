"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { SceneCanvas } from "@/components/studio/SceneCanvas";
import { StudioAssetBrowser } from "@/components/studio/StudioAssetBrowser";
import { StudioControls } from "@/components/studio/StudioControls";
import { StudioSidebar } from "@/components/studio/StudioSidebar";
import { defaultProjects, seasons } from "@/lib/data/studio-presets";
import { clampToContainer, getContainerFloorY } from "@/lib/studio-geometry";
import type { LibraryAsset, SeasonKey } from "@/lib/types";
import { useActiveProject, useStudioStore } from "@/store/useStudioStore";

interface StudioWorkspaceProps {
  projectId: string;
}

function seasonProjectId(season: SeasonKey) {
  return defaultProjects.find((project) => project.templateSeason === season)?.id ?? "spring-awakening";
}

function containerLabel(container: string) {
  if (container === "jar") return "玻璃瓶";
  if (container === "cuboid") return "长方体";
  if (container === "sphere") return "球体";
  return "半开放台座";
}

function UploadPromptDialog({
  fileName,
  defaultName,
  onResolve,
}: {
  fileName: string;
  defaultName: string;
  onResolve: (name: string | null) => void;
}) {
  const [value, setValue] = useState(defaultName);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-[400px] rounded-[24px] border border-white/45 bg-white/80 p-6 shadow-2xl backdrop-blur-xl"
      >
        <h3 className="mb-2 text-lg font-semibold text-zinc-900">
          为上传的文件命名
        </h3>
        <p className="mb-4 truncate text-sm text-zinc-500" title={fileName}>
          {fileName}
        </p>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onResolve(value);
            } else if (e.key === "Escape") {
              onResolve(null);
            }
          }}
          className="mb-6 w-full rounded-[12px] border border-white/60 bg-white/50 px-4 py-2.5 text-sm text-zinc-900 outline-none ring-2 ring-transparent transition-all focus:border-zinc-300 focus:bg-white focus:ring-zinc-100"
          onFocus={(e) => e.target.select()}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onResolve(null)}
            className="rounded-[12px] px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5"
          >
            取消
          </button>
          <button
            onClick={() => onResolve(value)}
            className="rounded-[12px] bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            确定
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { classifyUploadFile } from "@/lib/studio-upload";

export function StudioWorkspace({ projectId }: StudioWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeProject = useActiveProject();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raycastFnRef = useRef<((clientX: number, clientY: number) => THREE.Vector3 | null) | null>(null);
  const draggedAsset = useRef<LibraryAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadPrompt, setUploadPrompt] = useState<{
    file: File;
    defaultName: string;
    resolve: (name: string | null) => void;
  } | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [transformSpace, setTransformSpace] = useState<"local" | "world">("local");
  const [snapEnabled, setSnapEnabled] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  const {
    projects,
    libraryAssets,
    uploadedAssets,
    activeProjectId,
    selectedItemId,
    light,
    canUndo,
    openProject,
    createProject,
    cloneProject,
    deleteProject,
    setThemeMode,
    setSeason,
    setContainer,
    setLight,
    addItemFromAsset,
    removeSelectedItem,
    resetItemTransform,
    undoLastChange,
    setSelectedItemId,
    addUploadedAssets,
  } = useStudioStore();

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    undoLastChange();
    showToast("已撤销上一步");
  }, [canUndo, undoLastChange, showToast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
      if (isUndo) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedItemId && !activeProject.readOnly) {
        removeSelectedItem();
        showToast("已删除模型");
      }
    };

    const handleStudioToast = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("studio-toast", handleStudioToast);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("studio-toast", handleStudioToast);
    };
  }, [activeProject.readOnly, handleUndo, removeSelectedItem, selectedItemId, showToast]);

  useEffect(() => {
    const template = searchParams.get("template") as SeasonKey | null;
    const target =
      projects.find((entry) => entry.id === projectId)?.id ??
      (template ? seasonProjectId(template) : undefined) ??
      activeProjectId;

    if (target !== activeProjectId) {
      openProject(target);
    }
  }, [activeProjectId, openProject, projectId, projects, searchParams]);

  const currentSeason = useMemo(
    () => seasons.find((entry) => entry.key === activeProject.templateSeason),
    [activeProject.templateSeason],
  );

  const handleCreateProject = useCallback((title: string, icon: string) => {
    const id = createProject(activeProject.templateSeason, activeProject.container, title, icon);
    router.push(`/studio/${id}`);
  }, [activeProject.container, activeProject.templateSeason, createProject, router]);

  const handleCloneProject = useCallback((targetId: string) => {
    const nextId = cloneProject(targetId);
    if (nextId) {
      router.push(`/studio/${nextId}`);
    }
  }, [cloneProject, router]);

  const handleDeleteProject = useCallback((targetId: string) => {
    deleteProject(targetId);
  }, [deleteProject]);

  const handleUpdateProjectTitle = useCallback((targetId: string, title: string) => {
    useStudioStore.getState().updateProjectTitle(targetId, title);
  }, []);

  const handleUpdateProjectIcon = useCallback((targetId: string, icon: string) => {
    useStudioStore.getState().updateProjectIcon(targetId, icon);
  }, []);

  const handleUploadFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;

    let successCount = 0;
    let skipCount = 0;
    const createdAssets: LibraryAsset[] = [];

    for (const file of Array.from(files)) {
      const defaultName = file.name.replace(/\.[^.]+$/, "");
      
      const customName = await new Promise<string | null>((resolve) => {
        setUploadPrompt({ file, defaultName, resolve });
      });

      setUploadPrompt(null);

      if (customName === null) {
        // 用户取消了当前文件的上传
        continue;
      }

      const asset = classifyUploadFile(file, customName || defaultName);
      if (asset) {
        createdAssets.push(asset);
        successCount++;
      } else {
        skipCount++;
      }
    }

    if (createdAssets.length > 0) {
      addUploadedAssets(createdAssets);
    }

    if (skipCount > 0) {
      showToast(`已添加 ${successCount} 个文件，跳过了 ${skipCount} 个不支持的文件`);
    } else if (successCount > 0) {
      showToast(`成功添加 ${successCount} 个文件`);
    }
  }, [addUploadedAssets, showToast]);

  const handleDropAsset = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    if (!draggedAsset.current) return;

    if (activeProject.readOnly) {
      showToast("默认景观不可编辑，请先复制");
      return;
    }

    let finalX = 0;
    let finalZ = 0;

    if (raycastFnRef.current) {
      const point = raycastFnRef.current(clientX, clientY);
      if (point) {
        finalX = point.x;
        finalZ = point.z;
      }
    } else {
      const rect = element.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      finalX = ndcX * 2.5;
      finalZ = -ndcY * 2.5 + 0.5;
    }

    const clamped = clampToContainer(activeProject.container, finalX, finalZ);
    if (clamped.clamped) {
      showToast("已限制在容器范围内");
    }

    addItemFromAsset(draggedAsset.current, [clamped.x, getContainerFloorY(activeProject.container), clamped.z]);
  }, [activeProject.container, activeProject.readOnly, addItemFromAsset, showToast]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${activeProject.title || "micro-landscape"}.png`;
    link.click();
  }, [activeProject.title]);

  const handleReset = useCallback(() => {
    if (!selectedItemId) return;
    if (activeProject.readOnly) {
      showToast("默认景观不可编辑，请先复制");
      return;
    }

    resetItemTransform(selectedItemId);
    showToast("已还原位置、方向和大小");
  }, [activeProject.readOnly, resetItemTransform, selectedItemId, showToast]);

  const handleDelete = useCallback(() => {
    if (!selectedItemId) return;
    if (activeProject.readOnly) {
      showToast("默认景观不可编辑，请先复制");
      return;
    }

    removeSelectedItem();
    showToast("已删除模型");
  }, [activeProject.readOnly, removeSelectedItem, selectedItemId, showToast]);

  return (
    <div
      className="min-h-screen px-4 py-4 md:px-6 md:py-6"
      style={{
        background: `radial-gradient(circle at 20% 18%, ${currentSeason?.background.glow}, transparent 24%),
          radial-gradient(circle at 80% 12%, rgba(255,255,255,0.56), transparent 20%),
          linear-gradient(135deg, ${currentSeason?.background.primary}, ${currentSeason?.background.secondary})`,
      }}
    >
      <div className="mx-auto grid max-w-[1700px] h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] items-stretch gap-5 xl:grid-cols-[340px_minmax(0,1fr)_340px]">
        <StudioSidebar
          activeProjectId={activeProjectId}
          activeProject={activeProject}
          projects={projects}
          onOpenProject={(id) => {
            openProject(id);
            router.push(`/studio/${id}`);
          }}
          onCreateProject={handleCreateProject}
          onCloneProject={handleCloneProject}
          onDeleteProject={handleDeleteProject}
          onUpdateProjectTitle={handleUpdateProjectTitle}
          onUpdateProjectIcon={handleUpdateProjectIcon}
        />

        <div className="flex min-w-0 flex-col gap-4 h-full">
          <main className="flex flex-1 flex-col gap-3 rounded-[40px] border border-white/45 bg-white/30 p-4 shadow-[0_40px_120px_rgba(17,20,31,0.12)] backdrop-blur-[22px]">
            <header className="flex shrink-0 items-center justify-between gap-4 rounded-[24px] border border-white/50 bg-white/44 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                title="返回主页"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60 text-zinc-700 transition-all hover:bg-white hover:text-zinc-950 shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500">CREATIVE STUDIO</h1>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xl leading-none">
                    {activeProject.icon || currentSeason?.emoji}
                  </span>
                  <h2 className="text-lg font-semibold text-zinc-900">{activeProject.title}</h2>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-white/60 border border-white/40 px-4 py-2 text-xs font-medium text-zinc-600 backdrop-blur-md">
                <span>容器: {containerLabel(activeProject.container)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/60 border border-white/40 px-4 py-2 text-xs font-medium text-zinc-600 backdrop-blur-md">
                <span>主题: {activeProject.themeMode === "dark" ? "深色" : "浅色"}</span>
              </div>
            </div>
          </header>

          <section className="flex flex-1 flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex flex-1 flex-col overflow-hidden rounded-[36px] border border-white/45 bg-white/34 p-0 shadow-[0_30px_72px_rgba(17,20,31,0.1)] backdrop-blur-2xl"
            >
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDropAsset(event.clientX, event.clientY, event.currentTarget);
                }}
                className="absolute inset-0"
              >
                <SceneCanvas
                  season={activeProject.templateSeason}
                  container={activeProject.container}
                  themeMode={activeProject.themeMode}
                  light={light}
                  items={activeProject.items}
                  selectedItemId={selectedItemId}
                  onSelect={setSelectedItemId}
                  onCanvasReady={(canvas) => {
                    canvasRef.current = canvas;
                  }}
                  onRaycastReady={(fn) => {
                    raycastFnRef.current = fn;
                  }}
                  transformMode={transformMode}
                  transformSpace={transformSpace}
                  snapEnabled={snapEnabled}
                />

                <AnimatePresence>
                  {toastMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: "-60%", x: "-50%" }}
                      animate={{ opacity: 1, y: "-50%", x: "-50%" }}
                      exit={{ opacity: 0, y: "-60%", x: "-50%" }}
                      className="pointer-events-none absolute left-1/2 top-1/2 rounded-[20px] bg-black/70 px-6 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md"
                    >
                      {toastMessage}
                    </motion.div>
                  )}
                  {uploadPrompt && (
                    <UploadPromptDialog
                      key="upload-prompt"
                      fileName={uploadPrompt.file.name}
                      defaultName={uploadPrompt.defaultName}
                      onResolve={uploadPrompt.resolve}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>
        </main>

        <StudioAssetBrowser
            libraryAssets={libraryAssets}
            uploadedAssets={uploadedAssets}
            onUploadFiles={handleUploadFiles}
            onDragAsset={(asset) => {
              draggedAsset.current = asset;
            }}
          />
        </div>

        <aside className="flex h-full flex-col">
          <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto rounded-[32px] border border-white/45 bg-white/52 p-3 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
            <StudioControls
              themeMode={activeProject.themeMode}
              light={light}
              canEdit={!activeProject.readOnly}
              hasSelection={!!selectedItemId}
              canUndo={canUndo}
              activeSeason={activeProject.templateSeason}
              activeContainer={activeProject.container}
              onThemeChange={(mode) => setThemeMode(mode)}
              onLightChange={(nextLight) => setLight(nextLight)}
              onSetSeason={(season) => setSeason(season)}
              onSetContainer={(container) => setContainer(container)}
              transformMode={transformMode}
              onTransformModeChange={setTransformMode}
              transformSpace={transformSpace}
              onTransformSpaceChange={setTransformSpace}
              snapEnabled={snapEnabled}
              onSnapChange={setSnapEnabled}
              onReset={handleReset}
              onDelete={handleDelete}
              onUndo={handleUndo}
              onExport={handleExport}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
