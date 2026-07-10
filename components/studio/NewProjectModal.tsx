"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, icon: string) => void;
  themeColor?: string;
}

const defaultIcons = ["🌱", "🌸", "🌵", "🍄", "🍁", "🌲", "🍀", "🌻"];

export function NewProjectModal({ isOpen, onClose, onSubmit, themeColor = "#f3ece3" }: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🌱");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), icon);
      setTitle("");
      setIcon("🌱");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/45 p-6 shadow-[0_40px_120px_rgba(15,18,31,0.2)]"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6)), ${themeColor}`,
            }}
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full bg-black/5 p-2 text-zinc-700 transition hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-semibold text-zinc-900">创建新景观</h2>
            <p className="mt-2 text-sm text-zinc-600">给你的新微观世界起个名字吧。</p>
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-4 flex items-center justify-between gap-2 rounded-[20px] border border-white/60 bg-white/50 p-2">
                {defaultIcons.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIcon(item)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                      icon === item
                        ? "bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                        : "hover:bg-white/60"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：我的春日花园"
                className="w-full rounded-[20px] border border-white/60 bg-white/70 px-5 py-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!title.trim()}
                className="mt-4 flex w-full items-center justify-center rounded-[20px] bg-zinc-950 px-4 py-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                开始创作
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
