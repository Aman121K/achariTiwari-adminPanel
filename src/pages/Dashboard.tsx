import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, Boxes, ClipboardList, IndianRupee, PackagePlus, RefreshCw, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'

type Order = { _id: string; orderNumber?: string; total?: number; status?: string; paymentStatus?: string; customer?: { name?: string }; createdAt?: string }
type Variant = { label?: string; sku?: string; inventory?: number; lowStockThreshold?: number; isActive?: boolean }
type Product = { _id: string; title?: string; status?: string; variants?: Variant[] }
type Review = { _id: string; isApproved?: boolean }

type DashboardData = {
  dashboard?: { products?: number; orders?: number; users?: number }
  sales?: { orders?: number; revenue?: number }
  orders?: Order[]
  products?: Product[]
  reviews?: Review[]
}

const endpoints = [
  ['/admin/analytics/dashboard', 'dashboard', 'analytics'],
  ['/admin/analytics/sales', 'sales', 'analytics'],
  ['/admin/orders', 'orders', 'orders'],
  ['/admin/products', 'products', 'products'],
  ['/admin/reviews', 'reviews', 'reviews'],
] as const

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('en-IN')

const greeting = () => {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

const statusStyle: Record<string, string> = {
  pending: 'border-amber-300 bg-amber-50 text-amber-900',
  confirmed: 'border-violet-300 bg-violet-50 text-violet-900',
  processing: 'border-violet-300 bg-violet-50 text-violet-900',
  shipped: 'border-blue-300 bg-blue-50 text-blue-900',
  delivered: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  cancelled: 'border-rose-300 bg-rose-50 text-rose-900',
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled(endpoints.map(([path]) => apiRequest(path)))
    const next: DashboardData = {}
    const errors: string[] = []
    results.forEach((result, index) => {
      const [, key, responseKey] = endpoints[index]
      if (result.status === 'fulfilled') (next as Record<string, unknown>)[key] = result.value?.[responseKey]
      else errors.push(key)
    })
    setData(next)
    setFailed(errors)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const orders = data.orders || []
  const products = data.products || []
  const reviews = data.reviews || []
  const pipeline = ['pending', 'confirmed', 'shipped', 'delivered'].map(status => ({
    status,
    count: orders.filter(order => order.status === status || (status === 'confirmed' && order.status === 'processing')).length,
  }))
  const activePipelineTotal = pipeline.reduce((sum, item) => sum + item.count, 0)
  const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status || '')).length
  const pendingReviews = reviews.filter(review => !review.isApproved).length
  const lowStock = useMemo(() => products.flatMap(product => (product.variants || [])
    .filter(variant => variant.isActive !== false && Number(variant.inventory || 0) <= Number(variant.lowStockThreshold ?? 5))
    .map(variant => ({ ...variant, productId: product._id, productTitle: product.title || 'Untitled product' })))
    .sort((a, b) => Number(a.inventory || 0) - Number(b.inventory || 0)), [products])
  const activeProducts = products.filter(product => product.status === 'active').length
  const recentOrders = orders.slice(0, 6)

  if (loading) return <DashboardSkeleton />

  if (failed.length === endpoints.length) return (
    <section className="border border-rose-200 bg-[#fffaf0] p-8 text-center" role="alert">
      <AlertCircle className="mx-auto text-[#7a2638]" size={30} />
      <h1 className="mt-4 text-2xl font-semibold text-[#351626]">The store pulse could not be loaded</h1>
      <p className="mt-2 text-sm text-slate-600">Check your connection or session, then try once more.</p>
      <button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 border border-[#7a2638] bg-[#7a2638] px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"><RefreshCw size={16} /> Try again</button>
    </section>
  )

  const kpis = [
    { label: 'Revenue', value: data.sales ? money.format(Number(data.sales.revenue || 0)) : 'Unavailable', detail: `${number.format(data.sales?.orders || 0)} recorded orders`, icon: IndianRupee },
    { label: 'Orders', value: data.dashboard ? number.format(data.dashboard.orders || 0) : number.format(orders.length), detail: `${number.format(pendingOrders)} need fulfillment`, icon: ClipboardList },
    { label: 'Catalog', value: data.dashboard ? number.format(data.dashboard.products || 0) : number.format(products.length), detail: `${number.format(activeProducts)} active · ${number.format(lowStock.length)} low stock`, icon: Boxes },
    { label: 'Customers', value: data.dashboard ? number.format(data.dashboard.users || 0) : 'Unavailable', detail: 'Registered customer accounts', icon: Users },
  ]

  return (
    <div className="space-y-6 text-[#2d2530]">
      <header className="relative overflow-hidden border border-[#d9cdbb] bg-[#fffaf0] px-5 py-7 sm:px-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#d59b22]" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a6714]">{greeting()} · Store pulse</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#351626] sm:text-4xl">The kitchen ledger</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A live view of orders moving out, jars running low, and customer feedback waiting at the counter.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/orders" className="inline-flex items-center gap-2 border border-[#7a2638] px-4 py-2.5 text-sm font-semibold text-[#7a2638] transition hover:bg-[#f8eee3] focus:outline-none focus:ring-2 focus:ring-amber-500"><ClipboardList size={17} /> Review orders</Link>
            <Link to="/products/new" className="inline-flex items-center gap-2 bg-[#6d2135] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#501526] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"><PackagePlus size={17} /> Add product</Link>
          </div>
        </div>
      </header>

      {failed.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status"><span>Some live sections are unavailable: {failed.join(', ')}. Available data is still shown.</span><button onClick={() => void load()} className="inline-flex items-center gap-2 font-bold underline underline-offset-4"><RefreshCw size={14} /> Retry</button></div>}

      <section aria-label="Store performance" className="grid border-l border-t border-[#d9cdbb] sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, detail, icon: Icon }) => <article key={label} className="min-w-0 border-b border-r border-[#d9cdbb] bg-[#fffdf8] p-5">
          <div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p><Icon size={18} className="text-[#9a6714]" /></div>
          <p className="mt-5 truncate text-3xl font-semibold tabular-nums tracking-tight text-[#351626]">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-600">{detail}</p>
        </article>)}
      </section>

      <section className="border border-[#4f2435] bg-[#351626] p-5 text-[#fffaf0] sm:p-7" aria-labelledby="pipeline-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e7b951]">Fulfillment ledger</p><h2 id="pipeline-title" className="mt-2 text-2xl font-semibold">From kitchen shelf to doorstep</h2></div>
          <p className="text-sm tabular-nums text-[#decbd1]">{number.format(activePipelineTotal)} orders in recorded stages</p>
        </div>
        <div className="mt-7 grid divide-y divide-white/15 border-y border-white/15 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {pipeline.map((item, index) => <div key={item.status} className="relative px-1 py-5 sm:px-5">
            <div className="flex items-baseline justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#decbd1]">{index + 1}. {item.status === 'confirmed' ? 'Processing' : item.status}</span><strong className="text-2xl tabular-nums">{item.count}</strong></div>
            <div className="mt-4 h-1 bg-white/15"><div className="h-full bg-[#e7b951]" style={{ width: `${activePipelineTotal ? Math.max(4, item.count / activePipelineTotal * 100) : 0}%` }} /></div>
          </div>)}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.85fr)]">
        <section className="border border-[#d9cdbb] bg-[#fffdf8]" aria-labelledby="recent-title">
          <div className="flex items-center justify-between border-b border-[#d9cdbb] px-5 py-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a6714]">Dispatch book</p><h2 id="recent-title" className="mt-1 text-xl font-semibold text-[#351626]">Recent orders</h2></div><Link to="/orders" className="inline-flex items-center gap-1 text-sm font-bold text-[#6d2135] hover:underline">All orders <ArrowRight size={15} /></Link></div>
          {recentOrders.length === 0 ? <Empty message="No orders have reached the kitchen yet." /> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#f6efe3] text-[10px] uppercase tracking-[0.16em] text-slate-600"><tr><th className="px-5 py-3 font-bold">Order</th><th className="px-4 py-3 font-bold">Customer</th><th className="px-4 py-3 font-bold">Placed</th><th className="px-4 py-3 font-bold">Status</th><th className="px-5 py-3 text-right font-bold">Total</th></tr></thead><tbody className="divide-y divide-[#e7ddcf]">{recentOrders.map(order => <tr key={order._id} className="transition hover:bg-[#fff8eb]"><td className="px-5 py-4"><Link to={`/orders/${order._id}`} className="font-bold text-[#6d2135] hover:underline">{order.orderNumber || `#${order._id.slice(-6)}`}</Link></td><td className="px-4 py-4 font-medium text-slate-700">{order.customer?.name || 'Guest customer'}</td><td className="px-4 py-4 text-slate-600">{order.createdAt ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(order.createdAt)) : '—'}</td><td className="px-4 py-4"><span className={`inline-block border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyle[order.status || ''] || 'border-slate-300 bg-slate-50 text-slate-700'}`}>{order.status || 'unknown'}</span></td><td className="px-5 py-4 text-right font-bold tabular-nums">{money.format(Number(order.total || 0))}</td></tr>)}</tbody></table></div>}
        </section>

        <aside className="space-y-6" aria-label="Actions and store health">
          <section className="border border-[#d9cdbb] bg-[#fffdf8]">
            <div className="border-b border-[#d9cdbb] px-5 py-4"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a6714]">Needs attention</p><h2 className="mt-1 text-xl font-semibold text-[#351626]">Action rail</h2></div>
            <Link to="/products" className="group flex items-start gap-4 border-b border-[#e7ddcf] p-5 transition hover:bg-[#fff8eb]"><span className="grid h-10 w-10 shrink-0 place-items-center border border-amber-300 bg-amber-50 text-amber-800"><Boxes size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#351626]">{lowStock.length} low-stock variant{lowStock.length === 1 ? '' : 's'}</strong><span className="mt-1 block truncate text-xs text-slate-600">{lowStock.length ? lowStock.slice(0, 2).map(item => `${item.productTitle} (${item.inventory || 0})`).join(' · ') : 'Inventory levels are above their thresholds.'}</span></span><ArrowRight size={16} className="mt-1 text-[#7a2638] transition group-hover:translate-x-1" /></Link>
            <Link to="/reviews" className="group flex items-start gap-4 p-5 transition hover:bg-[#fff8eb]"><span className="grid h-10 w-10 shrink-0 place-items-center border border-violet-300 bg-violet-50 text-violet-800"><Star size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#351626]">{pendingReviews} review{pendingReviews === 1 ? '' : 's'} awaiting moderation</strong><span className="mt-1 block text-xs text-slate-600">Keep published feedback timely and trustworthy.</span></span><ArrowRight size={16} className="mt-1 text-[#7a2638] transition group-hover:translate-x-1" /></Link>
          </section>
          <section className="border border-[#d9cdbb] bg-[#f6efe3] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a6714]">Store health</p><h2 className="mt-1 text-xl font-semibold text-[#351626]">Today’s checks</h2><dl className="mt-5 divide-y divide-[#d9cdbb] border-y border-[#d9cdbb] text-sm">{[
            ['Orders needing fulfillment', pendingOrders],
            ['Active catalog products', activeProducts],
            ['Variants at low stock', lowStock.length],
            ['Reviews awaiting approval', pendingReviews],
          ].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-700">{label}</dt><dd className="font-bold tabular-nums text-[#351626]">{number.format(Number(value))}</dd></div>)}</dl></section>
        </aside>
      </div>
    </div>
  )
}

function Empty({ message }: { message: string }) { return <div className="px-6 py-12 text-center"><ClipboardList className="mx-auto text-[#b59c80]" size={28} /><p className="mt-3 text-sm text-slate-600">{message}</p></div> }

function DashboardSkeleton() { return <div className="space-y-6" aria-busy="true" aria-label="Loading store dashboard"><div className="h-40 animate-pulse border border-[#e1d7c8] bg-[#fffaf0]" /><div className="grid gap-px bg-[#ded4c5] sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(item => <div key={item} className="h-32 animate-pulse bg-[#fffdf8] p-5"><div className="h-3 w-20 bg-[#eadfce]" /><div className="mt-6 h-8 w-28 bg-[#eadfce]" /></div>)}</div><div className="h-56 animate-pulse bg-[#351626]" /><div className="h-72 animate-pulse border border-[#e1d7c8] bg-[#fffdf8]" /></div> }
