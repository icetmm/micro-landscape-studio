import { containers, defaultProjects, seasons } from "@/lib/data/studio-presets";

export async function GET() {
  return Response.json({
    seasons,
    containers,
    templates: defaultProjects.filter((project) => project.readOnly),
  });
}
