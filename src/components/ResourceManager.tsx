import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

export type ResourceField = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'password' | 'media'
  options?: Array<string | { value: string; label: string; parentValue?: string }>
  dependsOn?: string
  mediaFolder?: string
  multiple?: boolean
  required?: boolean
  list?: boolean
  defaultValue?: string | number | boolean
  getValue?: (item: Record<string, any>) => any
  getFormValue?: (item: Record<string, any>) => any
}

export type ResourceConfig = {
  title: string
  singular: string
  description: string
  endpoint: string
  responseKey: string
  itemKey: string
  fields: ResourceField[]
  readOnlyCreate?: boolean
  preparePayload?: (form: Record<string, any>, existing: Record<string, any> | null) => Record<string, any>
}

type Props = ResourceConfig & { basePath: string }

export default function ResourceManager({ title, description, endpoint, responseKey, itemKey, fields, readOnlyCreate, basePath }: Props) {
  const navigate = useNavigate()
  const [items, setItems] = useState<Record<string, any>[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { const data = await apiRequest(endpoint); setItems(data[responseKey] || []) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load records') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [endpoint])
  const visible = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query])
  const remove = async (item: Record<string, any>) => {
    if (!window.confirm(`Delete ${item[itemKey] || 'this record'}? This cannot be undone.`)) return
    try { await apiRequest(`${endpoint.replace(/\?.*$/, '')}/${item._id}`, { method: 'DELETE' }); await load() }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete record') }
  }
  const listFields = fields.filter((field) => field.list !== false).slice(0, 5)

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Live data</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>
      {!readOnlyCreate && <button onClick={() => navigate(`${basePath}/new`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/> Add new</button>}
    </header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-3 border-b border-slate-200 p-4"><label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="w-full py-2.5 text-sm outline-none"/></label><button onClick={load} aria-label="Refresh" className="rounded-lg border border-slate-300 p-2.5"><RefreshCw size={17}/></button></div>
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading…</p> : visible.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No records found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{listFields.map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item._id} className="hover:bg-slate-50">{listFields.map((field) => { const value = field.getValue ? field.getValue(item) : item[field.key]; return <td key={field.key} className="max-w-[260px] truncate px-4 py-4 text-slate-700">{typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : String(value ?? '—')}</td>})}<td className="px-4 py-4"><div className="flex justify-end gap-2"><button onClick={() => navigate(`${basePath}/${item._id}`)} aria-label={readOnlyCreate ? 'View order' : 'Edit'} className="rounded-md border p-2 text-slate-600 hover:bg-slate-100">{readOnlyCreate ? <Eye size={15}/> : <Pencil size={15}/>}</button><button onClick={() => remove(item)} aria-label="Delete" className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}
    </section>
  </div>
}
