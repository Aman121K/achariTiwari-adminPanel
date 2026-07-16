import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

type RobotsValue = 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow'

type PageSeo = {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  robots?: RobotsValue
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

type StoreSettings = Record<string, unknown> & {
  seoTitle?: string
  seoDescription?: string
  pageSeo?: Record<string, PageSeo>
}

const pages = [
  { route: '/', name: 'Homepage', group: 'Shop' },
  { route: '/products', name: 'Products', group: 'Shop' },
  { route: '/reviews', name: 'Reviews', group: 'Shop' },
  { route: '/blog', name: 'Blog', group: 'Content' },
  { route: '/about', name: 'About', group: 'Content' },
  { route: '/contact', name: 'Contact', group: 'Content' },
  { route: '/privacy-policy', name: 'Privacy policy', group: 'Policies' },
  { route: '/terms-of-service', name: 'Terms of service', group: 'Policies' },
  { route: '/shipping-policy', name: 'Shipping policy', group: 'Policies' },
  { route: '/refund-policy', name: 'Refund policy', group: 'Policies' },
] as const

const emptySeo = (): PageSeo => ({
  title: '',
  description: '',
  keywords: [],
  canonical: '',
  robots: 'index,follow',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
})

const getSeo = (pageSeo: Record<string, PageSeo>, route: string) => ({ ...emptySeo(), ...(pageSeo[route] || {}) })
const titleHealthy = (value = '') => value.length >= 50 && value.length <= 60
const descriptionHealthy = (value = '') => value.length >= 140 && value.length <= 160
const isSocialReady = (seo: PageSeo) => Boolean(seo.ogTitle && seo.ogDescription && seo.ogImage)
const isConfigured = (seo: PageSeo) => Boolean(seo.title && seo.description)

function Counter({ value, minimum, maximum }: { value: string; minimum: number; maximum: number }) {
  const healthy = value.length >= minimum && value.length <= maximum
  return (
    <span className={`text-xs font-semibold tabular-nums ${healthy ? 'text-emerald-700' : 'text-slate-500'}`}>
      {value.length} / {maximum} {healthy && <span className="sr-only">recommended length</span>}
    </span>
  )
}

function SummaryCard({ label, value, total, icon: Icon, tone }: { label: string; value: number; total: number; icon: typeof CheckCircle2; tone: 'amber' | 'green' | 'slate' }) {
  const colors = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
  return (
    <article className="flex min-h-[116px] items-start justify-between gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}<span className="ml-1 text-base font-medium text-slate-400">/ {total}</span></p>
      </div>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${colors}`}><Icon size={20} /></span>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading SEO settings">
      <div className="h-40 animate-pulse border border-slate-200 bg-white" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse border border-slate-200 bg-white" />)}
      </div>
      <div className="h-96 animate-pulse border border-slate-200 bg-white" />
    </div>
  )
}

export default function SeoManager() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [pageSeo, setPageSeo] = useState<Record<string, PageSeo>>({})
  const [activeRoute, setActiveRoute] = useState<string>('/')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [imageFailed, setImageFailed] = useState(false)

  const loadSettings = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiRequest('/store/settings')
      const nextSettings = (data.settings || {}) as StoreSettings
      setSettings(nextSettings)
      setPageSeo(nextSettings.pageSeo || {})
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load SEO settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const current = getSeo(pageSeo, activeRoute)
  const activePage = pages.find((page) => page.route === activeRoute) || pages[0]

  useEffect(() => { setImageFailed(false) }, [activeRoute, current.ogImage])

  const stats = useMemo(() => {
    const entries = pages.map((page) => getSeo(pageSeo, page.route))
    return {
      configured: entries.filter(isConfigured).length,
      titles: entries.filter((seo) => titleHealthy(seo.title)).length,
      descriptions: entries.filter((seo) => descriptionHealthy(seo.description)).length,
      social: entries.filter(isSocialReady).length,
    }
  }, [pageSeo])

  const updateField = <K extends keyof PageSeo>(field: K, value: PageSeo[K]) => {
    setPageSeo((previous) => ({
      ...previous,
      [activeRoute]: { ...getSeo(previous, activeRoute), [field]: value },
    }))
    setSaveState('idle')
    setSaveMessage('')
  }

  const save = async () => {
    if (!settings) return
    setSaveState('saving')
    setSaveMessage('Publishing metadata…')
    try {
      const payload = { ...settings, pageSeo }
      const data = await apiRequest('/store/settings', { method: 'PUT', body: JSON.stringify(payload) })
      const savedSettings = (data.settings || payload) as StoreSettings
      setSettings(savedSettings)
      setPageSeo(savedSettings.pageSeo || pageSeo)
      setSaveState('saved')
      setSaveMessage(`${activePage.name} metadata is live on the storefront.`)
    } catch (error) {
      setSaveState('error')
      setSaveMessage(error instanceof Error ? error.message : 'Unable to save metadata')
    }
  }

  const resetCurrentPage = () => {
    if (!window.confirm(`Clear all page-specific SEO fields for ${activePage.name}? Your default store metadata will be used after you save.`)) return
    setPageSeo((previous) => {
      const next = { ...previous }
      delete next[activeRoute]
      return next
    })
    setSaveState('idle')
    setSaveMessage('Page fields cleared locally. Save to publish this change.')
  }

  if (loading) return <LoadingState />

  if (loadError || !settings) {
    return (
      <section className="border border-red-200 bg-white p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-red-700"><AlertCircle /></span>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">SEO settings could not be loaded</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{loadError || 'The settings response was empty. Please try again.'}</p>
        <button type="button" onClick={loadSettings} className="mt-6 min-h-[44px] rounded-lg bg-slate-950 px-5 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">Try again</button>
      </section>
    )
  }

  const previewTitle = current.title || settings.seoTitle || `${activePage.name} | Achari Tiwari`
  const previewDescription = current.description || settings.seoDescription || `Discover ${activePage.name.toLowerCase()} from Achari Tiwari.`
  const previewUrl = current.canonical || `https://acharitiwari.vercel.app${activeRoute === '/' ? '' : activeRoute}`
  const progressFields = [current.title, current.description, current.keywords.length ? 'yes' : '', current.ogTitle, current.ogDescription, current.ogImage]
  const progress = Math.round((progressFields.filter(Boolean).length / progressFields.length) * 100)

  const groups = ['Shop', 'Content', 'Policies']

  return (
    <div className="space-y-5 pb-12">
      <header className="relative overflow-hidden border border-slate-800 bg-slate-950 px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <div className="absolute right-0 top-0 h-full w-32 border-l border-white/10 bg-amber-400/10 sm:w-56" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300"><Sparkles size={15} /> Search visibility workspace</div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Page-by-page SEO manager</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Shape how every public page appears in Google and social shares. Saved changes publish directly to storefront metadata.</p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="SEO health summary">
        <SummaryCard label="Pages configured" value={stats.configured} total={pages.length} icon={CheckCircle2} tone="slate" />
        <SummaryCard label="Titles healthy" value={stats.titles} total={pages.length} icon={Search} tone="amber" />
        <SummaryCard label="Descriptions healthy" value={stats.descriptions} total={pages.length} icon={Check} tone="green" />
        <SummaryCard label="Social previews ready" value={stats.social} total={pages.length} icon={Share2} tone="slate" />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24" aria-label="Storefront pages">
          <div className="border-b border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Storefront pages</p>
            <p className="mt-2 text-sm leading-5 text-slate-600">Choose a page to edit its search and social appearance.</p>
          </div>
          <label className="block p-4 xl:hidden">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Page to edit</span>
            <select value={activeRoute} onChange={(event) => { setActiveRoute(event.target.value); setSaveMessage(''); setSaveState('idle') }} className="min-h-[46px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200">
              {pages.map((page) => <option key={page.route} value={page.route}>{page.name} — {page.route}</option>)}
            </select>
          </label>
          <nav className="hidden p-2 xl:block">
            {groups.map((group) => (
              <div key={group} className="mb-3 last:mb-0">
                <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{group}</p>
                {pages.filter((page) => page.group === group).map((page) => {
                  const seo = getSeo(pageSeo, page.route)
                  const selected = page.route === activeRoute
                  const ready = isConfigured(seo)
                  return (
                    <button
                      key={page.route}
                      type="button"
                      onClick={() => { setActiveRoute(page.route); setSaveMessage(''); setSaveState('idle') }}
                      className={`mb-1 flex min-h-[54px] w-full items-center gap-3 border-l-4 px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 ${selected ? 'border-amber-500 bg-amber-50' : 'border-transparent hover:bg-slate-50'}`}
                      aria-current={selected ? 'page' : undefined}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${ready ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {ready ? <Check size={15} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-900">{page.name}</strong>
                        <span className="block truncate text-xs text-slate-500">{page.route}</span>
                      </span>
                      <ChevronRight size={16} className={selected ? 'text-amber-700' : 'text-slate-300'} />
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">{activePage.name}</h2>
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">{activeRoute}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{progress}% of recommended page fields complete</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:w-40" aria-label={`${progress}% complete`}><div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>

            <div className="space-y-7 p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Ranking essentials</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">Search metadata</h3>
              </div>

              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800"><span>SEO title</span><Counter value={current.title} minimum={50} maximum={60} /></span>
                <input value={current.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Traditional Indian Pickles & Achar | Achari Tiwari" className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">Aim for 50–60 characters. Put the page topic before your brand name.</span>
              </label>

              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800"><span>Meta description</span><Counter value={current.description} minimum={140} maximum={160} /></span>
                <textarea rows={4} value={current.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe the page clearly and give searchers a compelling reason to visit." className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                <span className="mt-1.5 block text-xs leading-5 text-slate-500">Aim for 140–160 characters. Search engines may display a different excerpt when it better matches a search.</span>
              </label>

              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-800">Focus keywords</span>
                  <input value={current.keywords.join(', ')} onChange={(event) => updateField('keywords', event.target.value.split(',').map((keyword) => keyword.trim()).filter(Boolean))} placeholder="mango pickle, homemade achar" className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                  <span className="mt-1.5 block text-xs leading-5 text-slate-500">Separate phrases with commas. Use them naturally in the page content.</span>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-800">Search visibility</span>
                  <select value={current.robots} onChange={(event) => updateField('robots', event.target.value as RobotsValue)} className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200">
                    <option value="index,follow">Index page and follow links</option>
                    <option value="noindex,follow">Hide page, follow links</option>
                    <option value="index,nofollow">Index page, do not follow links</option>
                    <option value="noindex,nofollow">Hide page and do not follow links</option>
                  </select>
                  <span className="mt-1.5 block text-xs leading-5 text-slate-500">Use “Index page” for public pages you want to rank.</span>
                </label>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Advanced & social</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Canonical and share card</h3>
            </div>
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
              <label className="block lg:col-span-2">
                <span className="text-sm font-semibold text-slate-800">Canonical URL</span>
                <input type="url" value={current.canonical} onChange={(event) => updateField('canonical', event.target.value)} placeholder={`https://acharitiwari.vercel.app${activeRoute === '/' ? '' : activeRoute}`} className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                <span className="mt-1.5 block text-xs text-slate-500">Leave blank to use the page’s normal storefront URL.</span>
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800"><span>Open Graph title</span><Counter value={current.ogTitle || ''} minimum={40} maximum={60} /></span>
                <input value={current.ogTitle} onChange={(event) => updateField('ogTitle', event.target.value)} placeholder="A share-friendly headline" className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800"><span>Open Graph description</span><Counter value={current.ogDescription || ''} minimum={80} maximum={110} /></span>
                <input value={current.ogDescription} onChange={(event) => updateField('ogDescription', event.target.value)} placeholder="A concise summary for social feeds" className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
              </label>
              <label className="block lg:col-span-2">
                <span className="text-sm font-semibold text-slate-800">Social image URL</span>
                <input type="url" value={current.ogImage} onChange={(event) => updateField('ogImage', event.target.value)} placeholder="https://res.cloudinary.com/…/share-image.jpg" className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                <span className="mt-1.5 block text-xs text-slate-500">For best results use a 1200 × 630 px image.</span>
              </label>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2" aria-label="Live metadata previews">
            <article className="min-w-0 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Search size={18} className="text-amber-600" /> Google preview</div>
              <div className="mt-5 overflow-hidden border-t border-slate-100 pt-5 font-sans">
                <div className="flex items-center gap-2 text-sm text-slate-700"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-900 text-[10px] font-black text-white">AT</span><span className="min-w-0"><span className="block">Achari Tiwari</span><span className="block truncate text-xs text-slate-500">{previewUrl}</span></span></div>
                <p className="mt-3 line-clamp-2 text-xl leading-7 text-[#1a0dab]">{previewTitle}</p>
                <p className="mt-1 line-clamp-3 text-sm leading-6 text-[#4d5156]">{previewDescription}</p>
              </div>
            </article>

            <article className="min-w-0 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Share2 size={18} className="text-amber-600" /> Social share preview</div>
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {current.ogImage && !imageFailed ? (
                  <img src={current.ogImage} alt="Social preview" onError={() => setImageFailed(true)} className="aspect-[1.91/1] w-full object-cover" />
                ) : (
                  <div className="relative grid aspect-[1.91/1] place-items-center overflow-hidden bg-emerald-950 px-5 text-center text-white">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-amber-400/20" aria-hidden="true" />
                    <div><span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-amber-400 font-black text-emerald-950"><ImageIcon size={22} /></span><p className="mt-3 text-sm font-bold tracking-wide">ACHARI TIWARI</p><p className="mt-1 text-xs text-emerald-200">Taste of tradition</p></div>
                  </div>
                )}
                <div className="border-t border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">acharitiwari.vercel.app</p>
                  <p className="mt-1 line-clamp-2 font-bold text-slate-950">{current.ogTitle || previewTitle}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{current.ogDescription || previewDescription}</p>
                </div>
              </div>
            </article>
          </section>

          <footer className="flex flex-col gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div role="status" aria-live="polite" className={`flex min-h-6 items-center gap-2 text-sm ${saveState === 'error' ? 'text-red-700' : saveState === 'saved' ? 'text-emerald-700' : 'text-slate-600'}`}>
              {saveState === 'saved' && <CheckCircle2 size={17} />}
              {saveState === 'error' && <AlertCircle size={17} />}
              <span>{saveMessage || 'Changes stay in this workspace until you save.'}</span>
            </div>
            <div className="flex flex-col-reverse gap-2 min-[400px]:flex-row sm:shrink-0">
              <button type="button" onClick={resetCurrentPage} disabled={saveState === 'saving'} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"><RotateCcw size={17} /> Reset page</button>
              <button type="button" onClick={save} disabled={saveState === 'saving'} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70">{saveState === 'saving' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save size={17} />} {saveState === 'saving' ? 'Publishing…' : 'Save & publish'}</button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
