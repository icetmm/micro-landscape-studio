"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
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

export function StudioWorkspace({ projectId }: StudioWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeProject = useActiveProject();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raycastFnRef = useRef<((clientX: number, clientY: number) => THREE.Vector3 | null) | null>(null);
  const draggedAsset = useRef<LibraryAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  const handleUploadFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;

    const createdAssets: LibraryAsset[] = Array.from(files).map((file) => ({
      id: `upload-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name.replace(/\.[^.]+$/, ""),
      category: "uploaded",
      kind: "upload-plane",
      color: "#ffffff",
      accent: "#efe9da",
      scale: 0.95,
      previewUrl: URL.createObjectURL(file),
    }));

    addUploadedAssets(createdAssets);
  }, [addUploadedAssets]);

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
      <div className="mx-auto grid max-w-[1600px] items-stretch gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
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
        />

        <main className="flex h-full flex-col gap-4 rounded-[40px] border border-white/45 bg-white/30 p-4 shadow-[0_40px_120px_rgba(17,20,31,0.12)] backdrop-blur-[22px]">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-[32px] border border-white/45 bg-white/58 p-5 shadow-[0_22px_54px_rgba(17,20,31,0.08)] md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-800 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Creative Studio</p>
                <h1 className="mt-1 text-3xl font-semibold text-zinc-900">{activeProject.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600">{currentSeason?.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/70 bg-white/68 px-4 py-2 text-xs text-zinc-600">
                背景联动: {activeProject.backgroundLabel}
              </div>
              <div className="rounded-full border border-white/70 bg-white/68 px-4 py-2 text-xs text-zinc-600">
                容器: {containerLabel(activeProject.container)}
              </div>
              <div className="rounded-full border border-white/70 bg-white/68 px-4 py-2 text-xs text-zinc-600">
                主题: {activeProject.themeMode === "dark" ? "深色" : "浅色"}
              </div>
            </div>
          </motion.header>

          <section className="flex flex-1 flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-1 flex-col rounded-[36px] border border-white/45 bg-white/34 p-4 shadow-[0_30px_72px_rgba(17,20,31,0.1)] backdrop-blur-2xl"
            >
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDropAsset(event.clientX, event.clientY, event.currentTarget);
                }}
                className="relative min-h-[460px] w-full flex-1"
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

                <div className="pointer-events-none absolute right-6 top-6 flex">
                  <button
                    type="button"
                    onClick={handleExport}
                    title="保存图片"
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-md bg-white/70 text-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/50 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/85 active:scale-95"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>

                <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between">
                  <div className="rounded-full border border-white/55 bg-black/35 px-4 py-2 text-xs text-white/90 backdrop-blur">
                    左右拖动旋转，滚轮缩放
                  </div>
                </div>
                <AnimatePresence>
                  {toastMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, y: -20, x: "-50%" }}
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-black/70 px-6 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md"
                    >
                      {toastMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>
        </main>

        <aside className="flex h-full flex-col self-start">
          <div className="custom-scrollbar overflow-y-auto rounded-[40px] border border-white/45 bg-white/52 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
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
            />
          </div>
        </aside>

        <StudioAssetBrowser
          libraryAssets={libraryAssets}
          uploadedAssets={uploadedAssets}
          onUploadFiles={handleUploadFiles}
          onDragAsset={(asset) => {
            draggedAsset.current = asset;
          }}
        />
      </div>
    </div>
  );
}
