import type { LibraryAsset } from "@/lib/types";

export function classifyUploadFile(file: File, customName?: string): LibraryAsset | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const supportedImages: Record<string, string[]> = {
    png: ["image/png"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    webp: ["image/webp"],
    gif: ["image/gif"],
    avif: ["image/avif"],
  };

  const isModel = ext === "glb" || ext === "gltf";
  const isImage = Boolean(
    ext && supportedImages[ext]?.includes(file.type.toLowerCase()),
  );

  if (!isModel && !isImage) {
    return null;
  }

  const id = `upload-${Math.random().toString(36).slice(2, 9)}`;
  const name = customName || file.name.replace(/\.[^.]+$/, "");
  const objectUrl = URL.createObjectURL(file);

  if (isModel) {
    return {
      id,
      name,
      category: "uploaded",
      kind: "model-3d",
      color: "#ffffff",
      accent: "#efe9da",
      scale: 0.95,
      modelUrl: objectUrl,
      sourceType: "upload",
    };
  }

  if (isImage) {
    return {
      id,
      name,
      category: "uploaded",
      kind: "upload-plane",
      color: "#ffffff",
      accent: "#efe9da",
      scale: 0.95,
      previewUrl: objectUrl,
      sourceType: "upload",
    };
  }
  return null;
}
