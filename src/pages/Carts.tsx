import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Mail, Phone, RefreshCw, Search, ShoppingBasket, Thermometer, User } from 'lucide-react'
import { apiRequest } from '../lib/api'

type Contact = { name?: string; email?: string; phone?: string }
type CartItem = { productId?: string; name?: string; price?: number; quantity?: number; image?: string; sku?: string }
type Cart = {
  _id: string
  sessionId: string
  userId?: Contact
  customer?: Contact
  items?: CartItem[]
  subtotal?: number
  itemCount?: number
  checkoutStarted?: boolean
  lastActivityAt?: string
  createdAt?: string
  updatedAt?: string
}

type Filter = 'all' | 'checkout' | 'contact'
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const count = new Intl.NumberFormat('en-IN')

function contactFor(cart: Cart): Contact {
  return {
    name: cart.customer?.name || cart.userId?.name,
    email: cart.customer?.email || cart.userId?.email,
    phone: cart.customer?.phone || cart.userId?.phone,
  }
}

function ageOf(value?: string) {
  if (!value) return { label: 'Age unavailable', state: 'stale' as const, elapsed: Infinity }
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return { label: 'Age unavailable', state: 'stale' as const, elapsed: Infinity }
  const elapsed = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(elapsed / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const label = minutes < 1 ? 'Just now' : minutes < 60 ? `${minutes}m ago` : hours < 24 ? `${hours}h ago` : `${days}d ago`
  return { label, state: elapsed <= 60 * 60 * 1000 ? 'fresh' as const : elapsed <= 24 * 60 * 60 * 1000 ? 'cooling' as const : 'stale' as const, elapsed }
}

const freshness = {
  fresh: { label: 'Fresh', className: 'border-[#8fa389] bg-[#eff4eb] text-[#35513b]', bar: 'bg-[#758f70]' },
  cooling: { label: 'Cooling', className: 'border-[#dfbd70] bg-[#fff7df] text-[#75510d]', bar: 'bg-[#d59b22]' },
  stale: { label: 'Stale', className: 'border-[#cba9ad] bg-[#f8ecec] text-[#7a2638]', bar: 'bg-[#7a2638]' },
}

export default function Carts() {
  const [carts, setCarts] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest('/admin/carts')
      setCarts(Array.isArray(data.carts) ? data.carts : [])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load abandoned carts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const summary = useMemo(() => ({
    value: carts.reduce((sum, cart) => sum + Number(cart.subtotal || 0), 0),
    contact: carts.filter(cart => { const customer = contactFor(cart); return Boolean(customer.email || customer.phone) }).length,
    checkout: carts.filter(cart => cart.checkoutStarted).length,
  }), [carts])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return carts.filter(cart => {
      const customer = contactFor(cart)
      const matchesFilter = filter === 'all' || (filter === 'checkout' && cart.checkoutStarted) || (filter === 'contact' && (customer.email || customer.phone))
      const haystack = [customer.name, customer.email, customer.phone, ...((cart.items || []).flatMap(item => [item.name, item.sku]))].filter(Boolean).join(' ').toLowerCase()
      return matchesFilter && (!needle || haystack.includes(needle))
    }).sort((a, b) => new Date(b.lastActivityAt || b.updatedAt || 0).getTime() - new Date(a.lastActivityAt || a.updatedAt || 0).getTime())
  }, [carts, filter, query])

  return (
    <div className="space-y-6 text-[#2d2530]">
      <header className="relative overflow-hidden border border-[#d9cdbb] bg-[#fffaf0] px-5 py-7 sm:px-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#d59b22]" />
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a6714]">Customer intent ledger</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#351626] sm:text-4xl">Abandoned carts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Only open carts are kept here. When a cart becomes an order, it is removed from this ledger automatically.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 border border-[#7a2638] px-4 py-2.5 text-sm font-semibold text-[#7a2638] transition hover:bg-[#f8eee3] focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh ledger</button>
        </div>
      </header>

      {error && <section className="flex flex-col items-start justify-between gap-4 border border-rose-300 bg-[#fff8f2] p-5 sm:flex-row sm:items-center" role="alert"><div className="flex gap-3"><AlertCircle className="mt-0.5 shrink-0 text-[#7a2638]" size={20} /><div><h2 className="font-semibold text-[#501526]">The cart ledger could not be loaded</h2><p className="mt-1 text-sm text-slate-600">{error}</p></div></div><button onClick={() => void load()} className="border border-[#7a2638] bg-[#7a2638] px-4 py-2 text-sm font-bold text-white">Try again</button></section>}

      <section aria-label="Abandoned cart summary" className="grid border-l border-t border-[#d9cdbb] sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Open carts', count.format(carts.length), 'Unconverted shopping sessions'],
          ['Recoverable value', money.format(summary.value), 'Current cart subtotal'],
          ['Contact available', count.format(summary.contact), 'Email or phone captured'],
          ['Reached checkout', count.format(summary.checkout), 'Checkout was started'],
        ].map(([label, value, detail]) => <article key={label} className="border-b border-r border-[#d9cdbb] bg-[#fffdf8] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-[#351626]">{loading ? '—' : value}</p><p className="mt-2 text-xs text-slate-600">{detail}</p></article>)}
      </section>

      <section className="border border-[#d9cdbb] bg-[#fffdf8]" aria-labelledby="cart-ledger-title">
        <div className="border-b border-[#d9cdbb] p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a6714]">Kitchen freshness</p><h2 id="cart-ledger-title" className="mt-1 text-xl font-semibold text-[#351626]">Open cart ledger</h2></div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block"><span className="sr-only">Search carts</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customer or product" className="h-10 w-full border border-[#cfc2b1] bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#7a2638] focus:ring-1 focus:ring-[#7a2638] sm:w-64" /></label>
              <div className="grid grid-cols-1 border border-[#cfc2b1] sm:flex" role="group" aria-label="Filter carts">{([['all', 'All'], ['checkout', 'Checkout started'], ['contact', 'Contact available']] as [Filter, string][]).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 border-b border-[#cfc2b1] px-3 text-xs font-bold last:border-b-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:border-b-0 sm:border-r sm:last:border-r-0 ${filter === value ? 'bg-[#6d2135] text-white' : 'bg-[#fffdf8] text-slate-700 hover:bg-[#f6efe3]'}`}>{label}</button>)}</div>
            </div>
          </div>
        </div>

        {loading ? <LoadingLedger /> : !error && visible.length === 0 ? <Empty hasCarts={carts.length > 0} /> : !error && <div className="divide-y divide-[#e2d7c8]">{visible.map(cart => <CartRow key={cart._id} cart={cart} />)}</div>}
      </section>
    </div>
  )
}

function CartRow({ cart }: { cart: Cart }) {
  const customer = contactFor(cart)
  const age = ageOf(cart.lastActivityAt || cart.updatedAt)
  const state = freshness[age.state]
  const items = cart.items || []
  return <article className="relative grid gap-5 p-5 transition hover:bg-[#fff9ed] lg:grid-cols-[minmax(180px,.85fr)_minmax(260px,1.5fr)_150px_145px] lg:items-center">
    <div className={`absolute inset-y-0 left-0 w-1 ${state.bar}`} />
    <div className="min-w-0"><div className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center border border-[#d9cdbb] bg-[#f6efe3] text-[#6d2135]"><User size={16} /></span><div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#351626]">{customer.name || 'Guest shopper'}</h3><p className="mt-0.5 truncate text-[11px] text-slate-500">Session {cart.sessionId?.slice(-8) || cart._id.slice(-8)}</p></div></div><div className="mt-3 space-y-1.5 text-xs">{customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-2 truncate text-[#6d2135] hover:underline"><Mail size={13} />{customer.email}</a>}{customer.phone && <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-[#6d2135] hover:underline"><Phone size={13} />{customer.phone}</a>}{!customer.email && !customer.phone && <span className="text-slate-500">No contact captured</span>}</div></div>
    <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Products · {cart.itemCount ?? items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</p><div className="space-y-2">{items.slice(0, 3).map((item, index) => <div key={`${item.productId || item.name}-${index}`} className="flex items-center gap-3"><ProductThumbnail item={item} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.name || 'Unnamed product'}</p><p className="mt-0.5 text-xs tabular-nums text-slate-500">{item.quantity || 0} × {money.format(Number(item.price || 0))}{item.sku ? ` · ${item.sku}` : ''}</p></div></div>)}{items.length > 3 && <p className="pl-13 text-xs font-semibold text-[#7a2638]">+{items.length - 3} more products</p>}</div></div>
    <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Cart value</p><p className="mt-2 text-xl font-semibold tabular-nums text-[#351626]">{money.format(Number(cart.subtotal || 0))}</p><p className={`mt-2 inline-block border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${cart.checkoutStarted ? 'border-[#d59b22] bg-[#fff4d7] text-[#75510d]' : 'border-slate-300 bg-slate-50 text-slate-600'}`}>{cart.checkoutStarted ? 'Checkout started' : 'Browsing cart'}</p></div>
    <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Last activity</p><div className={`mt-2 border p-3 ${state.className}`}><div className="flex items-center gap-2"><Thermometer size={16} /><strong className="text-xs uppercase tracking-[0.12em]">{state.label}</strong></div><p className="mt-2 text-lg font-semibold tabular-nums">{age.label}</p></div></div>
  </article>
}

function ProductThumbnail({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState(false)
  return <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border border-[#ddd1c1] bg-[#f4eadc] text-[#9a6714]">{item.image && !failed ? <img src={item.image} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} /> : <ShoppingBasket size={15} aria-hidden="true" />}</div>
}

function LoadingLedger() { return <div className="divide-y divide-[#e2d7c8]" aria-busy="true" aria-label="Loading abandoned carts">{[0, 1, 2, 3].map(item => <div key={item} className="grid animate-pulse gap-5 p-5 lg:grid-cols-[.85fr_1.5fr_150px_145px]"><div className="h-14 bg-[#eee4d6]" /><div className="h-14 bg-[#f2eadd]" /><div className="h-14 bg-[#eee4d6]" /><div className="h-14 bg-[#f2eadd]" /></div>)}</div> }
function Empty({ hasCarts }: { hasCarts: boolean }) { return <div className="px-6 py-16 text-center"><ShoppingBasket className="mx-auto text-[#b49158]" size={32} /><h3 className="mt-4 text-lg font-semibold text-[#351626]">{hasCarts ? 'No carts match this view' : 'The open-cart ledger is clear'}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{hasCarts ? 'Try a different search or filter to find the cart you need.' : 'When a shopper leaves items behind, their open cart will appear here for review.'}</p></div> }
