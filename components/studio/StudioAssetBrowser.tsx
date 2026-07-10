"use client";

import { useMemo } from "react";
import { ImagePlus } from "lucide-react";
import type { LibraryAsset } from "@/lib/types";

interface StudioAssetBrowserProps {
  libraryAssets: LibraryAsset[];
  uploadedAssets: LibraryAsset[];
  onUploadFiles: (files: FileList | null) => void;
  onDragAsset: (asset: LibraryAsset) => void;
}

export function StudioAssetBrowser({
  libraryAssets,
  uploadedAssets,
  onUploadFiles,
  onDragAsset,
}: StudioAssetBrowserProps) {
  const groupedAssets = useMemo(() => {
    const merged = [...uploadedAssets, ...libraryAssets];
    return {
      all: merged,
      uploaded: uploadedAssets,
    };
  }, [libraryAssets, uploadedAssets]);

  return (
    <section className="col-span-full xl:col-span-3 flex flex-col rounded-[40px] border border-white/45 bg-white/52 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-2 shrink-0 mb-4 px-2">
        <div className="pl-4">
          <p className="text-sm font-medium text-zinc-900">素材与照片</p>
          <p className="mt-1 text-xs text-zinc-500">拖拽到上方创作视口即可放置</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-950 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800">
          <ImagePlus className="h-3.5 w-3.5" />
          上传
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => onUploadFiles(event.target.files)}
          />
        </label>
      </div>
      
      <div className="rounded-[28px] border border-white/50 bg-white/34 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <div className="flex gap-6 overflow-x-auto pb-2 custom-scrollbar">
          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase whitespace-nowrap">
              预置素材库
            </p>
            <div className="flex gap-2">
              {groupedAssets.all
                .filter((asset) => asset.category !== "uploaded" && asset.sourceType === "preset")
                .map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="flex w-32 shrink-0 flex-col items-center rounded-[18px] border border-white/60 bg-white/60 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white cursor-grab"
                    draggable
                    onDragStart={(e) => {
                      onDragAsset(asset);
                      const div = document.createElement("div");
                      div.style.width = "96px";
                      div.style.height = "96px";
                      div.style.position = "absolute";
                      div.style.top = "-9999px";
                      div.style.left = "-9999px";
                      div.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
                      div.style.borderRadius = "16px";
                      div.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                      div.style.backgroundImage = `url(${asset.previewUrl})`;
                      div.style.backgroundSize = "contain";
                      div.style.backgroundPosition = "center";
                      div.style.backgroundRepeat = "no-repeat";
                      document.body.appendChild(div);
                      e.dataTransfer.setDragImage(div, 48, 96);
                      setTimeout(() => {
                        if (div.parentNode) {
                          div.parentNode.removeChild(div);
                        }
                      }, 100);
                    }}
                  >
                    <div
                      className="h-20 w-full rounded-[14px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${asset.previewUrl})`,
                        backgroundColor: asset.accent,
                      }}
                    />
                    <div className="mt-2 w-full text-center">
                      <p className="truncate text-xs font-medium text-zinc-900">{asset.name}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {groupedAssets.uploaded.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase whitespace-nowrap">
                用户提取元素
              </p>
              <div className="flex gap-2">
                {groupedAssets.uploaded.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="w-32 shrink-0 rounded-[18px] border border-white/60 bg-white/68 p-2 text-left transition hover:-translate-y-0.5 hover:bg-white cursor-grab flex flex-col"
                    draggable
                    onDragStart={(e) => {
                      onDragAsset(asset);
                      const div = document.createElement("div");
                      div.style.width = "96px";
                      div.style.height = "96px";
                      div.style.position = "absolute";
                      div.style.top = "-9999px";
                      div.style.left = "-9999px";
                      div.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
                      div.style.borderRadius = "16px";
                      div.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                      div.style.backgroundImage = `url(${asset.previewUrl})`;
                      div.style.backgroundSize = "contain";
                      div.style.backgroundPosition = "center";
                      div.style.backgroundRepeat = "no-repeat";
                      document.body.appendChild(div);
                      e.dataTransfer.setDragImage(div, 48, 96);
                      setTimeout(() => {
                        if (div.parentNode) {
                          div.parentNode.removeChild(div);
                        }
                      }, 100);
                    }}
                  >
                    <div
                      className="h-20 w-full rounded-[14px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${asset.previewUrl})` }}
                    />
                    <p className="mt-2 truncate text-xs font-medium text-zinc-900">{asset.name}</p>
                    <p className="mt-1 text-[11px] text-zinc-500 truncate">照片主体卡片</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
