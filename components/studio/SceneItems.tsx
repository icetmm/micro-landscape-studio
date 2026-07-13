"use client";

import { Billboard, useTexture, useGLTF, TransformControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, Suspense, useRef, useLayoutEffect, Component, ReactNode, useState, useEffect } from "react";
import * as THREE from "three";
import { useStudioStore } from "@/store/useStudioStore";
import { getContainerFloorY, getContainerFloorGeometry, clampBoundingBoxToContainer } from "@/lib/studio-geometry";

import type { ProjectItem, SeasonKey, ContainerKey } from "@/lib/types";

class ItemErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Item load error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

interface SceneItemsProps {
  items: ProjectItem[];
  season: SeasonKey;
  container: ContainerKey;
  selectedItemId: string | null;
  onSelect: (itemId: string | null) => void;
  transformMode?: "translate" | "rotate" | "scale";
  transformSpace?: "local" | "world";
  snapEnabled?: boolean;
}

function SeasonalFloor({ season, container }: { season: SeasonKey, container: ContainerKey }) {
  const palette = {
    spring: { ground: "#8db36f", detail: "#7db17c", water: "#74bfd0" },
    summer: { ground: "#76c57a", detail: "#5ea75f", water: "#6ac7df" },
    autumn: { ground: "#FF843B", detail: "#d49d4d", water: "#8bb7c2" },
    winter: { ground: "#eef4fb", detail: "#cfdded", water: "#a0c6e8" },
  }[season];

  const yPos = getContainerFloorY(container);
  const geometry = getContainerFloorGeometry(container);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, yPos, 0]}>
        {geometry.type === 'plane' ? (
          <planeGeometry args={geometry.args} />
        ) : (
          <circleGeometry args={geometry.args} />
        )}
        <meshStandardMaterial color={palette.ground} roughness={0.96} />
      </mesh>
    </group>
  );
}

function Tree({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 1.1, 12]} />
        <meshStandardMaterial color={accent} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.56, 22, 22]} />
        <meshStandardMaterial color={color} roughness={0.84} />
      </mesh>
      <mesh castShadow position={[0.35, 1.06, 0.08]}>
        <sphereGeometry args={[0.34, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[-0.28, 0.98, -0.1]}>
        <sphereGeometry args={[0.32, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
    </group>
  );
}

function Rock({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow rotation={[0.2, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.44, 0]} />
        <meshStandardMaterial color={color} roughness={0.98} />
      </mesh>
      <mesh castShadow position={[0.14, 0.12, 0.08]} rotation={[0.1, -0.3, 0]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={accent} roughness={0.94} />
      </mesh>
    </group>
  );
}

function Bridge({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.42, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow position={[-0.6, 0.46, 0.16]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color={accent} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0.6, 0.46, 0.16]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color={accent} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[-0.6, 0.46, -0.16]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color={accent} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0.6, 0.46, -0.16]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color={accent} roughness={0.88} />
      </mesh>
    </group>
  );
}

function Lantern({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.34, 12]} />
        <meshStandardMaterial color="#827764" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.32]} />
        <meshStandardMaterial color={color} emissive={accent} emissiveIntensity={0.3} />
      </mesh>
      <mesh castShadow position={[0, 0.86, 0]}>
        <coneGeometry args={[0.22, 0.22, 6]} />
        <meshStandardMaterial color="#917246" roughness={0.74} />
      </mesh>
    </group>
  );
}

function Animal({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0.2, 0.47, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0.3, 0.72, 0.06]} rotation={[0.1, 0, 0.3]}>
        <capsuleGeometry args={[0.04, 0.18, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0.1, 0.72, -0.06]} rotation={[0.1, 0, -0.3]}>
        <capsuleGeometry args={[0.04, 0.18, 8, 8]} />
        <meshStandardMaterial color={accent} roughness={0.88} />
      </mesh>
    </group>
  );
}

function Shrub({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.3, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.22, 0.14, 0.1]}>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshStandardMaterial color={accent} roughness={0.96} />
      </mesh>
    </group>
  );
}

function Flower({ color, accent, scale }: ProjectItem) {
  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color={accent} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.11, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.84} />
      </mesh>
    </group>
  );
}

function UploadPlane({ item }: { item: ProjectItem }) {
  const texture = useTexture(item.previewUrl ?? "");
  const material = useMemo(() => {
    const clonedTexture = texture.clone();
    clonedTexture.colorSpace = THREE.SRGBColorSpace;
    clonedTexture.needsUpdate = true;
    return clonedTexture;
  }, [texture]);

  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false} position={[0, 0.5 * item.scale, 0]}>
      <mesh castShadow>
        <planeGeometry args={[0.9 * item.scale, 1.15 * item.scale]} />
        <meshStandardMaterial map={material} transparent alphaTest={0.08} />
      </mesh>
      <mesh position={[0.03, -0.03, -0.08]}>
        <planeGeometry args={[0.9 * item.scale, 1.15 * item.scale]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
    </Billboard>
  );
}

function Model3D({ item }: { item: ProjectItem }) {
  const { scene } = useGLTF(item.modelUrl || "", "/draco/");

  const { clonedScene, normalizedScale, centerOffset, bottomOffset } = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Normalize size to roughly 1 unit
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 1 / maxDim : 1;

    // Center offset (horizontal only) and Bottom offset (vertical)
    const center = new THREE.Vector3();
    box.getCenter(center);

    return {
      clonedScene: clone,
      normalizedScale: scale,
      centerOffset: new THREE.Vector3(-center.x, 0, -center.z),
      bottomOffset: -box.min.y, // Shift up by the lowest point so bottom rests at y=0
    };
  }, [scene]);

  return (
    <group scale={item.scale}>
      <group scale={normalizedScale} position={[0, bottomOffset * normalizedScale, 0]}>
        <primitive object={clonedScene} position={centerOffset} />
      </group>
    </group>
  );
}

useGLTF.setDecoderPath("/draco/");
useGLTF.preload("/assets/models/piano.glb", "/draco/");

function ErrorFallback({ scale }: { scale: number }) {
  return (
    <mesh position={[0, 0.5 * scale, 0]}>
      <boxGeometry args={[0.8 * scale, 0.8 * scale, 0.8 * scale]} />
      <meshStandardMaterial color="#ff4444" wireframe />
    </mesh>
  );
}

function SafeAssetLoader({ url, scale, children }: { url?: string, scale: number, children: ReactNode }) {
  const [isValid, setIsValid] = useState<boolean | null>(() => {
    if (!url || !url.startsWith("blob:")) {
      return true;
    }
    return null;
  });

  useEffect(() => {
    if (!url || !url.startsWith("blob:")) {
      return;
    }
    fetch(url)
      .then((res) => setIsValid(res.ok))
      .catch(() => setIsValid(false));
  }, [url]);

  if (isValid === false) {
    return <ErrorFallback scale={scale} />;
  }
  if (isValid === null) {
    return null;
  }
  return <>{children}</>;
}

function ItemMesh({ item }: { item: ProjectItem }) {
  if (item.kind === "rock") {
    return <Rock {...item} />;
  }

  if (item.kind === "bridge") {
    return <Bridge {...item} />;
  }

  if (item.kind === "lantern") {
    return <Lantern {...item} />;
  }

  if (item.kind === "animal") {
    return <Animal {...item} />;
  }

  if (item.kind === "shrub") {
    return <Shrub {...item} />;
  }

  if (item.kind === "flower") {
    return <Flower {...item} />;
  }

  if (item.kind === "upload-plane" && item.previewUrl) {
    return (
      <SafeAssetLoader url={item.previewUrl} scale={item.scale}>
        <UploadPlane item={item} />
      </SafeAssetLoader>
    );
  }

  if (item.kind === "model-3d") {
    return (
      <SafeAssetLoader url={item.modelUrl} scale={item.scale}>
        <Model3D item={item} />
      </SafeAssetLoader>
    );
  }

  return <Tree {...item} />;
}

function SceneItemNode({
  item,
  isSelected,
  onSelect,
  transformMode,
  transformSpace,
  snapEnabled,
  updateItemTransform,
  constrainItemPosition,
  container,
}: {
  item: ProjectItem;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  transformMode: "translate" | "rotate" | "scale";
  transformSpace: "local" | "world";
  snapEnabled: boolean;
  updateItemTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale3?: [number, number, number]) => void;
  constrainItemPosition: (id: string, position: [number, number, number]) => void;
  container: ContainerKey;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const needsBoundsCheckRef = useRef(true);
  const isDraggingRef = useRef(false);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    // 拖动期间由 TransformControls 直接控制对象，避免被 store 的旧值覆盖
    if (isDraggingRef.current) return;
    const group = groupRef.current;

    group.position.set(item.position[0], item.position[1], item.position[2]);
    group.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);

    const scaleArr = item.scale3 || [1, 1, 1];
    group.scale.set(scaleArr[0], scaleArr[1], scaleArr[2]);

    group.updateMatrix();
    group.updateMatrixWorld(true);
  }, [
    item.position,
    item.rotation,
    item.scale3
  ]);

  useEffect(() => {
    needsBoundsCheckRef.current = true;
  }, [item.position, item.rotation, item.scale, item.scale3, container]);

  useFrame(() => {
    // 拖动期间不做边界检查，避免与 TransformControls 抢位置导致卡住
    if (isDraggingRef.current) return;
    if (!needsBoundsCheckRef.current || !groupRef.current) return;

    groupRef.current.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(groupRef.current);
    if (box.isEmpty()) return;

    needsBoundsCheckRef.current = false;

    const { x, z, clamped, oversized } = clampBoundingBoxToContainer(
      container,
      box.min.x,
      box.max.x,
      box.min.z,
      box.max.z,
      item.position[0],
      item.position[2]
    );

    if (oversized) {
      window.dispatchEvent(new CustomEvent('studio-toast', { detail: '模型尺寸超出容器范围' }));
    }

    if (
      clamped &&
      (Math.abs(item.position[0] - x) > 0.001 || Math.abs(item.position[2] - z) > 0.001)
    ) {
      constrainItemPosition(item.id, [x, item.position[1], z]);
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
        }}
      >
        <ItemErrorBoundary
          fallback={
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#ff4444" wireframe />
            </mesh>
          }
        >
          <Suspense fallback={null}>
            <ItemMesh item={item} />
          </Suspense>
        </ItemErrorBoundary>
        {isSelected ? (
          <mesh position={[0, getContainerFloorY(container) - item.position[1] + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.42, 0.52, 48]} />
            <meshBasicMaterial color="#fff3ca" transparent opacity={0.95} />
          </mesh>
        ) : null}
      </group>

      {isSelected && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          space={transformSpace}
          rotationSnap={snapEnabled ? Math.PI / 12 : undefined}
          translationSnap={snapEnabled ? 0.1 : undefined}
          onMouseDown={() => {
            isDraggingRef.current = true;
          }}
          onMouseUp={(e) => {
            const object = (e as unknown as { target: { object: THREE.Object3D } })?.target?.object;
            // 先清除拖动标记，这样随 store 更新触发的 useLayoutEffect 才会用新值而不是被跳过
            isDraggingRef.current = false;
            if (object) {
              updateItemTransform(
                item.id,
                [object.position.x, object.position.y, object.position.z],
                [object.rotation.x, object.rotation.y, object.rotation.z],
                [object.scale.x, object.scale.y, object.scale.z]
              );
            }
          }}
        />
      )}
    </>
  );
}

export function SceneItems({
  items,
  season,
  container,
  selectedItemId,
  onSelect,
  transformMode = "translate",
  transformSpace = "local",
  snapEnabled = false,
}: SceneItemsProps) {
  const updateItemTransform = useStudioStore((state) => state.updateItemTransform);
  const constrainItemPosition = useStudioStore((state) => state.constrainItemPosition);

  return (
    <group
      onPointerMissed={(e) => {
        if (e.type === "click") {
          onSelect(null);
        }
      }}
      onClick={(e) => {
        // 点击舞台中非模型区域（如绿布地板）时取消选择。
        // 模型自身的 onClick 会调用 stopPropagation，不会走到这里。
        e.stopPropagation();
        onSelect(null);
      }}
    >
      <SeasonalFloor season={season} container={container} />
      {items.map((item) => (
        <SceneItemNode
          key={item.id}
          item={item}
          isSelected={selectedItemId === item.id}
          onSelect={onSelect}
          transformMode={transformMode}
          transformSpace={transformSpace}
          snapEnabled={snapEnabled}
          updateItemTransform={updateItemTransform}
          constrainItemPosition={constrainItemPosition}
          container={container}
        />
      ))}
    </group>
  );
}
