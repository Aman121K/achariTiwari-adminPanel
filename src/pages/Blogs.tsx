import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Bot, CalendarClock, CheckCircle2, Loader2, Save, Sparkles } from 'lucide-react'
import ResourceManager from '../components/ResourceManager'
import { blogConfig } from '../data/resourceConfigs'
import { apiRequest } from '../lib/api'

type AutomationSettings = {
  enabled: boolean
  publishMode: 'published' | 'draft'
  hourUtc: number
  lastRunAt?: string
  lastStatus?: 'running' | 'succeeded' | 'failed'
  lastError?: string
}

const initialSettings: AutomationSettings = { enabled: true, publishMode: 'published', hourUtc: 3 }

export default function Blogs() {
  const [settings, setSettings] = useState<AutomationSettings>(initialSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [listVersion, setListVersion] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/blog/automation/settings') as { settings?: AutomationSettings }
      if (data.settings) setSettings(data.settings)
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load automation settings.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadSettings() }, [loadSettings])

  const saveSchedule = async () => {
    setSaving(true); setFeedback(null)
    try {
      const data = await apiRequest('/blog/automation/settings', {
        method: 'PUT',
        body: JSON.stringify({ enabled: settings.enabled, publishMode: settings.publishMode, hourUtc: settings.hourUtc }),
      }) as { settings?: AutomationSettings }
      if (data.settings) setSettings(data.settings)
      setFeedback({ type: 'success', message: 'Blog automation schedule saved.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save the schedule. Check your connection and try again.' })
    } finally { setSaving(false) }
  }

  const generateBlog = async () => {
    setGenerating(true); setFeedback(null)
    try {
      await apiRequest('/blog/automation/generate', { method: 'POST', body: JSON.stringify({ status: 'draft' }) })
      setFeedback({ type: 'success', message: 'A new blog draft was generated. It is ready to review in the list below.' })
      await loadSettings()
      setListVersion(version => version + 1)
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Blog generation failed. Review the automation configuration and try again.' })
    } finally { setGenerating(false) }
  }

  const lastRun = settings.lastRunAt ? new Date(settings.lastRunAt).toLocaleString() : 'Not run yet'

  return <div className="space-y-6">
    <section aria-labelledby="automation-title" className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700"><Bot size={20}/></span>
          <div><p className="text-xs font-bold uppercase tracking-wider text-amber-600">AI automation</p><h2 id="automation-title" className="mt-1 text-lg font-semibold text-slate-950">Blog generator</h2><p className="mt-1 text-sm text-slate-500">Generate a draft now or configure the daily publishing schedule.</p></div>
        </div>
        <button type="button" onClick={generateBlog} disabled={loading || generating || saving} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {generating ? <Loader2 size={17} className="animate-spin"/> : <Sparkles size={17}/>} {generating ? 'Generating draft…' : 'Generate Blog'}
        </button>
      </div>

      {loading ? <div role="status" className="flex min-h-[150px] items-center justify-center gap-2 p-5 text-sm text-slate-500"><Loader2 size={18} className="animate-spin"/> Loading automation settings…</div> : <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex min-h-[44px] items-center gap-3 rounded-lg border border-slate-300 bg-[#fffdf9] px-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={settings.enabled} onChange={event => setSettings(current => ({ ...current, enabled: event.target.checked }))} className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"/>
            Schedule enabled
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Publish mode
            <select value={settings.publishMode} onChange={event => setSettings(current => ({ ...current, publishMode: event.target.value as AutomationSettings['publishMode'] }))} className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100">
              <option value="published">Publish automatically</option><option value="draft">Save draft</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">UTC hour (0–23)
            <input type="number" min={0} max={23} value={settings.hourUtc} onChange={event => setSettings(current => ({ ...current, hourUtc: Math.max(0, Math.min(23, Number(event.target.value))) }))} className="min-h-[44px] rounded-lg border border-slate-300 px-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"/>
          </label>
        </div>
        <button type="button" onClick={saveSchedule} disabled={saving || generating} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 size={17} className="animate-spin"/> : <Save size={17}/>} {saving ? 'Saving…' : 'Save schedule'}
        </button>
      </div>}

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-[#fffdf9] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-600"><CalendarClock size={16} className="text-amber-600"/><span><strong className="font-semibold text-slate-800">Last run:</strong> {lastRun}</span></div>
        {settings.lastStatus && <span className={`inline-flex items-center gap-1.5 font-medium ${settings.lastStatus === 'failed' ? 'text-red-700' : settings.lastStatus === 'running' ? 'text-amber-700' : 'text-emerald-700'}`}>{settings.lastStatus === 'failed' ? <AlertCircle size={16}/> : settings.lastStatus === 'running' ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>} {settings.lastStatus === 'running' ? 'Running' : settings.lastStatus === 'failed' ? 'Failed' : 'Succeeded'}</span>}
      </div>
      {settings.lastError && <p role="alert" className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"><strong>Last error:</strong> {settings.lastError}</p>}
      {feedback && <p role="status" aria-live="polite" className={`border-t px-5 py-3 text-sm ${feedback.type === 'error' ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>{feedback.message}</p>}
    </section>
    <ResourceManager key={listVersion} {...blogConfig} basePath="/blogs"/>
  </div>
}
