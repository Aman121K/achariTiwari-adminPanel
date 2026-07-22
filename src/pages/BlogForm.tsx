import { useState } from 'react'
import { CheckCircle2, FileEdit, Image, Loader2, RefreshCw, Send } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ResourceForm from '../components/ResourceForm'
import { blogConfig } from '../data/resourceConfigs'
import { apiRequest } from '../lib/api'

type Action = 'regenerate' | 'image' | 'published' | 'draft'

export default function BlogForm() {
  const { id } = useParams()
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const runAction = async (action: Action) => {
    if (!id) return
    if (action === 'regenerate' && !window.confirm('Regenerate this blog? Its title, excerpt, content, SEO fields, and tags will be replaced. The current cover image will remain unchanged.')) return
    if (action === 'image' && !window.confirm('Regenerate this blog image? The current cover image will be replaced.')) return
    setActiveAction(action); setFeedback(null)
    try {
      if (action === 'regenerate') await apiRequest(`/blog/${id}/regenerate`, { method: 'POST' })
      else if (action === 'image') await apiRequest(`/blog/${id}/regenerate-image`, { method: 'POST' })
      else await apiRequest(`/blog/${id}/status`, { method: 'POST', body: JSON.stringify({ status: action }) })
      setFeedback({ type: 'success', message: action === 'regenerate' ? 'Blog regenerated successfully. Reloading the updated content…' : action === 'image' ? 'Cover image regenerated successfully. Reloading the form…' : action === 'published' ? 'Blog published successfully. Reloading the form…' : 'Blog moved to draft. Reloading the form…' })
      window.setTimeout(() => window.location.reload(), 650)
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'The action could not be completed. Please try again.' })
      setActiveAction(null)
    }
  }

  const actionButton = (action: Action, label: string, icon: typeof RefreshCw, className: string) => {
    const Icon = icon; const busy = activeAction === action
    return <button type="button" onClick={() => void runAction(action)} disabled={activeAction !== null} className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>{busy ? <Loader2 size={17} className="animate-spin"/> : <Icon size={17}/>} {busy ? `${label}…` : label}</button>
  }

  return <div className="space-y-6">
    {id && <section aria-label="Blog automation actions" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-wider text-amber-600">AI actions</p><h2 className="mt-1 text-lg font-semibold text-slate-950">Manage this blog</h2><p className="mt-1 text-sm text-slate-500">Regenerate content or image, then choose its storefront status.</p></div>
        <div className="flex flex-wrap gap-2">
          {actionButton('regenerate', 'Regenerate Blog', RefreshCw, 'border border-slate-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50')}
          {actionButton('image', 'Regenerate Image', Image, 'border border-slate-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50')}
          {actionButton('published', 'Publish', Send, 'bg-slate-950 text-white hover:bg-slate-800')}
          {actionButton('draft', 'Draft', FileEdit, 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200')}
        </div>
      </div>
      {feedback && <p role={feedback.type === 'error' ? 'alert' : 'status'} aria-live="polite" className={`mt-4 flex items-start gap-2 border-t pt-3 text-sm ${feedback.type === 'error' ? 'border-red-100 text-red-700' : 'border-emerald-100 text-emerald-700'}`}>{feedback.type === 'success' && <CheckCircle2 size={17} className="mt-0.5 shrink-0"/>}{feedback.message}</p>}
    </section>}
    <ResourceForm config={blogConfig} basePath="/blogs"/>
  </div>
}
