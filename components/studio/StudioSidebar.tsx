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
  onUpdateProjectIcon: (projectId: string, icon: string) => void;
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
  onUpdateProjectIcon,
  activeProject,
}: StudioSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const customProjects = useMemo(() => projects.filter((p) => !p.readOnly), [projects]);
  const defaultTemplates = useMemo(() => projects.filter((p) => p.readOnly), [projects]);
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [editingIconId, setEditingIconId] = useState<string | null>(null);
  const [editingIconValue, setEditingIconValue] = useState("");

  return (
    <aside className="flex h-full flex-col">
      <section className="flex flex-1 min-h-0 flex-col rounded-[40px] border border-white/45 bg-white/52 p-4 shadow-[0_24px_60px_rgba(17,20,31,0.12)] backdrop-blur-2xl">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:bg-white"
        >
          <FolderPlus className="h-4 w-4" />
          新建景观
        </button>
        <div className="mt-4 flex min-h-0 flex-col overflow-y-auto custom-scrollbar">
          <div className="mb-2 px-1">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">默认模板</p>
          </div>
          <div className="space-y-2">
            {defaultTemplates.map((project) => (
              <div
                key={project.id}
                className={`flex items-center justify-between rounded-[24px] border px-4 py-4 transition cursor-pointer ${
                  project.id === activeProjectId
                    ? "border-[#ead7b4] bg-white/82 shadow-[0_16px_36px_rgba(85,63,28,0.14)]"
                    : "border-white/50 bg-white/44 hover:bg-white/70"
                }`}
                onClick={() => onOpenProject(project.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenProject(project.id);
                  }
                }}
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-zinc-950/8 px-2 py-1 text-base">
                      {project.icon || seasons.find((entry) => entry.key === project.templateSeason)?.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{project.title}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{project.backgroundLabel}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloneProject(project.id);
                  }}
                  className="shrink-0 rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-black/10 ml-2"
                  aria-label="复制项目"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
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
                  {customProjects.map(project => (
                    <div
                      key={project.id}
                      className={`group flex items-center justify-between rounded-[24px] border px-4 py-4 transition cursor-pointer ${
                        project.id === activeProjectId
                          ? "border-[#ead7b4] bg-white/82 shadow-[0_16px_36px_rgba(85,63,28,0.14)]"
                          : "border-white/50 bg-white/44 hover:bg-white/70"
                      }`}
                      onClick={() => onOpenProject(project.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOpenProject(project.id);
                        }
                      }}
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 rounded-full bg-zinc-950/8 px-2 py-1 text-base relative group/icon">
                            {editingIconId === project.id ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingIconValue}
                                onChange={(e) => setEditingIconValue(e.target.value.slice(0, 2))}
                                onBlur={() => {
                                  if (editingIconValue.trim()) {
                                    onUpdateProjectIcon(project.id, editingIconValue.trim());
                                  }
                                  setEditingIconId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    if (editingIconValue.trim()) {
                                      onUpdateProjectIcon(project.id, editingIconValue.trim());
                                    }
                                    setEditingIconId(null);
                                  }
                                  if (e.key === "Escape") {
                                    setEditingIconId(null);
                                  }
                                }}
                                className="w-8 rounded border border-zinc-300 bg-white px-1 py-0.5 text-center text-base text-zinc-900 outline-none focus:border-zinc-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div
                                className="cursor-pointer transition-transform hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingIconId(project.id);
                                  setEditingIconValue(project.icon || seasons.find((entry) => entry.key === project.templateSeason)?.emoji || "🌱");
                                }}
                                title="点击修改图标"
                              >
                                {project.icon || seasons.find((entry) => entry.key === project.templateSeason)?.emoji}
                              </div>
                            )}
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
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-medium text-zinc-900">{project.title}</p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTitleId(project.id);
                                    setEditingTitleValue(project.title);
                                  }}
                                  className="shrink-0 text-zinc-400 opacity-0 transition hover:text-zinc-700 group-hover:opacity-100"
                                  aria-label="编辑名称"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloneProject(project.id);
                          }}
                          className="rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-black/10"
                          aria-label="复制项目"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project.id);
                          }}
                          className="rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-rose-100 hover:text-rose-600"
                          aria-label="删除项目"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/projects"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white/60 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-white/90 hover:text-zinc-900 border border-white/80 shadow-sm"
                  >
                    前往项目管理
                  </Link>
                </div>
              )}
            </div>
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
