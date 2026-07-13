import { describe, expect, it } from "vitest";
import { defaultProjects } from "../lib/data/studio-presets";

describe("studio presets", () => {
  it("autumn piano preset has a single effective scale roughly 3 times 0.36", () => {
    const autumnProject = defaultProjects.find(p => p.id === "autumn-colors");
    expect(autumnProject).toBeDefined();

    const pianoItem = autumnProject?.items.find(item => item.id === "autumn-piano");
    expect(pianoItem).toBeDefined();

    // 0.36 * 3 = 1.08
    expect(pianoItem?.scale).toBeCloseTo(1.08);
    // scale3 should not be provided or should be equivalent to [1, 1, 1]
    // The requirement states that it uses a single explicit unified scaling path.
    expect(pianoItem?.scale3).toBeUndefined();
  });
});
