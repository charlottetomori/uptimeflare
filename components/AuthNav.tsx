import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AuthNav({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.replace('/')
  }

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 lg:right-8">
      {isAdmin && (
        <Link
          href="/manage"
          className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
        >
          站点管理
        </Link>
      )}
      {isAdmin ? (
        <button
          type="button"
          onClick={logout}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          退出
        </button>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          登录
        </Link>
      )}
    </div>
  )
}
