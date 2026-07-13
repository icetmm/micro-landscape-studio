import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultProjects } from "../lib/data/studio-presets";
import { useStudioStore } from "../store/useStudioStore";

describe("studio store automatic constraints", () => {
  const initialState = useStudioStore.getState();
  let consoleError: ReturnType<typeof vi.spyOn>;
  let consoleWarn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    useStudioStore.setState(initialState, true);
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("allows system layout to move an item in a read-only default project", () => {
    const project = defaultProjects.find((entry) => entry.readOnly && entry.items.length > 0);
    expect(project).toBeDefined();

    useStudioStore.setState({
      projects: defaultProjects,
      activeProjectId: project!.id,
    });

    const item = project!.items[0];
    const target: [number, number, number] = [0.25, item.position[1], -0.25];
    useStudioStore.getState().constrainItemPosition(item.id, target);

    const updatedProject = useStudioStore.getState().projects.find((entry) => entry.id === project!.id);
    const updatedItem = updatedProject?.items.find((entry) => entry.id === item.id);
    expect(updatedItem?.position).toEqual(target);
    expect(useStudioStore.getState().canUndo).toBe(false);
  });
});
