import type { ContainerKey } from "@/lib/types";

export function getContainerFloorY(container: ContainerKey) {
  if (container === "jar") {
    return -1.26;
  }
  if (container === "cuboid") {
    return -0.83;
  }

  if (container === "sphere") {
    return -0.55;
  }

  return -0.53;
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

  const limits: Record<ContainerKey, number> = {
    jar: 1.62,
    cuboid: 2.08,
    sphere: 1.6,
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


