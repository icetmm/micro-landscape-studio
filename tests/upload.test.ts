import { describe, expect, it } from "vitest";
import { classifyUploadFile } from "../lib/studio-upload";

describe("classifyUploadFile", () => {
  it("classifies .glb and .gltf as model-3d", () => {
    const glbFile = new File([""], "test.glb", { type: "model/gltf-binary" });
    const gltfFile = new File([""], "test.GLTF", { type: "model/gltf+json" });

    const glbAsset = classifyUploadFile(glbFile);
    expect(glbAsset).not.toBeNull();
    expect(glbAsset?.kind).toBe("model-3d");
    expect(glbAsset?.modelUrl).toBeDefined();
    expect(glbAsset?.sourceType).toBe("upload");

    const gltfAsset = classifyUploadFile(gltfFile);
    expect(gltfAsset).not.toBeNull();
    expect(gltfAsset?.kind).toBe("model-3d");
  });

  it("classifies images as upload-plane", () => {
    const imageFile = new File([""], "test.png", { type: "image/png" });
    const imageAsset = classifyUploadFile(imageFile);

    expect(imageAsset).not.toBeNull();
    expect(imageAsset?.kind).toBe("upload-plane");
    expect(imageAsset?.previewUrl).toBeDefined();
    expect(imageAsset?.sourceType).toBe("upload");
  });

  it("rejects unsupported file types", () => {
    const txtFile = new File([""], "test.txt", { type: "text/plain" });
    const asset = classifyUploadFile(txtFile);
    expect(asset).toBeNull();
  });

  it("rejects vector images and spoofed image MIME types", () => {
    const svgFile = new File(["<svg />"], "vector.svg", { type: "image/svg+xml" });
    const spoofedFile = new File(["not an image"], "payload.exe", { type: "image/png" });

    expect(classifyUploadFile(svgFile)).toBeNull();
    expect(classifyUploadFile(spoofedFile)).toBeNull();
  });
});
