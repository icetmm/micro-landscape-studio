"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, FolderPlus, Trash2, Pencil, ChevronDown, FolderOpen } from "lucide-react";    
import { useMemo } from "react";

import { seasons } from "@/lib/data/studio-presets";
import type { StudioProject } from "@/lib/types";
import { NewProjectModal } from "./NewProjectModal";

interface StudioSidebarProps {
  activeProjectId: string;
  projects: StudioProject[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: (title: string, icon: string) => void;
  onCloneProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectTitle: (projectId: string, title: string) => void;
  activeProject: StudioProject;
}

export function StudioSidebar({
  activeProjectId,
  projects,
  onOpenProject,
  onCreateProject,
  onCloneProject,
  onDeleteProject,
  onUpdateProjectTitle,
  activeProject,
}: StudioSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const customProjects = useMemo(() => projects.filter((p) => !p.readOnly), [projects]);
  const defaultTemplates = useMemo(() => projects.filter((p) => p.readOnly), [projects]);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  return (
    <aside className="flex h-full flex-col self-start">
      <section className="flex min-h-0 flex-col rounded-[40px] border border-white/45 bg-white/52 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:bg-white"
        >
          <FolderPlus className="h-4 w-4" />
          新建景观
        </button>
        <div className="mt-4 flex min-h-0 flex-col overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {defaultTemplates.map((project) => (
              <div
                key={project.id}
                className={`rounded-[24px] border px-3 py-3 transition ${
                  project.id === activeProjectId
                    ? "border-[#ead7b4] bg-white/82 shadow-[0_16px_36px_rgba(85,63,28,0.14)]"
                    : "border-white/50 bg-white/44 hover:bg-white/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onOpenProject(project.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-zinc-950/8 px-2 py-1 text-base">
                      {project.icon || seasons.find((entry) => entry.key === project.templateSeason)?.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{project.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{project.backgroundLabel}</p>
                    </div>
                  </div>
                </button>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <span>默认模板</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onCloneProject(project.id)}
                      className="rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-black/10"
                      aria-label="复制项目"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {customProjects.length > 0 && (
            <div className="mt-4 rounded-[24px] border border-white/50 bg-white/30 p-2">
              <button
                type="button"
                onClick={() => setIsFolderOpen(!isFolderOpen)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-zinc-800 transition hover:text-zinc-950"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-zinc-700" />
                  我的创作
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform ${isFolderOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isFolderOpen && (
                <div className="mt-2 space-y-2 pl-2">
                  {customProjects.slice(0, 2).map((project) => (
                    <div
                      key={project.id}
                      className={`group rounded-[20px] border px-3 py-3 transition ${
                        project.id === activeProjectId
                          ? "border-[#ead7b4] bg-white/82 shadow-[0_16px_36px_rgba(85,63,28,0.14)]"
                          : "border-white/50 bg-white/44 hover:bg-white/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onOpenProject(project.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 rounded-full bg-zinc-950/8 px-2 py-1 text-base">
                              {project.icon || seasons.find((entry) => entry.key === project.templateSeason)?.emoji}
                            </div>
                            <div className="min-w-0 flex-1 pr-2">
                              {editingTitleId === project.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingTitleValue}
                                  onChange={(e) => setEditingTitleValue(e.target.value)}
                                  onBlur={() => {
                                    if (editingTitleValue.trim()) {
                                      onUpdateProjectTitle(project.id, editingTitleValue.trim());
                                    }
                                    setEditingTitleId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (editingTitleValue.trim()) {
                                        onUpdateProjectTitle(project.id, editingTitleValue.trim());
                                      }
                                      setEditingTitleId(null);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingTitleId(null);
                                    }
                                  }}
                                  className="w-full rounded border border-zinc-300 bg-white px-1 py-0.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <p className="truncate text-sm font-medium text-zinc-900">{project.title}</p>
                              )}
                              <p className="mt-1 truncate text-xs text-zinc-500">{project.backgroundLabel}</p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(project.id);
                            setEditingTitleValue(project.title);
                          }}
                          className="shrink-0 rounded-full p-1.5 text-zinc-400 opacity-0 transition hover:bg-black/5 hover:text-zinc-700 group-hover:opacity-100"
                          aria-label="编辑名称"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <span>可编辑项目</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onCloneProject(project.id)}
                            className="rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-black/10"
                            aria-label="复制项目"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(project.id)}
                            className="rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-rose-100 hover:text-rose-600"
                            aria-label="删除项目"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {customProjects.length > 2 && (
            <Link
              href="http://localhost:3000/projects"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              更多自定义项目请前往项目页
            </Link>
          )}
        </div>
      </section>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(title, icon) => {
          onCreateProject(title, icon);
          setIsModalOpen(false);
        }}
        themeColor={
          seasons.find((s) => s.key === activeProject.templateSeason)?.background.glow
        }
      />
    </aside>
  );
}
