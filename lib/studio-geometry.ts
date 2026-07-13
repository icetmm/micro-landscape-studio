import type { ContainerKey } from "@/lib/types";

export function getContainerFloorY(container: ContainerKey) {
  if (container === "jar") {
    return -1.26;
  }
  if (container === "cuboid") {
    return -0.83;
  }

  if (container === "sphere") {
    return -1.05;
  }

  return -0.53;
}

export function getContainerFloorGeometry(container: ContainerKey) {
  if (container === "cuboid") {
    return { type: "plane" as const, args: [4.46, 2.16] as [number, number] };
  }

  const radiuses: Record<ContainerKey, number> = {
    jar: 1.2,
    cuboid: 0,
    sphere: 1.96,
    pedestal: 2.18,
  };

  return { type: "circle" as const, args: [radiuses[container], 64] as [number, number] };
}

export function clampToContainer(
  container: ContainerKey,
  x: number,
  z: number,
) {
  if (container === "cuboid") {
    return {
      x: Math.max(-2.08, Math.min(2.08, x)),
      z: Math.max(-1.05, Math.min(1.05, z)),
      clamped: Math.abs(x) > 2.08 || Math.abs(z) > 1.05,
    };
  }

  // Sphere uses the green cloth (floor) edge as the container boundary,
  // matching the floor's visible radius so models can roam the entire green area.
  const sphereFloorRadius = getContainerFloorGeometry("sphere").args[0];

  const limits: Record<ContainerKey, number> = {
    jar: 1.62,
    cuboid: 2.08,
    sphere: sphereFloorRadius,
    pedestal: 2.5,
  };
  const limit = limits[container];
  const distance = Math.sqrt(x * x + z * z);

  if (distance <= limit) {
    return { x, z, clamped: false };
  }

  const ratio = limit / distance;
  return {
    x: x * ratio,
    z: z * ratio,
    clamped: true,
  };
}

export function clampBoundingBoxToContainer(
  container: ContainerKey,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  currentX: number,
  currentZ: number
) {
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const boundsCenterX = (minX + maxX) / 2;
  const boundsCenterZ = (minZ + maxZ) / 2;

  if (container === "cuboid") {
    const limitX = 2.08;
    const limitZ = 1.05;

    if (width > limitX * 2 || depth > limitZ * 2) {
      return {
        x: currentX - boundsCenterX,
        z: currentZ - boundsCenterZ,
        clamped: true,
        oversized: true,
      };
    }

    let shiftX = 0;
    let shiftZ = 0;

    if (minX < -limitX) shiftX = -limitX - minX;
    if (maxX > limitX) shiftX = limitX - maxX;
    if (minZ < -limitZ) shiftZ = -limitZ - minZ;
    if (maxZ > limitZ) shiftZ = limitZ - maxZ;

    return {
      x: currentX + shiftX,
      z: currentZ + shiftZ,
      clamped: shiftX !== 0 || shiftZ !== 0,
      oversized: false,
    };
  }

  // Sphere uses the green cloth (floor) edge as the container boundary,
  // matching the floor's visible radius so models can roam the entire green area.
  const sphereFloorRadius = getContainerFloorGeometry("sphere").args[0];

  const limits: Record<ContainerKey, number> = {
    jar: 1.62,
    cuboid: 2.08,
    sphere: sphereFloorRadius,
    pedestal: 2.5,
  };
  const limit = limits[container];
  const radius = Math.sqrt((width / 2) ** 2 + (depth / 2) ** 2);

  if (radius > limit) {
    return {
      x: currentX - boundsCenterX,
      z: currentZ - boundsCenterZ,
      clamped: true,
      oversized: true,
    };
  }

  const distance = Math.sqrt(boundsCenterX * boundsCenterX + boundsCenterZ * boundsCenterZ);
  const maxDistance = limit - radius;

  if (distance <= maxDistance) {
    return { x: currentX, z: currentZ, clamped: false, oversized: false };
  }

  const ratio = distance === 0 ? 0 : maxDistance / distance;
  return {
    x: currentX + boundsCenterX * ratio - boundsCenterX,
    z: currentZ + boundsCenterZ * ratio - boundsCenterZ,
    clamped: true,
    oversized: false,
  };
}
