import { StudioWorkspace } from "@/components/studio/StudioWorkspace";

interface StudioPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { projectId } = await params;

  return <StudioWorkspace projectId={projectId} />;
}
