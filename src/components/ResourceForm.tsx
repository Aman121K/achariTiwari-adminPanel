import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import type { ResourceConfig } from './ResourceManager'
import MediaUploadField from './MediaUploadField'

const emptyFor = (fields: ResourceConfig['fields']) => Object.fromEntries(fields.map(field => [field.key, field.defaultValue ?? (field.type === 'checkbox' ? false : '')]))

export default function ResourceForm({ config, basePath }: { config: ResourceConfig; basePath: string }) {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id)
  const [existing, setExisting] = useState<Record<string, any> | null>(null)
  const [form, setForm] = useState<Record<string, any>>(() => emptyFor(config.fields))
  const [loading, setLoading] = useState(editing); const [saving, setSaving] = useState(false); const [error, setError] = useState('')
  useEffect(() => { if (!id) return; setLoading(true); apiRequest(config.endpoint).then(data => {
    const item = (data[config.responseKey] || []).find((candidate: any) => candidate._id === id)
    if (!item) throw new Error(`${config.singular} not found`)
    setExisting(item); setForm(Object.fromEntries(config.fields.map(field => [field.key, field.getFormValue ? field.getFormValue(item) : field.getValue ? field.getValue(item) : item[field.key] ?? field.defaultValue ?? ''])))
  }).catch(error => setError(error instanceof Error ? error.message : 'Unable to load record')).finally(() => setLoading(false)) }, [id, config])
  const submit = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setError(''); try {
    const payload = config.preparePayload ? config.preparePayload(form, existing) : { ...form }
    delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt
    await apiRequest(id ? `${config.endpoint.replace(/\?.*$/, '')}/${id}` : config.endpoint.replace(/\?.*$/, ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) })
    navigate(basePath)
  } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save record') } finally { setSaving(false) } }
  if (loading) return <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">Loading {config.singular.toLowerCase()}…</div>
  return <form onSubmit={submit} className="space-y-6">
    <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"><div><button type="button" onClick={() => navigate(basePath)} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"><ArrowLeft size={16}/> Back to {config.title.toLowerCase()}</button><p className="text-xs font-bold uppercase tracking-wider text-amber-600">{editing ? 'Edit record' : 'New record'}</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">{editing ? `Edit ${config.singular}` : `Create ${config.singular}`}</h1><p className="mt-2 text-sm text-slate-500">Complete the details below, then save your changes.</p></div><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={17}/>{saving ? 'Saving…' : `Save ${config.singular.toLowerCase()}`}</button></header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">{config.fields.map(field => <label key={field.key} className={`grid content-start gap-2 text-sm font-medium text-slate-700 ${field.type === 'textarea'||field.type==='media' ? 'sm:col-span-2' : ''}`}>{field.label}{field.type === 'media' ? <MediaUploadField value={form[field.key]} folder={field.mediaFolder} multiple={field.multiple} onChange={value=>setForm({...form,[field.key]:value})}/> : field.type === 'select' ? <select required={field.required} value={form[field.key]} onChange={e => setForm({...form,[field.key]:e.target.value,...Object.fromEntries(config.fields.filter(candidate=>candidate.dependsOn===field.key).map(candidate=>[candidate.key,'']))})} className="rounded-lg border px-3 py-2.5">{field.options?.filter(option=>typeof option==='string'||!field.dependsOn||!option.parentValue||option.parentValue===form[field.dependsOn]).map(option => <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>{typeof option === 'string' ? option : option.label}</option>)}</select> : field.type === 'textarea' ? <textarea required={field.required} value={form[field.key]} onChange={e => setForm({...form,[field.key]:e.target.value})} rows={7} className="rounded-lg border px-3 py-2.5"/> : field.type === 'checkbox' ? <span className="flex items-center gap-3 rounded-lg border px-3 py-3"><input type="checkbox" checked={Boolean(form[field.key])} onChange={e => setForm({...form,[field.key]:e.target.checked})} className="h-5 w-5"/><span className="font-normal">Enabled</span></span> : <input required={field.required && (!editing || field.type !== 'password')} type={field.type || 'text'} value={form[field.key]} onChange={e => setForm({...form,[field.key]:field.type === 'number' ? Number(e.target.value) : e.target.value})} className="rounded-lg border px-3 py-2.5"/>}</label>)}</section>
    <div className="flex justify-end gap-3"><button type="button" onClick={() => navigate(basePath)} className="rounded-lg border bg-white px-5 py-3 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white">{saving ? 'Saving…' : 'Save changes'}</button></div>
  </form>
}
