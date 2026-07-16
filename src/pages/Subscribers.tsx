import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
} from 'lucide-react'
import { apiRequest } from '../lib/api'

type SubscriberStatus = 'pending' | 'subscribed' | 'unsubscribed'
type StatusFilter = 'all' | SubscriberStatus

type Subscriber = {
  _id: string
  email: string
  name?: string
  source: string
  status: SubscriberStatus
  consentedAt: string
  confirmedAt?: string
  unsubscribedAt?: string
  createdAt: string
}

type SubscriberStats = {
  total: number
  pending: number
  subscribed: number
  unsubscribed: number
}

type SubscribersResponse = {
  subscribers: Subscriber[]
  stats: SubscriberStats
}

const emptyStats: SubscriberStats = { total: 0, pending: 0, subscribed: 0, unsubscribed: 0 }

const statusStyles: Record<SubscriberStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  subscribed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  unsubscribed: 'border-slate-200 bg-slate-100 text-slate-600',
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const formatSource = (source: string) => {
  if (!source) return 'Storefront'
  return source.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const LoadingSkeleton = () => (
  <div aria-label="Loading subscribers" className="space-y-5" role="status">
    <span className="sr-only">Loading subscribers…</span>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-4" key={index}>
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-5 h-8 w-14 rounded bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="h-20 animate-pulse border-b border-slate-200 bg-slate-50" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="grid animate-pulse grid-cols-[1.5fr_1fr_1fr_120px] gap-6 border-b border-slate-100 p-5 last:border-0" key={index}>
          <div className="space-y-2"><div className="h-4 w-40 max-w-full rounded bg-slate-200" /><div className="h-3 w-28 rounded bg-slate-100" /></div>
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-4 w-20 rounded bg-slate-100" />
          <div className="h-9 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  </div>
)

const StatusBadge = ({ status }: { status: SubscriberStatus }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[status]}`}>
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
)

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<SubscriberStats>(emptyStats)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingId, setPendingId] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timeout)
  }, [query])

  const loadSubscribers = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true)
    else setRefreshing(true)
    setLoadError('')
    try {
      const params = new URLSearchParams({ status })
      if (debouncedQuery) params.set('q', debouncedQuery)
      const data = await apiRequest(`/admin/subscribers?${params.toString()}`) as SubscribersResponse
      setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : [])
      setStats(data.stats || emptyStats)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load subscribers')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedQuery, status])

  useEffect(() => { void loadSubscribers() }, [loadSubscribers])

  const updateStatus = async (subscriber: Subscriber) => {
    const nextStatus: Exclude<SubscriberStatus, 'pending'> = subscriber.status === 'subscribed' ? 'unsubscribed' : 'subscribed'
    setPendingId(subscriber._id)
    setActionError('')
    try {
      await apiRequest(`/admin/subscribers/${subscriber._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      await loadSubscribers(false)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this subscriber')
    } finally {
      setPendingId('')
    }
  }

  const statCards = [
    { label: 'All contacts', value: stats.total, icon: Mail, tone: 'bg-slate-950 text-white', detail: 'Consented records' },
    { label: 'Subscribed', value: stats.subscribed, icon: UserCheck, tone: 'bg-[#17320d] text-white', detail: 'Active audience' },
    { label: 'Pending', value: stats.pending, icon: Inbox, tone: 'bg-amber-50 text-amber-900', detail: 'Awaiting confirmation' },
    { label: 'Unsubscribed', value: stats.unsubscribed, icon: UserMinus, tone: 'bg-white text-slate-900', detail: 'Opted out' },
  ]

  const trueEmpty = !loading && !loadError && subscribers.length === 0 && stats.total === 0 && status === 'all' && !debouncedQuery

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[#17320d]" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Audience desk</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Newsletter subscribers</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review consent, confirmation status and opt-outs for every customer who joined your pantry notes.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadSubscribers(false)}
            disabled={loading || refreshing}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={17} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {loading ? <LoadingSkeleton /> : loadError ? (
        <section className="rounded-xl border border-red-200 bg-white px-5 py-12 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600"><AlertCircle size={23} /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-950">Subscribers could not be loaded</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{loadError}</p>
          <button onClick={() => void loadSubscribers()} className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"><RefreshCw size={16} />Try again</button>
        </section>
      ) : (
        <>
          <section aria-label="Subscriber totals" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {statCards.map(({ label, value, icon: Icon, tone, detail }) => (
              <article className={`min-h-28 rounded-xl border border-slate-200 p-4 shadow-sm sm:p-5 ${tone}`} key={label}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                  <Icon className="shrink-0 opacity-75" size={18} />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{value.toLocaleString('en-IN')}</p>
                <p className="mt-1 hidden text-xs opacity-65 sm:block">{detail}</p>
              </article>
            ))}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-3 border-b border-slate-200 bg-[#fffaf2] p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-5">
              <label className="relative block">
                <span className="sr-only">Search subscribers</span>
                <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search email or name"
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label>
                <span className="sr-only">Filter by subscription status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100">
                  <option value="all">All statuses</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="pending">Pending confirmation</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </label>
            </div>

            {actionError && (
              <div role="alert" className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:px-5">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <span>{actionError}</span>
              </div>
            )}

            {trueEmpty ? (
              <div className="px-5 py-14 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-amber-50 text-amber-700"><Mail size={25} /></span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">Your audience starts here</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">When a customer subscribes from the storefront or a story, their consent record will appear here.</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-500"><Search size={24} /></span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">No matching subscribers</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try another email, name or subscription status.</p>
                <button onClick={() => { setQuery(''); setDebouncedQuery(''); setStatus('all') }} className="mt-5 min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr><th className="px-5 py-3.5">Subscriber</th><th className="px-5 py-3.5">Consent</th><th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subscribers.map((subscriber) => (
                        <tr className="transition hover:bg-amber-50/30" key={subscriber._id}>
                          <td className="px-5 py-4"><strong className="block break-all font-semibold text-slate-950">{subscriber.email}</strong><span className="mt-1 block text-xs text-slate-500">{subscriber.name || 'Name not provided'}</span></td>
                          <td className="px-5 py-4 text-slate-600"><span className="block">{formatDate(subscriber.consentedAt || subscriber.createdAt)}</span><span className="mt-1 block text-xs text-slate-400">Confirmed {formatDate(subscriber.confirmedAt)}</span></td>
                          <td className="px-5 py-4 font-medium text-slate-600">{formatSource(subscriber.source)}</td>
                          <td className="px-5 py-4"><StatusBadge status={subscriber.status} /></td>
                          <td className="px-5 py-4 text-right"><SubscriberAction subscriber={subscriber} pending={pendingId === subscriber._id} onUpdate={updateStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 lg:hidden">
                  {subscribers.map((subscriber) => (
                    <article className="p-4" key={subscriber._id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><strong className="block break-all text-sm font-semibold text-slate-950">{subscriber.email}</strong><span className="mt-1 block text-xs text-slate-500">{subscriber.name || 'Name not provided'}</span></div>
                        <StatusBadge status={subscriber.status} />
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-sm">
                        <div><dt className="text-xs font-medium text-slate-400">Consent given</dt><dd className="mt-1 font-medium text-slate-700">{formatDate(subscriber.consentedAt || subscriber.createdAt)}</dd></div>
                        <div><dt className="text-xs font-medium text-slate-400">Source</dt><dd className="mt-1 font-medium text-slate-700">{formatSource(subscriber.source)}</dd></div>
                      </dl>
                      <div className="mt-3"><SubscriberAction subscriber={subscriber} pending={pendingId === subscriber._id} onUpdate={updateStatus} fullWidth /></div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}

const SubscriberAction = ({
  subscriber,
  pending,
  onUpdate,
  fullWidth = false,
}: {
  subscriber: Subscriber
  pending: boolean
  onUpdate: (subscriber: Subscriber) => Promise<void>
  fullWidth?: boolean
}) => {
  const willReactivate = subscriber.status !== 'subscribed'
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void onUpdate(subscriber)}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${fullWidth ? 'w-full' : ''} ${willReactivate ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-50 focus:ring-emerald-500' : 'border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400'}`}
    >
      {pending ? <Loader2 className="animate-spin" size={16} /> : willReactivate ? <CheckCircle2 size={16} /> : <UserMinus size={16} />}
      {pending ? 'Updating…' : willReactivate ? 'Reactivate' : 'Unsubscribe'}
    </button>
  )
}
