import { describe, expect, it } from "vitest";

import { getContainerFloorGeometry, clampToContainer, clampBoundingBoxToContainer } from "../lib/studio-geometry";

describe("studio-geometry helpers", () => {
  it("jar container floor radius is smaller than safe inner wall limit", () => {
    const floorGeometry = getContainerFloorGeometry("jar");
    expect(floorGeometry.type).toBe("circle");
    
    // The safe radius for drag and drop is 1.62, the visual floor should be smaller to avoid leaking green color
    const visualRadius = floorGeometry.args[0];
    expect(visualRadius).toBeLessThan(1.62);
    expect(visualRadius).toBe(1.2);
  });

  it("sphere container floor radius matches the green cloth (floor) edge", () => {
    const floorGeometry = getContainerFloorGeometry("sphere");
    expect(floorGeometry.type).toBe("circle");

    // Sphere shell: centerY 0.28, radius 2.38, floorY -1.05.
    // At that floor height the visible glass cross-section is about 1.97.
    // The green cloth edge is defined as the container boundary itself,
    // so the floor radius is the boundary used by the clamp helpers.
    const glassRadiusAtFloor = Math.sqrt(2.38 ** 2 - (0.28 - -1.05) ** 2);
    const visualRadius = floorGeometry.args[0];

    expect(visualRadius).toBeLessThanOrEqual(glassRadiusAtFloor);
    expect(visualRadius).toBe(1.96);
  });

  it("clampToContainer correctly identifies drag limits which is different from floor bounds", () => {
    // 1.45 visual limit vs 1.62 drag limit
    const clampedInside = clampToContainer("jar", 1.5, 0);
    expect(clampedInside.clamped).toBe(false);

    const clampedOutside = clampToContainer("jar", 2.0, 0);
    expect(clampedOutside.clamped).toBe(true);
    expect(clampedOutside.x).toBeCloseTo(1.62);
  });

  it("clampBoundingBoxToContainer correctly clamps to cuboid walls", () => {
    // limitX is 2.08, limitZ is 1.05
    // box from x: 1 to 3 (width 2), z: 0 to 1 (depth 1)
    // currentX is 2, currentZ is 0.5
    // Box exceeds 2.08 by 0.92 on the right.
    const result = clampBoundingBoxToContainer("cuboid", 1, 3, 0, 1, 2, 0.5);
    expect(result.clamped).toBe(true);
    expect(result.oversized).toBe(false);
    expect(result.x).toBeCloseTo(2.08 - 1); // 1.08
  });

  it("clampBoundingBoxToContainer correctly clamps to circular container walls", () => {
    // sphere limit equals the green cloth (floor) radius, which is 1.96
    // box is 1x1, radius is approx 0.707
    // max distance is 1.96 - 0.707 = 1.253
    // currentX is 1.5, currentZ is 0 -> distance 1.5
    const result = clampBoundingBoxToContainer("sphere", 1, 2, -0.5, 0.5, 1.5, 0);
    expect(result.clamped).toBe(true);
    expect(result.oversized).toBe(false);
    expect(result.x).toBeCloseTo(1.96 - Math.sqrt(0.5 * 0.5 + 0.5 * 0.5));
  });

  it("uses the measured bounds center for an off-center circular model", () => {
    const result = clampBoundingBoxToContainer(
      "sphere",
      1.2,
      2.2,
      -0.5,
      0.5,
      0,
      0,
    );

    const radius = Math.sqrt(0.5 ** 2 + 0.5 ** 2);
    const expectedShift = 1.96 - radius - 1.7;
    expect(result.clamped).toBe(true);
    expect(result.x).toBeCloseTo(expectedShift);
    expect(result.z).toBeCloseTo(0);
  });

  it("clampBoundingBoxToContainer returns oversized if box is larger than container", () => {
    // cuboid limit 2.08 * 2 = 4.16, width 5 > 4.16
    const resultCuboid = clampBoundingBoxToContainer("cuboid", -2.5, 2.5, -0.5, 0.5, 0, 0);
    expect(resultCuboid.clamped).toBe(true);
    expect(resultCuboid.oversized).toBe(true);
    expect(resultCuboid.x).toBe(0);
    expect(resultCuboid.z).toBe(0);

    // sphere limit 1.96, radius > 1.96
    const resultSphere = clampBoundingBoxToContainer("sphere", -2, 2, -2, 2, 0, 0);
    expect(resultSphere.clamped).toBe(true);
    expect(resultSphere.oversized).toBe(true);
    expect(resultSphere.x).toBe(0);
    expect(resultSphere.z).toBe(0);
  });
});
