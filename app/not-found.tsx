import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Página não encontrada</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
