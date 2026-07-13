"use client";

import {
  LampDesk,
  Layers3,
  MoonStar,
  RotateCcw,
  SunMedium,
  Trash2,
  Undo2,
  Move,
  Rotate3D,
  Scaling,
  Download,
} from "lucide-react";

import { containers, seasons } from "@/lib/data/studio-presets";
import type { ContainerKey, LightSettings, SeasonKey, ThemeMode } from "@/lib/types";

interface StudioControlsProps {
  themeMode: ThemeMode;
  light?: LightSettings;
  canEdit: boolean;
  hasSelection: boolean;
  canUndo: boolean;
  activeSeason: SeasonKey;
  activeContainer: ContainerKey;
  onThemeChange: (mode: ThemeMode) => void;
  onLightChange?: (light: Partial<LightSettings>) => void;
  onSetSeason: (season: SeasonKey) => void;
  onSetContainer: (container: ContainerKey) => void;
  transformMode: "translate" | "rotate" | "scale";
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void;
  transformSpace: "local" | "world";
  onTransformSpaceChange: (space: "local" | "world") => void;
  snapEnabled: boolean;
  onSnapChange: (enabled: boolean) => void;
  onReset: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onExport: () => void;
}

export function StudioControls({
  themeMode,
  canEdit,
  hasSelection,
  canUndo,
  activeSeason,
  activeContainer,
  onThemeChange,
  onSetSeason,
  onSetContainer,
  transformMode,
  onTransformModeChange,
  transformSpace,
  onTransformSpaceChange,
  snapEnabled,
  onSnapChange,
  onReset,
  onDelete,
  onUndo,
  onExport,
}: StudioControlsProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <section className="rounded-[24px] border border-white/45 bg-white/58 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">四季模板</p>
          </div>
          <Layers3 className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {seasons.map((season) => (
            <button
              key={season.key}
              type="button"
              onClick={() => onSetSeason(season.key)}
              disabled={!canEdit}
              className={`rounded-[16px] border px-4 py-3.5 text-center transition ${
                activeSeason === season.key
                  ? "border-white/80 bg-white text-zinc-900 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                  : "border-white/45 bg-white/40 text-zinc-700 hover:bg-white/70"
              } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl leading-none">{season.emoji}</span>
                <span className="text-sm font-medium leading-snug">{season.label}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {containers.map((container) => (
            <button
              key={container.key}
              type="button"
              onClick={() => onSetContainer(container.key)}
              disabled={!canEdit}
              className={`rounded-[16px] border px-3 py-3 text-center text-sm transition ${
                activeContainer === container.key
                  ? "border-white/80 bg-white text-zinc-900 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                  : "border-white/45 bg-white/35 text-zinc-700 hover:bg-white/60"
              } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <p className="font-medium">{container.label}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/45 bg-white/58 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">主题模式</p>
          </div>
          <LampDesk className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onThemeChange("dark")}
            className={`flex items-center justify-center gap-2 rounded-[16px] border px-3 py-3 text-sm transition ${
              themeMode === "dark"
                ? "border-zinc-800 bg-zinc-900 text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                : "border-white/55 bg-white/60 text-zinc-700 hover:bg-white/70"
            }`}
          >
            <MoonStar className="h-4 w-4" />
            深色
          </button>
          <button
            type="button"
            onClick={() => onThemeChange("light")}
            className={`flex items-center justify-center gap-2 rounded-[16px] border px-3 py-3 text-sm transition ${
              themeMode === "light"
                ? "border-white/80 bg-white text-zinc-900 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                : "border-white/55 bg-white/60 text-zinc-700 hover:bg-white/70"
            }`}
          >
            <SunMedium className="h-4 w-4" />
            浅色
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/45 bg-white/58 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">创作操作</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformModeChange("translate")}
            title="移动"
            className={`flex justify-center rounded-[16px] px-3 py-3 transition ${
              transformMode === "translate"
                ? "bg-zinc-950 text-white"
                : "bg-white/72 text-zinc-700 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <Move className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformModeChange("rotate")}
            title="旋转"
            className={`flex justify-center rounded-[16px] px-3 py-3 transition ${
              transformMode === "rotate"
                ? "bg-zinc-950 text-white"
                : "bg-white/72 text-zinc-700 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <Rotate3D className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformModeChange("scale")}
            title="缩放"
            className={`flex justify-center rounded-[16px] px-3 py-3 transition ${
              transformMode === "scale"
                ? "bg-zinc-950 text-white"
                : "bg-white/72 text-zinc-700 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <Scaling className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <button
            type="button"
            disabled={!canUndo}
            title="撤销上一步"
            onClick={onUndo}
            className="flex items-center justify-center rounded-[16px] border border-white/60 bg-white/72 px-3 py-3 text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            title="还原"
            onClick={onReset}
            className="flex items-center justify-center rounded-[16px] border border-white/60 bg-white/72 px-3 py-3 text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            title="删除"
            onClick={onDelete}
            className="flex items-center justify-center rounded-[16px] border border-red-200/60 bg-red-50/70 px-3 py-3 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformSpaceChange(transformSpace === "local" ? "world" : "local")}
            className={`rounded-[16px] border px-3 py-3 text-xs transition ${
              transformSpace === "local"
                ? "border-white/60 bg-white/72 text-zinc-800"
                : "border-transparent bg-white/40 text-zinc-600 hover:bg-white/60"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            坐标系: {transformSpace === "local" ? "局部" : "世界"}
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onSnapChange(!snapEnabled)}
            className={`rounded-[16px] border px-3 py-3 text-xs transition ${
              snapEnabled
                ? "border-white/60 bg-white/72 text-zinc-800"
                : "border-transparent bg-white/40 text-zinc-600 hover:bg-white/60"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            角度吸附: {snapEnabled ? "开启(15°)" : "关闭"}
          </button>
        </div>
      </section>

      {/* 保存图片按钮（固定在底部） */}
      <div className="mt-auto shrink-0">
        <button
          onClick={onExport}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-zinc-950 py-4 text-[15px] font-medium text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-2xl active:translate-y-0"
        >
          <Download className="h-5 w-5" />
          保存图片
        </button>
      </div>
    </div>
  );
}
