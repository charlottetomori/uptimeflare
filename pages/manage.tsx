import Head from 'next/head'
import Link from 'next/link'
import MonitorManager from '@/components/MonitorManager'

export default function ManagePage() {
  return (
    <>
      <Head>
        <title>添加网站 - 服务状态</title>
      </Head>
      <main className="min-h-screen bg-[#f7f3eb] px-4 py-10 text-stone-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-950"
          >
            返回状态页
          </Link>

          <MonitorManager />
        </div>
      </main>
    </>
  )
}
