import { useEffect, useState } from 'react'
import { AlertCircle, Check, MessageSquare, RefreshCw, Trash2 } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { const data = await apiRequest('/admin/reviews'); setReviews(data.reviews || []) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load reviews') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const approve = async (review: any) => {
    setPendingId(review._id)
    try { await apiRequest(`/admin/reviews/${review.productId}/${review._id}`, { method: 'PUT', body: JSON.stringify({ isApproved: !review.isApproved }) }); await load() }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update review') }
    finally { setPendingId('') }
  }
  const remove = async (review: any) => {
    if (!confirm('Delete this review?')) return
    setPendingId(review._id)
    try { await apiRequest(`/admin/reviews/${review.productId}/${review._id}`, { method: 'DELETE' }); await load() }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete review') }
    finally { setPendingId('') }
  }

  return <div className="space-y-5">
    <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Moderation</p><h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Reviews & ratings</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Approve genuine customer feedback before it appears on the storefront.</p></div>
      <button onClick={load} disabled={loading} aria-label={loading ? 'Refreshing reviews' : 'Refresh reviews'} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:cursor-wait disabled:opacity-60"><RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>{loading ? 'Refreshing…' : 'Refresh'}</button>
    </header>
    <section aria-busy={loading} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {loading ? <div role="status" className="grid animate-pulse gap-0" aria-label="Loading reviews"><span className="sr-only">Loading reviews…</span>{Array.from({length:5}).map((_,index)=><div key={index} className="border-b border-slate-100 p-5 last:border-0"><div className="flex justify-between gap-5"><div className="w-full"><span className="block h-4 w-32 rounded bg-slate-200"/><span className="mt-3 block h-3 w-48 rounded bg-slate-100"/><span className="mt-5 block h-3 w-4/5 rounded bg-slate-200"/><span className="mt-2 block h-3 w-3/5 rounded bg-slate-100"/></div><span className="hidden h-10 w-28 shrink-0 rounded-lg bg-slate-100 sm:block"/></div></div>)}</div>
      : error ? <div role="alert" className="m-4 flex flex-col items-center border border-red-200 bg-red-50 px-5 py-10 text-center"><AlertCircle className="mb-3 text-red-600"/><strong>Reviews could not be loaded</strong><p className="mt-1 text-sm text-red-700">{error}</p><button onClick={load} className="mt-5 min-h-[44px] rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700">Try again</button></div>
      : reviews.length === 0 ? <div className="px-5 py-14 text-center"><MessageSquare className="mx-auto mb-3 text-amber-500"/><strong>No reviews awaiting management</strong><p className="mt-1 text-sm text-slate-500">Customer feedback will appear here when submitted.</p></div>
      : <div className="divide-y divide-slate-100">{reviews.map(review => <article key={review._id} className="grid gap-5 p-4 transition hover:bg-amber-50/30 sm:p-5 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-slate-950">{review.name}</strong><span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{review.rating} / 5</span><span className={`rounded-md px-2 py-1 text-xs font-semibold ${review.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{review.isApproved ? 'Published' : 'Pending'}</span></div><p className="mt-2 text-sm font-medium text-slate-500">{review.productTitle}</p><p className="mt-3 break-words leading-6 text-slate-700">{review.comment}</p></div><div className="flex items-end gap-2 border-t border-slate-100 pt-3 md:border-0 md:pt-0"><button disabled={pendingId===review._id} onClick={()=>approve(review)} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold disabled:opacity-50 md:flex-none"><Check size={16}/>{review.isApproved?'Unpublish':'Approve'}</button><button disabled={pendingId===review._id} onClick={()=>remove(review)} aria-label="Delete review" className="grid min-h-[44px] min-w-[48px] place-items-center rounded-lg border border-red-200 text-red-600 disabled:opacity-50"><Trash2 size={16}/></button></div></article>)}</div>}
    </section>
  </div>
}
