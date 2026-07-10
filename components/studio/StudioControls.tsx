"use client";

import {
  LampDesk,
  Layers3,
  MoonStar,
  RotateCcw,
  SunMedium,
  Trash2,
  Undo2,
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
}: StudioControlsProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-white/45 bg-white/58 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">四季模板</p>
            <p className="mt-1 text-xs text-zinc-500">切换模板时背景同步联动</p>
          </div>
          <Layers3 className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {seasons.map((season) => (
            <button
              key={season.key}
              type="button"
              onClick={() => onSetSeason(season.key)}
              disabled={!canEdit}
              className={`rounded-[20px] border px-3 py-3 text-left transition ${
                activeSeason === season.key
                  ? "border-white/80 bg-white text-zinc-900 shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                  : "border-white/45 bg-white/40 text-zinc-700 hover:bg-white/70"
              } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <div className="text-lg">{season.emoji}</div>
              <div className="mt-2 text-xs font-medium">{season.label}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {containers.map((container) => (
            <button
              key={container.key}
              type="button"
              onClick={() => onSetContainer(container.key)}
              disabled={!canEdit}
              className={`rounded-[18px] border px-3 py-2 text-left text-xs transition ${
                activeContainer === container.key
                  ? "border-[#e5d3b2] bg-[#fff8ef]"
                  : "border-white/45 bg-white/35 hover:bg-white/60"
              } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <p className="font-medium text-zinc-900">{container.label}</p>
              <p className="mt-1 text-zinc-500">{container.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/45 bg-white/58 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">主题模式</p>
            <p className="mt-1 text-xs text-zinc-500">深浅色模式切换</p>
          </div>
          <LampDesk className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onThemeChange("dark")}
            className={`flex items-center justify-center gap-2 rounded-[20px] border px-3 py-3 text-sm transition ${
              themeMode === "dark"
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-white/55 bg-white/60 text-zinc-700"
            }`}
          >
            <MoonStar className="h-4 w-4" />
            深色
          </button>
          <button
            type="button"
            onClick={() => onThemeChange("light")}
            className={`flex items-center justify-center gap-2 rounded-[20px] border px-3 py-3 text-sm transition ${
              themeMode === "light"
                ? "border-[#e1c79f] bg-[#fff7eb] text-zinc-900"
                : "border-white/55 bg-white/60 text-zinc-700"
            }`}
          >
            <SunMedium className="h-4 w-4" />
            浅色
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/45 bg-white/58 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">创作操作</p>
            <p className="mt-1 text-xs text-zinc-500">选中元素后微调与变换</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformModeChange("translate")}
            className={`rounded-[18px] px-3 py-3 text-xs transition ${
              transformMode === "translate"
                ? "bg-zinc-950 text-white"
                : "bg-white/72 text-zinc-700 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            移动
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformModeChange("rotate")}
            className={`rounded-[18px] px-3 py-3 text-xs transition ${
              transformMode === "rotate"
                ? "bg-zinc-950 text-white"
                : "bg-white/72 text-zinc-700 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            旋转
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformModeChange("scale")}
            className={`rounded-[18px] px-3 py-3 text-xs transition ${
              transformMode === "scale"
                ? "bg-zinc-950 text-white"
                : "bg-white/72 text-zinc-700 hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            缩放
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={!canUndo}
            title="撤销上一步"
            onClick={onUndo}
            className="flex items-center justify-center gap-1.5 rounded-[18px] border border-white/60 bg-white/72 px-3 py-2 text-xs text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" />
            撤销
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            title="还原位置、方向和大小"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 rounded-[18px] border border-white/60 bg-white/72 px-3 py-2 text-xs text-zinc-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            还原
          </button>
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            title="删除模型"
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 rounded-[18px] border border-red-200/60 bg-red-50/70 px-3 py-2 text-xs text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canEdit || !hasSelection}
            onClick={() => onTransformSpaceChange(transformSpace === "local" ? "world" : "local")}
            className={`rounded-[18px] border px-3 py-2 text-xs transition ${
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
            className={`rounded-[18px] border px-3 py-2 text-xs transition ${
              snapEnabled
                ? "border-white/60 bg-white/72 text-zinc-800"
                : "border-transparent bg-white/40 text-zinc-600 hover:bg-white/60"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            角度吸附: {snapEnabled ? "开启(15°)" : "关闭"}
          </button>
        </div>
      </section>
    </div>
  );
}
