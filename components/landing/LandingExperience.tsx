"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { containers, defaultProjects, seasons } from "@/lib/data/studio-presets";
import { NewProjectModal } from "@/components/studio/NewProjectModal";
import { useStudioStore } from "@/store/useStudioStore";

export function LandingExperience() {
  const router = useRouter();
  const { createProject } = useStudioStore();
  const [activeSeason, setActiveSeason] = useState(seasons[0].key);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const seasonMeta = useMemo(
    () => seasons.find((entry) => entry.key === activeSeason) ?? seasons[0],
    [activeSeason],
  );
  const seasonProject = useMemo(
    () => defaultProjects.find((project) => project.templateSeason === activeSeason) ?? defaultProjects[0],
    [activeSeason],
  );

  const handleCreateProject = (title: string, icon: string) => {
    const id = createProject(activeSeason, containers[0].key, title, icon);
    router.push(`/studio/${id}`);
  };

  return (
    <div
      className="min-h-screen overflow-hidden px-4 py-5 md:px-8 flex flex-col justify-center"
      style={{
        background: `radial-gradient(circle at 18% 18%, ${seasonMeta.background.glow}, transparent 26%),
          radial-gradient(circle at 82% 16%, rgba(255,255,255,0.64), transparent 18%),
          linear-gradient(135deg, ${seasonMeta.background.primary}, ${seasonMeta.background.secondary})`,
      }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-6 xl:grid-cols-[1fr_380px] items-center w-full">
        <main className="flex flex-col gap-6">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[40px] border border-white/45 bg-white/40 p-8 shadow-[0_40px_120px_rgba(15,18,31,0.14)] backdrop-blur-[22px]"
          >
            <p className="text-xs font-semibold tracking-[0.34em] text-zinc-500 uppercase">
              3D Micro Landscape Studio
            </p>
            <h1 className="mt-6 max-w-2xl text-5xl leading-[1.1] font-semibold text-zinc-900 md:text-7xl">
              把照片、季节与容器
              <span className="block text-zinc-700">雕刻成可旋转的微观景象。</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              平台内置春夏秋冬默认景观、动态联动背景和可切换容器体系，支持用户上传照片生成元素卡片，进入 3D
              工作台继续摆放、导出与分享。
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/studio/${seasonProject.id}?template=${activeSeason}`}   
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-4 text-base font-medium text-white transition hover:bg-zinc-800"       
              >
                进入创作工作台
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-4 text-base font-medium text-zinc-800 transition hover:bg-white shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
              >
                查看项目管理
              </Link>
            </div>
          </motion.header>
        </main>

        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="rounded-[34px] border border-white/45 bg-white/40 p-5 shadow-[0_34px_90px_rgba(15,18,31,0.14)] backdrop-blur-[24px]">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex w-full items-center gap-3 rounded-[24px] border border-white/70 bg-white/68 px-4 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition hover:bg-white"
            >
              <div className="rounded-full bg-zinc-950/8 px-3 py-2 text-xl">+</div>
              <div>
                <p className="text-sm font-medium text-zinc-900">New Landscape</p>
                <p className="mt-1 text-xs text-zinc-500">创建新的微观世界</p>
              </div>
            </button>
            <div className="mt-5 space-y-3">
              {seasons.map((season) => (
                <button
                  key={season.key}
                  type="button"
                  onClick={() => setActiveSeason(season.key)}
                  className={`flex w-full items-center gap-4 rounded-[24px] border px-5 py-4 text-left transition ${
                    activeSeason === season.key
                      ? "border-[#ead7b4] bg-white/82 shadow-[0_14px_32px_rgba(85,63,28,0.14)]"
                      : "border-white/50 bg-white/40 hover:bg-white/68"
                  }`}
                >
                  <div className="text-3xl">{season.emoji}</div>
                  <div>
                    <p className="font-medium text-zinc-900">{season.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{season.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <Link
            href="/auth"
            className="flex items-center justify-center rounded-[28px] border border-white/65 bg-white/50 px-6 py-5 text-sm font-medium text-zinc-800 shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition hover:bg-white"
          >
            登录并同步你的景观
          </Link>
        </motion.aside>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        themeColor={seasonMeta.background.glow}
      />
    </div>
  );
}
