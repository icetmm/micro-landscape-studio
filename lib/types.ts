export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export type ContainerKey = "jar" | "cuboid" | "sphere" | "pedestal";

export type ThemeMode = "light" | "dark";

export type AssetCategory =
  | "flora"
  | "rocks"
  | "structures"
  | "figures"
  | "surface"
  | "uploaded";

export type ItemKind =
  | "tree"
  | "rock"
  | "bridge"
  | "lantern"
  | "animal"
  | "shrub"
  | "flower"
  | "upload-plane"
  | "model-3d";

export interface SeasonDefinition {
  key: SeasonKey;
  label: string;
  emoji: string;
  subtitle: string;
  accent: string;
  previewUrl?: string;
  background: {
    primary: string;
    secondary: string;
    glow: string;
    vignette: string;
  };
}

export interface ContainerDefinition {
  key: ContainerKey;
  label: string;
  description: string;
}

export interface LibraryAsset {
  id: string;
  name: string;
  category: AssetCategory;
  kind: ItemKind;
  color: string;
  accent: string;
  scale: number;
  previewUrl?: string;
  modelUrl?: string;
  sourceType?: "preset" | "upload" | "remote";
}

export interface ProjectItem {
  id: string;
  assetId: string;
  name: string;
  kind: ItemKind;
  category: AssetCategory;
  color: string;
  accent: string;
  scale: number;
  scale3?: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  initialTransform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
    scale3?: [number, number, number];
  };
  previewUrl?: string;
  modelUrl?: string;
  sourceType?: "preset" | "upload" | "remote";
}

export interface LightSettings {
  intensity: number;
  azimuth: number;
  elevation: number;
}

export interface StudioProject {
  id: string;
  title: string;
  icon?: string;
  coverUrl?: string;
  source: "system" | "template-copy" | "custom";
  templateSeason: SeasonKey;
  container: ContainerKey;
  description: string;
  backgroundLabel: string;
  themeMode: ThemeMode;
  readOnly: boolean;
  isUnmodifiedDefault?: boolean;
  items: ProjectItem[];
  updatedAt: string;
}

export interface SharedPayload {
  title: string;
  templateSeason: SeasonKey;
  container: ContainerKey;
  themeMode: ThemeMode;
  items: ProjectItem[];
}
