"use client";

import { ArrowLeft, Clock3, Copy, Edit3, Trash2, ImagePlus } from "lucide-react";
import Link from "next/link";

import { seasons } from "@/lib/data/studio-presets";
import { useStudioStore } from "@/store/useStudioStore";

export function ProjectsClient() {
  const { projects, cloneProject, deleteProject, updateProjectCover, activeProjectId } = useStudioStore();

  const handleUploadCover = (projectId: string, files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    updateProjectCover(projectId, url);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6e5,transparent_32%),linear-gradient(135deg,#d9e9df,#f2e1d9)] px-4 py-5 md:px-8">
      <div className="mx-auto max-w-7xl rounded-[40px] border border-white/45 bg-white/46 p-5 shadow-[0_40px_120px_rgba(15,18,31,0.14)] backdrop-blur-[24px]">
        <div className="flex flex-col gap-4 rounded-[32px] border border-white/50 bg-white/62 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/studio/${activeProjectId}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-800 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold tracking-[0.34em] text-zinc-500 uppercase">Project Library</p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-900">我的景观项目</h1>
            </div>
          </div>
          <Link
            href="/studio/my-first-landscape"
            className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            继续创作
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.filter(project => !project.isUnmodifiedDefault).map((project) => {
            const season = seasons.find((entry) => entry.key === project.templateSeason);
            return (
              <article
                key={project.id}
                className="rounded-[30px] border border-white/50 bg-white/60 p-5 shadow-[0_20px_48px_rgba(15,18,31,0.08)] backdrop-blur-xl flex flex-col"
              >
                <div
                  className="group relative h-44 shrink-0 overflow-hidden rounded-[24px] bg-cover bg-center bg-no-repeat transition-all"
                  style={
                    project.coverUrl
                      ? { backgroundImage: `url(${project.coverUrl})` }
                      : season?.previewUrl
                      ? { backgroundImage: `url(${season.previewUrl})` }
                      : {
                          background: `radial-gradient(circle at 30% 30%, ${season?.background.glow}, transparent 26%),
                            linear-gradient(135deg, ${season?.background.primary}, ${season?.background.secondary})`,
                        }
                  }
                >
                  <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:opacity-100 group-hover:opacity-100">
                    <ImagePlus className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">上传封面图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadCover(project.id, e.target.files)}
                    />
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{project.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {project.readOnly ? "默认只读模板" : "可编辑项目"} · {season?.label}
                    </p>
                  </div>
                  <div className="rounded-full bg-black/5 px-3 py-1 text-lg">{season?.emoji}</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  最近更新 {new Date(project.updatedAt).toLocaleDateString("zh-CN")}
                </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Link
                      href={`/studio/${project.id}`}
                      className="flex items-center justify-center gap-2 rounded-[18px] bg-zinc-950 px-3 py-3 text-xs font-medium text-white transition hover:bg-zinc-800"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => cloneProject(project.id)}
                      className="flex items-center justify-center gap-2 rounded-[18px] bg-white px-3 py-3 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      复制
                    </button>
                    <button
                      type="button"
                      disabled={project.readOnly}
                      onClick={() => deleteProject(project.id)}
                      className="flex items-center justify-center gap-2 rounded-[18px] bg-rose-50 px-3 py-3 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </button>
                  </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
