"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

type FormValues = z.infer<typeof schema>;

export function AuthShowcase() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "creator@example.com",
      password: "123456",
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7eb,transparent_32%),linear-gradient(135deg,#dfece6,#f6e6da)] px-4 py-5 md:px-8 flex flex-col justify-center">        
      <div className="mx-auto grid max-w-6xl w-full gap-4 lg:grid-cols-[1.1fr_0.9fr] items-stretch"> 
        <section className="rounded-[40px] border border-white/45 bg-white/50 p-6 shadow-[0_34px_90px_rgba(15,18,31,0.14)] backdrop-blur-[24px] flex flex-col justify-center">
          <Link
            href="/"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-800 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="mt-8 text-xs font-semibold tracking-[0.34em] text-zinc-500 uppercase">Studio Access</p>
          <h1 className="mt-4 text-5xl leading-[1.04] font-semibold text-zinc-900">
            登录后把你的微观景象
            <span className="block text-zinc-700">从本地带到云端。</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
            首版工作流支持本地草稿创作和后续账号同步。完成登录后，平台将为每个景观保存副本、导出记录与分享状态。
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: UserRound, title: "项目同步", text: "把本地景观同步到个人项目页" },
              { icon: LockKeyhole, title: "安全保存", text: "模板副本和自建景观都可持续编辑" },
              { icon: Mail, title: "作品回流", text: "分享访问后可继续回到工作台编辑" },
            ].map((item) => (
              <div key={item.title} className="rounded-[26px] border border-white/50 bg-white/60 p-4">
                <item.icon className="h-5 w-5 text-zinc-700" />
                <p className="mt-4 text-sm font-medium text-zinc-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[40px] border border-white/45 bg-white/56 p-6 shadow-[0_34px_90px_rgba(15,18,31,0.14)] backdrop-blur-[24px] min-h-[560px] flex flex-col justify-center">
          <form
            onSubmit={handleSubmit(async () => {
              await new Promise((resolve) => setTimeout(resolve, 500));
              router.push("/");
            })}
            className="rounded-[30px] border border-white/60 bg-white/72 p-5"
          >
            <p className="text-sm font-medium text-zinc-900">账号登录</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">登录后可同步本地草稿、保存云端景观并管理分享链接。</p>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-600">邮箱</span>
                <input
                  {...register("email")}
                  className="w-full rounded-[18px] border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                />
                {errors.email ? <span className="mt-2 block text-xs text-rose-500">{errors.email.message}</span> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-zinc-600">密码</span>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-[18px] border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                />
                {errors.password ? (
                  <span className="mt-2 block text-xs text-rose-500">{errors.password.message}</span>
                ) : null}
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center rounded-[20px] bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {isSubmitting ? "登录中..." : "登录并同步"}
            </button>
            <Link
              href="/studio/my-first-landscape"
              className="mt-3 flex w-full items-center justify-center rounded-[20px] border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              继续体验本地创作
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
