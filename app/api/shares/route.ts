import { encodeSharePayload } from "@/lib/utils/share";
import type { SharedPayload } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as SharedPayload;
  const token = encodeSharePayload(payload);

  return Response.json({
    token,
    shareUrl: `/share/${token}`,
  });
}
