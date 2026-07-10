"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { assetLibrary, defaultProjects } from "@/lib/data/studio-presets";
import { getContainerFloorY } from "@/lib/studio-geometry";
import type {
  ContainerKey,
  LibraryAsset,
  LightSettings,
  ProjectItem,
  SeasonKey,
  SharedPayload,
  StudioProject,
  ThemeMode,
} from "@/lib/types";

interface StudioState {
  projects: StudioProject[];
  history: StudioProject[][];
  canUndo: boolean;
  libraryAssets: LibraryAsset[];
  uploadedAssets: LibraryAsset[];
  activeProjectId: string;
  selectedItemId: string | null;
  light: LightSettings;
  mobileEditMode: boolean;
  openProject: (projectId: string) => void;
  createProject: (season: SeasonKey, container?: ContainerKey, title?: string, icon?: string) => string;
  cloneProject: (projectId: string) => string | null;
  deleteProject: (projectId: string) => void;
  updateProjectTitle: (projectId: string, title: string) => void;
  updateProjectCover: (projectId: string, coverUrl: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSeason: (season: SeasonKey) => void;
  setContainer: (container: ContainerKey) => void;
  setLight: (light: Partial<LightSettings>) => void;
  addItemFromAsset: (asset: LibraryAsset, position?: [number, number, number]) => void;
  updateItemTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale3?: [number, number, number]) => void;
  resetItemTransform: (id: string) => void;
  nudgeSelectedItem: (delta: [number, number, number]) => void;
  removeSelectedItem: () => void;
  undoLastChange: () => void;
  setSelectedItemId: (itemId: string | null) => void;
  addUploadedAssets: (assets: LibraryAsset[]) => void;
  hydrateSharedProject: (payload: SharedPayload) => void;
}

function now() {
  return new Date().toISOString();
}

function withFloorY(position: [number, number, number], container: ContainerKey): [number, number, number] {
  return [position[0], getContainerFloorY(container), position[2]];
}

function snapItemToFloor(item: ProjectItem, container: ContainerKey): ProjectItem {
  const floorPosition = withFloorY(item.position, container);
  return {
    ...item,
    position: floorPosition,
    initialTransform: item.initialTransform
      ? {
          ...item.initialTransform,
          position: withFloorY(item.initialTransform.position, container),
        }
      : item.initialTransform,
  };
}

function snapProjectItemsToFloor(project: StudioProject): StudioProject {
  return {
    ...project,
    items: project.items.map((item) => snapItemToFloor(item, project.container)),
  };
}

function createItemFromAsset(
  asset: LibraryAsset,
  position: [number, number, number],
  container: ContainerKey,
): ProjectItem {
  const finalPosition = withFloorY(position, container);
  const rotation: [number, number, number] = [0, Math.random() * Math.PI, 0];

  return {
    id: `${asset.id}-${Math.random().toString(36).slice(2, 9)}`,
    assetId: asset.id,
    name: asset.name,
    kind: asset.kind,
    category: asset.category,
    color: asset.color,
    accent: asset.accent,
    scale: asset.scale,
    position: [...finalPosition],
    rotation: [...rotation],
    initialTransform: {
      position: [...finalPosition],
      rotation: [...rotation],
      scale: asset.scale,
    },
    previewUrl: asset.previewUrl,
    modelUrl: asset.modelUrl,
    sourceType: asset.sourceType,
  };
}

function findProject(state: StudioState) {
  return state.projects.find((project) => project.id === state.activeProjectId);
}

function cloneProjects(projects: StudioProject[]) {
  return projects.map((project) => ({
    ...project,
    items: project.items.map((item) => ({
      ...item,
      position: [...item.position] as [number, number, number],
      rotation: [...item.rotation] as [number, number, number],
      scale3: item.scale3 ? ([...item.scale3] as [number, number, number]) : undefined,
      initialTransform: item.initialTransform
        ? {
            position: [...item.initialTransform.position] as [number, number, number],
            rotation: [...item.initialTransform.rotation] as [number, number, number],
            scale: item.initialTransform.scale,
            scale3: item.initialTransform.scale3
              ? ([...item.initialTransform.scale3] as [number, number, number])
              : undefined,
          }
        : undefined,
    })),
  }));
}

function withHistory(state: StudioState, projects: StudioProject[]) {
  return {
    projects,
    history: [cloneProjects(state.projects), ...state.history].slice(0, 30),
    canUndo: true,
  };
}

function updateActiveProject(
  state: StudioState,
  updater: (project: StudioProject) => StudioProject,
) {
  const activeProject = findProject(state);
  if (!activeProject || activeProject.readOnly) {
    return state;
  }

  return withHistory(
    state,
    state.projects.map((project) =>
      project.id === state.activeProjectId ? updater(project) : project,
    ),
  );
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      projects: defaultProjects.map(snapProjectItemsToFloor),
      history: [],
      canUndo: false,
      libraryAssets: assetLibrary,
      uploadedAssets: [],
      activeProjectId: "my-first-landscape",
      selectedItemId: null,
      light: {
        intensity: 1.05,
        azimuth: 0.24,
        elevation: 0.62,
      },
      mobileEditMode: false,
      openProject: (projectId) => {
        set({ activeProjectId: projectId, selectedItemId: null });
      },
      createProject: (season, container = "jar", title = "Untitled Landscape", icon = "plant") => {
        const id = `project-${Math.random().toString(36).slice(2, 8)}`;
        const newProject: StudioProject = {
          id,
          title,
          icon,
          source: "custom",
          templateSeason: season,
          container,
          description: "Custom landscape",
          backgroundLabel: "Custom background",
          themeMode: "light",
          readOnly: false,
          items: [],
          updatedAt: now(),
        };

        set((state) => {
          const systemProjects = state.projects.filter((project) => project.source === "system");
          const customProjects = state.projects.filter((project) => project.source !== "system");
          return {
            projects: [...systemProjects, ...customProjects, newProject],
            activeProjectId: id,
            selectedItemId: null,
          };
        });

        return id;
      },
      cloneProject: (projectId) => {
        const project = get().projects.find((entry) => entry.id === projectId);
        if (!project) {
          return null;
        }

        const id = `project-${Math.random().toString(36).slice(2, 8)}`;
        const clone: StudioProject = snapProjectItemsToFloor({
          ...project,
          id,
          title: `${project.title} Copy`,
          source: "template-copy",
          readOnly: false,
          items: project.items.map((item) => ({
            ...item,
            id: `${item.id}-${Math.random().toString(36).slice(2, 5)}`,
          })),
          updatedAt: now(),
        });

        set((state) => {
          const systemProjects = state.projects.filter((entry) => entry.source === "system");
          const customProjects = state.projects.filter((entry) => entry.source !== "system");
          return {
            projects: [...systemProjects, ...customProjects, clone],
            activeProjectId: id,
            selectedItemId: null,
          };
        });

        return id;
      },
      deleteProject: (projectId) => {
        set((state) => {
          const project = state.projects.find((entry) => entry.id === projectId);
          if (!project || project.readOnly) {
            return state;
          }

          const remaining = state.projects.filter((entry) => entry.id !== projectId);
          const fallback = remaining.find((entry) => !entry.readOnly) ?? remaining[0];

          return {
            projects: remaining,
            activeProjectId: fallback?.id ?? state.activeProjectId,
            selectedItemId: null,
          };
        });
      },
      updateProjectTitle: (projectId, title) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId && !project.readOnly
              ? { ...project, title, updatedAt: now() }
              : project,
          ),
        }));
      },
      updateProjectCover: (projectId, coverUrl) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, coverUrl, updatedAt: now() }
              : project,
          ),
        }));
      },
      setThemeMode: (mode) => {
        set((state) =>
          withHistory(
            state,
            state.projects.map((project) =>
              project.id === state.activeProjectId
                ? { ...project, themeMode: mode, updatedAt: now() }
                : project,
            ),
          ),
        );
      },
      setSeason: (season) => {
        set((state) =>
          updateActiveProject(state, (project) => ({
            ...project,
            templateSeason: season,
            updatedAt: now(),
          })),
        );
      },
      setContainer: (container) => {
        set((state) =>
          updateActiveProject(state, (project) =>
            snapProjectItemsToFloor({
              ...project,
              container,
              updatedAt: now(),
            }),
          ),
        );
      },
      setLight: (light) => {
        set((state) => ({
          light: { ...state.light, ...light },
        }));
      },
      addItemFromAsset: (asset, position) => {
        set((state) =>
          updateActiveProject(state, (project) => {
            const finalPosition = position ?? [0, getContainerFloorY(project.container), 0];
            return {
              ...project,
              items: [...project.items, createItemFromAsset(asset, finalPosition, project.container)],
              updatedAt: now(),
            };
          }),
        );
      },
      updateItemTransform: (id, position, rotation, scale3) => {
        set((state) =>
          updateActiveProject(state, (project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    position: withFloorY(position, project.container),
                    rotation: [...rotation],
                    scale3: scale3 ? [...scale3] : item.scale3,
                  }
                : item,
            ),
            updatedAt: now(),
          })),
        );
      },
      resetItemTransform: (id) => {
        set((state) =>
          updateActiveProject(state, (project) => ({
            ...project,
            items: project.items.map((item) => {
              if (item.id === id && item.initialTransform) {
                return {
                  ...item,
                  position: withFloorY(item.initialTransform.position, project.container),
                  rotation: [...item.initialTransform.rotation],
                  scale: item.initialTransform.scale,
                  scale3: item.initialTransform.scale3 ? [...item.initialTransform.scale3] : undefined,
                };
              }
              return item;
            }),
            updatedAt: now(),
          })),
        );
      },
      nudgeSelectedItem: (delta) => {
        set((state) =>
          updateActiveProject(state, (project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === state.selectedItemId
                ? {
                    ...item,
                    position: withFloorY(
                      [item.position[0] + delta[0], item.position[1] + delta[1], item.position[2] + delta[2]],
                      project.container,
                    ),
                  }
                : item,
            ),
            updatedAt: now(),
          })),
        );
      },
      removeSelectedItem: () => {
        set((state) => ({
          ...updateActiveProject(state, (project) => ({
            ...project,
            items: project.items.filter((item) => item.id !== state.selectedItemId),
            updatedAt: now(),
          })),
          selectedItemId: null,
        }));
      },
      undoLastChange: () => {
        set((state) => {
          const [previousProjects, ...remainingHistory] = state.history;
          if (!previousProjects) {
            return state;
          }

          const snappedProjects = cloneProjects(previousProjects).map(snapProjectItemsToFloor);
          const activeProject = snappedProjects.find((project) => project.id === state.activeProjectId);
          const selectedItemStillExists = activeProject?.items.some((item) => item.id === state.selectedItemId);

          return {
            projects: snappedProjects,
            history: remainingHistory,
            canUndo: remainingHistory.length > 0,
            selectedItemId: selectedItemStillExists ? state.selectedItemId : null,
          };
        });
      },
      setSelectedItemId: (itemId) => {
        set({ selectedItemId: itemId });
      },
      addUploadedAssets: (assets) => {
        set((state) => ({
          uploadedAssets: [...assets, ...state.uploadedAssets],
        }));
      },
      hydrateSharedProject: (payload) => {
        const id = `shared-${Math.random().toString(36).slice(2, 8)}`;

        set((state) => {
          const systemProjects = state.projects.filter((project) => project.source === "system");
          const customProjects = state.projects.filter((project) => project.source !== "system");
          const sharedProject: StudioProject = snapProjectItemsToFloor({
            id,
            title: payload.title,
            source: "custom",
            templateSeason: payload.templateSeason,
            container: payload.container,
            description: "Shared project copy",
            backgroundLabel: "Shared project background",
            themeMode: payload.themeMode,
            readOnly: false,
            items: payload.items,
            updatedAt: now(),
          });
          return {
            projects: [...systemProjects, ...customProjects, sharedProject],
            activeProjectId: id,
          };
        });
      },
    }),
    {
      name: "micro-landscape-studio",
      partialize: (state) => ({
        projects: state.projects.filter((project) => project.source !== "system"),
        activeProjectId: state.activeProjectId,
        uploadedAssets: state.uploadedAssets,
        light: state.light,
      }),
      merge: (persistedState: unknown, currentState) => {
        const state = persistedState as Partial<StudioState>;
        if (!state || !state.projects) {
          return { ...currentState, ...state };
        }

        const customProjects = state.projects.filter((project) => project.source !== "system").map(snapProjectItemsToFloor);
        const systemProjects = defaultProjects.filter((project) => project.source === "system").map(snapProjectItemsToFloor);

        return {
          ...currentState,
          ...state,
          history: [],
          canUndo: false,
          projects: [...systemProjects, ...customProjects],
        };
      },
    },
  ),
);

export function useActiveProject() {
  return useStudioStore((state) => findProject(state) ?? state.projects[0]);
}
