"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { SceneCanvas } from "@/components/studio/SceneCanvas";
import { seasons } from "@/lib/data/studio-presets";
import { decodeSharePayload } from "@/lib/utils/share";

interface SharePreviewProps {
  token: string;
}

export function SharePreview({ token }: SharePreviewProps) {
  const payload = useMemo(() => decodeSharePayload(token), [token]);
  const season = seasons.find((entry) => entry.key === payload?.templateSeason);

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#dbe7e1,#f4e7df)] px-4">
        <div className="rounded-[30px] border border-white/50 bg-white/60 p-6 text-center shadow-[0_30px_80px_rgba(15,18,31,0.12)] backdrop-blur-xl">
          <p className="text-lg font-medium text-zinc-900">分享链接无效或已损坏</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-5 md:px-8"
      style={{
        background: `radial-gradient(circle at 18% 18%, ${season?.background.glow}, transparent 24%),
          linear-gradient(135deg, ${season?.background.primary}, ${season?.background.secondary})`,
      }}
    >
      <div className="mx-auto max-w-6xl rounded-[40px] border border-white/45 bg-white/40 p-5 shadow-[0_40px_120px_rgba(15,18,31,0.14)] backdrop-blur-[22px]">
        <div className="flex flex-col gap-4 rounded-[32px] border border-white/50 bg-white/60 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-800 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold tracking-[0.34em] text-zinc-500 uppercase">Shared Landscape</p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-900">{payload.title}</h1>
              <p className="mt-2 text-sm text-zinc-600">
                {season?.label} · {payload.container} · {payload.themeMode === "dark" ? "深色模式" : "浅色模式"}
              </p>
            </div>
          </div>
          <Link
            href="/studio/my-first-landscape"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            在工作台中继续创作
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5">
          <SceneCanvas
            season={payload.templateSeason}
            container={payload.container}
            themeMode={payload.themeMode}
            light={{ intensity: 1.05, azimuth: 0.28, elevation: 0.68 }}
            items={payload.items}
            selectedItemId={null}
            onSelect={() => undefined}
            onCanvasReady={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}
