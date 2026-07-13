"use client";

import {
  Float,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

import { ContainerShell } from "@/components/studio/ContainerShell";
import { SceneItems } from "@/components/studio/SceneItems";
import { seasons } from "@/lib/data/studio-presets";
import { getContainerFloorY } from "@/lib/studio-geometry";
import type {
  ContainerKey,
  LightSettings,
  ProjectItem,
  SeasonKey,
  ThemeMode,
} from "@/lib/types";

interface SceneCanvasProps {
  season: SeasonKey;
  container: ContainerKey;
  themeMode: ThemeMode;
  light: LightSettings;
  items: ProjectItem[];
  selectedItemId: string | null;
  onSelect: (itemId: string | null) => void;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onRaycastReady?: (raycastFn: (clientX: number, clientY: number) => THREE.Vector3 | null) => void;
  transformMode?: "translate" | "rotate" | "scale";
  transformSpace?: "local" | "world";
  snapEnabled?: boolean;
}

function CanvasBridge({
  onCanvasReady,
  onRaycastReady,
  container,
}: {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onRaycastReady?: (raycastFn: (clientX: number, clientY: number) => THREE.Vector3 | null) => void;
  container: ContainerKey;
}) {
  const { gl, camera } = useThree();

  useEffect(() => {
    onCanvasReady(gl.domElement);

    if (onRaycastReady) {
      const getIntersect = (clientX: number, clientY: number) => {
        const rect = gl.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        
        const floorY = getContainerFloorY(container);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY);
        const target = new THREE.Vector3();
        
        // Let's also check if it hits any object first (so you can put things on top of others)
        // For simplicity and to match the prompt "妯″瀷搴曢儴鑷姩璐村悎琛ㄩ潰", we just intersect the floor plane for now.
        if (raycaster.ray.intersectPlane(plane, target)) {
          return target;
        }
        return null;
      };
      onRaycastReady(getIntersect);
    }
  }, [gl, camera, onCanvasReady, onRaycastReady, container]);

  return null;
}

function FloatingAtmosphere({ season }: { season: SeasonKey }) {
  const tint = useMemo(
    () =>
      ({
        spring: "#fff0f7",
        summer: "#fff4bd",
        autumn: "#ffe3b2",
        winter: "#edf5ff",
      })[season],
    [season],
  );

  return (
    <>
      <Sparkles count={36} scale={[7, 6, 7]} size={1.6} speed={0.3} color={tint} />
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.25}>
        <mesh position={[1.85, 2.15, -1.25]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color={tint} transparent opacity={0.42} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.04} floatIntensity={0.18}>
        <mesh position={[-2.1, 1.85, 1.65]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color={tint} transparent opacity={0.28} />
        </mesh>
      </Float>
    </>
  );
}

function SceneLighting({
  season,
  light,
  themeMode,
}: {
  season: SeasonKey;
  light: LightSettings;
  themeMode: ThemeMode;
}) {
  const seasonLight = {
    spring: "#fff4f4",
    summer: "#fff4c8",
    autumn: "#ffd8b3",
    winter: "#f2f7ff",
  }[season];

  const azimuth = light.azimuth * Math.PI * 2;
  const elevation = THREE.MathUtils.lerp(0.4, 2.5, light.elevation);
  const radius = 5.6;
  const x = Math.cos(azimuth) * radius;
  const z = Math.sin(azimuth) * radius;

  return (
    <>
      <ambientLight intensity={themeMode === "dark" ? 0.4 : 0.9} color="#ffffff" />
      <hemisphereLight
        args={[themeMode === "dark" ? "#b7d5ff" : "#fff8ef", "#486450", themeMode === "dark" ? 0.5 : 0.8]}
      />
      <directionalLight
        position={[x, elevation, z]}
        intensity={light.intensity * (themeMode === "dark" ? 1.15 : 0.95)}
        color={seasonLight}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 2.2, 0]} intensity={themeMode === "dark" ? 0.55 : 0.2} color="#fff7dd" />
    </>
  );
}

export function SceneCanvas({
  season,
  container,
  themeMode,
  light,
  items,
  selectedItemId,
  onSelect,
  onCanvasReady,
  onRaycastReady,
  transformMode = "translate",
  transformSpace = "local",
  snapEnabled = false,
}: SceneCanvasProps) {
  const seasonBackground = seasons.find((entry) => entry.key === season)?.background;

  return (
    <div
      className="absolute inset-0 h-full w-full"
      style={{
        background: `radial-gradient(circle at 50% 18%, ${seasonBackground?.glow}, transparent 42%),
          linear-gradient(180deg, ${seasonBackground?.primary}, ${seasonBackground?.secondary})`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_38%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_42%)]" />
      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        dpr={[1, 1.6]}
        className="!absolute inset-0 !h-full !w-full"
        style={{ pointerEvents: "auto" }}
        onPointerMissed={() => onSelect(null)}
      >
        <CanvasBridge 
          onCanvasReady={onCanvasReady} 
          onRaycastReady={onRaycastReady} 
          container={container} 
        />
        <color attach="background" args={[themeMode === "dark" ? "#0d1623" : "#f7f0e8"]} />
        <fog attach="fog" args={[themeMode === "dark" ? "#0d1623" : "#f3ece3", 7.5, 13.5]} />
        <PerspectiveCamera makeDefault position={[5.2, 3.25, 5.4]} fov={32} />
        <SceneLighting season={season} light={light} themeMode={themeMode} />
        <FloatingAtmosphere season={season} />
        <group position={[0, -0.2, 0]}>
          <ContainerShell type={container} />
          <SceneItems
          items={items}
          season={season}
          container={container}
          selectedItemId={selectedItemId}
          onSelect={onSelect}
          transformMode={transformMode}
          transformSpace={transformSpace}
          snapEnabled={snapEnabled}
        />
        </group>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={4.5}
          maxDistance={8.6}
          maxPolarAngle={Math.PI * 0.48}
          minPolarAngle={Math.PI * 0.22}
          rotateSpeed={0.8}
          zoomSpeed={0.85}
        />
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.65} luminanceThreshold={0.34} luminanceSmoothing={0.88} />
          <DepthOfField focusDistance={0.018} focalLength={0.02} bokehScale={1.5} />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/25 to-transparent" />
    </div>
  );
}

