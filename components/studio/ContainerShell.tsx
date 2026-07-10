"use client";

import { Edges, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

import type { ContainerKey } from "@/lib/types";

interface ContainerShellProps {
  type: ContainerKey;
}

function GlassBox({
  position,
  args,
}: {
  position: [number, number, number];
  args: [number, number, number];
}) {
  const glassProps = {
    thickness: 0.18,
    roughness: 0.02,
    transmission: 1,
    ior: 1.12,
    chromaticAberration: 0.018,
    backside: true,
    transparent: true,
    opacity: 0.32,
  };

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <MeshTransmissionMaterial {...glassProps} />
      <Edges color="#eef7f8" threshold={8} opacity={0.5} transparent />
    </mesh>
  );
}

function JarShell() {
  const glassProps = {
    thickness: 0.16,
    roughness: 0.01,
    transmission: 1,
    ior: 1.08,
    chromaticAberration: 0.014,
    backside: true,
    transparent: true,
    opacity: 0.34,
  };

  const profile = [
    new THREE.Vector2(1.52, -0.86),
    new THREE.Vector2(1.72, -0.78),
    new THREE.Vector2(1.82, -0.5),
    new THREE.Vector2(1.86, 1.36),
    new THREE.Vector2(1.78, 1.72),
    new THREE.Vector2(1.55, 2.02),
    new THREE.Vector2(1.18, 2.18),
    new THREE.Vector2(1.12, 2.52),
    new THREE.Vector2(1.58, 2.58),
    new THREE.Vector2(1.68, 2.7),
    new THREE.Vector2(1.56, 2.82),
    new THREE.Vector2(1.02, 2.82),
  ];

  return (
    <group position={[0, -0.45, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 96]} />
        <MeshTransmissionMaterial {...glassProps} />
      </mesh>
      <mesh position={[0, -0.86, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.54, 1.68, 0.2, 96]} />
        <MeshTransmissionMaterial {...glassProps} />
      </mesh>
      <mesh position={[0, -0.7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.48, 0.08, 24, 96]} />
        <MeshTransmissionMaterial {...glassProps} />
      </mesh>
      <mesh position={[0, 2.74, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.35, 0.14, 28, 96]} />
        <MeshTransmissionMaterial {...glassProps} />
      </mesh>
      <mesh position={[0, 2.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.18, 0.055, 20, 96]} />
        <MeshTransmissionMaterial {...glassProps} />
      </mesh>
    </group>
  );
}

function CuboidShell() {
  return (
    <group>
      <GlassBox position={[0, -0.92, 0]} args={[4.72, 0.18, 2.42]} />
      <GlassBox position={[0, 0.2, -1.18]} args={[4.72, 2.18, 0.08]} />
      <GlassBox position={[0, 0.2, 1.18]} args={[4.72, 2.18, 0.08]} />
      <GlassBox position={[-2.36, 0.2, 0]} args={[0.08, 2.18, 2.42]} />
      <GlassBox position={[2.36, 0.2, 0]} args={[0.08, 2.18, 2.42]} />
      <GlassBox position={[0, 1.32, -1.18]} args={[4.76, 0.08, 0.14]} />
      <GlassBox position={[0, 1.32, 1.18]} args={[4.76, 0.08, 0.14]} />
      <GlassBox position={[-2.36, 1.32, 0]} args={[0.14, 0.08, 2.42]} />
      <GlassBox position={[2.36, 1.32, 0]} args={[0.14, 0.08, 2.42]} />
    </group>
  );
}

export function ContainerShell({ type }: ContainerShellProps) {
  const glassProps = {
    thickness: 0.1,
    roughness: 0,
    transmission: 1,
    ior: 1.05,
    chromaticAberration: 0.01,
    backside: true,
    transparent: true,
    opacity: 0.35,
  };

  if (type === "pedestal") {
    return (
      <group>
        <mesh position={[0, -0.83, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.45, 2.85, 0.48, 64]} />
          <MeshTransmissionMaterial {...glassProps} />
        </mesh>
        <mesh position={[0, -0.59, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.25, 2.4, 0.08, 64]} />
          <MeshTransmissionMaterial {...glassProps} />
        </mesh>
      </group>
    );
  }

  if (type === "cuboid") {
    return <CuboidShell />;
  }

  if (type === "sphere") {
    return (
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2.38, 64, 64]} />
        <MeshTransmissionMaterial {...glassProps} />
      </mesh>
    );
  }

  return <JarShell />;
}

