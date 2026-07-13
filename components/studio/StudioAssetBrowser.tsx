"use client";

import { Suspense, useMemo } from "react";
import { ImagePlus } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { LibraryAsset } from "@/lib/types";

function ModelThumbnail({ url }: { url: string }) {
  const { scene } = useGLTF(url, "/draco/");
  const clonedScene = useMemo(() => {
    try {
      const clone = scene.clone();
      const box = new THREE.Box3().setFromObject(clone);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 2 / maxDim : 1;
      clone.position.set(-center.x, -center.y, -center.z);
      return { clone, scale };
    } catch (_e) {
      return { clone: new THREE.Group(), scale: 1 };
    }
  }, [scene]);

  return (
    <group scale={clonedScene.scale}>
      <primitive object={clonedScene.clone} />
    </group>
  );
}

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
  const presetAssets = useMemo(() => {
    return libraryAssets.filter((asset) => asset.category !== "uploaded" && asset.sourceType === "preset");
  }, [libraryAssets]);

  return (
    <section className="flex w-full shrink-0 flex-col rounded-[24px] border border-white/45 bg-white/40 p-2 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
        <label className="flex w-20 shrink-0 cursor-pointer flex-col items-center rounded-[16px] border border-dashed border-zinc-400/50 bg-white/40 p-1.5 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-white/60 hover:text-zinc-900">
          <div className="flex h-12 w-full items-center justify-center rounded-[10px] bg-zinc-950/5">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div className="mt-1 w-full text-center">
            <p className="text-[10px] font-medium">上传素材</p>
          </div>
          <input
            type="file"
            accept="image/*,.glb,.gltf"
            multiple
            className="hidden"
            onChange={(event) => onUploadFiles(event.target.files)}
          />
        </label>

        {uploadedAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className="flex w-20 shrink-0 flex-col items-center rounded-[16px] border border-white/60 bg-white/68 p-1.5 text-left transition hover:-translate-y-0.5 hover:bg-white cursor-grab"
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
              if (asset.previewUrl) {
                div.style.backgroundImage = `url(${asset.previewUrl})`;
              } else if (asset.kind === "model-3d" && asset.modelUrl) {
                const canvas = e.currentTarget.querySelector("canvas");
                let captured = false;
                if (canvas) {
                  try {
                    const dataUrl = (canvas as HTMLCanvasElement).toDataURL("image/png");
                    if (dataUrl && dataUrl.length > 100) {
                      div.style.backgroundImage = `url(${dataUrl})`;
                      captured = true;
                    }
                  } catch (_e) {
                    captured = false;
                  }
                }
                if (!captured) {
                  div.textContent = "3D";
                  div.style.display = "grid";
                  div.style.placeItems = "center";
                  div.style.fontWeight = "700";
                  div.style.color = "#52525b";
                }
              } else {
                div.textContent = "3D";
                div.style.display = "grid";
                div.style.placeItems = "center";
                div.style.fontWeight = "700";
                div.style.color = "#52525b";
              }
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
              className="flex h-12 w-full items-center justify-center rounded-[10px] bg-cover bg-center text-zinc-500 overflow-hidden relative"
              style={asset.previewUrl ? { backgroundImage: `url(${asset.previewUrl})` } : { backgroundColor: "rgba(255,255,255,0.4)" }}
            >
              {!asset.previewUrl && asset.kind === "model-3d" && asset.modelUrl ? (
                <div className="absolute inset-0 pointer-events-none">
                  <Canvas camera={{ position: [2, 2, 2], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <Suspense fallback={null}>
                      <ModelThumbnail url={asset.modelUrl} />
                    </Suspense>
                  </Canvas>
                </div>
              ) : !asset.previewUrl && asset.kind === "model-3d" ? (
                <div className="flex h-full w-full items-center justify-center bg-black/5 text-lg font-bold text-black/20">
                  3D
                </div>
              ) : !asset.previewUrl ? (
                <div
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${asset.modelUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  title={asset.name}
                />
              ) : null}
            </div>
            <div className="mt-1 w-full text-center">
              <p className="truncate text-[10px] font-medium text-zinc-900">{asset.name}</p>
            </div>
          </button>
        ))}

        {presetAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className="flex w-20 shrink-0 flex-col items-center rounded-[16px] border border-white/60 bg-white/60 p-1.5 text-left transition hover:-translate-y-0.5 hover:bg-white cursor-grab"
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
              className="h-12 w-full rounded-[10px] bg-cover bg-center"
              style={{
                backgroundImage: `url(${asset.previewUrl})`,
                backgroundColor: asset.accent,
              }}
            />
            <div className="mt-1 w-full text-center">
              <p className="truncate text-[10px] font-medium text-zinc-900">{asset.name}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
